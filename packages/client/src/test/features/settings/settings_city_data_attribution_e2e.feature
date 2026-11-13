Feature: City data attribution on the settings page in a real browser
  Implements change add-geonames-city-source.
  As a user I see at the bottom of the settings page where the city data comes from, and I can follow the link to GeoNames.

  @add-geonames-city-source @FR13 @UX4
  Scenario Outline: The attribution in both languages
    Given the locations interface language is <language>
    And the user opens the settings
    Then the settings page shows the link "<attribution>" to GeoNames

    Examples:
      | language | attribution                          |
      | English  | City data: GeoNames, CC BY 4.0       |
      | Russian  | Данные о городах: GeoNames, CC BY 4.0 |

  @add-geonames-city-source @FR13 @UX4
  Scenario: Following the attribution keeps the app
    Given the current time is "2026-03-09T07:30:00Z"
    And the stored locations are "Moscow"
    And the user opens the locations app
    And the user opens the settings
    When the user follows the city data attribution
    Then a new tab opens at the GeoNames home page
    And the settings page is still shown
    When the user goes back from the settings
    Then the time of "Moscow" reads "10:30"

  @add-geonames-city-source @FR13
  Scenario: The attribution offline
    Given requests to geonames.org are recorded
    And the stored locations are "Moscow"
    And the user opens the locations app
    And the app is installed for offline use
    When the user reopens the locations app without network
    And the user opens the settings
    Then the city data attribution is "City data: GeoNames, CC BY 4.0"
    And no request to geonames.org was made

  @add-geonames-city-source @NFR-A2 @UX4
  Scenario: Keyboard order and focus
    Given the locations interface language is English
    And the user opens the settings
    When the user tabs to the city data attribution
    Then the city data attribution has the focus
    And the city data attribution is at least 44 px high
    And the city data attribution is the last Tab stop

  @add-geonames-city-source @NFR-A2
  Scenario Outline: No violations in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the user opens the settings
    Then the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @add-geonames-city-source @NFR-R2 @UX4
  Scenario Outline: The full attribution at <width> px in <language>
    Given the screen is <width> px wide for the locations
    And the locations interface language is <language>
    And the user opens the settings
    Then the settings page needs no horizontal scrolling
    And the city data attribution text is shown in full

    Examples:
      | width | language |
      | 320   | English  |
      | 320   | Russian  |
      | 2560  | English  |
      | 2560  | Russian  |
