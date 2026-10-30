# Keep the Now button visible when live

Builds on the archived `select-date-with-calendar-and-now`, `add-time-sliders-to-location-cards`, `show-here-entry-for-device-time` and `add-wall-time-input-with-hint`, which are all on `main`. There are no other active changes, so nothing blocks this one.

## Why

The Now button of the date bar is shown only while the reference moment is pinned. When the moment is live, the button disappears. When the user picks a time or a date, it appears again. So the bar changes its content and layout on every switch between live and pinned. Below 768 px the right side of the bar is empty while live. From 768 px the centred group gets wider and moves when Now appears. Users also cannot tell that the button exists until they leave the current time.

The task asks for a Now button that is always shown. It is active while the moment is pinned. While the moment is live it is inactive and grey, in a grey that fits the current theme (light or dark). Everything else about the button stays as it is.

Audience: every user of the main page, in every view, at every width and in both themes.

## What Changes

- MODIFIED `date-selection` "Return to now": the Now button is shown in both modes. While the moment is pinned it is active and returns the moment to live, as before. While live it is inactive: activating it does nothing.
- MODIFIED `date-selection` "Reference moment": when the app opens live, the Now button is inactive. It is no longer hidden.
- MODIFIED `date-selection` "Date bar": the bar always holds the Now button.
- MODIFIED `date-selection` "Date bar on every page state": in every page state where the bar is shown (loading, view failed to load, empty list, unreadable stored list, storage unavailable, offline) the bar holds Now — inactive while live, active while pinned.
- MODIFIED `date-selection` "Keyboard-operable date selection": Tab reaches Now only while it is active. An inactive Now is skipped.
- MODIFIED `date-selection` "Accessible date selection": an inactive Now keeps its name "Now" («Сейчас») and is exposed as disabled.
- MODIFIED `date-selection` "Date bar layout": an inactive Now has the same place, size, clock icon and label as an active one. It uses the theme's grey fill and the theme's muted foreground colour, not the accent colours. The screenshots of live states are re-approved.
- MODIFIED `time-selection` "Time selection works with the date bar", "Day track layout" and "The pinned wall-time moment drives every row", and `locations` "Select a time on the Here entry": "the Now button is shown / not shown" becomes "the Now button is active / inactive".
- No stored data changes. The reference moment is never stored (ADR-0003, ADR-0004). The date bar needs no network.

Glossary (`docs/glossary/date-selection.md`). The change is delivered as handoff patch H1, because the implement stage writes only under `packages/`:

- CHANGED **Now button**: "It is shown only while the moment is pinned" becomes "It is always shown in the date bar. It is active while the moment is pinned and inactive while live: grey, skipped by Tab, and activating it does nothing." *Code:* `DateBar` (the button), `RESET_TO_NOW` (the command). *RU:* «Сейчас», unchanged.
- The same patch aligns the two other documents that say Now is hidden while live: `docs/architecture/views.md` (the "Now button" and "Time display" building blocks, and the inactive grey under "Visual style") and `docs/architecture/open-questions.md` Q6.
- Used as they are: date bar, reference moment, live, pinned, reference zone, Here entry, time selection, date change, wall-time input.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `date-selection`: MODIFIED "Reference moment", "Return to now", "Date bar", "Date bar on every page state", "Keyboard-operable date selection", "Accessible date selection" and "Date bar layout".
- `time-selection`: MODIFIED "Time selection works with the date bar", "Day track layout" and "The pinned wall-time moment drives every row".
- `locations`: MODIFIED "Select a time on the Here entry".

## Goals

- G1: The date bar shows the same 4 controls in both modes: previous day, the date, next day and Now.
- G2: A user can tell from Now's colour alone whether the moment is live (grey) or pinned (accent), in the light and the dark theme.

## Non-Goals

- NG1: Changing what an active Now does. It returns the moment to live and moves the focus to the date button, as before.
- NG2: Changing the other bar controls, the calendar, the gap note or the announcement of the shown date.
- NG3: Changing the model or the presenter. The live and pinned modes, `RESET_TO_NOW` and `presentDateBar` stay as they are.
- NG4: A new label, tooltip or hint for the inactive Now. Its label stays "Now" («Сейчас»).
- NG5: Changing the approved design screens in `docs/design/screens/`. They show a pinned moment only.

## Users & Scenarios

- U1: A user opens the app and sees the current time. The bar shows a grey Now. Tapping it does nothing.
- U2: The user moves to the next day. Now turns accent-filled in the same place, and the bar does not move. Tapping Now shows the current time again, and Now turns grey.
- U3: A keyboard user tabs through the bar while live. The focus goes from the next-day button to the next control after the bar and skips the inactive Now.

## Requirements

### Functional

- FR1: The date bar shows the Now button in both modes of the reference moment, in every state of the main page where the bar is shown: loading, view failed to load, empty list, unreadable stored list, storage unavailable and offline.
- FR2: While the moment is live, Now is inactive. Activating it by pointer, touch, Enter or Space changes nothing: the moment stays live and nothing is announced.
- FR3: While the moment is pinned, Now is active and keeps its current behaviour. Activating it makes the moment live, every row shows the current instant at once, the focus moves to the date button, and Now becomes inactive.
- FR4: An inactive Now shows the same clock icon and the same label as an active one. Its fill is the theme's grey (`--color-muted`) and its label and icon use the theme's muted foreground colour (`--color-muted-foreground`). An active Now keeps the accent fill and the accent foreground colour.

