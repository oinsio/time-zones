## ADDED Requirements

### Requirement: Row controls are locked while a meeting range is set
In the Grid view, while a meeting range is set, the drag handle, the location menu button and the wall-time input of every grid row SHALL be locked. A locked control MUST be shown dimmed to opacity 0.4 with the default cursor and no hover or pressed effect, MUST NOT react to a pointer, a finger or a key, MUST NOT be a Tab stop and MUST be exposed to assistive technology as disabled; no reorder MUST start, by drag or by keyboard. When a meeting range is set while a location menu is open, the menu MUST close; a wall-time input open at that moment MUST close without changing the time. When the meeting range is removed — by Clear meeting, Now, a time selection, a reference zone change or an emptied list — every one of these controls MUST be available again. The Cards view MUST NOT lock any of them. <!-- implements FR1, FR2, UX1 of fix-grid-meeting-range-lock-and-layering -->

#### Scenario: Controls are locked during the meeting and free after it
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York at `2026-03-08T07:30:00Z`
- **WHEN** the user sets the meeting range 09:00–11:00 in Almaty
- **THEN** every drag handle and every location menu button is disabled and dimmed
- **AND** no row offers the wall-time input
- **WHEN** the user clears the meeting range
- **THEN** every drag handle and every location menu button is enabled
- **AND** every row's time opens the wall-time input

#### Scenario: Setting a meeting range closes an open location menu
- **GIVEN** the Grid view with Almaty and Moscow and Moscow's location menu open
- **WHEN** the user taps column 9 of Almaty
- **THEN** the meeting range is 09:00–10:00 and no location menu is open

#### Scenario: Cards keeps its controls with a meeting range
- **GIVEN** the meeting range 09:00–11:00 in Almaty was set in Grid
- **WHEN** the view mode is changed to Cards
- **THEN** every drag handle and every location menu button is enabled and every time opens the wall-time input

### Requirement: Meeting range input
While a meeting range is set, the span of every grid row SHALL be a button named «Ввести время встречи — {city}, {span}» ("Enter meeting time — {city}, {span}"). It MUST open the meeting range input in place of the span: the start time field «Время начала — {city}» ("Start time — {city}") and the end time field «Время окончания — {city}» ("End time — {city}") with a dash `–` between them, filled with the row's local start and end in the hour format setting; the start field MUST take the focus with its text selected. Each field MUST accept the texts the wall-time input accepts. Enter in either field, or the focus leaving both fields after a text changed, MUST confirm: the row's location, the local date the row showed when the input opened and the two times set the meeting range as "Set a meeting range from wall-clock times" of `meeting-range` says. A field whose text is not a time MUST show «Введите время в формате ЧЧ:ММ» ("Enter the time as HH:MM") and keep the input open; a pair that is refused with `INVALID_MEETING_RANGE` MUST show «Встреча должна быть внутри дня, с шагом 15 минут» ("The meeting must lie within the day, in 15-minute steps") and keep the input open with nothing changed. A pair that sets the range MUST close the input and return the focus to the row's span. Esc, or the focus leaving both fields with their texts unchanged, MUST close the input without a change. Moving the focus from one field to the other MUST NOT confirm. <!-- implements FR3, FR4, UX2 of fix-grid-meeting-range-lock-and-layering -->

#### Scenario: Type the meeting in another location's time
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York, Russian interface, 24-hour format and the meeting range 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the user opens the meeting range input of `<city>` and enters `<start>` and `<end>`
- **THEN** the meeting range is `<range>` in Almaty and the input is closed

| city | start | end | range |
|---|---|---|---|
| Almaty | 10 | 12:30 | 10:00–12:30 |
| Moscow | 8 | 10:30 | 10:00–12:30 |
| Kolkata | 9:30 | 11:30 | 09:00–11:00 |
| New York | 23 | 1 | 09:00–11:00 |

#### Scenario: Twelve-hour texts
- **GIVEN** the sample meeting, English interface and 12-hour format
- **WHEN** the user opens the meeting range input of Almaty and enters `10 am` and `12:30 pm`
- **THEN** the meeting range is 10:00–12:30 in Almaty

#### Scenario: Wrong input keeps the input open
- **GIVEN** the sample meeting in the Grid view, Russian interface
- **WHEN** the user opens the meeting range input of `<city>` and enters `<start>` and `<end>`
- **THEN** the input stays open with the error `<error>`
- **AND** the meeting range is still 09:00–11:00

