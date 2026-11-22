Feature: Approved screenshots of the Grid meeting state
  Implements change add-grid-meeting-range-and-share.
  The Grid view with the sample meeting looks the same on every run.

  @add-grid-meeting-range-and-share @NFR-R2 @UX1
  Scenario Outline: Approved screenshots of the meeting state at <width> by <height> px in the <theme> theme
    Given the view mode is Grid
    And the locations interface language is Russian
    And the current time is "2026-03-08T07:30:00Z"
    And the list holds "Almaty", "Moscow", "Kolkata", "New York" and home is "Almaty"
    And the locations screen uses the <theme> theme
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the locations screen matches the approved screenshot

    Examples:
      | width | height | theme |
      | 1440  | 900    | light |
      | 1440  | 900    | dark  |
      | 1180  | 820    | light |
      | 1180  | 820    | dark  |
      | 844   | 390    | light |
      | 844   | 390    | dark  |
      | 390   | 844    | light |
      | 390   | 844    | dark  |

  @move-meeting-range-and-extend-past-midnight @UX1 @UX2 @UX3 @UX4 @NFR-R1
  Scenario Outline: Approved screenshots of the moved and extended meeting, <state> at <width> by <height> px in the <theme> theme
    Given the view mode is Grid
    And the locations interface language is Russian
    And the current time is "2026-03-08T07:30:00Z"
    And the list holds "Almaty", "Moscow", "Kolkata", "Kathmandu", "Tokyo", "New York", "Belgrade", "Lord Howe Island", "Chicago", "Adelaide", "St. Vincent", "London" and home is "Almaty"
    And the locations screen uses the <theme> theme
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the meeting is shown in the state "<state>"
    Then the locations screen matches the approved screenshot

    Examples:
      | state                           | width | height | theme |
      | list at the top                 | 390   | 844    | light |
      | list in the middle              | 390   | 844    | light |
      | list at the bottom              | 390   | 844    | light |
      | the range being moved           | 390   | 844    | light |
      | with its strip tail             | 390   | 844    | light |

    @desktop-only
    Examples:
      | state                           | width | height | theme |
      | with its strip tail wide        | 1280  | 800    | dark  |
