      ******************************************************************
      *                                                                *
      *                    ADD Claim                                   *
      *                                                                *
      *  Inserts a new row into the CLAIM table for a given policy.   *
      *  Returns the generated claimNumber in CA-C-Num.               *
      *                                                                *
      *  Return codes:                                                 *
      *    00 - success  (CA-C-Num set to new claim number)            *
      *    70 - policy not found (FK violation)                        *
      *    90 - SQL error                                              *
      *                                                                *
      ******************************************************************
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LGACLM01.
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       DATA DIVISION.

       WORKING-STORAGE SECTION.

       01 DB2-IN-INTEGERS.
          03 DB2-POLICYNUM-INT         PIC S9(9).
          03 DB2-PAID-INT              PIC S9(9).
          03 DB2-VALUE-INT             PIC S9(9).

       01 DB2-OUT-INTEGERS.
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
           INITIALIZE DB2-OUT-INTEGERS
           MOVE '00' TO CA-RETURN-CODE

           MOVE CA-POLICY-NUM  TO DB2-POLICYNUM-INT
           MOVE CA-C-PAID      TO DB2-PAID-INT
           MOVE CA-C-VALUE     TO DB2-VALUE-INT

           EXEC SQL
             INSERT INTO genapp.CLAIM
                       ( POLICYNUMBER,
                         CLAIMDATE,
                         PAID,
                         VALUE,
                         CAUSE,
                         OBSERVATIONS )
                VALUES ( :DB2-POLICYNUM-INT,
                         :CA-C-DATE,
                         :DB2-PAID-INT,
                         :DB2-VALUE-INT,
                         :CA-C-CAUSE,
                         :CA-C-OBSERVATIONS )
           END-EXEC

           EVALUATE SQLCODE
             WHEN 0
               MOVE '00' TO CA-RETURN-CODE
             WHEN -530
               MOVE '70' TO CA-RETURN-CODE
               MOVE WS-COMMAREA TO DFHCOMMAREA
               GOBACK
             WHEN OTHER
               MOVE '90' TO CA-RETURN-CODE
               MOVE WS-COMMAREA TO DFHCOMMAREA
               GOBACK
           END-EVALUATE

           EXEC SQL
             SELECT LASTVAL() INTO :DB2-CLAIMNUM-INT
           END-EXEC

           MOVE DB2-CLAIMNUM-INT TO CA-C-NUM
           EXEC SQL COMMIT END-EXEC.
           MOVE WS-COMMAREA TO DFHCOMMAREA
           GOBACK.
