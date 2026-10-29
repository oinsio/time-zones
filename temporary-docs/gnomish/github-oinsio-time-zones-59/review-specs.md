# Specs review: set-home-location-and-show-differences

## Summary

| Item | Value |
|---|---|
| Stale claims | 3 |
| Requirements fully covered | 42/44 |
| Contradictions | 4 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 2 |

## Freshness

- ✅ `support-legacy-ios-12-safari` is archived at `openspec/changes/archive/2026/10/2026-10-29-support-legacy-ios-12-safari/` (proposal.md:3).
- ✅ Legacy zone shim `src/lib/legacy/zoneShim.ts` exists, covered by `zoneShim.temporal.test.ts` (proposal.md:5, design.md:14).
- ✅ `IS_POINTER_EVENTS_SUPPORTED` lives in `src/lib/legacy/pointerEvents.ts`, read once at module load, re-exported from `src/lib/legacy/index.ts` (proposal.md:6, design.md:14).
- ✅ `packages/client/scripts/check-bundle-size.mjs:18` has `INITIAL_JS_BUDGET_KB = 150`. `package.json` has `check:bundle-size` and `check:legacy-build`, and `build` is `tsc -b && vite build` (proposal.md:7, design.md:15).
- ❌ proposal.md:9 says only handoff patches H2 (ADR-0009) and H3 (glossary context) of the dependency are unapplied. H1 ("CI step Check legacy build", archived `handoff/README.md:5`) is not applied either: `.github/workflows/ci.yml` runs `check:bundle-size` (line 47) but never `check:legacy-build`. No `docs/adr/0009-*` and no browser-compatibility glossary file exist, so H2 and H3 are correctly reported as unapplied.
- ✅ Glossary owners: `getReferenceZone` (Reference zone), `getUtcOffsetMinutes` / `formatUtcOffset` (UTC offset), `LocationMarkKind.HERE` (Here mark), `WorldClockState`, `buildLocationId`, `LocationsLoadStatus.UNREADABLE`. Home location (`homeLocationId`) and Offset difference are *(planned)* in `docs/glossary/time.md:14,21`. Shared block is in `docs/glossary/views.md:11`. «место» is the *RU:* name of Location (`locations.md:6`).
- ✅ `model/locations.ts` is 161 lines. It has `ID_SEPARATOR = "|"` (line 92), `buildLocationId`, `REPLACE_LOCATIONS`, `LOCATION_NOT_FOUND` and no home. `model/locations.test.ts` is 237 lines (design.md:7).
- ✅ `getReferenceZone` returns `state.deviceTimeZoneId` (`model/referenceMoment.ts:31-33`). Its callers are `dayTrack.ts`, `reduceReferenceMoment.ts`, `reduceSelectInstant.ts`, `useReferenceMoment.ts` and `useCalendarMonth.ts` (design.md:8).
- ✅ `LocationMarkKind { HERE }`, `getLocationMarkKind(location, deviceTimeZoneId)`, and an exhaustive `LOCATION_MARK_TEXT_KEYS` with an optional `captionKey` (`presenter/locationMark.ts:12-30`). `LOCATION_MARK_ICONS` in `LocationMarkIcon.tsx` is also an exhaustive Record (design.md:9, D3).
- ✅ `getUtcOffsetMinutes` reads `offsetNanoseconds` from `toZonedDateTimeISO` (`model/utcOffset.ts`). `formatUtcOffset(offsetMinutes, utcPrefix)` holds the sign, hours and `:MM` logic with the `UTC_OFFSET_*` constants (design.md:10).
- ✅ `presentLocationRows.ts` is 103 lines, and `LocationRowsContext` is `{ language, instant, translate, deviceTimeZoneId, referenceDay }`. Each row's offset is already computed with `getUtcOffsetMinutes` (line 68). `useLocations` passes `deviceTimeZoneId` and `getReferenceDay(state, now)` (design.md:11, D4).
- ✅ Storage: `LOCATIONS_SCHEMA_VERSION = 1`, `LOCATION_MIGRATIONS = {}`, `{ schemaVersion, payload: { locations } }`, and a "newer" document is rejected (`adapters/locationsDocument.ts:16,23-36,63`). `parseStoredLocations` canonicalizes zones and rebuilds ids. The port has `load/save(locations)/clear/subscribe`. `LocationsProvider.tsx` is 195 lines, uses `dispatchAndSchedule`, and dispatches `REPLACE_LOCATIONS` on external changes and on reset (design.md:12).
- ✅ Loading claim (UI States Matrix): `repository.load()` runs synchronously in `useState` before the first render (`LocationsProvider.tsx:83`).
- ✅ Views: the remove button is at `LocationRow.tsx:136-144` (lucide `X`, `locations.removeLocation`), and `aria-labelledby` is city [+ mark] (line 88). `LocationList.tsx` has `removeButtons` refs and `PointerSensor` / `TouchSensor` chosen by `IS_POINTER_EVENTS_SUPPORTED` (lines 24-36, 71). The drag activator is only `DragHandle` (`setActivatorNodeRef`). `CardsView.tsx` has one polite region (line 70). `components/ui/` holds only `dialog`. `@radix-ui/react-dropdown-menu` is not a dependency. `lucide-react@0.577.0` is in `pnpm-lock.yaml`. `LocationRow.test.tsx` is 224 lines and `LocationList.test.tsx` is 196 (design.md:13).
- ✅ Legacy test infrastructure exists: `src/test/setup.ts` installs `FakePointerEvent`. `DayTrack.legacy.test.tsx` uses `vi.stubGlobal("PointerEvent", undefined)` + `vi.resetModules()`. `emulateEngineWithoutPointerEvents` is in `src/test/e2e/withoutPointerEvents.ts`, `startTouch` / `dispatchTouch` in `locationsReorderE2eHelpers.ts:146,152`, and `noBigIntInSources.test.ts` exists (design.md:14).
- ✅ `src/test/workCounters.ts` spies on Temporal prototypes (`toLocaleString`, `getTimeZoneTransition`) and exports `startWorkCount` (D4). `rowPresenting.bench.ts` exists (NFR-P1).
- ✅ Every line reference in task 6.4 holds. These are `LocationRow.test.tsx:71,123`, `LocationList.test.tsx:74-176`, `CardsView.test.tsx:119,129`, `locationsUiWorld.tsx:96`, `deviceTimeZoneWorld.tsx:58`, `localTimeWorld.tsx:50`, `locations_utc_offset_unit.steps.tsx:91,225` (278 lines), `locations_local_time_unit.steps.tsx:157`, `dateSelectionWorld.tsx:74`, `referenceMomentRowsWorld.ts:47`, `locationsReorderE2eHelpers.ts:24`, `locationsE2eHelpers.ts:67`, `locations_view_contract_e2e.steps.ts:11,73,82,127`, `locations_local_time_e2e.steps.ts:35`, `locations_ui_e2e.feature:43` and `locations_ui_e2e.steps.ts:109`. No other production or test file uses `locations.removeLocation`.
- ❌ `tasks.md:129` (task 6.4 verification) expects `grep -rnE "(^|[^A-Za-z])locations\.removeLocation|\"removeLocation\"" src` to print nothing once the button is gone. It cannot. `controller/useLocations.test.tsx:28` has `"removeLocation",` in the key list of "should return exactly the documented members". That entry is the hook action, which stays, and task 5.1 (`tasks.md:82`) extends the same list with `setHomeLocation` (R4).
- ❌ FR4 (`proposal.md:99`) says the gap note follows the new reference zone, and D2 (`design.md:37`) says the gap note follows home "automatically". Neither the code nor the stable spec does this. `SET_DEVICE_TIME_ZONE` keeps `state.reference` untouched (`model/locations.ts:143-150`, asserted by `model/referenceMomentPicking.test.ts:110-119`). The stable `openspec/specs/date-selection/spec.md:64` says the note "MUST stay until the next date change, the next time selection on a day track … or Now" (R1).
- ✅ Every existing feature, steps file and world named in tasks 6.4, 7.4 and 8.4 exists. These include the browser_compatibility and date_selection steps that import the changed worlds.
- ✅ Every MODIFIED requirement exists in `openspec/specs/` under the same name (locations ×10, `time-selection` "Day track spans the reference day", `date-selection` "Reference moment"). No restated block drops a stable scenario. `openspec/specs/home-location/` does not exist yet, as an ADDED capability expects.
- ✅ Nothing is implemented yet: no `homeLocationId`, `SET_HOME_LOCATION`, `LocationMenu` or `offsetDifference` in `packages/client/src`, and no archived change delivers home.
- ✅ `docs/architecture/views.md:79,116` and `docs/architecture/domain-model.md:44,56,58,88` say what the proposal cites ("Row header", "set and clear home", invariant 1, `SET_HOME_LOCATION`). The README MVP feature 3 text matches (README.md:44).
- ✅ The design screens `phone-light`, `phone-no-home`, `phone-travel` and `tablet-light` exist under `docs/design/screens/`.
- ✅ The greps of task 10.3 (`context menu|kebab`, `GMT`, `локаци`) print nothing on main today, so they can act as regression guards.

