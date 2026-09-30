# Design: Add locations via search

## Context

Driven by FR1–FR18, NFR-P1–NFR-R2 and UX1–UX5 of proposal.md. Current state of `packages/client/src/` (checked):

- `model/index.ts` and `presenter/index.ts` export nothing; there is no domain state, store or command yet.
- `ports/` declares only `StorageAvailability`; `adapters/` holds its localStorage and in-memory adapters and the shared `storageAvailability.contract.ts`.
- `controller/` holds `useContainerWidth`, `useDocumentLanguage`, `useOnlineStatus`, `usePwaUpdateStatus`, `useStorageAvailability`; `useStorageAvailability` defaults its port to `localStorageAvailability`, the pattern reused here.
- `views/cards/CardsView.tsx` renders only `views.cardsEmptyState`; `views/shared/` and `components/ui/` do not exist; the only Radix package is `@radix-ui/react-slot`.
- `constants/storage.ts` holds only `STORAGE_AVAILABILITY_PROBE_KEY`; `constants/keyboard.ts` has `KeyboardKey.ESCAPE` only. The language key `LANGUAGE_STORAGE_KEY` lives in `i18n.ts`, which already writes it on first launch; this change adds no write on first launch (FR11).
- `tsconfig.app.json` sets `lib: ["ES2020", "DOM", "DOM.Iterable"]`, which does not declare `Intl.supportedValuesOf` (ES2022.Intl). `tsconfig.test.json` extends it.
- `scripts/check-bundle-size.mjs` counts as initial JS the entry script and the `modulepreload` links of `dist/index.html`, enforces 150 KB gzipped for them and a separate `CardsView-` chunk. The Workbox `globPatterns` in `vite.config.ts` (`**/*.{js,mjs,css,html,ico,png,svg,json,woff2}`) precache every `js` asset, so the service worker downloads a lazy chunk while it installs on the first visit, before the page imports it; the chunk is then available offline (FR16). "Lazy" in NFR-P2 is therefore a property of the page — the chunk is not in the initial JS and the page does not request it before the search opens — not of the network as a whole.
- CI (`.github/workflows/ci.yml`) runs `pnpm test`, then `pnpm build`, then `git diff --exit-code`, so the build must not rewrite tracked files.
- `vitest.config.ts` is separate from `vite.config.ts` and registers only `react()`; `stryker.config.mjs` runs Vitest with `vitest.config.ts`. `tsconfig.node.json` type-checks `vite.config.ts` and the `scripts` folder. The root `.gitignore` ignores `**/*.d.ts` except `**/vite-env.d.ts`.
- `styles/tokens.css` and `tailwind.config.ts` define only `background`, `foreground`, `muted-foreground`, `accent` (+ foreground), `notice` (+ foreground) and the four `day-*` colours: nothing for a raised surface, a border, a modal backdrop or an error. `test/features/main_page/steps/themeTokens.ts` reads 6-digit hex tokens from `tokens.css` for the E2E theme checks.
- `app/ViewHost.tsx` resolves the active view from `viewRegistry` (only `cards` today) and renders it without exposing which view is active. `playwright.bdd.config.ts` generates tests into the gitignored `.features-gen/` and sets no screenshot options.

Global decisions this change follows, all Accepted: ADR-0002 (commands with a `type` enum, pure reducer returning typed errors, framework-agnostic store read with `useSyncExternalStore`, views only emit events), ADR-0003 (IANA IDs canonicalized on input and on load, duplicates compared on canonical IDs, abbreviations from our own mapping returning every match), ADR-0004 (repository ports with storage and in-memory adapters and one contract suite, `{ schemaVersion, payload }` envelope, validation on load with an error state and reset, degraded in-memory mode, `BroadcastChannel` sync with the `storage` event as fallback, last write wins, `navigator.storage.persist()`, debounced writes), ADR-0005 (views compose `views/shared/`; the view-contract BDD E2E scenarios are parameterized by the registry and run for every registered view), ADR-0006 (`CitySearch` port, composite adapter over `ZoneCitiesSource` and `AbbreviationSource`, `CityRecord` format, CLDR exemplar cities "extracted at build time into a small JSON file", "CLDR extraction adds a build step", country names from `Intl.DisplayNames`), ADR-0007 (nothing stored on first launch; home and Here entry untouched). No new ADR is needed: every decision below is local to this change.

