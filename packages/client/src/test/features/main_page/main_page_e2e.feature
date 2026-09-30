Feature: Main page in a real browser
  Implements change add-main-page-scaffold.
  The published main page stays accessible, readable in both themes, free of
  horizontal scrolling, keeps its header in place and can be retried by keyboard.

  @add-main-page-scaffold @NFR-A1 @UX2 @M2
  Scenario Outline: Main page is accessible in the <state> state in the <theme> theme
    Given the user prefers the <theme> theme
    When the main page is in the <state> state
    Then the main page has no accessibility violations
    And the content and every shown notice use the <theme> theme colours

    Examples:
      | state               | theme |
      | loading             | light |
      | loading             | dark  |
      | error               | light |
      | error               | dark  |
      | empty               | light |
      | empty               | dark  |
      | offline             | light |
      | offline             | dark  |
      | storage unavailable | light |
      | storage unavailable | dark  |

  @add-main-page-scaffold @NFR-R1
  Scenario Outline: Main page fits a <width> px wide screen in the <state> state
    Given the screen is <width> px wide for the main page
    When the main page is in the <state> state
    Then the main page does not scroll horizontally

    Examples:
      | state               | width |
      | loading             | 320   |
      | loading             | 2560  |
      | error               | 320   |
      | error               | 2560  |
      | empty               | 320   |
      | empty               | 2560  |
      | offline             | 320   |
      | offline             | 2560  |
      | storage unavailable | 320   |
      | storage unavailable | 2560  |

  @add-main-page-scaffold @FR6 @NFR-A2
  Scenario: User retries from the keyboard
    Given the view cannot be loaded on the first visit
    When the main page shows the error
    Then focus has not moved
    When the failure cause is gone
    And the user reaches Retry with Tab and presses Enter
    Then the view is shown

  @add-main-page-scaffold @FR1 @UX3
  Scenario: Header keeps its position
    Given the app has been installed and its header position is recorded
    When the update check fails because the network is unreachable
    Then the header has not moved
    When storage becomes unavailable
    Then the header has not moved
