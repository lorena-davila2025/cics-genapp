       IDENTIFICATION DIVISION.
       PROGRAM-ID. RUN-POL-ADD.
      ******************************************************************
      * Runner: Add Policy
      * Reads env vars, calls LGAPDB01.
      * POL_TYPE: E=Endowment, H=House, M=Motor, C=Commercial
      * Outputs STATUS and POLICY_NUM on success.
      ******************************************************************
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-COMMAREA.
           COPY LGCMAREA.
       01  WS-ENV-CUST-NUM        PIC X(10).
       01  WS-ENV-POL-TYPE        PIC X(1).
       01  WS-CUST-NUM            PIC 9(10).
       01  WS-POL-NUM             PIC 9(10).
       01  WS-RETURN-CODE         PIC 9(2).
       PROCEDURE DIVISION.
       MAIN.
           ACCEPT WS-ENV-CUST-NUM FROM ENVIRONMENT 'CUST_NUM'
           ACCEPT WS-ENV-POL-TYPE FROM ENVIRONMENT 'POL_TYPE'
           MOVE FUNCTION NUMVAL(WS-ENV-CUST-NUM) TO WS-CUST-NUM
           INITIALIZE WS-COMMAREA
           MOVE WS-CUST-NUM TO CA-CUSTOMER-NUM
           ACCEPT CA-ISSUE-DATE  FROM ENVIRONMENT 'ISSUE_DATE'
           ACCEPT CA-EXPIRY-DATE FROM ENVIRONMENT 'EXPIRY_DATE'
           ACCEPT CA-BROKERID    FROM ENVIRONMENT 'BROKER_ID'
           ACCEPT CA-BROKERSREF  FROM ENVIRONMENT 'BROKERS_REF'
           ACCEPT CA-PAYMENT     FROM ENVIRONMENT 'PAYMENT'
           EVALUATE FUNCTION UPPER-CASE(WS-ENV-POL-TYPE)
             WHEN 'E'
               MOVE '01AEND' TO CA-REQUEST-ID
               ACCEPT CA-E-WITH-PROFITS
                 FROM ENVIRONMENT 'WITH_PROFITS'
               ACCEPT CA-E-EQUITIES
                 FROM ENVIRONMENT 'EQUITIES'
               ACCEPT CA-E-MANAGED-FUND
                 FROM ENVIRONMENT 'MANAGED_FUND'
               ACCEPT CA-E-FUND-NAME
                 FROM ENVIRONMENT 'FUND_NAME'
               ACCEPT CA-E-TERM
                 FROM ENVIRONMENT 'TERM'
               ACCEPT CA-E-SUM-ASSURED
                 FROM ENVIRONMENT 'SUM_ASSURED'
               ACCEPT CA-E-LIFE-ASSURED
                 FROM ENVIRONMENT 'LIFE_ASSURED'
             WHEN 'H'
               MOVE '01AHOU' TO CA-REQUEST-ID
               ACCEPT CA-H-PROPERTY-TYPE
                 FROM ENVIRONMENT 'PROPERTY_TYPE'
               ACCEPT CA-H-BEDROOMS
                 FROM ENVIRONMENT 'BEDROOMS'
               ACCEPT CA-H-VALUE
                 FROM ENVIRONMENT 'VALUE'
               ACCEPT CA-H-HOUSE-NAME
                 FROM ENVIRONMENT 'HOUSE_NAME'
               ACCEPT CA-H-HOUSE-NUMBER
                 FROM ENVIRONMENT 'HOUSE_NUMBER'
               ACCEPT CA-H-POSTCODE
                 FROM ENVIRONMENT 'POSTCODE'
             WHEN 'M'
               MOVE '01AMOT' TO CA-REQUEST-ID
               ACCEPT CA-M-MAKE
                 FROM ENVIRONMENT 'MAKE'
               ACCEPT CA-M-MODEL
                 FROM ENVIRONMENT 'MODEL'
               ACCEPT CA-M-VALUE
                 FROM ENVIRONMENT 'VALUE'
               ACCEPT CA-M-REGNUMBER
                 FROM ENVIRONMENT 'REG_NUMBER'
               ACCEPT CA-M-COLOUR
                 FROM ENVIRONMENT 'COLOUR'
               ACCEPT CA-M-CC
                 FROM ENVIRONMENT 'CC'
               ACCEPT CA-M-MANUFACTURED
                 FROM ENVIRONMENT 'MANUFACTURED'
               ACCEPT CA-M-PREMIUM
                 FROM ENVIRONMENT 'PREMIUM'
               ACCEPT CA-M-ACCIDENTS
                 FROM ENVIRONMENT 'ACCIDENTS'
             WHEN OTHER
               MOVE '01ACOM' TO CA-REQUEST-ID
               ACCEPT CA-B-ADDRESS
                 FROM ENVIRONMENT 'ADDRESS'
               ACCEPT CA-B-POSTCODE
                 FROM ENVIRONMENT 'POSTCODE'
               ACCEPT CA-B-LATITUDE
                 FROM ENVIRONMENT 'LATITUDE'
               ACCEPT CA-B-LONGITUDE
                 FROM ENVIRONMENT 'LONGITUDE'
               ACCEPT CA-B-CUSTOMER
                 FROM ENVIRONMENT 'CUSTOMER_NAME'
               ACCEPT CA-B-PROPTYPE
                 FROM ENVIRONMENT 'PROPERTY_TYPE'
               ACCEPT CA-B-FIREPERIL
                 FROM ENVIRONMENT 'FIRE_PERIL'
               ACCEPT CA-B-FIREPREMIUM
                 FROM ENVIRONMENT 'FIRE_PREMIUM'
               ACCEPT CA-B-CRIMEPERIL
                 FROM ENVIRONMENT 'CRIME_PERIL'
               ACCEPT CA-B-CRIMEPREMIUM
                 FROM ENVIRONMENT 'CRIME_PREMIUM'
               ACCEPT CA-B-FLOODPERIL
                 FROM ENVIRONMENT 'FLOOD_PERIL'
               ACCEPT CA-B-FLOODPREMIUM
                 FROM ENVIRONMENT 'FLOOD_PREMIUM'
               ACCEPT CA-B-WEATHERPERIL
                 FROM ENVIRONMENT 'WEATHER_PERIL'
               ACCEPT CA-B-WEATHERPREMIUM
                 FROM ENVIRONMENT 'WEATHER_PREMIUM'
               ACCEPT CA-B-STATUS
                 FROM ENVIRONMENT 'STATUS_CODE'
           END-EVALUATE
           CALL 'LGAPDB01' USING WS-COMMAREA
           MOVE CA-RETURN-CODE TO WS-RETURN-CODE
           DISPLAY 'STATUS: ' WS-RETURN-CODE
           IF CA-RETURN-CODE = 00
               MOVE CA-POLICY-NUM TO WS-POL-NUM
               DISPLAY 'POLICY_NUM: ' WS-POL-NUM
           END-IF
           STOP RUN.
