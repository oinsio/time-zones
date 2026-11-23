Feature: The Unix time converter, range, places and language
  Implements change add-unix-time-converter-tool.
  As a user I get a clear message for a value out of range, one row without a
  location list, another day in one location and an English interface.

  @add-unix-time-converter-tool @FR16
  Scenario: Range
    Given the user chose the unit "Секунды"
    When the user types "8640000000000" into the converter input
    Then no message is shown
    When the user types the value "8640000000001" past the range
    Then the message of a value out of range "Значение вне поддерживаемого диапазона дат" is shown

  @add-unix-time-converter-tool @FR9
  Scenario: Empty list
    Given the location list is empty
    When the user opens the converter
    Then exactly one row is shown, for the device time zone, with the time "16:23:07"

  @add-unix-time-converter-tool @FR11
  Scenario: Another day in one location
    Given the user typed "1795432987123" into the converter input
    When the user chooses 24 November 2026 in the calendar of the New York row
    Then the New York row shows the date "вт, 24 нояб." and the time "06:23:07.123"
    And the converter input shows "1795519387123"

  @add-unix-time-converter-tool @FR18
  Scenario: English interface
    Given the interface language is English
    When the user types "abc" into the converter input
    Then the message "Enter a Unix time or an ISO 8601 date and time" is shown
    And the unit options are "Auto", "Seconds", "Milliseconds", "Microseconds", "Nanoseconds"
