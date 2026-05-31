      ******************************************************************
      *                                                                *
      *                    INQUIRE Claim                               *
      *                                                                *
      *  Retrieves a single claim row by CLAIMNUMBER.                 *
      *                                                                *
      *  Return codes:                                                 *
      *    00 - success                                                *
      *    01 - not found                                              *
      *    90 - SQL error                                              *
      *                                                                *
      ******************************************************************
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LGICM01.
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       DATA DIVISION.

       WORKING-STORAGE SECTION.

       01 DB2-IN-INTEGERS.
          03 DB2-CLAIMNUM-INT          PIC S9(9).

       01 DB2-OUT-INTEGERS.
          03 DB2-POLICYNUM-INT         PIC S9(9).
          03 DB2-PAID-INT              PIC S9(9).
          03 DB2-VALUE-INT             PIC S9(9).

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
           INITIALIZE DB2-OUT-INTEGERS
           MOVE '00' TO CA-RETURN-CODE
           MOVE CA-C-NUM TO DB2-CLAIMNUM-INT

           EXEC SQL
             SELECT POLICYNUMBER,
                    CLAIMDATE,
                    PAID,
                    VALUE,
                    CAUSE,
                    OBSERVATIONS
               INTO :DB2-POLICYNUM-INT,
                    :CA-C-DATE,
                    :DB2-PAID-INT,
                    :DB2-VALUE-INT,
                    :CA-C-CAUSE,
                    :CA-C-OBSERVATIONS
               FROM genapp.CLAIM
              WHERE CLAIMNUMBER = :DB2-CLAIMNUM-INT
           END-EXEC

           EVALUATE SQLCODE
             WHEN 0
               MOVE '00' TO CA-RETURN-CODE
               MOVE DB2-POLICYNUM-INT TO CA-POLICY-NUM
               MOVE DB2-PAID-INT      TO CA-C-PAID
               MOVE DB2-VALUE-INT     TO CA-C-VALUE
             WHEN 100
               MOVE '01' TO CA-RETURN-CODE
             WHEN OTHER
               MOVE '90' TO CA-RETURN-CODE
           END-EVALUATE

           MOVE WS-COMMAREA TO DFHCOMMAREA
           GOBACK.
