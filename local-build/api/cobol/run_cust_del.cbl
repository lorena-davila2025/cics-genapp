       IDENTIFICATION DIVISION.
       PROGRAM-ID. RUN-CUST-DEL.
      ******************************************************************
      * Runner: Delete Customer
      * Reads env var CUST_NUM, calls LGDCDB01.
      * Cascades to policies, detail rows, and claims.
      * Outputs STATUS: nn
      ******************************************************************
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-COMMAREA.
           COPY LGCMAREA.
       01  WS-ENV-CUST-NUM        PIC X(10).
       01  WS-CUST-NUM            PIC 9(10).
       01  WS-RETURN-CODE         PIC 9(2).
       PROCEDURE DIVISION.
       MAIN.
           ACCEPT WS-ENV-CUST-NUM FROM ENVIRONMENT 'CUST_NUM'
           MOVE FUNCTION NUMVAL(WS-ENV-CUST-NUM) TO WS-CUST-NUM
           INITIALIZE WS-COMMAREA
           MOVE '01DCUS'    TO CA-REQUEST-ID
           MOVE WS-CUST-NUM TO CA-CUSTOMER-NUM
           CALL 'LGDCDB01' USING WS-COMMAREA
           MOVE CA-RETURN-CODE TO WS-RETURN-CODE
           DISPLAY 'STATUS: ' WS-RETURN-CODE
           STOP RUN.
