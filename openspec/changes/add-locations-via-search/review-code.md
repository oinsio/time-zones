# Review: add-locations-via-search

## Summary

| Item | Value |
|---|---|
| Tasks verified | 49/49 |
| Requirements traced | 102/105 |
| CRITICAL | 1 |
| WARNING | 2 |
| SUGGESTION | 1 |

## Tasks

Paths are under `packages/client/` unless they start with `docs/`. Base of the branch: `e043bed`.

- ✅ 1.1 `tsconfig.app.json:7` has `"ES2022.Intl"` in `lib`.
- ✅ 1.2 `package.json:24` `@radix-ui/react-dialog`; `package.json:55-56` `cldr-bcp47` and `cldr-dates-full` `^48.2.0` as dev dependencies.
- ✅ 1.3 `scripts/zoneData/extractZoneData.ts` (pure rules incl. `COUNTRY_CODE_OVERRIDES`, `utc` special case), `scripts/zoneData/zoneDataPlugin.ts` (three virtual modules, `emitFile` in build, dev middleware, `virtual:zone-cities` only in test mode); registered in `vite.config.ts:21` and `vitest.config.ts:7`; modules declared in `src/vite-env.d.ts:4-16`; `tsconfig.test.json:15` includes it; data test `src/adapters/city-search/zoneCities.test.ts`.
- ✅ 1.4 `src/constants/storage.ts:6` `STORAGE_KEYS.LOCATIONS`, `LOCATIONS_SYNC_CHANNEL_NAME`; `src/constants/locations.ts` schema version and debounce; `src/constants/search.ts` `MAX_SEARCH_RESULTS`, `POPULAR_TIME_ZONE_IDS`; `src/constants/keyboard.ts` arrow keys and Enter; all exported from `src/constants/index.ts`.
- ✅ 1.5 Four tokens in both blocks of `src/styles/tokens.css`, mapped in `tailwind.config.ts`; `src/styles/tokens.test.ts` checks hex format and contrast; `themeTokens.ts` extended.
- ✅ 2.1 `src/model/timeZoneId.ts:12-25` (offset prefix rejection, Temporal validation, alias map) with `src/model/timeZoneId.test.ts`.
- ✅ 2.2 `src/model/locations.ts` enums, derived id, typed errors, same state on failure; `src/model/locations.test.ts`.
- ✅ 2.3 `src/model/parseStoredLocations.ts` with `src/model/parseStoredLocations.test.ts` (legacy ID, offset, shape, canonical duplicate dropped).
- ✅ 2.4 `src/model/store.ts` (notifies only on a new state object) with `src/model/store.test.ts`.
- ✅ 2.5 `src/model/index.ts` exports; `src/test/factories/buildLocation.ts`; `test/features/locations/locations_management.feature` + `steps/locations_management.steps.ts` (9 scenarios over the real reducer and store).
- ✅ 2.6 `docs/architecture/domain-model.md:57` holds the `REPLACE_LOCATIONS` row.
- ✅ 2.7 Measured in this review: `locations.ts` 100%, `store.ts` 100%, `parseStoredLocations.ts` 97.92%, `timeZoneId.ts` 94.12% (see Mutation).
- ✅ 3.1 `src/ports/locationRepository.ts` (`LocationsLoadStatus`, `SaveOutcome`, synchronous port), exported from `src/ports/index.ts`.
- ✅ 3.2 `src/adapters/locationRepository.contract.ts` run in `src/adapters/locationRepository.test.ts`; `src/adapters/inMemoryLocationRepository.ts` with `isWritable` and shared backend.
- ✅ 3.3 `src/adapters/localStorageLocationRepository.ts` (lazy `getStorage`, `FAILED` on throw, `storage` fallback at `:137`, `persist` once at `:89`) with `localStorageLocationRepository.test.ts`, `.failures.test.ts`, `.defaults.test.ts`.
- ✅ 3.4 Both adapters exported from `src/adapters/index.ts`; measured 100% and 95.16%.
- ✅ 4.1 `src/ports/citySearch.ts` (`CityRecord`, `CitySearchResult`, `SearchMatchKind`, `CitySearch`, `LoadCitySearch`).
- ✅ 4.2 `src/adapters/city-search/normalizeSearchText.ts:12` (NFD + `\p{M}` removal) with `normalizeSearchText.test.ts`.
- ✅ 4.3 `src/adapters/city-search/zoneCitiesSource.ts` (injectable `listTimeZones`, canonicalized and de-duplicated IDs, UTC always present, derived names) with `zoneCitiesSource.test.ts` and `.matching.test.ts`.
- ✅ 4.4 `src/adapters/city-search/timeZoneAbbreviations.ts` matches the D7 table row for row; `abbreviationSource.ts` with `abbreviationSource.test.ts` (whole-query, case-insensitive, table order, `IS` matches nothing). Its thin table test coverage is R3.
- ✅ 4.5 `src/adapters/city-search/citySource.contract.ts` run against both sources in `citySources.test.ts`.
- ✅ 4.6 `src/adapters/city-search/createCompositeCitySearch.ts` (kind order, stable table order, rank, `Intl.Collator`, cap at `:80`, `suggest` at `:82`) with `createCompositeCitySearch.test.ts` and `.results.test.ts`.
- ✅ 4.7 Five feature files under `test/features/location_search/` with steps over `virtual:zone-cities` (`steps/searchWorld.ts`); performance steps use `performance.now()` for 10 queries.
- ✅ 4.8 Measured: `normalizeSearchText.ts` 93.75%, `zoneCitiesSource.ts` 98.90%, `abbreviationSource.ts` 100%, `createCompositeCitySearch.ts` 97.50%.
- ✅ 4.9 `src/adapters/city-search/fetchCitySearch.ts` (`parseZoneCityRecords`, retry = new fetch) with `fetchCitySearch.test.ts`; `src/adapters/loadCitySearch.ts`; `scripts/check-bundle-size.mjs` fails on a missing, oversized or preloaded `city-search-*.json`; measured 100%.
- ✅ 5.1 `src/presenter/presentLocationRows.ts`, `presentSearchResults.ts` (`isAdded` over every language at `:31`), `countryName.ts`; tests next to them.
- ✅ 5.2 Measured 100% for both presenter files and `countryName.ts`.
- ✅ 6.1 `src/controller/LocationsProvider.tsx` (load in initializer, debounced write, `pagehide` flush at `:118`, subscription by status at `:111`, `hasSaveFailed` at `:63`, reset at `:97`), `useLocations.ts`; tests `useLocations.test.tsx`, `.changes.test.tsx`, `.sync.test.tsx`.
- ✅ 6.2 `src/controller/useCitySearch.ts` (WeakMap cache at `:35`, `retry` at `:51`) with `useCitySearch.test.ts`.
- ✅ 6.3 `src/controller/index.ts` exports; `test/features/locations/locations_persistence.feature` + `steps/locations_persistence.steps.ts` (reload, first launch, legacy ID, unreadable outline, reset, two tabs).
- ✅ 6.4 Measured: `LocationsProvider.tsx` 100%, `useLocations.ts` 100%, `useCitySearch.ts` 97.30%.
- ✅ 7.1 `locations.*` keys incl. four `resultCount` forms in `src/locales/en.json` and `src/locales/ru.json`.
- ✅ 8.1 `src/components/ui/dialog.tsx` (full screen below `sm`, centered `max-w-lg` from `sm`, token classes only) with `dialog.test.tsx`; `src/components/ui/index.ts`.
- ✅ 8.2 `src/views/shared/LocationRow.tsx`, `LocationList.tsx`, `AddLocationButton.tsx`, `LocationsLoadError.tsx`, `index.ts` with `LocationList.test.tsx`, `LocationsLoadError.test.tsx`, `AddLocationButton.test.tsx`.
- ✅ 8.3 `src/views/shared/LocationSearchDialog.tsx`, `LocationSearchResults.tsx`, `LocationSearchStates.tsx` take presenter output and callbacks only; `LocationSearchDialog.test.tsx`, `.keyboard.test.tsx`.
- ✅ 8.4 `src/views/shared/LocationSearch.tsx:85` mounts the hook-owning part only while open; `LocationSearch.test.tsx`.
- ✅ 8.5 `src/app/ViewHost.tsx:43` `data-view-id`; case in `ViewHost.test.tsx`.
- ✅ 8.6 `src/views/cards/CardsView.tsx` (error alone at `:30`, one `LocationSearch`, focus on last removal at `:26`, polite region at `:60`); `src/app/AppShell.tsx:23-25` provider and warning condition at `:51`; `src/test/stubZoneCitiesFetch.ts`; updated `CardsView.test.tsx`, `MainPage.test.tsx`, `AppShell.pageNotices.test.tsx`, main-page steps.
- ✅ 8.7 `test/features/main_page/main_page_states_unit.feature:32` "Add location from the empty state" with steps in `main_page_states_unit.steps.tsx`.
- ✅ 8.8 `test/features/locations/locations_ui_unit.feature` and `locations_storage_ui_unit.feature` (split for file size) with their steps: rows, last removal, add, already added, typing, query cleared, nothing found, corrupted, reset, private mode, save fails later, Russian.
- ✅ 8.9 Measured 100% for `CardsView.tsx`, `LocationList.tsx`, `LocationSearchDialog.tsx`, `LocationSearchResults.tsx`, `LocationSearch.tsx`.
- ✅ 9.1 `playwright.bdd.config.ts:26` `SCREENSHOT_MAX_DIFF_PIXEL_RATIO`, `:67` `snapshotPathTemplate`, `:69` screenshot option; `test/features/locations/steps/locations_ui_e2e.fixtures.ts` (seeding with `STORAGE_KEYS`, held/aborted data route).
- ✅ 9.2 `src/test/viewContractViewport.ts` + test; `playwright.bdd.config.ts:23-24` runtime registry import, `:44` `view-contract-<id>` projects, `:81`/`:86` `grepInvert`; `view_contract/steps/view_contract_e2e.fixtures.ts` and `.steps.ts`; `locations_view_contract_e2e.feature` with the 18-row accessibility outline.
- ✅ 9.3 `locations_ui_e2e.feature:7-37` loading, failure, retry (marker on `window`) and "Data loads only when the search opens".
- ✅ 9.4 `locations_ui_e2e.feature:39-59` remove name, announcements, result count.
- ✅ 9.5 `locations_ui_e2e.feature:61-134` widths 320/2560, phone and wide layouts, screenshots; baselines under `src/test/features/__screenshots__/{chromium,mobile-chrome}`.
- ✅ 9.6 `locations_ui_e2e.feature:136-162` two tabs and offline reopen/search.
- ✅ 10.1 Re-ran the grep of task 10.1 in this review: `missing=0`.
- ✅ 10.2 CI is green (lint, typecheck, build, bundle-size check run there); `scripts/check-bundle-size.mjs` carries the new checks.

