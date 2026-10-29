# Specs review: add-wall-time-input-with-hint

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 46/47 |
| Contradictions | 4 |
| CRITICAL | 1 |
| WARNING | 3 |
| SUGGESTION | 2 |

## Freshness

- ✅ The three dependencies are archived: `openspec/changes/archive/2026/10/2026-10-29-{support-legacy-ios-12-safari,set-home-location-and-show-differences,show-here-entry-for-device-time}` exist; `openspec/changes/` holds only this change besides `archive`.
- ✅ `resolveWallClock(timeZoneId, plainDateTime)` in `packages/client/src/model/wallClock.ts:25` resolves with `compatible` and classifies with `earlier` / `later` (three `toZonedDateTime` calls, lines 30–33); `model/reduceReferenceMoment.ts` calls it for `SET_DATE` / `SHIFT_DATE`.
- ✅ Legacy zone shim covers `resolveWallClock` (proposal Q5, design Context): `lib/legacy/zoneShim.temporal.test.ts:77-92` resolves `UNIQUE`, `GAP` and `AMBIGUOUS` wall-clock times in the renamed zone through `resolveWallClock` from a fresh `import("@/model")`, with `LEGACY_ZONE_ID = "Europe/Kiev"` (line 6); the zone ID kept is the canonical one (line 74).
- ✅ `IS_POINTER_EVENTS_SUPPORTED` in `lib/legacy/pointerEvents.ts:6`, exported by `lib/legacy/index.ts:3`; `emulateEngineWithoutPointerEvents` in `test/e2e/withoutPointerEvents.ts:17`; `test/noBigIntInSources.test.ts:10` scans for BigInt literals, `BigInt(` and `epochNanoseconds`.
- ✅ `ReferenceMoment.PINNED` carries `instant`, `wallClockStatus`, `requestedWallTime: Temporal.PlainTime` (`model/referenceMoment.ts:16-24`); `getReferenceZone` and `getEffectiveInstant` live there.
- ✅ `followReferenceZone` (`model/followReferenceZone.ts`) turns a pinned `GAP` into `UNIQUE` with the instant's wall time in the new reference zone when the reference zone changed; `reduceLocations` runs it on every successful command (`model/locations.ts:114`).
- ✅ `reduceSelectInstant` returns the same state for the instant already pinned and always sets `UNIQUE` (`model/reduceSelectInstant.ts:41-60`); it and `moveToDate` (`reduceReferenceMoment.ts:48-58`) build a fresh `reference` object, so an optional `wallTimeTarget` would drop as design D2 says.
- ✅ `LocationCommandType`, `LocationErrorCode`, `LocationCommand` and `reduceLocations` are in `model/locations.ts`, which is 192 lines; `INVALID_DATE` and `DATE_OUT_OF_RANGE` exist (lines 67–68).
- ✅ `getHereEntry(state)` in `model/hereEntry.ts:13`; `useHereEntry` presents it with `presentHereEntry` from the same `rowsContext` (`controller/useHereEntry.ts`).
- ✅ `buildDateBar` in `controller/useReferenceMoment.ts:20-46` decides the gap from `wallClockStatus !== GAP`; `presentDateBar` formats with inline `time.toLocaleString(language, LOCAL_TIME_FORMAT_OPTIONS)` (`presenter/dateBar.ts:59-60`), which ADR-0008 counts as a formatter build (ADR-0008 lines 12, 16).
- ✅ `formatLocalTime` on the cached `getDateTimeFormatter(language, timeZoneId, kind)` (`presenter/localDateTime.ts`, `presenter/dateTimeFormatters.ts:33`, `DateTimeLabelKind.LOCAL_TIME`); `UTC_ZONE_ID = "UTC"` (`constants/search.ts:5`).
- ✅ `formatUtcOffset`, `UTC_OFFSET_MINUS_SIGN = "−"` (`constants/utcOffset.ts:5`), `locations.utcOffsetPrefix` = `UTC` in both locales; no `GMT` in `locales/*.json`.
- ✅ `presentZoneMoment(subject, context)` in `presenter/presentZoneMoment.ts` (105 lines) with `LocationRowsContext`; `presentLocationRows` and `presentHereEntry` both call it.
- ✅ `views/shared/ZoneRowContent.tsx` (114 lines) renders the place column, `LocalDateTime` and `DayTrack` and is used by `LocationRow` and `HereEntryRow`; `LocalDateTime.tsx` (30 lines) renders the time as a plain `<span>`.
- ✅ The reorder `KeyboardSensor` is set up in `views/shared/LocationList.tsx:84`, and the sortable `listeners` are spread on `DragHandle` only (`DragHandle.tsx:28`).
- ✅ `--color-notice` / `--color-notice-foreground` exist for both themes (`styles/tokens.css:12-13, 31-32`); `lucide-react` is a dependency.
- ✅ Test helpers named in `tasks.md` exist: `startWorkCount` (`test/workCounters.ts:33`), `startZoneLookupCount` (`test/zoneLookupCounter.ts:12`, spies only `Instant#toZonedDateTimeISO` today), `createManualWriteScheduler`, `createSwitchableClock(iso, zone)`, `fakeClock`, `buildBudgetLocations` / `BUDGET_ROW_COUNT` (`test/features/locations/steps/rowBudgetWorld.ts`), `test/benchmarks/rowPresenting.bench.ts`, `test/features/locations/steps/locationsStates.ts`, `timeSelectionWorld.tsx`, `src/locales/locales.test.ts`, `controller/useLocations.reference.test.tsx`.
- ✅ Feature files the change extends exist: `date_selection/date_selection_wall_clock.feature`, `time_selection/time_selection_view_contract_e2e.feature`, `locations/locations_ui_e2e.feature` (screenshot outline at line 130); the `view-contract-cards` project comes from `playwright.bdd.config.ts:51` and `ViewId.CARDS = "cards"`.
- ✅ Package scripts used by tasks exist: `typecheck`, `lint`, `test`, `bench`, `test:bdd`, `check:bundle-size`, `check:legacy-build` (`packages/client/package.json`); the package is `@time-zones/client`.
- ✅ Docs targets of the handoff patches: `docs/architecture/views.md:85` is the "Wall-time hint" row with `GMT-4`; `domain-model.md:61` is `SET_WALL_TIME(locationId, time, date?)`; `open-questions.md:16` is Q4 ("works only with locations from the list"). The two archived H2 patches apply to `main` and chain in a scratch copy as the scratch check of tasks 7.x does.
- ✅ Glossary state: `docs/glossary/date-selection.md:10` has **Wall-time hint** *(planned)*, line 9 **Gap note**; `time-selection.md` has no wall-time input entry yet; `time.md:20` bans `GMT` offsets in new text.
- ✅ The storage claim (FR9, M5) holds: wall-clock-moment commands are dispatched straight to the store (`useTimeSelection.ts:35`, `useReferenceMoment.ts:77`); writes and the BroadcastChannel happen only through `createLocationsActions` → repository; the only other `localStorage` writer is the i18n language cache (`i18n.ts:33`), which a wall-time input does not touch.
- ✅ The MODIFIED `date-selection` requirement "Wall-clock resolution on the new date" exists in `openspec/specs/date-selection/spec.md:71` and the delta restates it with all five existing scenarios.
- ✅ Spec examples recomputed: Almaty is UTC+5, New York switches at `2026-03-08T07:00Z` and back at `2026-11-01T06:00Z`; M2 (`14:40Z`, `19:40`/`17:40`/`20:10`, `23:00` → `2026-03-09T03:00Z`, reference day `19:00Z`–`19:00Z`), M3 (`07:30Z` GAP, `05:30Z` AMBIGUOUS `UTC−4`), the Here entry (`03:00Z`, Moscow `06:00`), Kyiv (`08:00Z`) and the view contract (`13:45`/`11:45`) are all correct.

