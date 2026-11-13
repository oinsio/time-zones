# Add the GeoNames city source to the search

No other change is active in `openspec/changes/`, so no other change touches the `location-search`, `locations` or `settings` capabilities this change modifies.

## Why

The search knows one city per time zone, about 400 exemplar cities. A user who types "Kazan", "Saint Petersburg", "San Francisco", "Munich" or "Mumbai" finds nothing and has to know that the zone is named after Moscow, Los Angeles, Berlin or Kolkata. ADR-0006 planned a richer city source behind the same port from the start; the zone rules work is done, so the search is now the weakest part of adding a location.

Audience: every user who adds a location, in English and in Russian.

## What Changes

- ADDED `city-data`: a compiled dataset of cities from GeoNames (CC BY 4.0) — every city with a population of at least 100 000 and every country capital, about 6 400 cities, each with its IANA zone, country, population and English and Russian names. A maintainer command compiles it; the result is committed, so the app build and CI never contact GeoNames. A check validates the committed dataset.
- MODIFIED `location-search`: the search offers these cities next to the zone cities. A zone may appear in the results several times, once per city; each city appears at most once. Results are ordered by match kind, popular locations, population, then name. A country query lists the zone cities of the country first, then its other cities. A result whose city has a namesake in the same country shows its region. The search data file grows from at most 30 KB to at most 130 KB gzipped.
- MODIFIED `locations`: the city label of a city location follows the interface language for any city record of its zone, not only for the zone's exemplar city.
- MODIFIED `settings`: the settings page shows the GeoNames attribution with a link, as the CC BY 4.0 licence requires.
- Unchanged: search by abbreviation, the suggestions, the device time option and the exemplar city of the device time location keep using the zone cities only. The stored location list keeps its format.
- Glossary (`docs/glossary/search.md`), new terms:
  - **GeoNames source** — the city source with the cities of the city data that are not zone cities.
  - **City data** — the compiled, committed dataset behind the city sources (zone cities and GeoNames cities), served as one search data file.
  - **Population** — the number of inhabitants of a city record; orders results after popularity.
  - **Namesake** — a city record that shares a name, in English or Russian, and a country with another city record.
  - **Region** — the first-level administrative division of a namesake (`Illinois`), shown in its search result. *RU:* shown as a value only, no label.
- Glossary, changed terms: **City record** (its ID is unique per city, it carries the population, the region is present for namesakes only), **Zone cities source** (unchanged meaning; its records are the zone cities), **Search result** (may show a region), **City label** in `docs/glossary/locations.md` (any city record of the zone). The abbreviations table gains GeoNames.
- New ADR-0015 records the long-lived decisions: city data comes from GeoNames, is compiled offline and committed; the composite adapter removes duplicates by city (record ID) instead of by zone and name, and orders by population after popularity. ADR-0006 stays accepted and gets a status note pointing at ADR-0015 for these two refinements of its "Composite adapter" section; its "later" source is the one this change adds. The ADR files, the ADR list in `CLAUDE.md`, the CI step and the root README credit are delivered as handoff patches (`tasks.md`, Human follow-up).

## Capabilities

### New Capabilities

- `city-data`: which cities the compiled dataset holds, how they are named, which zones and regions they carry, and how the dataset is compiled and checked.

### Modified Capabilities

- `location-search`: MODIFIED "Search by country", "Result order and content", "Search is fast and lazy"; ADDED "Search finds GeoNames cities", "Region of a namesake", "Cities offered come from the release", "Namesakes in one zone are one location", "Region in results is accessible and fits".
- `locations`: MODIFIED "City label in the interface language".
- `settings`: ADDED "City data attribution", "Accessible and responsive attribution".

## Impact

- `packages/client/scripts/cityData/` (new: download, compile, check; their tests under `src/test/cityData/`), `packages/client/city-data/` (new: the committed dataset and its README), `packages/client/package.json` scripts, `.github/workflows/ci.yml` (the check, by handoff patch).
- `scripts/zoneData/zoneDataPlugin.ts` (serves the merged search data file), `scripts/check-bundle-size.mjs` and `app.config.ts` (the new budget).
- `src/ports/citySearch.ts` (`CityRecord`), `src/adapters/city-search/` (new GeoNames source, composite adapter, data parsing), `src/lib/searchText/` (search text normalization, moved from `src/adapters/city-search/` so the scripts can load it), `src/presenter/presentSearchResults.ts`, `src/views/shared/LocationSearchResults.tsx`, `src/app/settings/` (attribution), `src/constants/`, `src/locales/en.json` and `ru.json`.
- Features under `src/test/features/location_search/`, `locations/`, `settings/`, the search benchmark, approved search and settings screenshots.
- `docs/glossary/search.md`, `docs/glossary/locations.md`, `docs/glossary/README.md`, `docs/architecture/domain-model.md`, `docs/architecture/overview.md`; by handoff patch: `docs/adr/0015-city-data-from-geonames.md`, a status note in `docs/adr/0006-city-data-sources.md`, the ADR list in `CLAUDE.md`, `README.md` and `README.ru.md` (data credit).
- No new runtime dependency, no new port, no new storage key, no change of the stored location list. The compile command needs the system `unzip` and about 250 MB of temporary disk space; the build does not.

