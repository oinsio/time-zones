# Spec Delta

## Purpose

The Unix time converter: a tool page that turns a Unix time or an ISO 8601 text into the exact local time of every location of the list, and a local time of any precision back into Unix time.

The sample of the scenarios: the current time is `2026-11-23T11:23:07Z` (Unix time `1795432987`), the device time zone is `Asia/Almaty`, Almaty is the home location, the list is Almaty, Moscow, Kolkata, New York. Unless a scenario says otherwise, the interface language is Russian, the hour format is 24-hour, the tool is enabled, its page is opened for the first time since the app started, and the unit choice is Auto.

## ADDED Requirements

### Requirement: Converter moment
The converter SHALL show one converter moment: an exact instant, live or pinned. It is the converter's own: it MUST NOT read or follow the reference moment, and changing it MUST NOT change the main page. It is live when the page is first opened after the app starts. While the app stays open, leaving and reopening the page MUST keep the moment, its mode, the converter input text and the unit choice. It is never stored: after a reload the page opens live. <!-- implements FR14, NG6, NG8 of add-unix-time-converter-tool -->

#### Scenario: The page opens live
- **WHEN** the user opens the converter
- **THEN** the converter input shows `1795432987` and the unit in force is «Секунды»
- **AND** the Moscow row shows «14:23:07»

#### Scenario: The reference moment is not read
- **GIVEN** the reference moment is pinned to `2026-03-09T07:30:00Z`
- **WHEN** the user opens the converter
- **THEN** the converter input shows `1795432987`

#### Scenario: The moment is kept while the app is open
- **GIVEN** the user typed `1700000000` into the converter input and went back to the main page
- **WHEN** the user opens the converter again
- **THEN** the converter input shows `1700000000` and the moment is pinned
- **WHEN** the app is reloaded and the converter is opened
- **THEN** the converter input shows the current Unix time and the moment is live

### Requirement: Converter input
The converter input SHALL read three kinds of text: a Unix time as a whole number with an optional minus sign; a Unix time in seconds with a decimal point and 1 to 9 fraction digits; an ISO 8601 date and time with `Z` or a UTC offset and up to 9 fraction digits. Leading and trailing spaces are ignored. Inside the whole part of a number, spaces and underscores are ignored, and commas are ignored when they split it into groups of three digits; they do not count as digits. A readable text MUST set the converter moment while it is typed, with no Convert action, and pins it. The input keeps the text the user typed. Inputs: the text. Effects: the converter moment. Errors: see "Converter messages". <!-- implements FR6, UX4 of add-unix-time-converter-tool -->

#### Scenario: Texts the input reads
- **WHEN** the user types `<text>` into the converter input
- **THEN** the ISO 8601 notation is `<iso>`
- **AND** the converter input still shows `<text>`

| text | iso |
|---|---|
| `1795432987` | `2026-11-23T11:23:07Z` |
| ` 1795432987 ` | `2026-11-23T11:23:07Z` |
| `1 795 432 987` | `2026-11-23T11:23:07Z` |
| `1_795_432_987` | `2026-11-23T11:23:07Z` |
| `1,795,432,987` | `2026-11-23T11:23:07Z` |
| `1 795 432 987.5` | `2026-11-23T11:23:07.500Z` |
| `1,795,432,987,123` | `2026-11-23T11:23:07.123Z` |
| `-1` | `1969-12-31T23:59:59Z` |
| `0` | `1970-01-01T00:00:00Z` |
| `1795432987.5` | `2026-11-23T11:23:07.500Z` |
| `1795432987.123456` | `2026-11-23T11:23:07.123456Z` |
| `2026-11-23T14:23:07+03:00` | `2026-11-23T11:23:07Z` |
| `2026-11-23T14:23:07.123456+03:00` | `2026-11-23T11:23:07.123456Z` |
| `2026-11-23T11:23:07.123456789Z` | `2026-11-23T11:23:07.123456789Z` |