## Goals / Non-Goals

**Goals:** a pure, mutation-tested locations model and search ranking; persistence and search behind ports with contract tests; a search overlay reusable by every view.

**Non-Goals:** home, device zone and reference moment state (NG1, NG2); a generic persistence framework for preferences — only the locations document is built, in a shape the preferences repository can copy later.

## Decisions

### D1. Locations state, commands and typed errors (FR8–FR10)
`model/` gets `LocationsState { locations: readonly Location[] }` and `Location { id, timeZoneId, label, countryCode }`. Commands (enum `LocationCommandType`): `ADD_LOCATION { timeZoneId, label, countryCode }`, `REMOVE_LOCATION { id }`, `REPLACE_LOCATIONS { locations }`. `reduceLocations(state, command)` returns `{ ok: true, state } | { ok: false, error: LocationErrorCode }` with `DUPLICATE_LOCATION`, `UNKNOWN_TIME_ZONE`, `LOCATION_NOT_FOUND` (names from ADR-0002 and `docs/architecture/domain-model.md`). A failed command returns the same state object.

`REPLACE_LOCATIONS` is new: it applies an already validated list (initial load, another tab). ADR-0002 allows state changes only through commands, so loading needs one; task 2.6 adds its row to the command table of `docs/architecture/domain-model.md`.

`id` is derived: `` `${canonicalTimeZoneId}|${label}` ``. The pair is unique by invariant 2, so the id is unique, identical in every tab (cross-tab `REMOVE_LOCATION` targets the same row), and the reducer stays pure without a random source. The id is not stored; it is rebuilt on load.
*Alternative:* random UUID from the controller — rejected: needs `crypto` outside the model and a stored id field that can drift from the pair it stands for.

### D2. Canonical identifiers (FR9)
`model/timeZoneId.ts` exports `canonicalizeTimeZoneId(input): string | undefined`:
1. reject an input that starts with `+`, `-` or `−` (a UTC offset such as `+05:00`), because Temporal accepts offset strings as time zones;
2. `new Temporal.ZonedDateTime(0n, input).timeZoneId` validates the IANA name and normalizes its case (a `RangeError` means unknown → `undefined`);
3. map a legacy alias to its IANA canonical ID with the alias map `virtual:time-zone-aliases` (`{ "Asia/Calcutta": "Asia/Kolkata", "Europe/Kiev": "Europe/Kyiv", ... }`), extracted at build time by D6. The model imports only this data module — no adapter, React or DOM.

Temporal is imported from `@/lib/temporal` (`.claude/rules/temporal.md`). `Intl.DateTimeFormat().resolvedOptions().timeZone` is not used: engines return CLDR legacy names (`Asia/Calcutta`), not IANA canonical ones.

### D3. Store and provider (ADR-0002)
`model/store.ts`: `createStore(reducer, initialState)` → `{ getSnapshot, subscribe, dispatch }`; `dispatch` returns the reducer result and notifies only when the state object changed. `controller/LocationsProvider.tsx` (props `repository = localStorageLocationRepository`, `writeScheduler` = the `setTimeout` scheduler of D5) creates one store and the persistence effects (D5) and exposes them through context; `useLocations()` reads it with `useSyncExternalStore` and returns — this is its one definition, used by D5, D9, D10 and the tasks —

```
{ rows, locations, loadStatus, hasSaveFailed, addLocation, removeLocation, resetLocations }
```

`rows` is presenter output (D9) for views; `locations` is the model list, used only by the search container to compute `isAdded` (D10); `hasSaveFailed` is D5's flag. `useLocations` outside the provider throws a descriptive error.

`AppShell` today calls `useStorageAvailability()` in its own body and renders `<StorageWarning />` when it returns `false`. Because the warning must also react to a failed save (D5), `AppShell` becomes `<LocationsProvider><AppShellContent /></LocationsProvider>`, where `AppShellContent` (same file) is the current body plus `const { hasSaveFailed } = useLocations()` and the condition `(!isStorageAvailable || hasSaveFailed) && <StorageWarning />`. `MainPage` and the view host are inside the provider as well.

### D4. Location repository port and adapters (FR11–FR14)
`ports/locationRepository.ts`:

