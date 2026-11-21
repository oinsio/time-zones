Feature: Moving the meeting range and the sticky meeting bar in a real browser
  Implements change move-meeting-range-and-extend-past-midnight.
  The meeting bar stays at the top, the move handle rests on the frame's top line or on the bar's line, and the whole range moves by handle, frame and keys.

  Background:
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"

  @move-meeting-range-and-extend-past-midnight @FR12 @NFR-R2
  Scenario Outline: The meeting bar stays in a long list at <width> by <height> px, <position>
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "Kathmandu", "Tokyo", "New York", "Belgrade", "Lord Howe Island", "Chicago", "Adelaide", "St. Vincent", "London"
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the page is scrolled to its <position>
    Then the meeting bar is fully visible at the top of the viewport with the share and clear buttons
    And at least one grid row is fully visible between the meeting bar and the date bar

    Examples:
      | width | height | position |
      | 390   | 844    | middle   |
      | 390   | 844    | bottom   |
      | 844   | 390    | middle   |
      | 1440  | 900    | bottom   |

  @move-meeting-range-and-extend-past-midnight @FR12
  Scenario: The normal header still scrolls away
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "Kathmandu", "Tokyo", "New York", "Belgrade", "Lord Howe Island", "Chicago", "Adelaide", "St. Vincent", "London"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the page is scrolled to its bottom
    Then the header is not in the viewport

  @move-meeting-range-and-extend-past-midnight @NFR-A3
  Scenario: Focus is not hidden under the bar
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "Kathmandu", "Tokyo", "New York", "Belgrade", "Lord Howe Island", "Chicago", "Adelaide", "St. Vincent", "London"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the page is scrolled to its bottom
    And the user presses Shift+Tab until the focus is on the span of the third row
    Then that span is fully visible below the meeting bar

  @move-meeting-range-and-extend-past-midnight @FR18 @NFR-A1
  Scenario: Slider values of the move handle
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the slider "Move meeting" has the value 540, the minimum 0, the maximum 1425 and the value text "09:00–11:00"

  @move-meeting-range-and-extend-past-midnight @FR18 @NFR-A1
  Scenario Outline: Keys on the move handle, <key>
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user presses "<key>" on the move handle
    Then the meeting range is from "<start>" to "<end>"
    And the meeting title reads "Meeting · 2 h"

    Examples:
      | key        | start | end   |
      | ArrowRight | 09:15 | 11:15 |
      | ArrowLeft  | 08:45 | 10:45 |
      | PageUp     | 10:00 | 12:00 |
      | PageDown   | 08:00 | 10:00 |
      | Home       | 00:00 | 02:00 |
      | End        | 23:45 | 01:45 |

  @move-meeting-range-and-extend-past-midnight @FR18 @NFR-A1
  Scenario: Tab order of the three handles
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user focuses the hour strip of "Moscow" and presses Tab three times
    Then the focus visited "Meeting start", "Meeting end" and "Move meeting" in that order

  @move-meeting-range-and-extend-past-midnight @FR17 @UX1
  Scenario: The move handle of the sample meeting
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the move handle is 36 px wide and 12 px high and its centre is the centre of the frame's top line
    And it does not overlap the text of the first row header

  @move-meeting-range-and-extend-past-midnight @FR17 @UX2 @M5
  Scenario Outline: The move handle sticks to the meeting bar at scroll <scroll>
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "Kathmandu", "Tokyo", "New York", "Belgrade", "Lord Howe Island", "Chicago", "Adelaide", "St. Vincent", "London"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the page is scrolled down by <scroll> px
    Then the vertical centre of the move handle is on the axis of the <where>
    And its horizontal centre is the horizontal centre of the meeting frame
    And the topmost element at the centre of the move handle is the move handle

    Examples:
      | scroll | where                |
      | 0      | frame's top line     |
      | 4      | frame's top line     |
      | 7      | meeting bar's bottom line |
      | 400    | meeting bar's bottom line |

  @move-meeting-range-and-extend-past-midnight @FR17
  Scenario: The move handle follows the strips
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "Kathmandu", "Tokyo", "New York", "Belgrade", "Lord Howe Island", "Chicago", "Adelaide", "St. Vincent", "London"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the page is scrolled to its middle
    And the user scrolls the strips by two cells
    Then its horizontal centre is the horizontal centre of the meeting frame

  @move-meeting-range-and-extend-past-midnight @FR17 @UX2 @M4
  Scenario Outline: The move handle stays in reach in a long list, <position>
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "Kathmandu", "Tokyo", "New York", "Belgrade", "Lord Howe Island", "Chicago", "Adelaide", "St. Vincent", "London"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the page is scrolled to its <position>
    Then the meeting bar and the move handle are fully inside the viewport
    And the topmost element at the centre of the move handle is the move handle

    Examples:
      | position |
      | top      |
      | middle   |
      | bottom   |

  @move-meeting-range-and-extend-past-midnight @FR15
  Scenario: Drag the frame with the mouse
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "13:00" and "15:00" in the meeting range input of "Almaty"
    And the user presses the mouse on column 13 of "Moscow", moves it one and a half cells to the right and releases it
    Then the meeting range is from "14:30" to "16:30"
    And the meeting title reads "Meeting · 2 h"

  @move-meeting-range-and-extend-past-midnight @FR17
  Scenario Outline: Drag the move handle with <pointer> at <width> by <height> px
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "13:00" and "15:00" in the meeting range input of "Almaty"
    And the user drags the move handle one cell to the left with <pointer>
    Then the meeting range is from "12:00" to "14:00"

    Examples:
      | width | height | pointer      |
      | 1440  | 900    | the mouse    |
      | 390   | 844    | a finger     |

  @move-meeting-range-and-extend-past-midnight @FR16
  Scenario: Hold and drag with a finger
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "13:00" and "15:00" in the meeting range input of "Almaty"
    And the user holds a finger on column 13 of "Almaty" for 250 ms and then moves it one cell to the right
    Then the meeting range is from "14:00" to "16:00"
    And the strips did not scroll by the finger's travel

  @move-meeting-range-and-extend-past-midnight @FR16
  Scenario: Hold and drag with a finger on fitting strips
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "13:00" and "15:00" in the meeting range input of "Almaty"
    And the user holds a finger on column 13 of "Almaty" for 250 ms and then moves it two cells to the right
    Then the meeting range is from "15:00" to "17:00"
    And the meeting title reads "Meeting · 2 h"

  @move-meeting-range-and-extend-past-midnight @FR16
  Scenario: A finger drag inside the frame on fitting strips
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "13:00" and "15:00" in the meeting range input of "Almaty"
    And the user drags a finger from column 14 to column 17 of "Almaty" without holding it first
    Then the meeting range is from "14:00" to "18:00"

  @move-meeting-range-and-extend-past-midnight @FR16
  Scenario: A swipe inside the frame still scrolls
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "13:00" and "15:00" in the meeting range input of "Almaty"
    And the user swipes to the left from column 13 of "Almaty" without holding
    Then the strips scroll
    And the meeting range is from "13:00" to "15:00"

  @move-meeting-range-and-extend-past-midnight @FR16
  Scenario: Finger move without Pointer Events
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 390 by 844 px for the locations
    And an engine without Pointer Events
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "13:00" and "15:00" in the meeting range input of "Almaty"
    And the user drags the move handle one cell to the right with a finger
    Then the meeting range is from "14:00" to "16:00"

  @move-meeting-range-and-extend-past-midnight @FR20
  Scenario: A move into the strip tail
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "21:00" and "23:00" in the meeting range input of "Almaty"
    And the user scrolls the strips to the meeting frame
    And the user drags the move handle with a finger to the right edge of the strips and holds it there
    Then the strips have scrolled to the right
    And the meeting range is 2 hours long and ends after midnight

  @move-meeting-range-and-extend-past-midnight @FR17 @NFR-A2
  Scenario Outline: The hit area of the move handle at <width> by <height> px
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the box of the slider "Move meeting" is at least 44 px wide and 44 px high and centred on its grip
    And it does not overlap a location menu button

    Examples:
      | width | height |
      | 1440  | 900    |
      | 390   | 844    |

  @move-meeting-range-and-extend-past-midnight @NFR-A1 @M6
  Scenario Outline: No accessibility violations with the move handle in the <theme> theme, <position>
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "Kathmandu", "Tokyo", "New York", "Belgrade", "Lord Howe Island", "Chicago", "Adelaide", "St. Vincent", "London"
    And the locations screen uses the <theme> theme
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the page is scrolled to its <position>
    Then the meeting state has no accessibility violations

    Examples:
      | theme | position |
      | light | top      |
      | light | middle   |
      | dark  | top      |
      | dark  | middle   |
