# Review: show-utc-offset-on-location-rows

## Summary

| Item | Value |
|---|---|
| Tasks verified | 17/17 |
| Requirements traced | 29/31 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 0 |

## Tasks

- ✅ 1.1 — `packages/client/src/constants/utcOffset.ts:2-8` defines the seven constants exactly as design D3 (`UTC_OFFSET_MINUS_SIGN = "−"`, U+2212); re-exported at `packages/client/src/constants/index.ts:19-27`.
- ✅ 1.2 — `locations.utcOffsetPrefix: "UTC"` in `packages/client/src/locales/en.json:30` and `packages/client/src/locales/ru.json:30`.
- ✅ 2.1 — `getUtcOffsetMinutes` in `packages/client/src/model/utcOffset.ts:9-20` (Temporal `toZonedDateTimeISO(...).offsetNanoseconds`, `RangeError` → `undefined`, other errors rethrown); `it.each` matrix with `fakeClock` instants in `packages/client/src/model/utcOffset.test.ts:9-24` (Moscow, Kolkata, Kathmandu, New York July/January, UTC, Mars zone); exported at `packages/client/src/model/index.ts:20`.
- ✅ 3.1 — `formatUtcOffset` in `packages/client/src/presenter/utcOffset.ts:15-29`; `it.each` over 180/330/345/−240/−330/0/… in `packages/client/src/presenter/utcOffset.test.ts:5-12` plus minus-sign and custom-prefix checks.
- ✅ 3.2 — `presentLocationRows(locations, { language, instant, translate })` with `utcOffsetLabel` in `packages/client/src/presenter/presentLocationRows.ts:9-45`; tests for Moscow `UTC+3`, New York January `UTC−5`, stub `XYZ` prefix, Russian prefix and the unknown zone in `packages/client/src/presenter/presentLocationRows.test.ts:66-100`.
- ✅ 3.3 — `formatUtcOffset` exported at `packages/client/src/presenter/index.ts:9`; mutation scores measured in this review (see Mutation): 100% / 100% / 100%.
- ✅ 4.1 — `clock?: Clock` prop defaulting to `systemClock` in `packages/client/src/controller/LocationsProvider.tsx:26,58`, passed in the context value at `:133`; `clock: Clock` in `packages/client/src/controller/locationsContext.ts:25`; `clock.instant()` inside `useMemo` keyed on `[locations, language, t, clock]` at `packages/client/src/controller/useLocations.ts:30-38`; `clock` argument in `packages/client/src/test/renderLocations.tsx:25,32`; switchable January→July clock test in `packages/client/src/controller/useLocations.test.tsx:70-102`.
- ✅ 4.2 — Controller mutation measured in this review: `useLocations.ts` 100%, `LocationsProvider.tsx` 100%; CI is green for `src/controller`.
- ✅ 5.1 — Offset `<span>` after the country inside the `text-muted-foreground` line at `packages/client/src/views/shared/LocationRow.tsx:19-29`; tests for order/muted class, empty country, empty offset with remove action in `packages/client/src/views/shared/LocationRow.test.tsx:25-45`; fixtures updated with `utcOffsetLabel` in `packages/client/src/views/shared/LocationList.test.tsx:12-24`.
- ✅ 5.2 — `LocationRow.tsx` measured at 96.43% in this review (≥ 95%).
- ✅ 6.1 — `Kathmandu` and `UTC` in `packages/client/src/test/factories/buildLocation.ts:27-28`; all nine spec scenarios in `packages/client/src/test/features/locations/locations_utc_offset_unit.feature`, step definitions in `packages/client/src/test/features/locations/steps/locations_utc_offset_unit.steps.tsx:107-245` (in-memory repository, `fakeClock`, switchable clock, `LocationList`, `performance.now()`). The zero-offset assertion is weak — see R1.
- ✅ 6.2 — Offset placed after the country keeps the substring assertion of "Rows show city and country" valid (`LocationRow.tsx:26-28`); CI green on `src/test/features/locations`.
- ✅ 7.1 — `Kathmandu` in `packages/client/src/test/features/locations/steps/locationsE2eHelpers.ts:19-23`; outlines "Offsets have no accessibility violations in the <theme> theme" and "Offsets fit a <width> px wide screen" in `packages/client/src/test/features/locations/locations_utc_offset_e2e.feature:6-31`; step `the row of {string} shows the offset {string}` in `packages/client/src/test/features/locations/steps/locations_utc_offset_e2e.steps.ts:9-18`.
- ✅ 7.2 — Outline "The list state shows offsets at <width> px in the <theme> theme" in `locations_utc_offset_e2e.feature:33-47` asserts `UTC+5` (Almaty) and `UTC+3` (Moscow); the 8 `Screenshot-of-the-list-state-*` baselines under `packages/client/src/test/features/__screenshots__/chromium/` and `mobile-chrome/` are changed by this branch.
- ✅ 8.1 — The traceability loop from the task, run from the repository root, prints nothing.
- ✅ 8.2 — `grep -rn "utcOffset" src/adapters src/ports` prints nothing; the stored document shape is untouched.
- ✅ 8.3 — CI (unit, lint, build) is green for the branch per the stage input; not re-run here.