| city | start | end | error |
|---|---|---|---|
| Almaty | abc | 11 | «Введите время в формате ЧЧ:ММ» |
| Almaty | 9:10 | 11 | «Встреча должна быть внутри дня, с шагом 15 минут» |
| Almaty | 22 | 2 | «Встреча должна быть внутри дня, с шагом 15 минут» |
| New York | 13 | 14 | «Встреча должна быть внутри дня, с шагом 15 минут» |

#### Scenario: Esc closes the input without a change
- **GIVEN** the sample meeting and Moscow's meeting range input open with `8` typed in the start field
- **WHEN** the user presses Esc
- **THEN** the input is closed, the meeting range is still 09:00–11:00 and the focus is on Moscow's span

### Requirement: Grid layers stay under the page bars and dialogs
Everything of the grid panel — the row header texts, the hour strips, the row notes, the hour frame, the meeting frame and the meeting handles — SHALL lie below the date bar, the notices region above it, and every dialog of the main page (the search, opened from Add location without a meeting range, and the calendar, in any state) with its backdrop, in every state of the Grid view and at every scroll position of the page and of the strips. An open location menu MUST still lie above the date bar and the grid panel. <!-- implements FR6, FR7 of fix-grid-meeting-range-lock-and-layering -->

#### Scenario: Dialogs cover the grid
- **GIVEN** the Grid view at 390 by 844 px with Almaty, Moscow, Kolkata and New York and `<state>`
- **WHEN** the user opens `<dialog>`
- **THEN** at the centre of every row header text, hour cell and meeting handle under the dialog's backdrop, the topmost element belongs to the dialog or its backdrop

| state | dialog |
|---|---|
| the hour frame | the search |
| the hour frame | the calendar |
| the meeting range 09:00–11:00 | the calendar |

#### Scenario: Rows scroll under the date bar
- **GIVEN** the Grid view at 390 by 844 px with 12 locations and the meeting range 09:00–11:00
- **WHEN** the page is scrolled so that rows pass under the date bar
- **THEN** the topmost element at the centre of the calendar button and of the Now button is that button
- **AND** no point of the date bar has a grid element on top

### Requirement: Frame lines are visible beside texts
The hour frame and the meeting frame SHALL be hidden only behind the glyphs of the row header texts — the city, the offset difference, the Here caption, each zone line part, the date, the day shift mark and the time or span — behind the row notes and behind an open wall-time input or meeting range input. Every other point of a frame's border inside a row header MUST be drawn: between and beside zone line parts, inside a time button around its digits, and beside the drag handle and the location menu button. <!-- implements FR8, UX3 of fix-grid-meeting-range-lock-and-layering -->

#### Scenario: The frame border runs through the empty parts of the header
- **GIVEN** the Grid view at `<width>` by `<height>` px with Almaty, Moscow, Kolkata and New York at `2026-03-08T07:30:00Z` and `<frame>`
- **WHEN** the main page is shown
- **THEN** no point of the frame's left and right borders inside a row is covered by an element with a background, except inside the box of a text glyph, a row note or an open input field

| width | height | frame |
|---|---|---|
| 390 | 844 | the hour frame |
| 390 | 844 | the meeting frame of 09:00–11:00 |
| 1440 | 900 | the hour frame |
| 1440 | 900 | the meeting frame of 09:00–11:00 |

### Requirement: Approved screenshots with dialogs over the grid
Screenshots of the Grid view with the design's sample data (8 March 2026, home Almaty, Almaty, Moscow, Kolkata, New York, Russian interface, light theme) SHALL match their approved baselines on every run: with the hour frame and the search dialog open at 390 × 844, and with the meeting range 09:00–11:00 in Almaty and the calendar dialog open at 1440 × 900. <!-- implements NFR-R2 of fix-grid-meeting-range-lock-and-layering -->

#### Scenario: Approved screenshots with a dialog open
- **GIVEN** the sample data with `<state>`
- **WHEN** the main page is `<width>` by `<height>` px and `<dialog>` is open
- **THEN** the page matches the approved screenshot

| width | height | state | dialog |
|---|---|---|---|
| 390 | 844 | the hour frame | the search |
| 1440 | 900 | the meeting range 09:00–11:00 | the calendar |

## MODIFIED Requirements

### Requirement: Meeting span in grid rows
While a meeting range is set, every grid row SHALL show its local span of the range, `start–end`, in the hour format setting and in the meeting time colour (`#008800` light, `#5EDB5E` dark) in place of its time; its date MUST be the local date of the start. When that date differs from the reference zone's date of the start, the row MUST show the day shift mark «днём раньше» / «днём позже» ("a day earlier" / "a day later") before the date, bold, in the danger colour of the active theme. Without a meeting range Grid shows no day shift mark. The span is the button that opens the meeting range input ("Meeting range input"), not the wall-time input. Only the glyphs of the span carry the surface background, not the rest of its button. <!-- implements FR8, UX1 of add-grid-meeting-range-and-share; FR3, FR8 of fix-grid-meeting-range-lock-and-layering -->

