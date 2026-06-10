#!/usr/bin/env python3
"""
patch_cics.py <input.cbl> <output.cbl>

Transforms CICS-specific constructs in a COBOL source file so it can be
compiled with GnuCOBOL without an IBM CICS runtime.

Transformations applied (in order):
  1. Remove PROCESS SQL compiler directive
  2. Replace EXEC CICS RETURN        -> GOBACK
  3. Replace EXEC CICS SYNCPOINT     -> EXEC SQL ROLLBACK END-EXEC
  4. Replace EXEC CICS ABEND         -> DISPLAY + GOBACK
  5. Replace EXEC CICS GET COUNTER   -> EXEC SQL SELECT nextval INTO :var
  6. Replace EXEC CICS ASKTIME       -> stub paragraph call
  7. Replace EXEC CICS FORMATTIME    -> stub paragraph call
  8. Replace EXEC CICS LINK          -> CALL equivalent
  9. Replace DFHRESP(NORMAL)         -> 0
 10. Inject stub paragraphs before final EXIT of WRITE-ERROR-MESSAGE
"""

import re
import sys


def transform_linkage_for_esql(text):
    """
    ocesql only resolves SQL host variables from WORKING-STORAGE.
    Fields declared in LINKAGE SECTION are invisible to it.

    Strategy:
      1. Add a WS mirror (WS-COMMAREA) with the same structure.
      2. Replace LINKAGE DFHCOMMAREA with a flat PIC X(32500) buffer.
      3. Insert MOVE DFHCOMMAREA -> WS-COMMAREA before first executable stmt.
      4. Insert MOVE WS-COMMAREA -> DFHCOMMAREA before every GOBACK.
    """
    # --- detect what LINKAGE contains ---
    linkage_m = re.search(
        r'([ \t]*LINKAGE\s+SECTION\..+?\n)(?=[ \t]*PROCEDURE\s+DIVISION)',
        text, re.IGNORECASE | re.DOTALL)
    if not linkage_m:
        return text
    linkage_block = linkage_m.group(1)

    uses_lgcmarea = bool(re.search(r'COPY\s+LGCMAREA', linkage_block, re.IGNORECASE))
    uses_d2       = bool(re.search(r'D2-', linkage_block, re.IGNORECASE))

    if not (uses_lgcmarea or uses_d2):
        return text

    # --- build WS mirror ---
    if uses_lgcmarea:
        # ocesql doesn't expand COPY directives, so inline lgcmarea.cpy so
        # all CA-* host variables are visible to ocesql in the DECLARE SECTION.
        import os
        cpy_paths = [
            os.path.join(os.path.dirname(__file__), '..', 'copybook', 'lgcmarea.cpy'),
            os.path.join(os.path.dirname(sys.argv[1]), 'lgcmarea.cpy'),
        ]
        lgcmarea_text = ''
        for p in cpy_paths:
            if os.path.exists(p):
                with open(p) as _f:
                    lgcmarea_text = _f.read()
                break
        ws_mirror = '       01  WS-COMMAREA.\n' + lgcmarea_text + '\n'
    else:
        # Extract field definitions from under 01 DFHCOMMAREA in LINKAGE
        fields_m = re.search(
            r'01\s+DFHCOMMAREA\s*\.(.*)',
            linkage_block, re.IGNORECASE | re.DOTALL)
        inner = fields_m.group(1).rstrip() if fields_m else ''
        ws_mirror = '       01  WS-COMMAREA.\n' + inner + '\n'

    # --- add WS mirror right after COPY DFHEIBLK (use lambda to avoid
    #     regex replacement-string escape interpretation) ---
    text = re.sub(
        r'(COPY\s+DFHEIBLK\.)',
        lambda m: m.group(1) + '\n' + ws_mirror,
        text, count=1, flags=re.IGNORECASE)

    # --- replace LINKAGE DFHCOMMAREA with a flat raw buffer ---
    flat_linkage = ('       LINKAGE SECTION.\n'
                    '       01  DFHCOMMAREA              PIC X(32500).\n\n')
    text = text.replace(linkage_block, flat_linkage)

    # --- sync: copy commarea IN as the very first executable statement.
    #     Use MULTILINE + ^ so we don't consume the preceding newline. ---
    text = re.sub(
        r'^(\s+)(INITIALIZE\s+WS-HEADER\.)',
        lambda m: (m.group(1) + 'MOVE DFHCOMMAREA TO WS-COMMAREA.\n' +
                   m.group(1) + m.group(2)),
        text, count=1, flags=re.IGNORECASE | re.MULTILINE)

    # NOTE: GOBACK sync (MOVE WS-COMMAREA TO DFHCOMMAREA) is injected
    # as a final pass in main() AFTER all EXEC CICS -> GOBACK replacements.

    return text


