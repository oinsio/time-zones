# Design: Show clock change note on location cards

## Context

Driven by FR1–FR8, NFR-P1, NFR-A1 and UX1 from the proposal. The task fixes three constraints this design builds on:

- the offset transition search lives in the model and has one owner, `findOffsetTransitions` (`packages/client/src/model/dayPeriodWindows.ts`), which today searches one reference day plus `OFFSET_CHANGE_MARGIN_HOURS` (3 h, `constants/timeSelection.ts`) for the day track's colour stops (`getDayPeriodStops`, `model/dayPeriodStops.ts`, memoized per reference day and zone);
- the decision "which note does a row show" is taken in one place: today `getWallClockNote` (`model/wallClockNote.ts`) decides between the gap note and the wall-time hint, and the presenter only picks the row note of a location (`findRowNoteOf` in `presenter/presentZoneMoment.ts`);
- work bounds, not timings, block the PR (ADR-0008): the existing scenarios assert no transition lookup on a re-presentation of the same day, and at most 2 lookups per zone (`MAX_TRANSITION_LOOKUPS_PER_ZONE`, `src/test/workCounters.ts`) on a date change (`openspec/specs/time-selection/spec.md`, "Time selection is fast").

Layers follow ADR-0002 and `.claude/rules/architecture.md`: the model returns Temporal values, enums and numbers; only the presenter formats and translates; the view renders. The reference zone and the reference day follow ADR-0007 and ADR-0003. No ADR changes: every decision below is local to this change.

## Decision

### D1. The clock change window travels with the reference day (FR1)

`ReferenceDay` (`model/dayTrack.ts`) gains `clockChangeWindow: { start: Temporal.Instant; end: Temporal.Instant }`. `getReferenceDay(state, now)` computes it from the same zoned effective instant it already uses: `start` = start of the day `CLOCK_CHANGE_WINDOW_DAYS` (new constant, `7`, in `constants/timeSelection.ts`) before the date in the reference zone, `end` = start of the day `CLOCK_CHANGE_WINDOW_DAYS + 1` after it. The window is half-open, `[start, end)`, which is "both bound days included". Being part of the reference day, it follows the live and pinned modes, date changes and reference-zone changes with no new state or controller code; `useLocations` already passes `referenceDay` to the presenter. Test helpers that build a reference day (`src/test/referenceDay.ts`) go through `getReferenceDay`; the two object literals in `model/dayPeriodWindows.test.ts` and `test/features/time_selection/steps/time_selection_day_colours.steps.tsx` get the field.

### D2. One search per zone and window, shared with the day track (FR2, FR5, NFR-P1)

- `findOffsetTransitions(timeZoneId, span, marginHours = OFFSET_CHANGE_MARGIN_HOURS)` is extended, not copied: `span` is any `{ start, end }` (a `ReferenceDay` still fits), and it returns the transitions `t` with `span.start − margin ≤ t < span.end + margin` (it starts the `getTimeZoneTransition("next")` walk one nanosecond before the lower bound). For the colour stops the closed/open ends make no difference: offset edges are taken strictly inside the day and blend windows only ask whether the list is empty.
- New `model/clockChange.ts` owns the clock change: enums `ClockChangeDirection { FORWARD, BACK }` and `ClockChangeTense { PAST, FUTURE }`, type `ClockChange = { instant; direction; amountMinutes; wallClockTime: Temporal.PlainDateTime }`, and `getClockChanges(timeZoneId, window): readonly ClockChange[]`. It calls `findOffsetTransitions(timeZoneId, window, 0)`; for each instant it reads the offsets before (`instant` minus 1 ns) and at the instant with `getUtcOffsetMinutes` (`model/utcOffset.ts`), sets `direction` by the sign of the difference, `amountMinutes` = its absolute value, and `wallClockTime` = the instant read in UTC plus the offset before (the "03:00" of a back change and the "02:00" of a forward one, D3). A zone unknown to the engine returns `[]` (the `RangeError` guard of `getUtcOffsetMinutes` / `getLocalDateTime`).
- Memoization mirrors `getDayPeriodStops`: one cached window key (`start|end`) and a `Map` by zone; a new key clears the map. A minute tick of the same reference day hits the cache: no transition lookup (NFR-P1).
- `getDayPeriodStops` takes its transitions from `getClockChanges(timeZoneId, day.clockChangeWindow)`, keeping the instants with `day.start − 3 h ≤ t < day.end + 3 h`, instead of its own `findOffsetTransitions` call. The window always contains that span, so the stops are unchanged, and a new reference day costs one walk per zone: `1 + changes in the window` lookups, which is at most 2 for every zone of the budget scenarios (no zone has two changes within 15 days in 2026). Without this sharing, a date change would cost a zone with a change nearby 3 lookups and break the existing bound.

### D3. Time, tense and the nearest change (FR2, FR3, FR4)

- The time shown is the wall-clock time just before the change, as people say it ("at 03:00 the clocks go back"; "at 02:00 they go forward"), with the date of that wall-clock time. This matches the task's examples for `Europe/Belgrade`.
- `findNearestClockChange(changes, instant): { clockChange; tense } | undefined` (same module) picks the smallest `|change − instant|` measured in `epochMilliseconds` (no BigInt, ADR-0009); at equal distance the earlier change wins. `tense` is `PAST` when the change instant is not after the effective instant, else `FUTURE`. This runs per presentation on at most a few cached values and does no lookup.

### D4. One owner of the row note (FR6)

