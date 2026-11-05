Feature: Zone line on location rows
  Implements change show-zone-abbreviations-and-zone-label-setting.
  As a user I read the country, the zone abbreviation and the UTC offset of each location as separate elements, as the zone label allows.

  @show-zone-abbreviations-and-zone-label-setting @FR5
  Scenario: Country, abbreviation and offset
    Given the interface language is "ru"
    And the zone label shows "the UTC offset and the zone abbreviation"
    And the current instant is "2026-07-15T12:00:00Z"
    And the list contains "Kolkata"
    When the user opens the app
    Then the "Kolkata" zone line elements are "Индия", "IST", "UTC+5:30"

  @show-zone-abbreviations-and-zone-label-setting @FR5 @FR13 @M4
  Scenario Outline: The zone label decides the elements
    Given the interface language is "en"
    And the current instant is "2026-07-15T12:00:00Z"
    And the list contains "Kolkata"
    And the zone label shows "<parts>"
    When the user opens the app
    Then the "Kolkata" zone line elements are "<elements>"

    Examples:
      | parts                                    | elements             |
      | the UTC offset and the zone abbreviation | India, IST, UTC+5:30 |
      | the UTC offset only                      | India, UTC+5:30      |
      | the zone abbreviation only               | India, IST           |
      | nothing                                  | India                |

  @show-zone-abbreviations-and-zone-label-setting @FR2 @FR5
  Scenario: The abbreviation follows the reference moment
    Given the list contains "New York" and "Dublin"
    And the current instant is "2026-01-15T12:00:00Z"
    When the user opens the app
    Then "New York" shows "EST" and "Dublin" shows "GMT"
    When the user pins the moment to "2026-07-15T12:00:00Z"
    Then "New York" shows "EDT" and "Dublin" shows "IST"

  @show-zone-abbreviations-and-zone-label-setting @FR5 @UX1
  Scenario: Unknown elements leave nothing behind
    Given the current instant is "2026-07-15T12:00:00Z"
    And the list contains "Almaty" and "UTC"
    When the user opens the app
    Then the "Almaty" zone line elements are "Kazakhstan, UTC+5"
    And the "UTC" zone line elements are "UTC"

  @show-zone-abbreviations-and-zone-label-setting @FR5
  Scenario: UTC with the zone abbreviation only
    Given the interface language is "en"
    And the zone label shows "the zone abbreviation only"
    And the current instant is "2026-07-15T12:00:00Z"
    And the list contains "UTC"
    When the user opens the app
    Then the "UTC" zone line elements are "UTC"

  @show-zone-abbreviations-and-zone-label-setting @FR13 @UX2
  Scenario: A change applies to every row at once
    Given the list is "the device time location, Moscow, Kolkata"
    When the user opens the app
    And the user turns the zone abbreviation off in the settings and goes back
    Then no row shows a zone abbreviation
    And the city labels, local times and offset differences are unchanged

  @show-zone-abbreviations-and-zone-label-setting @FR5
  Scenario: Offset hidden by the zone label
    Given the current instant is "2026-07-15T12:00:00Z"
    And the zone label shows "the zone abbreviation only"
    And the list contains "Moscow"
    When the user opens the app
    Then the "Moscow" zone line elements are "Russia, MSK"

  @show-zone-abbreviations-and-zone-label-setting @FR6
  Scenario Outline: Meta line follows the zone label
    Given the device time zone is "Europe/Moscow"
    And the interface language is "ru"
    And the list is "the device time location"
    And the zone label shows "<parts>"
    When the user opens the app
    Then the meta line is "<meta line>"

    Examples:
      | parts                                    | meta line                       |
      | the UTC offset and the zone abbreviation | Время устройства, МСК, UTC+3    |
      | the UTC offset only                      | Время устройства, UTC+3         |
      | the zone abbreviation only               | Время устройства, МСК           |
      | nothing                                  | Время устройства                |
