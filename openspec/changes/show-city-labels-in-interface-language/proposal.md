# Show city labels in the interface language

No other active change touches the capabilities this change modifies: the only one, `add-pr-preview-deploy`, changes delivery, not `locations`, `location-search`, `settings` or `app-shell`.

## Why

A city location keeps the city label it was added with, in the interface language of that moment. A user who adds Tokyo with the Russian interface sees «Токио». After switching to English, the row still reads «Токио». Removing Tokyo and adding it again gives "Tokyo", and that row then stays "Tokyo" after switching back to Russian. The rule comes from `add-interface-language-selection` (its FR5: "a city location keeps the city label it was added with"). Today `presentLocationRows` shows the stored `label` of every city location. The language switch therefore looks broken for exactly the part of the screen the user reads most. Audience: every user who switches the interface language, or who opens the app in another language than the one they added places in (for example after the browser language changed).

The task also asks for an audit of everything else that may stay in the old language after a switch. Its result:

- **Follow the switch already:** interface texts (i18next, with the dialect fallback), country names, dates, weekdays and months, search results, the exemplar city of the device time location, `<html lang>` and the document title.
- **Gap 1, the bug above:** the city label of city locations. It also feeds every text that names the row's city: the location menu name, the time button name, and the removal, home and reorder announcements.
- **Gap 2:** every `Intl` formatter gets the interface language code itself (`presentCountryName`, `getDateTimeFormatter`, `presentDateBar`, `presentCalendarMonth`). For a dialect or easter egg whose code `Intl` does not know, `Intl` falls back to the device's own locale, not to the dialect's base language and then English. That breaks the dialect fallback the `app-shell` capability requires.

## What Changes

- MODIFIED `locations`: a city location's row shows its city label in the interface language. The label comes from the zone cities data in the city-name language of the interface language (the dialect, its base language, then English). It is used when the stored label is one of the names of the zone's city record. Otherwise the row shows the stored label. Switching the language re-labels every row at once. The stored list, the location ID, the order and the home location do not change.
- MODIFIED `locations`: the zone cities data is loaded in the background whenever the list holds at least one location, not only the device time location. Until it is loaded, or when loading fails, a city location shows its stored label, with no error.
- MODIFIED `location-search`: the laziness rule of the search data follows. While the list is empty, the data is requested only when the search first opens. While the list holds a location, the page may request it once in the background, and the search reuses it.
- MODIFIED `settings`: the "Choosing Russian applies at once" scenario now expects Almaty to read «Алматы» after the switch. The language choice now covers the city labels of city locations too.
- MODIFIED `app-shell`: the dialect fallback also covers `Intl`-formatted data (dates, weekdays, months, country names). They are formatted with the fallback order as the locale list, so they never fall back to the device's locale.
- Glossary:
  - **City label** (`docs/glossary/locations.md`) changes meaning: it is stored as added, and shown in the interface language when the zone cities data names it.
  - **Interface language** (`settings.md`) adds city labels to the texts it governs.
  - **Dialect** (`settings.md`) adds `Intl` formatting to the fallback order.
  - **Exemplar city** (`search.md`) gets the new owner `CitySearch.getCityLabel`.
  - `docs/architecture/domain-model.md` notes that `label` is stored as added and shown in the interface language.
- No new interface strings and no change of the stored document.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `locations`: MODIFIED "List in the Cards view" and "Exemplar city of the device time location"; ADDED "City label in the interface language" and "City labels are fast".
- `location-search`: MODIFIED "Search is fast and lazy" and "Open the search with the slash key".
- `settings`: MODIFIED "Interface language choice".
- `app-shell`: MODIFIED "Dialect fallback".

## Goals

- G1: After any language switch, 100 % of listed city locations whose stored label is a name of their zone's city record show that zone's city name in the new language, with no reload and no remove-and-add.
- G2: A dialect or easter egg reads every city label, date and country name in its base language, then English, never in the device's own locale.
- G3: The stored location list stays byte-for-byte unchanged by a language switch: no migration and no write.

## Non-Goals

- NG1: No city names for languages other than English and Russian (`CITY_NAME_LANGUAGES` stays `en`, `ru`).
- NG2: No change of the stored location document, the location ID or the duplicate rule. Two stored locations of one zone with labels in different languages (possible only in documents written before the search marked a zone added in either language) stay two rows and may show the same name.
- NG3: Polite announcements already spoken are not repeated in the new language.
- NG4: The installed PWA's name and the manifest stay as built. The platform reads them at install time, and the app cannot switch them.
- NG5: No new interface translation, no layout change, no new screen.
- NG6: Custom labels that the zone cities data does not know (none can be entered today) are shown as stored and not translated.

## Users & Scenarios

- U1: A Russian-speaking user adds Tokyo with the Russian interface and sees «Токио». They switch to English and the row reads "Tokyo". They switch back and it reads «Токио» again.
- U2: A user with an English browser added places in Russian, then opens the app after their browser language changed to English. After a short moment the rows read in English. The page shows the stored names until the data arrives, with no error.
- U3: A user of an easter-egg dialect based on Russian sees «Токио», «Казахстан» and Russian weekdays, even though `Intl` does not know the dialect's code.
- U4: A screen reader user hears "Actions for Tokyo" on the location menu after switching to English.