## Coverage

| Id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ home-location "Make a location home" | ✅ 2.1, 7.1 |
| FR2 | ✅ | ✅ "Clear the home location" | ✅ 2.1, 7.1 |
| FR3 | ✅ | ✅ "Home follows list changes", locations "Remove a location" | ✅ 2.1, 5.1, 7.1, 7.4 |
| FR4 | ✅ | ❌ the gap-note clause has no scenario, and the stable gap-note rule is not modified (R1) | ❌ no task tests the gap note after a reference zone change (R1) |
| FR5 | ✅ | ✅ locations "Offset difference on location rows" | ✅ 2.4, 4.2, 7.2 |
| FR6 | ✅ | ✅ "Offset difference text" | ✅ 4.1, 7.2 |
| FR7 | ✅ | ✅ "Home mark", "Home mark takes precedence", "One leading mark per row" | ✅ 2.3, 4.2, 6.3, 7.1, 7.4 |
| FR8 | ✅ | ✅ "Home is kept on the device", "List is kept on the device" | ✅ 2.5, 3.1, 3.2, 5.1, 7.1, 7.4 |
| FR9 | ✅ | ✅ "A dangling stored home is cleared", "Unreadable stored list" | ✅ 2.5, 3.2, 7.1 |
| FR10 | ✅ | ✅ "Home is shared between open tabs", "Sync between open tabs" | ✅ 2.1, 3.1, 5.1, 7.1 |
| FR11 | ✅ | ✅ "Home actions in the location menu", "Location menu", "List in the Cards view" | ✅ 6.2–6.5, 7.1, 8.1, 8.4 (the grep check of 6.4 cannot pass, R4) |
| FR12 | ✅ | ✅ "Home strings are localized" | ✅ 1.1, 8.1 |
| FR13 | ✅ | ✅ "Set and clear home in every view" | ✅ 8.3 |
| FR14 | ✅ | ✅ "Location menu without Pointer Events" | ✅ 6.2, 7.3, 8.2 (see R3 for a gap these tests cannot see) |
| NFR-P1 | ✅ | ✅ "Offset differences are fast" | ❌ 7.2: the count compares home against no home and cannot detect a per-row reference offset (R2) |
| NFR-P2 | ✅ | ✅ "Location menu keeps the initial JavaScript budget" | ✅ 6.6, 10.2 |
| NFR-A1 | ✅ | ✅ "Home is accessible and fits every screen" | ✅ 8.1 |
| NFR-A2 | ✅ | ✅ "Location menu", "List in the Cards view" | ✅ 6.1, 6.2, 6.5, 8.1 |
| NFR-A3 | ✅ | ✅ "Offset difference accessible text", "Here mark is accessible…" | ✅ 4.1, 6.3, 7.2, 8.4 |
| NFR-R1 | ✅ | ✅ "Narrow and wide screens" | ✅ 8.1 |
| NFR-R2 | ✅ | ✅ "Screenshots" | ✅ 8.5 |
| UX1 | ✅ | ✅ "Offset difference text" | ✅ 6.3, 8.1 |
| UX2 | ✅ | ✅ "Home mark" | ✅ 6.3 |
| UX3 | ✅ | ✅ "Location menu", "Local time and date layout" | ✅ 6.4, 8.1 |
| G1 | ✅ | n/a, met by FR1, FR2, FR11, NFR-A2 | n/a |
| G2 | ✅ | n/a, met by FR4, FR5 | n/a |
| G3 | ✅ | n/a, met by FR5, FR6, M2 | n/a |
| NG1 | ✅ | n/a, no artifact builds the Here entry | n/a |
| NG2 | ✅ | n/a, "The first added location is not home" guards it | n/a |
| NG3 | ✅ | n/a, no artifact builds a day shift hint | n/a |
| NG4 | ✅ | n/a, "Reorder keeps home in place" guards it | n/a |
| NG5 | ✅ | n/a, nothing builds them | n/a |
| NG6 | ✅ | n/a, no task edits `docs/design/screens/` | n/a |
| M1 | ✅ | n/a | ✅ 10.1 |
| M2 | ✅ | ✅ "Differences from home", "DST changes the difference" | ✅ 2.4, 4.2, 7.2 |
| M3 | ✅ | ✅ "The day follows home while travelling", "Clearing home…" | ✅ 2.2, 7.1 |
| M4 | ✅ | ✅ "A list from the previous version", "Home points to a missing location" | ✅ 3.2, 5.1 |
| M5 | ✅ | ✅ "Remove without Pointer Events", "Bundle budget" | ✅ 6.2, 7.3, 10.2 |
| M6 | ✅ | n/a | ✅ 2.6, 3.3, 4.3, 5.2, 6.7, 8.1 |
| Q1 | ✅ | n/a, answered in design.md D7 | n/a |
| Q2 | ✅ | n/a, answered in design.md D5 (sub-question Q2a answered by FR5) | n/a |
| Q3 | ✅ | n/a, answered in design.md D6 | n/a |
| Q4 | ✅ | n/a, answered by NG1 | n/a |
| Q5 | ✅ | n/a, answered by NG4 | n/a |