def apply_sql_patches(text):
    """Apply global SQL-level patches before CICS processing.

    These are text substitutions that fix DB2-specific SQL syntax
    so that ocesql + PostgreSQL can handle them.
    """
    # 1. EXEC SQL INCLUDE LGCMAREA in LINKAGE SECTION -> COPY LGCMAREA.
    #    (Let GnuCOBOL expand it so host vars are visible to ocesql)
    text = re.sub(
        r'EXEC\s+SQL\s+INCLUDE\s+LGCMAREA\s+END-EXEC\s*\.',
        'COPY LGCMAREA.',
        text, flags=re.IGNORECASE)
    text = re.sub(
        r'EXEC\s+SQL\s+INCLUDE\s+LGCMAREA\s+END-EXEC',
        'COPY LGCMAREA.',
        text, flags=re.IGNORECASE)

    # 2. SET :var = IDENTITY_VAL_LOCAL()  ->  SELECT lastval() INTO :var
    text = re.sub(
        r'SET\s+(:\S+)\s*=\s*IDENTITY_VAL_LOCAL\s*\(\s*\)',
        r'SELECT lastval() INTO \1',
        text, flags=re.IGNORECASE)

    # 3. CURRENT TIMESTAMP (DB2 special register, two words)
    #    ->  CURRENT_TIMESTAMP  (ANSI / PostgreSQL)
    #    Only inside EXEC SQL blocks - safe to do globally as the
    #    two-word form is not valid outside SQL anyway.
    text = re.sub(r'\bCURRENT\s+TIMESTAMP\b', 'CURRENT_TIMESTAMP',
                  text, flags=re.IGNORECASE)

    # 4. INSENSITIVE SCROLL CURSOR  ->  CURSOR  (ocesql has no SCROLL support)
    text = re.sub(r'\bINSENSITIVE\s+SCROLL\s+CURSOR\b', 'CURSOR',
                  text, flags=re.IGNORECASE)
    # Also strip bare SCROLL CURSOR -> CURSOR (in case it appears without INSENSITIVE)
    text = re.sub(r'\bSCROLL\s+CURSOR\b', 'CURSOR',
                  text, flags=re.IGNORECASE)

    # 5. CURSOR WITH HOLD FOR  ->  CURSOR FOR
    #    (WITH HOLD + FOR UPDATE is unsupported in PostgreSQL)
    text = re.sub(r'\bCURSOR\s+WITH\s+HOLD\s+FOR\b', 'CURSOR FOR',
                  text, flags=re.IGNORECASE)

    return text


def join_exec_blocks(lines):
    """Join multi-line EXEC CICS blocks into single logical lines,
    preserving original line count by inserting blank placeholders."""
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]
        upper = line.upper().strip()
        if re.search(r'EXEC\s+CICS', upper):
            # collect until END-EXEC
            block_lines = [line.rstrip()]
            # only scan forward if END-EXEC is not already on this line
            j = i + 1
            if 'END-EXEC' not in upper:
                while j < len(lines):
                    block_lines.append(lines[j].rstrip())
                    if 'END-EXEC' in lines[j].upper():
                        j += 1
                        break
                    j += 1
            # join into one logical line (use first line's indent)
            joined = ' '.join(l.strip() for l in block_lines)
            # normalize internal whitespace
            joined = re.sub(r'\s+', ' ', joined)
            # preserve the indent of the first line
            indent = re.match(r'^(\s*)', line).group(1)
            result.append((indent + joined, len(block_lines)))
            i = j
        else:
            result.append((line.rstrip(), 1))
            i += 1
    return result


