Feature: Strip tail of the hour strips
  Implements change move-meeting-range-and-extend-past-midnight.
  As a user I see the hours after midnight of the reference zone when my meeting range reaches them.

  @move-meeting-range-and-extend-past-midnight @FR6
  Scenario Outline: Strip tail of a meeting past midnight
    Given the Grid view with Almaty, Moscow, Kolkata and New York on 2026-03-08, reference zone "Asia/Almaty"
    When the meeting range is <range> in Almaty
    Then every row has <count> hour cells, <tail> of them in the strip tail

    Examples:
      | range                       | count | tail |
      | 09:00–11:00                 | 24    | 0    |
      | 21:00–23:00                 | 24    | 0    |
      | 22:00–23:30                 | 25    | 1    |
      | 22:00–24:00                 | 25    | 1    |
      | 22:00–00:15 of the next day | 26    | 2    |
      | 23:00–02:00 of the next day | 27    | 3    |

  @move-meeting-range-and-extend-past-midnight @FR6
  Scenario: The tail goes away with the meeting
    Given the meeting range is 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty
    When the user chooses "Clear meeting"
    Then every row has 24 hour cells

  @move-meeting-range-and-extend-past-midnight @FR7
  Scenario Outline: Midnight cells of the strip tail
    Given the Grid view in Russian with the meeting range 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty
    When the hour cells are presented
    Then the cell of "<city>" in column <column> shows "МАР" over "9"

    Examples:
      | city     | column |
      | Almaty   | 24     |
      | Kolkata  | 24     |
      | Moscow   | 26     |

  @move-meeting-range-and-extend-past-midnight @FR7
  Scenario: Frame over the strip tail
    Given the meeting range is 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty
    When the main page is shown
    Then the meeting frame encloses columns 23, 24 and 25 of every row
    And column 26 and columns 0 to 22 are dimmed

  @move-meeting-range-and-extend-past-midnight @FR6 @NFR-P1
  Scenario: A growing tail presents only its cells
    Given the 50 rows and hour strips with the meeting range 21:00–23:00 in Almaty were presented
    When the end of the meeting range moves to 23:30
    Then one new hour cell per row is presented and no cell of the reference day is presented again
