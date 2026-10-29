Feature: Type an exact time in any row
  Implements change add-wall-time-input-with-hint.
  As a user I type a wall-clock time in a location or the Here entry and every row follows.

  @add-wall-time-input-with-hint @FR1
  Scenario: No input for an unknown zone
    Given the list holds "Moscow" and a location in the unknown zone "Mars/Olympus_Mons"
    When the list is presented
    Then "Moscow" has a wall-time input
    And the other location has none

  @add-wall-time-input-with-hint @FR2 @M4
  Scenario Outline: Accepted texts
    When the user confirms the text <text>
    Then the typed wall-clock time is <time>

    Examples:
      | text      | time  |
      | "9"       | 09:00 |
      | "09"      | 09:00 |
      | "930"     | 09:30 |
      | "0930"    | 09:30 |
      | "9:30"    | 09:30 |
      | "09:30"   | 09:30 |
      | "09.30"   | 09:30 |
      | " 9:30 "  | 09:30 |
      | "0:00"    | 00:00 |
      | "23:59"   | 23:59 |

  @add-wall-time-input-with-hint @FR6 @M4
  Scenario Outline: Rejected texts
    Given the interface language is "en"
    And the device time zone is "Asia/Almaty"
    And the list contains "Almaty, New York"
    And the app is open
    When the user confirms the text <text> in New York
    Then the field shows the error "Enter the time as HH:MM"
    And the moment is still live

    Examples:
      | text     |
      | "24:00"  |
      | "9:60"   |
      | "abc"    |
      | "12345"  |
      | "9:3"    |
      | ""       |

  @add-wall-time-input-with-hint @FR3 @M2
  Scenario: Type a time in another city
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, Moscow, Kolkata, New York"
    And the app is open
    When the user types "10:40" in "New York"
    Then the moment is pinned to "2026-03-08T14:40:00Z" with the status "UNIQUE"
    And the cards show:
      | city    | time  |
      | Almaty  | 19:40 |
      | Moscow  | 17:40 |
      | Kolkata | 20:10 |

  @add-wall-time-input-with-hint @FR3 @M3
  Scenario Outline: Wall-clock outcomes of a typed time
    Given the device time zone is "Asia/Almaty"
    And the current instant is <now>
    And the list contains "New York"
    And the app is open
    When the user types <typed> in New York
    Then the moment is pinned to <pinned> with the status <status>

    Examples:
      | now                  | typed | pinned               | status    |
      | 2026-06-01T07:30:00Z | 10:00 | 2026-06-01T14:00:00Z | UNIQUE    |
      | 2026-03-08T07:30:00Z | 02:30 | 2026-03-08T07:30:00Z | GAP       |
      | 2026-11-01T07:30:00Z | 01:30 | 2026-11-01T05:30:00Z | AMBIGUOUS |

  @add-wall-time-input-with-hint @FR3 @M2
  Scenario: Type a time in the Here entry
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Moscow"
    And the app is open
    When the user types "08:00" in the Here entry
    Then the moment is pinned to "2026-03-08T03:00:00Z" with the status "UNIQUE"
    And the "Moscow" card shows "06:00"

  @add-wall-time-input-with-hint @FR4 @FR8 @M2
  Scenario: The typed instant leaves the reference day
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    And the app is open
    When the user types "23:00" in "New York"
    Then the moment is pinned to "2026-03-09T03:00:00Z" with the status "UNIQUE"
    And the date bar shows "Monday, March 9"
    And the reference day runs from "2026-03-08T19:00:00Z" to "2026-03-09T19:00:00Z"
    And the Now button is shown

  @add-wall-time-input-with-hint @FR9 @M5
  Scenario: Nothing is stored or shared
    Given the device time zone is "Asia/Almaty"
    And the list contains "Almaty, New York"
    And the app is open
    And another tab watches the list
    When the user types 20 times in "New York" and then returns to now
    Then nothing is written to storage
    And no other tab receives a change

  @add-wall-time-input-with-hint @FR10
  Scenario: The location is gone while typing
    Given the device time zone is "Asia/Almaty"
    And the list contains "Almaty, Moscow"
    And the app is open
    And the user opened the wall-time input of "Moscow"
    And "Moscow" was removed in another tab
    When the user confirms "10:00" in "Moscow"
    Then the field closes without a message
    And the moment is still live

  @add-wall-time-input-with-hint @FR9 @FR10
  Scenario Outline: A malformed command changes nothing
    Given the moment is live in the store
    When a wall-time input arrives with the time <time> and the date <date>
    Then it is rejected as <error>
    And the moment is still live in the store

    Examples:
      | time  | date       | error        |
      | 25:00 | 2026-03-08 | INVALID_TIME |
      | 10:00 | 2026-13-01 | INVALID_DATE |

  @add-wall-time-input-with-hint @FR7
  Scenario: Hint for a DST gap
    Given the device time zone is "Asia/Almaty"
    And the interface language is "en"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    And the app is open
    When the user types "02:30" in "New York"
    Then "New York" shows the hint "02:30 does not exist on this day — clocks moved forward. Showing 03:30."
    And "Almaty" shows no hint

  @add-wall-time-input-with-hint @FR7
  Scenario: Hint for a DST overlap
    Given the device time zone is "Asia/Almaty"
    And the interface language is "ru"
    And the current instant is "2026-11-01T07:30:00Z"
    And the list contains "New York"
    And the app is open
    When the user types "01:30" in "New York"
    Then "New York" shows the hint "01:30 бывает дважды — показано первое (UTC−4)"

  @add-wall-time-input-with-hint @FR7 @FR11
  Scenario: Hint texts in Russian for a DST gap
    Given the interface language is "ru"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "New York"
    And the app is open
    When the user types "02:30" in "New York"
    Then "New York" shows the hint "02:30 не существует в этот день — часы переведены вперёд. Показано 03:30"

  @add-wall-time-input-with-hint @FR7 @FR11
  Scenario: Hint texts in English for a DST overlap
    Given the interface language is "en"
    And the current instant is "2026-11-01T07:30:00Z"
    And the list contains "New York"
    And the app is open
    When the user types "01:30" in "New York"
    Then "New York" shows the hint "01:30 occurs twice — showing the first (UTC−4)."

  @add-wall-time-input-with-hint @FR7
  Scenario Outline: The hint ends with the next change
    Given the interface language is "en"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "New York"
    And the app is open
    And the user typed "02:30" in "New York", so "New York" shows a wall-time hint
    When the user <change>
    Then no row shows a wall-time hint

    Examples:
      | change                             |
      | types 10:00 in New York            |
      | moves a day track to the next step |
      | moves to the next day              |
      | returns to now                     |

  @add-wall-time-input-with-hint @FR7 @FR9
  Scenario: The hint leaves with its row
    Given the interface language is "en"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    And the app is open
    And the user typed "02:30" in "New York", so "New York" shows a wall-time hint
    When "New York" is removed
    Then no row shows a wall-time hint
    And the moment stays pinned

  @add-wall-time-input-with-hint @FR7
  Scenario: A home change keeps the hint
    Given the device time zone is "Asia/Almaty"
    And the interface language is "en"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Moscow, New York"
    And the app is open
    And the user typed "02:30" in "New York", so "New York" shows a wall-time hint
    When the user makes "Moscow" home
    Then "New York" still shows the wall-time hint
    And the moment is pinned to "2026-03-08T07:30:00Z" with the status "GAP"
    And the date bar shows no note

  @add-wall-time-input-with-hint @FR7 @FR9
  Scenario: A device time zone change ends the hint on the Here entry
    Given the device time zone is "America/New_York"
    And the interface language is "en"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Moscow"
    And the app is open
    And the user typed "02:30" in the Here entry, so it shows a wall-time hint
    When the device time zone changes to "Asia/Almaty"
    Then no row shows a wall-time hint
    And the date bar shows no note
    And the moment is pinned to "2026-03-08T07:30:00Z" with the status "UNIQUE"

  @add-wall-time-input-with-hint @FR7
  Scenario: A wall-time input ends the gap note
    Given the device time zone is "America/New_York"
    And the interface language is "en"
    And the current instant is "2026-03-07T07:30:00Z"
    And the list contains "New York"
    And the app is open
    And the user moved to the next day, so the date bar shows the gap note
    When the user types "02:45" in "New York"
    Then the moment is pinned to "2026-03-08T07:45:00Z" with the status "GAP"
    And the date bar shows no note
    And only "New York" shows a wall-time hint

  @add-wall-time-input-with-hint @FR13
  Scenario: A renamed zone on outdated zone data
    Given the engine rejects "Europe/Kyiv" and accepts "Europe/Kiev"
    And the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains Kyiv
    When the user types "10:00" in Kyiv
    Then the moment is pinned to "2026-03-08T08:00:00Z" with the status "UNIQUE"
    And the stored zone of Kyiv is still "Europe/Kyiv"
