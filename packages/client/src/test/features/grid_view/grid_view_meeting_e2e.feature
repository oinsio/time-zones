Feature: Meeting range of the Grid view in a real browser
  Implements change add-grid-meeting-range-and-share.
  A tap, Enter or a drag picks a meeting; the frame, the dimming, the spans and the meeting bar follow it.

  Background:
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"

  @add-grid-meeting-range-and-share @FR5
  Scenario: Tap on column 9
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user taps column 9 of "Almaty"
    Then the meeting range is from "09:00" to "10:00"
    And the meeting title reads "Meeting · 1 h"
    And "Almaty" shows the span "09:00–10:00"

  @add-grid-meeting-range-and-share @FR5 @NFR-A2
  Scenario: Enter on an hour strip
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user focuses the hour strip of "Almaty" and presses Enter
    Then the meeting range is from "12:00" to "13:00"

  @add-grid-meeting-range-and-share @FR6
  Scenario: Drag from column 9 to column 10
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user drags with the mouse from column 9 to column 10 of "Almaty"
    Then the meeting range is from "09:00" to "11:00"
    And the meeting title reads "Meeting · 2 h"

  @add-grid-meeting-range-and-share @FR6
  Scenario: Drag to the left
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user drags with the mouse from column 10 to column 8 of "Almaty"
    Then the meeting range is from "08:00" to "11:00"

  @add-grid-meeting-range-and-share @FR6 @NFR-R1
  Scenario: A swipe on a scrolling strip sets nothing
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user swipes the strip of "Moscow" to the left with a finger
    Then the strips have scrolled and no meeting range is set

  @add-grid-meeting-range-and-share @FR7 @UX1
  Scenario Outline: Meeting frame colour and layers in the <theme> theme
    Given the stored locations are "Almaty", "New York"
    And the locations screen uses the <theme> theme
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the meeting frame has the <theme> meeting colour
    And where the meeting frame crosses the clock change note of "New York", the topmost element is the note
    And where the meeting frame crosses a header text of "Almaty", the topmost element is that text

    Examples:
      | theme |
      | light |
      | dark  |

  @add-grid-meeting-range-and-share @FR7
  Scenario: Frame and dimming of the sample meeting
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the meeting frame encloses columns 9 and 10 of every row
    And 22 cells of every row are dimmed and columns 9 and 10 are not

  @add-grid-meeting-range-and-share @FR8 @UX1
  Scenario: Spans of the sample meeting
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then "Almaty" shows the span "09:00–11:00" in the meeting time colour
    And "Moscow" shows the span "07:00–09:00" in the meeting time colour
    And "Kolkata" shows the span "09:30–11:30" in the meeting time colour
    And "New York" shows the span "23:00–01:00" in the meeting time colour
    And "New York" shows the day shift mark "a day earlier" in the danger colour
    And "Moscow" shows no day shift mark

  @add-grid-meeting-range-and-share @FR13
  Scenario: Clear meeting
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user clears the meeting
    Then no meeting range is set
    And the hour frame is on column 9
    And the page header shows the app title again
    And the Add location button has the focus
    And every row shows its single time and no day shift mark

  @add-grid-meeting-range-and-share @FR13 @NFR-R1
  Scenario: Meeting bar on a narrow phone
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 320 by 640 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the meeting title and both buttons are on one line
    And the locations screen does not scroll horizontally

  @add-grid-meeting-range-and-share @FR7
  Scenario: No hour frame during a meeting
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then no hour frame is shown
