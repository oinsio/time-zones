Feature: Inactive Now
  Implements change keep-now-button-visible-when-live.
  As a user I see Now at all times, and it does nothing while the moment is live.

  @keep-now-button-visible-when-live @FR2 @M5
  Scenario: An inactive Now changes nothing
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    And the app is open
    When the user activates the inactive Now button
    Then the moment is live
    And the "Almaty" row shows the time "12:30" and the date "Sun, Mar 8"
    And the Now button is inactive
