# Specs review: show-here-entry-for-device-time

## Summary

| Item | Value |
|---|---|
| Stale claims | 2 |
| Requirements fully covered | 42/42 |
| Contradictions | 3 |
| CRITICAL | 0 |
| WARNING | 3 |
| SUGGESTION | 1 |

## Freshness

- ✅ Both predecessors are archived: `openspec/changes/archive/2026/10/2026-10-29-set-home-location-and-show-differences/` exists with `handoff/H1-glossary-home-location.patch`, `H2-architecture-docs-home-location.patch` and `README.md` (proposal.md:3, tasks.md:166-169).
- ✅ `isLocationInDeviceTimeZone(location: Location, deviceTimeZoneId)` is the one matching rule (`packages/client/src/model/deviceTimeZone.ts:8-12`, compares `location.timeZoneId`); `getLocationMarkKind(location, deviceTimeZoneId, homeLocationId)` is in `model/locationMark.ts:20` (design.md:7).
- ✅ `getReferenceOffsetMinutes(state, instant)` and `getOffsetDifferenceMinutes(location: Location, rowOffsetMinutes, referenceOffsetMinutes, { deviceTimeZoneId, homeLocationId })` exist in `model/offsetDifference.ts:12,26-43`; the function reads only `location.id` (line 35) and `location.timeZoneId` through `isLocationInDeviceTimeZone` (line 38) (design.md:8).
- ✅ `SET_DEVICE_TIME_ZONE` is dispatched at start and in the `useMinuteTick` callback (`controller/LocationsProvider.tsx:52,123-128`) (design.md:9).
- ✅ `presentLocationRows.ts` is 131 lines and calls `getUtcOffsetMinutes`, `formatUtcOffset`, `getLocationMarkKind`, `presentLocationMarks`, `getOffsetDifferenceMinutes`, `formatOffsetDifference` (→ `offsetDifferenceLabel`, `offsetDifferenceAccessibleLabel`), `getLocalDateTime`, `formatLocalTime`, `formatLocalDate` and `presentDayTrack`; only `id`, `cityLabel`, `countryName`, the mark and the difference's home check depend on the `Location` (`presenter/presentLocationRows.ts:66-131`). Formatters are cached in `formattersByKey` (`presenter/dateTimeFormatters.ts:26`) (design.md:10).
- ✅ `useLocations` presents the rows in one `useMemo` with one `clock.instant()` read, keyed by state, language and `minuteTick` (`controller/useLocations.ts:44-56`); `loadStatus` is on `LocationsContextValue` (`controller/locationsContext.ts:34`) and is spread to callers (design.md:11, D4).
- ✅ `useCitySearch` caches only a resolved search in the module-level `WeakMap` `loadedSearches`, does not cache a failure, and is called only inside `OpenLocationSearch` (`controller/useCitySearch.ts:16,34-45`; `views/shared/LocationSearch.tsx:24-30`); the default loader is `loadCitySearch = createFetchCitySearchLoader()` (`adapters/loadCitySearch.ts`) (design.md:12).
- ✅ `CitySearch` has only `search` and `suggest` (`ports/citySearch.ts`); `createCompositeCitySearch` keeps `recordsById` keyed by canonical record ID (`adapters/city-search/createCompositeCitySearch.ts:52-54`); no `CitySearch` contract suite exists, only `citySource.contract.ts` (design.md:13).
- ✅ `zoneCitiesSource.ts` has the private `deriveNameFromZoneId` with `ZONE_ID_SEPARATOR` and `UNDERSCORES` (lines 24-25, 47-49), adds `UTC_ZONE_ID`, canonicalizes zone IDs (lines 64-66), and `readCountryTexts` keeps the `Intl.DisplayNames` guard (lines 88-90) (design.md:14, proposal.md:28).
- ✅ `CardsView` returns `LocationsLoadError` for `LocationsStatus.UNREADABLE`, shows `views.cardsEmptyState` when `rows.length === 0`, otherwise `LocationList`, then `LocationSearch` (`views/cards/CardsView.tsx:41-89`); `LocationList` renders the `<ul>` inside `DndContext`/`SortableContext` and announces with `useReorderAnnouncements(rows)` (`views/shared/LocationList.tsx:79,102-135`); `LocationRow.tsx` is 197 lines with `DragHandle`, `LocalDateTime`, `DayTrack` (`track`, `city`, `onSelectFraction`, `onMoveTrack`) and `LocationMenu` (lines 127-193) (design.md:15).
- ✅ `UNIT_TEST_DEVICE_TIME_ZONE = "Pacific/Kiritimati"` (`src/test/deviceTimeZone.ts:5`); `E2E_DEVICE_TIME_ZONE = "Asia/Almaty"` used as `timezoneId` (`playwright.bdd.config.ts:39,80`) (design.md:16).
- ✅ The E2E states `empty`, `search loading`, `search error`, `suggestions`, `results`, `no matches` and `IST results` start from no list, while every other screenshot state seeds a list containing Almaty (`LIST_CITY_NAMES = ["Almaty", "Moscow"]`, `HOME_CITY_NAMES = ["Almaty", …]`, `steps/locationsStates.ts:29-35,136-170`), so only `empty`, `suggestions` and `IST results` baselines meet the Here entry (design.md:16, D9, tasks 8.4).
- ✅ The scenarios "Data loads only when the search opens" (`locations_ui_e2e.feature:33`) and "The slash key loads the search data only when it opens the search" (`locations_search_shortcut_e2e.feature:19`) exist (design.md:16, tasks 8.3).
- ✅ Legacy owners exist: `lib/legacy/zoneShim.ts`, `IS_POINTER_EVENTS_SUPPORTED` used by `LocationList.tsx:24-36`, `test/features/browser_compatibility/steps/legacyZoneWorld.ts`, `emulateEngineWithoutPointerEvents` in `src/test/e2e/withoutPointerEvents.ts:17`, `src/test/noBigIntInSources.test.ts` (design.md:17, D7).
- ✅ Test helpers named by tasks exist: `createSwitchableClock`, `createManualTickScheduler`, `createManualWriteScheduler`, `startWorkCount` and `MAX_TRANSITION_LOOKUPS_PER_ZONE` (`src/test/workCounters.ts:8,33`), `holdSearchData`/`releaseHeldRequests` (`steps/locations_ui_e2e.fixtures.ts:109,125`), `test/benchmarks/rowPresenting.bench.ts`, `src/locales/locales.test.ts`, `stubZoneCitiesFetch`, the `view-contract-${view.id}` projects (`playwright.bdd.config.ts:51`) and the `bench`, `test:bdd`, `check:bundle-size`, `check:legacy-build`, `typecheck`, `lint` scripts of `@time-zones/client` (tasks.md).
- ✅ Existing strings the design relies on: `locations.hereMarkLabel` «Вы здесь», `hereMarkCaption` «здесь», `timeSliderLabel` «Время — {{city}}» / "Time in {{city}}", `views.cardsEmptyState` (`locales/ru.json:27-54`, `en.json`) (D5, D8, NFR-A2).
- ✅ The zone cities file is precached: `globPatterns` include `json` (`vite.config.ts:54`) (proposal.md:66).
- ✅ Docs claims for the handoff patches: `docs/glossary/time.md:21` Offset difference is *(planned)*; `docs/glossary/locations.md:14` Here entry is *(planned)*; `search.md:9` Exemplar city has no *Code:*; no Location menu entry in `docs/glossary/`; `docs/architecture/views.md:80` says "Device time · GMT+5"; `docs/architecture/domain-model.md:89-90` puts "the derived Here entry first" in `getRows` and an "is-derived" flag in `getLocationSnapshot` (proposal.md:32, design D5, tasks 9).
- ✅ MODIFIED requirements are restated from `openspec/specs/`: "Empty state" (`main-page/spec.md:89-100`), "Search is fast and lazy" (`location-search/spec.md:162-179`) and "Open the search with the slash key" (`location-search/spec.md:219-244`); no Here entry requirement exists yet in `openspec/specs/` and none is implemented on `main`.
- ✅ All eight ADRs under `docs/adr/` are `Accepted`; ADR-0007 lines 61, 72, 83-84 back the Here entry, the empty state and ID-only matching.
- ❌ design.md:62 says "The city slot is one clamped line (`truncate`)". On `main` the city is a `font-semibold` span inside a `flex flex-wrap` line in a `break-words` column (`views/shared/LocationRow.tsx:135-140`); nothing is clamped (see R3).
- ❌ "Nothing is written to storage" / "0 storage writes" on first launch (proposal.md:72 G3, :107 FR7, :177 M5; `specs/main-page/spec.md:94` "MUST NOT write anything to storage"). The running app already writes on start: the language detector caches the language (`src/i18n.ts:31-33`, `caches: ["localStorage"]`) and the availability probe writes and removes a key (`adapters/localStorageAvailability.ts` via `setItem`/`removeItem`, lines 16-17) (see R2).

