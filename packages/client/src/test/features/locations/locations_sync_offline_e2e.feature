Feature: Locations across tabs and offline in a real browser
  Implements change add-locations-via-search.
  The list follows other tabs and works offline.

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