## Consistency

- `proposal.md:99` (FR4) and `specs/home-location/spec.md:57` require that the gap note follow the new zone in the same render. `design.md:37` (D2) says a home change does not touch `state.reference`. But `controller/useReferenceMoment.ts:30-36` builds the gap note from `reference.wallClockStatus` and `reference.requestedWallTime`, which were resolved in the previous zone. So the design as written keeps a stale gap note (R1).
- `proposal.md:99` (FR4) and `specs/home-location/spec.md:57` require the gap note to follow a new reference zone. The stable `openspec/specs/date-selection/spec.md:64` ("Wall-clock resolution on the new date") says the note "MUST stay until the next date change, the next time selection on a day track … or Now". The change's `specs/date-selection/spec.md` modifies only "Reference moment" (R1).
- `tasks.md:129` (task 6.4) requires a grep for `"removeLocation"` in `src` to print nothing. `tasks.md:82` (task 5.1) keeps and extends the key list in `controller/useLocations.test.tsx:28`, which contains `"removeLocation",` (R4).
- `specs/locations/spec.md:86,93` requires "the reference zone's UTC offset MUST be computed once per presentation", and `proposal.md:115` (NFR-P1) says the same. `design.md:59` (D4) verifies it by asserting that the lookup count with home exceeds the count without home by at most 1. Both presentations compute a reference offset, so a per-row computation adds the same amount to both counts and the check still passes (R2).

