# Design: Colour locations without day periods in the accent

## Context

Driven by FR1, FR2, UX1 and NFR-A1 of the proposal.

Today (checked in the code):

- The presenter decides the colour concept. `presentDayColourStops` returns one stop `{ fraction: 0, colour: DayColour.NO_DAY_PERIOD }` when `getDayPeriodStops` returns `undefined` (no coordinates), and `presentHourCellColour` returns `DayColour.NO_DAY_PERIOD` for a cell without a day period (`packages/client/src/presenter/dayColours.ts`). Its doc comment says: "views only map a colour to design tokens".
- The view maps the concept to tokens, once, in `packages/client/src/views/shared/dayTrackGradient.ts`: `DAY_COLOUR_VARIABLES[DayColour.NO_DAY_PERIOD] = "--color-day-non-working"` (fill of tracks and cells) and `DAY_COLOUR_FOREGROUND_CLASS_NAMES[DayColour.NO_DAY_PERIOD] = "text-foreground"` (cell digits). The same file maps `PLAIN` and `WORKING_TIME` to `--color-accent` and `text-accent-foreground`.
- `packages/client/src/styles/tokens.css` defines `--color-accent` (`#2f5bd3` light, `#5ec2e8` dark) and `--color-accent-foreground` (`#ffffff` light, `#0b1220` dark). `packages/client/src/styles/tokens.test.ts` already checks that the accent foreground has at least 4.5:1 on the accent (its `DAY_COLOUR_TOKENS` rows "plain" and "working time"), and that the handle has at least 3:1 against every track colour.

Glossary owners touched (`docs/glossary/time-selection.md`, **Day colour**): `DayColour`, `DayColour.NO_DAY_PERIOD`, `presentDayColourStops`, `presentHourCellColour`, `DAY_COLOUR_VARIABLES`. The design extends `DAY_COLOUR_VARIABLES` and its sibling `DAY_COLOUR_FOREGROUND_CLASS_NAMES`; no new owner is created.

## Goals / Non-Goals

**Goals:** recolour a location without day periods in the accent in Time of day (FR1, FR2) with exactly the accent of a plain track (UX1) and readable digits (NFR-A1), touching one owner.

**Non-Goals:** the presenter's colour decision, the hour frame (NG2), the tokens (NG3, NG4).

## Decision

### D1: Change the token mapping, keep `DayColour.NO_DAY_PERIOD` (FR1, FR2, UX1)

`DAY_COLOUR_VARIABLES[DayColour.NO_DAY_PERIOD]` becomes `"--color-accent"` and `DAY_COLOUR_FOREGROUND_CLASS_NAMES[DayColour.NO_DAY_PERIOD]` becomes `"text-accent-foreground"`. The doc comments of `dayTrackGradient.ts` ("`NO_DAY_PERIOD` is the non-working grey") and of the `DayColour` enum ("the neutral colour of a location without day periods") are updated to say the accent. The presenter output does not change: tracks still carry one `NO_DAY_PERIOD` stop and cells still carry `NO_DAY_PERIOD`, so the unit BDD steps keep asserting the concept, and the token and real-browser assertions change.

### D2: The hour frame stays as it is (NG2)

`getHourFrameColour` decides the frame from the day colouring alone; in Time of day it stays `ACCENT`. On the row of a location without day periods the frame lies on accent cells and the framed cell is still marked by its bold digits. Deciding the frame from the listed rows would change the `grid-view` requirement "Hour frame" and is left to Q1.

## Consequences

Positive:
- One entry per map changes; Cards tracks (`buildDayTrackGradient`) and Grid cells read the same maps, so both views change together.
- No work is added to presenting (NFR-P1); contrast of the accent foreground on the accent is already guaranteed by the tokens (NFR-A1).

Negative:
- `NO_DAY_PERIOD` and `PLAIN` look alike; they stay separate concepts, which keeps the door open for Q1.
- The hour frame is not visible against the cells of such a row (D2).

## Alternatives Considered

**Let the presenter return `DayColour.PLAIN` for a location without day periods**: rejected. It merges two glossary concepts (plain is a colouring; no day period is a property of a location in Time of day) and moves a visual choice into the presenter, whose doc comment says views only map a colour to design tokens.

**A new token `--color-day-no-period` with the accent value**: rejected. A second token with the same value can drift from the accent (breaks UX1) and adds a token for no new colour (NG4).

**A foreground hour frame whenever a location without day periods is listed**: rejected for this change; it modifies the `grid-view` "Hour frame" requirement beyond the task (Q1).

## Risks / Trade-offs

- The UTC row and a working cell look the same when the user switches between Time of day and Working hours. Accepted: the owner asked for the accent.
- The e2e scenario "Readable digits on the grey" keeps its name and now checks the grey of UTC in Working hours, the colouring where UTC still has grey cells; the new scenario "Readable digits on the accent" checks Time of day.
