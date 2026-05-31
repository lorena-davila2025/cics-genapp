       IDENTIFICATION DIVISION.
       PROGRAM-ID. RUN-CUST-UPD.
      ******************************************************************
      * Runner: Update Customer
      * Reads env vars CUST_NUM + all updatable fields,
      * calls LGUCDB01, outputs STATUS
      * LGUCDB01 uses CA-REQUEST-ID='01UCUS' (Update Customer)
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
           MOVE '01UCUS'      TO CA-REQUEST-ID
           MOVE WS-CUST-NUM   TO CA-CUSTOMER-NUM
      * Accept all updatable customer fields from environment variables
           ACCEPT CA-FIRST-NAME    FROM ENVIRONMENT 'FIRSTNAME'
           ACCEPT CA-LAST-NAME     FROM ENVIRONMENT 'LASTNAME'
           ACCEPT CA-DOB           FROM ENVIRONMENT 'DOB'
           ACCEPT CA-HOUSE-NAME    FROM ENVIRONMENT 'HOUSE_NAME'
           ACCEPT CA-HOUSE-NUM     FROM ENVIRONMENT 'HOUSE_NUM'
           ACCEPT CA-POSTCODE      FROM ENVIRONMENT 'POSTCODE'
           ACCEPT CA-PHONE-MOBILE  FROM ENVIRONMENT 'PHONE_MOBILE'
           ACCEPT CA-PHONE-HOME    FROM ENVIRONMENT 'PHONE_HOME'
           ACCEPT CA-EMAIL-ADDRESS FROM ENVIRONMENT 'EMAIL'
           CALL 'LGUCDB01' USING WS-COMMAREA
           MOVE CA-RETURN-CODE TO WS-RETURN-CODE
           DISPLAY 'STATUS: ' WS-RETURN-CODE
           STOP RUN.
