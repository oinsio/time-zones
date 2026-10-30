# Tasks

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter`, `git` or say "from the repository root". "design Dn" refers to `design.md`.

- **Running tests:** one command at a time, never in the background, never two test commands in one batch. Stryker runs only with `--mutate`, at most 5 files per run, waits for the previous run to finish, and its report is `reports/mutation/mutation-report.json`. Target ≥ 95 %, minimum acceptable 90 % (`.claude/rules/tdd-workflow.md`).
- **TDD:** each RED task ends with the named test command failing for the new expectations; its GREEN task makes it pass. Show the output at each transition.
- **Time in tests:** only `fakeClock(instant, timeZone)` of `@/lib/temporal` and `createSwitchableClock` of `test/switchableClock.ts`. Never `vi.setSystemTime()` or `vi.useFakeTimers()`.
- **E2E runs:** every Playwright command after a `.feature` edit starts with `npx bddgen -c playwright.bdd.config.ts && ` (the order of the `test:bdd` script). The E2E device time zone is `Asia/Almaty`.
- **Traceability:** every new or changed test, step file, feature and production file carries `add-settings-page-and-device-time-location`:
  - `@add-settings-page-and-device-time-location @FR-X` tags above scenarios, and `// @add-settings-page-and-device-time-location @FR-X` before `f.Scenario`;
  - `// Verifies NFR-X of add-settings-page-and-device-time-location` in E2E steps;
  - `Implements FR-X of add-settings-page-and-device-time-location (Dn).` in the JSDoc of new or changed production code.
- **Glossary:** use the terms of `proposal.md` "What Changes": device time location, first-launch list, settings page, settings button, preferences, theme preference, hour format, plus the existing location, location list, Here mark, home location, reference zone, device time zone, reorder, drag handle, date bar, Now button. New code and new Gherkin never say "Here entry", "default location" or "auto-added location". The only exceptions are the scenario titles that the spec deltas keep from archived requirements ("Type a time in the Here entry", "A device time zone change ends the hint on the Here entry", "The Here entry's request is the only one"), whose steps still use the new terms, and Russian text never says «локация».
- **No hardcoded values** (`.claude/rules/code-style.md`): storage keys, channel names, ids, schema versions and hour limits go into `constants/`. Every branch value is an enum.
- **File size:** every file stays under 200 lines; split by aspect (`*.home.test.tsx` style) when a file would pass it.

## 1. Model: the device time location (TDD, design D1–D3)

- [x] 1.1 Constants (no TDD): add `DEVICE_TIME_LOCATION_ID = "device-time"` to `constants/locations.ts`, and change `LOCATIONS_SCHEMA_VERSION` from `2` to `3` in the same file (`constants/locations.ts:2`). `constants/index.ts` already re-exports `LOCATIONS_SCHEMA_VERSION`; add `DEVICE_TIME_LOCATION_ID` next to it. Verify `pnpm --filter @time-zones/client typecheck`.
- [x] 1.2 RED (FR8, FR9, FR12): new `model/deviceTimeLocation.test.ts` and new cases in `model/locations.test.ts`:
  - `LocationKind.CITY | DEVICE_TIME`, with `kind: CITY` on every added city;
  - `ADD_DEVICE_TIME_LOCATION` appends `{ id: DEVICE_TIME_LOCATION_ID, kind: DEVICE_TIME, timeZoneId: <device zone>, label: "", countryCode: "" }` at the end, and returns `DUPLICATE_LOCATION` for a second one;
  - `SET_DEVICE_TIME_ZONE` and `REPLACE_LOCATIONS` set its `timeZoneId` to the canonical device zone (`Mars/Olympus_Mons` → `UTC`), and leave the `locations` array identity unchanged when nothing changed;
  - `REMOVE_LOCATION`, `MOVE_LOCATION` and `SET_HOME_LOCATION` work with `DEVICE_TIME_LOCATION_ID`, and removing it while it is home clears home;
  - `getReferenceZone` is the device zone while it is home;
  - `getLocationMarkKind` gives HERE for it and HOME while it is home;
  - `buildFirstLaunchLocations("Asia/Almaty")` returns only the device time location;
  - adding Almaty next to it is not a duplicate.

  Run `npx vitest run src/model/deviceTimeLocation.test.ts src/model/locations.test.ts` and see the new cases fail.
- [x] 1.3 GREEN: add `LocationKind` and `kind` to `Location` in `model/locations.ts`. Add `ADD_DEVICE_TIME_LOCATION` to `LocationCommandType` (`model/locationCommands.ts`). Create `model/deviceTimeLocation.ts` with `buildDeviceTimeLocation`, `withDeviceTimeZone`, `buildFirstLaunchLocations` and `isDeviceTimeLocation`. Export the new names through `model/index.ts`. Keep `locations.ts` under 200 lines by moving the new reducer branch into `deviceTimeLocation.ts`. Verify the command of 1.2.
- [x] 1.4 Remove the derived Here entry from the model (design D1): delete `model/hereEntry.ts` and `model/hereEntry.test.ts`, and drop `getHereEntry` and `HereEntry` from `model/index.ts`. Delete `WallTimeTargetKind.HERE_ENTRY` from `model/referenceMoment.ts`, along with its branches in `reduceWallTime.ts`, `wallClockNote.ts` and `followReferenceZone.ts`. `followReferenceZone` ends a hint whose `LOCATION` target is `DEVICE_TIME_LOCATION_ID` when `deviceTimeZoneId` changed. Rewrite the `HERE_ENTRY` cases of `reduceWallTime.test.ts`, `wallClockNote.test.ts` and `followReferenceZone.test.ts` as cases on the device time location, first RED, then GREEN. Verify `npx vitest run src/model`.
- [x] 1.5 RED (FR13, FR14, design D2): in `model/parseStoredLocations.test.ts` and `adapters/localStorageLocationRepository.migration.test.ts`, add fixtures:
  - a version 3 payload with `{ "kind": "DEVICE_TIME" }` and home `"device-time"` loads;
  - a second `DEVICE_TIME` entry, an unknown `kind`, and a `DEVICE_TIME` entry with a `timeZoneId` are rejected;
  - an empty version 3 list loads as `[]`;
  - a version 2 document (Moscow, New York, home Moscow) loads as device time location, Moscow, New York with home Moscow and is not written;
  - a version 1 document gets the device time location first and no home;
  - `serializeLocationsDocument` writes `{ "kind": "DEVICE_TIME" }` and never the device zone.

  Run `npx vitest run src/model/parseStoredLocations.test.ts src/adapters/localStorageLocationRepository.migration.test.ts` and see them fail.
