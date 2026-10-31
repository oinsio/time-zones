# Fix location card and header layout

Builds on the archived `add-wall-time-input-with-hint`, `add-time-sliders-to-location-cards`, `fix-day-track-handle-overlap-and-end-of-day`, `show-local-time-and-date-on-location-cards` and `add-settings-page-and-device-time-location`, which are all on `main`. The only other active change, `add-pr-preview-deploy`, touches no capability this change modifies.

## Why

Six layout defects of the main page and the Cards view, reported by the owner:

1. **The wall-time hint breaks its card.** The hint is placed between the place and time column and the day track. From 768 px that line break pushes the day track and the location menu onto a new line under the hint, so the card changes its shape while the hint is shown (approved screenshot `wall-time-hint` at 1024 px).
2. **The handle fill in the dark theme.** The owner sees the inside of the day track handle in the page background colour instead of the card's own fill.
3. **The Add location button differs by width.** Below 768 px it is an icon-only "+" at the top left; from 768 px it shows "+ Add" right of the title. It must be "+" at the top left on every width.
4. **The title moves by width.** Below 768 px the app title is centred; from 768 px it stands at the left. It must be centred on every width.
5. **Day tracks of different length in the 12-hour format.** From 768 px the track fills the space right of the time column, and the time column is as wide as its time text. `10:30 AM` and `7:30 PM` have different widths, so the tracks of two cards end at the same place but start at different places.
6. **12-hour hour labels wrap.** The last hour label under a track, at its right edge, breaks into two lines (`7` / `PM`), while the labels left of it stay on one line.

Audience: every user of the Cards view. Defects 3–6 affect screens 768 px and wider; 1 affects every width; 2 affects the dark theme.

## What Changes

- MODIFIED `time-selection` "Wall-time input layout": the wall-time hint is the last element of its card, under the day track and the location menu button, on every width. Showing or ending a hint does not move or resize anything else in the card.
- MODIFIED `time-selection` "Day track layout": the visible handle is filled with the fill of the card it stands on, in both themes. From 768 px, all day tracks of the list have the same width, whatever the local times and the hour format. Every hour label stays on one line.
- MODIFIED `locations` "Local time and date layout": from 768 px the time column has the same width on every card and holds the widest time of either hour format.
- MODIFIED `main-page` "Header actions": on every width the header shows, from left to right, the icon-only "+" Add location button, the app title centred on the page, and the settings button. The visible label "Add" («Добавить») is removed, and so is its i18n key `locations.addShort`.
- No stored data, no new state, no network. The reference moment and the hour format keep their owners (ADR-0003, ADR-0004).

Glossary terms used as they are (`docs/glossary/`): wall-time hint, wall-clock note, day track, handle, hour label, hour format, card, location row, Cards view, settings button, shell. No term is new or changed: the Add location button and the app title are not glossary terms, and the change does not name a new domain concept.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `time-selection`: MODIFIED "Wall-time input layout" and "Day track layout".
- `locations`: MODIFIED "Local time and date layout".
- `main-page`: MODIFIED "Header actions".

## Goals

- G1: A card keeps the position and size of its city, time, day track and location menu button while a wall-time hint is shown.
- G2: The header looks the same on a phone and on a desktop: "+" at the top left, the title in the centre, settings at the top right.
- G3: In the 12-hour format, the tracks line up across cards and their hour labels read on one line, as in the 24-hour format.
- G4: The handle reads as part of its card in the dark theme.

## Non-Goals

- NG1: The texts, lifetime and colours of the wall-time hint and of the gap note in the date bar stay as they are.
- NG2: The settings page header (back button and "Settings" heading) is not changed.
- NG3: The hour labels keep their count, positions and texts; only their wrapping changes. Labels that touch each other on the narrowest wide layouts are not addressed here, in both hour formats, including 24-hour labels with minutes (`05:30`) that the wider time column brings closer between 768 and about 820 px.
- NG4: Below 768 px the track layout (own line, full content width, no hour labels) stays as it is.
- NG5: No new design token, no new colour, no change of the handle's size, outline or hit area.

## Users & Scenarios

- U1: A user types `02:30` in New York on the DST day. The hint appears at the bottom of the New York card; the time, the track and the menu stay where they were.
- U2: A user on a laptop opens the app and finds "+" in the same top-left corner as on their phone, with the title in the middle.
- U3: A user with the 12-hour format compares Moscow at `10:30 AM` and New York at `3:30 AM`: both tracks start and end at the same x, and every label reads on one line (`4 PM`, `10 PM`).
- U4: A user in the dark theme sees the handle filled with the card colour, not with the darker page colour.

## Requirements

### Functional

