Feature: Meeting handles stay in reach, in jsdom
  Implements change refine-meeting-range-entry-and-handles.
  As a user I always find both meeting handles on screen, grab them beside the grip, and a release never changes the meeting.

  @refine-meeting-range-entry-and-handles @FR7
  Scenario Outline: Handle rows among the visible rows
    Given the candidate rows are rows <first> to <last> of the list
    When the handle rows are chosen
    Then the end handle stands on row <end> and the start handle on row <start>

    Examples:
      | first | last | end | start |
      | 1     | 4    | 2   | 3     |
      | 7     | 12   | 9   | 10    |
      | 5     | 5    | 5   | 5     |
      | 3     | 4    | 3   | 4     |

  @refine-meeting-range-entry-and-handles @NFR-P1
  Scenario: Scrolling re-places the handles cheaply
    Given the Grid view with 12 locations and the meeting range 09:00–11:00 in Almaty
    When three scroll events arrive before the next animation frame
    Then the hour strips are measured once
    When a scroll leaves the candidate rows unchanged
    Then no meeting handle is rendered again

  @refine-meeting-range-entry-and-handles @NFR-P1
  Scenario: A change of the candidate rows that keeps the handle rows renders no handle
    Given the Grid view with 12 locations and the meeting range 09:00–11:00 in Almaty
    When a scroll changes the candidate rows but not the handle rows
    Then no meeting handle is rendered again

  @refine-meeting-range-entry-and-handles @FR7
  Scenario: Scrolling without a meeting range measures no strip
    Given the Grid view with 12 locations and no meeting range
    When the user scrolls a few rows and the next animation frame arrives
    Then the date bar is not measured

  @refine-meeting-range-entry-and-handles @FR8
  Scenario: A click after a handle drag is not a tap
    Given the Grid view with the meeting range 09:00–11:00 in Almaty
    When the user drags the end handle one cell to the right and the browser then sends the click of that gesture to an hour cell of column 14
    Then the meeting range is 09:00–12:00

  @refine-meeting-range-entry-and-handles @FR8
  Scenario: Finger drag without Pointer Events
    Given an engine without Pointer Events and the meeting range 09:00–10:00
    When the user drags the end handle with a finger by one cell to the right
    Then the meeting range is 09:00–11:00
    And the end of the finger drag produces no click