## Coverage

| Requirement | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ "Wall-time input on every row" | ✅ 5.1, 6.1, 6.4 |
| FR2 | ✅ | ✅ "Accepted wall-time text" | ✅ 1.1, 3.1, 6.1 |
| FR3 | ✅ | ✅ "A wall-time input pins the reference moment" | ✅ 2.2, 4.2, 6.1 (blur/Tab confirm untested, R3) |
| FR4 | ✅ | ✅ "The pinned wall-time moment drives every row" | ✅ 2.2, 6.1 |
| FR5 | ✅ | ✅ "Closing the wall-time input" | ✅ 5.1, 6.4 (blur without change untested, R3) |
| FR6 | ✅ | ✅ "Invalid wall-time text" | ✅ 3.1, 4.2, 5.1, 6.1 (invalid text on blur untested, R3) |
| FR7 | ✅ | ✅ hint texts, lifetime, one note; date-selection MODIFIED | ✅ 2.3, 2.4, 3.3, 3.4, 4.1, 6.1, 6.3 |
| FR8 | ✅ | ✅ "The pinned wall-time moment drives every row" | ✅ 4.2, 6.1 |
| FR9 | ✅ | ✅ "Wall-time input is never stored", "Wall-time hint lifetime" | ✅ 2.3, 4.2, 6.1 |
| FR10 | ✅ | ✅ "Wall-time input is never stored" | ✅ 2.2, 4.2, 5.1, 6.1 |
| FR11 | ✅ | ✅ "Wall-time input strings are localized" | ✅ 1.2, 3.3, 3.4, 6.4 |
| FR12 | ✅ | ✅ "Type an exact time in every view" | ✅ 6.5 |
| FR13 | ✅ | ✅ "opens without Pointer Events", "in a renamed zone" | ✅ 2.2, 5.2, 6.1, 6.4, 8.2 |
| NFR-P1 | ✅ | ✅ "Wall-time input is fast" | ✅ 3.2, 6.2 |
| NFR-A1 | ✅ | ✅ "Accessible wall-time input" | ✅ 6.4 |
| NFR-A2 | ✅ | ✅ localized names, keyboard-safe | ✅ 3.4, 5.1, 6.4 |
| NFR-A3 | ✅ | ✅ "Accessible wall-time input" | ✅ 5.3, 6.4 |
| NFR-A4 | ✅ | ✅ "Keyboard-safe wall-time input" | ❌ 5.1, 6.4 cover reorder and scroll, but nothing tests "Tab leaves the field and confirms it" (R3) |
| NFR-R1 | ✅ | ✅ "Wall-time input layout" | ✅ 6.4 |
| NFR-R2 | ✅ | ✅ "Wall-time input layout" | ✅ 6.6 |
| UX1 | ✅ | ✅ "Accessible wall-time input" | ✅ 6.4 |
| UX2 | ✅ | ✅ layout, keyboard-safe | ✅ 5.1, 6.4, 6.6 |
| UX3 | ✅ | ✅ "Wall-time input layout" | ✅ 5.3, 6.4 |
| M1 | ✅ | n/a | ✅ 8.1 (23 ids) |
| M2 | ✅ | ✅ | ✅ 2.2 |
| M3 | ✅ | ✅ | ✅ 2.2, 3.3 |
| M4 | ✅ | ✅ | ✅ 3.1 |
| M5 | ✅ | ✅ | ✅ 4.2 |
| M6 | ✅ | n/a | ✅ 2.5, 3.5, 5.4 (24 files in 7 runs, counted) |
| M7 | ✅ | ✅ | ✅ 6.4, 6.6 |
| M8 | ✅ | ✅ | ✅ 2.2, 5.2, 6.4, 8.2 |
| G1 | ✅ | n/a — met by FR1, FR2, FR3 | n/a — via FR1–FR3 tasks |
| G2 | ✅ | n/a — met by FR4 | n/a — via FR4 tasks |
| G3 | ✅ | n/a — met by FR7 | n/a — via FR7 tasks |
| NG1 | ✅ | n/a | n/a — nothing builds 12-hour input |
| NG2 | ✅ | n/a | n/a — the command takes the row's date, no date typing |
| NG3 | ✅ | n/a | n/a — targets are a location or the Here entry only |
| NG4 | ✅ | n/a | n/a — no "other instant" action |
| NG5 | ✅ | n/a | n/a — only the input and the hint are added to the Here entry (but see R1: that addition changes its Tab stops) |
| NG6 | ✅ | n/a | n/a — no Grid work |
| NG7 | ✅ | n/a | n/a — `getWallClockNote` gives `DATE_BAR`, never `ROW`, without a target |
| Q1 | ✅ | n/a | n/a — decided in the proposal (FR3, FR4) |
| Q2 | ✅ | n/a | n/a — decided in the proposal (FR2), design D6 |
| Q3 | ✅ | n/a | n/a — decided in the proposal (FR10), design D5 |
| Q4 | ✅ | n/a | n/a — decided in the proposal (NG7, FR7), design D2 |
| Q5 | ✅ | n/a | n/a — closed in the proposal; design Context and Risks; confirmed in `zoneShim.temporal.test.ts` |
| Q6 | ✅ | n/a | n/a — decided in the proposal (FR7), design D2 |