## Requirements

- ✅ FR1 — `normalizeSearchText.ts:12`, both languages matched in `zoneCitiesSource.ts`; `location_search_by_name.feature` (diacritics, Russian, case).
- ✅ FR2 — `zoneCitiesSource.ts` `CITY_PREFIX` / `CITY_WORD_PREFIX`; "Full city name", "Later word", "Prefix" scenarios.
- ✅ FR3 — country texts in `en`/`ru` in `zoneCitiesSource.ts`; `location_search_by_country.feature`.
- ✅ FR4 — `abbreviationSource.ts` over `timeZoneAbbreviations.ts`; `location_search_by_abbreviation.feature`.
- ✅ FR5 — ranking and cap in `createCompositeCitySearch.ts`; `location_search_ranking.feature`, `locations_ui_e2e.feature:54`.
- ✅ FR6 — `suggest()` and empty-query branch in `useCitySearch.ts`; "Search opened", "Query cleared" (unit and jsdom).
- ✅ FR7 — `LocationSearchStates.tsx` no-results + hint; "Nothing found" (ranking and UI unit).
- ✅ FR8 — `LocationSearch.tsx` `handleChoose`, `isAdded` in `presentSearchResults.ts:31`; "Add from results", "Already added", view-contract "Add a location from the search".
- ✅ FR9 — `timeZoneId.ts`, `parseStoredLocations.ts`; management and persistence legacy/offset scenarios.
- ✅ FR10 — `REMOVE_LOCATION` in `locations.ts`, `LocationRow.tsx`; management removals, view-contract "Remove a location".
- ✅ FR11 — write only after `addLocation`/`removeLocation` in `LocationsProvider.tsx`; persistence "List survives a reload", "First launch writes nothing".
- ⚠️ FR12 — `LocationsLoadError` + reset work for the listed documents (persistence outline, `locations_storage_ui_unit.feature`), but a document whose `countryCode` is not a region code crashes the render instead of showing the reset (R1).
- ✅ FR13 — `hasSaveFailed` + `AppShell.tsx:51`; "Private mode", "Saving the list fails later".
- ✅ FR14 — channel/`storage` subscription in `localStorageLocationRepository.ts`, applied in `LocationsProvider.tsx:111`; persistence and E2E two-tab scenarios.
- ✅ FR15 — `useCitySearch.ts` status/retry, `fetchCitySearch.ts`; E2E "Data is loading", "Data failed to load", "Retry".
- ✅ FR16 — Workbox precache of the JSON asset; E2E "Offline reopen", "Offline search".
- ✅ FR17 — one `LocationSearch` in `CardsView.tsx`; `main_page_states_unit.feature:32`, view-contract "Add the first location with the keyboard".
- ✅ FR18 — keys in both locale files (identical key-set test); "Russian interface".
- ✅ NFR-P1 — synchronous search; `location_search_performance.feature` (10 queries ≤ 50 ms).
- ✅ NFR-P2 — data fetched as an asset only while the search is open; `check-bundle-size.mjs`; E2E "Data loads only when the search opens".
- ✅ NFR-A1 — axe-core outline, 9 states × 2 themes in `locations_view_contract_e2e.feature:54`.
- ⚠️ NFR-A2 — combobox keys and focus return work and are covered by the view-contract keyboard scenarios, but arrow keys move the active option out of view in a long list (R2).
- ✅ NFR-A3 — `LocationRow.tsx:31` accessible name, `LocationList.tsx` focus, polite regions; view-contract focus scenarios and E2E announcement scenarios.
- ✅ NFR-R1 — `dialog.tsx:26-27` full screen / centered; E2E width outlines, "Phone layout", "Wide layout".
- ✅ NFR-R2 — screenshot outline with committed baselines.
- ✅ UX1 — `LocationSearchStates.tsx` always renders one state; ranking and E2E state scenarios tagged `@UX1`.
- ✅ UX2 — query in view state, results computed per render; "Results follow typing".
- ✅ UX3 — `matchedAbbreviation` rendered in `LocationSearchResults.tsx`; "Abbreviation before city prefix", E2E result content.
- ✅ UX4 — append in `locations.ts`, order kept on reload; "Order is kept", "List survives a reload".
- ✅ UX5 — token-only classes, `tokens.test.ts`, theme-token assertion in the accessibility outline.
- ✅ M1 — the task 10.1 grep over `test/features` finds every FR/NFR/UX id tagged `@add-locations-via-search` (re-run: `missing=0`).
- ⚠️ M2 — model, repository, ranking and presenter files measured 93.75–100%, but the abbreviation table that drives matching scores 75.73% (R3).
- ✅ M3 — 18 examples of the accessibility outline, run per registered view by the `view-contract-<id>` projects.
- ✅ M4 — `location_search_by_abbreviation.feature` (IST order, EST first), `location_search_by_name.feature` (Moscow, Москва first), `location_search_by_country.feature` (KZ only, Almaty present).
- ✅ M5 — "Legacy identifier is canonicalized on load" (persistence) and "Raw offset is rejected" (management).
- ✅ M6 — `location_search_performance.feature` with 10 sample queries.
- ✅ M7 — `check-bundle-size.mjs` (150 KB initial, JSON present, ≤ 30 KB, not in `index.html`) and the E2E request-count scenario.
- ✅ Scenario: Diacritics are ignored — `location_search_by_name.feature:5`.
- ✅ Scenario: Other language than the interface — `location_search_by_name.feature:10`.
- ✅ Scenario: Case and spaces — `location_search_by_name.feature:16`.
- ✅ Scenario: Full city name — `location_search_by_name.feature`, `@FR2`.
- ✅ Scenario: Later word of the name — `location_search_by_name.feature:26`.
- ✅ Scenario: Prefix of the name — `location_search_by_name.feature:31`.
- ✅ Scenario: Country with several zones — `location_search_by_country.feature:5`.
- ✅ Scenario: Country name in Russian — `location_search_by_country.feature:11`.
- ✅ Scenario: Ambiguous abbreviation — `location_search_by_abbreviation.feature:5`.
- ✅ Scenario: Single-zone abbreviation — `location_search_by_abbreviation.feature:11`.
- ✅ Scenario: Partial abbreviation does not match by abbreviation — `location_search_by_abbreviation.feature:17`.
- ✅ Scenario: Abbreviation before city prefix — `location_search_ranking.feature:5`.
- ✅ Scenario: City before country — `location_search_ranking.feature:10`.
- ✅ Scenario: One entry per zone — `location_search_ranking.feature:16`.
- ✅ Scenario: Result limit — `location_search_ranking.feature:21`.
- ✅ Scenario: Search opened — `location_search_ranking.feature:26` and `locations_ui_unit.feature:20`.
- ✅ Scenario: Query cleared — `location_search_ranking.feature:31` and `locations_ui_unit.feature:46`.
- ✅ Scenario: Nothing found — `location_search_ranking.feature:37` and `locations_ui_unit.feature:53`.
- ✅ Scenario: Offsets are not a search input — `location_search_ranking.feature:42`.
- ✅ Scenario: Add from results — `locations_ui_unit.feature:26`.
- ✅ Scenario: Already added — `locations_ui_unit.feature:33`.
- ✅ Scenario: Results follow typing — `locations_ui_unit.feature:40`.
- ✅ Scenario: Data is loading — `locations_ui_e2e.feature:8`.
- ✅ Scenario: Data failed to load — `locations_ui_e2e.feature:15`.
- ✅ Scenario: Retry — `locations_ui_e2e.feature:22`.
- ✅ Scenario: Offline search — `locations_ui_e2e.feature:158`.
- ✅ Scenario: Query timing — `location_search_performance.feature:5`.
- ✅ Scenario: Data loads only when the search opens — `locations_ui_e2e.feature:33`.
- ✅ Scenario: Bundle budget — `scripts/check-bundle-size.mjs` (initial JS, JSON asset presence, 30 KB, no preload).
- ✅ Scenario: Add with the keyboard — `locations_view_contract_e2e.feature:16`.
- ✅ Scenario: Add the first location with the keyboard — `locations_view_contract_e2e.feature:23`.
- ✅ Scenario: Close with Esc — `locations_view_contract_e2e.feature:30`.
- ✅ Scenario: Accessibility check (location-search) — search loading, error, suggestions, results and no-matches rows of the outline at `locations_view_contract_e2e.feature:55`.
- ✅ Scenario: Phone layout — `locations_ui_e2e.feature:96`.
- ✅ Scenario: Wide layout — `locations_ui_e2e.feature:103`.
- ✅ Scenario: Screenshots (location-search) — suggestions and IST results rows of the outline at `locations_ui_e2e.feature:110`.
- ✅ Scenario: Legacy identifier is canonicalized on input — `locations_management.feature:6`.
- ✅ Scenario: Duplicate by canonical identifier — `locations_management.feature:11`.
- ✅ Scenario: Raw offset is rejected — `locations_management.feature:18`.
- ✅ Scenario: Unknown zone is rejected — `locations_management.feature:24`.
- ✅ Scenario: First location — `locations_management.feature:30`.
- ✅ Scenario: Order is kept — `locations_management.feature:36`.
- ✅ Scenario: Remove from the middle — `locations_management.feature:43`.
- ✅ Scenario: Remove the last location — `locations_management.feature:49`.
- ✅ Scenario: Location already gone — `locations_management.feature:55`.
- ✅ Scenario: Rows show city and country — `locations_ui_unit.feature:6`.
- ✅ Scenario: Empty state after the last removal — `locations_ui_unit.feature:13`.
- ✅ Scenario: Remove action names the city — `locations_ui_e2e.feature:40`.
- ✅ Scenario: Focus after removal — `locations_view_contract_e2e.feature:43`.
- ✅ Scenario: Focus after the last removal — `locations_view_contract_e2e.feature:49`.
- ✅ Scenario: List survives a reload — `locations_persistence.feature:6`.
- ✅ Scenario: First launch writes nothing — `locations_persistence.feature:12`.
- ✅ Scenario: Legacy identifier is canonicalized on load — `locations_persistence.feature:17`.
- ✅ Scenario: Offline reopen — `locations_ui_e2e.feature:151`.
- ✅ Scenario: Corrupted document — `locations_storage_ui_unit.feature:6` and the persistence outline.
- ✅ Scenario: Newer version — "written by a newer version" example of `locations_persistence.feature:23`.
- ✅ Scenario: Invalid zone in the document — "holding a location in "+05:00"" example of the same outline.
- ✅ Scenario: Reset — `locations_storage_ui_unit.feature:12` and `locations_persistence.feature:35`.
- ✅ Scenario: Private mode — `locations_storage_ui_unit.feature:20`.
- ✅ Scenario: Saving the list fails later — `locations_storage_ui_unit.feature:28`.
- ✅ Scenario: Added in another tab — `locations_persistence.feature:43` and `locations_ui_e2e.feature:137`.
- ✅ Scenario: Removed in another tab — `locations_persistence.feature:49` and `locations_ui_e2e.feature:144`.
- ✅ Scenario: Russian interface — `locations_storage_ui_unit.feature:37`.
- ✅ Scenario: Accessibility check (locations) — list, empty, unreadable and storage-unavailable rows of the outline at `locations_view_contract_e2e.feature:55`.
- ✅ Scenario: Narrow and wide screens — outlines at `locations_ui_e2e.feature:62` and `:74`.
- ✅ Scenario: Screenshots (locations) — list and empty rows of the outline at `locations_ui_e2e.feature:110`.
- ✅ Scenario: First launch — `main_page_states_unit.feature` "First launch" expects the "Add location" action.
- ✅ Scenario: Add location from the empty state — `main_page_states_unit.feature:33`.

