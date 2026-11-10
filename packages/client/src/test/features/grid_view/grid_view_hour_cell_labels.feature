Feature: Hour cell labels of the Grid view
  Implements change add-grid-hour-cells-and-hour-frame.
  As a user I read the local hour, the date change and the clock change of every location from its hour strip.

  @add-grid-hour-cells-and-hour-frame @FR3
  Scenario Outline: Local start hours of the sample day
    Given the reference zone is "Asia/Almaty", the current time is "2026-03-08T07:30:00Z" and the hour format is 24-hour
    When the hour cells are presented
    Then column <column> of <city> shows <label>

    Examples:
      | city     | column | label |
      | Almaty   | 0      | 0     |
      | Almaty   | 9      | 9     |
      | Moscow   | 0      | 22    |
      | Kolkata  | 23     | 23:30 |
      | New York | 11     | 1     |
      | New York | 12     | 3     |

  @add-grid-hour-cells-and-hour-frame @FR3
  Scenario: Quarter-hour zone
    Given the reference zone is "Asia/Almaty" and the reference day is 2026-03-08
    When the hour cells of Kathmandu are presented
    Then column 0 is its midnight cell and column 1 shows "1:45"

  @add-grid-hour-cells-and-hour-frame @FR3
  Scenario: 12-hour format
    Given the reference zone is "Asia/Almaty", the reference day is 2026-03-08, the interface language is English and the hour format is 12-hour
    When the hour cells of Almaty are presented
    Then column 9 shows "9" with the marker "AM" and column 21 shows "9" with the marker "PM"

  @add-grid-hour-cells-and-hour-frame @FR5
  Scenario Outline: Midnight cells of the sample day
    Given the reference zone is "Asia/Almaty", the reference day is 2026-03-08 and the interface language is Russian
    When the hour cells are presented
    Then the midnight cell of <city> is column <column> with "МАР" over "8"

    Examples:
      | city     | column |
      | Moscow   | 2      |
      | Kolkata  | 0      |
      | New York | 10     |

  @add-grid-hour-cells-and-hour-frame @FR5
  Scenario: The reference zone's row starts with 0
    Given the reference zone is "Asia/Almaty" and the reference day is 2026-03-08
    When the hour cells of Almaty are presented
    Then column 0 shows "0" and no cell of Almaty is a midnight cell

  @add-grid-hour-cells-and-hour-frame @FR5
  Scenario: English month
    Given the reference zone is "Asia/Almaty", the reference day is 2026-03-08 and the interface language is English
    When the hour cells of Moscow are presented
    Then column 2 shows "MAR" over "8"

  @add-grid-hour-cells-and-hour-frame @FR6
  Scenario: New York moves its clocks forward
    Given the reference zone is "Asia/Almaty" and the reference day is 2026-03-08
    When the hour cells are presented
    Then New York's column 12 has the offset edge
    And no other cell of New York, Almaty, Moscow or Kolkata has one
