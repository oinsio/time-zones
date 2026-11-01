Feature: City label in the interface language in the browser
  Implements change show-city-labels-in-interface-language.
  As a user I read every city in the language of the interface after I switch
  it, in texts and in the accessible names.

  @show-city-labels-in-interface-language @FR2 @M1
  Scenario: Switching relabels the row
    Given the locations interface language is Russian
    And the stored locations are "Токио"
    And the user opens the locations app
    And the stored locations document is recorded
    When the user switches the interface language to "English"
    Then the card reads "Tokyo"
    When the user switches the interface language to "Русский"
    Then the card reads "Токио"
    And the stored locations document is unchanged

  @show-city-labels-in-interface-language @FR3 @NFR-A1
  Scenario: Texts that name the city follow
    Given the locations interface language is Russian
    And the stored locations are "Токио"
    And the user opens the locations app
    When the user switches the interface language to "English"
    Then the location menu button is named "Actions for Tokyo"
    And the time button's name starts with "Enter time — Tokyo"

  @show-city-labels-in-interface-language @NFR-A1 @M5
  Scenario Outline: Accessible after a switch in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the locations interface language is Russian
    And the stored locations are "Токио"
    And the user opens the locations app
    When the user switches the interface language to "English"
    Then the location menu button is named "Actions for Tokyo"
    And the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @show-city-labels-in-interface-language @FR4 @M2
  Scenario: One request for city labels and the search
    Given the stored locations are "Tokyo"
    When the user opens the locations app
    Then the page has requested the search data exactly 1 time
    When the user opens the search
    Then the suggestions are shown
    And the page has requested the search data exactly 1 time