## Goals

- G1: A user finds a city of at least 100 000 inhabitants or a capital by typing its name in English or Russian.
- G2: Results put the most likely city first: popular locations, then the largest cities.
- G3: Two results with the same city name can be told apart before one is chosen.
- G4: The app stays offline-first and fast: one lazy data file within a fixed size budget, nothing added to the initial JavaScript.
- G5: Refreshing the city data is one maintainer command and one reviewable commit.

## Non-Goals

- NG1: Cities below 100 000 inhabitants that are neither capitals nor zone cities (a second, larger lazy source may follow in another change).
- NG2: Fuzzy matching, typo tolerance, transliteration search or search by region name.
- NG3: City names in languages other than English and Russian.
- NG4: Storing the region or a GeoNames ID in a location; the location ID stays the zone plus the label, so namesakes in one zone are one location.
- NG5: Changing the suggestions, search by abbreviation, the device time option or the exemplar city of the device time location.
- NG6: A scheduled workflow that refreshes the city data; the refresh is manual.
- NG7: Finding the zone of the device from its coordinates.

## Users & Scenarios

- U1: A user in Russian types «Казань» and adds Kazan; the row shows Moscow time under the label «Казань».
- U2: A user types "San" and sees the largest cities first instead of an alphabetical list of zone cities.
- U3: A user types "Springfield" and sees three results in the United States, told apart by "Massachusetts", "Missouri" and "Illinois".
- U4: A user types "Russia" and still sees one result per zone of Russia first, then other Russian cities.
- U5: A user added Kazan in Russian and switches the interface to English; the row reads "Kazan".
- U6: A user opens the settings and sees where the city data comes from.
- U7: A maintainer runs the compile command, reviews the diff of the dataset and commits it; CI checks the committed file without network access to GeoNames.

## Requirements

### Functional

- FR1: The city data SHALL hold every GeoNames city with a population of at least 100 000 and every country capital, each with a GeoNames ID, a canonical IANA zone, an ISO 3166-1 country code and a population. A city that is the exemplar city of its zone SHALL be one record, the zone city, not two.
- FR2: Every city of the city data SHALL have an English and a Russian name. A city without a Russian name in GeoNames SHALL use its English name as the Russian one.
- FR3: The search SHALL match the cities of the city data by name exactly as it matches zone cities: by the start of the name or of any word of it, in English and Russian whatever the interface language, with the existing query normalization.
- FR4: Each city SHALL appear at most once in the results; a zone MAY appear once per matching city. At most 50 results are shown.
- FR5: Results SHALL be ordered by match kind, then popular locations first, then larger population first, then alphabetically by city name in the interface language.
- FR6: A country query SHALL match every city of that country; among results matched by country, the zone cities SHALL come before the other cities.
- FR7: A namesake's result SHALL show its region before the country, in the interface language with English as the fallback. A result that is not a namesake SHALL show no region.
- FR8: Choosing a city SHALL add a location with the city's zone, its name in the interface language as the city label and its country. A result SHALL be marked as added when the list has a location with its zone and one of its names; namesakes in one zone are therefore one location.
- FR9: The city label of a city location SHALL follow the interface language when the stored label is a name of any city record of the location's zone.
- FR10: Search by abbreviation, the suggestions, the device time option and the exemplar city of a zone SHALL keep using the zone cities only.
- FR11: Every zone of the city data SHALL be a canonical zone ID of the bundled zone rules release. The search SHALL offer a city only while its zone is in the installed zone rules release.
- FR12: The city data SHALL be compiled from the GeoNames dumps by one maintainer command into a committed file that records the date of the dump. The app build, the tests and CI SHALL NOT contact GeoNames. A check command, run in CI, SHALL fail when the committed file breaks FR1, FR2, FR11, its format or its size budget.
- FR13: The settings page SHALL show the attribution "City data: GeoNames, CC BY 4.0" with a link to GeoNames, in English and Russian; the repository SHALL credit GeoNames and the licence next to the committed dataset and in the README.
- FR14: The loading, error, retry and offline states of the search data SHALL stay as they are: one data file, one request.

