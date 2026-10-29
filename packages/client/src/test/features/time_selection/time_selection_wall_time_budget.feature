Feature: Typing an exact time stays within work bounds
  Implements change add-wall-time-input-with-hint.
  As a user with many locations I type a time and the rows follow without extra work.

  @add-wall-time-input-with-hint @NFR-P1
  Scenario: No new formatter after a wall-time input
    Given the current instant is "2026-03-08T07:30:00Z"
    And 50 rows are presented, one of them New York
    And the user typed "02:30" in New York, so New York shows a wall-time hint
    When the rows are presented again
    Then no date or time formatter is built

  @add-wall-time-input-with-hint @NFR-P1
  Scenario: The typed time is resolved in its row's zone only
    Given the current instant is "2026-03-08T07:30:00Z"
    And 50 rows are presented, one of them New York
    When the user types "10:40" in New York
    Then wall-clock time is converted to an instant only in "America/New_York"
