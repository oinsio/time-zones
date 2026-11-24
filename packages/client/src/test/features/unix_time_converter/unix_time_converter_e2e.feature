Feature: The Unix time converter in a real browser
  Implements change add-unix-time-converter-tool.
  As a user I open the converter, type a Unix time and read it without
  scrolling sideways, with the keyboard or a pointer.

  @add-unix-time-converter-tool @NFR-A2 @desktop-only
  Scenario: Focus on a desktop
    Given the converter tool is enabled
    When the user opens the converter tool
    Then the converter input is focused and its text is selected

  @add-unix-time-converter-tool @NFR-A3 @NFR-R2
  Scenario: A typed value is shown in the notations
    Given the converter tool is enabled
    When the user opens the converter tool
    And the user types "1795432987123456789" into the converter input in the browser
    Then the notation "Seconds" shows "1795432987" in the browser

  @add-unix-time-converter-tool @NFR-R1 @NFR-R2 @NFR-A3
  Scenario Outline: Long values at <width> px
    Given the converter tool is enabled
    And the screen is <width> px wide for the locations
    When the user opens the converter tool
    And the user types "1795432987123456789" into the converter input in the browser
    Then the converter page does not scroll horizontally
    And the converter page has no accessibility violations

    Examples:
      | width |
      | 320   |
      | 375   |
      | 2560  |

  @add-unix-time-converter-tool @NFR-A2 @NFR-A4 @desktop-only
  Scenario Outline: Focus and names at <width> px in the <theme> theme
    Given the converter tool is enabled
    And the screen is <width> px wide for the locations
    And the locations screen uses the <theme> theme
    When the user opens the converter tool
    Then the converter input is focused and its text is selected
    And the converter page has no accessibility violations

    Examples:
      | width | theme |
      | 320   | light |
      | 320   | dark  |
      | 390   | light |
      | 390   | dark  |
      | 1280  | light |
      | 1280  | dark  |

  @add-unix-time-converter-tool @NFR-A2
  Scenario: Focus on a touch device
    Given the device has a coarse pointer that cannot hover and the tool is enabled
    When the user opens the converter on that device
    Then the focus is on the page heading and no field is focused
    When the user chooses the converter input of that device and pastes "1700000000"
    Then the converter input of that device shows exactly "1700000000"

  @add-unix-time-converter-tool @NFR-A3
  Scenario: A message is announced once
    Given the converter tool is enabled
    When the user opens the converter tool
    And the user types "abc" into the converter input in the browser
    Then the message is announced politely and the input refers to it as its description
    When the user starts watching the live regions
    And the live converter ticks three times
    Then nothing is announced

  @add-unix-time-converter-tool @FR8 @M2
  Scenario Outline: Fraction digits follow the precision
    Given the stored locations are "Moscow"
    And the converter tool is enabled
    When the user opens the converter tool
    And the user types "<text>" into the converter input in the browser
    Then the Moscow row shows "<time>" in the browser

    Examples:
      | text                | time                |
      | 1795432987123       | 14:23:07.123        |
      | 1795432987123456789 | 14:23:07.123456789  |

  @add-unix-time-converter-tool @FR12
  Scenario: Copy
    Given the converter tool is enabled
    When the user opens the converter tool
    And the user types "1795432987123" into the converter input in the browser
    And the user chooses the copy action of Seconds in the browser
    Then the clipboard holds "1795432987" and the copy is announced

  @add-unix-time-converter-tool @FR14
  Scenario: The moment is kept while the app is open
    Given the converter tool is enabled
    When the user opens the converter tool
    And the user types "1700000000" into the converter input in the browser
    And the user goes back to the main page from the tool
    And the user opens the converter tool again
    Then the converter input shows "1700000000" in the browser and the moment is pinned
    When the app is reloaded and the converter is opened
    Then the converter input shows the current Unix time and the moment is live

  @add-unix-time-converter-tool @FR16
  Scenario: Seconds are dropped
    Given the stored locations are "Moscow"
    And the converter tool is enabled
    When the user opens the converter tool
    And the user types "1795432987123" into the converter input in the browser
    And the user chooses Show on main page
    Then the main page shows the Moscow card at "14:23" and the focus is on the tool button
    When the user opens the converter tool again
    Then the converter input shows "1795432987123" in the browser and the moment is pinned

  @add-unix-time-converter-tool @FR5 @NFR-A2
  Scenario: Esc inside a field first restores the field
    Given the stored locations are "Moscow"
    And the converter tool is enabled
    When the user opens the converter tool
    And the user starts a time in the Moscow row and presses Esc
    Then the time field is closed and the converter page is still shown
    When the user presses Esc again
    Then the main page is shown without the converter

  @add-unix-time-converter-tool @NFR-R1 @NFR-R2
  Scenario: Long values at 320 px in the 12-hour format
    Given the stored locations are "Moscow"
    And the hour format is 12-hour in the browser
    And the converter tool is enabled
    And the screen is 320 px wide for the locations
    When the user opens the converter tool
    And the user types "1795432987123456789" into the converter input in the browser
    Then the converter page does not scroll horizontally
    And the time "2:23:07.123456789 PM" and the notation "1795432987123456789" are fully visible
    When the user types "1795432987123456789012" into the converter input in the browser
    Then the converter page does not scroll horizontally
    And the converter input text and the nanoseconds notation "1795432987123456789012" are fully visible

  @add-unix-time-converter-tool @NFR-R1 @NFR-R2 @UX1 @desktop-only
  Scenario Outline: Approved screenshots at <width> px in the <theme> theme
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the current time is "2026-11-23T11:23:07Z"
    And the converter tool is enabled
    And the screen is <width> px wide for the locations
    And the locations screen uses the <theme> theme
    When the user opens the converter tool
    And the user types "1795432987123" into the converter input in the browser
    Then the converter matches the approved screenshot

    Examples:
      | width | theme |
      | 390   | light |
      | 390   | dark  |
      | 1280  | light |
      | 1280  | dark  |