## Coverage

| Requirement id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ locations "Here entry when no location matches" | ✅ 2.2, 5.2, 6.3, 7.1 |
| FR2 | ✅ | ✅ "Here entry content" | ✅ 4.2, 6.2, 7.1 |
| FR3 | ✅ | ✅ "Offset difference on the Here entry" | ✅ 2.1, 4.2, 7.1 |
| FR4 | ✅ | ✅ "Here entry is not a location" | ✅ 6.2, 7.1, 8.1 |
| FR5 | ✅ | ✅ "Select a time on the Here entry" | ✅ 6.2, 7.1, 8.1 |
| FR6 | ✅ | ✅ "Here entry follows the device time zone" | ✅ 2.2, 5.2, 7.1 |
| FR7 | ✅ | ✅ main-page "Empty state" | ✅ 6.3, 7.2 |
| FR8 | ✅ | ✅ "Exemplar city of the Here entry", location-search MODIFIED | ✅ 3.2, 5.1, 5.3, 7.1, 8.3 (unit reuse wiring: R1) |
| FR9 | ✅ | ✅ "Here entry in other page states" | ✅ 5.2, 6.3, 7.1 |
| FR10 | ✅ | ✅ "Here entry strings are localized" | ✅ 1.1, 4.2, 7.1 |
| FR11 | ✅ | ✅ "Here entry in every view" | ✅ 8.2 |
| FR12 | ✅ | ✅ "Here entry on outdated zone data" | ✅ 3.2, 7.1, 8.1 |
| NFR-P1 | ✅ | ✅ "Here entry is fast" | ✅ 4.1, 7.1, 7.3 |
| NFR-P2 | ✅ | ✅ "Exemplar city of the Here entry" | ✅ 5.3, 7.1 |
| NFR-A1 | ✅ | ✅ "Accessible Here entry" ("No violations") | ✅ 8.1 |
| NFR-A2 | ✅ | ✅ "Accessible Here entry" | ✅ 4.2, 6.2, 8.1 |
| NFR-R1 | ✅ | ✅ "Here entry layout" | ✅ 8.1 |
| NFR-R2 | ✅ | ✅ "Approved screenshots" | ✅ 8.4 |
| UX1 | ✅ | ✅ "Here entry content", "Here entry layout" | ✅ 6.2, 7.1, 8.1 |
| UX2 | ✅ | ✅ main-page "Empty state" | ✅ 6.3, 7.2 |
| UX3 | ✅ | ✅ "The exemplar city keeps the height" | ✅ 8.1 (clamp decision: R3) |
| M1 | ✅ | n/a | ✅ 10.1 |
| M2 | ✅ | ✅ "Here entry on the design sample", "No home" | ✅ 4.2, 6.2 |
| M3 | ✅ | ✅ FR6 scenarios | ✅ 5.2, 7.1 |
| M4 | ✅ | ✅ "Travelling with home set" | ✅ 4.2, 7.1 |
| M5 | ✅ | ✅ "Nothing is stored", "The Here entry's request is the only one" | ✅ 5.2, 5.3, 8.3 (wording: R2) |
| M6 | ✅ | n/a | ✅ 2.3, 3.3, 4.3, 5.5, 6.4, 8.1, 8.4 |
| M7 | ✅ | ✅ "Renamed device time zone" | ✅ 7.1 |
| G1 | ✅ | n/a met by FR1, FR7, FR3 | n/a met by FR1, FR7, FR3 |
| G2 | ✅ | n/a met by FR6, M3 | n/a met by FR6, M3 |
| G3 | ✅ | n/a met by FR7, M5 | n/a met by FR7, M5 |
| NG1 | ✅ | n/a | n/a no artifact adds an "Add to list" action |
| NG2 | ✅ | n/a | n/a no wall-time input is built |
| NG3 | ✅ | n/a | n/a no prompt or notice is built |
| NG4 | ✅ | n/a | n/a matching stays by ID (task 2.2 Minsk case) |
| NG5 | ✅ | n/a | n/a only the Cards view is touched |
| NG6 | ✅ | n/a | n/a `scripts/zoneData/extractZoneData.ts` is not touched |
| Q1 | ✅ | n/a | n/a answered in proposal.md:185 and design D3, D4 |
| Q2 | ✅ | n/a | n/a answered: no (NG1) |
| Q3 | ✅ | n/a | n/a answered: deferred to `add-wall-time-input-with-hint` (NG2) |
| Q4 | ✅ | n/a | n/a answered: no Here entry (FR9, design D4) |
| Q5 | ✅ | ✅ location-search MODIFIED requirements | ✅ 8.3 |

