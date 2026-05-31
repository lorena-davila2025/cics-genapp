      ******************************************************************
      *  LGSTSQ-STUB: Replaces CICS TDQ/TSQ error logger               *
      *  Simply displays the error message to console                   *
      ******************************************************************
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LGSTSQ-STUB.
       DATA DIVISION.
       LINKAGE SECTION.
       01  MSG-IN                 PIC X(90).
       PROCEDURE DIVISION USING MSG-IN.
           DISPLAY '[LGSTSQ] ' MSG-IN UPON CONSOLE.
           GOBACK.
