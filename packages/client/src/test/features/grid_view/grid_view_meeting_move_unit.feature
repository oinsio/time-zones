Feature: Moving the meeting range, in jsdom
  Implements change move-meeting-range-and-extend-past-midnight.
  As a user I move the whole meeting range by its frame and the rows follow.

  @move-meeting-range-and-extend-past-midnight @FR16
  Scenario: A click inside the frame is still a tap
    Given the Grid view with the meeting range 13:00–15:00 in Almaty
    When the user clicks column 14 of Almaty without moving the mouse
    Then the meeting range is 14:00–15:00

  @move-meeting-range-and-extend-past-midnight @FR16
  Scenario: A press outside the frame sets a new range
    Given the Grid view with the meeting range 13:00–15:00 in Almaty
    When the user drags with the mouse from column 9 to column 10 of Almaty
    Then the meeting range is 09:00–11:00

  @move-meeting-range-and-extend-past-midnight @FR19 @FR20 @UX3
  Scenario: Rows follow the move
    Given the Grid view with Almaty, Moscow, Kolkata and New York and the meeting range 13:00–15:00 in Almaty on 2026-03-08
    When the user holds the move handle one and a half cells to the right of its place
    Then Almaty shows "14:30–16:30", Moscow "12:30–14:30", Kolkata "15:00–17:00" and New York "05:30–07:30"
    And the title is "Meeting · 2 h"
    And the frame has its lifted look

  @move-meeting-range-and-extend-past-midnight @FR19
  Scenario: A release after a move is not a tap
    Given the Grid view with the meeting range 13:00–15:00 in Almaty
    When the user drags the frame one cell to the right and the browser then sends the click of that gesture to an hour cell of column 9
    Then the meeting range is 14:00–16:00

  @move-meeting-range-and-extend-past-midnight @NFR-P1
  Scenario: Scrolling re-places the move handle cheaply
    Given the Grid view with 12 locations and the meeting range 09:00–11:00 in Almaty
    When three scroll events arrive before the next animation frame
    Then the meeting frame is measured once for the move handle