## Findings

### R1 — WARNING — A reference zone change leaves a stale gap note, against FR4
- Location: `openspec/changes/set-home-location-and-show-differences/design.md:37`
- Rule: `.claude/rules/traceability.md` (every FR clause needs an implementing test); `.claude/rules/delta-specs.md`
- Problem: FR4 (`proposal.md:99`) and the home-location requirement "Reference zone follows home" (`specs/home-location/spec.md:57`) say "the reference day, the date bar's date and the gap note MUST follow the new zone in the same render". D2 decides that only the body of `getReferenceZone` changes and that "a home change does not touch `state.reference`". But the gap note does not come from the zone. `buildDateBar` in `controller/useReferenceMoment.ts:30-36` shows it whenever `reference.wallClockStatus === GAP`, with `reference.requestedWallTime`. Both were resolved by `reduceReferenceMoment.ts:45-58` in the previous reference zone. FR4 covers every reference zone change ("A change of the reference zone keeps the reference moment … The reference day, the date bar's date and the gap note follow the new zone in the same render"). Without home, that includes a device time zone change. `SET_DEVICE_TIME_ZONE` also keeps `state.reference` (`model/locations.ts:143-150`; `model/referenceMomentPicking.test.ts:118` asserts `outcome.state.reference` is `state.reference`). The stable `openspec/specs/date-selection/spec.md:64` says the note "MUST stay until the next date change, the next time selection on a day track … or Now", and the change does not modify that requirement. No scenario and no task (2.2, 5.1, 7.1, 7.4) checks the gap note after a reference zone change.
- Impact: Example: device `America/New_York`, the user moves to 2026-03-08 at 02:30 (a DST gap). The moment is pinned at `2026-03-08T07:30:00Z` with status GAP. The user then makes Almaty home. The date bar keeps saying "02:30 does not exist on this day because of a clock change; showing 12:30.", which describes the old zone and is false for Almaty. The same happens when the home location is removed, when another tab changes home, and, without home, when the device time zone changes. This breaks FR4 undetected, because no test covers it.
- Fix: (1) In `design.md` D2, add this rule. After any command, `reduceLocations` (`model/locations.ts:102`) compares `getReferenceZone` of the previous and the next state. If they differ and the moment is pinned with `wallClockStatus` GAP, it keeps the instant and resets the status to `WallClockStatus.UNIQUE`, with `requestedWallTime` = the instant's wall time in the new zone. Otherwise it returns `state.reference` unchanged, the same object. Keying on `getReferenceZone` covers SET_HOME_LOCATION, REMOVE_LOCATION of home, REPLACE_LOCATIONS and SET_DEVICE_TIME_ZONE in one place. Put the rule in one new model helper, `model/followReferenceZone.ts`, so it stays in the model (ADR-0002) and `locations.ts` stays under 200 lines. (2) In `specs/date-selection/spec.md`, add a MODIFIED "Wall-clock resolution on the new date" that restates the stable requirement and all its scenarios. Change only the sentence about when the note stays: "… or Now, or until the reference zone changes". (3) In `specs/home-location/spec.md`, under "Reference zone follows home", add the scenario "A home change drops the gap note": GIVEN device `America/New_York`, list New York and Almaty, the moment pinned at 02:30 on `2026-03-08` (gap, shown 03:30); WHEN the user makes Almaty home; THEN the moment is still pinned to `2026-03-08T07:30:00Z` AND the date bar shows no gap note. (4) In the date-selection delta, add a twin scenario for a device time zone change without home. (5) Add both cases to task 2.1 (unit tests of the helper and of `reduceLocations`) and to the scenario lists of tasks 7.1 and 7.4.
- Fix risk: Medium. The instant is kept, so "A pinned moment keeps its instant" still holds. `referenceMomentPicking.test.ts:110-130` keeps passing only if the helper returns the same `reference` object when the status is not GAP: `pinnedState` uses `WallClockStatus.UNIQUE` (`src/test/referenceMomentSupport.ts:29`), and the test asserts `toBe`. D2's claim "only the body of `getReferenceZone` changes" and the Consequence "Home changes one function body" must be reworded. The new MODIFIED block has to restate the stable requirement exactly, apart from the one sentence (`delta-specs.md`). The helper adds one file to the mutation runs, and task 2.6 already holds 5 files, so the helper needs a run of its own.
- Status: open

