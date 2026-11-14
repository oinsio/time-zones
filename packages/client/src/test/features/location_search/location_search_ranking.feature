Feature: Location search ranking and suggestions
  As a user I see the most likely place first, and suggestions before I type

  @add-locations-via-search @FR5 @UX3 @show-zone-abbreviations-and-zone-label-setting @FR11
  Scenario: Abbreviation before city prefix
    When the user searches for "IST"
    Then "Istanbul" appears after "Kolkata", "Dublin" and "Jerusalem"

  @add-locations-via-search @FR5
  Scenario: City before country
    Given a city whose name starts with the query and a country whose name starts with the query
    When the user searches for "Mon"
    Then "Montevideo" is listed before every result of the country "MN"

  @add-locations-via-search @FR5 @add-geonames-city-source @FR4
  Scenario: One entry per zone
    When the user searches for "Panama"
    Then the zone city "America/Panama" appears once, as a match by city name

  @add-geonames-city-source @FR4
  Scenario: A zone appears once per city
    When the user searches for "Kazakhstan"
    Then no city appears twice
    And "Asia/Almaty" is the zone of more than one result

  @add-geonames-city-source @FR5 @UX3
  Scenario: Popular locations before larger cities
    When the user searches for "new"
    Then the first result is "New York"

  @add-geonames-city-source @FR5 @UX3
  Scenario: Larger cities first
    Given "San Antonio" has a larger population than "San Francisco" and neither is a popular location
    When the user searches for "san"
    Then "San Antonio" is listed before "San Francisco"

  @add-geonames-city-source @FR5 @UX3
  Scenario: Equal population falls back to the name
    Given two cities "Nashville" and "Nassau" with the same match kind, popularity and population
    When the user searches for "na"
    Then "Nashville" is listed before "Nassau"

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