- [x] 1.6 GREEN: extend `parseStoredLocations` and `parseHomeLocationId` (`model/parseStoredLocations.ts`) and `serializeLocationsDocument` (`adapters/locationsDocument.ts`), and add `LOCATION_MIGRATIONS[2]`. Update the existing fixtures that pinned version 2 (`localStorageLocationRepository*.test.ts`, `locationRepository.contract.ts`) to version 3. Verify, one at a time: `npx vitest run src/model`, then `npx vitest run src/adapters`.
- [x] 1.7 Mutation (M8): `npx stryker run --mutate 'src/model/deviceTimeLocation.ts,src/model/locations.ts,src/model/parseStoredLocations.ts,src/model/followReferenceZone.ts,src/adapters/locationsDocument.ts'`. Each file scores ≥ 95 % (minimum 90 %). Kill the survivors with tests in the files of 1.2 and 1.5.

## 2. Preferences: model, port, adapters, tab sync (TDD, design D5, D6)

- [x] 2.1 Constants (no TDD): in `constants/storage.ts` add `STORAGE_KEYS.PREFERENCES = "time-zones:preferences"` and `PREFERENCES_SYNC_CHANNEL_NAME = "time-zones:preferences-sync"`; create `constants/preferences.ts` with `PREFERENCES_SCHEMA_VERSION = 1` and `PREFERENCES_WRITE_DEBOUNCE_MS` (as `LOCATIONS_SCHEMA_VERSION` lives in `constants/locations.ts`); export the new names from `constants/index.ts`. Verify `pnpm --filter @time-zones/client typecheck`.
- [x] 2.2 RED (FR4, FR5, FR7): `preferences/preferences.test.ts` covers:
  - `DEFAULT_PREFERENCES` is `{ theme: ThemePreference.SYSTEM, hourFormat: HourFormat.H24 }`;
  - `reducePreferences` applies `SET_THEME` and `SET_HOUR_FORMAT` and returns the same object for an unchanged value;
  - `parseStoredPreferences` accepts every valid pair and rejects a non-object, a missing field and the unknown values `"SEPIA"` and `"H36"`.

  Run `npx vitest run src/preferences` and see it fail.
- [x] 2.3 GREEN: create `src/preferences/` with `preferences.ts`, `preferencesCommands.ts`, `parseStoredPreferences.ts` and `index.ts`. It is pure TypeScript and imports no React, DOM, i18n, presenter or adapters. Verify `npx vitest run src/preferences`.
- [x] 2.4 Tab sync refactor (no behaviour change, design D6): move the channel and `storage`-event code of `adapters/localStorageLocationRepository.ts` into `adapters/storageDocumentSync.ts` (`createStorageDocumentSync({ storageKey, channelName, createChannel })`), and use it from the locations repository. Verify, one at a time: `npx vitest run src/adapters/localStorageLocationRepository.test.ts src/adapters/localStorageLocationRepository.failures.test.ts src/adapters/locationRepository.test.ts`, then `npx vitest run src/controller/useLocations.sync.test.tsx`.
- [x] 2.5 RED (FR7): `ports/preferencesRepository.ts` declares the port (`load`, `save`, `clear`, `subscribe`, `PreferencesLoadStatus`) with `Implements FR7` JSDoc. Write a shared `adapters/preferencesRepository.contract.ts` and `adapters/preferencesRepository.test.ts`, which runs it against the in-memory and the localStorage adapters (`test/localStorageMock.ts`, `test/inMemoryChannel.ts`). It covers:
  - `EMPTY` without a document;
  - save then load;
  - `UNREADABLE` for invalid JSON, a newer `schemaVersion` and an unknown value;
  - `clear` gives `EMPTY`;
  - a save in one instance notifies `subscribe` in another;
  - a throwing storage makes `save` return `SaveOutcome.FAILED`.

  Run `npx vitest run src/adapters/preferencesRepository.test.ts` and see it fail.
- [x] 2.6 GREEN: `adapters/inMemoryPreferencesRepository.ts` (`createInMemoryPreferencesRepository`) and `adapters/localStoragePreferencesRepository.ts` (`createLocalStoragePreferencesRepository`, `localStoragePreferencesRepository`), the latter using `createStorageDocumentSync`. Export them from `adapters/index.ts` and the port from `ports/index.ts`. Verify `npx vitest run src/adapters/preferencesRepository.test.ts`.
- [x] 2.7 Mutation (M8): `npx stryker run --mutate 'src/preferences/preferences.ts,src/preferences/parseStoredPreferences.ts,src/adapters/localStoragePreferencesRepository.ts,src/adapters/storageDocumentSync.ts,src/adapters/inMemoryPreferencesRepository.ts'`. Each file scores ≥ 95 % (minimum 90 %).

