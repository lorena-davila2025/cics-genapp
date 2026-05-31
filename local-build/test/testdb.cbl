       IDENTIFICATION DIVISION.
       PROGRAM-ID. TESTDB.
      *  Smoke-test driver: calls lgacdb01 (INQ customer) and
      *  lgacdb02 (ADD customer) directly without CICS runtime.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-COMMAREA.
           COPY LGCMAREA.
       01  WS-RC                   PIC 9(2).

       PROCEDURE DIVISION.
       MAIN.
      *------------------------------------------------------------
      * TEST 1: Inquire customer 1 (lgicdb01 = INQuire Customer DB)
      *------------------------------------------------------------
           DISPLAY '=== TEST 1: INQ CUSTOMER 1 ==='.
           INITIALIZE WS-COMMAREA.
           MOVE '01INQU'        TO CA-REQUEST-ID.
           MOVE 1               TO CA-CUSTOMER-NUM.

           CALL 'LGICDB01' USING BY REFERENCE
               WS-COMMAREA.

           MOVE CA-RETURN-CODE TO WS-RC.
           DISPLAY 'RETURN-CODE: ' WS-RC.
           IF WS-RC = 0
               DISPLAY 'FIRST-NAME:  ' CA-FIRST-NAME
               DISPLAY 'LAST-NAME:   ' CA-LAST-NAME
               DISPLAY 'EMAIL:       ' CA-EMAIL-ADDRESS
           ELSE
               DISPLAY 'INQ FAILED rc=' WS-RC
           END-IF.

      *------------------------------------------------------------
      * TEST 2: Add a new customer (lgacdb01 = Add Customer DB)
      *------------------------------------------------------------
           DISPLAY ' '.
           DISPLAY '=== TEST 2: ADD NEW CUSTOMER ==='.
           INITIALIZE WS-COMMAREA.
           MOVE '01ACUS'        TO CA-REQUEST-ID.
           MOVE 'TestFirst'     TO CA-FIRST-NAME.
           MOVE 'TestLast'      TO CA-LAST-NAME.
           MOVE '1990-01-01'    TO CA-DOB.
           MOVE 'Test House'    TO CA-HOUSE-NAME.
           MOVE '42'            TO CA-HOUSE-NUM.
           MOVE 'TS1 1AA'       TO CA-POSTCODE.
           MOVE '07700000000'   TO CA-PHONE-MOBILE.
           MOVE '01234000000'   TO CA-PHONE-HOME.
           MOVE 'test@test.com' TO CA-EMAIL-ADDRESS.

           CALL 'LGACDB01' USING BY REFERENCE
               WS-COMMAREA.

           MOVE CA-RETURN-CODE TO WS-RC.
           DISPLAY 'RETURN-CODE: ' WS-RC.
           IF WS-RC = 0
               DISPLAY 'NEW CUSTOMER-NUM: ' CA-CUSTOMER-NUM
           ELSE
               DISPLAY 'ADD FAILED rc=' WS-RC
           END-IF.

           STOP RUN.
