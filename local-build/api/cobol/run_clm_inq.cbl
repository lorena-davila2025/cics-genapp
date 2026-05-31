       IDENTIFICATION DIVISION.
       PROGRAM-ID. RUN-CLM-INQ.
      ******************************************************************
      * Runner: Inquire Claim
      * Reads env var CLAIM_NUM, calls LGICM01.
      * Outputs STATUS and claim fields on success.
      ******************************************************************
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-COMMAREA.
           COPY LGCMAREA.
       01  WS-ENV-CLAIM-NUM       PIC X(10).
       01  WS-CLAIM-NUM           PIC 9(10).
       01  WS-POL-NUM             PIC 9(10).
       01  WS-RETURN-CODE         PIC 9(2).
       01  WS-TRIM-FIELD          PIC X(255).
       PROCEDURE DIVISION.
       MAIN.
           ACCEPT WS-ENV-CLAIM-NUM FROM ENVIRONMENT 'CLAIM_NUM'
           MOVE FUNCTION NUMVAL(WS-ENV-CLAIM-NUM) TO WS-CLAIM-NUM
           INITIALIZE WS-COMMAREA
           MOVE '01ICLM'     TO CA-REQUEST-ID
           MOVE WS-CLAIM-NUM TO CA-C-NUM
           CALL 'LGICM01' USING WS-COMMAREA
           MOVE CA-RETURN-CODE TO WS-RETURN-CODE
           DISPLAY 'STATUS: ' WS-RETURN-CODE
           IF CA-RETURN-CODE = 00
               MOVE CA-C-NUM TO WS-CLAIM-NUM
               DISPLAY 'CLAIM_NUM: ' WS-CLAIM-NUM
               MOVE CA-POLICY-NUM TO WS-POL-NUM
               DISPLAY 'POLICY_NUM: ' WS-POL-NUM
               MOVE FUNCTION TRIM(CA-C-DATE, TRAILING) TO WS-TRIM-FIELD
               DISPLAY 'CLAIM_DATE: ' WS-TRIM-FIELD
               DISPLAY 'PAID: ' CA-C-PAID
               DISPLAY 'VALUE: ' CA-C-VALUE
               MOVE FUNCTION TRIM(CA-C-CAUSE, TRAILING) TO WS-TRIM-FIELD
               DISPLAY 'CAUSE: ' WS-TRIM-FIELD
               MOVE FUNCTION TRIM(CA-C-OBSERVATIONS, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'OBSERVATIONS: ' WS-TRIM-FIELD
           END-IF
           STOP RUN.