## Consistency

- design.md:52 says the provider's loader "is the same instance `LocationSearch` uses by default, so both share the cache", but `LocationSearch` never reads the provider's loader (`views/shared/LocationSearch.tsx:11,30`, `controller/useCitySearch.ts:23`), while design.md:52, :90 and tasks.md:114, :132 inject a test loader only into `LocationsProvider` and expect the search to reuse it (`specs/locations/spec.md:159-164`).
- design.md:59 and tasks.md:105 make `ZoneRowContent` the layout shared with `LocationRow`, extracted "without behaviour change", while design.md:62 gives the shared city slot a `truncate` clamp that `LocationRow.tsx:135` (`break-words`) does not have.
- `specs/main-page/spec.md:94` ("MUST NOT write anything to storage") and proposal.md:72, :177 ("0 storage writes") disagree with the existing start-up writes in `src/i18n.ts:33` and `adapters/localStorageAvailability.ts:16-17`, and with the change's own scenarios, which assert only "no location list is stored" (`specs/main-page/spec.md:101`, `specs/locations/spec.md:90`).

## Findings

### R1 — WARNING — The search does not use the loader the Here entry loads with
- Location: `openspec/changes/show-here-entry-for-device-time/design.md:52`
- Rule: —
- Problem: D4 adds `loadCitySearch` to `LocationsProvider` and lets the Here entry load through it, and claims that in the app this is "the same instance `LocationSearch` uses by default". But `LocationSearch` has its own optional `loadCitySearch` prop (`views/shared/LocationSearch.tsx:11`) passed to `useCitySearch(loadCitySearch)` (line 30), whose default is the adapter singleton (`controller/useCitySearch.ts:23`), and `CardsView` renders `<LocationSearch>` without the prop (`views/cards/CardsView.tsx:86`). The sharing therefore holds only by the coincidence that two defaults point to the same module constant. Design D4/D9 and tasks 5.4, 6.3 and 7.1 inject a deferred loader into `LocationsProvider` only.
- Impact: In the unit BDD of task 7.1, the scenario "The search reuses the Here entry's data … requested exactly once" (`specs/locations/spec.md:159-164`) cannot pass as tasked: the Here entry calls the injected loader and the opened search calls the fetch-based default, so it makes a second, different request. The implementer either cannot write the scenario or wires a second injection path. Nothing in the code then guarantees FR8's "the search reuses data the Here entry loaded" beyond a default-value coincidence.
- Fix: In design D4, add: "`OpenLocationSearch` takes its loader from `useLocations().loadCitySearch` (the provider's) when the `loadCitySearch` prop is not set, so the page has one loader and one cache entry." In task 5.2 or 6.3, add a case: "with a deferred loader on `LocationsProvider`, the Here entry and a search opened after the load call it exactly once (FR8, M5)." Add `src/views/shared/LocationSearch.tsx` to the files the change touches (proposal Impact, `views/shared/`).
- Fix risk: Low. `LocationSearch` already calls `useLocations` (`LocationSearch.tsx:2`), so it is always inside the provider. Existing `LocationSearch*.test.tsx` that pass the prop keep their behaviour. `useCitySearch`'s own default stays for any caller without a provider.
- Status: fixed
- Resolution: confirmed (`LocationSearch.tsx:11,30` and `useCitySearch.ts:23` never read the provider loader). design.md D4 now has `OpenLocationSearch` pass `loadCitySearch ?? useLocations().loadCitySearch` to `useCitySearch`; proposal.md Impact (`views/shared/`) names the `LocationSearch` change; tasks.md 6.3 adds the case "deferred loader on `LocationsProvider`, Here entry and a later search call it exactly once (FR8, M5)", and 6.4 mutates `LocationSearch.tsx`.

