# Redesign the cards, the grid and the day colours

Builds the whole redesign agreed with the owner on 18–19 November 2026: [`docs/design/redesign/spec.md`](../../../docs/design/redesign/spec.md) (sections 1–12) and its 32 screens in `docs/design/redesign/screens/` (listed in [`docs/design/redesign/README.md`](../../../docs/design/redesign/README.md)). Rule of this change: sizes, colours and behaviour come only from `spec.md` and the screens; where they disagree `spec.md` wins; what neither says stays as built. Section numbers below (§N) are sections of `spec.md`. No active change touches the capabilities modified here.

## Why

The app looks like the first phone mock-ups: a centred title between two buttons, a drag handle on every card, a one-row card from 768 px with fixed columns that leaves the track squeezed, a full-width page on large screens, an accent-filled Now and one fixed set of day colours. The owner has decided a new look for every part of the main page and Grid, a second set of day colours, and reorder without a handle, so cards gain room and the touch layout matches what people expect from list apps. Today a colour change also means editing the dark values twice in `styles/tokens.css`; the owner wants every colour to be one value so the palettes can later become user-editable.

Audience: every user, in both views, both themes and every width from 320 px to 2560 px.

## What Changes

- **Tokens (§1, §2).** New light and dark values of the page background, surface, foreground, muted foreground, accent and accent foreground. The single `--color-border` is replaced by two tokens: the **card border** (cards, Grid panel and its dividers) and the **control border** (buttons, fields, settings groups, menu), plus the **inactive control border** (inactive Now) and the **handle border** (colour and width). The dark theme values are written once in the token source; the system dark theme gets them from the same declaration. Each colour is one value. Tokens not listed in §2 keep their values (notice, danger, meeting colours, midnight shade, non-working grey, muted fill).
- **Day palette (§3).** A new preference with two values, Vivid (default) and Muted (the colours of today), stored with the other preferences (schema version 7, migrated). It colours the day tracks and the hour cells only in the Time of day colouring. A new settings group «Цвета» / "Colours" directly under the colouring group, shown only in Time of day, with two options drawn as **palette swatches**.
- **Header (§4).** Title at the left; Add location (Lucide `Plus`) and Settings (Lucide `Settings`, the gear) at the right in the accent colour; no divider line. The meeting bar and the settings page header stay as built.
- **Location card, narrow (§5)** and **wide (§6).** New sizes, radius 14 px, card border, city and time on one line with the location menu button, the offset difference after the city, the zone line joined by middle dots with no dot at a wrap, the date on the second line at the right, the day track under it; marks Lucide `House` and `MapPin`, no visible "here" caption; growth rules; the day period marker (AM / PM) 14 px. From 768 px a two-line card with the track across the card and hour labels under it. **REMOVED:** the one-row card layout from 768 px. The page content sits in a centred column of at most 1120 px.
- **Day track (§7).** Bar 12 px on every width; visible handle 23 px filled with its card's surface and outlined with the handle border; hit areas as built.
- **Date bar (§8).** Page background, no top line, date 16 px / 700, Now an outlined button with its own inactive look.
- **Reorder (§9).** **REMOVED:** the drag handle in Cards and Grid and the keyboard reorder through it. A location is picked up by the **grab area** (the place part of its row header): hold 250 ms by touch, move 4 px with a mouse or pen; the picked-up card is lifted. The location menu gains «Поднять выше» / "Move up" and «Опустить ниже» / "Move down" — the keyboard and single-pointer path.
- **Grid (§10).** One panel with the card border, row header in the new type sizes, hour cells 3 px apart with radius 5 px in the day palette's colours.
- **Device time location and UTC (§11).** The device time location shows the Here mark without caption and the zone line «Время устройства · CET · UTC+1»; a location in the zone `UTC` shows «Всемирное время» / "Universal Time" in place of the country, hidden by the country toggle.
- **Regressions kept out (§12).** One automated scenario for each of the five earlier defects.
- **Glossary.** New terms: **Day palette** (RU «Цвета»: «Яркие», «Приглушённые»; values Vivid, Muted), **Palette swatch**, **Grab area**, **Day period marker** (the AM / PM text, `getDayPeriodMarkers` already owns it), **Universal Time label**, **Card border** and **Control border**. Changed terms: **Reorder** (grab area and menu items, no drag handle), **Drag handle** (removed), **Location menu** (Move up, Move down), **Here mark** (map pin, no caption), **Home mark** (Lucide house), **Row header** (no drag handle), **Zone line** (middle dots, Universal Time), **Now button** (outlined), **Settings page** and **Preferences** (the day palette), **Card** and **Grid row**.
- **Docs.** `docs/architecture/views.md` (Grid, Cards, Shared building blocks, Visual style, Overlays) describes the built redesign; the 32 screens move from `docs/design/redesign/screens/` to `docs/design/screens/` and replace the old ones, `docs/design/README.md` lists them, and `docs/design/redesign/` is removed — this change builds every part of it (its README: "When the last change is archived, this folder is removed").

