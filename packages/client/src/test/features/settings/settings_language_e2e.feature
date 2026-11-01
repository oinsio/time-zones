Feature: Interface language choice in a real browser
  Implements change add-interface-language-selection.
  As a user I choose the interface language on the settings page with a mouse,
  a finger or the keyboard; it applies at once and is kept on the device.

  @add-interface-language-selection @FR1 @FR2 @FR11
  Scenario: Collapsed group
    Given the user opens the settings
    Then the language group follows the hour format group
    And the language button reads "🇺🇸 English"
    And no language list is shown

  @add-interface-language-selection @FR2 @FR3 @FR4 @UX2
  Scenario: Expand and collapse
    Given the user opens the settings
    When the user expands the language group
    Then the language rows read "🇺🇸 English" and "🇷🇺 Русский"
    And "English" is marked as chosen
    And the language list sits right under the language button
    When the user activates the language button
    Then no language list is shown

  @add-interface-language-selection @FR5 @M2 @UX3
  Scenario: Choosing Russian applies at once
    Given the user opens the settings
    When the user chooses the language "Русский" and counts the page navigations
    Then the page did not navigate and did not scroll
    And the settings heading is "Настройки"
    And the locations page language is "ru"
    And the language button reads "🇷🇺 Русский"

  @add-interface-language-selection @FR7
  Scenario: The language survives a reload
    Given the user opens the settings
    When the user chooses the language "Русский" and counts the page navigations
    And the preferences are stored
    And the user reloads the app
    Then the locations page language is "ru"
    And the locations document title reads "Часовые пояса"

  @add-interface-language-selection @FR8
  Scenario: Legacy key without a document
    Given the locations interface language is Russian
    And the user opens the settings
    Then the locations page language is "ru"
    And no preferences document is stored

  @add-interface-language-selection @FR5
  Scenario: The language changes while the app is open
    Given the user opens the settings
    When the user chooses the language "Русский" and counts the page navigations
    Then the locations document title reads "Часовые пояса"
    And the locations page language is "ru"

  @add-interface-language-selection @NFR-A1
  Scenario: Name and state of the button
    Given the user opens the settings
    Then the language button is named "Language: English" and collapsed
    When the user expands the language group
    Then the language button is named "Language: English" and expanded

  @add-interface-language-selection @NFR-A2
  Scenario: Choosing with the keyboard
    Given the user opens the settings
    When the user expands the language group
    And the user presses the key "Tab"
    And the user presses the key "ArrowDown"
    And the user presses the key "Enter"
    Then the locations page language is "ru"
    And the focus is on the language button named "Язык: Русский"
    And no language list is shown

  @add-interface-language-selection @NFR-A2
  Scenario: Escape collapses first
    Given the user opens the settings
    When the user expands the language group
    And the user presses the key "Escape"
    Then no language list is shown
    And the focus is on the language button
    And the settings page is shown
    When the user presses the key "Escape"
    Then the focus is on the settings button

  @add-interface-language-selection @NFR-A3 @M3
  Scenario Outline: No violations with the language <state> in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the user opens the settings
    When the language group is <state>
    Then the locations screen has no accessibility violations
    And the language button and every row are at least 44 px high

    Examples:
      | theme | state     |
      | light | collapsed |
      | light | expanded  |
      | dark  | collapsed |
      | dark  | expanded  |

  @add-interface-language-selection @NFR-R1
  Scenario: Same width as the other groups
    Given the user opens the settings
    Then the language group is as wide as the theme group

  @add-interface-language-selection @NFR-R1
  Scenario Outline: Narrow and wide screens with the list expanded
    Given the screen is <width> px wide for the locations
    And the user opens the settings
    When the user expands the language group
    Then the settings page needs no horizontal scrolling
    And the language group is as wide as the theme group

    Examples:
      | width |
      | 320   |
      | 2560  |

  @add-interface-language-selection @NFR-R2 @M7
  Scenario Outline: Approved language screenshots in the <theme> theme with the list <state>
    Given the locations screen uses the <theme> theme
    And the screen is 375 px wide for the locations
    And the user opens the settings
    When the language group is <state>
    Then the locations screen matches the approved screenshot

    Examples:
      | theme | state     |
      | light | collapsed |
      | light | expanded  |
      | dark  | collapsed |
      | dark  | expanded  |