def patch_line(logical_line):
    """Apply substitutions to a single logical (possibly joined) line.
    Returns the replacement text (may be multi-line string)."""
    s = logical_line
    upper = s.upper().strip()

    indent = re.match(r'^(\s*)', s).group(1)
    if not indent:
        indent = '           '

    # 1. PROCESS SQL at top of file
    if re.match(r'^\s*PROCESS\s+SQL\s*$', s, re.IGNORECASE):
      return f'{indent}*> PROCESS SQL removed for GnuCOBOL'

    # 9. DFHRESP(NORMAL)
    s = re.sub(r'DFHRESP\s*\(\s*NORMAL\s*\)', '0', s, flags=re.IGNORECASE)

    # 2. EXEC CICS RETURN
    # Preserve a trailing period so GnuCOBOL 3.1.x doesn't reject the
    # paragraph label that follows as "syntax error, unexpected Identifier".
    if re.search(r'EXEC\s+CICS\s+RETURN\b', s, re.IGNORECASE):
        period = '.' if s.rstrip().endswith('.') else ''
        return f'{indent}GOBACK{period}'

    # 3. EXEC CICS SYNCPOINT ROLLBACK
    if re.search(r'EXEC\s+CICS\s+SYNCPOINT\s+ROLLBACK', s, re.IGNORECASE):
        return f'{indent}EXEC SQL ROLLBACK END-EXEC'

    # 4. EXEC CICS ABEND
    m = re.search(r'EXEC\s+CICS\s+ABEND\s+ABCODE\s*\(\s*[\'"](\w+)[\'"]\s*\)', s, re.IGNORECASE)
    if m:
        code = m.group(1)
        return (f'{indent}DISPLAY \'ABEND {code}\' UPON CONSOLE\n'
                f'{indent}GOBACK')

    # 5. EXEC CICS GET COUNTER
    m = re.search(
        r'EXEC\s+CICS\s+GET\s+COUNTER\s*\(\s*(\S+)\s*\)'
        r'\s+POOL\s*\(\s*(\S+)\s*\)'
        r'\s+VALUE\s*\(\s*(\S+)\s*\)'
        r'\s+RESP\s*\(\s*(\S+)\s*\)',
        s, re.IGNORECASE)
    if m:
        var   = m.group(3)
        resp  = m.group(4)
        return (f'{indent}EXEC SQL SELECT nextval(\'genacustnum_seq\')\n'
                f'{indent}    INTO :{var} END-EXEC\n'
                f'{indent}MOVE 0 TO {resp}')

    # 6. EXEC CICS ASKTIME
    m = re.search(r'EXEC\s+CICS\s+ASKTIME\s+ABSTIME\s*\(\s*(\S+)\s*\)', s, re.IGNORECASE)
    if m:
        return f'{indent}PERFORM STUB-ASKTIME'

    # 7. EXEC CICS FORMATTIME
    if re.search(r'EXEC\s+CICS\s+FORMATTIME', s, re.IGNORECASE):
        # extract the date and time target fields
        dm = re.search(r'MMDDYYYY\s*\(\s*(\S+)\s*\)', s, re.IGNORECASE)
        tm = re.search(r'TIME\s*\(\s*(\S+)\s*\)', s, re.IGNORECASE)
        date_var = dm.group(1) if dm else 'WS-DATE'
        time_var = tm.group(1) if tm else 'WS-TIME'
        return (f'{indent}MOVE FUNCTION CURRENT-DATE(1:8) TO {date_var}\n'
                f'{indent}MOVE FUNCTION CURRENT-DATE(9:6) TO {time_var}')

    # 8. EXEC CICS LINK
    if re.search(r'EXEC\s+CICS\s+LINK', s, re.IGNORECASE):
        pm = re.search(r'PROGRAM\s*\(\s*[\'"]?(\w+)[\'"]?\s*\)', s, re.IGNORECASE)
        cm = re.search(r'COMMAREA\s*\(\s*(\S+)\s*\)', s, re.IGNORECASE)
        prog    = pm.group(1).upper() if pm else 'UNKNOWN'
        commarea = cm.group(1) if cm else 'DFHCOMMAREA'
        period = '.' if s.rstrip().endswith('.') else ''

        # LGACDB02 is a real program we compile — call it directly
        if prog == 'LGACDB02':
            return (f'{indent}CALL \'LGACDB02\' USING BY REFERENCE\n'
                    f'{indent}    {commarea} EIBCALEN{period}')

        # LGSTSQ -> stub
        if prog == 'LGSTSQ':
            return f'{indent}CALL \'LGSTSQ-STUB\' USING {commarea}{period}'

        # View programs and anything else -> stub
        stub = f'{prog}-STUB'
        return f'{indent}CALL \'{stub}\' USING {commarea}{period}'

    return s


