# Design: Show the UTC offset on each location row

## Context

Driven by FR1–FR6, NFR-P1 and UX1 of `proposal.md` (see proposal.md — Why). Current state, checked in `packages/client/src/`:

- `presenter/presentLocationRows.ts` turns `Location[]` into `LocationRow { id, cityLabel, countryName }`; `controller/useLocations.ts` calls it inside a `useMemo` keyed on `[locations, language]`.
- `controller/LocationsProvider.tsx` owns the store and takes injectable `repository` and `writeScheduler` props; `AppShell` mounts it without props.
- `lib/temporal.ts` defines the `Clock` port with `systemClock` and `fakeClock(isoTimestamp, timeZone)`. No production module reads a clock yet.
- `views/shared/LocationRow.tsx` renders the city on the first line and the country (when not empty) on a muted second line; Cards renders rows through `views/shared/LocationList.tsx`.
- The model has no reference moment (LIVE / PINNED) yet; ADR-0003 plans it.

Binding rules: ADR-0002 and `.claude/rules/architecture.md` — "Selectors return Temporal values, enums and numbers — never human-readable strings", the presenter is "the only layer that formats times and dates, applies i18n", the controller "owns side effects", the model must "read 'now' only through the `Clock` port; never start timers". `.claude/rules/temporal.md` — "Derive UTC offsets and DST state from `ZonedDateTime` for the specific instant — never cache or hardcode offsets", "Add `clock: Clock = systemClock` parameter to functions using current time", "Use `fakeClock` in tests".

## Goals / Non-Goals

**Goals:** place each piece of the offset in the layer the rules give it; make the instant injectable so tests use `fakeClock`.

**Non-Goals:** introducing the reference moment, a clock tick or `getLocationSnapshot` from `docs/architecture/domain-model.md`; those belong to the reference-moment change. No global architectural decision is made here, so no ADR is needed.

## Decisions

### D1. Model: offset in minutes as a number

`src/model/utcOffset.ts` exports `getUtcOffsetMinutes(timeZoneId: string, instant: Temporal.Instant): number | undefined`, re-exported from `src/model/index.ts`. It computes `instant.toZonedDateTimeISO(timeZoneId).offsetNanoseconds` and converts it to whole minutes (`Math.trunc(offsetNanoseconds / NANOSECONDS_PER_MINUTE)`). When Temporal throws for an unknown identifier (`RangeError`) it returns `undefined` (FR6) — an expected failure is returned, not thrown. It imports `Temporal` from `@/lib/temporal` only. Pure: the instant is an argument, the model reads no clock.

Alternatives: returning a formatted string from the model — rejected, selectors must not return human-readable strings. Returning a `Temporal.Duration` — rejected, minutes are enough for the formatter and easier to test with `it.each`.

### D2. Presenter: one formatter and the row field

`src/presenter/utcOffset.ts` exports `formatUtcOffset(offsetMinutes: number, utcPrefix: string): string` (FR3): `0` → prefix alone; otherwise prefix + sign (`UTC_OFFSET_PLUS_SIGN` `+`, `UTC_OFFSET_MINUS_SIGN` `−`) + whole hours, and `UTC_OFFSET_MINUTES_SEPARATOR` `:` + minutes padded to `UTC_OFFSET_MINUTES_DIGITS` (2) with `UTC_OFFSET_MINUTES_PAD` `0` only when minutes are not zero. Uses `MINUTES_PER_HOUR` (60).

`presentLocationRows(locations, context)` takes a context object `{ language: SupportedLanguage; instant: Temporal.Instant; translate: TFunction }` (type `TFunction` from `i18next`) instead of the current `language` argument, and adds `utcOffsetLabel: string` to `LocationRow` — the formatted offset, or `""` when `getUtcOffsetMinutes` returns `undefined`. The prefix is `translate("locations.utcOffsetPrefix")` (FR5), so the presenter stays the only layer applying i18n.

Alternatives: the controller passing the translated prefix string — rejected, it would apply i18n outside the presenter. Importing the global i18next instance into the presenter — rejected, it hides the dependency and makes Russian tests depend on global state.

### D3. Constants

