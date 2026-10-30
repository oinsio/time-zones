Feature: Hour format in every time text
  Implements change add-settings-page-and-device-time-location.
  As a user I read and type times in the hour format I chose, and switching it
  costs the app no more than the work it has to do.

  @add-settings-page-and-device-time-location @FR5
  Scenario: Gap note in 12-hour format
    Given the interface language is "en"
    And the hour format is "12-hour"
    And the device time zone is "America/New_York"
    And the current instant is "2026-03-07T07:30:00Z"
    And the list is "New York"
    And the app is open
    When the user moves to the next day
    Then the gap note names "2:30 AM" as the requested time and "3:30 AM" as the shown time

  @add-settings-page-and-device-time-location @FR5
  Scenario: Time in the 12-hour format
    Given the interface language is "en"
    And the hour format is "12-hour"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list is "Kathmandu, New York"
    And the app is open
    Then the "Kathmandu" row shows the time "1:15 PM"
    And the "New York" row also shows the time "3:30 AM"

  @add-settings-page-and-device-time-location @FR5
  Scenario: Hour labels in the 12-hour format
    Given the device time zone is "Asia/Almaty"
    And the interface language is "en"
    And the hour format is "12-hour"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list is "Moscow, Kolkata"
    And the app is open
    Then the hour labels of "Moscow" are "10 PM 4 AM 10 AM 4 PM 10 PM"
    And the hour labels of "Kolkata" are also "12:30 AM 6:30 AM 12:30 PM 6:30 PM 12:30 AM"

  @add-settings-page-and-device-time-location @FR5
  Scenario: Open the field in the 12-hour format
    Given the interface language is "en"
    And the hour format is "12-hour"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list is "New York"
    And the app is open
    When the user opens the wall-time input of "New York"
    Then the field holds "3:30 AM", fully selected

  @add-settings-page-and-device-time-location @FR6
  Scenario Outline: Accepted 12-hour texts
    When the user confirms the text "<text>"
    Then the typed wall-clock time is "<time>"

    Examples:
      | text     | time  |
      | 9 PM     | 21:00 |
      | 9pm      | 21:00 |
      | 9:30 am  | 09:30 |
      | 09.30 PM | 21:30 |
      | 12 AM    | 00:00 |
      | 12:15 PM | 12:15 |

  @add-settings-page-and-device-time-location @FR6
  Scenario Outline: Rejected 12-hour texts
    Given the interface language is "en"
    And the list is "Moscow"
    And the app is open
    And the moment is live
    When the user confirms the text "<text>" in the wall-time input of "Moscow"
    Then the field shows the error "Enter the time as HH:MM"
    And the moment is still live

    Examples:
      | text    |
      | 13 PM   |
      | 0 AM    |
      | 9:60 PM |

  @add-settings-page-and-device-time-location @FR6
  Scenario Outline: The shown time is accepted unchanged
    Given the hour format is "<format>"
    And the interface language is "<language>"
    And the current instant is "2026-03-08T16:30:00Z"
    And the list is "Almaty"
    And the app is open
    When the user opens the wall-time input of "Almaty" and confirms its initial text
    Then the moment is pinned to "2026-03-08T16:30:00Z"

    Examples:
      | format  | language |
      | 12-hour | en       |
      | 12-hour | ru       |
      | 24-hour | en       |

  @add-settings-page-and-device-time-location @NFR-P1 @M7
  Scenario: Presenting again builds no formatter
    Given 50 locations have been presented in the hour format "24-hour"
    When the same rows are presented again for the next minute tick
    Then no formatter is built

  @add-settings-page-and-device-time-location @NFR-P1 @M7
  Scenario: Switching the hour format builds one formatter per zone and kind
    Given 50 locations in 50 different time zones have been presented in the hour format "24-hour"
    When the hour format becomes "12-hour" and the rows are presented
    Then at most one formatter per time zone and label kind in use is built
