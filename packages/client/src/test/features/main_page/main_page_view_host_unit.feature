Feature: Main page view host
  Implements change add-main-page-scaffold.
  The view host chooses the view from the registry by container width and follows resizes.

  @add-main-page-scaffold @FR2
  Scenario: Wide container picks the wider view
    Given two registered views with minimum widths 0 px and 768 px
    When the container is 1024 px wide in AUTO mode
    Then the view with the 768 px minimum is shown

  @add-main-page-scaffold @FR2
  Scenario: Narrow container picks the narrower view
    Given two registered views with minimum widths 0 px and 768 px
    When the container is 320 px wide in AUTO mode
    Then the view with the 0 px minimum is shown

  @add-main-page-scaffold @FR2
  Scenario: Only one view registered
    Given only Cards is registered
    When the container is 320 px wide in AUTO mode
    Then the Cards view is shown

  @add-main-page-scaffold @FR2
  Scenario: Unknown view id
    Given two registered views with minimum widths 0 px and 768 px
    When the mode is a view id that is not registered and the container is 1024 px wide
    Then the view with the 768 px minimum is shown

  @add-main-page-scaffold @FR4
  Scenario: Container is resized
    Given two registered views with minimum widths 0 px and 768 px
    And the container is 320 px wide in AUTO mode
    When the container becomes 1024 px wide
    Then the view with the 768 px minimum is shown

  @add-main-page-scaffold @FR3
  Scenario: Registry content
    When the registry is read
    Then it contains exactly one view, Cards

  @add-main-page-scaffold @FR2 @M4
  Scenario: Second view needs no page change
    Given a test view is added to the registry
    When the container is 320 px wide in AUTO mode
    Then the host resolves to the test view without any change to the main page
