## ADDED Requirements

### Requirement: Wall-time input on every row
The time of every location card whose time zone is known, and the time of the Here entry, SHALL be a wall-time input. Activating it by tap, click, Enter or Space MUST open a field that holds the row's current time, fully selected. A row whose zone the browser does not know shows no time and MUST have no wall-time input. The input needs no network. <!-- implements FR1 of add-wall-time-input-with-hint -->

#### Scenario: Open the field
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York
- **WHEN** the user opens the wall-time input of New York
- **THEN** the field holds `03:30`, fully selected

#### Scenario: No input for an unknown zone
- **GIVEN** the list holds Moscow and a location whose zone the browser does not know (for example `Mars/Olympus_Mons`)
- **WHEN** the list is presented
- **THEN** Moscow has a wall-time input
- **AND** the other location has none

### Requirement: Closing the wall-time input
Escape, or leaving the field without changing its text, SHALL close the field and change nothing. After Enter or Escape, focus MUST return to the row's time. <!-- implements FR5 of add-wall-time-input-with-hint -->

#### Scenario: Cancel
- **GIVEN** the moment is live
- **AND** the user opened the wall-time input of New York
- **WHEN** the user cancels
- **THEN** the moment is still live
- **AND** focus is on the time of New York

### Requirement: Accepted wall-time text
A wall-time input SHALL accept a 24-hour wall-clock time written as `H`, `HH`, `HMM`, `HHMM`, `H:MM`, `HH:MM`, `H.MM` or `HH.MM`. One or two digits name whole hours with minutes `00`. Hours MUST be 0–23 and minutes 0–59, written with two digits. Spaces before and after the text MUST be ignored. Inputs: the typed text. Output: a wall-clock time of hours and minutes. <!-- implements FR2 of add-wall-time-input-with-hint -->

#### Scenario: Accepted texts
- **WHEN** the user confirms the text `<text>`
- **THEN** the typed wall-clock time is `<time>`

| text | time |
|---|---|
| `9` | `09:00` |
| `09` | `09:00` |
| `930` | `09:30` |
| `0930` | `09:30` |
| `9:30` | `09:30` |
| `09:30` | `09:30` |
| `09.30` | `09:30` |
| ` 9:30 ` | `09:30` |
| `0:00` | `00:00` |
| `23:59` | `23:59` |

### Requirement: Invalid wall-time text
Any text that is not an accepted wall-time text, including the empty text, SHALL change nothing, whether it is confirmed with Enter or by leaving the field. The field MUST stay open and MUST show the error "Enter the time as HH:MM" / «Введите время в формате ЧЧ:ММ», linked to the field. <!-- implements FR6 of add-wall-time-input-with-hint -->

#### Scenario: Rejected texts
- **GIVEN** the interface language is English
- **AND** the moment is live
- **WHEN** the user confirms the text `<text>`
- **THEN** the field shows the error "Enter the time as HH:MM"
- **AND** the moment is still live

| text |
|---|
| `24:00` |
| `9:60` |
| `abc` |
| `12345` |
| `9:3` |
| (empty) |

### Requirement: A wall-time input pins the reference moment
Confirming an accepted time SHALL pin the reference moment to that wall-clock time in the row's zone (the device time zone for the Here entry), on the local date the row showed when the field opened. A time in a DST gap MUST move forward by the gap; a time in a DST overlap MUST take the earlier instant. The outcome MUST be reported as `UNIQUE`, `GAP` or `AMBIGUOUS`. <!-- implements FR3 of add-wall-time-input-with-hint -->

#### Scenario: Type a time in another city
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty, Moscow, Kolkata and New York
- **WHEN** the user types `10:40` in New York
- **THEN** the moment is pinned to `2026-03-08T14:40:00Z` with the status `UNIQUE`
- **AND** Almaty shows `19:40`, Moscow `17:40` and Kolkata `20:10`

#### Scenario: Wall-clock outcomes of a typed time
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `<now>`
- **AND** the list contains New York
- **WHEN** the user types `<typed>` in New York
- **THEN** the moment is pinned to `<pinned>` with the status `<status>`

