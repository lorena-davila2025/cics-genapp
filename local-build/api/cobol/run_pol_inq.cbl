       IDENTIFICATION DIVISION.
       PROGRAM-ID. RUN-POL-INQ.
      ******************************************************************
      * Runner: Inquire Policy
      * Reads env vars CUST_NUM, POL_NUM, POL_TYPE
      * POL_TYPE selects request ID:
      *   E -> 01IEND (Endowment)
      *   H -> 01IHOU (House)
      *   M -> 01IMOT (Motor)
      *   C -> 01ICOM (Commercial by customer)
      * Calls LGIPDB01, outputs STATUS + policy fields
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
       01  WS-TRIM-FIELD          PIC X(255).
       01  WS-RETURN-CODE         PIC 9(2).
       01  WS-NUM-DISPLAY         PIC 9(10).
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
      * Set request ID based on policy type
           EVALUATE FUNCTION UPPER-CASE(WS-ENV-POL-TYPE)
               WHEN 'E'
                   MOVE '01IEND' TO CA-REQUEST-ID
               WHEN 'H'
                   MOVE '01IHOU' TO CA-REQUEST-ID
               WHEN 'M'
                   MOVE '01IMOT' TO CA-REQUEST-ID
               WHEN OTHER
                   MOVE '01ICOM' TO CA-REQUEST-ID
           END-EVALUATE
           CALL 'LGIPDB01' USING WS-COMMAREA
           MOVE CA-RETURN-CODE TO WS-RETURN-CODE
           DISPLAY 'STATUS: ' WS-RETURN-CODE
           IF CA-RETURN-CODE = 00
               MOVE CA-CUSTOMER-NUM TO WS-NUM-DISPLAY
               DISPLAY 'CUSTOMER_NUM: ' WS-NUM-DISPLAY
               MOVE CA-POLICY-NUM TO WS-NUM-DISPLAY
               DISPLAY 'POLICY_NUM: ' WS-NUM-DISPLAY
               MOVE FUNCTION TRIM(CA-ISSUE-DATE, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'ISSUE_DATE: ' WS-TRIM-FIELD
               MOVE FUNCTION TRIM(CA-EXPIRY-DATE, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'EXPIRY_DATE: ' WS-TRIM-FIELD
               MOVE FUNCTION TRIM(CA-LASTCHANGED, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'LAST_CHANGED: ' WS-TRIM-FIELD
               MOVE CA-BROKERID TO WS-NUM-DISPLAY
               DISPLAY 'BROKER_ID: ' WS-NUM-DISPLAY
               MOVE FUNCTION TRIM(CA-BROKERSREF, TRAILING)
                   TO WS-TRIM-FIELD
               DISPLAY 'BROKERS_REF: ' WS-TRIM-FIELD
               MOVE CA-PAYMENT TO WS-NUM-DISPLAY
               DISPLAY 'PAYMENT: ' WS-NUM-DISPLAY
      * Output type-specific fields
               EVALUATE FUNCTION UPPER-CASE(WS-ENV-POL-TYPE)
                   WHEN 'E'
                       DISPLAY 'POL_TYPE: ENDOWMENT'
                       DISPLAY 'WITH_PROFITS: ' CA-E-WITH-PROFITS
                       DISPLAY 'EQUITIES: ' CA-E-EQUITIES
                       DISPLAY 'MANAGED_FUND: ' CA-E-MANAGED-FUND
                       MOVE FUNCTION TRIM(CA-E-FUND-NAME, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'FUND_NAME: ' WS-TRIM-FIELD
                       DISPLAY 'TERM: ' CA-E-TERM
                       DISPLAY 'SUM_ASSURED: ' CA-E-SUM-ASSURED
                       MOVE FUNCTION TRIM(CA-E-LIFE-ASSURED, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'LIFE_ASSURED: ' WS-TRIM-FIELD
                   WHEN 'H'
                       DISPLAY 'POL_TYPE: HOUSE'
                       MOVE FUNCTION TRIM(CA-H-PROPERTY-TYPE, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'PROPERTY_TYPE: ' WS-TRIM-FIELD
                       DISPLAY 'BEDROOMS: ' CA-H-BEDROOMS
                       DISPLAY 'VALUE: ' CA-H-VALUE
                       MOVE FUNCTION TRIM(CA-H-HOUSE-NAME, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'HOUSE_NAME: ' WS-TRIM-FIELD
                       MOVE FUNCTION TRIM(CA-H-HOUSE-NUMBER, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'HOUSE_NUMBER: ' WS-TRIM-FIELD
                       MOVE FUNCTION TRIM(CA-H-POSTCODE, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'POSTCODE: ' WS-TRIM-FIELD
                   WHEN 'M'
                       DISPLAY 'POL_TYPE: MOTOR'
                       MOVE FUNCTION TRIM(CA-M-MAKE, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'MAKE: ' WS-TRIM-FIELD
                       MOVE FUNCTION TRIM(CA-M-MODEL, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'MODEL: ' WS-TRIM-FIELD
                       DISPLAY 'VALUE: ' CA-M-VALUE
                       MOVE FUNCTION TRIM(CA-M-REGNUMBER, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'REG_NUMBER: ' WS-TRIM-FIELD
                       MOVE FUNCTION TRIM(CA-M-COLOUR, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'COLOUR: ' WS-TRIM-FIELD
                       DISPLAY 'CC: ' CA-M-CC
                       MOVE FUNCTION TRIM(CA-M-MANUFACTURED, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'MANUFACTURED: ' WS-TRIM-FIELD
                       DISPLAY 'PREMIUM: ' CA-M-PREMIUM
                       DISPLAY 'ACCIDENTS: ' CA-M-ACCIDENTS
                   WHEN OTHER
                       DISPLAY 'POL_TYPE: COMMERCIAL'
                       MOVE FUNCTION TRIM(CA-B-ADDRESS, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'ADDRESS: ' WS-TRIM-FIELD
                       MOVE FUNCTION TRIM(CA-B-POSTCODE, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'POSTCODE: ' WS-TRIM-FIELD
                       MOVE FUNCTION TRIM(CA-B-LATITUDE, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'LATITUDE: ' WS-TRIM-FIELD
                       MOVE FUNCTION TRIM(CA-B-LONGITUDE, TRAILING)
                           TO WS-TRIM-FIELD
                       DISPLAY 'LONGITUDE: ' WS-TRIM-FIELD
                       DISPLAY 'FIRE_PERIL: ' CA-B-FIREPERIL
                       DISPLAY 'FIRE_PREMIUM: ' CA-B-FIREPREMIUM
                       DISPLAY 'CRIME_PERIL: ' CA-B-CRIMEPERIL
                       DISPLAY 'CRIME_PREMIUM: ' CA-B-CRIMEPREMIUM
                       DISPLAY 'FLOOD_PERIL: ' CA-B-FLOODPERIL
                       DISPLAY 'FLOOD_PREMIUM: ' CA-B-FLOODPREMIUM
                       DISPLAY 'WEATHER_PERIL: ' CA-B-WEATHERPERIL
                       DISPLAY 'WEATHER_PREMIUM: ' CA-B-WEATHERPREMIUM
                       DISPLAY 'STATUS_CODE: ' CA-B-STATUS
               END-EVALUATE
           END-IF
           STOP RUN.
