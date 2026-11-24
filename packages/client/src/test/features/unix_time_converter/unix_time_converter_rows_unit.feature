Feature: Rows of the Unix time converter
  Implements change add-unix-time-converter-tool.
  As a user I read the converter moment as the local time of every place of
  my list, type an exact time in a row and see every field follow.

  @add-unix-time-converter-tool @FR9
  Scenario: 12-hour format
    Given the hour format is 12-hour
    When the user opens the converter
    And the user types "1795432987123" into the converter input
    Then the Moscow row shows the time "2:23:07.123 PM"

  @add-unix-time-converter-tool @FR9
  Scenario: The zone line follows the moment
    When the user opens the converter
    And the user types "1783000000" into the converter input
    Then the zone line of the New York row names "EDT" and "UTC−4"

  @add-unix-time-converter-tool @FR10
  Scenario: A time in a DST gap
    Given the user typed "2026-03-08T12:00:00Z" into the converter input
    When the user types "2:30:15" into the time of the New York row and confirms
    Then the New York row shows the time "03:30:15" and the wall-time hint for a DST gap

  @add-unix-time-converter-tool @FR10 @M4
  Scenario: Round trip to the nanosecond
    Given the user typed "1795432987" into the converter input
    And the user confirmed "9:30:15.123456789" in the New York row
    When the user types the nanoseconds notation into the converter input
    Then the New York row shows the time "09:30:15.123456789"

  @add-unix-time-converter-tool @FR11
  Scenario: A row change rewrites the input
    Given the user typed "2026-11-23T11:23:07Z" into the converter input
    When the user confirms "9" in the New York row
    Then the converter input shows "1795442400", not an ISO 8601 text
    And the seconds notation is "1795442400"