## Capabilities

### New Capabilities

_None._ The day palette is a part of the existing `day-colouring` and `settings` capabilities.

### Modified Capabilities

- `main-page`: header actions; Grid view rows; new content column.
- `locations`: list in the Cards view, reorder (dragging, keyboard path, transitions, accessibility, strings), Here mark, leading mark, offset difference text, local time and date layout, location menu, device time location, zone line and its layout, UTC offset on rows, card layout.
- `home-location`: home mark, home over Here mark, home actions in the menu.
- `time-selection`: local hour labels, day track layout, wall-time input layout.
- `date-selection`: date bar layout.
- `day-colouring`: the day palette, readable colours, approved screenshots.
- `settings`: the Colours group, option group, preferences storage, settings page layout, strings.
- `grid-view`: hour cell colour and look, locked controls, approved screenshots.

## Goals

- G1: Every screen of `docs/design/redesign/screens/` is reproduced by the app at its width, theme and palette, with `spec.md` winning where they differ.
- G2: Changing any colour of either theme or either day palette is an edit of exactly one value in the token source.
- G3: A location can be reordered without a dedicated handle by mouse, pen, finger and keyboard.
- G4: None of the five regressions of §12 comes back, each guarded by an automated scenario.

## Non-Goals

- NG1: No change to search, the calendar, the wall-time input behaviour, the meeting range, Share meeting, the notices, the loading, error, empty and offline states: they take the new tokens and nothing else.
- NG2: No change to the font (Manrope), to the other settings groups, or to how dates are written (interface language conventions, Russian in lower case).
- NG3: No change to day periods, the reference day, handle positions or the hour cell computation.
- NG4: No user-editable colours (§1 only asks that nothing blocks them later) and no third palette; a truly vivid light palette is the owner's later work (§13).
- NG5: No change to the meeting bar or the settings page header.

## Users & Scenarios

- U1: A phone user opens Cards: the title at the left, «+» and the gear at the right, cards with big city and time on one line, the zone line «Россия · МСК · UTC+3» and the date under it, the track under them.
- U2: A desktop user at 1440 px sees the content in a 1120 px column; each card has its header on one line and a full-width track with hour labels.
- U3: A user switches «Цвета» to «Приглушённые» and both views go back to the soft colours of today.
- U4: A touch user holds the city of Moscow for a quarter of a second, the card lifts and is dropped above Almaty; a keyboard user opens Moscow's menu and picks «Поднять выше».
- U5: A user with UTC in the list reads «Всемирное время» under it; a user without home reads «Время устройства · CET · UTC+1» on the device time location.

## Requirements

### Functional