STUB_PARAGRAPHS = """
      *================================================================*
      *  CICS stub paragraphs injected by patch_cics.py                *
      *================================================================*
       STUB-ASKTIME.
           CONTINUE.

"""

END_PROGRAM_PARA_STUB = """
      *================================================================*
      *  END-PROGRAM-PARA stub injected by patch_cics.py               *
      *================================================================*
       END-PROGRAM-PARA.
           GOBACK.

"""


def inject_stubs(text):
    """Insert stub paragraphs just before the final EXIT. near end of file."""
    lines = text.split('\n')
    # find last occurrence of '       EXIT.' which closes WRITE-ERROR-MESSAGE
    insert_at = None
    for i in range(len(lines) - 1, -1, -1):
        if re.match(r'^\s+EXIT\.\s*$', lines[i]):
            insert_at = i
            break
    if insert_at is not None:
        extra = STUB_PARAGRAPHS
        # If END-PROGRAM-PARA is referenced but not defined as a paragraph
        # label, inject a GOBACK stub so PERFORM/GO TO END-PROGRAM-PARA works.
        has_ref = bool(re.search(r'\bEND-PROGRAM-PARA\b', text))
        has_def = bool(re.search(r'^\s+END-PROGRAM-PARA\.\s*$', text, re.MULTILINE))
        if has_ref and not has_def:
            extra += END_PROGRAM_PARA_STUB
        stub_lines = extra.split('\n')
        lines = lines[:insert_at] + stub_lines + lines[insert_at:]
    return '\n'.join(lines)


