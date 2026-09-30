Feature: Location search ranking and suggestions
  As a user I see the most likely place first, and suggestions before I type

  @add-locations-via-search @FR5 @UX3
  Scenario: Abbreviation before city prefix
    When the user searches for "IST"
    Then "Istanbul" appears after "Kolkata", "Jerusalem" and "Dublin"

  @add-locations-via-search @FR5
  Scenario: City before country
    Given a city whose name starts with the query and a country whose name starts with the query
    When the user searches for "Mon"
    Then "Montevideo" is listed before every result of the country "MN"

  @add-locations-via-search @FR5
  Scenario: One entry per zone
    When the user searches for "Kazakhstan"
    Then every zone appears once

  @add-locations-via-search @FR5
  Scenario: Result limit
    When the user searches for "a"
    Then at most 50 results are shown

  @add-locations-via-search @FR6 @UX1
  Scenario: Search opened
    When the user opens the search
    Then popular locations are shown as suggestions

  @add-locations-via-search @FR6 @UX1
  Scenario: Query cleared
    Given the user typed "Mos"
    When the user clears the query
    Then popular locations are shown as suggestions

  @add-locations-via-search @FR7 @UX1
  Scenario: Nothing found
    When the user searches for "qqqq"
    Then there are no results

  @add-locations-via-search @FR7 @UX1
  Scenario: Offsets are not a search input
    When the user searches for "UTC+5"
    Then there are no results