- FR1: The design tokens SHALL take the light and dark values of §2: page background, surface, card border, control border, inactive control border, foreground, muted foreground, accent, accent foreground, handle border colour and width (2 px light, 3 px dark). Cards, the Grid panel and its dividers SHALL use the card border; buttons, fields, settings groups and the location menu the control border. The surface SHALL be one flat colour. Tokens not listed in §2 keep their values.
- FR2: The dark values SHALL be written once in the token source and serve both the Dark theme preference and the system dark theme; every colour of a theme or a day palette SHALL be one value, and no colour value SHALL live in a component.
- FR3: A preference, the day palette, SHALL hold Vivid (default) or Muted, with the colours of §3 for night, morning, day and evening in each theme. It SHALL be saved with the other preferences, survive a restart, be migrated into documents written before it (as Vivid) and be shared with other open tabs.
- FR4: In the Time of day colouring the day tracks of Cards and the hour cells of Grid SHALL use the four colours of the day palette in force. Plain and Working hours SHALL NOT change with the palette. In the dark theme digits on night cells SHALL be `#f7f8fc` and on morning, day and evening cells `#0b1628`, in both palettes; in the light theme digits are the foreground colour.
- FR5: The settings page SHALL show a group captioned «Цвета» / "Colours" directly under the colouring group, only while the colouring is Time of day, with the options «Яркие» / "Vivid" and «Приглушённые» / "Muted" built from the option group. Each option SHALL show a palette swatch (24 × 24 px, radius 5 px, four equal vertical stripes night, morning, day, evening of that palette in the active theme, 2 px outline in the surface colour) and be named by its option name as accessible name and pointer hint. It appears and disappears as the working hours row does.
- FR6: The header SHALL show the title at the left (27 px / 700; 23 px up to 360 px wide) and Add location (`Plus`) then Settings (`Settings`) at the right, in the accent colour in both themes, 27 px icons in 44 × 44 px targets, in that Tab order, with no divider under the header. The meeting bar keeps its built layout.
- FR7: Below 768 px a card SHALL follow §5: surface, 1 px card border, radius 14 px, padding 10 / 15 / 11 px (sides 18 px from 411 px; 13 px up to 360 px), 12 px between cards, list side padding 13 px; line 1 the mark, the city (24 / 700), the offset difference (16 / 600, muted) and at the right the time (26 / 700) and 14 px after it the location menu button; line 2 the zone line at the left and the date at the right (14 px, muted); then the day track 12 px under line 2; type sizes 26 / 28 / 15 from 411 px and 21 / 24 / 13 up to 360 px.
- FR8: A card SHALL grow instead of cutting: a long city wraps (never an ellipsis) with the offset difference after it; when the city and the time do not fit on one line the time with the menu button moves to its own line at the right; the zone line wraps between its parts; in the 12-hour format the day period marker is 14 px / 700, 4 px after the digits.
- FR9: The zone line SHALL join its parts with a middle dot (` · `) at even spacing and SHALL show no dot where it wraps: no line starts or ends with a dot. The zone label still decides the parts.
- FR10: The home mark SHALL be Lucide `House` and the Here mark Lucide `MapPin`, 23 px, accent colour; no row shows a visible "here" caption; the accessible labels stay.
- FR11: From 768 px a card SHALL have two lines (§6): line 1 the mark, the city (26 px), the offset difference and the zone line (15 px) on one baseline, and at the right the date (15 px), the time (28 px) and the location menu button; line 2 the day track across the card's content width with the hour labels under it (12 px, muted, tabular, first under the left edge and last under the right edge, each on one line). Card padding 12 / 20 px. The one-row card layout is removed.
- FR12: The header, the list and the date bar group SHALL sit in a centred column of at most 1120 px; the page SHALL NOT stretch content to the full width.
- FR13: The day track bar SHALL be 12 px high and fully rounded on every width; the visible handle SHALL be a 23 px circle filled with the surface colour of its card with the handle border; the slider hit area stays at least 44 px high and the handle hit area 44 × 44 px. Positions, the shared reference day and the accent bar of a location without day periods stay as built.
- FR14: The date bar SHALL have the page background and no top line, stay stuck to the bottom of the viewport, show the date at 16 px / 700 in the foreground colour, and show Now as an outlined button (44 px high, radius 13 px, 1 px control border, 18 px clock icon, 16 px / 600 label): active with a foreground label, inactive with the inactive control border and the muted label, at the same place and size. When Now is active does not change.
- FR15: No card or grid row SHALL show a drag handle. A drag SHALL start only from the grab area (mark, city, offset difference, zone line): by touch after a 250 ms hold that moves at most 5 px (a move before that scrolls the page), by mouse or pen after 4 px of movement. The cursor over the grab area is `grab`; text selection and the iOS long-press callout are off there. The time, the menu button, the day track and the hour cells never start a drag. The picked-up card is lifted (shadow, scale 1.02) and the others make room before the drop. In Grid, while a meeting range is set, no drag starts.
- FR16: The location menu SHALL offer, in this order, the home action, «Поднять выше» / "Move up", «Опустить ниже» / "Move down" and «Удалить» / "Remove". Move up is disabled on the first row and Move down on the last; each moves the location by one position, and the move is announced politely ("Moscow moved to position 1 of 3"). The keyboard reorder through a handle is removed.
- FR17: The Grid view SHALL be one panel with the surface, the card border, radius 14 px and dividers in the card border colour, inside the 1120 px column from 768 px. The row header from 768 px: mark (20 px), city 22 px / 700, offset difference, zone line (14 px); at the right the date (14 px), the time 26 px / 700 and the menu button. Below 768 px: city 20 px with the zone line under it; time 24 px with the date under it. Hour cells: radius 5 px, 3 px apart, 15 px / 500 digits, 48 px high from 768 px and 38 × 44 px below. Hour frame, midnight cell, offset edge, meeting frame, meeting handles and dimming work as built.
- FR18: The device time location SHALL show the Here mark (Home mark while home) without a caption and the zone line «Время устройства · CET · UTC+1» / "Device time · CET · UTC+1"; the device-time text stays whatever the zone label says.
- FR19: A city location in the zone `UTC` SHALL show «Всемирное время» / "Universal Time" in place of the country as its zone line, hidden by the country toggle of the zone label.
- FR20 (§12.1): The visible day track handle SHALL NOT cover the time or the location menu button at any position of the reference day, at every width; in the wide card the track has its own line.
- FR21 (§12.2): All day tracks of a list SHALL have the same width, within 1 px, in the 12-hour and the 24-hour format.
- FR22 (§12.3): Every hour label SHALL be on one line and no two hour labels SHALL touch.
- FR23 (§12.4): The visible handle SHALL be filled with the surface colour of its own card in every theme and palette.
- FR24 (§12.5): The wall-time hint and the clock change note SHALL stay the last element of their card and SHALL NOT move or resize the city, the time, the day track or the location menu button.
- FR25: The glossary, `docs/architecture/views.md` and `docs/design/` SHALL describe the built redesign, with the new and changed terms of "What Changes" and the screens moved as described there.

