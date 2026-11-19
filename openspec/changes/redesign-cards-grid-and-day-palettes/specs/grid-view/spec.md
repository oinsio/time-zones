## ADDED Requirements

### Requirement: Hour cell look
Every hour cell SHALL have a radius of 5 px, stand 3 px from its neighbours, and show its digits at 15 px with weight 500 and tabular figures. From 768 px a cell MUST be 48 px high; below 768 px it MUST be 44 px high; its width follows "Hour strip width" (38 px where the strip scrolls). The hour frame, the midnight cell, the offset edge, the meeting frame, the meeting handles and the dimming of cells outside a meeting range keep their built behaviour and colours on the new cells. Inputs: the presented hour strip and the viewport width. Output: the cells. Errors: none. <!-- implements FR17, NFR-R1 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Cell sizes by width
- **GIVEN** the view mode is Grid and the stored locations are Almaty and Moscow
- **WHEN** the main page is `<width>` px wide
- **THEN** every hour cell has a 5 px radius, 15 px digits and is `<height>` px high
- **AND** neighbouring cells of a row are 3 px apart

| width | height |
|---|---|
| 390 | 44 |
| 1024 | 48 |
| 1440 | 48 |

#### Scenario: Cells 38 px wide on a phone
- **GIVEN** the view mode is Grid and the stored location is Almaty
- **WHEN** the main page is 390 px wide
- **THEN** every hour cell is 38 px wide and the strip scrolls horizontally

## MODIFIED Requirements

### Requirement: Hour cell colour
While the day colouring is Time of day (the default, see the `day-colouring` capability), an hour cell SHALL be coloured by the location's day period (night, morning, day, evening, as the `day-periods` capability defines them) that covers the largest part of the cell, and on a tie by the earlier one, with the day-period colour of the active theme and of the day palette in force that the day track uses (`day-colouring` → Day palette). A cell of a location without day periods is coloured as the `day-colouring` requirement "Locations without day periods" defines. In the dark theme the digits MUST be `#f7f8fc` on night cells and `#0b1628` on morning, day and evening cells, in both day palettes; in the light theme they are the foreground colour. In the Plain day colouring every cell is plain, and in the Working hours day colouring each cell is working or non-working, as the `day-colouring` capability defines; the digits then take the colour that the requirement "Day colours are readable" of that capability sets for the cell colour. A change of the day colouring or of the day palette MUST recolour every cell at once. <!-- implements FR4 of add-grid-hour-cells-and-hour-frame; FR2, FR9, FR11, FR12 of add-day-colouring-setting; FR6 of bind-day-periods-to-sun; FR4, FR17 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Day periods of Almaty
- **GIVEN** the day colouring is Time of day, the reference zone is `Asia/Almaty` and the reference day is 2026-03-08
- **WHEN** the hour cells of Almaty at 43.3, 76.9 are presented
- **THEN** columns 0–5 and 18–23 are night, column 6 is morning, columns 7–16 are day and column 17 is evening

#### Scenario: The larger part decides
- **GIVEN** a location whose night ends at 06:05 and whose day starts at 06:55 local time
- **WHEN** its hour cells are presented in the Time of day colouring
- **THEN** the cell that starts at 06:00 is morning
- **AND** the cell that starts at 07:00 is day

#### Scenario: A tie takes the earlier period
- **GIVEN** a location whose night ends at 06:30 local time and whose day starts after 07:00
- **WHEN** its hour cells are presented in the Time of day colouring
- **THEN** the cell that starts at 06:00 is night

#### Scenario: Theme colours of the cells
- **GIVEN** the view mode is Grid, the stored location is Almaty at 43.3, 76.9, the `<theme>` theme and the `<palette>` day palette
- **WHEN** the main page is shown at `2026-03-08T07:30:00Z`
- **THEN** column 3 has the night colour, column 6 the morning colour, column 9 the daylight colour and column 17 the evening colour of that theme and palette

| theme | palette |
|---|---|
| light | Vivid |
| light | Muted |
| dark | Vivid |
| dark | Muted |

### Requirement: Row controls are locked while a meeting range is set
In the Grid view, while a meeting range is set, the grab area, the location menu button and the wall-time input of every grid row SHALL be locked. A locked location menu button or wall-time input MUST be shown dimmed to opacity 0.4 with the default cursor and no hover or pressed effect, MUST NOT react to a pointer, a finger or a key, MUST NOT be a Tab stop and MUST be exposed to assistive technology as disabled. A locked grab area keeps its look, shows the default cursor and starts no drag; no reorder MUST start, by drag or through the location menu. When a meeting range is set while a location menu is open, the menu MUST close; a wall-time input open at that moment MUST close without changing the time. When the meeting range is removed — by Clear meeting, Now, a time selection, a reference zone change or an emptied list — every one of these controls MUST be available again. The Cards view MUST NOT lock any of them. <!-- implements FR1, FR2, UX1 of fix-grid-meeting-range-lock-and-layering; FR15 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Controls are locked during the meeting and free after it
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York at `2026-03-08T07:30:00Z`
- **WHEN** the user sets the meeting range 09:00–11:00 in Almaty
- **THEN** every location menu button is disabled and dimmed
- **AND** the cursor over every city is the default cursor
- **AND** no row offers the wall-time input
- **WHEN** the user clears the meeting range
- **THEN** every location menu button is enabled and the cursor over every city is `grab`
- **AND** every row's time opens the wall-time input

