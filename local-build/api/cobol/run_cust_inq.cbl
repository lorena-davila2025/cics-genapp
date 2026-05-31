       IDENTIFICATION DIVISION.
       PROGRAM-ID. RUN-CUST-INQ.
      ******************************************************************
      * Runner: Inquire Customer
      * Reads env var CUST_NUM, calls LGICDB01, outputs KEY: VALUE
      ******************************************************************
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-COMMAREA.
           COPY LGCMAREA.
       01  WS-ENV-CUST-NUM        PIC X(10).
       01  WS-CUST-NUM            PIC 9(10).
       01  WS-TRIM-FIELD          PIC X(255).
       01  WS-RETURN-CODE         PIC 9(2).
       PROCEDURE DIVISION.
       MAIN.
           ACCEPT WS-ENV-CUST-NUM FROM ENVIRONMENT 'CUST_NUM'
           MOVE FUNCTION NUMVAL(WS-ENV-CUST-NUM) TO WS-CUST-NUM
           INITIALIZE WS-COMMAREA
           MOVE '01INQU'      TO CA-REQUEST-ID
           MOVE WS-CUST-NUM   TO CA-CUSTOMER-NUM
           CALL 'LGICDB01' USING WS-COMMAREA
           MOVE CA-RETURN-CODE TO WS-RETURN-CODE
           DISPLAY 'STATUS: ' WS-RETURN-CODE
           IF CA-RETURN-CODE = 00
               MOVE CA-CUSTOMER-NUM TO WS-CUST-NUM
               DISPLAY 'CUSTOMER_NUM: ' WS-CUST-NUM
               MOVE FUNCTION TRIM(CA-FIRST-NAME, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'FIRSTNAME: ' WS-TRIM-FIELD
               MOVE FUNCTION TRIM(CA-LAST-NAME, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'LASTNAME: ' WS-TRIM-FIELD
               MOVE FUNCTION TRIM(CA-DOB, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'DOB: ' WS-TRIM-FIELD
               MOVE FUNCTION TRIM(CA-HOUSE-NAME, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'HOUSE_NAME: ' WS-TRIM-FIELD
               MOVE FUNCTION TRIM(CA-HOUSE-NUM, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'HOUSE_NUM: ' WS-TRIM-FIELD
               MOVE FUNCTION TRIM(CA-POSTCODE, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'POSTCODE: ' WS-TRIM-FIELD
               MOVE FUNCTION TRIM(CA-PHONE-MOBILE, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'PHONE_MOBILE: ' WS-TRIM-FIELD
               MOVE FUNCTION TRIM(CA-PHONE-HOME, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'PHONE_HOME: ' WS-TRIM-FIELD
               MOVE FUNCTION TRIM(CA-EMAIL-ADDRESS, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'EMAIL: ' WS-TRIM-FIELD
               MOVE CA-NUM-POLICIES TO WS-RETURN-CODE
               DISPLAY 'NUM_POLICIES: ' CA-NUM-POLICIES
           END-IF
           STOP RUN.