```
LocationRepository
  load(): LocationsLoadResult        { status: LOADED, locations } | { status: EMPTY } | { status: UNREADABLE }
  save(locations): SaveOutcome       SAVED | FAILED (never throws)
  clear(): SaveOutcome
  subscribe(onExternalChange: (result: LocationsLoadResult) => void): () => void
```

The port is synchronous because `localStorage` is: the list is known at the first render, so the list itself has no loading state (`.claude/rules/ui-states.md`, "Instant feedback").

Adapters in `adapters/`: `createLocalStorageLocationRepository({ getStorage, createChannel })` and `createInMemoryLocationRepository({ initialDocument?, isWritable = true })` — with `isWritable: false` its `save` and `clear` return `FAILED`, the same configured-answer idea as the existing `inMemoryStorageAvailability(isAvailable)`. One contract suite, `locationRepository.contract.ts`, runs against both.

`getStorage: () => Storage` is called inside a `try` on every `load`, `save`, `clear` and when `subscribe` attaches its `storage` listener, never at module evaluation: as `adapters/localStorageAvailability.ts` notes, reading `globalThis.localStorage` "itself may throw" (a `SecurityError` when storage is blocked). The exported `localStorageLocationRepository` is built with `getStorage: () => globalThis.localStorage`. When `getStorage` or a storage method throws, `load` returns `EMPTY` (nothing can be read, so the degraded in-memory mode starts with an empty list, FR13), `save` and `clear` return `FAILED` (so the warning of D5 shows), and `subscribe` still returns a working unsubscribe. The repository never throws, so the provider's state initializer cannot crash the app (FR12).

Document under `STORAGE_KEYS.LOCATIONS = "time-zones:locations"` — a new `STORAGE_KEYS` object in `constants/storage.ts`, because ADR-0004 says "Keys come from `STORAGE_KEYS` constants"; the existing `STORAGE_AVAILABILITY_PROBE_KEY` stays as it is:

```json
{ "schemaVersion": 1, "payload": { "locations": [ { "timeZoneId": "Asia/Almaty", "label": "Almaty", "countryCode": "KZ" } ] } }
```

Load pipeline (ADR-0004): no value → `EMPTY`; not JSON, wrong shape, or `schemaVersion` greater than `LOCATIONS_SCHEMA_VERSION` → `UNREADABLE`; lower version → ordered migrations `vN → vN+1` (the list is empty for version 1, the step exists so version 2 only appends); then `model/parseStoredLocations(payload)` canonicalizes every ID (D2), rejects the document when any ID is invalid, and drops a later entry that became a duplicate only through canonicalization (`Europe/Kiev` and `Europe/Kyiv` with the same label).

Cross-tab: after a successful `save` or `clear` the adapter posts a message on a `BroadcastChannel` named `LOCATIONS_SYNC_CHANNEL_NAME`; other instances call their subscribers with a fresh `load()`. When `BroadcastChannel` is undefined, the adapter listens to `storage` events for its key instead. `createChannel` is injectable so the contract suite pairs two adapters over an in-memory channel.

After the first successful `save`, the localStorage adapter calls `navigator.storage?.persist?.()` once and ignores its outcome (ADR-0004, eviction protection).

### D5. Writes, load status and degraded mode (FR11–FR14)
`LocationsProvider` loads synchronously in its state initializer: `LOADED` → `REPLACE_LOCATIONS`; `EMPTY` → empty list; `UNREADABLE` → `loadStatus = LocationsLoadStatus.UNREADABLE`. While unreadable, nothing is written; `resetLocations()` calls `clear()` and switches to `READY` with an empty list.

Only `addLocation` and `removeLocation` schedule a write, so first launch writes nothing and a `REPLACE_LOCATIONS` from another tab never echoes back. Writes are debounced by `LOCATIONS_WRITE_DEBOUNCE_MS = 300` through an injectable `WriteScheduler { schedule(callback, delayMs): cancel }` (default `setTimeout`); tests inject an immediate scheduler instead of fake timers (`.claude/rules/tdd-workflow.md`). A pending write is flushed on `pagehide`. `FAILED` keeps the list in memory and sets `hasSaveFailed = true`; `AppShellContent` then shows the existing `StorageWarning` (D3). The flag is reset to `false` by the next `SAVED` (for example after the user freed space). The existing `useStorageAvailability` probe is not enough on its own: it runs once on mount and writes a one-character value (`PROBE_VALUE = "1"` in `adapters/localStorageAvailability.ts`), so a quota that fills later, or a document too large while the probe fits, would return `FAILED` with no warning. A `clear()` that returns `FAILED` during reset sets the flag too and still switches to `READY` with an empty list.

