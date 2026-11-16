# Colour locations without day periods in the accent

Builds on `bind-day-periods-to-sun` (archived 2026-11-16), which introduced the colour of a location without day periods as the non-working grey. No active change touches the `day-colouring` requirement "Locations without day periods".

## Why

In the Time of day colouring, the default, a location without day periods — UTC above all, the location people add to convert "08:00 UTC" — is painted in the non-working grey: the whole day track in Cards and every hour cell in Grid. The owner finds the grey unattractive next to the four soft day-period colours: the UTC row looks disabled rather than like a reference row. The fix is to paint it in the accent colour of the active theme, the colour the app already uses for plain tracks and working time, in the light and the dark theme alike.

Audience: every user who lists UTC (or another location without day periods) in the Time of day colouring, in Cards and in Grid.

## What Changes

- MODIFIED `day-colouring`, requirement "Locations without day periods": in the Time of day colouring the day track and every hour cell of a location without day periods are the accent colour of the active theme instead of the non-working grey; the digits of its cells take the accent foreground colour, as on plain and working cells. One colour, no blend, no message — unchanged. Plain and Working hours colour such a location as before.
- No new token: the light accent `#2f5bd3` and the dark accent `#5ec2e8` of `styles/tokens.css` are reused, and the non-working grey stays the colour of non-working time in Working hours.
- Glossary (`docs/glossary/time-selection.md`), changed term: **Day colour** — `DayColour.NO_DAY_PERIOD` becomes "the accent colour of a location without day periods" instead of "the non-working grey of a location without day periods". No new term; no *RU:* name changes (no interface text names this colour).
- `docs/architecture/domain-model.md`: the sentence "a location without coordinates (UTC) has no day periods and is coloured grey" says "is coloured in the accent".

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `day-colouring`: requirement "Locations without day periods" — the colour becomes the accent colour of the active theme, with the accent foreground digits.

## Goals

- G1: A location without day periods reads as a deliberate accent row, not a disabled grey row, in both themes and both views.
- G2: The colour of a location without day periods stays one concept with one owner: it is decided once and mapped to a design token once, in no new place.

## Non-Goals

- NG1: No change to the day periods themselves, to which locations have them, or to the coordinates rules (`day-periods` capability).
- NG2: No change to the hour frame: in Time of day it stays the accent colour across all rows (`grid-view` requirement "Hour frame"); see Q1.
- NG3: No change to the non-working grey token or to the Plain and Working hours colourings.
- NG4: No new design token and no new setting.

## Users & Scenarios

- U1: A user who plans with UTC opens Cards in the light theme: the UTC track is one accent blue bar, the other cities show their day periods.
- U2: The same user switches to Grid in the dark theme: every UTC hour cell is the dark accent with dark digits, readable at a glance.

## Requirements

### Functional

- FR1: In the Time of day colouring, the day track of a location without day periods SHALL be one colour stop at position 0 in the accent colour of the active theme (light and dark), with no blend.
- FR2: In the Time of day colouring, every hour cell of a location without day periods SHALL be filled with the accent colour of the active theme, and its digits SHALL take the accent foreground colour of that theme.
- FR3: In the Plain and the Working hours colourings, a location without day periods SHALL be coloured as every other location (unchanged), and when it gains coordinates it SHALL be recoloured by its day periods without a reload (unchanged).

### Non-Functional

#### Performance

- NFR-P1: Presenting the tracks and strips stays within the work bounds of the `day-colouring` requirement "Day periods are fast": the change adds no formatter build and no sun computation (ADR-0008).

#### Accessibility

- NFR-A1: The digits of an accent cell of a location without day periods SHALL have a contrast of at least 4.5:1 against the cell in both themes, the day track handle at least 3:1 against the accent track, and axe-core SHALL report no violations on the Grid main page listing UTC in the Time of day colouring in both themes.

#### Responsive

- NFR-R1: Not affected: no layout changes.

## UX Acceptance Criteria

- UX1: The UTC track and cells in Time of day show exactly the same accent as a Plain track in the same theme — no third, near-accent shade.
- UX2: Nothing marks the location as special: no message, icon or tooltip appears (unchanged).

## UI States Matrix

The change recolours rows that are already rendered; it loads no data and adds no state.

| Network | Data | UI |
|---|---|---|
| online or offline | list holds UTC, Time of day | UTC track and cells in the accent of the active theme |
| online or offline | list holds no location without day periods | unchanged colours |
| online or offline | empty list | unchanged empty state; no rows to colour |
| any | loading / error of stored locations | unchanged loading and recovery states; no rows to colour |

## Behavior

- `packages/client/src/test/features/day_colouring/day_colouring_day_tracks.feature` (`@colour-locations-without-day-periods-in-accent @FR1`)
- `packages/client/src/test/features/day_colouring/day_colouring_hour_cells.feature` (`@colour-locations-without-day-periods-in-accent @FR2`)
- `packages/client/src/test/features/day_colouring/day_colouring_e2e.feature` (`@colour-locations-without-day-periods-in-accent @FR1 @FR2 @NFR-A1`)

## Visual Reference

No Figma. Design tokens are the source of truth: `--color-accent` and `--color-accent-foreground` in `packages/client/src/styles/tokens.css`.

## Affected IA

No changes.

## Success Metrics

- M1: 2 of 2 themes (light, dark): in a real browser, 100% of UTC hour cells in Grid have the computed background of `--color-accent` of that theme, and 0 cells have the non-working grey.
- M2: 2 of 2 themes: the UTC day track in Cards is a gradient whose left and right ends are the accent colour of that theme.
- M3: Digit contrast on the UTC cells ≥ 4.5:1 in both themes, and 0 axe-core violations in both themes.
- M4: 0 places in production code map the colour of a location without day periods to the non-working grey token, and the scoped mutation score of the changed token mapping is ≥ 95% (minimum acceptable 90%).

## Open Questions

- Q1: In Time of day the hour frame is the accent colour, so on the row of a location without day periods it lies on accent cells and shows only as the bold digits of the framed cell. This change keeps the frame as it is (NG2). Should a later change use the foreground frame whenever such a row is listed?