| now | typed | pinned | status |
|---|---|---|---|
| `2026-06-01T07:30:00Z` | `10:00` | `2026-06-01T14:00:00Z` | `UNIQUE` |
| `2026-03-08T07:30:00Z` | `02:30` | `2026-03-08T07:30:00Z` | `GAP` |
| `2026-11-01T07:30:00Z` | `01:30` | `2026-11-01T05:30:00Z` | `AMBIGUOUS` |

#### Scenario: Type a time in the Here entry
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains only Moscow, so the Here entry is shown
- **WHEN** the user types `08:00` in the Here entry
- **THEN** the moment is pinned to `2026-03-08T03:00:00Z`
- **AND** Moscow shows `06:00`

### Requirement: The pinned wall-time moment drives every row
After a wall-time input, every row's time, date, UTC offset and handle SHALL show the new moment in the same render. When the instant lies outside the current reference day, the day tracks and the date bar MUST move to the reference day that contains it. From live, the input MUST show the Now button, and Now MUST return to live. Typing the instant already pinned, with the same outcome in the same row, MUST change nothing. <!-- implements FR4, FR8 of add-wall-time-input-with-hint -->

#### Scenario: The typed instant leaves the reference day
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York
- **WHEN** the user types `23:00` in New York
- **THEN** the moment is pinned to `2026-03-09T03:00:00Z`
- **AND** the date bar shows 9 March
- **AND** the reference day runs from `2026-03-08T19:00:00Z` to `2026-03-09T19:00:00Z`
- **AND** the Now button is shown

### Requirement: Wall-time input is never stored
A wall-time input SHALL NOT be written to storage and SHALL NOT be passed to other open tabs. A change of the list in another tab MUST keep the moment. When the typed row no longer exists (the location was removed, or a location now shows the device time instead of the Here entry), nothing MUST change and the field MUST close without a message. A command with a malformed time or date MUST be rejected and change nothing. <!-- implements FR9, FR10 of add-wall-time-input-with-hint -->

#### Scenario: Nothing is stored or shared
- **GIVEN** the list contains Almaty and New York
- **WHEN** the user types 20 times in New York and then returns to now
- **THEN** nothing is written to storage
- **AND** no other tab receives a change

#### Scenario: The location is gone while typing
- **GIVEN** the user opened the wall-time input of Moscow
- **AND** Moscow was removed in another tab
- **WHEN** the user confirms `10:00`
- **THEN** the field closes without a message
- **AND** the reference moment is unchanged

#### Scenario: A malformed command changes nothing
- **GIVEN** the moment is live
- **WHEN** a wall-time input arrives with the time `25:00` or the date `2026-13-01`
- **THEN** it is rejected
- **AND** the moment is still live

### Requirement: Wall-time hint texts
When a wall-time input resolves to `GAP` or `AMBIGUOUS`, only the row where the time was typed SHALL show the wall-time hint, in the interface language. On `GAP` it MUST name the typed time and the shown time. On `AMBIGUOUS` it MUST name the typed time and the UTC offset of the shown instant in that row's zone. `UNIQUE` MUST show no hint. The exact texts are in the scenarios. <!-- implements FR7 of add-wall-time-input-with-hint -->

#### Scenario: Hint for a DST gap
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York
- **WHEN** the user types `02:30` in New York
- **THEN** New York shows the hint "02:30 does not exist on this day — clocks moved forward. Showing 03:30."
- **AND** Almaty shows no hint

#### Scenario: Hint for a DST overlap
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the current instant is `2026-11-01T07:30:00Z`
- **AND** the list contains New York
- **WHEN** the user types `01:30` in New York
- **THEN** New York shows the hint «01:30 бывает дважды — показано первое (UTC−4)»

#### Scenario: Hint texts in Russian for a DST gap
- **GIVEN** the interface language is Russian
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains New York
- **WHEN** the user types `02:30` in New York
- **THEN** New York shows the hint «02:30 не существует в этот день — часы переведены вперёд. Показано 03:30»

#### Scenario: Hint texts in English for a DST overlap
- **GIVEN** the interface language is English
- **AND** the current instant is `2026-11-01T07:30:00Z`
- **AND** the list contains New York
- **WHEN** the user types `01:30` in New York
- **THEN** New York shows the hint "01:30 occurs twice — showing the first (UTC−4)."

