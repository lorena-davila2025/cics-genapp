       IDENTIFICATION DIVISION.
       PROGRAM-ID. RUN-CLM-ADD.
      ******************************************************************
      * Runner: Add Claim
      * Reads env vars, calls LGACLM01.
      * Outputs STATUS and CLAIM_NUM on success.
      ******************************************************************
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-COMMAREA.
           COPY LGCMAREA.
       01  WS-ENV-POL-NUM         PIC X(10).
       01  WS-POL-NUM             PIC 9(10).
       01  WS-CLAIM-NUM           PIC 9(10).
       01  WS-RETURN-CODE         PIC 9(2).
       PROCEDURE DIVISION.
       MAIN.
           ACCEPT WS-ENV-POL-NUM  FROM ENVIRONMENT 'POL_NUM'
           MOVE FUNCTION NUMVAL(WS-ENV-POL-NUM) TO WS-POL-NUM
           INITIALIZE WS-COMMAREA
           MOVE '01ACLM'   TO CA-REQUEST-ID
           MOVE WS-POL-NUM TO CA-POLICY-NUM
           ACCEPT CA-C-DATE         FROM ENVIRONMENT 'CLAIM_DATE'
           ACCEPT CA-C-PAID         FROM ENVIRONMENT 'PAID'
           ACCEPT CA-C-VALUE        FROM ENVIRONMENT 'VALUE'
           ACCEPT CA-C-CAUSE        FROM ENVIRONMENT 'CAUSE'
           ACCEPT CA-C-OBSERVATIONS FROM ENVIRONMENT 'OBSERVATIONS'
           CALL 'LGACLM01' USING WS-COMMAREA
           MOVE CA-RETURN-CODE TO WS-RETURN-CODE
           DISPLAY 'STATUS: ' WS-RETURN-CODE
           IF CA-RETURN-CODE = 00
               MOVE CA-C-NUM TO WS-CLAIM-NUM
               DISPLAY 'CLAIM_NUM: ' WS-CLAIM-NUM
           END-IF
           STOP RUN.