## Mutation

Measured in this review with `npx stryker run --mutate '<files>'` from `packages/client/`, at most five files per run, one run at a time. Scores (killed + timeout over all valid mutants):

| File | Score | Survivors |
|---|---|---|
| `src/model/locations.ts` | 100.00% | — |
| `src/model/store.ts` | 100.00% | — |
| `src/model/parseStoredLocations.ts` | 97.92% | 1 |
| `src/model/timeZoneId.ts` | 94.12% | 1 (empty `catch` block — equivalent, the unassigned id falls through to `undefined`) |
| `src/adapters/locationsDocument.ts` | 96.77% | 1 (missing-migration guard — equivalent, calling `undefined` throws and is caught) |
| `src/adapters/inMemoryLocationRepository.ts` | 100.00% | — |
| `src/adapters/localStorageLocationRepository.ts` | 95.16% | 3 (default `BroadcastChannel` factory and message literal) |
| `src/adapters/city-search/fetchCitySearch.ts` | 100.00% | — |
| `src/adapters/city-search/normalizeSearchText.ts` | 93.75% | 1 (separator regex without `+` — equivalent after empty words are dropped) |
| `src/adapters/city-search/abbreviationSource.ts` | 100.00% | — |
| `src/adapters/city-search/zoneCitiesSource.ts` | 98.90% | 1 |
| `src/adapters/city-search/createCompositeCitySearch.ts` | 97.50% | 1 no coverage |
| `src/adapters/city-search/timeZoneAbbreviations.ts` | 75.73% | 25 on lines 10–20 (GMT through PT rows) — R3 |
| `src/presenter/countryName.ts` | 100.00% | — |
| `src/presenter/presentLocationRows.ts` | 100.00% | — |
| `src/presenter/presentSearchResults.ts` | 100.00% | — |
| `src/controller/LocationsProvider.tsx` | 100.00% | — |
| `src/controller/useLocations.ts` | 100.00% | — |
| `src/controller/useCitySearch.ts` | 97.30% | 1 (`attempt - 1` still changes the dependency) |
| `src/controller/writeScheduler.ts` | 100.00% | — |
| `src/app/AppShell.tsx` | 100.00% | — |
| `src/app/ViewHost.tsx` | 100.00% | — |
| `src/views/cards/CardsView.tsx` | 100.00% | — |
| `src/views/shared/LocationList.tsx` | 100.00% | — |
| `src/views/shared/LocationSearch.tsx` | 100.00% | — |
| `src/views/shared/LocationSearchDialog.tsx` | 100.00% | — |
| `src/views/shared/LocationSearchResults.tsx` | 100.00% | — |
| `src/views/shared/LocationSearchStates.tsx` | 100.00% | — |
| `src/views/shared/LocationRow.tsx` | 100.00% | — |
| `src/views/shared/AddLocationButton.tsx` | 100.00% | — |
| `src/views/shared/LocationsLoadError.tsx` | 100.00% | — |
| `src/components/ui/dialog.tsx` | 100.00% | — |

