Feature: Day colouring persistence
  Implements change add-day-colouring-setting.
  As a user my colouring and working hours are stored, survive a reload and follow me across tabs.

  @add-day-colouring-setting @FR3 @FR7
  Scenario: Colouring and working hours survive a reload
    Given the list contains "Almaty"
    And the user chose the colouring "Working hours" and confirmed 09:07-17:30
    When the app is opened again
    Then the colouring "Working hours" is checked and the fields show "09:07" and "17:30"
    And the Almaty track shows the Working hours colouring from the first render

  @add-day-colouring-setting @FR3 @M1
  Scenario Outline: Each colouring is kept and shared
    Given the list contains "Almaty"
    And the app is open in two tabs with the colouring <other>
    When the user chooses <colouring> in the first tab
    Then the second tab has <colouring> checked without a reload
    And when the app is opened again <colouring> is checked

    Examples:
      | colouring     | other           |
      | "Plain"       | "Time of day"   |
      | "Time of day" | "Working hours" |
      | "Working hours" | "Plain"       |

  @add-day-colouring-setting @FR7
  Scenario: Working hours are kept across colourings
    Given the user chose the colouring "Working hours" and confirmed 09:07-17:30
    When the user chooses the colouring "Time of day"
    And the user chooses the colouring "Working hours"
    Then the fields show "09:07" and "17:30"

  @add-day-colouring-setting @FR2
  Scenario: Existing users get Time of day
    Given the stored preferences document was written before the day colouring existed, with the theme "Dark", the hour format "12-hour", the language "ru", the view "Grid" and only the UTC offset in the zone label
    When the settings page is shown
    Then the day colouring is Time of day and the working hours are 10:00-18:00
    And the theme "Dark", the hour format "12-hour", the language "ru" and the view "Grid" are kept
    And the stored document is not rewritten until the user changes a setting

  @add-day-colouring-setting @FR7
  Scenario: A broken stored range is unreadable
    Given the stored preferences hold the working hours 18:00-10:00
    When the settings page is shown
    Then the settings page shows the unreadable note
    And the day colouring Time of day is in force

  @add-day-colouring-setting @FR3
  Scenario: Another tab changes the colouring
    Given the list contains "Almaty"
    And the app is open in two tabs with the colouring "Time of day"
    When the user chooses "Plain" in the first tab
    Then the second tab shows a plain Almaty track without a reload

  @add-day-colouring-setting @FR7
  Scenario: Another tab changes the working hours
    Given the app is open in two tabs with the colouring "Working hours"
    When the user confirms 09:00-17:00 in the first tab
    Then the second tab shows the fields "09:00" and "17:00" without a reload