### Non-Functional

#### Performance

- NFR-P1: The existing work bounds hold (ADR-0008): presenting 50 rows again in the same language and reference day builds no date, time or region name formatter, also in the 12-hour format with the day period marker split from the digits; a change of the day palette re-presents no colour stops (the palette is a token swap) and looks up no zone transition.
- NFR-P2: The initial JavaScript stays at most 150 KB gzipped and holds no drag-and-drop code.

#### Accessibility

- NFR-A1: axe-core SHALL report no violations on the main page in Cards and in Grid and on the settings page for each of the four pairs of theme and day palette (light Vivid, light Muted, dark Vivid, dark Muted), at 375 px and 1024 px.
- NFR-A2: Contrast in both themes and both palettes: text at least 4.5:1 (digits on every cell colour, muted text, inactive Now label: 5.7:1 light and 8.1:1 dark on the page background), controls and the control border at least 3:1 against their background, the handle's fill or border at least 3:1 against every track colour under it. The card border (2.2:1 on white in the light theme) is the one accepted exception, for cards and the Grid panel only.
- NFR-A3: Reorder, the menu items and the Colours group are fully operable with the keyboard: Move up and Move down follow the menu button pattern, a disabled item is exposed as disabled, focus returns to the moved location's menu button; the Colours group is a radio group named «Цвета», one Tab stop, arrows move the choice. Header buttons, menu button, Now, options and handles keep 44 × 44 px targets.

