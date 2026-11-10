## ADDED Requirements

### Requirement: Time separator while typing
A wall-time input and each field of the meeting range input SHALL keep the separator `:` between the hours and the minutes while digits are typed. When the characters just typed or pasted end at the end of the field's text and that text is made only of digits, the field MUST show the hour, then `:`, then the remaining digits, as soon as at least one digit follows the hour. The hour is:
- one digit when the first digit is 3–9;
- one digit when the first digit is 2 and the second is 4–9;
- otherwise the first two digits.

A text of digits alone that is no longer than its hour is shown as typed. A text that already holds a `:` or a `.`, a space or a letter (the 12-hour texts of `settings`) MUST be shown as typed, and so MUST a text changed by deleting characters or by typing inside it. The caret MUST stay after the last typed character. The separator changes only what the field shows: the accepted and the rejected texts of "Accepted wall-time text" and "Invalid wall-time text" keep their meaning. <!-- implements FR6, UX1 of refine-meeting-range-entry-and-handles -->

#### Scenario: Digits typed one by one
- **GIVEN** the user opened `<input>` of Almaty and its text is selected
- **WHEN** the user types the digits `<digits>` one by one
- **THEN** the field shows `<shown>` after each digit
- **AND** the caret is after the last character

| input | digits | shown |
|---|---|---|
| the wall-time input | 1030 | `1`, `10`, `10:3`, `10:30` |
| the wall-time input | 930 | `9`, `9:3`, `9:30` |
| the wall-time input | 0930 | `0`, `09`, `09:3`, `09:30` |
| the wall-time input | 2359 | `2`, `23`, `23:5`, `23:59` |
| the wall-time input | 12345 | `1`, `12`, `12:3`, `12:34`, `12:345` |
| the start field of the meeting range input | 905 | `9`, `9:0`, `9:05` |
| the end field of the meeting range input | 1130 | `1`, `11`, `11:3`, `11:30` |

#### Scenario: Texts left as typed
- **GIVEN** the user opened the wall-time input of Almaty
- **WHEN** the user types `<typed>`
- **THEN** the field shows `<shown>`

| typed | shown |
|---|---|
| `9:30` | `9:30` |
| `09.30` | `09.30` |
| `9:30 PM` | `9:30 PM` |
| `abc` | `abc` |
| `24:00` | `2:4:00` |

#### Scenario: Backspace removes the separator
- **GIVEN** the wall-time input of Almaty shows `10:3` after typing `103`
- **WHEN** the user presses Backspace twice
- **THEN** the field shows `10`
- **WHEN** the user types `4`
- **THEN** the field shows `10:4`

#### Scenario: A pasted time gets its separator
- **GIVEN** the user opened the wall-time input of Almaty with its text selected
- **WHEN** the user pastes `0930`
- **THEN** the field shows `09:30`

#### Scenario: A typed time with the separator is confirmed
- **GIVEN** the device time zone is `Asia/Almaty`, the current instant is `2026-03-08T07:30:00Z` and the list contains Almaty and New York
- **WHEN** the user opens the wall-time input of New York, types the digits `1040` on the keyboard and presses Enter
- **THEN** New York shows `10:40`

#### Scenario: Rejected texts stay rejected
- **GIVEN** the interface language is English
- **WHEN** the user types `<typed>` into the wall-time input of New York and presses Enter
- **THEN** the field shows the error "Enter the time as HH:MM"

| typed |
|---|
| `24:00` |
| `12345` |
| `9:60` |
