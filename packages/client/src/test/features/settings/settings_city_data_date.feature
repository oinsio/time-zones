Feature: Date of the city data on the settings page
  As a user I see how old the city data behind the search is: the attribution names the dump date, in my language, whatever my time zone.

  @apply-data-updates-silently @FR12 @FR13
  Scenario Outline: The attribution in both languages
    Given the city data in use records the dump date "2026-11-14"
    And the interface language is "<language>"
    When the user opens the settings
    Then a link named "<attribution>" to "https://www.geonames.org/" is shown
    And it stands below the last settings group

    Examples:
      | language | attribution                                              |
      | English  | City data: GeoNames (November 14, 2026), CC BY 4.0       |
      | Russian  | Данные о городах: GeoNames (14 ноября 2026 г.), CC BY 4.0 |

  @apply-data-updates-silently @FR12
  Scenario Outline: The date does not depend on the device time zone
    Given the city data in use records the dump date "2026-11-14"
    And the device time zone is "<zone>"
    When the settings page is shown in English
    Then the attribution names November 14, 2026

    Examples:
      | zone               |
      | Pacific/Kiritimati |
      | Pacific/Pago_Pago  |

  @apply-data-updates-silently @FR12
  Scenario: The date follows the language at once
    Given the settings page shows the attribution in English
    When the user chooses Russian
    Then the attribution reads "Данные о городах: GeoNames (14 ноября 2026 г.), CC BY 4.0" without a reload

  @apply-data-updates-silently @FR12
  Scenario: The date follows the build
    Given the running build fixes the dump date "2026-12-14", whatever date the device stores or the network serves
    When the user opens the settings in English
    Then the attribution names December 14, 2026

  @apply-data-updates-silently @FR13 @NFR-P3
  Scenario: No formatter on a tick
    Given the settings page is shown
    When a minute passes
    Then no date formatter was built
