Feature: Wall-time input in a real browser
  Implements change add-wall-time-input-with-hint.
  The time of a row opens a text field with a numeric keyboard; keys stay in the
  field, the hint is a polite status and the card keeps its size.

  Background:
    Given the current time is "2026-03-08T07:30:00Z"

  @add-wall-time-input-with-hint @FR1
  Scenario: Open the field
    Given the stored locations are "Almaty", "New York"
    And the user opens the locations app
    When the user opens the wall-time input of "New York"
    Then the wall-time field of "New York" holds "03:30", fully selected

  @add-wall-time-input-with-hint @FR5
  Scenario: Cancel
    Given the stored locations are "Almaty", "New York"
    And the user opens the locations app
    And the user opens the wall-time input of "New York"
    When the user presses Escape in the wall-time field
    Then the time button of "New York" has the focus
    And the card of "New York" shows the time "03:30"

  @add-wall-time-input-with-hint @NFR-A4 @NFR-A2 @UX2
  Scenario: Keyboard-only input
    Given the stored locations are "Almaty", "New York"
    And the user opens the locations app
    When the user types "1040" in the wall-time input of "New York" with the keyboard only
    Then the card of "New York" shows the time "10:40"
    And the time button of "New York" has the focus
    And the cards are in the order "Almaty", "New York"
    And the page did not scroll
    And the wall-time field requests a numeric keyboard

  @add-wall-time-input-with-hint @NFR-A4 @FR3
  Scenario: Tab confirms the field
    Given the stored locations are "Almaty", "New York"
    And the user opens the locations app
    And the user opens the wall-time input of "New York"
    When the user types "1040" and presses Tab
    Then the card of "New York" shows the time "10:40"
    And the Now button is shown

  @add-wall-time-input-with-hint @NFR-A2 @FR11
  Scenario: Names in both languages
    Given the locations interface language is Russian
    And the stored locations are "Moscow"
    When the user opens the locations app
    Then the time button of "Moscow" is named "Ввести время — Moscow, 10:30"

  @add-wall-time-input-with-hint @NFR-A1 @NFR-A3 @UX1
  Scenario Outline: No accessibility violations of <state> in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the stored locations are "Almaty", "New York"
    And the user opens the locations app
    When the page shows <state>
    Then the locations screen has no accessibility violations

    Examples:
      | state               | theme |
      | the time buttons    | light |
      | the time buttons    | dark  |
      | an open field       | light |
      | an open field       | dark  |
      | a field with an error | light |
      | a field with an error | dark  |
      | a GAP hint          | light |
      | a GAP hint          | dark  |
      | an AMBIGUOUS hint   | light |
      | an AMBIGUOUS hint   | dark  |

  @add-wall-time-input-with-hint @NFR-A1 @NFR-A3 @UX1
  Scenario: Time button and hint are accessible
    Given the stored locations are "Almaty", "New York"
    And the user opens the locations app
    Then the time button of "New York" is at least 44 by 44 px
    And the time button of "New York" shows a focus outline
    And the time button of "New York" has the text cursor
    When the page shows a GAP hint
    Then the hint is a status outside any live region with no time in it

  @add-wall-time-input-with-hint @NFR-R1 @UX3
  Scenario Outline: No horizontal scrolling at <width> px
    Given the screen is <width> px wide for the locations
    And the stored locations are "Almaty", "New York"
    And the user opens the locations app
    And the page shows a GAP hint
    When the user opens the wall-time input of "Almaty"
    Then the locations screen does not scroll horizontally
    And the card of "Almaty" keeps its size
    And the hint sits below the place column and above the day track

    Examples:
      | width |
      | 320   |
      | 2560  |

  @add-wall-time-input-with-hint @FR13
  Scenario: Tap opens the field without Pointer Events
    Given the engine has no Pointer Events
    And the stored locations are "Almaty", "New York"
    And the user opens the locations app
    When the user taps the time of "New York"
    Then the wall-time input of "New York" is open
