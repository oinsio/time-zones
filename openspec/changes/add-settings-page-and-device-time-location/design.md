# Design: Add the settings page and the device time location

## Context

Driven by FR1–FR17, NFR-P1, NFR-P2, NFR-A1–NFR-A3, NFR-R1–NFR-R3 and UX1–UX5 of `proposal.md`; the motivation is in its Why section. Every owner named below was opened under `packages/client/src/` on the base of this branch.

- **Here entry today.** `model/hereEntry.ts` (`getHereEntry`, `HereEntry`) derives the entry when no location is in the device time zone. `presenter/presentHereEntry.ts`, `controller/useHereEntry.ts` (with `useExemplarCity` and `cityDataCache.ts`) and `views/shared/HereEntryRow.tsx` present and render it. `CardsView.tsx` renders it outside `LocationList`. Wall-time input on it uses `WallTimeTargetKind.HERE_ENTRY` (`model/referenceMoment.ts`), which `reduceWallTime.ts`, `followReferenceZone.ts`, `wallClockNote.ts` and `presenter/presentZoneMoment.ts` branch on.
- **Location list.** `model/locations.ts` owns `Location`, `WorldClockState`, `reduceLocations` and the commands of `locationCommands.ts`. `buildLocationId` (`model/locationId.ts`) is the one owner of the id format `<zone>|<label>`. `getLocationMarkKind` (`model/locationMark.ts`) gives Home before Here, with Here decided by `isLocationInDeviceTimeZone`.
- **Persistence.** `adapters/locationsDocument.ts` writes `{ schemaVersion, payload }` with `LOCATIONS_SCHEMA_VERSION = 2` (`constants/locations.ts`, re-exported by `constants/index.ts`) and `LOCATION_MIGRATIONS` `{ 1: … }`. `model/parseStoredLocations.ts` validates the payload. `adapters/localStorageLocationRepository.ts` returns `LocationsLoadStatus.EMPTY` when no document is stored, and also when storage throws. It owns the `BroadcastChannel` and `storage` event sync. `controller/LocationsProvider.tsx` turns `EMPTY` into `{ locations: [], homeLocationId: null }` (`storedOf`). `createLocationsActions.ts` writes only after the user's own commands, and `resetLocations` calls `repository.clear()`.
- **Header and search.** `app/MainPage.tsx` renders the header with the title and an empty `div` slot. `CardsView` renders `LocationSearch` (`views/shared/LocationSearch.tsx`, which holds `AddLocationButton` and `useSearchShortcut`) below the list. It also renders the empty-state text `views.cardsEmptyState` whenever `rows.length === 0`, next to the Here entry, and focuses `addLocationButtonRef` after the last removal.
- **Time formatting.** `presenter/dateTimeFormatters.ts` `getDateTimeFormatter(language, timeZoneId, kind)` is the one cached owner of `Intl.DateTimeFormat`. It reads `LOCAL_TIME_FORMAT_OPTIONS` and `HOUR_LABEL_FORMAT_OPTIONS` (`constants/localDateTime.ts`, both `hourCycle: "h23"`). Every time text goes through it: `formatLocalTime` and `formatWallClockTime` (`presenter/localDateTime.ts`, used by rows, the wall-time hint and `presentDateBar`'s gap note) and `presenter/dayTrack.ts` (hour labels). `parseWallTimeInput` (`presenter/parseWallTimeInput.ts`) reads `WALL_TIME_INPUT_PATTERNS` (`constants/timeSelection.ts`, 24-hour only). `WallTimeInput` opens with `initialText = localTimeLabel` (`views/shared/LocalDateTime.tsx`).
- **Theme.** `styles/tokens.css` has a light `:root` block and a `@media (prefers-color-scheme: dark)` block. `tailwind.config.ts` has `darkMode: "media"`, and no `dark:` variant is used under `src/`. `styles/tokens.test.ts` splits the file at the media marker.
- **Preferences.** No `src/preferences/` folder, no preferences port and no settings UI exist. `docs/architecture/domain-model.md` plans `Preferences` with its own repository (ADR-0002, ADR-0004).
- **Date bar.** `views/shared/DateBar.tsx` uses `justify-between … md:justify-center md:gap-4`. That is the jump the task reports.
- **Test infrastructure.** `test/workCounters.ts` (`startWorkCount`), `test/localStorageMock.ts`, `test/inMemoryChannel.ts`, `test/switchableClock.ts`, `test/stubZoneCitiesFetch.ts`, `test/renderLocations.tsx`, and the E2E device zone `Asia/Almaty` in `playwright.bdd.config.ts`. The screenshot outline "Screenshot of the <state> state at <width> px in the <theme> theme" lives in `test/features/locations/locations_ui_e2e.feature`. The repository has no Storybook: UI states are covered by BDD and screenshot scenarios.

## Goals / Non-Goals

**Goals:** one owner per concept. The device time location is a `Location`, preferences are one model, every time text goes through `getDateTimeFormatter`, and the search option reuses the search's normalization. The device time zone stays environment state that is never stored (ADR-0007).

**Non-Goals:** routing, language or view-mode settings (NG1, NG3), and any change to the reference zone rule (NG4).

## Decisions

### D1: The device time location is a kind of `Location`, and its zone is mirrored from the device time zone (FR8, FR9, FR10)

`model/locations.ts` gets `enum LocationKind { CITY = "CITY", DEVICE_TIME = "DEVICE_TIME" }`, and `Location` gets `kind: LocationKind`. The device time location is `{ id: DEVICE_TIME_LOCATION_ID, kind: DEVICE_TIME, timeZoneId: state.deviceTimeZoneId, label: "", countryCode: "" }`. `DEVICE_TIME_LOCATION_ID = "device-time"` lives in `constants/locations.ts`. It has no `|`, so it can never equal an id from `buildLocationId`, which stays the owner of city ids. The reducer keeps its `timeZoneId` equal to `deviceTimeZoneId`: `SET_DEVICE_TIME_ZONE` and `REPLACE_LOCATIONS` rebuild that one entry through a new helper, `withDeviceTimeZone(locations, deviceTimeZoneId)` (`model/deviceTimeLocation.ts`). Every selector that reads `location.timeZoneId` therefore works unchanged: `getReferenceZone`, the day track, offsets, the Here mark through `isLocationInDeviceTimeZone`, `SET_WALL_TIME`, and the Home mark before Here in `getLocationMarkKind`. A new command `ADD_DEVICE_TIME_LOCATION` appends it, or fails with `DUPLICATE_LOCATION`. `REMOVE_LOCATION`, `MOVE_LOCATION` and `SET_HOME_LOCATION` work by id and need no change. New invariants: at most one `DEVICE_TIME` entry, and its `timeZoneId === deviceTimeZoneId`.

`getHereEntry`/`HereEntry`, `presentHereEntry`, `useHereEntry` and `HereEntryRow` are deleted. `WallTimeTargetKind.HERE_ENTRY` is deleted as well: a wall-time input on the device time location is an ordinary `LOCATION` target. `followReferenceZone` ends a hint whose target is `DEVICE_TIME_LOCATION_ID` when `deviceTimeZoneId` changed, which is the same rule as today. `wallClockNote.ts` and `presentZoneMoment.ts` lose their `HERE_ENTRY` branches.

*Alternatives.* (a) Keep the derived entry and add "hidden"/"position" flags. Rejected: it would be a second, parallel list with its own reorder, home and menu rules, the smeared logic the glossary rule forbids. (b) Add the device's city as an ordinary city location on first launch. Rejected: it would stop following the device after a flight, and it would store the device time zone, which ADR-0007 forbids. (c) Resolve the zone in every selector instead of mirroring it. Rejected: every zone reader would need the state and a kind branch.

### D2: Schema version 3 and the migration (FR12, FR13, FR14)

`LOCATIONS_SCHEMA_VERSION` becomes `3`. A payload entry is either `{ "kind": "DEVICE_TIME" }` or `{ "timeZoneId", "label", "countryCode" }`. A city entry may carry `"kind": "CITY"`, which the serializer writes. The home id `"device-time"` is valid. `parseStoredLocations` rejects an unknown `kind`, a second `DEVICE_TIME` entry and a `DEVICE_TIME` entry with extra zone fields: the document is unreadable, as for any invalid entry. `parseHomeLocationId` accepts `DEVICE_TIME_LOCATION_ID` before `canonicalizeLocationId`. `LOCATION_MIGRATIONS[2]` prepends `{ kind: "DEVICE_TIME" }`, and the home is kept. A version 1 document runs `1 → 2 → 3`.

*Alternative.* Prepend only when no city is in the device time zone. Rejected: the migration would depend on environment state, and a pure `vN → vN+1` function cannot know it (ADR-0004). Prepending always keeps what most users saw (the Here entry). The few users with a city in their own zone get one row they can remove.

### D3: The first-launch list has one owner in the model (FR12)

`model/deviceTimeLocation.ts` exports `buildFirstLaunchLocations(deviceTimeZoneId)`, which returns the device time location alone. `LocationsProvider.storedOf` maps `LocationsLoadStatus.EMPTY` to it, with home `null`. That covers the first launch, a storage read that throws, a Reset and a clear made by another tab. Nothing is written, because the provider only writes after the user's commands (existing behaviour, kept). A stored empty list is `LOADED` with `[]` and stays empty (FR13).

### D4: Rows present the device time location (FR8, UX3)

`presentLocationRows` branches once on `location.kind`. A device time row takes `cityLabel` from `context.deviceTimeCityLabel` and gets `metaLabel` (`locations.deviceTimeMeta`, existing key) and an `accessibleName` (`locations.deviceTimeName`, today's `hereEntryName` text). `countryName` is empty. `LocationRow` renders `metaLabel` in place of the country and offset, and uses `accessibleName` as the item's name, through the existing `secondaryTexts` slot of `ZoneRowContent`. `useLocations` adds `deviceTimeCityLabel` to `LocationRowsContext`. It comes from `useExemplarCity(timeZoneId, loadCitySearch)` and is requested only when the list has a `DEVICE_TIME` entry (NFR-P2), falling back to `deriveCityNameFromTimeZoneId`. `CardsView` renders only `LocationList`, the empty state when `rows.length === 0`, and the live region.

### D5: Preferences are a model, a port and two adapters (FR4, FR5, FR7)

- **Model** `src/preferences/` (index.ts as the only entry): `enum ThemePreference { LIGHT, DARK, SYSTEM }`, `enum HourFormat { H12, H24 }`, `Preferences = { theme, hourFormat }`, `DEFAULT_PREFERENCES = { SYSTEM, H24 }`, commands `PreferencesCommandType.SET_THEME | SET_HOUR_FORMAT` with a pure `reducePreferences`, and `parseStoredPreferences(payload)`, which rejects any unknown value. The store is the existing `createStore` from `@/model`.
- **Port** `ports/preferencesRepository.ts`: `PreferencesRepository { load(): PreferencesLoadResult; save(preferences): SaveOutcome; clear(): SaveOutcome; subscribe(onExternalChange) }`, with `PreferencesLoadStatus.LOADED | EMPTY | UNREADABLE` and the existing `SaveOutcome`.
- **Adapters** `adapters/localStoragePreferencesRepository.ts` and `adapters/inMemoryPreferencesRepository.ts`, both run by `adapters/preferencesRepository.contract.ts`. The document is `{ schemaVersion: PREFERENCES_SCHEMA_VERSION (1), payload: { theme, hourFormat } }` under `STORAGE_KEYS.PREFERENCES = "time-zones:preferences"`. The key and `PREFERENCES_SYNC_CHANNEL_NAME` go into `constants/storage.ts` next to `STORAGE_KEYS.LOCATIONS` and `LOCATIONS_SYNC_CHANNEL_NAME`; the schema version goes into a new `constants/preferences.ts`, as `LOCATIONS_SCHEMA_VERSION` lives in `constants/locations.ts`.
- **Controller** `controller/PreferencesProvider.tsx` and `usePreferences()`. It loads synchronously in a `useState` initializer, applies a user change at once and writes it after `PREFERENCES_WRITE_DEBOUNCE_MS` through the existing `WriteScheduler` (`controller/writeScheduler.ts`), flushing a pending write on `pagehide`: the same mechanism as `createLocationsActions` and `LocationsProvider`, as ADR-0004 requires ("Writes are debounced and never block the UI"). It never writes on load, applies external changes and exposes `loadStatus`, `hasSaveFailed`, `setTheme`, `setHourFormat` and `resetPreferences`. `AppShell` wraps `LocationsProvider` in it.

### D6: Tab sync has one owner for both documents (FR7)

The `BroadcastChannel`/`storage`-event code of `localStorageLocationRepository.ts` moves into `adapters/storageDocumentSync.ts` as `createStorageDocumentSync({ storageKey, channelName, createChannel })` with `announceChange()` and `subscribe(onChange)`. Both repositories use it. The locations repository's existing contract and failure tests stay green unchanged, and they prove the move. `PREFERENCES_SYNC_CHANNEL_NAME = "time-zones:preferences-sync"`. *Alternative:* copy the code into the preferences adapter. Rejected: that would make two owners of tab sync.

### D7: The theme is a `data-theme` attribute over the media query (FR4, app-shell)

`tokens.css` keeps the light `:root` block and adds `:root[data-theme="dark"] { …dark values… }` plus `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { …dark values… } }`, with `color-scheme: light` / `dark` in the same blocks. `controller/useThemePreference.ts` sets `document.documentElement.dataset.theme` to `light` or `dark` for LIGHT and DARK, and removes it for SYSTEM, in a `useLayoutEffect`. That runs before the browser paints the first commit of the shell, and the CSS media query covers SYSTEM even before JavaScript runs (the first-paint rule of `app-shell`). The two dark blocks hold identical values. `tokens.test.ts` asserts that they are equal, and it reads the light and dark values from their blocks by selector instead of splitting at the media marker. `tailwind.config.ts` is not touched: no `dark:` variant is used. No code listens to `matchMedia`: System follows a change of the system preference through CSS alone. jsdom applies neither media queries nor the token CSS, so unit tests only assert the `data-theme` attribute. Every scenario about token colours under a system color-scheme runs in Playwright with `emulateMedia({ colorScheme })` (task 8.2).

### D8: The hour format enters the one formatter owner (FR5, NFR-P1)

`getDateTimeFormatter(language, timeZoneId, kind, hourFormat)` adds `hourFormat` to its cache key and picks its options from `FORMAT_OPTIONS_BY_KIND_AND_HOUR_FORMAT` in `constants/localDateTime.ts`. `H24` keeps today's options. `H12` uses `{ hour: "numeric", minute: "2-digit", hourCycle: "h12" }` for `LOCAL_TIME` and `{ hour: "numeric", hourCycle: "h12" }` for `HOUR`. `LocationRowsContext` gets `hourFormat` (from `usePreferences` in `useLocations`). `formatLocalTime`, `formatWallClockTime`, `dayTrack.ts` and `presentDateBar` (from `useReferenceMoment`) pass it through. Unchanged preferences hit the cache, so presenting again builds 0 formatters. A switch builds at most one formatter per zone and kind (M7).

### D9: 12-hour wall-time text (FR6)

`parseWallTimeInput(text, dayPeriodMarkers)` first collapses any whitespace (including U+00A0 and U+202F, which `Intl` puts before the marker) and splits off a trailing marker. The accepted markers are `AM`/`PM` in any letter case plus the language's own `dayPeriod` parts. Those parts are read once per language through `formatToParts` of the cached `H12` `LOCAL_TIME` formatter of `UTC` at 00:00 and 12:00 (`presenter/dayPeriodMarkers.ts`; `formatToParts` is in the `ES2020` lib of `tsconfig.app.json`). The constant `TWELVE_HOUR_WALL_TIME_PATTERN` and the hour limits `MIN_TWELVE_HOUR = 1` and `MAX_TWELVE_HOUR = 12` go into `constants/timeSelection.ts`. The 24-hour patterns stay as they are. The round-trip scenario "The shown time is accepted unchanged" covers whatever marker `Intl` gives Russian.

### D10: The settings page is shell state, not a URL (FR3, NG3)

`app/AppShell.tsx` holds `enum AppPage { MAIN, SETTINGS }` (`app/appPage.ts`) in `useState` and renders `MainPage` or the new `app/SettingsPage.tsx` inside the same providers. The notices region is today part of `MainPage` (the polite `role="status"` element in its footer, filled through the `notices` prop), so `SettingsPage` takes the same `notices` prop from `AppShell` and renders it in its own polite `role="status"` region; `MainPage`'s footer is not moved. Esc on the settings page and the back button set `MAIN`. Focus goes to the heading (`tabIndex={-1}`) on open and to the settings button on return, through a ref the shell owns. The settings page is a page of the shell, so it is not a view and needs no registry entry (ADR-0005). *Alternative:* hash routing (`#settings`). Rejected: it would be the app's first routing mechanism, a global decision, while ADR-0005 states that "the app has no routing". The browser Back button is not wired (recorded as a risk).

### D11: Header actions and the moved search (FR1, FR2, UX1)

`MainPage` gets a `headerActions` slot. `AppShell` fills it with `LocationSearch` (from `@/views/shared`, as it already imports `DateBar`) and the new `app/SettingsButton.tsx` (lucide `SlidersHorizontal`, accent colour). While `loadStatus` is `UNREADABLE`, `LocationSearch` is not rendered. The header uses a three-column grid below `md` (`+` | centred title | settings) and a flex row from `md` (title, then `+ Add`, then settings). The DOM order is `+`, title, settings, with `md:order-*` moving the title first, so Tab meets the two buttons in visual order at both widths. `AddLocationButton` shows `Plus` and the label `locations.addShort` ("Add" / «Добавить») in a `hidden md:inline` span. Its `aria-label` is `locations.addLocation`, keeping `aria-keyshortcuts="/"` and the `id` `ADD_LOCATION_BUTTON_ID` (`constants/dom.ts`). `CardsView` focuses that id after the last removal. The "added" announcement moves into `LocationSearch`, as a polite `sr-only` region next to the button. *Alternative:* a context passing a ref from the shell to the view. Rejected: more plumbing for one focus call.

### D12: The device time option in the search (FR11)

`useCitySearch` (the owner of search state, glossary "City search") exposes `isDeviceTimeOptionShown(query, locations)`. It is false when `locations` has a `DEVICE_TIME` entry. Otherwise it is true for a blank query, or when a word of the English or Russian label (`search.deviceTimeOption` read with `i18n.getFixedT("en"|"ru")`) starts with the query. The words are normalized by the existing `normalizeSearchText` and `splitIntoWords`, (`adapters/city-search/normalizeSearchText.ts`). No module index exports them today, so this change adds them to `adapters/city-search/index.ts` and `adapters/index.ts`; `useCitySearch.ts` already imports `@/adapters`. It does not depend on the search data status. `LocationSearchDialog` renders the option as the first `option` of its listbox, above the results or above the loading and error states. Choosing it calls `addDeviceTimeLocation()` from `createLocationsActions`, which dispatches `ADD_DEVICE_TIME_LOCATION`, then closes the search and announces the addition.

### D13: Date bar as one centred group (FR15, NFR-R2, UX4)

The bar's inner row becomes `flex items-center justify-center gap-3` at every width, with `px-2` on the bar, and `md:justify-center md:gap-4` and `justify-between` are dropped. Below 768 px the shown date is already the short form ("Sun, March 8"), so the group fits 320 px. The new E2E scenario measures the centring and the gaps at 6 widths.

### D14: Documents and the superseded ADR go through handoff

The change supersedes part of an Accepted ADR (ADR-0007: "Here marker" and "First launch"). That is a global decision, so it is recorded in a new ADR-0009, delivered as handoff H1, and not settled here. The glossary and the architecture documents follow in H2. The implement stage writes neither (`.gnomish/stages/specify/handoff.md`).

## Risks / Trade-offs

- [Every test that assumes an empty first launch or the Here entry breaks] → Group 4 of `tasks.md` rewrites the Here entry features and steps. Task 10.3 runs the full unit and E2E suites, one at a time, and fixes the remaining seeds (store `[]` where a test needs an empty list).
- [Prepending in the migration adds a row for users who already had their own city] → The row can be removed. Recorded in D2.
- [A blank background may paint in the system theme before the module script loads when the stored choice differs] → The main page itself renders in the stored theme from its first render (D7). An inline head script was rejected because it would be a second reader of the preferences document.
- [Back on a phone leaves the app instead of closing settings] → Accepted under NG3. The back button and Esc close it.
- [Intl 12-hour output differs by engine (U+202F, Russian markers)] → D9 reads the markers from the same formatter that writes them, and the round-trip scenario guards it.
- [Scenario titles kept for archive still say "Here entry"] → The validator requires the existing scenario names inside MODIFIED blocks. Their steps use the new terms, and new Gherkin uses "device time location" only.

## Migration Plan

The stored locations document moves `2 → 3` on load, in memory only. It is written on the user's next change. Rolling back to an older build makes a version 3 document "newer", so it shows the load error with Reset (ADR-0004). The preferences document is new: an older build ignores it.

## Consequences

Positive:
- The device time card gets every card control through the code that already serves city cards. The Here entry's parallel path (model, presenter, controller hook, view, wall-time target kind) is deleted.
- Preferences follow ADR-0002 and ADR-0004 as planned: model, port, two adapters, contract tests and versioned envelope, with tab sync shared with the locations.
- Every time text keeps one formatter owner. The hour format is one more cache key, so the work bounds of ADR-0008 still hold.

Negative:
- The locations schema moves to version 3. An older build shows the load error for a version 3 document.
- Many existing Here entry tests are rewritten, and every screenshot of the main page is re-approved for the new header.
- ADR-0007 is partly superseded, which needs a human to apply the ADR patch (H1).

## Alternatives Considered

**Keep the derived Here entry and add controls to it** (D1 a): rejected. It would be a second list with its own reorder, home and remove rules.

**Store the device's city as a city location on first launch** (D1 b): rejected. It would stop following the device and would store the device time zone.

**Hash routing for the settings page** (D10): rejected. It would be the app's first routing mechanism, a global decision that ADR-0005 rules out today.

**Copying the tab-sync code into the preferences adapter** (D6): rejected. It would make two owners of tab sync.

**An inline script in `index.html` that applies the stored theme** (Risks): rejected. It would be a second reader and parser of the preferences document.
