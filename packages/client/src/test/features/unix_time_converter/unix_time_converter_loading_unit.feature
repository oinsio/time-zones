Feature: The Unix time converter while the location list loads
  Implements change add-unix-time-converter-tool.
  As a user I can already type a Unix time while the places are not ready.

  @add-unix-time-converter-tool @FR9
  Scenario: The location list is unreadable
    Given the stored location list cannot be read
    When the user opens the converter
    Then exactly one row is shown, for the device time zone
    And the row skeleton is not shown

  @add-unix-time-converter-tool @FR9 @UX1
  Scenario: The converter page is still loading
    Given the converter page has not finished loading
    When the user opens the converter
    Then the row skeleton is shown under the page heading
    And no converter row is shown
