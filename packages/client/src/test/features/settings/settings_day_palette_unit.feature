Feature: Colours group of the settings
  Implements change redesign-cards-grid-and-day-palettes.
  As a user I choose the colours of the day periods in a group under the colouring.

  @redesign-cards-grid-and-day-palettes @FR5 @UX2
  Scenario Outline: Shown only in the Time of day colouring
    Given the stored colouring is "<colouring>"
    When the settings page is shown
    Then the Colours group is <visibility>

    Examples:
      | colouring     | visibility |
      | Plain         | absent     |
      | Time of day   | shown      |
      | Working hours | absent     |

  @redesign-cards-grid-and-day-palettes @FR5
  Scenario: Vivid is checked by default
    When the settings page is shown
    Then the Colours group offers "Vivid" and "Muted" with "Vivid" checked

  @redesign-cards-grid-and-day-palettes @FR5 @UX2
  Scenario Outline: Both languages of the Colours group
    Given the interface language is "<language>"
    When the settings page is shown
    Then the Colours group is named "<caption>" and offers "<vivid>" and "<muted>"

    Examples:
      | language | caption | vivid | muted        |
      | en       | Colours | Vivid | Muted        |
      | ru       | Цвета   | Яркие | Приглушённые |

  @redesign-cards-grid-and-day-palettes @FR5
  Scenario: Every locale has the keys
    Then every locale has the keys of the Colours group
