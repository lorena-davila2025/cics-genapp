      ******************************************************************
      *                                                                *
      *                    DELETE Claim                                *
      *                                                                *
      *  Deletes a claim row by CLAIMNUMBER.                          *
      *                                                                *
      *  Return codes:                                                 *
      *    00 - success                                                *
      *    01 - claim not found (SQLCODE 100)                          *
      *    90 - SQL error                                              *
      *                                                                *
      ******************************************************************
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LGDCLM01.
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       DATA DIVISION.

       WORKING-STORAGE SECTION.

       01 DB2-IN-INTEGERS.
          03 DB2-CLAIMNUM-INT          PIC S9(9).

           EXEC SQL
             INCLUDE SQLCA
           END-EXEC.

       EXEC SQL BEGIN DECLARE SECTION END-EXEC.
       COPY DFHEIBLK.
       01  WS-COMMAREA.
           EXEC SQL
             INCLUDE LGCMAREA
           END-EXEC.
       EXEC SQL END DECLARE SECTION END-EXEC.

       LINKAGE SECTION.
       01  DFHCOMMAREA              PIC X(32500).

       PROCEDURE DIVISION USING DFHCOMMAREA.
       MAIN.
           MOVE DFHCOMMAREA TO WS-COMMAREA
           EXEC SQL CONNECT END-EXEC.
           INITIALIZE DB2-IN-INTEGERS
           MOVE '00' TO CA-RETURN-CODE
           MOVE CA-C-NUM TO DB2-CLAIMNUM-INT

           EXEC SQL
             DELETE FROM genapp.CLAIM
             WHERE CLAIMNUMBER = :DB2-CLAIMNUM-INT
           END-EXEC

           EVALUATE SQLCODE
             WHEN 0
               MOVE '00' TO CA-RETURN-CODE
             WHEN 100
               MOVE '01' TO CA-RETURN-CODE
             WHEN OTHER
               MOVE '90' TO CA-RETURN-CODE
           END-EVALUATE

           EXEC SQL COMMIT END-EXEC.
           MOVE WS-COMMAREA TO DFHCOMMAREA
           GOBACK.