#### Scenario: A paste replaces a text the user did not type
- **GIVEN** the converter is live
- **WHEN** the user pastes `1700000000` into the converter input
- **THEN** the converter input shows exactly `1700000000` and the moment is pinned

### Requirement: Unit detection and unit choice
The unit choice SHALL offer Auto and the four Unix time units: seconds, milliseconds, microseconds, nanoseconds. With Auto, a whole number is read by its digit count without the sign: up to 11 digits as seconds, 12–14 as milliseconds, 15–17 as microseconds, 18 and more as nanoseconds. With a fixed unit every whole number is read in that unit. The unit in force MUST be named beside the input. A number with a decimal point is read as seconds and is unreadable under another fixed unit. <!-- implements FR7 of add-unix-time-converter-tool -->

#### Scenario: Detection by digit count
- **WHEN** the user types `<text>`
- **THEN** the unit in force is `<unit>` and the ISO 8601 notation is `<iso>`

| text | unit | iso |
|---|---|---|
| `5` | Секунды | `1970-01-01T00:00:05Z` |
| `17954329870` (11 digits) | Секунды | `2538-12-13T17:51:10Z` |
| `179543298712` (12 digits) | Миллисекунды | `1975-09-10T01:08:18.712Z` |
| `1795432987123` | Миллисекунды | `2026-11-23T11:23:07.123Z` |
| `17954329871234` (14 digits) | Миллисекунды | `2538-12-13T17:51:11.234Z` |
| `179543298712345` (15 digits) | Микросекунды | `1975-09-10T01:08:18.712345Z` |
| `1795432987123456` | Микросекунды | `2026-11-23T11:23:07.123456Z` |
| `179543298712345678` (18 digits) | Наносекунды | `1975-09-10T01:08:18.712345678Z` |
| `1795432987123456789` | Наносекунды | `2026-11-23T11:23:07.123456789Z` |
| `-1795432987123` | Миллисекунды | `1913-02-08T12:36:52.877Z` |

#### Scenario: A fixed unit reads a typed number again
- **GIVEN** the user typed `1795432987`
- **WHEN** the user chooses «Миллисекунды»
- **THEN** the ISO 8601 notation is `1970-01-21T18:43:52.987Z` and the converter input still shows `1795432987`
- **WHEN** the user chooses «Авто»
- **THEN** the ISO 8601 notation is `2026-11-23T11:23:07Z`

#### Scenario: A fixed unit converts a text the user did not type
- **GIVEN** the user set the Moscow row to `14:23:07` on 23 November 2026, so the converter input shows `1795432987`
- **WHEN** the user chooses «Миллисекунды»
- **THEN** the converter input shows `1795432987000` and the Moscow row still shows «14:23:07»

#### Scenario: The unit choice does not touch an ISO 8601 text
- **GIVEN** the user typed `2026-11-23T11:23:07.123Z`
- **WHEN** the user chooses «Наносекунды»
- **THEN** the converter input still shows `2026-11-23T11:23:07.123Z` and the Moscow row shows «14:23:07.123»

### Requirement: Exact instants
The converter moment SHALL keep every digit of the value it was given, down to the nanosecond, on every supported engine. Its precision is the unit of that value: the unit in force for a whole number; for a decimal fraction or an ISO 8601 text, seconds with no fraction digit, milliseconds with 1–3, microseconds with 4–6, nanoseconds with 7–9; seconds for a live moment and for Now. Every time of the page shows the fraction digits of the precision and no more. <!-- implements FR8, G4, NFR-P3 of add-unix-time-converter-tool -->

#### Scenario: Fraction digits follow the precision
- **WHEN** the user types `<text>`
- **THEN** the Moscow row shows `<time>`

