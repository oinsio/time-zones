Feature: Day colouring of the day tracks
  Implements change add-day-colouring-setting.
  As a user I see my day tracks coloured plainly, by the time of day or by my working hours.

  @add-day-colouring-setting @FR2
  Scenario: Time of day by default
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    When the user opens the app
    Then the colour stops of "Almaty" are "0.270833 night, 0.3125 morning, 0.369792 morning, 0.380208 work, 0.744792 work, 0.755208 evening, 0.895833 evening, 0.9375 night"
    And the colour stops of "New York" are "0.161458 work, 0.171875 evening, 0.3125 evening, 0.354167 night, 0.645833 night, 0.6875 morning, 0.744792 morning, 0.755208 work"

  @add-day-colouring-setting @FR3 @FR9
  Scenario: Changing the colouring keeps the moment
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-09T06:00:00Z"
    And the list contains "Almaty"
    And the app is open
    And the moment is pinned to "2026-03-09T06:00:00Z"
    When the user chooses the Plain colouring
    Then the moment is still pinned to "2026-03-09T06:00:00Z"
    And the colour stops of "Almaty" are "0 plain"

  @add-day-colouring-setting @FR9
  Scenario: A plain track
    Given the day colouring is Plain
    And the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    When the user opens the app
    Then the colour stops of "Almaty" are "0 plain"
    And the colour stops of "New York" are "0 plain"

  @add-day-colouring-setting @FR8 @FR10
  Scenario Outline: Each location reads the working hours in its own time
    Given the working hours are 10:00-18:00
    When working time is read for <city> at <instant>
    Then it is <working>

    Examples:
      | city   | instant                | working          |
      | Moscow | 2026-03-09T07:00:00Z   | working time     |
      | Tokyo  | 2026-03-09T07:00:00Z   | working time     |
      | Moscow | 2026-03-09T06:59:00Z   | not working time |
      | Tokyo  | 2026-03-09T09:00:00Z   | not working time |

  @add-day-colouring-setting @FR8
  Scenario: Weekends are never working time
    Given the working hours are 10:00-18:00
    When working time is read for Moscow at 2026-03-14T09:00:00Z
    Then it is not working time

  @add-day-colouring-setting @FR8 @FR13
  Scenario Outline: Working-time stops on a Monday
    Given the day colouring is Working hours with <hours>
    And the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-09T06:00:00Z"
    And the list contains "Almaty, Moscow, New York"
    When the user opens the app
    Then the colour stops of <city> are <stops>

    Examples:
      | hours       | city       | stops                                                                              |
      | 10:00-18:00 | "Almaty"   | 0.416667 non-working, 0.416667 working, 0.75 working, 0.75 non-working            |
      | 09:07-18:00 | "Almaty"   | 0.379861 non-working, 0.379861 working, 0.75 working, 0.75 non-working            |
      | 10:00-18:00 | "Moscow"   | 0.5 non-working, 0.5 working, 0.833333 working, 0.833333 non-working              |
      | 10:00-18:00 | "New York" | 0.791667 non-working, 0.791667 working                                             |

  @add-day-colouring-setting @FR8 @FR15
  Scenario: Friday still works where Saturday has not begun
    Given the day colouring is Working hours with 10:00-18:00
    And the device time zone is "Europe/Moscow"
    And the current instant is "2026-03-14T09:00:00Z"
    And the list contains "Moscow, New York"
    When the user opens the app
    Then the colour stops of "Moscow" are "0 non-working"
    And the colour stops of "New York" are "0.041667 working, 0.041667 non-working"

  @add-day-colouring-setting @FR8 @FR16
  Scenario: Working time after a clock change
    Given the day colouring is Working hours with 10:00-18:00
    And the device time zone is "Asia/Almaty"
    And the current instant is "2026-04-24T06:00:00Z"
    And the list contains "Cairo"
    When the user opens the app
    Then the colour stops of "Cairo" are "0.5 non-working, 0.5 working, 0.833333 working, 0.833333 non-working"