### D6. Build-time extraction of zone data (ADR-0006)
ADR-0006 (Accepted) says the exemplar cities are "extracted at build time into a small JSON file" and that "CLDR extraction adds a build step". The extraction therefore runs inside every build, as a Vite plugin, and its output is never committed.

Inputs, two dev dependencies of the same CLDR release (48): `cldr-bcp47` (`bcp47/timezone.json`) and `cldr-dates-full` (`main/{en,ru}/timeZoneNames.json`). `cldr-dates-modern` is not used: its last release is 45.

Rules, in the pure function `scripts/zoneData/extractZoneData.ts` (`extractZoneData({ bcp47TimeZones, englishZoneNames, russianZoneNames }) → { zoneCities, timeZoneAliases }`):
- every key of `keyword.u.tz` that has an `_alias` is a zone; keys without `_alias` (the `_deprecated` ones, which only carry `_preferred`) are skipped;
- canonical IANA ID = the `_iana` field when present, otherwise the first `_alias` entry; every other `_alias` entry is a legacy alias mapped to it (`Asia/Calcutta` → `Asia/Kolkata`, `Europe/Kiev` and `Europe/Zaporozhye` → `Europe/Kyiv`, `EST5EDT` → `America/New_York`);
- the key `utc` is special-cased: its canonical ID is `UTC`, and all its aliases (`Etc/UTC`, `Etc/UCT`, `Etc/Zulu`, ...) map to `UTC`;
- names: CLDR keys `timeZoneNames.zone` by the CLDR ID, which is the first `_alias` entry (`Asia/Calcutta`, not `Asia/Kolkata`), so the exemplar city is read at that path. English omits exemplar cities that equal the last ID segment (`Asia/Almaty`, `Asia/Kolkata` have none), so a zone without an English exemplar city uses the last segment of its canonical ID with `_` replaced by a space; a zone without a Russian one uses the English name;
- country code, for a canonical ID that has an area and is not `Etc/`: the first two letters of the key, upper-cased (`kzala` → KZ, `ruchita` → RU), kept only when `new Intl.DisplayNames("en", { type: "region", fallback: "none" })` knows it; otherwise empty. Five keys break this rule in CLDR 48 (checked against their `_description`), so a `COUNTRY_CODE_OVERRIDES` table in the same file wins over it: `jeruslm` → IL (not JE), `gazastrp` → PS (not GA), `hebron` → PS, `gpmsb` → MF (Marigot, not GP), `gpsbh` → BL (Saint Barthélemy, not GP);
- `zoneCities` = `[{ timeZoneId, names: { en, ru }, countryCode }]`, `Etc/*` excluded, plus `UTC` with names `UTC` and no country.

`scripts/zoneData/zoneDataPlugin.ts` exports `zoneDataPlugin()`: it reads the three CLDR files from `node_modules` once per process, calls `extractZoneData`, and serves the result as two virtual JSON modules, `virtual:zone-cities` and `virtual:time-zone-aliases` (`resolveId` / `load`). Both `vite.config.ts` and `vitest.config.ts` register it, so `pnpm build`, every Vitest run and Stryker's Vitest runner use the same extracted data. The data lands in the bundle: the zone cities in the lazy `city-search` chunk (D8), the alias map with the model. Nothing is written into `src/`, so CI's `git diff --exit-code` after the build holds. The module types are declared in `src/vite-env.d.ts`, the one `.d.ts` file the `.gitignore` keeps tracked.

ADR-0006 asks to verify exemplar-city coverage in the first implementing step: task 1.3's data test imports `virtual:zone-cities` and fails on any record with an empty name.
*Alternative:* a hand-run script writing committed JSON — rejected: ADR-0006 makes the extraction a build step, and committed output drifts from the CLDR version in `package.json`. *Alternative:* `Intl.Locale.prototype.getTimeZones()` for countries at runtime — rejected: not available in every target browser.

### D7. City search port, sources and ranking (FR1–FR7, NFR-P1)
`ports/citySearch.ts`:

