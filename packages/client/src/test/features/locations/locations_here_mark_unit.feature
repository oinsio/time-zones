Feature: Here mark on a location row matches the design
  Implements change match-here-mark-to-design.
  As a user I see an arrow before the city and the word "here" after it on the row of my own time zone.

  @match-here-mark-to-design @FR1 @UX1 @UX2 @UX3
  Scenario: Icon before the city, caption after it
    Given the device time zone is "Asia/Almaty"
    And the list contains "Almaty, Moscow"
    When the user opens the app
    Then on the city line of "Almaty" the mark image precedes the city and the caption follows it
    And the city line of "Moscow" starts with the city

  @match-here-mark-to-design @FR2 @M2
  Scenario: The former pill is gone
    Given the device time zone is "Europe/Moscow"
    And the list contains "Moscow, Saint Petersburg, Almaty"
    When the user opens the app
    Then exactly 2 rows show the here mark
    And exactly 2 rows have an icon before their city
    And no text says "Your time zone"

  @match-here-mark-to-design @FR4
  Scenario: A marked row has exactly one leading mark
    Given the device time zone is "Asia/Almaty"
    And the list contains "Almaty, Moscow"
    When the user opens the app
    Then the "Almaty" row has 1 icon before its city
    And the "Moscow" row has 0 icons before its city

  @match-here-mark-to-design @FR4 @FR3 @M3
  Scenario Outline: Every mark kind is fully defined
    Given the interface language is "<language>"
    Then every mark kind has an accessible label and, where it has one, a caption
    And every mark kind renders an icon

    Examples:
      | language |
      | en       |
      | ru       |