### Requirement: Wall-time hint lifetime
The wall-time hint SHALL stay until the next wall-time input, time selection, date change or Now. A change of the reference zone (home set or cleared) MUST keep a hint on a location. A change of the device time zone MUST end a hint on the Here entry and keep the pinned instant. When its row is removed, or the Here entry that carries it disappears, the hint MUST disappear and the moment MUST stay. <!-- implements FR7, FR9 of add-wall-time-input-with-hint -->

#### Scenario: The hint ends with the next change
- **GIVEN** New York shows a wall-time hint
- **WHEN** the user <change>
- **THEN** no row shows a wall-time hint

| change |
|---|
| types `10:00` in New York |
| moves a day track to the next step |
| moves to the next day |
| returns to now |

#### Scenario: The hint leaves with its row
- **GIVEN** New York shows a wall-time hint
- **WHEN** New York is removed
- **THEN** no row shows a wall-time hint
- **AND** the moment stays pinned

#### Scenario: A home change keeps the hint
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Moscow and New York
- **AND** the user typed `02:30` in New York, so New York shows a wall-time hint
- **WHEN** the user makes Moscow home
- **THEN** New York still shows the wall-time hint
- **AND** the moment is still pinned to `2026-03-08T07:30:00Z` with the status `GAP`
- **AND** the date bar shows no note

#### Scenario: A device time zone change ends the hint on the Here entry
- **GIVEN** the device time zone is `America/New_York`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains only Moscow, so the Here entry is shown
- **AND** the user typed `02:30` in the Here entry, so it shows a wall-time hint
- **WHEN** the device time zone changes to `Asia/Almaty`
- **THEN** no row shows a wall-time hint
- **AND** the date bar shows no note
- **AND** the moment is still pinned to `2026-03-08T07:30:00Z`

### Requirement: One wall-clock note at a time
At most one note about a wall-clock time SHALL be visible: a wall-time hint in one row, or the gap note in the date bar, never both. A date change never produces a wall-time hint, and a wall-time input never produces the gap note. <!-- implements FR7 of add-wall-time-input-with-hint -->

#### Scenario: A wall-time input ends the gap note
- **GIVEN** the device time zone is `America/New_York`
- **AND** the current instant is `2026-03-07T07:30:00Z`
- **AND** the list contains New York
- **AND** the user moved to the next day, so the date bar shows the gap note
- **WHEN** the user types `02:45` in New York
- **THEN** the moment is pinned to `2026-03-08T07:45:00Z` with the status `GAP`
- **AND** the date bar shows no note
- **AND** only New York shows a wall-time hint

### Requirement: Wall-time input strings are localized
The input's name, the input error and both wall-time hints SHALL exist in English and Russian. The time button and its field MUST be named "Enter time — {city}, {time}" / «Ввести время — {city}, {time}», with the row's city label and shown time, so no two rows share a name. <!-- implements FR11, NFR-A2 of add-wall-time-input-with-hint -->

#### Scenario: Names in both languages
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Moscow
- **WHEN** the interface language is `<language>`
- **THEN** the time of Moscow is named `<name>`

| language | name |
|---|---|
| English | `Enter time — Moscow, 10:30` |
| Russian | `Ввести время — Москва, 10:30` |

### Requirement: Wall-time input is fast
A wall-time input followed by presenting 50 rows SHALL stay within fixed work bounds. Presenting the rows again after the input MUST build no new date or time formatter, also while a wall-time hint is shown. Resolving the typed time MUST convert wall-clock time to an instant in the typed row's zone only. Timing is reported by a non-blocking benchmark, never asserted in unit tests (ADR-0008). <!-- implements NFR-P1 of add-wall-time-input-with-hint -->

#### Scenario: No new formatter after a wall-time input
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **AND** 50 rows are presented, one of them New York
- **AND** the user typed `02:30` in New York, so New York shows a wall-time hint
- **WHEN** the rows are presented again
- **THEN** no date or time formatter is built

#### Scenario: The typed time is resolved in its row's zone only
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **AND** 50 rows are presented, one of them New York
- **WHEN** the user types `10:40` in New York
- **THEN** wall-clock time is converted to an instant only in `America/New_York`