### R2 — WARNING — The NFR-P1 work bound cannot detect a per-row reference offset
- Location: `openspec/changes/set-home-location-and-show-differences/design.md:59`
- Rule: `.claude/rules/test-planning.md` (work bounds as blocking unit BDD); ADR-0008
- Problem: NFR-P1 and the scenario "50 rows within the work bound" (`specs/locations/spec.md:86-93`) require "the reference zone's UTC offset is computed once" per presentation. D4 checks this by counting `toZonedDateTimeISO` calls: "presents the 50 rows without a home and then with one … asserts that the count with home exceeds the count without by at most 1". Without home, differences are still computed, from the device time zone (FR5). So both presentations compute a reference offset. If the presenter computed it once per row, both counts would grow by 50 and their difference would stay 0, so the assertion passes.
- Impact: The one blocking check of the "once per presentation, not once per row" clause passes on the regression it is meant to catch, so NFR-P1 is untested (task 7.2, M1).
- Fix: In `design.md` D4 and task 7.2, replace the "with home minus without home" comparison with a per-zone count. The `toZonedDateTimeISO` spy records its zone argument. The 50 rows put the home location alone in `Asia/Almaty` and exactly one non-home row alone in `Europe/Moscow`, and the other rows in other zones. The step calls `getReferenceOffsetMinutes` once and then `presentLocationRows`, as `useLocations` does. Assert that the lookups in `Asia/Almaty` exceed those in `Europe/Moscow` by at most 1, together with the formatter bounds of `startWorkCount()`.
- Fix risk: Low. The home row and the Moscow row must do the same per-row work. That holds under D4, because the home row's difference returns `undefined` without a lookup, and both rows compute their UTC offset, local time and day track. If a later change gives the home row extra per-row work, the check needs adjusting. The spy stays test-scoped in `src/test/` (ADR-0008, `bdd-unit.md`).
- Status: open