## Consistency

- The change gives the Here entry a focusable time button (`proposal.md:91` FR1, `specs/time-selection/spec.md:3-4`, design D6), but the stable `openspec/specs/locations/spec.md:1185` ("Its day track MUST be one Tab stop") and its scenario "One Tab stop on the Here entry" (`locations/spec.md:1197-1203`, "exactly one element of the Here entry takes the focus: the slider") are not modified by any delta (R1).
- `specs/date-selection/spec.md:4` states, unqualified, "A change of the reference zone keeps the pinned instant; a moment reported as `GAP` is then reported as `UNIQUE`", while `specs/time-selection/spec.md:190-198` ("A home change keeps the hint … with the status `GAP`") and design D2 (`design.md:79`) keep `GAP` for a wall-time input on a location (R2).
- `design.md:148` says "blur-confirms is covered by the Tab case", but no task has a Tab or blur case: `tasks.md:56` (5.1) tests Enter, Escape, `INVALID_TEXT`, `CLOSED`; `tasks.md:66` (6.4) and `specs/time-selection/spec.md:277-282` confirm with Enter (R3).
- `tasks.md:34` (2.2) puts the renamed-zone case in its own file "so the stub never leaks", while `tasks.md:63` (6.1) puts the scenario "A renamed zone on outdated zone data" "with the stub of 2.2" into the shared rendered-app feature with about twenty other scenarios (R4).