## Requirements

- ✅ FR1 — `LocationRow.tsx:28` renders `utcOffsetLabel` on every row; covered by `LocationRow.test.tsx:25-36` and the unit BDD "Whole-hour zone".
- ✅ FR2 — `model/utcOffset.ts:14-15` derives the offset from the IANA id at the instant; DST covered by `model/utcOffset.test.ts`, `presentLocationRows.test.ts:70-78` and the BDD outline "Daylight saving time is respected"; nothing stored (task 8.2).
- ✅ FR3 — `presenter/utcOffset.ts:19-28`; exact labels incl. `UTC` for 0 and U+2212 in `presenter/utcOffset.test.ts`.
- ✅ FR4 — `useLocations.ts:30-38` reads `clock.instant()` in the memo keyed on list/language; switchable-clock tests in `useLocations.test.tsx:70-102` and BDD "Offset is computed again when the list changes"; no timer added.
- ✅ FR5 — `presentLocationRows.ts:32` uses `translate("locations.utcOffsetPrefix")`; key in both locales; BDD "Russian interface" and `presentLocationRows.test.ts:87-89`.
- ✅ FR6 — `model/utcOffset.ts:16-18` returns `undefined`, `presentLocationRows.ts:38-41` gives `""`, `LocationRow.tsx:28` hides it; tests `presentLocationRows.test.ts:91-100`, `LocationRow.test.tsx:38-45`, BDD "Offset that cannot be computed".
- ✅ NFR-P1 — Offset computed synchronously in the same memo as the rows; BDD "50 rows within the budget" times `presentLocationRows` over 50 locations against 50 ms (`locations_utc_offset_unit.steps.tsx:224-245`).
- ✅ NFR-A1 — E2E outline with axe-core in light and dark (`locations_utc_offset_e2e.feature:6-19`); offset is plain text inside the `listitem`.
- ✅ NFR-R1 — E2E outline at 320 / 2560 px with no horizontal scroll (`locations_utc_offset_e2e.feature:21-31`).
- ✅ NFR-R2 — E2E outline asserting offsets in the list state at 375/1024 × light/dark plus the 8 re-approved list baselines.
- ✅ UX1 — Offset after the country inside the `text-muted-foreground` line (`LocationRow.tsx:26-28`), asserted at `LocationRow.test.tsx:25-31`.
- ✅ UX2 — One formatter for both languages; `presenter/utcOffset.test.ts` and BDD outline tagged `@UX2`.
- ✅ M1 — The task 8.1 grep finds a tagged/commented test for every FR, NFR and UX id.
- ⚠️ M2 — 5 of the 6 labels are asserted by the unit BDD scenarios; the zero-offset label `UTC` is only matched against a row whose city label is also `UTC`, so the BDD does not actually verify it (R1). The `@M2` tag sits on the performance scenario rather than on the label scenarios.
- ✅ M3 — Measured here: `model/utcOffset.ts` 100%, `presenter/utcOffset.ts` 100%, `presenter/presentLocationRows.ts` 100%, `controller/useLocations.ts` 100%, `controller/LocationsProvider.tsx` 100%, `views/shared/LocationRow.tsx` 96.43%.
- ✅ M4 — Two axe-core examples (light, dark) in `locations_utc_offset_e2e.feature:6-19`.
- ✅ M5 — Two no-scroll examples (320, 2560) in the E2E feature; the minus-sign/no-hyphen check is in `presenter/utcOffset.test.ts`.
- ✅ Scenario: Whole-hour zone — `locations_utc_offset_unit.feature` + steps `:107-113`.
- ✅ Scenario: Half-hour zone — steps `:115-121`.
- ✅ Scenario: 45-minute zone — steps `:123-129`.
- ✅ Scenario: Daylight saving time is respected — outline with July `UTC−4` and January `UTC−5`, steps `:131-144`.
- ⚠️ Scenario: Zero offset — steps `:146-152` assert `toHaveTextContent("UTC")` on the row of the city labelled `UTC`, which passes on the city label alone (R1).
- ✅ Scenario: Offset is computed again when the list changes — switchable clock, steps `:154-176`.
- ✅ Scenario: Offset that cannot be computed — steps `:178-204`.
- ✅ Scenario: Offsets are written in one form — `presenter/utcOffset.test.ts` `it.each` matrix.
- ✅ Scenario: Negative offset uses the minus sign — `presenter/utcOffset.test.ts` U+2212 / no hyphen-minus assertion.
- ✅ Scenario: Russian interface — steps `:206-222`.
- ✅ Scenario: 50 rows within the budget — steps `:224-245`.
- ✅ Scenario: No accessibility violations with offsets — E2E outline lines 6-19.
- ✅ Scenario: Offsets fit narrow and wide screens — E2E outline lines 21-31.
- ✅ Scenario: List screenshots show the offsets — E2E outline lines 33-47 plus re-approved list baselines.

