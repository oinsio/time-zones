Feature: Now button always visible in the date bar (browser)
  Implements change keep-now-button-visible-when-live.
  As a user I always find the Now button at the same place: active while the
  moment is pinned, inactive and grey while it is live.

  @keep-now-button-visible-when-live @NFR-A2
  Scenario: Tab skips an inactive Now
    Given the current time is "2026-03-08T07:30:00Z"
    And the user opens the locations app
    When the user focuses the next-day button and presses Tab
    Then neither the next-day button nor Now has the focus

  @keep-now-button-visible-when-live @NFR-A1
  Scenario Outline: Now is named in English in the <bar mode> mode
    Given the current time is "2026-03-08T07:30:00Z"
    And the user opens the locations app
    When the date bar is put in the <bar mode> state
    Then the bar has a Now button named "Now" that is <availability>

    Examples:
      | bar mode | availability |
      | live     | inactive     |
      | pinned   | active       |

  @keep-now-button-visible-when-live @NFR-A1
  Scenario: Now is named in Russian in the live mode
    Given the current time is "2026-03-08T07:30:00Z"
    And the locations interface language is Russian
    And the user opens the locations app
    Then the bar has a Now button named "Сейчас" that is inactive

  @keep-now-button-visible-when-live @FR2 @M5
  Scenario: An inactive Now changes nothing
    Given the current time is "2026-03-08T07:30:00Z"
    And the user opens the locations app
    When the user forces a click on the inactive Now button
    Then the bar shows the date "2026-03-08"
    And the bar has a Now button named "Now" that is inactive

  @keep-now-button-visible-when-live @FR4 @UX1 @M1
  Scenario Outline: An inactive Now is grey in the <theme> theme
    Given the current time is "2026-03-08T07:30:00Z"
    And the locations screen uses the <theme> theme
    And the user opens the locations app
    Then the inactive Now shows a clock icon and the label "Now" in the muted colours
    When the user moved to the next day with the bar
    Then Now shows a clock icon and the label "Now" in the accent colours

    Examples:
      | theme |
      | light |
      | dark  |

  @keep-now-button-visible-when-live @NFR-R1 @UX2 @M3
  Scenario Outline: Now keeps its place at <width> px in the <theme> theme
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is <width> px wide for the locations
    And the locations screen uses the <theme> theme
    And the user opens the locations app
    Then Now keeps its place and size when the user moves to the next day

    Examples:
      | width | theme |
      | 375   | light |
      | 375   | dark  |
      | 1024  | light |
      | 1024  | dark  |

  @keep-now-button-visible-when-live @NFR-R1 @UX2
  Scenario Outline: A long date stays on one line at <width> px
    Given the current time is "2026-09-27T07:30:00Z"
    And the locations interface language is Russian
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    Then the date button stays one line high when the user moves to the next day

    Examples:
      | width |
      | 768   |
      | 1024  |