#### Scenario: Setting a meeting range closes an open location menu
- **GIVEN** the Grid view with Almaty and Moscow and Moscow's location menu open
- **WHEN** the user taps column 9 of Almaty
- **THEN** the meeting range is 09:00–10:00 and no location menu is open

#### Scenario: Cards keeps its controls with a meeting range
- **GIVEN** the meeting range 09:00–11:00 in Almaty was set in Grid
- **WHEN** the view mode is changed to Cards
- **THEN** every location menu button is enabled, a drag by the city works and every time opens the wall-time input

### Requirement: Accessible meeting state
With a meeting range set, axe-core SHALL report no violations on the Grid view in the light and the dark theme, with and without a share notice, with a meeting range input open and with its error shown. The Tab order MUST be: «Поделиться встречей», «Сбросить выбор встречи», then for each row its span button and its hour strip, then the meeting handles «Начало встречи», «Конец встречи»; no location menu button MUST be a Tab stop, and the grab area is never one. While a row's meeting range input is open, its fields «Время начала — {city}» and «Время окончания — {city}» MUST take the place of that row's span button in the Tab order, start before end, followed by that row's hour strip and so before the meeting handles. After Clear meeting the location menu buttons MUST be Tab stops again. The fields of the meeting range input MUST have accessible names, and a field with an error MUST be `aria-invalid` and described by its error. <!-- implements NFR-A1, NFR-A2 of add-grid-meeting-range-and-share; NFR-A1, NFR-A2 of fix-grid-meeting-range-lock-and-layering; FR15, NFR-A3 of redesign-cards-grid-and-day-palettes -->

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
- **THEN** each row's location menu button is a Tab stop again

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

### Requirement: Approved screenshots of the meeting state
Screenshots of the Grid view in the meeting state with the design's sample data (8 March 2026, home Almaty, Almaty, Moscow, Kolkata, New York, Russian interface, meeting 09:00–11:00 in Almaty) at 1440 × 900, 1180 × 820, 844 × 390 and 390 × 844, in the light and the dark theme, SHALL be re-taken once for the redesign and then match their approved baselines on every run. <!-- implements NFR-R2, UX1 of add-grid-meeting-range-and-share; NFR-R2 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Approved screenshots of the meeting state
- **WHEN** the Grid view with the sample meeting is rendered at `<size>` in the `<theme>` theme
- **THEN** it matches the approved screenshot

| size | theme |
|---|---|
| 1440 × 900 | light |
| 1440 × 900 | dark |
| 1180 × 820 | light |
| 1180 × 820 | dark |
| 844 × 390 | light |
| 844 × 390 | dark |
| 390 × 844 | light |
| 390 × 844 | dark |

### Requirement: Hour strip width
When the hour strip's width divided by its cell count is at least 32 px, every cell SHALL take an equal share of the strip, less the 3 px gap between cells, and all cells of the reference day MUST be visible without scrolling. Otherwise every cell MUST be 38 px wide, and the strips of all rows MUST scroll horizontally together while the row headers and row notes stay in place; the page itself MUST NOT scroll horizontally. On opening, the strips MUST be scrolled so that the hour frame is fully visible, and when the frame moves to a column outside the visible part they MUST scroll to show it. <!-- implements NFR-R1, NFR-R2, UX3 of add-grid-hour-cells-and-hour-frame; FR17, NFR-R1 of redesign-cards-grid-and-day-palettes -->

#### Scenario: All hours fit
- **GIVEN** the view mode is Grid and the stored locations are Almaty, Moscow, Kolkata and New York at `2026-03-08T07:30:00Z`
- **WHEN** the main page is `<width>` by `<height>` px
- **THEN** all 24 cells of every row are inside the panel and the strips do not scroll

| width | height |
|---|---|
| 2560 | 1440 |
| 1440 | 900 |
| 1180 | 820 |
| 844 | 390 |

#### Scenario: Phone in portrait scrolls all strips together
- **GIVEN** the view mode is Grid and the stored locations are Almaty, Moscow, Kolkata and New York at `2026-03-08T07:30:00Z`
- **WHEN** the main page is 390 by 844 px
- **THEN** every cell is 38 px wide and 8 to 10 cells of each row are visible
- **AND** the hour frame is fully visible
- **AND** the page does not scroll horizontally
- **WHEN** the user scrolls Moscow's strip to its end
- **THEN** all four strips show their last cell and Almaty's city stays at its place

#### Scenario: Frame moved out of view is scrolled into view
- **GIVEN** the Grid view at 390 by 844 px at `2026-03-08T07:30:00Z`
- **WHEN** the user focuses Almaty's hour strip and presses End
- **THEN** the hour frame is on column 23 and fully visible