| text | time |
|---|---|
| `1795432987` | «14:23:07» |
| `1795432987123` | «14:23:07.123» |
| `1795432987123456` | «14:23:07.123456» |
| `1795432987123456789` | «14:23:07.123456789» |
| `1795432987.5` | «14:23:07.500» |
| `2026-11-23T11:23:07.1234Z` | «14:23:07.123400» |

#### Scenario: Before 1970
- **WHEN** the user types `-1` and chooses «Наносекунды»
- **THEN** the ISO 8601 notation is `1969-12-31T23:59:59.999999999Z`
- **AND** the seconds, milliseconds and microseconds notations are each `-1`

#### Scenario: The same digits without BigInt
- **GIVEN** the engine has no BigInt, as iOS Safari 12.5
- **WHEN** the user types `1795432987123456789`
- **THEN** the Moscow row shows «14:23:07.123456789»
- **AND** the nanoseconds notation is `1795432987123456789`

### Requirement: Converter rows
The converter SHALL list one converter row per location of the list, in list order: the home or Here mark, the city label, the zone line at the converter moment, the local date and the local time with seconds and the fraction of the moment's precision, in the hour format of the settings. With an empty or unreadable list it MUST show one row for the device time zone. While the list loads it shows the row skeleton. Rows follow changes of the list at once. <!-- implements FR9, FR18, UX1 of add-unix-time-converter-tool -->

#### Scenario: Rows of the sample
- **WHEN** the user types `1795432987123`
- **THEN** the rows are, in order:

| city | date | time |
|---|---|---|
| Алматы | пн, 23 нояб. | 16:23:07.123 |
| Москва | пн, 23 нояб. | 14:23:07.123 |
| Калькутта | пн, 23 нояб. | 16:53:07.123 |
| Нью-Йорк | пн, 23 нояб. | 06:23:07.123 |

#### Scenario: 12-hour format
- **GIVEN** the hour format is 12-hour
- **WHEN** the user types `1795432987123`
- **THEN** the Moscow row shows the time «2:23:07.123 PM»

#### Scenario: The zone line follows the moment
- **WHEN** the user types `1783000000`, an instant in July 2026
- **THEN** the zone line of New York names `EDT` and `UTC−4`

#### Scenario: Empty list
- **GIVEN** the location list is empty
- **WHEN** the user opens the converter
- **THEN** exactly one row is shown, for the device time zone, with the time «16:23:07»

### Requirement: Exact wall-time input
The time of a converter row SHALL be editable. It reads every text the wall-time input reads, and also seconds and a fraction of 1 to 9 digits after the minutes (`9:30:15`, `9:30:15.123456789`, `9:30:15.5 PM`). Confirming it as the wall-time input is confirmed MUST pin the converter moment to that wall-clock time on the row's date in the row's zone; missing seconds are zero; the precision follows the fraction digits. Esc restores the text. A time in a DST gap or a DST overlap follows the rules and the hint of the wall-time input. <!-- implements FR10, G3 of add-unix-time-converter-tool -->

#### Scenario: A time typed in a row
- **GIVEN** the user typed `1795432987` into the converter input
- **WHEN** the user types `<text>` into the time of the New York row and confirms
- **THEN** the converter input shows `<unix>` and the Moscow row shows `<moscow>`

| text | unix | moscow |
|---|---|---|
| `9` | `1795442400` | «17:00:00» |
| `9:30:15` | `1795444215` | «17:30:15» |
| `9:30:15.5` | `1795444215500` | «17:30:15.500» |
| `9:30:15.123456789` | `1795444215123456789` | «17:30:15.123456789» |

#### Scenario: A time in a DST gap
- **GIVEN** the New York row shows 8 March 2026
- **WHEN** the user types `2:30:15` into its time and confirms
- **THEN** the New York row shows «03:30:15» and the wall-time hint the main page shows for a DST gap

#### Scenario: Round trip to the nanosecond
- **GIVEN** the user confirmed `9:30:15.123456789` in the New York row
- **WHEN** the user types the nanoseconds notation into the converter input
- **THEN** the New York row shows «09:30:15.123456789»