### Non-Functional

#### Performance

- NFR-P1: The search data SHALL be one separate file of at most 130 KB gzipped, not part of the initial JavaScript and not preloaded; the initial JavaScript stays at most 150 KB gzipped.
- NFR-P2: One non-empty query over the full data SHALL normalize exactly one text, the query, build at most one collator and build no country-name formatter. Preparing the data for search SHALL build at most one country-name formatter per city-name language.
- NFR-P3: Loading the search data for city labels or the exemplar city, without a query, SHALL normalize no text. Asking for one city label SHALL NOT scan every city record.
- NFR-P4: One query over the full data SHALL take at most 50 ms in the timing benchmark, which is reported and does not block the pull request (ADR-0008).

#### Accessibility

- NFR-A1: The accessible name of a result with a region SHALL contain the region. The results with regions SHALL have no axe-core violations in the light and dark themes.
- NFR-A2: The attribution link SHALL be a link named by its visible text, reachable with Tab, at least 44 px high, with a visible focus outline and a contrast of at least 4.5:1 in both themes; the settings page with it SHALL have no axe-core violations.

#### Responsive

- NFR-R1: Results with a region SHALL NOT cause horizontal scrolling from 320 px to 2560 px; a long region and country line wraps. The results for "Springfield" SHALL match approved screenshots at 375 px and 1024 px in both themes.
- NFR-R2: The settings page with the attribution SHALL NOT scroll horizontally at 320 px and 2560 px in English and Russian; the approved settings screenshots are re-approved once.

## UX Acceptance Criteria

- UX1: Namesakes are told apart at a glance: the region stands before the country on the secondary line, "Illinois, United States".
- UX2: Results without a namesake look exactly as today: city, country, no region.
- UX3: For a short query the cities a user most likely means come first: popular locations, then the largest cities.
- UX4: The attribution is quiet: one small line at the end of the settings page, below every settings group.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| online | search data not loaded yet (loading) | the loading placeholder; the device time option when offered — as today |
| online | search data loaded | suggestions for an empty query; zone cities and GeoNames cities for a query |
| online or offline | query matches nothing (empty) | the no-results message and hint — as today |
| online | search data failed to load (error) | the error message with retry — as today; retry loads the one file again |
| offline | visited before, file cached by the service worker | search works over all cities |
| offline | never loaded (first visit offline) | the error message with retry — as today |
| any | list holds a GeoNames city, data not loaded or failed | the row shows the stored label, no error |

## Behavior

- `packages/client/src/test/features/location_search/location_search_by_name.feature`, `location_search_by_country.feature`, `location_search_ranking.feature`, `location_search_performance.feature` and new `location_search_namesakes.feature`, `location_search_namesakes_e2e.feature` — scenarios tagged `@add-geonames-city-source`.
- `packages/client/src/test/features/locations/` city label features — scenarios tagged `@add-geonames-city-source`.
- `packages/client/src/test/features/settings/` new `settings_city_data_attribution_e2e.feature` — scenarios tagged `@add-geonames-city-source`.

## Visual Reference

No Figma frame for the region or the attribution. The existing search result row and the settings page are the reference; design tokens are the source of truth.

## Affected IA

No changes.

## Success Metrics

- M1: The committed city data holds at least 6 000 cities that are not zone cities (6 368 cities met the rule in the dump of 2026-11-13).
- M2: The built search data file is at most 130 KB gzipped (measured estimate 116 KB) and the initial JavaScript stays at most 150 KB gzipped.
- M3: 10 of 10 cities that the search does not find today are found in English and in Russian: Kazan, Saint Petersburg, Barcelona, San Francisco, Boston, Munich, Osaka, Mumbai, Rio de Janeiro, Milan.
- M4: 100% of the cities of the committed city data have a zone of the bundled zone rules release, and at least 95% have a Russian name written in Cyrillic.
- M5: 0 pairs of results with the same visible city, region and country text among the top 50 results of the 10 sample queries.
- M6: 0 axe-core violations in the results with regions and on the settings page, in 2 themes.
- M7: Mutation score ≥ 95% (minimum acceptable 90%) on the new and changed production files of `src/adapters/city-search/`, `src/presenter/presentSearchResults.ts` and `scripts/cityData/`.

## Open Questions

None. Decided here and in the design: the attribution stands at the end of the settings page (UX4, D10); namesakes in one zone are one location (NG4, FR8); the region is shown for namesakes only (FR7, D4).
