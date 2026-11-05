Feature: Location search by time zone abbreviation
  Implements change show-zone-abbreviations-and-zone-label-setting.
  As a user I find a place by the abbreviation I saw in an invitation, and I see every abbreviation it uses.

  @show-zone-abbreviations-and-zone-label-setting @FR8 @FR11 @M2
  Scenario: Ambiguous abbreviation
    When the user searches for "IST"
    Then exactly three results match by abbreviation: "Kolkata", "Dublin" and "Jerusalem"

  @show-zone-abbreviations-and-zone-label-setting @FR9 @FR10 @M2
  Scenario: Single-zone abbreviation
    When the user searches for "est"
    Then the first result is "New York" and it shows "EST / EDT"

  @show-zone-abbreviations-and-zone-label-setting @FR9
  Scenario: Either half of the year
    When the user searches for "EDT"
    Then the first result is "New York" and it matches by abbreviation

  @show-zone-abbreviations-and-zone-label-setting @FR9
  Scenario: Zones without a clock change
    When the user searches for "EST"
    Then "Panama" matches by abbreviation

  @show-zone-abbreviations-and-zone-label-setting @FR8 @M3
  Scenario Outline: Abbreviations outside tzdb no longer match
    When the user searches for "<query>"
    Then no result matches by abbreviation

    Examples:
      | query |
      | ET    |
      | PT    |
      | ALMT  |
      | ICT   |
      | SGT   |
      | GST   |
      | BRT   |
      | ART   |

  @show-zone-abbreviations-and-zone-label-setting @FR8 @M3
  Scenario Outline: Zones that tzdb names otherwise are no longer found
    When the user searches for "<query>"
    Then "<kept>" matches by abbreviation
    And "<dropped>" does not match by abbreviation

    Examples:
      | query | kept   | dropped |
      | GMT   | London | UTC     |
      | BST   | London | Dhaka   |

  @show-zone-abbreviations-and-zone-label-setting @FR8
  Scenario: Partial abbreviation does not match by abbreviation
    When the user searches for "IS"
    Then no result shows an abbreviation

  @show-zone-abbreviations-and-zone-label-setting @FR15
  Scenario: The zone label does not change the search
    Given the zone label shows neither the zone abbreviation nor the UTC offset
    When the user searches for "IST"
    Then the results are the same as with both shown
    And each abbreviation result shows its abbreviation pair

  @show-zone-abbreviations-and-zone-label-setting @FR10 @FR11 @UX3 @M2
  Scenario: Ambiguous abbreviation with its pairs
    Given the interface language is "en"
    When the user searches for "IST"
    Then the first three results are "Kolkata" with "IST", "Dublin" with "GMT / IST" and "Jerusalem" with "IST / IDT", in that order
    And "IST" is the emphasised abbreviation in each of them
    And 4 results are announced

  @show-zone-abbreviations-and-zone-label-setting @FR10 @UX3
  Scenario: The matched half of a pair is emphasised
    When the user searches for "EDT"
    Then the "New York" result shows "EST / EDT" with "EDT" emphasised
    When the user searches for "EST"
    Then the "New York" result shows "EST / EDT" with "EST" emphasised
    And the "Panama" result shows "EST" alone

  @show-zone-abbreviations-and-zone-label-setting @FR10 @UX3
  Scenario: Russian spelling in the result
    Given the interface language is "ru"
    When the user searches for "MSK"
    Then the "Москва" result shows "МСК" emphasised