### R3 — WARNING — Closing the menu on focusout can swallow item taps in Safari
- Location: `openspec/changes/set-home-location-and-show-differences/design.md:88`
- Rule: — (FR14, `proposal.md:109`)
- Problem: D7 says: "Focus leaving the menu (`focusout` outside it) also closes it." WebKit (Safari on macOS and iOS, including iOS 12.5) does not focus a `<button>` on mouse press or tap. When a menu item that is not focusable by mouse is pressed while focus is inside the menu, WebKit moves focus to the nearest focusable ancestor or clears it. This fires `focusout` with `relatedTarget === null` before `click`. Under D7 that `focusout` closes and unmounts the menu, so the item's `click` never reaches it. The planned tests cannot show this, because jsdom (`userEvent.click`, tasks 6.2 and 7.3) and Chromium (task 8.2) both focus buttons on click. Only the manual H3 would find it.
- Impact: On Safari, a tap on "Remove" or "Make home" can close the menu without running the action. That breaks FR14 ("Removing a location MUST stay possible on iOS Safari 12.5"), and the failure would first appear in the manual H3 device check, after implementation.
- Fix: In `design.md` D7, change the focusout bullet to: "`focusout` closes the menu only when `relatedTarget` is an element outside the menu; a `focusout` with `relatedTarget === null` is ignored, and taps outside are handled by the pointer/touch listeners above; Tab closes it through the key mapping". Also give the `role="menu"` container `tabIndex={-1}`, so that WebKit moves focus to the menu itself. In task 6.2 (`LocationMenu.legacy.test.tsx`), add a case: a `focusout` with `relatedTarget: null` fired on the focused item, followed by a click on "Remove", still calls remove.
- Fix risk: Low. Keyboard users who Tab out still close the menu through the Tab key (D7 "Esc and Tab close the menu"). The `tabIndex={-1}` container must not become a Tab stop. A negative tabindex is not one, so NFR-A2's "one Tab stop per card" holds.
- Status: open

