Feature: Meeting handles stay in reach in a real browser
  Implements change refine-meeting-range-entry-and-handles.
  Both meeting handles stay on screen in a long list, a press beside the grip drags the handle, and a release never changes the meeting.

  Background:
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"

  @refine-meeting-range-entry-and-handles @FR7 @NFR-R1
  Scenario Outline: Handles stay on screen in a long list at <width> by <height> px, <position>
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "Kathmandu", "Tokyo", "New York", "Belgrade", "Lord Howe Island", "Chicago", "Adelaide", "St. Vincent", "London"
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the page is scrolled to its <position>
    Then both meeting handles lie fully inside the viewport and above the date bar
    And the topmost element at the centre of each handle is that handle

    Examples:
      | width | height | position |
      | 390   | 844    | top      |
      | 390   | 844    | middle   |
      | 390   | 844    | bottom   |
      | 844   | 390    | top      |
      | 844   | 390    | middle   |
      | 844   | 390    | bottom   |

  @refine-meeting-range-entry-and-handles @FR8
  Scenario: A press beside the grip drags the handle
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user presses the mouse 16 px right of the end handle's centre, moves it one cell to the right and releases it over an hour cell of "Kolkata"
    Then the meeting range is from "09:00" to "12:00"
    And the meeting title reads "Meeting · 3 h"

  @refine-meeting-range-entry-and-handles @FR8
  Scenario: Press and release without movement
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user presses the end handle 10 px right of its centre and releases it without moving
    Then the meeting range is from "09:00" to "11:00"

  @refine-meeting-range-entry-and-handles @NFR-A2
  Scenario Outline: The hit area of the <handle> handle is at least 44 by 44 px
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the <handle> handle has a hit area of at least 44 by 44 px

    Examples:
      | handle |
      | start  |
      | end    |

  @refine-meeting-range-entry-and-handles @FR4 @NFR-A2
  Scenario: Slider values off the track step
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "09:05" and "09:28" in the meeting range input of "Almaty"
    Then the start handle has the value 545 minutes, shown as "09:05", between 0 and 553
    And the end handle has the value 568 minutes, shown as "09:28", between 560 and 1440

  @refine-meeting-range-entry-and-handles @FR4
  Scenario: Arrow keys bring an off-step end onto the track step
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user confirms "09:05" and "10:50" in the meeting range input of "Almaty"
    And the user presses ArrowRight on the start handle and ArrowLeft on the end handle
    Then the meeting range is from "09:15" to "10:45"
