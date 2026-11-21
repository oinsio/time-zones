Feature: Share dialog in a real browser
  Implements change add-meeting-share-dialog.
  The share dialog is accessible by keyboard and screen reader, fits every screen width and keeps Share in view.

  Background:
    Given the locations interface language is Russian
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 390 by 844 px for the locations
    And a browser with a system share

  @add-meeting-share-dialog @FR1 @FR9
  Scenario Outline: Closing keeps the meeting
    Given the user opened the locations app with the sample meeting and the share dialog
    When the user closes the share dialog with <way>
    Then the share dialog is closed
    And the meeting range is from "09:00" to "11:00"
    And nothing was shared or copied

    Examples:
      | way              |
      | the close button |
      | Esc              |

  @add-meeting-share-dialog @FR2 @FR9 @NFR-A2
  Scenario: No location ticked
    Given the user opened the locations app with the sample meeting and the share dialog
    When the user unticks every location in the share dialog
    Then the share dialog shows the hint "Отметьте хотя бы одно место"
    And Share is inactive in the share dialog
    And Share cannot be activated by pointer or keyboard

  @add-meeting-share-dialog @NFR-A1
  Scenario: Focus enters and returns
    Given the user opened the locations app with the sample meeting
    When the user opens the share dialog with the keyboard
    Then the focus is inside the share dialog
    When the user presses Esc
    Then the focus is on Share meeting

  @add-meeting-share-dialog @NFR-A1 @FR9
  Scenario: Focus returns after a share
    Given a browser without a system share
    And the user opened the locations app with the sample meeting and the share dialog
    When the user chooses Share in the dialog
    Then the share dialog is closed
    And the focus is on Share meeting

  @add-meeting-share-dialog @NFR-A2 @NFR-A3
  Scenario: Controls announce their names and states
    Given the user opened the locations app with the sample meeting and the share dialog
    Then the dialog is a modal dialog named "Поделиться встречей"
    And each checkbox is named by its city label and is checked
    And the pin is a toggle button named "Запомнить язык приглашения" that is not pressed
    And "Аббревиатура" and "Смещение UTC" are in a group named "Обозначение часового пояса"
    And the preview is a region named "Текст приглашения" that is not a live region
    When the user unticks every location in the share dialog
    Then Share is inactive in the share dialog

  @add-meeting-share-dialog @FR4 @NFR-A1
  Scenario: Esc in the open language list
    Given the user opened the locations app with the sample meeting and the share dialog
    And the list of share languages is open
    When the user presses Esc
    Then the list of share languages is closed
    And the share dialog is still open
    And the focus is on the share language button

  @add-meeting-share-dialog @NFR-A1
  Scenario: Keyboard only
    Given the user opened the locations app with the sample meeting
    When the user opens the share dialog with the keyboard
    And the user unticks "Москва" with Space
    And the user moves to Share with Tab and presses Enter
    Then the shared text has no Moscow line

  @add-meeting-share-dialog @NFR-A2 @NFR-A3
  Scenario Outline: No accessibility violations in the <theme> theme at <width> px
    Given the locations screen uses the <theme> theme
    And the screen is <width> by 800 px for the locations
    And the user opened the locations app with the sample meeting and the share dialog
    Then the share dialog has no accessibility violations

    Examples:
      | theme | width |
      | light | 320   |
      | dark  | 320   |
      | light | 390   |
      | dark  | 390   |
      | light | 1280  |
      | dark  | 1280  |

  @add-meeting-share-dialog @UX3 @NFR-R2
  Scenario: Narrow phone
    Given the screen is 320 by 700 px for the locations
    And the user opened the locations app with the sample meeting and the share dialog
    Then the share dialog fills the screen and nothing scrolls horizontally
    And every pointer target of the share dialog is at least 44 px wide and 44 px high

  @add-meeting-share-dialog @UX1 @NFR-R1
  Scenario: Wide screen
    Given the screen is 1280 by 800 px for the locations
    And the user opened the locations app with the sample meeting and the share dialog
    Then the share dialog is centred and 512 px wide

  @add-meeting-share-dialog @UX1 @NFR-R2
  Scenario: A long list keeps Share in view
    Given the stored list holds 20 locations
    And the user opened the locations app with the sample meeting and the share dialog
    When the content of the share dialog is scrolled to the end
    Then Share is fully visible
    When the content of the share dialog is scrolled to the start
    Then Share is fully visible
