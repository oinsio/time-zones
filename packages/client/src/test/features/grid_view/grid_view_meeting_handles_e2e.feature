Feature: Meeting handles of the Grid view in a real browser
  Implements change add-grid-meeting-range-and-share.
  The handles stand on different rows, resize the meeting by mouse, finger and keys, and read as sliders.

  Background:
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"

  @add-grid-meeting-range-and-share @FR9 @UX1
  Scenario: Handles of the sample meeting
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the end handle stands on the strip of "Moscow" at the right edge of the meeting frame
    And the start handle stands on the strip of "Kolkata" at the left edge of the meeting frame
    And the topmost element at the centre of each handle is that handle

  @add-grid-meeting-range-and-share @FR10 @UX2
  Scenario: Drag the end handle one hour right
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user taps column 9 of "Almaty"
    And the user drags the end handle with the mouse to the left edge of column 11 of "Almaty"
    Then the meeting range is from "09:00" to "11:00"
    And the meeting title reads "Meeting · 2 h"
    And "New York" shows the span "23:00–01:00"

  @add-grid-meeting-range-and-share @FR10 @UX2
  Scenario: Drag the start handle past the end
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user drags the start handle with the mouse to the right edge of column 12 of "Almaty"
    Then the meeting range is from "10:45" to "11:00"

  @add-grid-meeting-range-and-share @FR10 @FR11 @NFR-R1 @UX2 @refine-meeting-range-entry-and-handles @FR8
  Scenario: Dragging the end handle to the right edge on a phone
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting with the strips scrolled to its frame
    And the user drags the end handle with a finger to the right edge of the strips and holds it there
    Then the strips have scrolled to the right
    And the meeting range ends later than 11:00
    And the end handle keeps its distance from the finger at the press

  @add-grid-meeting-range-and-share @FR10 @FR11 @NFR-R1 @UX2 @refine-meeting-range-entry-and-handles @FR8
  Scenario: Dragging the start handle to the left edge on a phone
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting with the strips scrolled to its frame
    And the user drags the start handle with a finger to the left edge of the strips and holds it there
    Then the strips have scrolled to the left
    And the meeting range starts earlier than 09:00
    And the start handle never changed by more than 15 minutes at a time
    And the start handle keeps its distance from the finger at the press

  @add-grid-meeting-range-and-share @FR11
  Scenario: The hour frame comes back into view after Clear
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting with the strips scrolled to its frame
    And the user scrolls the strips back to the start
    And the user clears the meeting
    Then the hour frame lies inside the strips' visible part

  @add-grid-meeting-range-and-share @FR12 @NFR-A1 @move-meeting-range-and-extend-past-midnight @FR4
  Scenario: Slider values of the handles
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the slider "Meeting start" has the value 540, the minimum 0, the maximum 645 and the value text "09:00"
    And the slider "Meeting end" has the value 660, the minimum 555, the maximum 1980 and the value text "11:00"

  @add-grid-meeting-range-and-share @FR12 @NFR-A1
  Scenario: Keys on the handles
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user presses "ArrowRight" on the start handle
    Then the meeting range is from "09:15" to "11:00"
    And the meeting title reads "Meeting · 1 h 45 min"
    When the user presses "PageUp" on the end handle
    Then the meeting range is from "09:15" to "12:00"

  @add-grid-meeting-range-and-share @FR12 @NFR-A2 @NFR-R1
  Scenario: Handle hit area and focus ring
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then each handle is at least 24 by 44 px
    And a focused handle has a focus ring in the accent colour

  @move-meeting-range-and-extend-past-midnight @FR4 @NFR-A1
  Scenario: Slider values of a meeting past midnight
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "23:00" and "02:00" in the meeting range input of "Almaty"
    Then the slider "Meeting start" has the value 1380, the minimum 120, the maximum 1425 and the value text "23:00"
    And the slider "Meeting end" has the value 1560, the minimum 1395, the maximum 2820 and the value text "02:00"

  @move-meeting-range-and-extend-past-midnight @FR4
  Scenario: End on the end handle
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user presses "End" on the end handle
    Then the meeting range is from "09:00" to "09:00"
    And the meeting title reads "Meeting · 24 h"
    And every row has 34 hour cells

  @move-meeting-range-and-extend-past-midnight @FR9
  Scenario: A tap on a tail cell changes nothing
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "23:00" and "02:00" in the meeting range input of "Almaty"
    And the user taps column 26 of "Almaty"
    Then the meeting range is from "23:00" to "02:00"
    And the date bar still shows 8 March

  @move-meeting-range-and-extend-past-midnight @FR9
  Scenario: Drag onto the strip tail
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "23:00" and "02:00" in the meeting range input of "Almaty"
    And the user drags with the mouse from column 21 to column 24 of "Almaty"
    Then the meeting range is from "21:00" to "01:00"
    And every row has 26 hour cells

  @move-meeting-range-and-extend-past-midnight @FR9
  Scenario: A drag across more than 24 hours
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "23:00" and "02:00" in the meeting range input of "Almaty"
    And the user drags with the mouse from column 0 to column 26 of "Almaty"
    Then the meeting range is from "00:00" to "00:00"
    And the meeting title reads "Meeting · 24 h"

  @move-meeting-range-and-extend-past-midnight @FR6 @FR19
  Scenario: The tail grows under a dragged end handle
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "21:00" and "23:00" in the meeting range input of "Almaty"
    And the user drags the end handle with the mouse to the right past the last cell of the reference day
    Then each time the strip tail grew, the end of the meeting range changed by at most one track step
    And the meeting range ends after midnight