## Requirements

### Functional

- FR1: A city location's row SHALL show as its city label the name of its zone's city record in the city-name language of the interface language, when the stored label is one of that record's names in any city-name language. Otherwise the row shows the stored label. The city-name language follows the dialect fallback: the interface language, its base language, then English.
- FR2: Switching the interface language SHALL change the city label of every listed city location at once, without a reload and without a loading state. The stored list, each location ID, the order and the home location stay unchanged, and nothing is written to storage.
- FR3: Every text that names a row's city SHALL use the city label of FR1: the location menu name, the time button and field name, and the removal, home and reorder announcements.
- FR4: The zone cities data SHALL be loaded in the background after the first render while the list holds at least one location of any kind. Showing the rows never waits for it. Until it is loaded, or when loading fails, a city location shows its stored label, with no error and no retry. The page requests the data at most once while no load fails, and the search reuses it. While the list is empty, the data is requested only when the search first opens.
- FR5: Dates, weekdays, months and country names formatted through `Intl` SHALL use the fallback order of the interface language (the language, its base language, English) as their locale list. A dialect whose code `Intl` does not support is then formatted in its base language, or else in English, never in the device's own locale.

### Non-Functional

#### Performance

- NFR-P1: Presenting 50 rows again for the next minute tick, with an unchanged list, language and zone cities data, SHALL ask the city search for 0 city labels and build 0 formatters. A language switch asks for at most one city label per city location. These bounds are counted, never timed (ADR-0008).

#### Accessibility

- NFR-A1: After a language switch, the location menu button of a city location SHALL be named with the new city label ("Actions for Tokyo", «Действия: Токио»). axe-core SHALL report no violations on the main page after the switch, in the light and the dark theme.

#### Responsive

None. The row layout does not change (NG5), and the existing layout scenarios keep covering city labels of any length.

## UX Acceptance Criteria

- UX1: A row whose stored label is already in the interface language never changes visibly when the data arrives. A row in another language changes at most once, from the stored label to the localized one.
- UX2: A language switch shows no loading state and no flash of the old city label once the data is loaded.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| online or offline | list empty | empty state (existing); zone cities data not requested before the search opens |
| online or offline | zone cities data loading | city locations show their stored labels; no spinner, no error |
| online or offline | zone cities data loaded | city locations show their city labels in the interface language |
| offline, data cached by the service worker | loaded from the cache | as loaded |
| offline, data not cached, or load fails | load error | stored labels stay; no error shown; the search keeps its own error state with Retry (existing) |
| online or offline | stored list unreadable | load error with Reset (existing); no city labels are shown |

## Behavior

- `packages/client/src/test/features/locations/locations_city_label_language_unit.feature`: re-labelling on a switch, the stored-label fallbacks, the load rule, storage unchanged, the dialect (`@show-city-labels-in-interface-language`).
- `packages/client/src/test/features/locations/locations_city_label_budget_unit.feature`: the counted bounds of NFR-P1.
- `packages/client/src/test/features/locations/locations_city_label_language_e2e.feature`: switching in a real browser, the accessible names and axe-core.
- `packages/client/src/test/features/app_shell/app_shell_interface_language_unit.feature`: the `Intl` dialect fallback (FR5).

## Visual Reference

No Figma frame and no visual change. The existing approved screenshots stay valid.

## Affected IA

No changes: `docs/ia/` does not exist.

## Success Metrics

- M1: With Tokyo added in Russian, 2 of 2 switches relabel the row: English shows "Tokyo", and Russian again shows «Токио». The stored document is identical before and after both switches (unit BDD and E2E).
- M2: With the list holding Tokyo, the page requests the zone cities data exactly 1 time across the first render and a later opening of the search. With an empty list it requests it 0 times before the search opens (E2E).
- M3: A minute-tick re-presentation of 50 city rows makes 0 city-label lookups and builds 0 formatters. A language switch makes at most 50 lookups (unit BDD).
- M4: For a dialect fixture with a code `Intl` does not support and the base language `ru`, 3 of 3 outputs equal the Russian output: the country name of `KZ`, the local date of a row and the date bar weekday (unit tests).
- M5: axe-core reports 0 violations on the main page after a switch, in 2 of 2 themes (E2E).
- M6: Stryker scores at least 95 % (minimum acceptable 90 %) on each production file this change adds logic to (task 8.1 lists them).

## Open Questions

None. The choice between localizing at presentation time and storing names per language is decided in `design.md` (D1).

## Impact

- Code under `packages/client/src/`:
  - `ports/citySearch.ts`: the new `getCityLabel` method and the shared name check;
  - `adapters/city-search/createCompositeCitySearch.ts`;
  - `controller/`: the new `useCityLabels` hook and `useLocations`;
  - `presenter/`: `presentLocationRows`, `presentSearchResults`, and the `Intl` call points in `countryName.ts`, `dateTimeFormatters.ts`, `dateBar.ts`, `calendarMonth.ts`;
  - the feature files, steps and tests named in `tasks.md`.
- Docs: `docs/glossary/locations.md`, `docs/glossary/settings.md`, `docs/glossary/search.md`, `docs/architecture/domain-model.md`.
- No dependency, storage schema or locale file changes.