### Requirement: Date of a converter row
Choosing the date of a converter row SHALL open the calendar of the date bar with that row's local date. Choosing a day MUST pin the converter moment to the row's wall-clock time, fraction included, on the chosen day in the row's zone, by the wall-clock rules. Closing the calendar without a choice changes nothing. <!-- implements FR10, FR11 of add-unix-time-converter-tool -->

#### Scenario: Another day in one location
- **GIVEN** the user typed `1795432987123`
- **WHEN** the user chooses 24 November 2026 in the calendar of the New York row
- **THEN** the New York row shows «вт, 24 нояб.» and «06:23:07.123»
- **AND** the converter input shows `1795519387123`

### Requirement: Linked fields
Every field of the converter SHALL show the same converter moment. A change made in the converter input, in the time or the date of any row, by the unit choice or by Now MUST be shown at once by the converter input, every row, every moment notation and the relative time. A field the user is typing in keeps the typed text; every other field is rewritten. <!-- implements FR11 of add-unix-time-converter-tool -->

#### Scenario: A row change rewrites the input
- **GIVEN** the user typed `2026-11-23T11:23:07Z` into the converter input
- **WHEN** the user confirms `9` in the New York row
- **THEN** the converter input shows `1795442400`, not an ISO 8601 text
- **AND** the seconds notation is `1795442400`

### Requirement: Moment notations
The converter SHALL show the moment notations of the converter moment: seconds, milliseconds, microseconds, nanoseconds and ISO 8601 with `Z`, each with a copy action that copies exactly the shown text. A unit coarser than the precision drops the finer digits towards the past; a finer unit adds zeros. The ISO 8601 notation shows the fraction digits of the precision. A copy MUST confirm in place and be announced politely as «Скопировано»; a refused copy shows «Не удалось скопировать» beside the action. <!-- implements FR12, UX5 of add-unix-time-converter-tool -->

#### Scenario: Notations of the sample
- **WHEN** the user types `1795432987123456`
- **THEN** the notations are:

| notation | text |
|---|---|
| Секунды | `1795432987` |
| Миллисекунды | `1795432987123` |
| Микросекунды | `1795432987123456` |
| Наносекунды | `1795432987123456000` |
| ISO 8601 | `2026-11-23T11:23:07.123456Z` |

#### Scenario: Dropping digits towards the past
- **WHEN** the user types `-1500` and chooses «Миллисекунды»
- **THEN** the seconds notation is `-2` and the ISO 8601 notation is `1969-12-31T23:59:58.500Z`

#### Scenario: Copy
- **GIVEN** the user typed `1795432987123`
- **WHEN** the user chooses the copy action of «Секунды»
- **THEN** the clipboard holds `1795432987` and «Скопировано» is announced
- **WHEN** the browser refuses a copy
- **THEN** «Не удалось скопировать» is shown beside the action and no dialog opens

### Requirement: Relative time
The converter SHALL show the relative time between the converter moment and the current time, in the largest non-zero unit of years, months, days, hours and minutes counted on the UTC calendar, rounded towards zero. Under one minute, and while live, it reads «сейчас» ("now"). It follows the clock. <!-- implements FR13 of add-unix-time-converter-tool -->

#### Scenario: Past and future
- **WHEN** the user types `<text>`
- **THEN** the relative time is `<russian>`, and `<english>` in the English interface

| text | russian | english |
|---|---|---|
| `1795432957` | сейчас | now |
| `1795432087` | 15 минут назад | 15 minutes ago |
| `1795440187` | через 2 часа | in 2 hours |
| `1795173787` | 3 дня назад | 3 days ago |
| `1700000000` | 3 года назад | 3 years ago |
| `0` | 56 лет назад | 56 years ago |