def main():
    if len(sys.argv) != 3:
        print(f'Usage: {sys.argv[0]} input.cbl output.cbl')
        sys.exit(1)

    with open(sys.argv[1], 'r') as f:
        raw_text = f.read()

    # Move EXEC SQL DECLARE CURSOR blocks from DATA DIVISION to PROCEDURE
    # DIVISION. ocesql only accepts DECLARE CURSOR in PROCEDURE DIVISION;
    # it raises a syntax error for any DECLARE CURSOR found in DATA DIVISION.
    def _relocate_declare_cursors(text):
        cursor_re = re.compile(
            r'(?m)^([ \t]*EXEC\s+SQL\s+DECLARE\s+\w+\b.*?END-EXEC\.?[ \t]*\n)',
            re.IGNORECASE | re.DOTALL)
        cursors = cursor_re.findall(text)
        if not cursors:
            return text
        # Remove cursor blocks from DATA DIVISION
        text = cursor_re.sub('', text)
        # Insert them right after PROCEDURE DIVISION line
        injection = ''.join(cursors)
        text = re.sub(
            r'(?m)^([ \t]+PROCEDURE\s+DIVISION[^.\n]*\.)[ \t]*$',
            lambda m: m.group(0) + '\n' + injection,
            text, count=1, flags=re.IGNORECASE)
        return text
    raw_text = _relocate_declare_cursors(raw_text)

    # GnuCOBOL with -std=ibm treats END-PROGRAM as a reserved scope terminator.
    # Rename every occurrence (paragraph label and PERFORM/GO TO references) to
    # END-PROGRAM-PARA so the generated CBL compiles cleanly.
    raw_text = re.sub(
        r'\bEND-PROGRAM\b(?!-PARA)',
        'END-PROGRAM-PARA',
        raw_text, flags=re.IGNORECASE)

    # Apply SQL-level patches on the whole text first
    raw_text = apply_sql_patches(raw_text)

    # ocesql does not support COMP / COMP-5 usage on integer host variables.
    # Strip the COMP/COMP-5 clause from all PIC S9(...) declarations so
    # ocesql sees plain display-format signed integers (which it CAN bind).
    # COBOL arithmetic on display-format S9(n) is semantically equivalent.
    raw_text = re.sub(
        r'(PIC\s+S9\([^)]+\))\s+COMP(?:-5)?\b',
        r'\1',
        raw_text, flags=re.IGNORECASE)

    # ocesql counts every OCESQLSetResultParams call (including indicator
    # variables) against the column count returned by the query, triggering
    # OCPG_EMPTY (-212) when the numbers differ.  Strip "INDICATOR :var"
    # from all EXEC SQL INTO clauses so indicators are not registered as
    # separate result columns.  The indicator variables remain declared in
    # WS (useful for NULL checks) but won't skew the nResParams count.
    raw_text = re.sub(
        r'\bINDICATOR\s+:\w[-\w]*',
        '',
        raw_text, flags=re.IGNORECASE)

    # Inject BEGIN DECLARE SECTION + COPY DFHEIBLK immediately AFTER the
    # INCLUDE SQLCA block.  Placing the DECLARE SECTION here (rather than at
    # the top of WORKING-STORAGE) ensures that any EXEC SQL DECLARE CURSOR
    # blocks that appear before SQLCA in the DATA DIVISION are outside the
    # DECLARE SECTION — ocesql rejects DECLARE CURSOR inside a DECLARE SECTION.
    raw_text = re.sub(
        r'(EXEC\s+SQL\s+INCLUDE\s+SQLCA\s+END-EXEC\.?)',
        lambda m: (m.group(0) + '\n\n'
                   '       EXEC SQL BEGIN DECLARE SECTION END-EXEC.\n'
                   '       COPY DFHEIBLK.'),
        raw_text, count=1, flags=re.IGNORECASE)

    # Close DECLARE SECTION just before LINKAGE SECTION (or PROCEDURE DIVISION
    # if there is no LINKAGE SECTION).
    raw_text = re.sub(
        r'(?m)^([ \t]+(?:LINKAGE\s+SECTION|PROCEDURE\s+DIVISION)\.)',
        lambda m: ('       EXEC SQL END DECLARE SECTION END-EXEC.\n\n'
                   + m.group(0)),
        raw_text, count=1, flags=re.IGNORECASE)

    # USAGE IS POINTER fields inside DECLARE SECTION confuse ocesql —
    # replace with a plain PIC X(8) so the field still exists but is
    # invisible to the SQL engine (it is never used as a host variable).
    raw_text = re.sub(
        r'(03\s+\w+\s+)USAGE\s+[Ii][Ss]\s+POINTER\.',
        r'\1PIC X(8).',
        raw_text, flags=re.IGNORECASE)

    # ocesql does not recognize 77-level items as host variables.
    # Any 77-level indicator variables (IND-*) used as SQL INDICATOR targets
    # must be declared at 01-level so ocesql can bind them.
    raw_text = re.sub(
        r'^(\s+)77(\s+IND-)',
        r'\g<1>01\2',
        raw_text, flags=re.IGNORECASE | re.MULTILINE)

    # Move LINKAGE commarea structure to WS so ocesql can find host vars
    raw_text = transform_linkage_for_esql(raw_text)

    # Add USING DFHCOMMAREA to PROCEDURE DIVISION so GnuCOBOL binds the
    # commarea argument when the program is CALLed as a subroutine.
    # Only needed when LINKAGE SECTION has the flat 01 DFHCOMMAREA.
    if re.search(r'01\s+DFHCOMMAREA\s+PIC\s+X', raw_text, re.IGNORECASE):
        raw_text = re.sub(
            r'(?m)^([ \t]+PROCEDURE\s+DIVISION)\s*\.',
            r'\1 USING DFHCOMMAREA.',
            raw_text, count=1, flags=re.IGNORECASE)

    # Inject EXEC SQL CONNECT before the first executable statement.
    # IBM DB2 programs have no CONNECT — CICS handles the connection.
    # ocesql returns SQLCODE=-220 (OCPG_NO_CONN) if no connection exists.
    # Inject right after INITIALIZE WS-HEADER (the reliable first-stmt anchor).
    raw_text = re.sub(
        r'(?m)^([ \t]+)(INITIALIZE\s+WS-HEADER\.)',
        lambda m: (m.group(1) + m.group(2) + '\n' +
                   m.group(1) + 'EXEC SQL CONNECT END-EXEC.'),
        raw_text, count=1, flags=re.IGNORECASE)

    # Normalize identifiers to uppercase AFTER all inlining (copybooks included).
    # ocesql is case-sensitive: :CA-B-ADDRESS won't match CA-B-Address.
    # Process line-by-line so that apostrophes in COBOL comments (e.g. "Don't")
    # do not confuse the string-literal splitter and leave SQL host variable
    # references in mixed case.
    def _uppercase_cobol_line(line):
        # Comment line (col 7 = '*' or '/') — uppercase entirely, no literals
        if len(line) > 6 and line[6] in ('*', '/'):
            return line.upper()
        # Non-comment: uppercase outside single-quoted string literals
        parts_line = re.split(r"('[^']*')", line)
        return ''.join(
            p if i % 2 == 1 else p.upper()
            for i, p in enumerate(parts_line)
        )
    raw_text = '\n'.join(_uppercase_cobol_line(l) for l in raw_text.split('\n'))

    raw_lines = [l + '\n' for l in raw_text.split('\n')]

    # Join multi-line EXEC CICS blocks
    logical = join_exec_blocks(raw_lines)

    # Patch each logical line
    out_lines = []
    for (line_text, original_count) in logical:
        patched = patch_line(line_text)
        out_lines.append(patched)
        # pad with blank lines to keep rough line count (helps debugging)
        for _ in range(original_count - 1):
            out_lines.append('')

    result = '\n'.join(out_lines)

    # Inject stub paragraphs
    result = inject_stubs(result)

    # Fix PADDINGDATA path: in lgapdb01 (Add Policy), the program checks whether
    # EIBCALEN > WS-REQUIRED-CA-LEN to decide if extra padding data was appended
    # to the commarea.  In our standalone context EIBCALEN is always 32500 (from
    # dfheiblk.cpy), so WS-VARY-LEN ends up being ~32000, which causes ocesql to
    # read far past the 3900-byte WS-VARY-CHAR buffer and send a corrupt VARCHAR
    # to PostgreSQL (SQLCODE=-400).  Force WS-VARY-LEN to zero so the program
    # always uses the simpler INSERT path that omits PADDINGDATA.
    result = re.sub(
        r'([ \t]+)SUBTRACT\s+WS-REQUIRED-CA-LEN\s+FROM\s+EIBCALEN\s*\n'
        r'[ \t]+GIVING\s+WS-VARY-LEN',
        r'\1MOVE ZERO TO WS-VARY-LEN',
        result, flags=re.IGNORECASE)

    # Final pass: if program uses WS-COMMAREA mirror, sync back to DFHCOMMAREA
    # before every GOBACK (now that all EXEC CICS RETURN -> GOBACK replacements
    # have been applied by patch_line)
    # Before every GOBACK: commit the transaction and sync commarea back.
    # ocesql connects with autocommit=OFF; without COMMIT the INSERT is rolled
    # back when the program returns.  CICS would have committed on RETURN.
    commit_stmt = 'EXEC SQL COMMIT END-EXEC'
    if 'WS-COMMAREA' in result:
        result = re.sub(
            r'^(\s+)GOBACK(\.?)\s*$',
            lambda m: (m.group(1) + commit_stmt + '\n' +
                       m.group(1) + 'MOVE WS-COMMAREA TO DFHCOMMAREA\n' +
                       m.group(1) + 'GOBACK' + m.group(2)),
            result, flags=re.MULTILINE)
    else:
        result = re.sub(
            r'^(\s+)GOBACK(\.?)\s*$',
            lambda m: (m.group(1) + commit_stmt + '\n' +
                       m.group(1) + 'GOBACK' + m.group(2)),
            result, flags=re.MULTILINE)

    with open(sys.argv[2], 'w') as f:
        f.write(result)

    print(f'Patched: {sys.argv[1]} -> {sys.argv[2]}')


if __name__ == '__main__':
    main()