```
CitySearch
  search(query, language): readonly CitySearchResult[]   { record: CityRecord, matchKind: SearchMatchKind, matchedAbbreviation? }
  suggest(): readonly CitySearchResult[]
LoadCitySearch = () => Promise<CitySearch>
```

`CityRecord` follows ADR-0006 (`id` = canonical `timeZoneId`, `names { en, ru }`, `countryCode`, `aliases`, `rank`). Searching is synchronous once loaded, so results follow typing in the same frame (UX2) and its time is measurable (NFR-P1).

`adapters/city-search/` (own `index.ts`):
- `ZoneCitiesSource`: one record per zone of `Intl.supportedValuesOf("timeZone")`, canonicalized with D2 and de-duplicated, joined with the extracted `virtual:zone-cities` data (D6); a zone missing from it gets its name from the ID and no country; `UTC` is always present; when `Intl.supportedValuesOf` is missing, every extracted zone is used.
- `AbbreviationSource`: the table below; it returns the zone records it maps to, in table order, with `matchedAbbreviation`.
- `createCompositeCitySearch()`: merges sources and removes duplicates by canonical `timeZoneId` and name (ADR-0006) — both sources return the same record per zone in this change, so each zone appears once, at its best match kind; then ranks and caps at `MAX_SEARCH_RESULTS = 50`.

Matching: `normalizeSearchText` lower-cases, applies NFD and removes combining marks (`\p{M}`, which also turns `ё` into `е`), and trims. Words split on whitespace, `-`, `'`, `’`, `.`, `/`, `(`, `)`. Kinds (enum `SearchMatchKind`, best first): `ABBREVIATION` (whole query equals an abbreviation), `CITY_PREFIX` (whole city name starts with the query), `CITY_WORD_PREFIX`, `COUNTRY` (country name in `en` or `ru` from `Intl.DisplayNames`, or a word of it, starts with the query). Names are matched in `en` and `ru`. Order: kind; within `ABBREVIATION` the table order; otherwise higher `rank`, then city name in the interface language with `Intl.Collator(language)`. Offsets are not matched (NG5), so `UTC+5` finds nothing.

Abbreviation table (`adapters/city-search/timeZoneAbbreviations.ts`):

| Abbreviations | Zones, in order |
|---|---|
| UTC | UTC |
| GMT | UTC, Europe/London |
| EST, EDT, ET | America/New_York |
| CST | America/Chicago, Asia/Shanghai, America/Havana |
| CDT | America/Chicago, America/Havana |
| MST | America/Denver, America/Phoenix |
| MDT | America/Denver |
| PST, PDT, PT | America/Los_Angeles |
| AKST, AKDT | America/Anchorage |
| HST | Pacific/Honolulu |
| BST | Europe/London, Asia/Dhaka |
| WET, WEST | Europe/Lisbon |
| CET, CEST | Europe/Berlin, Europe/Paris |
| EET, EEST | Europe/Athens, Europe/Kyiv |
| MSK | Europe/Moscow |
| IST | Asia/Kolkata, Asia/Jerusalem, Europe/Dublin |
| PKT | Asia/Karachi |
| ALMT | Asia/Almaty |
| ICT | Asia/Bangkok |
| WIB | Asia/Jakarta |
| SGT | Asia/Singapore |
| HKT | Asia/Hong_Kong |
| JST | Asia/Tokyo |
| KST | Asia/Seoul |
| AEST, AEDT | Australia/Sydney |
| NZST, NZDT | Pacific/Auckland |
| GST | Asia/Dubai |
| SAST | Africa/Johannesburg |
| WAT | Africa/Lagos |
| EAT | Africa/Nairobi |
| CAT | Africa/Maputo |
| BRT | America/Sao_Paulo |
| ART | America/Argentina/Buenos_Aires |

Popular locations (`POPULAR_TIME_ZONE_IDS`, suggestions in this order and `rank` = distance from the end): UTC, America/New_York, America/Los_Angeles, Europe/London, Europe/Berlin, Europe/Moscow, Asia/Dubai, Asia/Kolkata, Asia/Almaty, Asia/Shanghai, Asia/Tokyo, Australia/Sydney.