New `src/constants/utcOffset.ts`, re-exported from `src/constants/index.ts`: `NANOSECONDS_PER_MINUTE = 60_000_000_000`, `MINUTES_PER_HOUR = 60`, `UTC_OFFSET_PLUS_SIGN = "+"`, `UTC_OFFSET_MINUS_SIGN = "−"`, `UTC_OFFSET_MINUTES_SEPARATOR = ":"`, `UTC_OFFSET_MINUTES_DIGITS = 2`, `UTC_OFFSET_MINUTES_PAD = "0"` (`.claude/rules/code-style.md`: business constants live in `src/constants/`).

### D4. Controller: the instant is read when rows are presented

`LocationsProvider` gets an optional `clock?: Clock` prop defaulting to `systemClock` and puts it into `LocationsContextValue` (`controller/locationsContext.ts`). `useLocations` takes `clock` from the context and `t` from `useTranslation()`, and calls `clock.instant()` inside the existing `useMemo`, now keyed on `[locations, language, t, clock]`. So the offset is computed whenever the rows are presented again (FR4: app open, add, remove, other-tab change, language change) and never on a timer (NG2). `AppShell` stays unchanged and gets `systemClock` by default.

Alternatives: a minute tick now — rejected, out of scope (NG2) and owned by the reference-moment change. Reading `Temporal.Now` in the presenter — rejected, `.claude/rules/temporal.md` requires the `Clock` parameter and `fakeClock` in tests.

### D5. View: the offset on the secondary line

`views/shared/LocationRow.tsx` renders the secondary line when the country or the offset is not empty: the country and the offset as two `<span>` siblings in a wrapping flex line with a gap (`flex flex-wrap gap-x-2 text-sm text-muted-foreground`), offset after the country (UX1). No new design tokens. Because `LocationRow` is a shared block (ADR-0005 "views compose `views/shared/` components"), any later view that reuses it gets the offset too. Placing the offset after the country keeps existing substring assertions such as `toHaveTextContent("AlmatyKazakhstan")` valid.

### D6. Tests and their placement

- Pure functions (`getUtcOffsetMinutes`, `formatUtcOffset`, `presentLocationRows`) — Vitest with `it.each`, `fakeClock(...).instant()` for instants.
- Unit BDD `src/test/features/locations/locations_utc_offset_unit.feature` + `steps/locations_utc_offset_unit.steps.tsx` (`_unit` because a paired `_e2e` file exists, `.claude/rules/bdd-unit.md`): renders `LocationsProvider` with `createInMemoryLocationRepository` (from `@/adapters`), `fakeClock(...)` and a harness that shows `useLocations().rows` through `LocationList` from `@/views/shared`; asserts row text in jsdom. The in-memory repository loads a list as given, so the unknown-zone row (FR6) is reachable there.
- E2E `src/test/features/locations/locations_utc_offset_e2e.feature` + `steps/locations_utc_offset_e2e.steps.ts`: axe-core and layout need a real browser (`.claude/rules/bdd-e2e.md`, ADR-0001). It reuses the existing steps "the stored locations are …", "the screen is {int} px wide for the locations", "the user opens the locations app", "the locations screen does not scroll horizontally", "the locations screen uses the … theme", "the locations are in the … state", "the locations screen has no accessibility violations", and adds one step reading a row's offset text. Kolkata and Kathmandu have no DST, so their offsets are stable under the real browser clock.

## Consequences

Positive:
- The model stays pure and string-free; formatting and i18n stay in the presenter.
- Tests control time through `fakeClock` without `vi.useFakeTimers()`.

Negative:
- `presentLocationRows` changes its signature; its callers and tests (`useLocations.ts`, `presentLocationRows.test.ts`, `useLocations.test.tsx`, `LocationList.test.tsx` row fixtures) are updated.
- The 8 approved "list" screenshots change once and must be re-approved.

## Risks / Trade-offs

- [The device's tz rules are outdated] → offsets follow the browser's data; accepted as in ADR-0003 "Known limitation".
- [An open page passes a DST switch] → the offset stays stale until the rows are presented again; accepted by NG2, fixed by the later clock tick.
- [`useMemo` keyed on `t`] → `t` changes on language change, which already triggers recomputation through `language`; harmless.

## Migration Plan

None: no stored data changes; rollback is reverting the code.
