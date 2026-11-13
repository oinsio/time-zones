Feature: Settings view mode
  Implements change add-view-mode-setting-and-grid-skeleton.
  The user chooses the view in the settings; the choice is kept on the device and never follows the screen.

  @add-view-mode-setting-and-grid-skeleton @FR2 @FR3
  Scenario: Cards by default
    Given no preferences document is stored
    When the user opens the app and the settings page
    Then the main page showed the Cards view
    And the view group has the options "Cards" and "Grid", in this order, with "Cards" checked

  @add-view-mode-setting-and-grid-skeleton @FR4
  Scenario: Choosing Grid
    Given the stored locations are Almaty and Moscow
    When the user chooses the view "Grid"
    Then the main page shows the Grid view with Almaty and Moscow

  @add-view-mode-setting-and-grid-skeleton @FR3 @FR4
  Scenario: A stored view that is not registered
    Given the stored preferences hold the view mode "timeline", which no registered view has
    When the app is opened
    Then the main page shows the Cards view
    And the view group checks "Cards"

  @add-view-mode-setting-and-grid-skeleton @FR2
  Scenario: A newly registered view appears in the settings
    Given a test view titled "Sample" is added to the registry after Grid
    When the settings page is shown
    Then the view group has the options "Cards", "Grid" and "Sample", in this order

  @add-view-mode-setting-and-grid-skeleton @FR4
  Scenario: The view survives a reload
    Given the user chose the view "Grid"
    When the app is opened again
    Then the main page shows the Grid view from its first render
    And the view group checks "Grid"

  @add-view-mode-setting-and-grid-skeleton @FR3 @FR4 @add-country-to-zone-label @FR6
  Scenario: Existing users get Cards
    Given the stored preferences document was written before the view mode existed, with the theme Dark, the hour format 12-hour, the language "ru" and only the UTC offset in the zone label
    When the app is opened
    Then the main page shows the Cards view and the view group checks "Карточки"
    And the theme Dark, the hour format 12-hour, the language "Русский" and the zone label with the country and the UTC offset are in force
    And the stored document is not rewritten until the user changes a setting

  @add-view-mode-setting-and-grid-skeleton @FR4
  Scenario: Another tab changes the view
    Given the app is open in two tabs, both showing Cards
    When the user chooses the view "Grid" in the first tab
    Then the second tab shows the Grid view without a reload

  @add-view-mode-setting-and-grid-skeleton @FR3
  Scenario: A view mode of the wrong type
    Given the stored preferences document of the current version holds the view mode 42 as a number
    When the user opens the app and the settings page
    Then the main page was shown with the Cards view
    And the settings page shows the note with a Reset action