#### Scenario: Spans of the sample meeting
- **GIVEN** the interface language is Russian, the hour format is 24-hour and the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the Grid view is shown
- **THEN** `<city>` shows `<span>` and `<mark>`

| city | span | mark |
|---|---|---|
| Almaty | 09:00–11:00 | no day shift mark |
| Moscow | 07:00–09:00 | no day shift mark |
| Kolkata | 09:30–11:30 | no day shift mark |
| New York | 23:00–01:00 | «днём раньше» before its date of 7 March |

#### Scenario: Clear returns the times
- **GIVEN** the sample meeting is set
- **WHEN** the user clears the meeting range
- **THEN** every row shows its single time again and no row shows a day shift mark

#### Scenario: The span opens the meeting range input
- **GIVEN** the sample meeting is set
- **WHEN** the user activates Moscow's span
- **THEN** the meeting range input of Moscow opens with `07:00` and `09:00`
- **AND** no wall-time input opens

### Requirement: Accessible meeting state
With a meeting range set, axe-core SHALL report no violations on the Grid view in the light and the dark theme, with and without a share notice, with a meeting range input open and with its error shown. The Tab order MUST be: «Поделиться встречей», «Сбросить выбор встречи», then for each row its span button and its hour strip, then the meeting handles «Начало встречи», «Конец встречи»; no drag handle and no location menu button MUST be a Tab stop. While a row's meeting range input is open, its fields «Время начала — {city}» and «Время окончания — {city}» MUST take the place of that row's span button in the Tab order, start before end, followed by that row's hour strip and so before the meeting handles. After Clear meeting the drag handles and the location menu buttons MUST be Tab stops again. The fields of the meeting range input MUST have accessible names, and a field with an error MUST be `aria-invalid` and described by its error. <!-- implements NFR-A1, NFR-A2 of add-grid-meeting-range-and-share; NFR-A1, NFR-A2 of fix-grid-meeting-range-lock-and-layering -->

#### Scenario: No accessibility violations in the meeting state
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York and the sample meeting in the `<theme>` theme
- **WHEN** axe-core checks the page, before and after the copied notice appears
- **THEN** it reports no violations

| theme |
|---|
| light |
| dark |

#### Scenario: No accessibility violations with the meeting range input
- **GIVEN** the sample meeting in the `<theme>` theme and Moscow's meeting range input open
- **WHEN** axe-core checks the page, before and after the text error appears
- **THEN** it reports no violations

| theme |
|---|
| light |
| dark |

#### Scenario: Tab order skips the locked controls
- **GIVEN** the Grid view with Almaty and Moscow and the sample meeting
- **WHEN** the user presses Tab from the page start through the panel
- **THEN** the focus visits «Поделиться встречей», «Сбросить выбор встречи», Almaty's span, Almaty's hour strip, Moscow's span, Moscow's hour strip, the meeting handles «Начало встречи» and «Конец встречи» in this order
- **WHEN** the user clears the meeting range and presses Tab through the panel
- **THEN** each row's drag handle and location menu button are Tab stops again

#### Scenario: The open input's fields sit in place of the span in the Tab order
- **GIVEN** the Grid view with Almaty and Moscow, the sample meeting and Almaty's meeting range input open with the focus in «Время начала — Almaty»
- **WHEN** the user presses Tab three times without changing a text
- **THEN** the focus visits «Время окончания — Almaty», Almaty's hour strip and Moscow's span in this order
- **AND** Almaty's input is closed and the meeting range is still 09:00–11:00

#### Scenario: The keyboard alone sets the meeting
- **GIVEN** the Grid view with Almaty and Moscow, Russian interface, and the sample meeting
- **WHEN** the user tabs to Moscow's span, presses Enter, types `8`, presses Tab, types `10:30` and presses Enter
- **THEN** the title is «Встреча · 2 ч 30 мин» and the focus is on Moscow's span

#### Scenario: The open input fits on a phone
- **GIVEN** the sample meeting at `<width>` by `<height>` px
- **WHEN** the user opens Moscow's meeting range input
- **THEN** both fields are fully inside the viewport and the page does not scroll horizontally

| width | height |
|---|---|
| 320 | 640 |
| 390 | 844 |
