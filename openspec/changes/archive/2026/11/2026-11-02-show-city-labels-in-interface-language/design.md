# Design: Show city labels in the interface language

## Context

Driven by FR1–FR5 and NFR-P1 of the proposal. What the code does today:

- `Location.label` (`model/locations.ts`) is set from `command.label` on `ADD_LOCATION`. `LocationSearch.tsx` passes `result.cityName`, which is `record.names[cityNameLanguage]` at the moment of the add. The label is also part of the location ID (`buildLocationId(timeZoneId, label)`), the stored document (`adapters/locationsDocument.ts`) and the duplicate rule.
- `presentLocationRows` uses `location.label` as `cityLabel` for every city location. Every view text that names the city reads `row.cityLabel`: `LocationRow.tsx`, `ZoneRowContent.tsx`, `useReorderAnnouncements.ts`, the removal and home announcements in `CardsView.tsx`, and `wallTimeInputLabel` in `presentZoneMoment.ts`.
- The zone cities source builds one `CityRecord` per canonical zone (`id === timeZoneId`), with `names` for every `CITY_NAME_LANGUAGES` entry (`en`, `ru`). `parseZoneCityRecords` rejects a record without both, and the build falls back to the English name when CLDR has no Russian one.
- `presentSearchResults` already treats a location as "this record's city" when its zone matches and `Object.values(record.names).includes(location.label)`.
- `resolveCityNameLanguage(code)` (`locales/languageFallbacks.ts`) maps an interface language to its city-name language along `resolveLanguageFallbacks(code)`: the code, its base language, English. `useActiveInterfaceLanguage()` exposes it as `cityNameLanguage`.
- The data is loaded through `loadCitySearchOnce` / `readLoadedCitySearch` (`controller/cityDataCache.ts`). Today only `useExemplarCity` (while the device time location is listed) and `useCitySearch` (while the search is open) start a load.
- `Intl` receives the interface language code itself in `presentCountryName` (`new Intl.DisplayNames(language, …)`), `getDateTimeFormatter` (`new Intl.DateTimeFormat(language, …)`), `presentDateBar` (three `toLocaleString(language, …)`) and `presentCalendarMonth` (four `toLocaleString(language, …)`). For a code with no `Intl` data, `Intl` resolves to the host's default locale.

ADRs that bind: ADR-0002 (the presenter alone localizes, the controller alone reaches ports), ADR-0004 (a stored-schema change needs a migration), ADR-0006 (`CitySearch` port, one record per zone today, richer sources later), ADR-0008 (budgets are counted), ADR-0009 (iOS Safari 12: `Intl` locale lists are ES Intl 1.0 and supported there; `Intl.DisplayNames` stays guarded as today).

## Goals / Non-Goals

**Goals:** the proposal's G1–G3. Localize at presentation, keep one owner per concept, add no stored field.

**Non-Goals:** the proposal's NG1–NG6. Also no change to `useExemplarCity`'s behaviour or the search's own states.

## Decision

### D1. Localize at presentation time; keep the stored label (FR1, FR2, G3)

The stored `label` stays as added and is still the identity (ID, duplicate rule, `isAdded`). The row's `cityLabel` is derived on every presentation from the zone cities data and the active city-name language.

Alternatives considered:

- **Rewrite the stored labels on a language switch.** Rejected. The ID contains the label, so a rewrite changes every ID and the home location ID. It writes on every switch and races other tabs (ADR-0004, last write wins).
- **Store every name at add time (`labels: { en, ru }`).** Rejected. It needs schema version 4 and a migration (ADR-0004). Existing version 3 documents still hold one name, so the migration would need the city data, which a pure migration cannot read. It also duplicates data the city source already owns.

### D2. One owner of "this label names this record", and `CitySearch.getCityLabel` (FR1)

- `ports/citySearch.ts` gets a pure function next to `CityRecord`, exported through `ports/index.ts`:
  `isCityNameOfRecord(record: CityRecord, label: string): boolean`, true when `label` is one of `record.names`' values.
  `presentSearchResults`' `isAdded` switches to it (same behaviour), so the rule has one home. It lives in `ports` because both the presenter and the adapters may import `@/ports`, while the presenter must not import `@/adapters`.
