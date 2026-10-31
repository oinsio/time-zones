Feature: Gnomish Factory credit on the settings page in a real browser
  Implements change add-gnomish-factory-credit.
  As a user I see on the top line of the settings page that the app was built
  with the Gnomish Factory, and I can follow the link to its landing page.

  @add-gnomish-factory-credit @FR1 @FR2 @NFR-A1 @UX1
  Scenario Outline: The credit in both languages
    Given the locations interface language is <language>
    And the user opens the settings
    Then the first line of the settings page is the link "<credit>" to the Gnomish Factory
    And the credit stands above the back button and the settings heading

    Examples:
      | language | credit                             |
      | English  | Built with Gnomish Factory         |
      | Russian  | Создано с помощью Гномской фабрики |

  @add-gnomish-factory-credit @FR3 @UX3
  Scenario: Following the credit keeps the app
    Given the current time is "2026-03-09T07:30:00Z"
    And the stored locations are "Moscow"
    And the user opens the locations app
    And the user opens the settings
    When the user follows the Gnomish Factory credit
    Then a new tab opens at the Gnomish Factory landing page
    And the settings page is still shown
    When the user goes back from the settings
    Then the time of "Moscow" reads "10:30"

  @add-gnomish-factory-credit @FR3
  Scenario: The credit offline
    Given the stored locations are "Moscow"
    And the user opens the locations app
    And the app is installed for offline use
    When the user reopens the locations app without network
    And the user opens the settings
    Then the Gnomish Factory credit is "Built with Gnomish Factory"

  @add-gnomish-factory-credit @FR4 @UX2 @NFR-A1
  Scenario Outline: Token colours in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the user opens the settings
    Then the credit text has the muted foreground colour and is underlined
    When the credit gets the keyboard focus
    Then the credit text has the accent colour with an accent focus outline
    When the focus returns to the settings heading
    And the pointer rests on the credit
    Then the credit text has the accent colour

    Examples:
      | theme |
      | light |
      | dark  |

  @add-gnomish-factory-credit @FR4
  Scenario: The credit follows a theme change
    Given the system colour scheme is light
    And the user opens the settings
    When the system colour scheme becomes dark
    Then the credit text has the muted foreground colour and is underlined

  @add-gnomish-factory-credit @NFR-A1 @NFR-A2
  Scenario: Keyboard order and focus
    Given the locations interface language is English
    And the user opens the settings
    Then the focus is on the settings heading
    When the user presses Shift+Tab
    Then the focus is on the back button
    When the user presses Shift+Tab
    Then the credit has the focus
    And the credit is at least 44 px high
    When the user presses Enter
    Then a new tab opens at the Gnomish Factory landing page

  @add-gnomish-factory-credit @NFR-R1
  Scenario Outline: The full credit at <width> px in <language>
    Given the screen is <width> px wide for the locations
    And the locations interface language is <language>
    And the user opens the settings
    Then the settings page needs no horizontal scrolling
    And the credit text is shown in full

    Examples:
      | width | language |
      | 320   | English  |
      | 320   | Russian  |
      | 2560  | Russian  |