Not measured: `src/adapters/loadCitySearch.ts` (one-line wiring; Stryker reported no mutants for it) and type-only files (`ports/*.ts`, `controller/locationsContext.ts`, `adapters/city-search/citySource.ts`). Build scripts under `scripts/` are outside Stryker's `mutate` globs.

## Findings

### R1 — CRITICAL — A stored country code that is not a region code crashes the app instead of offering reset
- Location: `packages/client/src/model/parseStoredLocations.ts:30`
- Rule: `.claude/rules/architecture.md` ("Invalid stored data leads to a recoverable error state, never a crash"); FR12; ADR-0004 ("Validation checks the whole payload")
- Problem: `parseStoredLocations` only checks that `countryCode` is a string (`typeof entry.countryCode !== "string"`), so any string is accepted and the document loads as `LOADED`. The code then reaches `presentCountryName` (`packages/client/src/presenter/countryName.ts:26`), which calls `Intl.DisplayNames.prototype.of(countryCode)`. That call throws `RangeError: invalid_argument` for any value that is not a well-formed region subtag (checked in Node: `"K"`, `"Kazakhstan"`, `"<b>"` throw; `"KZ"` works). `useLocations()` runs `presentLocationRows` during render (`packages/client/src/controller/useLocations.ts:28`), and `AppShellContent` calls `useLocations()` itself (`packages/client/src/app/AppShell.tsx:31`), above the view's error boundary.
- Impact: With a stored document such as `{"schemaVersion":1,"payload":{"locations":[{"timeZoneId":"Asia/Almaty","label":"Almaty","countryCode":"Kazakhstan"}]}}` (hand-edited, corrupted, or written by a foreign tool), the render throws and `AppErrorBoundary` replaces the whole page with the recovery screen. Its only action is "Reload", which loads the same document and crashes again. The Cards view never shows the FR12 error with Reset, so the user is locked out until they clear site data by hand. FR12 says a document that "does not match the expected document" must show the error with a reset action.
- Fix: In `parseStoredLocations`, reject the document (return `REJECTED`) when `countryCode` is neither `""` nor two upper-case ASCII letters. Use a named constant such as `COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/` in that file. This is the format `Location.countryCode` documents ("ISO 3166-1 alpha-2 code; empty for zones without a country") and the only format `extractZoneData` produces. Add `it.each` cases to `src/model/parseStoredLocations.test.ts` (`"Kazakhstan"`, `"K"`, `"kz"` rejected; `""` and `"KZ"` accepted). Add an Example row "holding a location with the country code "Kazakhstan"" to the `Unreadable stored list` outline in `test/features/locations/locations_persistence.feature` (`@FR12`), with the matching entry in the `UNREADABLE_DOCUMENTS` map of `steps/locations_persistence.steps.ts`.
- Fix risk: Low. Every document this app writes carries `""` or a two-letter upper-case code taken from the extracted records, so no valid list becomes unreadable. The model stays pure (a regex, no `Intl` call). The new outline row fails until its document text is added to `UNREADABLE_DOCUMENTS`, because the step looks the text up there.
- Status: open