## Findings

### R1 — CRITICAL — The time button breaks the stable "one Tab stop on the Here entry" requirement undeclared
- Location: `openspec/changes/add-wall-time-input-with-hint/proposal.md:45-48`
- Rule: `.claude/rules/delta-specs.md`
- Problem: FR1 makes the Here entry's time a `<button>` (design D6, `ZoneRowContent` is shared by `HereEntryRow`), so the Here entry gets two Tab stops: the time button and the slider. The stable spec `openspec/specs/locations/spec.md:1185` says "Its day track MUST be one Tab stop", and the scenario at lines 1197–1203 says "exactly one element of the Here entry takes the focus: the slider named `Время — Алматы`" and "the next Tab moves the focus out of the Here entry". The existing E2E enforces it: `src/test/features/locations/locations_here_entry_e2e.feature:52` with `steps/locations_here_entry_e2e.steps.ts:143` (`expect(tabStopCounts.get(page)?.inside).toBe(1)`). The proposal lists only `time-selection` and `date-selection` as modified capabilities, no delta touches `locations`, and task 8.2 only says to "fix every existing feature that finds the time as text and now meets a button".
- Impact: implemented as written, an existing stable requirement and its E2E break without a declared change. The implementer must either edit an existing scenario of a stable spec with no delta (the archive then merges a spec that still demands one Tab stop) or leave `test:bdd` red. The task asks for the input on the Here entry, so the stable requirement has to change on purpose.
- Fix: add `specs/locations/spec.md` with `## MODIFIED Requirements` → "Accessible Here entry", restating the whole requirement with: "Its time is a wall-time input and its day track one Tab stop named like a card's: Tab reaches the time button, then the slider, then leaves the Here entry" (keep the existing `implements` comment and append `NFR-A2 of add-wall-time-input-with-hint`). Rename the scenario to "Two Tab stops on the Here entry": the first stop is the button whose name starts with «Ввести время — Алматы», the second the slider `Время — Алматы`, the next Tab leaves. Keep "Name and list size" and "No violations" unchanged. In `proposal.md` add `locations` under "Modified Capabilities" and a "MODIFIED: the Here entry has two Tab stops, the time button and the slider" bullet in "What Changes". In `tasks.md` 6.4 add: update `locations/locations_here_entry_e2e.feature` and its step (count 2 stops in that order), tagged `@add-wall-time-input-with-hint @NFR-A2`.
- Fix risk: the step `exactly one element of the Here entry takes the focus` is shared by no other feature, so it is renamed, not duplicated. The scenario has no fixed clock, so the step must match the name by its city prefix, not by the full time. Adds one more spec file to the change.
- Status: open

