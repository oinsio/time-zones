Feature: Locations persistence
  Implements change add-locations-via-search.
  As a user I find my list again when I come back, and every open tab agrees

  @add-locations-via-search @FR11 @UX4
  Scenario: List survives a reload
    Given the user added "Almaty", then "Moscow"
    When the app is opened again
    Then the list is "Almaty", "Moscow" in that order

  @add-locations-via-search @FR11
  Scenario: First launch writes nothing
    When the user opens the app for the first time and adds nothing
    Then no list document is stored

  @add-locations-via-search @FR9
  Scenario: Legacy identifier is canonicalized on load
    Given the stored list holds "Kolkata" in "Asia/Calcutta"
    When the app is opened
    Then the list holds "Kolkata" in "Asia/Kolkata"

  @add-locations-via-search @FR12
  Scenario Outline: Unreadable stored list
    Given the stored list is <document>
    When the app is opened
    Then the list is reported as unreadable

    Examples:
      | document                         |
      | not valid JSON                   |
      | written by a newer version       |
      | holding a location in "+05:00"   |

  @add-locations-via-search @FR12
  Scenario: Reset
    Given the stored list is not valid JSON
    And the app is opened
    When the user resets the list
    Then the list is empty
    And no list document is stored

  @add-locations-via-search @FR14
  Scenario: Added in another tab
    Given the app is open in two tabs with the same list
    When the user adds "Moscow" in the first tab
    Then the second tab shows "Moscow" without a reload

  @add-locations-via-search @FR14
  Scenario: Removed in another tab
    Given the app is open in two tabs and both show "Moscow"
    When the user removes "Moscow" in the second tab
    Then the first tab no longer shows "Moscow"