### Requirement: Live and Now
While live, the converter moment SHALL be the current time cut to the whole second and follow the clock every second; the converter input shows it in the unit in force. Typing a readable text, confirming a row time or choosing a date pins it. The Now button «Сейчас» MUST return it to live; it is active while pinned and inactive while live, as the Now button of the date bar. While the page is hidden nothing ticks; on return the moment is the current time. <!-- implements FR14 of add-unix-time-converter-tool -->

#### Scenario: Ticking
- **WHEN** one second passes
- **THEN** the converter input shows `1795432988` and the Moscow row shows «14:23:08»

#### Scenario: Pinned, then live again
- **WHEN** the user types `1700000000`
- **THEN** the converter input does not change when a second passes, and «Сейчас» is active
- **WHEN** the user chooses «Сейчас»
- **THEN** the converter input shows the current Unix time, follows the clock, and «Сейчас» is inactive

#### Scenario: Live in a fixed unit
- **WHEN** the user chooses «Миллисекунды» while live
- **THEN** the converter input shows `1795432987000` and the moment stays live

### Requirement: Converter messages
A text the converter input cannot read SHALL show «Введите Unix-время или дату и время в формате ISO 8601» under the input; a value outside ±8 640 000 000 000 seconds from 1970 shows «Значение вне поддерживаемого диапазона дат». An empty input shows the first text as a hint, not as an error. A row time that cannot be read behaves as an unreadable wall-time input. In each case the converter moment and every other field MUST stay as they were, and the message goes when the text becomes readable. <!-- implements FR15 of add-unix-time-converter-tool -->

#### Scenario: Unreadable texts
- **GIVEN** the user typed `1795432987`
- **WHEN** the user replaces it with `<text>`
- **THEN** the message «Введите Unix-время или дату и время в формате ISO 8601» is shown
- **AND** the Moscow row still shows «14:23:07»

| text |
|---|
| `abc` |
| `1795432987,5` (a comma before one digit) |
| `17,95432987` (commas not in groups of three) |
| `1795432987.123 456` (a space in the fraction) |
| `1795432987.1234567890` (10 fraction digits) |
| `2026-11-23T14:23:07` (no offset) |
| `2026-11-23` |

#### Scenario: A fraction under a fixed unit
- **GIVEN** the unit choice is «Миллисекунды»
- **WHEN** the user types `1795432987.5`
- **THEN** the message of an unreadable text is shown

#### Scenario: Range
- **GIVEN** the unit choice is «Секунды»
- **WHEN** the user types `8640000000000`
- **THEN** no message is shown
- **WHEN** the user types `8640000000001`
- **THEN** the message «Значение вне поддерживаемого диапазона дат» is shown

### Requirement: Show on main page
While the converter moment is pinned, «Показать на главной» ("Show on main page") SHALL pin the reference moment to the converter moment with the seconds and the fraction dropped, as a time selection does, and show the main page with the focus on the tool button. While live the action is inactive. No other data flows from the converter to the main page, and none flows back except the location list. <!-- implements FR16, NG6 of add-unix-time-converter-tool -->

#### Scenario: Seconds are dropped
- **GIVEN** the user typed `1795432987123`
- **WHEN** the user chooses «Показать на главной»
- **THEN** the main page is shown with the reference moment pinned to `2026-11-23T11:23:00Z`
- **AND** the Moscow card shows «14:23»
- **WHEN** the user opens the converter again
- **THEN** the converter input still shows `1795432987123`

### Requirement: Converter views
The converter SHALL keep a converter view registry and show its first view. Every converter view MUST receive the same presented data and the same commands and decide nothing about time by itself, so a view added to the registry needs no change outside the registry and its own files. No setting chooses a converter view while one is registered. Every registered converter view MUST pass the converter's end-to-end scenarios. <!-- implements FR17, G5, NG7 of add-unix-time-converter-tool -->

#### Scenario: A second view shows the same moment
- **GIVEN** a test registry whose first view is a test view
- **WHEN** the user opens the converter and the test view sends the text `1795432987123`
- **THEN** the test view receives the Moscow row with the time «14:23:07.123»