### Non-Functional

#### Performance

None. The change adds no computation: the view reads the mode it already receives.

#### Accessibility

- NFR-A1: An inactive Now keeps the accessible name "Now" («Сейчас» in Russian) and is exposed as disabled. An active Now is not exposed as disabled. axe-core reports no violations with the bar live and with the bar pinned, in the light and the dark theme.
- NFR-A2: Tab visits the previous-day button, the date button, the next-day button and, only while it is active, Now, in that order. An inactive Now is not a Tab stop. After an active Now is activated, the focus is on the date button.
- NFR-A3: The inactive label is at least 4.5:1 against the inactive fill in both themes. This follows the WCAG 2.1 AA text contrast, even though inactive controls are exempt from it.

#### Responsive

- NFR-R1: Now keeps its place in both modes. Below 768 px it sits at the right of the bar, and from 768 px it is part of the centred group. Its box is the same, within 1 px, live and pinned, at 375 px and at 1024 px. It stays at least 44 × 44 px. The page does not scroll horizontally at 320 px and 2560 px, live or pinned.
- NFR-R2: The approved screenshots of states with a live moment are re-approved with the grey Now, at 375 px and 1024 px in both themes. The "pinned" and "time-selected" screenshots stay unchanged.

## UX Acceptance Criteria

- UX1: In both themes the inactive Now reads as grey and clearly not accent-coloured, and it does not look like a control that can be used.
- UX2: Pinning the moment or returning to now does not move or resize any control of the bar. Only Now's colours change.

## UI States Matrix

The change adds no data loading. Now follows the mode of the reference moment in every state where the date bar is shown:

| Network | Data | UI |
|---|---|---|
| offline or online | the view is loading | date bar with Now; inactive while live, active while pinned |
| offline or online | the view failed to load | date bar with Now; inactive while live, active while pinned |
| offline or online | empty list (only the Here entry) | date bar with Now; inactive while live, active while pinned |
| offline or online | stored list unreadable (error with reset) | date bar with Now; inactive while live, active while pinned |
| offline or online | storage unavailable (warning) | date bar with Now; inactive while live, active while pinned |
| offline | any of the above | the same; Now needs no network |

## Behavior

The features live in `packages/client/src/test/features/` and are tagged `@keep-now-button-visible-when-live`:

- `date_selection/date_selection_reference_moment.feature` (unit): Now is inactive when the app opens and after Now; activating an inactive Now changes nothing (FR1, FR2, FR3);
- `date_selection/date_selection_calendar.feature`, `time_selection/time_selection_moment.feature`, `time_selection/time_selection_wall_time_input_unit.feature`, `locations/locations_here_entry_changes_unit.feature` (unit): "the Now button is active" after a date, time or wall-time pin (FR3);
- `date_selection/date_selection_now_e2e.feature` (new): Tab skips an inactive Now, the inactive Now is named and disabled, a click on it changes nothing, its grey colours, the same box live and pinned (FR2, FR4, NFR-A1, NFR-A2, NFR-R1, UX1, UX2);
- `date_selection/date_selection_e2e.feature`: axe-core with the bar live and pinned, and Tab order while pinned (NFR-A1, NFR-A2);
- `time_selection/time_selection_touch_e2e.feature`, `time_selection/time_selection_wall_time_input_e2e.feature`: active and inactive Now in a real browser (FR2, FR3);
- `locations/locations_ui_e2e.feature`: re-approved screenshots (NFR-R2).

## Visual Reference

`docs/design/screens/phone-light.png` and `phone-dark.png` show the active, accent-filled Now of a pinned moment. They show no live moment. The inactive Now uses the tokens of FR4. Design tokens stay the source of truth.

## Affected IA

No changes.

## Success Metrics

- M1: In 2 of 2 themes the live Now's computed background colour equals `--color-muted` and its text colour equals `--color-muted-foreground`. After a move to the next day they equal `--color-accent` and `--color-accent-foreground`.
- M2: The inactive label's contrast against the inactive fill is at least 4.5:1 in 2 of 2 themes. With the planned values it is 5.30:1 in the light theme and 5.08:1 in the dark theme.
- M3: In 4 of 4 checks (375 px and 1024 px × light and dark theme), Now's box live and pinned differs by at most 1 px in x, y, width and height.
- M4: axe-core reports 0 violations in 4 of 4 states: live and pinned × light and dark.
- M5: In 2 of 2 attempts to activate Now on a live moment (a click in jsdom and a forced click in a real browser), the moment stays live and the shown date does not change. Enter and Space cannot reach an inactive Now, because Tab skips it (NFR-A2).
- M6: Stryker scoped to `views/shared/DateBar.tsx` scores at least 95% (minimum acceptable 90%).
- M7: The traceability loop of task 5.1 prints nothing: each of FR1–FR4, NFR-A1–NFR-A3, NFR-R1, NFR-R2, UX1, UX2 has at least one test tagged with this change.

## Open Questions

None.