- FR1: The wall-time hint is the last element of its card on every width: under the day track (and its hour labels from 768 px) and under the location menu button, spanning the card's content width. While a hint is shown, the city, the time, the day track and the location menu button of that card keep their positions and sizes, within 1 px, compared to the same card without the hint. Only the card's height grows by the hint.
- FR2: In the light and the dark theme, and for the dark theme coming from the system or from the Dark theme preference, the inside of the visible handle has the same colour as the fill of the card it stands on. In the dark theme that colour differs from the page background.
- FR3: On every width the Add location button shows only the "+" icon, with no visible text, and is the leftmost control of the header. Its accessible name stays "Add location" («Добавить место»). The visible label "Add" («Добавить») no longer exists.
- FR4: On every width the header shows, from left to right, the Add location button, the app title and the settings button. The centre of the title is the centre of the page width, within 1 px. The settings button stays the rightmost control. While the stored list is unreadable and the Add location button is not shown, the title stays centred and the settings button stays at the right.
- FR5: From 768 px, every day track of the list has the same width, within 1 px, whatever the local times of the cards, in both hour formats. The time column has the same width on every card and shows each time of either hour format (for example `12:59 PM`) in full, on one line.
- FR6: From 768 px, every hour label under a day track is on one line, in both hour formats and both interface languages, including the first label under the track's left edge and the last label under its right edge. The first label still starts at the track's left edge and the last still ends at its right edge, within 1 px.

### Non-Functional

#### Performance

No performance requirement: the change moves elements and fixes widths; it adds no formatter, no time zone lookup and no presenting pass. The existing work-bound scenarios stay unchanged.

#### Accessibility

- NFR-A1: The main page with the new header and the Cards view with a hint, in the 12-hour format, have no axe-core violations in the light and the dark theme at 375 px and 1024 px. Both header buttons stay at least 44 × 44 px, and Tab reaches Add location before Settings.
- NFR-A2: The hint stays a polite status (`role="status"`) with no time in a live region; moving it to the end of the card does not change what is announced.

#### Responsive

- NFR-R1: With a hint shown and in the 12-hour format, the page does not scroll horizontally at 320 px, 768 px and 2560 px.
- NFR-R2: The approved screenshots are re-approved: every main-page state at 1024 px in both themes (new header and time column), and the `wall-time-hint` state at 375 px and 1024 px in both themes. A new `12-hour` state is approved at 375 px and 1024 px in both themes.

## UX Acceptance Criteria

- UX1: The hint reads as a footnote of its card: it is the card's bottom line, and nothing above it jumps when it appears or disappears.
- UX2: The header is one pattern on every screen: "+" top left, title centred, settings top right.
- UX3: In the 12-hour format the tracks of all cards form one aligned column, as in the 24-hour format.
- UX4: In the dark theme the handle looks cut from the card, not punched through to the page background.

## UI States Matrix

The change adds no data loading. The existing states keep their behaviour; only their layout changes:

| Network | Data | UI |
|---|---|---|
| offline or online | locations with known zones | cards with equal track widths; header "+", centred title, settings |
| offline or online | a wall-time input resolved to GAP or AMBIGUOUS | the hint at the bottom of that card; the rest of the card unchanged |
| offline or online | empty list | the empty explanation; the header as above |
| offline or online | stored list unreadable | the load error with Reset; the header without "+", the title centred, settings at the right |
| offline or online | view loading | the skeleton under the same header |

## Behavior

`packages/client/src/test/features/`, tagged `@fix-location-card-and-header-layout`:

- `time_selection/time_selection_card_layout_e2e.feature` (new): hint at the bottom (FR1, UX1, NFR-A2), handle fill (FR2, UX4), equal tracks and one-line labels in the 12-hour format (FR5, FR6, UX3), no horizontal scrolling (NFR-R1), axe-core (NFR-A1);
- `main_page/main_page_header_e2e.feature`: header on every width (FR3, FR4, UX2, NFR-A1);
- `locations/locations_ui_e2e.feature`: screenshots (NFR-R2).

## Visual Reference

`docs/design/screens/phone-light.png` shows the narrow header that now holds on every width. Design tokens stay the source of truth.

## Affected IA

No changes.

## Success Metrics

- M1: With a hint shown, 0 of 4 measured elements (city, time, day track, location menu button) move or resize by more than 1 px, at 375 px and 1024 px (2 of 2 widths).
- M2: The title's centre is within 1 px of the page centre at 5 of 5 widths (375, 768, 1024, 1440, 2560 px), with and without the Add location button.
- M3: In the 12-hour format, the widths of the 4 day tracks of the list differ by at most 1 px at 3 of 3 widths (768, 1024, 1440 px).
- M4: In the 12-hour format, 20 of 20 hour labels (4 tracks × 5) are one line high at 768 px and 1024 px.
- M5: The handle's fill equals its card's fill in 4 of 4 dark-theme checks (system dark and Dark preference × 375 and 1024 px).
- M6: Stryker scoped to `views/shared/ZoneRowContent.tsx` and `views/shared/LocationRow.tsx` scores at least 95% (minimum acceptable 90%).
- M7: The traceability loop of task 7.3 prints nothing: each of FR1–FR6, NFR-A1, NFR-A2, NFR-R1, NFR-R2 and UX1–UX4 has at least one test tagged with this change.

## Open Questions

- Q1: On `main`, `DayTrack` already fills the visible handle with `bg-surface`, the token of the card (`LocationRow` is `bg-surface`), and the approved Chromium screenshot `device-time` at 1024 px in the dark theme shows the handle and the card both at `rgb(22, 33, 58)` (`#16213a`), while the page is `rgb(15, 23, 41)`. The defect was therefore not reproduced from the repository. FR2 is pinned by an E2E check against the card's computed fill for both dark-theme sources, so it fails if the handle and the card ever diverge; if the owner sees the defect in a specific browser or state, that browser or state should be named in a follow-up change.