Check of the numbers in M4 against these rules: `IST` → the three `ABBREVIATION` matches first in table order; `Istanbul` follows as `CITY_PREFIX`. `EST` → New York (`ABBREVIATION`) first; Tallinn follows as `COUNTRY` (Estonia). `Moscow` / `Москва` → the only `CITY_PREFIX` match is Europe/Moscow. `Kazakhstan` / `Казахстан` → no city or abbreviation starts with it, so every result is a `COUNTRY` match with code KZ.

### D8. Lazy search chunk (NFR-P2, FR15, FR16)
`adapters/index.ts` exports `loadCitySearch: LoadCitySearch = () => import("./city-search").then((module) => module.createCompositeCitySearch())` and never re-exports `city-search` statically. `vite.config.ts` adds `build.rollupOptions.output.manualChunks` returning `"city-search"` for module ids under `src/adapters/city-search/` and for the `virtual:zone-cities` module of D6, so the chunk file starts with `city-search-`. `scripts/check-bundle-size.mjs` fails when no `city-search-` chunk exists, when it exceeds 30 KB gzipped, or when it is among the initial script URLs of `index.html` (entry script or `modulepreload`).

Keeping the precache as it is (FR16 needs the chunk offline) means a network-level "not downloaded before the search opens" check would be false. The E2E check of NFR-P2 observes the page instead: Playwright's `page.on("request")` reports the requests the page issues, including those the service worker answers, while the service worker's own precache fetches are not page requests. The scenario records page requests whose URL contains `city-search-` and expects none before the search opens and at least one after.

`controller/useCitySearch.ts(loadCitySearch = defaultLoad)` returns `{ status: CitySearchStatus.LOADING | READY | FAILED, presentResults, retry }` (`presentResults` in D9). A successful load is cached at module level per loader function (a `WeakMap`), so reopening is instant and tests with their own loaders do not share a cache; a failed load is not cached, so `retry` imports again. `views/shared/LocationSearch.tsx` accepts an optional `loadCitySearch` prop that it passes to `useCitySearch`; production code never sets it.

### D9. Presenter (ADR-0002)
`presenter/presentLocationRows(locations, language)` → `{ id, cityLabel, countryName }`; `presenter/presentSearchResults(results, locations, language)` → `{ timeZoneId, cityName, countryCode, countryName, matchedAbbreviation?, isAdded }`. Country names come from `Intl.DisplayNames(language, { type: "region" })`, cached per language; an empty code gives an empty name. `isAdded` is true when a location has the result's `timeZoneId` and a label equal to one of the record's names (FR8). Views receive presenter output only: `useLocations()` returns `rows` from `presentLocationRows` for the active language (`useTranslation().i18n.language`), and `useCitySearch()` exposes `presentResults(query, locations)` that runs `search` or `suggest` and then `presentSearchResults`. Static UI strings (buttons, messages) use `t()` in the views, as `CardsView` and the `app/` components do today.

### D10. Search overlay and list UI (FR15, FR17, NFR-A2, NFR-A3, NFR-R1)
- `components/ui/dialog.tsx`: the shadcn/ui Dialog over `@radix-ui/react-dialog` (new dependency). Radix gives the focus trap, Esc to close, `aria-modal` and focus return to the trigger, and runs in jsdom. Classes: full screen (`inset-0`) below `sm` (640 px, Tailwind default — `tailwind.config.ts` defines no custom screens), centered `max-w-lg` from `sm`. Colours come only from tokens (UX5).
- New design tokens, because the existing ones cover none of the dialog's surfaces or the error state. In `styles/tokens.css`, light / dark: `--color-surface` `#ffffff` / `#16213a` (dialog and input background), `--color-border` `#8a8a93` / `#6b7a99` (input and dialog border, ≥ 3:1 against the surface for WCAG 1.4.11), `--color-overlay` `#18181b` / `#000000` (modal backdrop, shown with Tailwind's `opacity-60`), `--color-danger` `#b42318` / `#ff8a80` (error text and icon; ≥ 6:1 against background and surface in both themes). `tailwind.config.ts` maps them to `surface`, `border`, `overlay`, `danger`. All are 6-digit hex so `themeTokens.ts` can read them.
- `views/shared/LocationSearchDialog.tsx` + `LocationSearchResults.tsx` + `LocationSearchStates.tsx` receive presenter output and callbacks only — `{ isOpen, status: CitySearchStatus, presentedResults, query, onQueryChange, onChoose(presentedResult), onRetry, onClose }` — never the `CitySearch` port. The wiring (`useCitySearch` for status, `presentResults(query, locations)` and `retry`; `useLocations()` for `locations` and `addLocation({ timeZoneId, label: cityName, countryCode })`) lives in a small container, `views/shared/LocationSearch.tsx`, which calls those controller hooks the same way `CardsView` calls `useLocations()`; it mounts the hook-owning part only while the dialog is open, so the page first requests the search chunk when the search opens (NFR-P2). The query and the active option are view state of the dialog. The dialog is a combobox (`role="combobox"` input with `aria-controls`, `aria-activedescendant`; `role="listbox"` results; `aria-disabled` on added results); arrow keys move the active option, Enter adds it; loading skeleton, error with Retry (`role="alert"`), no-results with hint; a polite live region announces the result count.
- `views/shared/LocationList.tsx` + `LocationRow.tsx` + `AddLocationButton.tsx` + `LocationsLoadError.tsx` (`role="alert"` with Reset). `LocationList` keeps the remove buttons' refs and moves focus after a removal (view state). A polite live region in `CardsView` announces add and remove.
- `CardsView` composes these blocks: error → `LocationsLoadError`; empty → explanation + `AddLocationButton`; otherwise → list + `AddLocationButton`.
- `KeyboardKey` gains `ARROW_DOWN`, `ARROW_UP`, `ENTER`.

