# Show clock change note on location cards

Builds on the archived `add-time-sliders-to-location-cards`, `add-wall-time-input-with-hint`, `select-date-with-calendar-and-now`, `set-home-location-and-show-differences`, `add-settings-page-and-device-time-location`, `replace-wall-clock-row-budgets-with-deterministic-checks` and `fix-location-card-and-header-layout`, which are all on `main`. The only other active change, `add-pr-preview-deploy`, touches no capability this change modifies.

## Why

A user who plans a call for next Sunday in Belgrade or looks back at last week's meeting time has no sign that the clocks there were or will be moved in between. The day track only shows an offset change as a colour edge, and only on the reference day itself. A wrong hour around a clock change is the classic time zone mistake, and the app already knows every change from the zone rules of the engine.

Audience: every user of the Cards view, in the live and the pinned mode. The date in the date bar is the natural anchor: a week before and after covers "this week's" and "next week's" plans.

## What Changes

- ADDED `locations` "Clock change note on location rows": when a UTC offset change of a row's zone falls within seven days before or after the date in the date bar (dates in the reference zone), the row shows a clock change note after its day track: the local date and the local time of the change, whether the clocks were moved or will be moved, the direction (forward or back) and the amount (`1 h`, `30 min`). Every change of the UTC offset counts, not only daylight saving time. Of several changes in the window, the one nearest to the reference moment is shown.
- ADDED `locations` "Clock change note and the wall-time hint": a row with a wall-time hint shows no clock change note; other rows keep theirs. The wall-time hint (texts, lifetime, `role="status"`, its relation to the gap note) is unchanged.
- ADDED `locations` "Clock change note text": exact English and Russian texts.
- ADDED `locations` "Clock change note is fast, accessible and fits every screen": no new time zone lookups or formatters on a minute tick within the same reference day; not a live region; no axe-core violations; no horizontal scrolling.
- No stored data, no new state, no network, no command. The note is derived from the canonical IANA identifier of the row, the reference moment and the reference zone (ADR-0003, ADR-0007).

New glossary terms (`docs/glossary/`), added in this change:

- **Clock change** (*RU:* перевод часов), context Time — an instant at which a zone's UTC offset changes, for any reason, with its direction and amount from the offsets before and after it. *Never:* DST switch, summer time, winter time, time shift.
- **Clock change window**, context Date selection — seven days before to seven days after the date in the date bar, in the reference zone.
- **Clock change note** (*RU:* заметка о переводе часов), context Date selection — the line in a location row about its zone's clock change in the window. *Not:* the wall-time hint, the gap note. It is never called a "hint": that word belongs to the wall-time hint.
- **Row note**, context Date selection — the one note a location row shows after its day track: the wall-time hint or the clock change note, never both.

Changed glossary entries: **Wall-time hint** and **Wall-clock note** name the new row-note owner in *Code:*. Used as they are: reference moment, reference zone, reference day, date bar, UTC offset, location row, device time location, home location, hour format, day track, gap note, minute tick, legacy engine.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `locations`: ADDED "Clock change note on location rows", "Clock change note and the wall-time hint", "Clock change note text", "Clock change note is fast, accessible and fits every screen".

## Impact

Model (offset transition search, reference day, row note), presenter (row text), Cards view row (one shared block), locales (en, ru), glossary and `docs/architecture/views.md`. No dependency, storage schema or port changes.

## Goals

- G1: Within ±7 days of the date in the date bar, every row whose zone changes its UTC offset says when and in which direction its clocks move.
- G2: The note reads in plain words: date, time, past or future, direction and amount, in the interface language and the hour format.
- G3: The note costs no work on a minute tick: the search is done once per zone and reference day.

## Non-Goals

- NG1: No "summer time" / "winter time" / DST wording and no names of zone abbreviations in the note.
- NG2: The note cannot be dismissed, and it has no link, action or setting to turn it off.
- NG3: The wall-time hint and the gap note keep their texts, lifetime and placement.
- NG4: No own time zone data: on an engine with outdated zone rules (the legacy engine, iOS Safari 12.5 with IANA 2022b) the note follows the rules that engine reports (ADR-0003 known limitation, ADR-0009).
- NG5: No note in the search results, the calendar or the date bar; the day track's offset edges are unchanged.
- NG6: Changes outside the window are not announced, however near; the window size is not configurable.

## Users & Scenarios

- U1: In Belgrade on Sunday 1 November 2026 the user sees on the Belgrade card «25 окт. в 03:00 часы переведены на 1 ч назад» and knows last week's meeting times shifted.
- U2: A user in Almaty plans a call with Belgrade for 30 March 2027, picks 25 March in the calendar and reads «28 мар. в 02:00 часы переведут на 1 ч вперёд» on the Belgrade card.
- U3: A user with Lord Howe Island in the list reads that the clocks there move by 30 minutes.
- U4: A user typed `02:30` in New York on its DST day: the New York card shows the wall-time hint only; the Belgrade card still shows its clock change note.

## Requirements

### Functional