### R2 — WARNING — "Nothing is written to storage" is false for the running app
- Location: `openspec/changes/show-here-entry-for-device-time/specs/main-page/spec.md:94`
- Rule: —
- Problem: The MODIFIED "Empty state" says the Cards view "MUST NOT write anything to storage", FR7 says "Nothing is written to storage" (proposal.md:107), G3 says "0 storage writes happen" (proposal.md:72) and M5 says "First launch: 0 storage writes" (proposal.md:177). The app already writes on every start: the i18next language detector caches the detected language in `localStorage` (`src/i18n.ts:31-33`, `caches: ["localStorage"]`), and the storage availability probe writes and removes a key (`adapters/localStorageAvailability.ts:16-17`). The change's own scenarios only check that "no location list is stored" (`specs/main-page/spec.md:101`, `specs/locations/spec.md:90`), and task 5.2 checks the write scheduler of the location repository.
- Impact: An implementer who tests M5 or the MODIFIED SHALL literally (spy on `Storage.prototype.setItem`, or assert an empty `localStorage` in E2E) gets a red test caused by code outside this change. Archived as written, the stable `main-page` spec would state a rule the app breaks on every start.
- Fix: Reword to the location list: `specs/main-page/spec.md:94` "… and it MUST NOT store a location list."; FR7 "No location list is written."; G3 "… and no location list is written."; M5 "First launch: 0 writes of the location list (none scheduled by the location repository), …".
- Fix risk: none. The scenarios and task 5.2 already measure exactly the location-list writes; the reworded text matches them and ADR-0004 (only repositories write).
- Status: fixed
- Resolution: confirmed (`src/i18n.ts:33`, `localStorageAvailability.ts:16-17` write on start). Reworded to the location list: `specs/main-page/spec.md` "MUST NOT store a location list", proposal.md FR7 "No location list is written", G3 "no location list is written", M5 "0 writes of the location list (none scheduled by the location repository)".