#### Responsive

- NFR-R1: At 320, 390, 768, 820, 1024, 1440 and 2560 px, in the 24-hour and the 12-hour format, the main page in Cards and in Grid and the settings page SHALL NOT scroll horizontally, cards keep the layout of FR7, FR8 or FR11 by width, and the content column is at most 1120 px wide and centred.
- NFR-R2: The approved screenshots of the main page in Cards and in Grid and of the settings page SHALL be re-taken with this change and then match on every run.

## UX Acceptance Criteria

- UX1: Each re-approved screenshot matches its screen in `docs/design/redesign/screens/` at the same width, theme, palette and data, except where `spec.md` differs from the screen.
- UX2: The Colours group appears and disappears exactly as the working hours row does: switching the colouring moves no group above it.
- UX3: The picked-up card reads as lifted above the list (shadow, scale 1.02) and the cards it passes slide away before the drop.
- UX4: The header, cards, Grid panel and date bar read as one centred column on wide screens; no element touches the column edges.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| online or offline | locations listed | redesigned cards or grid rows in the content column; nothing about the network is shown |
| online or offline | empty list | the built empty state in the content column, new tokens; header «+» opens the search |
| any | stored list unreadable | the built load error with Reset; header shows the gear only, title at the left |
| any | storage unavailable | the built storage warning above the date bar; reorder and palette work for the session |
| any | loading the view | the built view skeleton with the new tokens |
| any | stored preferences unreadable | the built unreadable note with Reset; Vivid in force until reset |
| any | one location | no drag starts (nothing to reorder); Move up and Move down both disabled |
| any | meeting range set (Grid) | grab area and location menu locked as built |

## Behavior

Gherkin under `packages/client/src/test/features/`, tagged `@redesign-cards-grid-and-day-palettes`: `settings/settings_day_palette_*.feature`, `locations/locations_reorder_*.feature`, `locations/locations_card_layout_e2e.feature`, `main_page/main_page_header_e2e.feature`, `time_selection/time_selection_layout_e2e.feature`, `date_selection/date_selection_layout_e2e.feature`, `grid_view/grid_view_redesign_e2e.feature`, `locations/locations_redesign_regressions_e2e.feature` (see `tasks.md`).

## Visual Reference

`docs/design/redesign/spec.md` and `docs/design/redesign/screens/*.html|png`. Design tokens in `src/styles/tokens.css` are the source of truth for values.

## Affected IA

No changes: the pages, regions and navigation stay; only the header's order and the location menu's items change.

## Success Metrics

- M1: 4 of 4 theme-and-palette pairs pass axe-core with 0 violations on Cards, Grid and settings at 375 px and 1024 px (24 checks).
- M2: 0 horizontal scroll at 7 widths × 2 hour formats × 2 views (28 checks), plus the settings page at 7 widths.
- M3: 5 of 5 regressions of §12 have a passing automated scenario tagged `@redesign-cards-grid-and-day-palettes`.
- M4: `tokens.css` declares each colour of each theme and each palette exactly once (0 duplicated dark declarations), checked by a unit test.
- M5: Mutation score at least 95% (minimum 90%) on each new or changed model, presenter and controller file of this change.
- M6: 0 drag handles in the DOM of Cards and Grid; 2 menu items (Move up, Move down) on every row of a list of 2 or more.
- M7: Every FR, NFR and UX id of this proposal is referenced by at least one test or feature file carrying the change tag.

## Open Questions

- Q1 (closed): `spec.md` §11 gives the UTC zone line as «Всемирное время» alone, and the UTC screens show no `UTC` after it. Resolved in design D9: the Universal Time label takes the country's place, and the zone abbreviation and UTC offset of `UTC`, which only repeat the city label `UTC`, are not shown; with the country toggle off the UTC row shows no zone line.
- Q2 (out of scope, §13): a truly vivid light palette — the owner tunes the Vivid light values later in `tokens.css`.