- The `CitySearch` port gets
  `getCityLabel(timeZoneId: string, storedLabel: string, language: CityNameLanguage): string`.
  `createCompositeCitySearch` looks the record up in its existing `recordsById` map, which is keyed by the canonical zone ID like `Location.timeZoneId`. It returns `record.names[language]` when `isCityNameOfRecord(record, storedLabel)`, else `storedLabel`. It is O(1) per call. With future sources (ADR-0006), a non-exemplar city simply returns its stored label until such a source supplies names (NG6).
- `createCompositeCitySearch` is the only `CitySearch` implementation. The shared contract `adapters/city-search/citySearch.contract.ts` (`describeCitySearchContract`, run by `createCompositeCitySearch.exemplarCity.test.ts`) gets the `getCityLabel` cases, so a future adapter inherits them (ADR-0006).

### D3. Controller hook `useCityLabels` (FR1, FR2, FR4, NFR-P1)

`controller/useCityLabels.ts`:
`useCityLabels(locations: readonly Location[], load: LoadCitySearch): ReadonlyMap<string, string> | undefined`.

- It mirrors `useExemplarCity`. It reads `readLoadedCitySearch(load)` on the first render. After the first render, it starts `loadCitySearchOnce(load)` in an effect when `locations` holds at least one location of `LocationKind.CITY`. The effect depends on `[hasCityLocation, load]`, a boolean computed from `locations`, not on `locations` itself: `loadCitySearchOnce` drops a rejected load, so an effect over the list would request again on every removal or reorder. A rejection is swallowed: no error state, no retry (opening the search still retries through `useCitySearch`, as today).
- It returns `undefined` until the search is loaded. After that it returns a map from location ID to `getCityLabel(location.timeZoneId, location.label, cityNameLanguage)`, built in a `useMemo` over `[locations, cityNameLanguage, loadedSearch]`. A minute tick changes none of these, so it does no lookup (NFR-P1). A language switch does one lookup per city location.
- `useLocations` calls it with `rest.loadCitySearch` and puts the map into the rows context. The existing `useExemplarCity` keeps its own trigger (the device time location). Together the two triggers load the data whenever the list holds any location (FR4). Both go through `loadCitySearchOnce`, so one request is shared with the search.

### D4. Presenter reads the map (FR1, FR3)

- `LocationRowsContext` (`presenter/presentZoneMoment.ts`) gets `cityLabels?: ReadonlyMap<string, string>`.
- `presentLocationRows` sets `cityLabel` of a city location to `context.cityLabels?.get(location.id) ?? location.label`. It already passes `cityLabel` to `presentZoneMoment` and returns it on the row, so every text listed in FR3 follows with no view change.
- `useLocations` adds `cityLabels` to its `useMemo` dependencies.

### D5. `Intl` gets the fallback order as its locale list (FR5)

At each of the call points listed in Context, the locale argument becomes `[...resolveLanguageFallbacks(language)]`. This is a mutable `string[]`, assignable both to the `string | string[]` parameters of the ES5 lib and to `Intl.LocalesArgument` of `ES2020`/`ES2022.Intl` and `temporal-polyfill`. No new owner: `resolveLanguageFallbacks` already owns the order (glossary **Dialect**).

The caches keep their keys (`displayNamesByLanguage` by code, `formattersByKey` with the code). The list is computed only on a cache miss in `countryName.ts` and `dateTimeFormatters.ts`, so NFR-P1 of `add-interface-language-selection` keeps holding. For `en`, `ru` and `ru-KZ` the output is unchanged, because `Intl` picks the first supported entry.