## Mutation

Measured in this review with `npx stryker run --mutate …` from `packages/client`, two runs, one at a time:

- `src/model/utcOffset.ts` — 100% (6 killed)
- `src/presenter/utcOffset.ts` — 100% (16 killed)
- `src/presenter/presentLocationRows.ts` — 100% (8 killed)
- `src/controller/useLocations.ts` — 100% (9 killed)
- `src/views/shared/LocationRow.tsx` — 96.43% (27 killed, 1 survived: `StringLiteral` on line 20, an `!== ""` comparison in `hasSecondaryLine`; above the 95% target and it does not expose an untested requirement)
- `src/controller/LocationsProvider.tsx` — 100% (55 killed)

## Findings

### R1 — WARNING — Zero-offset BDD scenario passes without the offset
- Location: `packages/client/src/test/features/locations/steps/locations_utc_offset_unit.steps.tsx:146-152`
- Rule: `.claude/rules/tdd-workflow.md` (tests must catch regressions); M2 of the proposal
- Problem: The "Zero offset" scenario stores the city labelled `UTC` (`buildLocation.ts:28`) and its Then step is `expectRowShows("UTC", "UTC")`, i.e. `expect(row).toHaveTextContent("UTC")` (line 81) — a substring match that is already satisfied by the city label. The offset span is never checked. `presentLocationRows.test.ts` has no zero-offset case either: the zero branch is only checked in isolation by `formatUtcOffset(0)` in `presenter/utcOffset.test.ts`, never through `presentLocationRows` / the row.
- Impact: A regression in `presentLocationRows.ts:38-41` that treats a zero offset as missing (e.g. `offsetMinutes ? formatUtcOffset(...) : ""`, a common truthiness refactor) makes a UTC location show no offset — breaking FR3 ("A zero offset is the prefix alone: `UTC`") and user scenario U3 — while every test stays green. M2 claims 6 of 6 labels are verified by the unit BDD, but only 5 are.
- Fix: (a) In the `f.Scenario("Zero offset", …)` block give the Then step its own callback that asserts the full row text, e.g. `expect(rowOf(city).textContent).toBe(`${city}${offset}`)` (row text is city + country + offset; the UTC location has an empty country and the remove button holds only an `aria-hidden` icon), so the row must read `UTCUTC`. (b) Add to `presenter/presentLocationRows.test.ts` a case `buildLocation({ label: "UTC", timeZoneId: "UTC", countryCode: "" })` → `utcOffsetLabel` `"UTC"`.
- Fix risk: Low. Each `f.Scenario` in vitest-cucumber takes its own step callbacks, so a dedicated callback in the Zero offset scenario does not change the shared `thenRowShows` used by other scenarios. The exact-text assertion depends on `LocationRow` keeping no visible text in the remove button; if the row later gains more text, that assertion must be updated.
- Status: open

## Verdict

Ready. No CRITICAL findings; R1 (WARNING) is a test-strength gap that does not block the change but should be fixed by the fix-code stage.