### R2 — WARNING — Arrow keys move the active search option out of view
- Location: `packages/client/src/views/shared/LocationSearchDialog.tsx:56`
- Rule: NFR-A2 ("move through results with arrow keys"); `.claude/rules/ui-states.md` ("Keyboard navigation … must work")
- Problem: `handleKeyDown` only updates `activeIndex` (`:59`, `:62`), and the listbox is referenced through `aria-activedescendant`. Focus stays in the input, so the browser never scrolls the active option into view. No code calls `scrollIntoView` (a grep of `src/` finds none). The results scroll inside `DialogContent` (`packages/client/src/components/ui/dialog.tsx:26`, `overflow-y-auto`; `sm:max-h-[85vh]` from 640 px). Up to 50 results of at least 44 px each (`min-h-11`) are far taller than the viewport, and the 12 suggestions already overflow a 375 × 667 phone screen.
- Impact: A keyboard user who types "a" and presses ArrowDown about ten times highlights an option that is below the fold. Pressing Enter then adds a location they cannot see. This breaks WCAG 2.4.7 (focus visible) for the keyboard flow that NFR-A2 requires. The view-contract keyboard scenarios only press ArrowDown once, so they do not catch it.
- Fix: In `LocationSearchDialog`, add a `useEffect` keyed on `activeOptionIndex` that calls `document.getElementById(\`${optionIdPrefix}${activeOptionIndex}\`)?.scrollIntoView?.({ block: "nearest" })`, and put `"nearest"` in a named constant. Add a view-contract scenario tagged `@add-locations-via-search @view-contract @NFR-A2` to `locations_view_contract_e2e.feature`: search for "a", press ArrowDown until at least the 15th option is active, then expect the selected option (`getByRole("option", { selected: true })`) to be in the viewport. D12 and `bdd-unit.md` put focus and layout checks in E2E, not jsdom.
- Fix risk: jsdom does not implement `Element.prototype.scrollIntoView`, so an unguarded call throws in the existing jsdom tests (`LocationSearchDialog.keyboard.test.tsx`, `locations_ui_unit.steps.tsx`). The optional call `?.()` avoids that. Because jsdom cannot observe the scroll, the `?.` guard may leave a mutation survivor. With `block: "nearest"` the effect does not scroll while the first option is already visible, so the committed NFR-R2 screenshot baselines (no arrow navigation) should not change.
- Status: open

