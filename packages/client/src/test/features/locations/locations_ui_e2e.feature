Feature: Locations in a real browser
  Implements change add-locations-via-search.
  The search loads its data when it opens and says so when that fails, names
  and announces what it does, fits every screen, follows other tabs and works
  offline.

  @add-locations-via-search @FR15 @UX1
  Scenario: Data is loading
    Given the search data is slow to load
    And the user opens the locations app
    When the user opens the search
    Then the search shows that it is loading

  @add-locations-via-search @FR15 @UX1
  Scenario: Data failed to load
    Given the search data cannot be loaded
    And the user opens the locations app
    When the user opens the search
    Then the search shows the load error with Retry

  @add-locations-via-search @FR15
  Scenario: Retry
    Given the search data cannot be loaded
    And the user opens the locations app
    And the user opens the search
    And the page is marked
    When the search data becomes reachable
    And the user retries the search
    Then the suggestions are shown
    And the page is still marked

  @add-locations-via-search @NFR-P2
  Scenario: Data loads only when the search opens
    Given the user opens the locations app
    Then the page has not requested the search data
    When the user opens the search
    Then the page has requested the search data

  @add-locations-via-search @NFR-A3
  Scenario: Remove action names the city
    Given the stored locations are "Moscow"
    When the user opens the locations app
    Then the list offers the action "Remove Moscow"

  @add-locations-via-search @NFR-A3
  Scenario: Adding and removing are announced politely
    Given the stored locations are "Moscow"
    And the user opens the locations app
    When the user adds "Tokyo" from the search
    Then the polite announcement reads "Tokyo added"
    When the user removes "Moscow"
    Then the polite announcement reads "Moscow removed"

  @add-locations-via-search @NFR-A3 @FR5
  Scenario: Result order and content
    Given the user opens the locations app
    When the user searches for "IST"
    Then the first results are "Kolkata", "Jerusalem", "Dublin" in that order
    And the polite announcement reads "4 results"

  @add-locations-via-search @NFR-R1
  Scenario Outline: The list of 5 locations fits a <width> px wide screen
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "Tokyo", "New York"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the locations screen does not scroll horizontally

    Examples:
      | width |
      | 320   |
      | 2560  |

  @add-locations-via-search @NFR-R1
  Scenario Outline: The <state> state fits a <width> px wide screen
    Given the screen is <width> px wide for the locations
    And the user opens the locations app
    When the locations are in the <state> state
    Then the locations screen does not scroll horizontally

    Examples:
      | state          | width |
      | unreadable     | 320   |
      | unreadable     | 2560  |
      | search loading | 320   |
      | search loading | 2560  |
      | search error   | 320   |
      | search error   | 2560  |
      | suggestions    | 320   |
      | suggestions    | 2560  |
      | results        | 320   |
      | results        | 2560  |
      | no matches     | 320   |
      | no matches     | 2560  |

  @add-locations-via-search @NFR-R1
  Scenario: Phone layout
    Given the screen is 375 px wide for the locations
    And the user opens the locations app
    When the user opens the search
    Then the search fills the screen

  @add-locations-via-search @NFR-R1
  Scenario: Wide layout
    Given the screen is 1024 px wide for the locations
    And the user opens the locations app
    When the user opens the search
    Then the search is a centered dialog

  @add-locations-via-search @NFR-R2
  Scenario Outline: Screenshot of the <state> state at <width> px in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    When the locations are in the <state> state
    Then the locations screen matches the approved screenshot

    Examples:
      | state       | width | theme |
      | list        | 375   | light |
      | list        | 375   | dark  |
      | list        | 1024  | light |
      | list        | 1024  | dark  |
      | empty       | 375   | light |
      | empty       | 375   | dark  |
      | empty       | 1024  | light |
      | empty       | 1024  | dark  |
      | suggestions | 375   | light |
      | suggestions | 375   | dark  |
      | suggestions | 1024  | light |
      | suggestions | 1024  | dark  |
      | IST results | 375   | light |
      | IST results | 375   | dark  |
      | IST results | 1024  | light |
      | IST results | 1024  | dark  |

  @add-locations-via-search @FR14
  Scenario: Added in another tab
    Given the stored locations are "Moscow"
    And the app is open in two tabs
    When the user adds "Tokyo" from the search
    Then the other tab shows "Tokyo" without a reload

  @add-locations-via-search @FR14
  Scenario: Removed in another tab
    Given the stored locations are "Moscow", "Tokyo"
    And the app is open in two tabs
    When the user removes "Moscow"
    Then the other tab no longer shows "Moscow" without a reload

  @add-locations-via-search @FR16
  Scenario: Offline reopen
    Given the stored locations are "Moscow"
    And the service worker controls the locations app
    When the user reopens the locations app without network
    Then the locations list shows "Moscow"

  @add-locations-via-search @FR16
  Scenario: Offline search
    Given the service worker controls the locations app
    And the network is gone
    When the user adds "Tokyo" from the search
    Then the locations list shows "Tokyo"
