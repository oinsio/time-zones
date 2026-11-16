Feature: Day-period colours and labels of a day track
  Implements change add-time-sliders-to-location-cards and bind-day-periods-to-sun.
  As a user I read the time of day of each location from its track colours and hour labels.

  @bind-day-periods-to-sun @FR5
  Scenario Outline: Colour stops of Almaty and New York
    Given the day colouring is Time of day and the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    When the user opens the app
    Then the colour stops of <city> change period, in order, around <boundaries> in the time of Asia/Almaty
    And each pair of stops is 30 minutes apart and centred within 3 minutes of that time

    Examples:
      | city     | boundaries                                                                                    |
      | Almaty   | night to morning 05:48, morning to day 06:55, day to evening 17:11, evening to night 18:18    |
      | New York | day to evening 03:17, evening to night 04:21, night to morning 15:51, morning to day 16:55    |

  @bind-day-periods-to-sun @FR5
  Scenario: Colours follow the day period outside blend windows
    Given the day colouring is Time of day and the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    And the app is open
    When the colour of the tracks is read at each quarter-hour position outside a blend window
    Then it is the colour of that location's day period at that instant

  @bind-day-periods-to-sun @FR5 @UX1 @M6
  Scenario: Morning and evening are visible bands
    Given the day colouring is Time of day and the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Moscow"
    When the user opens the app
    Then the morning band of Moscow is between 3% and 7% of the track

  @bind-day-periods-to-sun @FR5
  Scenario: A blend window stops at the midpoint
    Given two day-period boundaries 20 minutes apart inside the reference day
    When the colour stops are assembled
    Then the blend windows of the two boundaries meet at the midpoint between them and do not overlap

  @bind-day-periods-to-sun @FR5 @FR9
  Scenario: A clock change makes no colour edge
    Given the day colouring is Time of day and the device time zone is "America/New_York"
    And the current instant is "2026-03-08T16:00:00Z"
    And the list contains "New York"
    And the app is open
    And the moment is pinned at its current position
    When the track of New York is presented
    Then no two colour stops stand at the position of the clock change
    And the stops are those of the four day-period boundaries of that day

  @bind-day-periods-to-sun @FR2 @FR5 @UX3
  Scenario Outline: A polar track is one colour
    Given the day colouring is Time of day and the device time zone is "UTC"
    And the current instant is <instant>
    And the list contains "Longyearbyen"
    When the user opens the app
    Then the whole track of Longyearbyen is the <colour> colour

    Examples:
      | instant              | colour   |
      | 2026-06-21T12:00:00Z | daylight |
      | 2026-12-21T12:00:00Z | night    |

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

