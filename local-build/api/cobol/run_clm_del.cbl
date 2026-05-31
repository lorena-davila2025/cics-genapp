       IDENTIFICATION DIVISION.
       PROGRAM-ID. RUN-CLM-DEL.
      ******************************************************************
      * Runner: Delete Claim
      * Reads env var CLAIM_NUM, calls LGDCLM01.
      * Outputs STATUS: nn
      ******************************************************************
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-COMMAREA.
           COPY LGCMAREA.
       01  WS-ENV-CLAIM-NUM       PIC X(10).
       01  WS-CLAIM-NUM           PIC 9(10).
       01  WS-RETURN-CODE         PIC 9(2).
       PROCEDURE DIVISION.
       MAIN.
           ACCEPT WS-ENV-CLAIM-NUM FROM ENVIRONMENT 'CLAIM_NUM'
           MOVE FUNCTION NUMVAL(WS-ENV-CLAIM-NUM) TO WS-CLAIM-NUM
           INITIALIZE WS-COMMAREA
           MOVE '01DCLM'      TO CA-REQUEST-ID
           MOVE WS-CLAIM-NUM  TO CA-C-NUM
           CALL 'LGDCLM01' USING WS-COMMAREA
           MOVE CA-RETURN-CODE TO WS-RETURN-CODE
           DISPLAY 'STATUS: ' WS-RETURN-CODE
           STOP RUN.