### R4 — WARNING — The grep check of task 6.4 can never print nothing
- Location: `openspec/changes/set-home-location-and-show-differences/tasks.md:129`
- Rule: `.claude/rules/test-planning.md` (the verification lists concrete commands that can pass)
- Problem: The verification of task 6.4 requires `grep -rnE "(^|[^A-Za-z])locations\.removeLocation|\"removeLocation\"" src` to print nothing. The alternative `"removeLocation"` also matches `packages/client/src/controller/useLocations.test.tsx:28` (`"removeLocation",`). That line is in the key list of "should return exactly the documented members". It names the hook action `removeLocation`, which this change keeps, and task 5.1 (`tasks.md:82`) extends the same list with `setHomeLocation`. Neither 6.4 nor 5.1 removes it.
- Impact: Once every edit of task 6.4 is done, the grep still prints `useLocations.test.tsx:28`, so the implement stage cannot tick 6.4. Or it deletes a valid assertion about the hook's public members to make the grep pass.
- Fix: In `tasks.md:129`, replace the pattern with `grep -rnE "(^|[^A-Za-z])locations\.removeLocation|\"removeLocation\":" src`. The `:` matches the locale key in `locales/en.json:34` / `ru.json:34`, and not the `"removeLocation",` entry of the hook key list. On main today, the new pattern prints exactly the i18n uses that task 6.4 edits (`LocationRow.tsx:139`, both locales, and the worlds and steps files it lists), plus `locationsReorderE2eHelpers.ts:24`, which it also edits.
- Fix risk: none. The new pattern still catches every leftover use of the retired i18n key: `t("locations.removeLocation")`, `i18n.t(...)`, `englishLocale.locations.removeLocation` and the JSON key.
- Status: open

### R5 — SUGGESTION — The dependency's unapplied handoff H1 is not mentioned
- Location: `openspec/changes/set-home-location-and-show-differences/proposal.md:9`
- Rule: —
- Problem: The proposal says "Its handoff patches H2 (ADR-0009) and H3 (the browser-compatibility glossary context) have not been applied on main yet." H1 of `support-legacy-ios-12-safari` (the CI step "Check legacy build", archived `handoff/README.md:5`) is not applied either. `.github/workflows/ci.yml` runs `check:bundle-size` (line 47) but not `check:legacy-build`.
- Impact: A reader of NFR-P2 ("the build stays free of syntax that Safari 12 cannot parse (`check:legacy-build`)") may assume CI guards it. Only task 10.2 runs the check, and it runs it locally.
- Fix: In `proposal.md:9`, write "Its handoff patches H1 (the CI step `check:legacy-build`), H2 (ADR-0009) and H3 (…) have not been applied on main yet. This change does not rely on them: task 10.2 runs `check:legacy-build` itself."
- Fix risk: none.
- Status: open

### R6 — SUGGESTION — "A pinned moment keeps its instant" never puts Almaty in the list
- Location: `openspec/changes/set-home-location-and-show-differences/specs/home-location/spec.md:72-77`
- Rule: `.claude/rules/gherkin.md`
- Problem: The scenario makes Almaty home, but its GIVEN steps only set the device zone and the pinned instant. FR1 lets only a location of the list become home. The twin scenario in `specs/date-selection/spec.md` adds "the list contains Almaty and Moscow".
- Impact: Taken literally, "make Almaty home" fails as location not found. The step author has to guess the list, so the unit BDD of task 7.1 may differ from the date-selection scenario.
- Fix: Add "- **AND** the list contains Almaty and Moscow" after the pinned-moment GIVEN at `specs/home-location/spec.md:74`.
- Fix risk: none.
- Status: open

## Verdict

Needs revision. There are no CRITICAL findings. Before implementation, fix the WARNINGs R1 (a stale gap note after any reference zone change, against FR4 and the stable date-selection rule), R2 (the NFR-P1 work bound cannot fail), R3 (focusout dismissal against FR14 on Safari) and R4 (the grep check of task 6.4 cannot pass). R5 and R6 are polish.