## 3. Presenter: hour format, 12-hour input, device time rows (TDD, design D4, D8, D9)

- [x] 3.1 RED (FR5, NFR-P1): in `presenter/dateTimeFormatters.test.ts`:
  - `getDateTimeFormatter("en", "America/New_York", LOCAL_TIME, HourFormat.H12)` formats `2026-03-08T07:30:00Z` as `3:30 AM` (after collapsing U+202F/U+00A0 to a space), and `H24` as `03:30`;
  - `HOUR` in `H12` gives `4 AM`;
  - the same arguments return the same formatter, and another `hourFormat` returns another.

  Run `npx vitest run src/presenter/dateTimeFormatters.test.ts` and see it fail.
- [x] 3.2 GREEN: add `hourFormat` to `getDateTimeFormatter` and its cache key. In `constants/localDateTime.ts`, replace the per-kind options with `FORMAT_OPTIONS_BY_KIND_AND_HOUR_FORMAT` (H24 keeps today's options). Verify the command of 3.1.
- [x] 3.3 Thread the hour format (FR5): `LocationRowsContext` (`presenter/presentZoneMoment.ts`) gets `hourFormat`. Pass it through `formatLocalTime`, `formatWallClockTime`, `presenter/dayTrack.ts` (hour labels), `presentWallTimeHint` and `presentDateBar` (gap note). Existing tests pass `HourFormat.H24`. Add RED-then-GREEN cases:
  - `presenter/localDateTime.test.ts`: Kathmandu `1:15 PM`, New York `3:30 AM`;
  - `presenter/dayTrack.test.ts`: Moscow `10 PM 4 AM 10 AM 4 PM 10 PM`, Kolkata `12:30 AM 6:30 AM 12:30 PM 6:30 PM 12:30 AM`;
  - `presenter/dateBar.test.ts`: gap note `2:30 AM` / `3:30 AM`;
  - `presenter/wallTimeHint.test.ts`: 12-hour times.

  Verify `npx vitest run src/presenter`.
- [x] 3.4 RED (FR6): in `presenter/parseWallTimeInput.test.ts`, an `it.each` over the spec tables:
  - `9 PM`→`21:00`, `9pm`→`21:00`, `9:30 am`→`09:30`, `09.30 PM`→`21:30`, `12 AM`→`00:00`, `12:15 PM`→`12:15`, `9:30 PM`→`21:30`;
  - rejected `13 PM`, `0 AM`, `9:60 PM`;
  - every existing 24-hour case unchanged;
  - a round trip: for `en` and `ru`, `parseWallTimeInput(formatLocalTime(<16:30Z in Almaty>, lang, H12), getDayPeriodMarkers(lang))` is `21:30`.

  Run `npx vitest run src/presenter/parseWallTimeInput.test.ts` and see it fail.
- [x] 3.5 GREEN: add `presenter/dayPeriodMarkers.ts` (`getDayPeriodMarkers(language)`, read from `formatToParts` of the cached H12 formatter and memoized per language). Extend `parseWallTimeInput(text, dayPeriodMarkers)`, and add `TWELVE_HOUR_WALL_TIME_PATTERN`, `MIN_TWELVE_HOUR` and `MAX_TWELVE_HOUR` to `constants/timeSelection.ts`. Update the caller in `controller/useWallTimeInput.ts` to pass the markers of the interface language. Verify, one at a time: `npx vitest run src/presenter/parseWallTimeInput.test.ts`, then `npx vitest run src/controller/useWallTimeInput.test.tsx`.
- [x] 3.6 RED (FR8, UX3): in `presenter/presentLocationRows.test.ts`, a device time location row:
  - has the `cityLabel` from `context.deviceTimeCityLabel`, an empty `countryName` and the Here mark;
  - has `metaLabel` `Device time · UTC+5` / `Время устройства · UTC+5`;
  - has `accessibleName` `Алматы, Вы здесь, Время устройства`;
  - gets the Home mark and `Алматы, Домашнее место, Время устройства`-style name while home (the Home mark label comes from the existing `presentLocationMarks`);
  - has no offset difference without home.

  Run `npx vitest run src/presenter/presentLocationRows.test.ts` and see it fail.
- [x] 3.7 GREEN: branch on `location.kind` in `presentLocationRows`. Add the optional `metaLabel` and `accessibleName` to `LocationRow`, and add `deviceTimeCityLabel` to `LocationRowsContext`. Rename the locale key `locations.hereEntryName` to `locations.deviceTimeName` in both locale files, keeping the texts. Delete `presenter/presentHereEntry.ts` and its test, and drop its exports from `presenter/index.ts`. Remove the `HERE_ENTRY` branch from `presentZoneMoment.ts`. Verify `npx vitest run src/presenter`.
- [x] 3.8 Mutation (M8): `npx stryker run --mutate 'src/presenter/dateTimeFormatters.ts,src/presenter/parseWallTimeInput.ts,src/presenter/dayPeriodMarkers.ts,src/presenter/presentLocationRows.ts,src/presenter/localDateTime.ts'`. Each file scores ≥ 95 % (minimum 90 %).

## 4. Controller (TDD, design D3–D5, D7, D8, D12)

- [x] 4.1 RED (FR4, FR5, FR7): `controller/PreferencesProvider.test.tsx` and `controller/useThemePreference.test.tsx`, with `createInMemoryPreferencesRepository`:
  - the defaults apply without a document and nothing is saved on mount;
  - `setHourFormat(H12)` applies at once, and two quick changes save once, after `PREFERENCES_WRITE_DEBOUNCE_MS`, driven by `createManualWriteScheduler()` from `test/writeSchedulers.ts` as in `controller/useLocations.changes.test.tsx` (never `vi.useFakeTimers()`);
  - a `pagehide` flushes a pending write;
  - an external change applies;
  - `UNREADABLE` gives the defaults and `loadStatus` `UNREADABLE`, and `resetPreferences()` clears it;
  - a failing save sets `hasSaveFailed` and keeps the choice;
  - `useThemePreference` sets `document.documentElement.dataset.theme` to `dark` / `light` and removes it for SYSTEM, already in the first commit (assert inside a child's `useLayoutEffect` that runs after it).

  Run `npx vitest run src/controller/PreferencesProvider.test.tsx src/controller/useThemePreference.test.tsx` and see them fail.
- [x] 4.2 GREEN: `controller/PreferencesProvider.tsx`, `controller/preferencesContext.ts`, `controller/usePreferences.ts` and `controller/useThemePreference.ts`, exported through `controller/index.ts`. Verify the command of 4.1.
- [x] 4.3 RED (FR8, FR12, FR13, NFR-P2): in `controller/useLocations.test.tsx`:
  - with no document the rows are the device time location only and nothing is written;
  - a stored `[]` stays empty;
  - `addDeviceTimeLocation()` appends it and writes;
  - Reset shows the first-launch list without writing;
  - the rows use `hourFormat` from `usePreferences`.

  Rewrite `controller/useLocations.hereEntry.test.tsx` as `useLocations.deviceTime.test.tsx`: the device time location is named from the zone ID first and by the exemplar city after the load, the zone cities data is requested only while it is listed, and its zone follows a device time zone change at the minute tick. Delete `controller/useHereEntry.test.tsx`. Run `npx vitest run src/controller/useLocations.test.tsx src/controller/useLocations.deviceTime.test.tsx` and see them fail.
- [x] 4.4 GREEN: in `LocationsProvider.storedOf`, map `EMPTY` to `buildFirstLaunchLocations(clock.timeZoneId())`. Add `addDeviceTimeLocation` to `createLocationsActions.ts` and the context. In `useLocations`, read `hourFormat` and add `deviceTimeCityLabel` (from `useExemplarCity` only when a device time location is listed), and drop `hereEntry`. Delete `controller/useHereEntry.ts` and its export. Verify, one at a time: `npx vitest run src/controller`.
- [x] 4.5 RED → GREEN (FR11, design D12): in `controller/useCitySearch.test.ts`, `isDeviceTimeOptionShown` is:
  - true for `""`, `"  "`, `dev`, `time`, `врем`, `устр`, `DEVICE` while the list has no device time location, in every `CitySearchStatus`;
  - false for `Moscow`;
  - false whenever the list has one.

  Implement it with `normalizeSearchText` and `splitIntoWords`, which live in `adapters/city-search/normalizeSearchText.ts` and are exported from no module index today: add them to the exports of `adapters/city-search/index.ts` and `adapters/index.ts`, and with the labels of `presentDeviceTimeOptionLabels(translators)`, a new presenter function in `presenter/presentDeviceTimeOptionLabels.ts` exported through `presenter/index.ts` (design D12); `useCitySearch` passes it `i18n.getFixedT("en")` and `i18n.getFixedT("ru")`. First RED → GREEN `presenter/presentDeviceTimeOptionLabels.test.ts`: it returns `["Device time", "Время устройства"]`. Add the key `search.deviceTimeOption` ("Device time" / «Время устройства») to both locale files. Verify, one at a time: `npx vitest run src/presenter/presentDeviceTimeOptionLabels.test.ts`, then `npx vitest run src/controller/useCitySearch.test.ts`.
- [x] 4.6 Mutation (M8): `npx stryker run --mutate 'src/controller/PreferencesProvider.tsx,src/controller/useThemePreference.ts,src/controller/createLocationsActions.ts,src/controller/useCitySearch.ts,src/controller/LocationsProvider.tsx'`. Each file scores ≥ 95 % (minimum 90 %).

## 5. Theme tokens (design D7)

- [x] 5.1 RED (FR4, NFR-A3): in `styles/tokens.test.ts`:
  - read the light values from the `:root {` block and the dark values from the `:root[data-theme="dark"]` block;
  - add `it("should give the forced dark block and the system dark block the same values")`, which compares every `--color-*` of `:root[data-theme="dark"]` with the block under `@media (prefers-color-scheme: dark)` selected by `:root:not([data-theme="light"])`;
  - add `it.each(["light", "dark"])` "should declare color-scheme %s";
  - keep every contrast case.

  Put `// Verifies FR4, NFR-A3 of add-settings-page-and-device-time-location.` first. Run `npx vitest run src/styles/tokens.test.ts` and see it fail.
- [x] 5.2 GREEN: restructure `styles/tokens.css` as in design D7, with no value changed. Verify `npx vitest run src/styles/tokens.test.ts`.

## 6. Views and shell (TDD, design D4, D10, D11, D13)

- [x] 6.1 RED (FR9, FR13, UX3): rewrite `views/cards/CardsView.hereEntry.test.tsx` as `CardsView.deviceTime.test.tsx`:
  - the device time location is a `listitem` of the numbered list, with a drag handle and a menu "Actions for Almaty" offering "Make home" and "Remove";
  - no empty-state text while only the device time location is listed;
  - the empty state with an empty list;
  - after the last removal, focus is on `#` + `ADD_LOCATION_BUTTON_ID` (render the button with that id in the test).

  In `views/shared/LocationRow.test.tsx`, a row with `metaLabel` shows it instead of the country and offset and uses `accessibleName`. Delete `views/shared/HereEntryRow.tsx` and its test. Run `npx vitest run src/views` and see the new cases fail.
- [x] 6.2 GREEN: change `CardsView.tsx` (no `HereEntryRow`, no `LocationSearch`, the empty state only when `rows.length === 0`, focus by id after the last removal) and `LocationRow.tsx` (`metaLabel`, `accessibleName`). Drop the `HereEntryRow` export from `views/shared/index.ts`. Add `ADD_LOCATION_BUTTON_ID` to `constants/dom.ts`. Verify `npx vitest run src/views`.
- [x] 6.3 RED → GREEN (FR2, FR11, FR16): in `views/shared/AddLocationButton.test.tsx`, the button keeps the accessible name "Add location", `aria-keyshortcuts="/"` and the id `ADD_LOCATION_BUTTON_ID`, and shows the text "Add" in a span with the classes `hidden md:inline`. In `LocationSearchDialog.test.tsx` and `LocationSearch.test.tsx`, the "Device time" option is the first option when `isDeviceTimeOptionShown`, also in the loading and error states. Choosing it calls `addDeviceTimeLocation`, closes the dialog and announces "Device time added" in the polite region of `LocationSearch`, which now owns the "added" announcement. Add the key `locations.addShort` ("Add" / «Добавить») to both locale files. Verify, one at a time: `npx vitest run src/views/shared/AddLocationButton.test.tsx`, then `npx vitest run src/views/shared/LocationSearch.test.tsx src/views/shared/LocationSearchDialog.test.tsx`.
- [x] 6.4 RED (FR1, FR3, FR4, FR5, FR7, FR16): new tests:
  - `app/SettingsButton.test.tsx`: named "Settings", shows the `SlidersHorizontal` icon;
  - `app/SettingsPage.test.tsx`:
    - heading "Settings", back button "Back";
    - radio groups "Theme" (Light/Sun, Dark/Moon, System/Monitor; System checked) and "Hour format" (12-hour, 24-hour; 24-hour checked);
    - a check icon on the checked option;
    - choosing calls the setters;
    - the unreadable note with Reset when `loadStatus` is `UNREADABLE`;
    - the "will not be saved" note when `hasSaveFailed`;
    - Russian texts «Настройки», «Тема», «Светлая», «Тёмная», «Системная», «Формат времени», «12 часов», «24 часа»;
  - `app/AppShell.settings.test.tsx`:
    - the settings button opens the page and focuses its heading;
    - no date bar on the settings page;
    - Back and Esc return and focus the settings button;
    - the reference moment stays pinned across the visit;
    - `/` does not open the search on the settings page;
    - no Add location button while the stored list is unreadable;
    - the `settings` scenario "Notices on the settings page" (`// FR3: notices on the settings page`): with the `useRegisterSW` mock of `app/AppShell.notices.test.tsx` reporting a new version, the open settings page has a `role="status"` region holding the update notice.

  Run `npx vitest run src/app` and see them fail.
- [x] 6.5 GREEN: add `app/appPage.ts` (`AppPage`), `app/SettingsButton.tsx`, `app/SettingsPage.tsx` (option groups as `role="radiogroup"` with native radio inputs styled by tokens: `bg-surface`, `border-border`, accent check; options at least `min-h-11`), and `app/SettingsPage.parts.tsx` if the page passes 200 lines. Change `MainPage.tsx` (`headerActions` slot, header grid of design D11) and `AppShell.tsx` (`PreferencesProvider`, `useThemePreference`, page state, the `notices` prop passed to `SettingsPage` as to `MainPage` (design D10), `LocationSearch` and `SettingsButton` in the header, `LocationSearch` hidden while `UNREADABLE`). Add every `settings.*` key to both locale files. Verify, one at a time: `npx vitest run src/app`, then `npx vitest run src/i18n.test.ts`.
- [x] 6.6 RED → GREEN (FR15): in `views/shared/DateBar.test.tsx`, the bar's inner row has the classes `justify-center` and `gap-3` and none of `justify-between`, `md:justify-center`, `md:gap-4`. Change `DateBar.tsx` as in design D13. Verify `npx vitest run src/views/shared/DateBar.test.tsx`.
- [x] 6.7 Mutation (M8): `npx stryker run --mutate 'src/app/SettingsPage.tsx,src/app/AppShell.tsx,src/views/cards/CardsView.tsx,src/views/shared/LocationSearch.tsx,src/views/shared/AddLocationButton.tsx'`. Each file scores ≥ 95 % (minimum 90 %). Class strings that only E2E can check get a `// Stryker disable next-line StringLiteral` comment naming the covering scenario.

## 7. Unit BDD (vitest-cucumber; `.claude/rules/bdd-unit.md`)

Each feature implements the spec-delta scenarios of the same names, with `@add-settings-page-and-device-time-location @FR-X` tags and step files under `steps/`. Steps use real stores and in-memory repositories, not mocks.

- [x] 7.1 `test/features/settings/settings_preferences_unit.feature` + steps: "Default is System", "Default is 24-hour", "Opening writes nothing" (FR4, FR5, FR7). Every scenario that asserts token values ("Dark on a light system", "Light on a dark system", "System follows a change of the system preference", and "Choices survive a reload", which ends with the dark token values from the first render) is not here: jsdom applies no media queries and no CSS, so they live in task 8.2 only. Verify `npx vitest run src/test/features/settings`.
- [x] 7.2 `test/features/settings/settings_storage_unit.feature` + steps: "Corrupted preferences", "Reset", "Storage unavailable", "Another tab changes the hour format" (two providers over one `test/localStorageMock.ts` and `test/inMemoryChannel.ts`; the steps run the pending debounced write with `createManualWriteScheduler()` before they assert the stored document or the second tab) (FR7). Verify `npx vitest run src/test/features/settings`.
- [x] 7.3 `test/features/settings/settings_hour_format_unit.feature` + steps:
  - "Gap note in 12-hour format", "Time in the 12-hour format", "Hour labels in the 12-hour format", "Open the field in the 12-hour format" (FR5);
  - "Accepted 12-hour texts", "Rejected 12-hour texts", "The shown time is accepted unchanged" (FR6);
  - "Presenting again builds no formatter" and "Switching the hour format builds one formatter per zone and kind", which count with `startWorkCount()` from `test/workCounters.ts` and never time anything (NFR-P1, M7, ADR-0008).

  Verify `npx vitest run src/test/features/settings`.
- [x] 7.4 Replace the Here entry features (FR8–FR10, FR12–FR14):
  - delete `locations_here_entry_unit.feature`, `locations_here_entry_changes_unit.feature` and `locations_here_entry_data_unit.feature`, with their steps and `hereEntry*` helpers no longer used;
  - add `test/features/locations/locations_device_time_unit.feature` + steps: "Device time location on the design sample", "The device's city next to the device time location" (the `locations` "Location identity" scenario), "The device moves to another zone", "Unknown device time zone", "Same menu as a city card", "Remove the device time location", "Add it back", "Already listed", "Time selection from the device time location", "Derived city first, exemplar city after loading", "Loading fails", "No load without the device time location", "Renamed device time zone" (reuse `hereEntryEngineWorld.ts` renamed to `deviceTimeEngineWorld.ts`), "Both languages", "Presenting again builds no formatter" (work count);
  - add `test/features/home_location/home_location_device_time_unit.feature` + steps: "Make the device time location home", "Home follows the device", "Home survives a reload";
  - update in place, in `test/features/time_selection/time_selection_wall_time_input_unit.feature`, the scenarios "Type a time in the Here entry" and "A device time zone change ends the hint on the Here entry" to the givens of `specs/time-selection/spec.md` ("the list contains the device time location and Moscow", typed in the device time location), with tags `@add-settings-page-and-device-time-location @FR9` added; in `time_selection/steps/wallTimeWorld.tsx` and `time_selection/steps/time_selection_wall_time_input_unit.steps.tsx`, replace `WallTimeTargetKind.HERE_ENTRY` with a `LOCATION` target of `DEVICE_TIME_LOCATION_ID`.

  Verify, one at a time: `npx vitest run src/test/features/locations`, then `npx vitest run src/test/features/home_location`, then `npx vitest run src/test/features/time_selection`.
- [x] 7.5 `test/features/locations/locations_device_time_storage_unit.feature` + steps: "First launch", "Remove everything and reopen", "Version 2 document is migrated", "The device time zone is not stored", "Two device time locations", "Reset" (the first-launch list). Update `locations_migration_unit.feature` "Previous document version is migrated", and `locations_persistence.feature` "List survives a reload" and "Reset", to the new expected lists (FR12–FR14). Verify `npx vitest run src/test/features/locations`.
- [x] 7.6 `test/features/location_search/location_search_device_time.feature` + steps: "Offered after removal", "Matched by a word in either language", "Not matched", "Shown while the search data loads or failed", "Hidden while listed" (FR11). "Choose it" asserts the polite (`aria-live`) announcement, so it is in task 8.4, not here. Verify `npx vitest run src/test/features/location_search`.
- [x] 7.7 `test/features/main_page/main_page_states_unit.feature` + steps: "Empty list", "First launch" (device time location, no explanation), "No explanation with locations", "Add location from the empty state" (header button) (FR2, FR13). Verify `npx vitest run src/test/features/main_page`.
- [x] 7.8 Run `npx vitest run src/test/features` once, alone. Fix every remaining unit scenario that assumed an empty first launch: seed a stored `[]`, or expect the device time location. Do the same for the Here entry and the content-region Add location button.

## 8. Real browser (playwright-bdd; `.claude/rules/bdd-e2e.md`)

Accessible names, focus, keyboard, layout, colours and axe-core are asserted here, not in jsdom.

- [x] 8.1 `test/features/main_page/main_page_header_e2e.feature` + `steps/main_page_header_e2e.steps.ts`: "Narrow header", "Wide header" (bounding boxes order the controls; the "+" has no visible text), "The header opens the search and the settings", "Slash still opens the search", "Settings page shown" (the `location-search` scenario: `/` does not open the search on the settings page), "One Add location button", "No Add location button on an unreadable list", "Header sizes and accessibility" (375/1024 × light/dark, `@axe-core/playwright`) (FR1, FR2, NFR-A1, NFR-A2, NFR-A3, NFR-R1, UX1, M1). Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "@add-settings-page-and-device-time-location"`.
- [x] 8.2 `test/features/settings/settings_e2e.feature` + steps: "Open and leave settings", "Esc leaves settings", "Arrow keys change the theme", "Names and checked state", "Both languages" (the `settings` scenario: the heading and the radio group names in English and Russian, asserted by accessible name), "No violations" (light/dark, with and without the unreadable note), "Narrow and wide screens" (320/2560), "Approved screenshots" (375/1024 × light/dark, new baselines), and "Stored Dark on a light system". The last one has an `addInitScript` `MutationObserver` that records `document.documentElement.dataset.theme` when the `header` element is first inserted, and expects `dark`. Also the theme scenarios of the `settings` spec delta that need the browser's media queries, each driven by `page.emulateMedia({ colorScheme })` (as `app_shell_smoke_e2e.steps.ts` does) and asserting the computed `background-color` of `body` (`index.html` gives it `bg-background`) equals the light `--color-background` of `styles/tokens.css` (`#f7f7f5`, `rgb(247, 247, 245)`) or the dark one (`#0f1729`, `rgb(15, 23, 41)`), read in the steps from the `tokens.css` source, not from the page, so the check fails if the theme is not applied: "Dark on a light system" (emulate `light`, choose Dark), "Light on a dark system" (emulate `dark`, choose Light) and "System follows a change of the system preference" (System chosen, emulate `light`, then `emulateMedia({ colorScheme: "dark" })` without a reload) (FR3, FR4, NFR-A1–NFR-A3, NFR-R1, NFR-R3, UX2, M2, M6). Also "Switching to 12-hour" at a 1024 px viewport, since it asserts the hour labels shown on a wide page (FR5, UX5). Also "Choices survive a reload" with a reload, and "Offline reopen" with `context.setOffline(true)`. Approve the new "Approved screenshots" baselines once in Linux: `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "Approved screenshots" --update-snapshots`. Then verify with the command of 8.1, without `--update-snapshots`, and see it pass.
- [x] 8.3 `test/features/settings/settings_view_contract_e2e.feature` + steps, built like `home_location/home_location_view_contract_e2e.feature` and its `view_contract` fixtures, so it runs for every registered view: "Switch the hour format from the view", "Switch the theme from the view" (FR17). Verify with the command of 8.1.
- [x] 8.4 Replace the Here entry E2E features:
  - delete `locations_here_entry_e2e.feature` and its steps (`locations_here_entry_e2e.steps.ts`, `locations_here_entry_layout_e2e.steps.ts`, `hereEntryE2eHelpers.ts` where unused);
  - add `test/features/locations/locations_device_time_e2e.feature` + steps: "Name and list size", "No violations" (alone, above a list, as home; light/dark), "Narrow and wide screens", "The exemplar city keeps the height", "Reorder below a city" by pointer drag and by keyboard (M3), "Remove everything and reopen" (M4), and the `location-search` scenario "Choose it" (the search closes, the list is Moscow, the device time location, and the polite live region says the addition) (FR11);
  - add "Device time location under contract" to `locations/locations_view_contract_e2e.feature`;
  - update in place, in `locations/locations_ui_e2e.feature`, the `location-search` scenario "The Here entry's request is the only one" to the given "the list holds the device time location" (its step waits for the device time location to have loaded the zone cities data), with tags `@add-settings-page-and-device-time-location @NFR-P2` added (NFR-P2).

  Update `locationsSeedHelpers.ts` (the `HERE_ENTRY_*` helpers become device time seeds) (FR8, FR9, FR13, FR17, NFR-A1, NFR-A2, NFR-R1, UX3). Verify with the command of 8.1.
- [x] 8.5 `test/features/date_selection/date_selection_layout_e2e.feature` + steps:
  - "Bar on a narrow screen" now expects one centred group;
  - new "The group stays centred while the window is resized" at 320/375/767/768/1024/2560 px. The left and right free space of the group within the bar differ by ≤ 1 px, the next-day-to-Now gap equals the 375 px gap within 1 px, and the group is ≥ 8 px from each viewport side (FR15, NFR-R2, UX4, M5).

  Verify with the command of 8.1.
- [x] 8.6 Screenshots (NFR-R3, M6): in `locations/locations_ui_e2e.feature`, the outline "Screenshot of the <state> state at <width> px in the <theme> theme" replaces the states `here-entry` and `here-entry-travel` with `device-time` and `device-time-home`. It keeps `empty` with a stored `[]` and adds `first-launch`, tagged `@add-settings-page-and-device-time-location @NFR-R3`. Re-approve once in Linux: `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "Screenshot of the" --update-snapshots`. Then run the same command without `--update-snapshots` and see it pass. Delete the baselines of the removed states.
- [x] 8.7 Run `pnpm --filter @time-zones/client test:bdd` once, alone. Fix every remaining E2E step that assumed an empty first launch, the Here entry, the content-region Add location button or the old date bar layout.

## 9. Handoff patches (`.gnomish/stages/specify/handoff.md`)

- [x] 9.1 Handoff H1: write `openspec/changes/add-settings-page-and-device-time-location/handoff/H1-adr-device-time-location.patch` and its `## H1` section in `handoff/README.md`. The patch:
  - adds `docs/adr/0009-device-time-location.md` (Status: Accepted, `.claude/rules/adr.md` format). It states that the device time is a location kind of the list, stored as a kind without a zone, removable, reorderable, able to be home and offered in the search; that the first-launch list holds it; that it supersedes the "Here marker" Here-entry bullets and the "First launch" section of ADR-0007; and that the reference zone rule, the Here mark and "the device time zone is never stored" stay;
  - changes ADR-0007's status to add "Partly superseded by [ADR-0009](0009-device-time-location.md): the derived Here entry and First launch";
  - appends "0009 device time location" to the ADR list in `CLAUDE.md`.

  Verify from the repository root, one at a time: `git apply --check openspec/changes/add-settings-page-and-device-time-location/handoff/H1-adr-device-time-location.patch`, then `git status --short docs CLAUDE.md` prints nothing.
- [x] 9.2 Handoff H2: write `handoff/H2-glossary-and-architecture-docs.patch` and its `## H2` section. The patch edits:
  - `docs/glossary/locations.md`:
    - NEW **Device time location** (*Code:* `LocationKind.DEVICE_TIME`, `DEVICE_TIME_LOCATION_ID`, `ADD_DEVICE_TIME_LOCATION`; *RU:* «Время устройства»; *Never:* default location, auto-added location, Here entry);
    - NEW **First-launch list** (*Code:* `buildFirstLaunchLocations`);
    - REMOVED **Here entry**;
    - CHANGED **Location** (two kinds) and **Location list** (schema version 3, the first-launch list);
  - `docs/glossary/search.md`: NEW **Device time option** (*Code:* `isDeviceTimeOptionShown`; its labels: `presentDeviceTimeOptionLabels`);
  - new `docs/glossary/settings.md`: **Settings page** (`SettingsPage`, `AppPage.SETTINGS`, «Настройки»), **Settings button** (`SettingsButton`), **Preferences** (`Preferences`, `src/preferences/`, `PreferencesRepository`), **Theme preference** (`ThemePreference`, «Тема»: «Светлая», «Тёмная», «Системная»), **Hour format** (`HourFormat`, «Формат времени»: «12 часов», «24 часа»), and a row for it in `docs/glossary/README.md`;
  - `docs/glossary/architecture.md`: **Port**, **Repository** and **Tab sync** also cover the preferences (`createStorageDocumentSync`);
  - `docs/glossary/app-shell.md`: **Shell** holds the header actions;
  - `docs/glossary/views.md`: **View mode** stays *(planned in preferences)*;
  - `docs/architecture/views.md`: the Here entry building block becomes the device time location, the Settings row lists theme and hour format (language and view mode later), the empty-state row, the "first launch" paragraph, and "The theme follows the system" becomes "The theme follows the theme preference (System by default)";
  - `docs/architecture/domain-model.md`: `Location.kind`, `Preferences { theme, hourFormat: H12 | H24 }`, `ADD_DEVICE_TIME_LOCATION`, `SET_THEME`, `SET_HOUR_FORMAT`, and `getRows` without the derived entry;
  - `docs/architecture/overview.md`: `preferences/` exists.

  Verify from the repository root, one at a time: `git apply --check openspec/changes/add-settings-page-and-device-time-location/handoff/H2-glossary-and-architecture-docs.patch`, then `git status --short docs` prints nothing.

## 10. Final verification

- [x] 10.1 Traceability (M9): this loop, run from `packages/client/`, prints nothing.

  ```
  for id in FR1 FR2 FR3 FR4 FR5 FR6 FR7 FR8 FR9 FR10 FR11 FR12 FR13 FR14 FR15 FR16 FR17 NFR-P1 NFR-P2 NFR-A1 NFR-A2 NFR-A3 NFR-R1 NFR-R2 NFR-R3 UX1 UX2 UX3 UX4 UX5; do
    grep -rqE "add-settings-page-and-device-time-location.*(^|[^A-Za-z0-9-])@?$id([^0-9]|$)|(^|[^A-Za-z0-9-])@?$id([^0-9]|$).*add-settings-page-and-device-time-location" src || echo "missing $id"
  done
  ```
- [x] 10.2 Glossary check (`.claude/rules/glossary.md` review checklist): each of these prints nothing:
  - `grep -rniE "hereEntry|HereEntryRow|HERE_ENTRY|default location|auto-added" src --include=*.ts --include=*.tsx`;
  - `grep -n "локац" src/locales/ru.json`;
  - `grep -rn "justify-between" src/views/shared/DateBar.tsx`.
- [x] 10.3 Run each command alone, in this order: `pnpm --filter @time-zones/client typecheck`, `pnpm --filter @time-zones/client lint`, `pnpm --filter @time-zones/client test`, `pnpm run build`, then `pnpm --filter @time-zones/client check:bundle-size`. Then run `pnpm --filter @time-zones/client test:bdd` once, alone. Fix whatever fails.

## Human follow-up

The operator reviews these items on the pull request the deliver stage opens, then applies the patches.

- H1 (FR8, FR9, FR12): apply `handoff/H1-adr-device-time-location.patch`. It adds ADR-0009 (the device time location replaces the derived Here entry and the "nothing on first launch" rule), marks ADR-0007 as partly superseded, and lists ADR-0009 in `CLAUDE.md`.
  Why manual: the implement stage may not write `docs/adr/` or `CLAUDE.md`, and accepting an ADR that supersedes an Accepted one is a human decision.
  Automated part: `git apply --check` in task 9.1. The behaviour the ADR records is covered by the tests of groups 1, 4, 7 and 8.
- H2 (FR4, FR5, FR8, FR11, FR16): apply `handoff/H2-glossary-and-architecture-docs.patch`. It adds the glossary entries (device time location, first-launch list, device time option, settings page, settings button, preferences, theme preference, hour format), removes "Here entry", and aligns `docs/architecture/views.md`, `domain-model.md` and `overview.md`.
  Why manual: the implement stage writes only under `packages/` and the change's `handoff/` folder, and these documents live in `docs/`.
  Automated part: `git apply --check` in task 9.2, and the glossary grep of task 10.2 over the code.