### R2 — WARNING — The MODIFIED date-selection text says every GAP becomes UNIQUE on a reference-zone change
- Location: `openspec/changes/add-wall-time-input-with-hint/specs/date-selection/spec.md:4`
- Rule: `.claude/rules/delta-specs.md`
- Problem: The restated requirement keeps the sentence "A change of the reference zone keeps the pinned instant; a moment reported as `GAP` is then reported as `UNIQUE`." The same change decides the opposite for a wall-time input on a location: `specs/time-selection/spec.md:190-198` ("A home change keeps the hint" … "pinned … with the status `GAP`") and design D2 (`design.md:78-79`: rule 1 applies only with no target, "a location target → nothing").
- Impact: after the archive, the stable `date-selection` and `time-selection` specs disagree about the status after a home change. An implementer or a later change that follows `date-selection` keeps today's rule in `followReferenceZone` (every `GAP` → `UNIQUE`), which ends the hint on a home change and breaks FR7 and the scenario "A home change keeps the hint".
- Fix: in `specs/date-selection/spec.md:4` replace that sentence with "A change of the reference zone keeps the pinned instant; a moment that a date change reported as `GAP` is then reported as `UNIQUE` (a wall-time input keeps its status, see the `time-selection` capability)."
- Fix risk: none — the scenario "A device time zone change drops the gap note" (date-change `GAP`) still holds under the qualified text.
- Status: open

### R3 — WARNING — Confirming or closing by leaving the field (blur, Tab) has no test
- Location: `openspec/changes/add-wall-time-input-with-hint/tasks.md:56`
- Rule: `.claude/rules/test-planning.md`
- Problem: FR3 ("leaving the field with a changed value, including by Tab"), FR5 ("leaving the field without a change, closes it"), FR6 ("this holds for Enter and for leaving the field") and NFR-A4 ("Tab leaves the field and confirms it as in FR3") all have a blur path. Task 5.1 tests only Enter, Escape, `INVALID_TEXT` and `CLOSED`; task 6.4's "Keyboard-only input" (spec `time-selection/spec.md:277-282`) confirms with Enter. `design.md:148` relies on "the Tab case" for the iOS 12 blur risk, but that case does not exist anywhere.
- Impact: the blur handler, which design.md names as the iOS 12 commit path when the numeric keyboard closes, can ship broken (no commit, or commit without a change, or the error dropped on blur) with every test green; NFR-A4's Tab clause goes untested, against rule 1 of `test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it").
- Fix: in `tasks.md` 5.1 add jsdom cases to `WallTimeInput.test.tsx`: blur after typing `1040` calls `onConfirm` with `1040`; blur with the text unchanged closes without `onConfirm`; blur after typing `9:3` with `INVALID_TEXT` keeps the field and shows the error. In `specs/time-selection/spec.md` "Keyboard-safe wall-time input" add the scenario "Tab confirms the field" (open New York, type `1040`, press Tab → New York shows `10:40`), and list it in task 6.4 with `@NFR-A4 @FR3`.
- Fix risk: low. In jsdom, blur is fired with `fireEvent.blur`; the real focus move by Tab stays in the E2E scenario, as `bdd-e2e.md` places focus behaviour in a real browser.
- Status: open