### Requirement: Accessible wall-time input
The wall-time input SHALL pass axe-core with the time as a button, the field open, the field with an error, and a `GAP` and an `AMBIGUOUS` hint, in the light and dark themes. The hint MUST be announced politely; times that change in other rows MUST NOT be announced. The time button MUST show a visible focus ring and have a hit area of at least 44 × 44 px. <!-- implements NFR-A1, NFR-A3, UX1 of add-wall-time-input-with-hint -->

#### Scenario: No accessibility violations
- **WHEN** the page shows `<state>` in the `<theme>` theme
- **THEN** axe-core reports no violations

| state | theme |
|---|---|
| the time buttons | light |
| the time buttons | dark |
| an open field | light |
| an open field | dark |
| a field with an error | light |
| a field with an error | dark |
| a `GAP` hint | light |
| a `GAP` hint | dark |
| an `AMBIGUOUS` hint | light |
| an `AMBIGUOUS` hint | dark |

### Requirement: Keyboard-safe wall-time input
Keys typed in the field SHALL NOT start a card reorder and SHALL NOT scroll the page. Tab MUST leave the field and confirm it as Enter does. The field MUST request a numeric keyboard and no autocompletion. <!-- implements NFR-A4, NFR-A2 of add-wall-time-input-with-hint -->

#### Scenario: Keyboard-only input
- **GIVEN** the list contains Almaty and New York
- **WHEN** the user focuses the time of New York with Tab, presses Enter, types `1040` and presses Enter
- **THEN** New York shows `10:40`
- **AND** focus is on the time of New York
- **AND** the order of the cards is unchanged

### Requirement: Wall-time input layout
With the field open or a hint shown, the page SHALL NOT scroll horizontally at 320 px and 2560 px. The open field MUST take the place of the time and MUST NOT change the card's size. The hint MUST sit between the country line and the day track, wrap inside the card and take colours from design tokens. Screenshots at 375 and 1024 px, in both themes, MUST include an open field and a hint. <!-- implements NFR-R1, NFR-R2, UX2, UX3 of add-wall-time-input-with-hint -->

#### Scenario: No horizontal scrolling
- **GIVEN** the viewport is `<width>` px wide
- **AND** New York shows a wall-time hint
- **WHEN** the user opens the wall-time input of Almaty
- **THEN** the page does not scroll horizontally

| width |
|---|
| 320 |
| 2560 |

### Requirement: Wall-time input opens without Pointer Events
On an engine without Pointer Events (iOS Safari 12.5), a tap on a row's time SHALL open the wall-time input: the time responds to a plain click, never to pointer events. The field MUST be a text field that requests a numeric keyboard, never a native time field, whose format follows the system. <!-- implements FR13 of add-wall-time-input-with-hint -->

#### Scenario: Tap opens the field without Pointer Events
- **GIVEN** the engine has no Pointer Events
- **AND** the list contains New York
- **WHEN** the user taps the time of New York
- **THEN** the wall-time input of New York is open

### Requirement: Wall-time input in a renamed zone
On an engine that rejects a canonical zone ID and accepts its legacy zone name (see the `browser-compatibility` capability), a wall-time input in that zone SHALL pin the same instant, with the same wall-clock status, as on a modern engine. The zone MUST stay stored and compared by its canonical ID. Resolving a wall-time input MUST NOT use BigInt at run time. <!-- implements FR13 of add-wall-time-input-with-hint -->

#### Scenario: A renamed zone on outdated zone data
- **GIVEN** the engine rejects `Europe/Kyiv` and accepts `Europe/Kiev`
- **AND** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Kyiv (`Europe/Kyiv`)
- **WHEN** the user types `10:00` in Kyiv
- **THEN** the moment is pinned to `2026-03-08T08:00:00Z` with the status `UNIQUE`
- **AND** the stored zone of Kyiv is still `Europe/Kyiv`

### Requirement: Type an exact time in every view
Typing an exact time is part of the view contract (ADR-0002). For every registered view, a wall-time input in any row MUST change the time shown for every row, and Now MUST return them to the current time. <!-- implements FR12 of add-wall-time-input-with-hint -->

#### Scenario: Type an exact time
- **GIVEN** the view under contract is shown
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the stored locations are Almaty and Moscow
- **WHEN** the user types `11:45` in Moscow
- **THEN** Almaty shows `13:45` and Moscow shows `11:45`
- **WHEN** the user returns to now
- **THEN** Almaty shows `12:30` and Moscow shows `10:30`
