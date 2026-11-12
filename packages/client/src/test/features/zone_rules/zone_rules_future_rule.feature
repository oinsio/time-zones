Feature: Zone rules future rule
  As a user I see the right time after the last listed clock change, from the future rule of a zone.

  @add-zone-rules-from-iana @FR3 @M4
  Scenario Outline: Future rule forms
    When the future rule <rule> is evaluated at <instant>
    Then the offset is <offset> and the designation is <designation>

    Examples:
      | rule                            | instant              | offset | designation |
      | EST5EDT,M3.2.0,M11.1.0          | 2040-07-15T12:00:00Z | −04:00 | EDT         |
      | EST5EDT,M3.2.0,M11.1.0          | 2040-01-15T12:00:00Z | −05:00 | EST         |
      | IST-1GMT0,M10.5.0,M3.5.0/1      | 2038-07-01T12:00:00Z | +01:00 | IST         |
      | IST-1GMT0,M10.5.0,M3.5.0/1      | 2038-01-15T12:00:00Z | +00:00 | GMT         |
      | <-02>2<-01>,M3.5.0/-1,M10.5.0/0 | 2040-07-15T12:00:00Z | −01:00 | -01         |
      | <-02>2<-01>,M3.5.0/-1,M10.5.0/0 | 2040-01-15T12:00:00Z | −02:00 | -02         |
      | EST5EDT,0/0,J365/25             | 2040-01-15T12:00:00Z | −04:00 | EDT         |
      | EST5EDT,0/0,J365/25             | 2040-07-15T12:00:00Z | −04:00 | EDT         |
      | <+05>-5                         | 2040-07-15T12:00:00Z | +05:00 | +05         |
      | <+0530>-5:30                    | 2040-07-15T12:00:00Z | +05:30 | +0530       |
      | NZST-12NZDT,M9.5.0,M4.1.0/3     | 2040-01-15T12:00:00Z | +13:00 | NZDT        |
      | AEST-10AEDT,M10.1.0,M4.1.0/3    | 2040-03-31T15:30:00Z | +11:00 | AEDT        |
      | AEST-10AEDT,M10.1.0,M4.1.0/3    | 2040-03-31T16:30:00Z | +10:00 | AEST        |

  @add-zone-rules-from-iana @FR3 @M4
  Scenario: Transitions are read in the local time in force
    Given the future rule "EST5EDT,M3.2.0,M11.1.0"
    When it is evaluated one second before and at "2040-03-11T07:00:00Z"
    Then the offsets are "−05:00" and then "−04:00"

  @add-zone-rules-from-iana @FR3 @M4
  Scenario Outline: Julian day forms
    When the future rule <rule> is evaluated at <instant>
    Then the offset is <offset>

    Examples:
      | rule                | instant              | offset |
      | STD3DST,J60/2,J61/2 | 2040-02-29T12:00:00Z | −03:00 |
      | STD3DST,J60/2,J61/2 | 2040-03-01T12:00:00Z | −02:00 |
      | STD3DST,59/2,60/2   | 2040-02-29T12:00:00Z | −02:00 |
