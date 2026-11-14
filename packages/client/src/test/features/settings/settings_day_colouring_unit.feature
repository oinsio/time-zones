Feature: Day colouring settings
  Implements change add-day-colouring-setting.
  As a user I choose how my day tracks and hour cells are coloured.

  @add-day-colouring-setting @FR1 @FR2
  Scenario: Time of day by default
    Given no preferences are stored
    When the settings page is shown
    Then the colouring group follows the view group
    And the colouring options are "Plain", "Time of day" and "Working hours" in this order with "Time of day" checked

  @add-day-colouring-setting @FR3
  Scenario: Choosing a colouring applies at once
    Given the list contains "Almaty"
    And the settings page is shown
    When the user chooses the colouring "Plain"
    Then the Almaty track is plain
    And the stored document is not rewritten before the debounce

  @add-day-colouring-setting @FR4 @FR6
  Scenario: The row follows the colouring
    Given the settings page is shown
    Then there is no working hours row
    When the user chooses the colouring "Working hours"
    Then the working hours row shows "10:00" and "18:00" directly under the colouring group
    When the user switches to the colouring "Plain"
    Then the working hours row is absent again

  @add-day-colouring-setting @FR15
  Scenario Outline: Both languages of the colouring settings
    Given the interface language is <language>
    And the colouring "Working hours" is stored
    When the settings page is shown
    Then the colouring group is <colouring> with the options <plain>, <time of day> and <working>
    And the working hours row is <row> with the fields <start> and <end>

    Examples:
      | language | colouring  | plain   | time of day      | working             | row           | start                  | end                  |
      | en       | Colouring  | Plain   | Time of day      | Working hours       | Working hours | Start of working hours | End of working hours |
      | ru       | Раскраска  | Обычная | По времени суток | По рабочему времени | Рабочие часы  | Начало рабочего дня    | Конец рабочего дня   |