Test fixture: no real dialect exists, and the registry is built from `import.meta.glob`, so a fixture locale cannot be added without shipping it. The `Intl` tests therefore replace `@/locales/localeRegistry`'s `localeRegistry` with `vi.mock` (keeping the real `buildLocaleRegistry`). They add a `tlh` locale with base language `ru` built by `buildRegisteredLocale` from `test/factories/localeFixtures.ts`. Their first assertion is the precondition `Intl.DateTimeFormat.supportedLocalesOf(["tlh"])` is empty. This mock lives in its own feature file and steps file (`app_shell_dialect_intl_unit.feature`), so no other scenario sees the extra locale.

### D6. Tests that encoded the old rules

These change in this change, each tagged also with `@show-city-labels-in-interface-language`:

- `locations_device_time_data_unit.feature` "No load without the device time location": Given the stored list is empty.
- `locations_ui_e2e.feature` "Data loads only when the search opens" and `locations_search_shortcut_e2e.feature` "The slash key loads the search data only when it opens the search": use the existing `Given the stored list is empty` step (`locations_view_contract_e2e.steps.ts`).
- `settings_language_unit.feature` "Choosing Russian applies at once": the step reads `after going back Almaty reads «Алматы» and shows the country «Казахстан»`.

Five more scenarios store a label in another language than the interface, let the zone cities data load (FR4), and then find a row by its stored label. Under FR1 the row then reads the localized name, so they would fail, and the E2E ones would race the load. Each is rewritten to the FR1 rule, tagged also `@FR1`, and never fixed in the code:

- E2E, the stored label becomes the label in the scenario's interface language, so no row changes when the data arrives (UX1): `home_location_e2e.feature` "Russian interface" ("Алматы", "Москва", the menu «Действия: Москва», the row of «Алматы»); `locations_clock_change_note_e2e.feature` "No horizontal scrolling with notes at <width> px at <moment>" («Алматы», «Белград», «Остров Лорд-Хау», and the same in the `city` column); `time_selection_card_layout_e2e.feature` "Hour labels on one line in Russian" («Москва», «Калькутта»); `locations_device_time_e2e.feature` "The exemplar city keeps the height at <width> px" («Москва», with the two card lookups of its steps using a constant for «Москва»; the English scenario keeps `MOSCOW`).
- Unit: `locations_device_time_unit.feature` "Device time location on the design sample" loads the real zone cities data before its check, so it expects the localized names in its offset differences (the `names.ru` of the Moscow, Kolkata and New York records).

`KNOWN_CITIES` of `locationsE2eHelpers.ts` gets «Алматы» and «Калькутта». Each Russian entry used is checked against the `names.ru` of its zone's record in `virtual:zone-cities`; an entry that is none of the record's names would keep the row stable but no longer exercise FR1.

## Consequences

Positive:

- The stored document, IDs and migrations are untouched; a switch is pure presentation.
- One owner per concept: `isCityNameOfRecord` for "this label names this record", `getCityLabel` for the localized name, `resolveLanguageFallbacks` for the order.

Negative (risks and trade-offs):

- [Every non-empty list now fetches the zone cities data once per page load] → The file is at most 30 KB gzipped, loaded after the first render. The service worker precaches it (`globPatterns` includes `json` in `vite.config.ts`), so offline it comes from the cache. The search then opens without a loading state.
- [A row in another language than the interface shows its stored label for a moment after start] → At most one visible change per row (UX1). Rows already in the interface language do not change.
- [Two legacy locations of one zone with labels in different languages show the same name] → Accepted (NG2). The search already marks a zone as added in either language, so the UI cannot create this.
- [`vi.mock` of the locale registry in one steps file] → Limited to one file. It replaces only the registry data, and every module under test is real.

## Alternatives Considered

**Rewrite the stored labels on a language switch**: rejected in D1; it changes IDs and the home ID, and it writes on every switch.

**Store every name at add time**: rejected in D1; it needs a schema version and a migration that cannot read the city data.

**Pass the fallback list through every presenter context instead of the four `Intl` call points**: rejected. It changes the type of `language` in every context and cache key for the same result.

**Translate only on a switch inside the session**: rejected. A reload in another language (U2) would keep the old names.
