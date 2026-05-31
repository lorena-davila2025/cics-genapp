       IDENTIFICATION DIVISION.
       PROGRAM-ID. RUN-POL-DEL.
      ******************************************************************
      * Runner: Delete Policy
      * Reads env vars CUST_NUM, POL_NUM, POL_TYPE, calls LGDPDB01.
      * POL_TYPE selects request ID:
      *   E -> 01DEND, H -> 01DHOU, M -> 01DMOT, C -> 01DCOM
      * Outputs STATUS: nn
      ******************************************************************
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-COMMAREA.
           COPY LGCMAREA.
       01  WS-ENV-CUST-NUM        PIC X(10).
       01  WS-ENV-POL-NUM         PIC X(10).
       01  WS-ENV-POL-TYPE        PIC X(1).
       01  WS-CUST-NUM            PIC 9(10).
       01  WS-POL-NUM             PIC 9(10).
       01  WS-RETURN-CODE         PIC 9(2).
       PROCEDURE DIVISION.
       MAIN.
           ACCEPT WS-ENV-CUST-NUM FROM ENVIRONMENT 'CUST_NUM'
           ACCEPT WS-ENV-POL-NUM  FROM ENVIRONMENT 'POL_NUM'
           ACCEPT WS-ENV-POL-TYPE FROM ENVIRONMENT 'POL_TYPE'
           MOVE FUNCTION NUMVAL(WS-ENV-CUST-NUM) TO WS-CUST-NUM
           MOVE FUNCTION NUMVAL(WS-ENV-POL-NUM)  TO WS-POL-NUM
           INITIALIZE WS-COMMAREA
           MOVE WS-CUST-NUM TO CA-CUSTOMER-NUM
           MOVE WS-POL-NUM  TO CA-POLICY-NUM

           EVALUATE FUNCTION UPPER-CASE(WS-ENV-POL-TYPE)
               WHEN 'E'
                   MOVE '01DEND' TO CA-REQUEST-ID
               WHEN 'H'
                   MOVE '01DHOU' TO CA-REQUEST-ID
               WHEN 'M'
                   MOVE '01DMOT' TO CA-REQUEST-ID
               WHEN OTHER
                   MOVE '01DCOM' TO CA-REQUEST-ID
           END-EVALUATE

           CALL 'LGDPDB01' USING WS-COMMAREA
           MOVE CA-RETURN-CODE TO WS-RETURN-CODE
           DISPLAY 'STATUS: ' WS-RETURN-CODE
           STOP RUN.