### D11. Strings (FR18)
New flat keys under a new `locations` namespace (a new domain, `.claude/rules/i18n.md`): `addLocation`, `removeLocation` (`Remove {{city}}`), `searchTitle`, `searchLabel`, `searchPlaceholder`, `suggestionsHeading`, `noResults`, `noResultsHint`, `searchLoading`, `searchLoadError`, `retry`, `added`, `close`, `addedAnnouncement`, `removedAnnouncement`, `loadError`, `reset`, and `resultCount` with `_one`, `_few`, `_many` and `_other` in both files: Russian needs `_one`/`_few`/`_many` (`.claude/rules/i18n.md`) plus `_other` for fractions, English needs `_one`/`_other`, and the existing `locales/locales.test.ts` requires identical key sets, so both files carry all four. `views.cardsEmptyState` stays.

### D12. Where tests live
Per `.claude/rules/bdd-unit.md` and `bdd-e2e.md`:
- `test/features/location_search/` (vitest-cucumber, the real extracted `virtual:zone-cities` data, no mocks): `location_search_by_name`, `location_search_by_country`, `location_search_by_abbreviation`, `location_search_ranking` (order, one entry per zone, limit, suggestions, no matches), `location_search_performance` (`performance.now()`).
- `test/features/locations/`: `locations_management.feature` (model through the store; steps assert the snapshot or the returned error, nothing is rendered), `locations_persistence.feature` (provider over the localStorage adapter: reload, first launch, legacy IDs, unreadable documents, reset, two providers over one storage and channel), `locations_ui_unit.feature` (jsdom, `AppShell` with seeded storage: rows, empty state after the last removal, add from search, marked as added, results follow typing, query cleared, no results, unreadable state with reset, private mode with the storage warning text, Russian strings).
- `locations_ui_e2e.feature` (playwright-bdd, real browser): lazy loading of the search chunk (no page request for `city-search-` before the search opens, D8), search-data loading, failure and retry (the chunk request is held or aborted), accessible names of remove actions, polite announcements, layout at 320 / 375 / 1024 / 2560 px, screenshots, cross-tab with two pages of one context, offline reopen and offline search after the service worker is installed. The view-contract scenarios (next bullet) hold axe-core in the 9 non-offline states of the UI States Matrix × 2 themes, the keyboard flow with focus return and focus after removal. Anything that asserts an accessible name, focus, `aria-*` or layout goes into an `_e2e` file, never into the `_unit` file.
- View contract (ADR-0005: "the view-contract BDD E2E scenarios are parameterized by the registry and run for every registered view"). Adding and removing a location is part of the view contract (ADR-0002, `docs/architecture/views.md`), so those scenarios go into their own file, `locations_view_contract_e2e.feature`, tagged `@view-contract`: "Add a location from the search", "Add with the keyboard", "Close with Esc", "Remove a location", "Focus after removal", "Focus after the last removal", and the axe-core outline of the list and search states. Each is a `Scenario Outline` whose Examples carry a `view` column (and a `width` column, the viewport at which AUTO resolves to that view). Parameterization by the registry is enforced in two places:
  - `app/ViewHost.tsx` marks its content container with `data-view-id` = the active view's id, and the step "Given the <view> view is shown at <width> px" sets the viewport and fails unless the container's `data-view-id` equals `<view>`, so every Example really runs on its view;
  - the Vitest guard `src/test/viewContract.test.ts` reads every `*_e2e.feature`, collects the `view` column of each `@view-contract` outline, and fails unless it equals `viewRegistry.map((view) => view.id)` — a newly registered view fails the unit run until every contract scenario lists it.
  Steps find elements by role and accessible name only, never by Cards-specific markup. Today the Examples hold `cards` only.