### R3 — WARNING — Abbreviation table scores 75.73% under mutation; most rows can be broken unnoticed
- Location: `packages/client/src/adapters/city-search/timeZoneAbbreviations.ts:10`
- Rule: `.claude/rules/tdd-workflow.md` ("Minimum acceptable: >=90%"); M2 of the proposal
- Problem: Stryker (`--mutate 'src/adapters/city-search/timeZoneAbbreviations.ts'`) leaves 25 mutants alive on lines 10–20. Emptying the zone list or a zone ID of `GMT`, `EDT`, `ET`, `CST`, `CDT`, `MST`, `MDT`, `PST`, `PDT` or `PT` fails no test. The tests cover only a few rows: `IST`, `EST` and `CST` against fixtures in `abbreviationSource.test.ts`, and `IST` and `EST` over the real data in `location_search_by_abbreviation.feature`. The table was also not part of the task 4.8 mutation run. `createAbbreviationSource` also silently drops a mapped zone that has no record (`abbreviationSource.test.ts`, "should skip mapped zones that have no record"), so a mistyped or non-canonical zone ID in the table goes unnoticed as well.
- Impact: A regression such as `PST: []`, or `CDT: ["America/Chicago"]` losing Havana, makes `PST` or `CDT` return no abbreviation result (FR4, UX3), and CI stays green. The D7 table is the app's own mapping, which ADR-0003 says "has to be maintained", so this is where edits will happen.
- Fix: Add an `it.each` over every row of the D7 table to `src/adapters/city-search/abbreviationSource.test.ts`. Build the source from `virtual:zone-cities` with the default browser zone list, as `createCompositeCitySearch` does. Assert that `match(abbreviation)` returns exactly that row's zone IDs in table order, each with `matchedAbbreviation` equal to the abbreviation. Then re-run `npx stryker run --mutate 'src/adapters/city-search/timeZoneAbbreviations.ts'` to at least 90%.
- Fix risk: Low. The test file grows by about 45 table rows (still under 200 lines). Using the real extracted data makes the test depend on CLDR and on Node's `Intl.supportedValuesOf`. That is intended: a table zone missing from the data should fail loudly. Keep the fixture-based cases so the file still unit-tests matching without depending on the data.
- Status: open

### R4 — SUGGESTION — `data-view-id` is traced to FR12, which it does not implement
- Location: `packages/client/src/app/ViewHost.tsx:25`
- Rule: `.claude/rules/traceability.md`; `.claude/rules/antipatterns.md` ("Vague traceability … If the reference is not explicit, it does not exist")
- Problem: The JSDoc says the view host "exposes the active view id for add-locations-via-search (D12, FR12)". FR12 is the unreadable-stored-list requirement. The attribute exists so that `showContractView()` in `view_contract/steps/view_contract_e2e.fixtures.ts` can check which view is under contract. That serves the view-contract scenarios (NFR-A1, NFR-A2, NFR-A3, and FR8/FR10 as run per view).
- Impact: A traceability grep for FR12 lists `ViewHost.tsx` as implementing the unreadable-list behaviour. The requirements the attribute actually serves have no link from this file, so a later change to the view contract will not find it.
- Fix: Replace `(D12, FR12)` with `(D12; view contract for FR8, FR10, NFR-A1, NFR-A2, NFR-A3)`.
- Fix risk: none — a comment-only change.
- Status: open

## Verdict

Not ready — blocked by R1 (CRITICAL). R2 and R3 (WARNING) should be fixed in the same round; R4 is optional.