### R4 — WARNING — The renamed-zone scenario is put in the shared rendered-app feature, against task 2.2's isolation
- Location: `openspec/changes/add-wall-time-input-with-hint/tasks.md:63`
- Rule: `.claude/rules/bdd-unit.md`
- Problem: Task 2.2 (`tasks.md:34`) puts the legacy case in its own file `model/reduceWallTime.legacy.test.ts` "so the stub never leaks", because the stub needs `vi.resetModules()` and a fresh `import("@/model")`. Task 6.1 then puts "A renamed zone on outdated zone data" "with the stub of 2.2" into `time_selection_wall_time_input_unit.feature`, whose steps render the app "as in `steps/timeSelectionWorld.tsx`" together with about twenty other scenarios. The modules a statically rendered app imports keep the `Intl.DateTimeFormat` they first saw (`test/features/browser_compatibility/steps/legacyZoneWorld.ts`, "Fresh copies of the modules that keep the `Intl.DateTimeFormat` they first see"), so the stub either has no effect on the rendered app or leaks into the other scenarios of the file.
- Impact: the FR13 / M8 scenario either passes without exercising the shim (it never proves the renamed-zone path through `SET_WALL_TIME`) or makes the other scenarios of the shared feature flaky.
- Fix: in `tasks.md` 6.1 remove "A renamed zone on outdated zone data" and add a task (6.1a) writing `test/features/time_selection/time_selection_wall_time_legacy_zone.feature` with steps that use `startOnOutdatedZoneData()` of `browser_compatibility/steps/legacyZoneWorld.ts` and dispatch `SET_WALL_TIME` through the fresh model's `reduceLocations`. Verify with `npx vitest run src/test/features/time_selection/steps/time_selection_wall_time_legacy_zone.steps.ts`. Add the file to the proposal's "Behavior" list.
- Fix risk: one more feature file; the step file imports a world from another feature's `steps/`, which the code already does (`locations/steps/locationsStates.ts` imports from `date_selection/steps` and `time_selection/steps`).
- Status: open

### R5 — SUGGESTION — `WallClockNote` and `WallClockNotePlacement` name a concept with no glossary entry
- Location: `openspec/changes/add-wall-time-input-with-hint/proposal.md:31-37`
- Rule: `.claude/rules/glossary.md`
- Problem: Design D2 adds the type `WallClockNote`, the enum `WallClockNotePlacement` and the selector `getWallClockNote` for "the one note about a wall-clock time" (gap note or wall-time hint). The proposal's glossary list adds `getWallClockNote` to the *Code:* of Wall-time hint and Gap note, but no entry owns the umbrella concept or the two new type names. The glossary checklist says "Every new type, function, constant and i18n key names a glossary concept, or the change adds that concept's entry."
- Impact: a later change looking up "which note is shown" finds two entries that both point at `getWallClockNote` and may add a second placement rule; low stakes.
- Fix: in the proposal "What Changes" glossary bullets add "NEW **Wall-clock note** (`date-selection.md`) — the one note about a wall-clock time on screen: the gap note in the date bar or the wall-time hint in a row, never both. *Code:* `getWallClockNote`, `WallClockNote`, `WallClockNotePlacement`", and name it in task 7.1's H1 patch.
- Fix risk: none; the H1 patch already edits `docs/glossary/date-selection.md`.
- Status: open

### R6 — SUGGESTION — Design D1 assigns the command's string to the `PlainTime` field
- Location: `openspec/changes/add-wall-time-input-with-hint/design.md:52`
- Rule: —
- Problem: D1 step 4 pins `{ …, requestedWallTime: time, … }`, where `time` is the command's `"HH:MM"` string (`design.md:40-41`), but `ReferenceMoment.PINNED.requestedWallTime` is a `Temporal.PlainTime` (`model/referenceMoment.ts:22`), which `buildDateBar` and `followReferenceZone` use as one.
- Impact: small; the type checker catches it, but the design as written shows the wrong value for a field it says keeps "one meaning".
- Fix: write `requestedWallTime: Temporal.PlainTime.from(time)` in D1 step 4.
- Fix risk: none.
- Status: open

## Verdict

Needs revision. Blocking: R1 (the change breaks a stable `locations` requirement and its E2E without a delta). R2, R3 and R4 should be fixed in the same pass.
