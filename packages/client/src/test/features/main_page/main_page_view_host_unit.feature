Feature: Main page view host
  Implements changes add-main-page-scaffold and add-view-mode-setting-and-grid-skeleton.
  The view host shows the view the user chose; the width and the orientation never choose it.

  @add-view-mode-setting-and-grid-skeleton @FR3
  Scenario: Chosen view is shown
    Given Cards and Grid are registered
    When the view mode is Grid
    Then the Grid view is shown

  @add-view-mode-setting-and-grid-skeleton @FR3
  Scenario: No view chosen
    Given Cards and Grid are registered
    When no view is chosen
    Then the Cards view is shown

  @add-view-mode-setting-and-grid-skeleton @FR3 @FR4
  Scenario: Unknown view id
    Given Cards and Grid are registered
    When the view mode is a view id that is not registered
    Then the Cards view is shown

  @add-view-mode-setting-and-grid-skeleton @FR5
  Scenario: Width does not choose the view
    Given Cards and Grid are registered and the view mode is Grid
    When the container is 320 px wide and then 2560 px wide
    Then the Grid view is shown both times

  @add-view-mode-setting-and-grid-skeleton @FR4
  Scenario: View mode changes
    Given the Cards view is shown
    When the view mode becomes Grid
    Then the host shows the Grid view without reloading the page

  @add-view-mode-setting-and-grid-skeleton @FR3
  Scenario: Registry content
    When the registry is read
    Then it contains exactly two views, Cards and Grid, in this order

  @add-view-mode-setting-and-grid-skeleton @FR3
  Scenario: Second view needs no page change
    When a test view is added to the registry and chosen as the view mode
    Then the host shows it without any change to the main page

  @add-view-mode-setting-and-grid-skeleton @NFR-P1
  Scenario: Grid is not loaded while Cards is shown
    Given no view is chosen
    When the main page is shown
    Then the Grid component has not been requested
