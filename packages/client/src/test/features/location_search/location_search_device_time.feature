Feature: Device time in the search
  Implements change add-settings-page-and-device-time-location.
  As a user I add the time on my own device back from the search, whatever
  the state of the search data.

  @add-settings-page-and-device-time-location @FR11
  Scenario: Offered after removal
    Given the list is "Moscow"
    When the user opens the search
    Then the first option is "Device time"
    And the popular suggestions follow it

  @add-settings-page-and-device-time-location @FR11
  Scenario Outline: Matched by a word in either language
    Given the list is "Moscow"
    And the interface language is "en"
    When the user searches for "<query>"
    Then the "Device time" option is shown first

    Examples:
      | query |
      | dev   |
      | time  |
      | врем  |
      | устр  |

  @add-settings-page-and-device-time-location @FR11
  Scenario: Not matched
    Given the list is "Moscow"
    When the user searches for "Moscow"
    Then no "Device time" option is shown

  @add-settings-page-and-device-time-location @FR11
  Scenario Outline: Shown while the search data loads or failed
    Given the list is "Moscow"
    And the search data is <state>
    When the user opens the search
    Then the "Device time" option is shown

    Examples:
      | state          |
      | loading        |
      | failed to load |

  @add-settings-page-and-device-time-location @FR11
  Scenario: Hidden while listed
    Given the list is "the device time location, Moscow"
    When the user opens the search
    Then no "Device time" option is shown