New `model/rowNote.ts`: `RowNoteKind { NONE, WALL_TIME_HINT, CLOCK_CHANGE_NOTE }`, `RowNote` (a discriminated union carrying the row's `WallClockNote` for the hint, or the `ClockChange` and its tense) and `getRowNote({ wallClockNote, locationId, timeZoneId, window, instant }): RowNote`. It returns the wall-time hint when `wallClockNote` (from `getWallClockNote`, unchanged) is a `ROW` note about `locationId` — the check `findRowNoteOf` does today, which moves here and is deleted from the presenter — else the nearest clock change of the window, else `NONE`. The hint priority therefore lives once, in the model, next to `getWallClockNote`; the presenter only formats what `getRowNote` returns and the view only renders it.

### D5. Presenter text (FR2, FR8, UX2)

- `presentZoneMoment` calls `getRowNote` once per row and fills either `wallTimeHint` (via `presentWallTimeHint`, unchanged) or the new optional `clockChangeNote?: string` of `PresentedZoneMoment`.
- New `presenter/clockChangeNote.ts`: `presentClockChangeNote({ clockChange, tense, language, hourFormat, translate })`. The time is `formatWallClockTime(wallClockTime.toPlainTime(), language, hourFormat)` (`presenter/localDateTime.ts`, existing). The date is the new `formatWallClockDate(plainDate, language)` next to it: it reads the plain date as UTC midnight through `getDateTimeFormatter(language, UTC_ZONE_ID, DateTimeLabelKind.DAY_AND_MONTH, HourFormat.H24)`, a new label kind with the new constant `CLOCK_CHANGE_DATE_FORMAT_OPTIONS = { day: "numeric", month: "short" }` in `constants/localDateTime.ts` ("25 окт.", "Oct 25"). Both formatters are cached, so a re-presentation builds none (NFR-P1).
- i18n keys in the `locations` namespace of `locales/en.json` and `locales/ru.json`: `clockChangePastForward`, `clockChangePastBack`, `clockChangeFutureForward`, `clockChangeFutureBack` (params `date`, `time`, `amount`), and `clockChangeAmountHours`, `clockChangeAmountMinutes`, `clockChangeAmountHoursMinutes` (params `hours`, `minutes`); the amount is split with `MINUTES_PER_HOUR`. Texts are the spec's. A `Record<ClockChangeTense, Record<ClockChangeDirection, key>>` picks the sentence key, so no branching on strings.

### D6. View (NFR-A1, UX1)

- New `views/shared/RowNoteBox.tsx` holds the current markup of the wall-time hint (`order-last` paragraph in the notice tokens with the `Info` icon, `aria-hidden`) and takes an optional `role`. `WallTimeHint` renders it with `role="status"` (unchanged DOM); the new `ClockChangeNote` renders it without a role and without `aria-live`. One look, one markup, no duplicated class string.
- `LocationRow` renders `{row.clockChangeNote !== undefined && <ClockChangeNote text={row.clockChangeNote} />}` next to the hint, after `LocationMenu`. The row's accessible name is its `aria-labelledby` parts (the `ids` passed to `ZoneRowContent`) or, for the device time location, its `aria-label`; the note gets no id in either, so it is not part of the name. `LocationRow.tsx` stays under 200 lines.

### D7. Legacy engine (iOS Safari 12.5, IANA 2022b)

The note uses the zone rules the engine reports through `Intl` (`temporal-polyfill`), like every offset in the app; there is no own tzdata (ADR-0003 known limitation, ADR-0009). Consequences on iOS Safari 12.5:

- changes added to tzdata after 2022b are not shown (for example the permanent `Asia/Almaty` change of 2024), and changes abolished after 2022b are still shown (for example `America/Mexico_City` DST, abolished in 2022f);
- canonical names the engine rejects (`Europe/Kyiv`) are read through the legacy zone shim, so their notes work;
- the code compares instants in milliseconds and creates no BigInt, so the BigInt source scan keeps passing; the transition walk is the one `getDayPeriodStops` already runs there.

No requirement asserts the legacy engine's tzdata; the behaviour is recorded here only.

### D8. Test placement

Model and presenter logic (window, tense, nearest, amounts, texts, priority, counts) are Vitest and unit BDD under jsdom (`.claude/rules/bdd-unit.md`); live region, accessible name, layout, horizontal scrolling and axe-core are E2E (`.claude/rules/bdd-e2e.md`). New test cities go to `KNOWN_CITIES` in `src/test/factories/buildLocation.ts` (unit) and in `src/test/features/locations/steps/locationsE2eHelpers.ts` (E2E): Belgrade, Lord Howe Island, Boa Vista, Chicago. The E2E device zone is `Asia/Almaty` (`playwright.bdd.config.ts`), which has no change after 2024.

## Consequences

Positive:
- One transition walk per zone and reference day serves both the colour stops and the note; the existing date-change bound holds.
- The note priority has one owner in the model; the presenter's `findRowNoteOf` disappears.
- No new state, command, storage or controller hook.

Negative:
- `ReferenceDay` grows a field that only the transition search reads.
- The stops now depend on the clock change module; a bug in the window search shows in both.
- Existing screenshots and row expectations with New York on `2026-03-08` gain a note and are re-approved.

## Alternatives Considered

**A separate search for the note**: simplest, but on a date change a zone with a change near the day costs 3 lookups and breaks the time-selection bound of 2.

**Window from the day in absolute hours (`day.start ± 7 × 24 h`)**: needs no field, but is off by an hour when the reference zone changes its offset inside the week, so the bounds of FR1 would be wrong.

**Priority in the presenter or the view** (hide the note when `wallTimeHint` is set): smears the "which note" decision over two layers, which the task forbids.

**`role="status"` like the hint**: a date change would announce every note of the list; the note is context, not feedback to an action.
