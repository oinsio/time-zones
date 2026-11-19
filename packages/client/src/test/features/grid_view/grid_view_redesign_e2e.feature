Feature: Hour cells of the redesigned Grid in a real browser
  Implements change redesign-cards-grid-and-day-palettes.
  The hour cells have the redesigned radius, digits, height and gap, and stay 38 px wide on a phone.

  @redesign-cards-grid-and-day-palettes @FR17 @UX3
  Scenario Outline: Cell sizes at <width> px
    Given the view mode is Grid
    And the stored locations are "Almaty", "Moscow"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then every hour cell has a 5 px radius, 15 px digits and is <height> px high
    And neighbouring cells of a row are 3 px apart

    Examples:
      | width | height |
      | 390   | 44     |
      | 1024  | 48     |
      | 1440  | 48     |

  @redesign-cards-grid-and-day-palettes @FR17 @NFR-R1
  Scenario: Cells 38 px wide on a phone
    Given the view mode is Grid
    And the stored locations are "Almaty"
    And the screen is 390 px wide for the locations
    When the user opens the locations app
    Then every hour cell is 38 px wide and the strip scrolls horizontally