- FR1: The clock change window SHALL span the instants from the start of the day seven days before the date in the date bar to the end of the day seven days after it, both days included, with days counted in the reference zone. It follows the date bar in the live mode (today) and in the pinned mode.
- FR2: A location row SHALL show a clock change note when its zone has at least one UTC offset change inside the window. The note MUST name the local date of the change (day and short month in the interface language), the local time at which the clocks are moved (the wall-clock time just before the change, in the hour format), the direction (forward when the offset grows, back when it shrinks) and the amount (the absolute offset difference in hours and minutes, `1 h`, `30 min`, `1 h 30 min`). Every offset change counts, not only daylight saving time.
- FR3: The note SHALL be in the past tense when the change instant is not after the effective instant of the reference moment, and in the future tense otherwise, also when the change falls on the reference day.
- FR4: When the window holds several changes, the note SHALL be about the one nearest to the effective instant; at equal distance, the earlier one.
- FR5: The note SHALL be shown in every location row whose zone qualifies, including the home location and the device time location. A row whose zone has no change in the window, or whose zone is unknown to the engine, MUST show no note.
- FR6: A row that shows a wall-time hint MUST NOT show a clock change note; every other row keeps its note. The wall-time hint keeps its texts, lifetime, `role="status"` and its relation to the gap note.
- FR7: The note SHALL appear, change and disappear with the date in the date bar, the reference moment, the reference zone, the interface language and the hour format, in the same render, with no loading state. It cannot be dismissed. Nothing about it is stored; it works offline.
- FR8: The note texts SHALL be the English and Russian texts of the `locations` spec scenarios, from translation keys present in both locale files.

### Non-Functional

#### Performance

- NFR-P1: Presenting 50 rows again at another minute of the same reference day MUST look up no time zone transition and build no date, time or region name formatter, also when rows show clock change notes. A date change keeps the existing bound of at most 2 time zone transition lookups per zone (time-selection "Time selection is fast"). The timing is reported by a `*.bench.ts` benchmark in the non-blocking CI `benchmark` job (ADR-0008).

#### Accessibility

- NFR-A1: The clock change note MUST NOT be a live region and MUST NOT be part of the row's accessible name, so a date change or a minute tick is not announced; it is readable text of the card.
- NFR-A2: The list with clock change notes, also next to a wall-time hint, has no axe-core violations in the light and the dark theme.

#### Responsive

- NFR-R1: With clock change notes shown, the locations screen MUST NOT scroll horizontally at 320 px, 768 px and 2560 px in Russian, the longer of the two texts.
- NFR-R2: The approved screenshots whose list holds a row with a change in the window (New York on `2026-03-08`) are re-approved and show the note at the bottom of that card.

## UX Acceptance Criteria

- UX1: The note reads as a footnote of its card: the bottom line of the card, in the same place and look as the wall-time hint; the city, time, day track and location menu button keep their positions.
- UX2: The note reads as one plain sentence: date, time, what happens to the clocks and by how much, without jargon.

## UI States Matrix

The note derives from data already on screen; it adds no loading.

| Network | Data | UI |
|---|---|---|
| offline or online | a row's zone changes its offset inside the window | the clock change note at the bottom of that card |
| offline or online | no change inside the window, or an unknown zone | no note; the card as before |
| offline or online | a wall-time hint in a row | that row shows only the hint; other rows keep their notes |
| offline or online | empty list | the empty explanation; no notes |
| offline or online | stored list unreadable | the load error with Reset; no notes |
| offline or online | view loading | the skeleton; no notes |

## Behavior

`packages/client/src/test/features/locations/`, tagged `@show-clock-change-note-on-location-cards`:

- `locations_clock_change_note_unit.feature`: window bounds, tense, reference day, nearest change, 30-minute change, permanent change, row kinds, wall-time hint priority, texts (FR1–FR8);
- `locations_clock_change_note_budget.feature`: work bounds (NFR-P1);
- `locations_clock_change_note_e2e.feature`: visibility, no live region, axe-core, no horizontal scrolling (FR2, NFR-A1, NFR-A2, NFR-R1, UX1);
- `locations_ui_e2e.feature`, `locations_12_hour_screenshots_e2e.feature`: re-approved screenshots (NFR-R2).

## Visual Reference

No new screen; the note uses the look of the wall-time hint (notice tokens). Design tokens stay the source of truth.

## Affected IA

No changes.

## Success Metrics

- M1: With the reference zone `Europe/Belgrade`, the Belgrade row shows the note of the change on `2026-10-25` for 15 of 15 dates in the date bar from `2026-10-18` to `2026-11-01`, and for 0 of 2 dates `2026-10-17` and `2026-11-02`.
- M2: 0 time zone transition lookups and 0 formatter builds when 50 rows with notes are presented again at another minute of the same reference day; at most 2 lookups per zone on a date change.
- M3: Stryker scoped to the changed model and presenter files scores at least 95% (minimum acceptable 90%).
- M4: 0 axe-core violations in 2 of 2 themes, and 0 horizontal scrolling at 3 of 3 widths (320, 768, 2560 px).
- M5: The traceability loop of the final task prints nothing: each of FR1–FR8, NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2, UX1, UX2 has at least one test tagged with this change.

## Open Questions

None. Decisions taken without the owner and recorded in `design.md`: the time shown is the wall-clock time before the change (D2), a tie in distance goes to the earlier change (D3), and on the legacy engine the note follows the engine's zone data (D7).
