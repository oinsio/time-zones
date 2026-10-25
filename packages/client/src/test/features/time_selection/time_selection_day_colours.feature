Feature: Day-period colours and labels of a day track
  Implements change add-time-sliders-to-location-cards.
  As a user I read the time of day of each location from its track colours and hour labels.

  @add-time-sliders-to-location-cards @FR6 @M5
  Scenario Outline: Colour stops of Almaty and New York
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    When the user opens the app
    Then the colour stops of <city> are <stops>

    Examples:
      | city       | stops                                                                                                                                          |
      | Almaty   | 0.270833 night, 0.3125 morning, 0.369792 morning, 0.380208 working, 0.744792 working, 0.755208 evening, 0.895833 evening, 0.9375 night         |
      | New York | 0.161458 working, 0.171875 evening, 0.3125 evening, 0.354167 night, 0.645833 night, 0.6875 morning, 0.744792 morning, 0.755208 working         |

  @add-time-sliders-to-location-cards @FR6 @M5
  Scenario: Colours follow the local period outside blend windows
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    And the app is open
    When the colour of the tracks is read at each quarter-hour position outside a blend window
    Then it is the colour of the period of that location's local time at that instant

  @add-time-sliders-to-location-cards @FR6
  Scenario: Boundaries of a skipped local date are left out
    Given the device time zone is "UTC"
    And the current instant is "2011-12-30T12:00:00Z"
    And the list contains "Apia"
    And the app is open
    And the moment is pinned at its current position
    When the track of Apia is presented
    Then the colour stops of "Apia" are "0.161458 working, 0.171875 evening, 0.3125 evening, 0.354167 night, 0.6875 night, 0.729167 morning, 0.786458 morning, 0.796875 working"

  @add-time-sliders-to-location-cards @FR6
  Scenario: A period change across an offset change is a hard edge
    Given an offset change inside the reference day at the position 0.5
    And the local time is in the evening just before it and in the night just after it
    When the colour stops are assembled
    Then two stops at 0.5 change from evening to night, with no blend between them

  @add-time-sliders-to-location-cards @FR7 @M6
  Scenario Outline: Hour labels of four zones
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, Moscow, Kolkata, New York"
    When the list is presented
    Then the hour labels of <city> are <labels>

    Examples:
      | city       | labels                        |
      | Almaty   | 00 06 12 18 00                |
      | Moscow   | 22 04 10 16 22                |
      | Kolkata  | 00:30 06:30 12:30 18:30 00:30 |
      | New York | 14 20 03 09 15                |

  @add-time-sliders-to-location-cards @FR9 @NFR-A3
  Scenario Outline: Slider name and value in both languages
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    When the interface language is <language>
    Then the Almaty slider is named <name> with the value text <value>

    Examples:
      | language  | name              | value              |
      | en      | Time in Almaty    | 12:30, Sun, Mar 8  |
      | ru      | Время — Almaty    | 12:30, вс, 8 мар.  |