### Requirement: Converter strings are localized
Every text of the converter SHALL exist in Russian and English: the names of the converter input, the unit choice and its five options, the notations, the relative times, «Сейчас», «Показать на главной», the copy texts and both messages. Dates, city labels, zone lines and day period markers follow the interface language as on the main page. <!-- implements FR18 of add-unix-time-converter-tool -->

#### Scenario: English interface
- **GIVEN** the interface language is English
- **WHEN** the user types `abc`
- **THEN** the message is "Enter a Unix time or an ISO 8601 date and time"
- **AND** the unit options are "Auto", "Seconds", "Milliseconds", "Microseconds", "Nanoseconds"

### Requirement: Live work bounds
A second tick of the live converter SHALL build no new `Intl` formatter (a work bound, never a timing). The converter MUST use no BigInt. <!-- implements NFR-P2, NFR-P3 of add-unix-time-converter-tool -->

#### Scenario: Ticks build no formatter
- **GIVEN** the converter is live with 20 locations and was presented once
- **WHEN** 10 seconds pass
- **THEN** no `Intl` formatter was built

### Requirement: Accessible converter
Opening the converter SHALL move the focus to the converter input with its text selected on a device whose primary pointer is fine and can hover, and to the page heading on every other device, so that a touch keyboard does not cover the rows. Every control MUST have an accessible name and be operable by keyboard in visual order: the input, the unit choice, Now, each row's time and date, each copy action, Show on main page. A message is tied to its field and announced politely; second ticks are not announced. axe-core MUST report no violation in the light and the dark theme. <!-- implements NFR-A2, NFR-A3, NFR-A4 of add-unix-time-converter-tool -->

#### Scenario: Focus and names
- **GIVEN** the device has a fine pointer that can hover
- **WHEN** the user opens the converter at `<width>` px in the `<theme>` theme
- **THEN** the focus is on the field named «Unix-время или дата ISO 8601» and its text is selected
- **AND** axe-core reports no violations

| width | theme |
|---|---|
| 320 | light |
| 390 | dark |
| 1280 | light |

#### Scenario: Focus on a touch device
- **GIVEN** the device has a coarse pointer that cannot hover
- **WHEN** the user opens the converter
- **THEN** the focus is on the page heading «Конвертер Unix-времени» and no field is focused
- **WHEN** the user chooses the converter input and pastes `1700000000`
- **THEN** the converter input shows exactly `1700000000`

#### Scenario: A message is announced once
- **WHEN** the user types `abc`
- **THEN** the message is announced politely and the input refers to it as its description
- **WHEN** ten seconds pass while the converter is live
- **THEN** nothing is announced

### Requirement: Converter layout
The converter SHALL use the content column and the design tokens of the main page. From top to bottom: the converter input with the unit choice and Now, the relative time, the converter rows, the moment notations, Show on main page. From 320 px to 2560 px the page MUST NOT scroll horizontally, and a nanosecond time in the 12-hour format and a 22-digit Unix time MUST be fully visible at 320 px. The approved screenshots at 390 px and 1280 px in both themes MUST match. <!-- implements NFR-R1, NFR-R2, UX1, UX6 of add-unix-time-converter-tool -->

#### Scenario: Long values at 320 px
- **GIVEN** the hour format is 12-hour and the page is 320 px wide
- **WHEN** the user types `1795432987123456789`
- **THEN** the page does not scroll horizontally
- **AND** the time «2:23:07.123456789 PM» and the notation `1795432987123456789` are fully visible

#### Scenario: Approved screenshots
- **GIVEN** the user typed `1795432987123`
- **WHEN** the converter is rendered at `<width>` px in the `<theme>` theme
- **THEN** it matches the approved screenshot

| width | theme |
|---|---|
| 390 | light |
| 390 | dark |
| 1280 | light |
| 1280 | dark |
