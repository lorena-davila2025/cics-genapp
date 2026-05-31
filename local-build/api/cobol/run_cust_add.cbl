       IDENTIFICATION DIVISION.
       PROGRAM-ID. RUN-CUST-ADD.
      ******************************************************************
      * Runner: Add Customer
      * Reads env vars for customer fields, calls LGACDB01,
      * outputs STATUS and new CUSTOMER_NUM
      ******************************************************************
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-COMMAREA.
           COPY LGCMAREA.
       01  WS-CUST-NUM            PIC 9(10).
       01  WS-TRIM-FIELD          PIC X(255).
       01  WS-RETURN-CODE         PIC 9(2).
       PROCEDURE DIVISION.
       MAIN.
           INITIALIZE WS-COMMAREA
           MOVE '01ACUS'      TO CA-REQUEST-ID
      * Accept all customer input fields from environment variables
           ACCEPT CA-FIRST-NAME    FROM ENVIRONMENT 'FIRSTNAME'
           ACCEPT CA-LAST-NAME     FROM ENVIRONMENT 'LASTNAME'
           ACCEPT CA-DOB           FROM ENVIRONMENT 'DOB'
           ACCEPT CA-HOUSE-NAME    FROM ENVIRONMENT 'HOUSE_NAME'
           ACCEPT CA-HOUSE-NUM     FROM ENVIRONMENT 'HOUSE_NUM'
           ACCEPT CA-POSTCODE      FROM ENVIRONMENT 'POSTCODE'
           ACCEPT CA-PHONE-MOBILE  FROM ENVIRONMENT 'PHONE_MOBILE'
           ACCEPT CA-PHONE-HOME    FROM ENVIRONMENT 'PHONE_HOME'
           ACCEPT CA-EMAIL-ADDRESS FROM ENVIRONMENT 'EMAIL'
           CALL 'LGACDB01' USING WS-COMMAREA
           MOVE CA-RETURN-CODE TO WS-RETURN-CODE
           DISPLAY 'STATUS: ' WS-RETURN-CODE
           IF CA-RETURN-CODE = 00
               MOVE CA-CUSTOMER-NUM TO WS-CUST-NUM
               DISPLAY 'CUSTOMER_NUM: ' WS-CUST-NUM
           END-IF
           STOP RUN.
