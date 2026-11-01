Feature: Clock change note for the nearest, partial and permanent changes
  Implements change show-clock-change-note-on-location-cards.
  As a user I see the nearest clock change, its amount and permanent offset changes on a location row.

  @show-clock-change-note-on-location-cards @FR4
  Scenario: Nearest of two changes
    Given the interface language is "Russian"
    And the hour format is "24-hour"
    And the device time zone is "UTC" and no home location is set
    And the list contains "Boa Vista", whose offset changed on "2000-10-08T04:00:00Z" from -4 h to -3 h and on "2000-10-15T03:00:00Z" from -3 h to -4 h
    When the reference moment is pinned to "2000-10-10T12:00:00Z"
    Then the "Boa Vista" row shows the clock change note "8 окт. в 00:00 часы переведены на 1 ч вперёд"
    When the reference moment is then pinned to "2000-10-13T12:00:00Z"
    Then the "Boa Vista" row now shows the clock change note "15 окт. в 00:00 часы переведут на 1 ч назад"

  @show-clock-change-note-on-location-cards @FR2 @FR8
  Scenario: A change of 30 minutes
    Given the device time zone is "Europe/Belgrade" and no home location is set
    And the list contains "Lord Howe Island"
    When the reference moment is pinned to "2026-10-01T09:00:00Z"
    Then in "Russian" the "Lord Howe Island" row shows "4 окт. в 02:00 часы переведут на 30 мин вперёд"
    And in "English" it shows "On Oct 4 at 02:00 clocks will go forward 30 min"

  @show-clock-change-note-on-location-cards @FR2
  Scenario: A permanent change of the offset
    Given the interface language is "Russian"
    And the hour format is "24-hour"
    And the device time zone is "Asia/Almaty" and no home location is set
    And the list contains "Almaty"
    When the reference moment is pinned to "2024-03-01T06:00:00Z"
    Then the "Almaty" row shows the clock change note "1 мар. в 00:00 часы переведены на 1 ч назад"