### R3 — WARNING — The city clamp for UX3 contradicts the shared row layout
- Location: `openspec/changes/show-here-entry-for-device-time/design.md:62`
- Rule: —
- Problem: D5 states "The city slot is one clamped line (`truncate`), so swapping the derived for the exemplar city keeps the height (UX3)". On `main` the city is not clamped: it sits in a `flex flex-wrap` line with the mark, difference and caption, inside a `break-words` column (`views/shared/LocationRow.tsx:135-140`). D5 also moves that city slot into `ZoneRowContent`, shared with `LocationRow` (design.md:59), and task 6.1 extracts it "without behaviour change" (tasks.md:105).
- Impact: The implementer cannot tell whether to put `truncate` on the shared city slot, which silently changes every location card from wrapping long names to cutting them (undeclared behaviour change, possibly re-baselining screenshots), or only on the Here entry, which needs a `ZoneRowContent` option the design does not define. If they do neither, UX3 rests on `Almaty`/`Алматы` in one E2E case, and a device zone whose exemplar city is longer than its derived name can wrap and grow the row.
- Fix: Replace design.md:62 with: "Today the city wraps (`LocationRow.tsx:135`, `break-words`). `ZoneRowContent` takes a boolean option for a one-line city; `HereEntryRow` sets it, so its city is one `truncate` line, and location cards keep wrapping, so task 6.1 stays behaviour-free. A real browser measures the height: the E2E scenario 'The exemplar city keeps the height' (task 8.1)." In task 6.2, name the option among the props `HereEntryRow` passes.
- Fix risk: Low. A very long exemplar city on the Here entry ends with an ellipsis where a card would wrap, which is a small difference from UX1 ("differs only by the meta line"). D5 should say so. No existing test or screenshot changes, because location cards keep their layout.
- Status: fixed
- Resolution: confirmed (`LocationRow.tsx:135-140` wraps, no clamp). design.md D5 replaces the clamp line: `ZoneRowContent` takes `isCityOneLine`, set only by `HereEntryRow` (one `truncate` line), so cards keep wrapping and task 6.1 stays behaviour-free; D5 states the ellipsis trade-off against UX1. tasks.md 6.2 names the option.

### R4 — SUGGESTION — FR1's reason does not hold when the matching location is home
- Location: `openspec/changes/show-here-entry-for-device-time/proposal.md:95`
- Rule: —
- Problem: FR1 says no Here entry is shown when a location matches "because that location already has the Here mark". When the matching location is the home location, it shows the Home mark instead, because `getLocationMarkKind` returns `LocationMarkKind.HOME` before `HERE` (`model/locationMark.ts:20-24`, design.md:7). No scenario covers home in the device time zone.
- Impact: Low. `getHereEntry` (design D1) uses `isLocationInDeviceTimeZone`, so it behaves correctly, but the case is left untested and the stated reason misleads.
- Fix: Change FR1's reason to "because that location already shows the device time". Add a scenario to "Here entry when no location matches": home Almaty, device `Asia/Almaty` → no Here entry, Almaty shows the Home mark. Add the matching case to task 2.2's `it.each`.
- Fix risk: none. It matches the existing mark priority and ADR-0007.
- Status: fixed
- Resolution: proposal.md FR1 reason now reads "already shows the device time (with the Here mark, or the Home mark when it is the home location)", and its UI States Matrix row matches; added scenario "The home location matches" to `specs/locations/spec.md` (Here entry when no location matches), the home Almaty case to task 2.2 and the scenario to task 7.1.

## Verdict

Needs revision. No CRITICAL findings. The blocking WARNINGs are R1 (the search and the Here entry do not share one loader), R2 (the storage-write wording conflicts with existing start-up writes) and R3 (the city clamp conflicts with the behaviour-free shared layout). R4 is optional polish.