- Screenshots: `playwright.bdd.config.ts` gets the constant `SCREENSHOT_MAX_DIFF_PIXEL_RATIO = 0.01`, used as `expect.toHaveScreenshot.maxDiffPixelRatio`, and a `snapshotPathTemplate` under `src/test/features/__screenshots__/{projectName}/{arg}{ext}`; without it the baselines would sit next to the generated tests in the gitignored `.features-gen/` and never be committed. Baselines are generated in Linux, where CI runs.
- Data seeding: E2E seeds a version-1 document with `page.addInitScript`; unit steps use `test/factories/buildLocation.ts` (new, per `bdd-unit.md`).

## Consequences

Positive:
- The model, canonicalization and ranking are pure functions, testable with TDD, BDD and Stryker without rendering.
- Persistence and search sit behind ports with contract tests; a richer city source or an IndexedDB adapter plugs in without touching the model or the views (ADR-0004, ADR-0006).
- The search overlay and the list blocks live in `views/shared/`, so the Grid view reuses them.

Negative:
- Every build, Vitest run and Stryker run parses the CLDR JSON again; a CLDR upgrade is a `package.json` bump whose effect the data test of task 1.3 checks.
- The first domain state adds a provider around the page; tests that render `CardsView` alone now wrap it in `LocationsProvider` with the in-memory repository.
- One more lazy chunk and one more E2E feature with screenshot baselines to maintain.

## Alternatives Considered

- **Asynchronous repository port** (IndexedDB-ready): rejected for now; it would give the list a loading state on every start for a few kilobytes of data. ADR-0004 keeps IndexedDB open behind the same port name.
- **Asynchronous `search()` per keystroke**: rejected; once the data is loaded, matching is synchronous and fast (NFR-P1), and an async call per keystroke needs race handling for no gain. Only loading is asynchronous (D8).
- **Native `<dialog>` for the search**: rejected; jsdom does not implement `showModal()`, so the unit scenarios could not open it, and focus return would be hand-written.
- **Matching `Intl` abbreviations (`timeZoneName: "short"`)**: rejected by ADR-0003 and `.claude/rules/temporal.md` — locale-dependent, ambiguous, often just `GMT+N`.
- **Storing the English exemplar city and localizing on display**: rejected for this change; the presenter would need the lazily loaded search data to render the list. Recorded as Q1.

## Risks / Trade-offs

- [CLDR JSON field names change in a later release] → `extractZoneData` throws when `keyword.u.tz` or `timeZoneNames.zone` is missing, failing the build, and task 1.3's data test guards the output; field access is kept in that one function.
- [Some browsers list zones missing from our JSON, or miss zones in it] → ZoneCitiesSource falls back to the ID-derived name, and JSON zones unknown to the browser are dropped because Temporal could not use them anyway.
- [The BCP 47 key does not encode the country for every zone] → only validated region codes are kept, the five known exceptions are overridden (D6), and a zone without a country is still found by city and abbreviation; a later CLDR release with a new exception shows up as a wrong country in the data test only if a fixture covers it.
- [Screenshot baselines depend on fonts and OS] → baselines are generated on Linux, as CI runs, and use a small diff ratio constant.
- [Labels keep the language of the moment they were added (Q1)] → accepted for this change; `isAdded` compares every language so a duplicate in the other language is not offered.
- [Debounced writes can be lost when the tab is killed] → flush on `pagehide`; the window is 300 ms.

## Migration Plan

First version of the locations document: no migration. Rollback: an older build ignores the `time-zones:locations` key.
