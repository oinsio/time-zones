# Design: Add the GeoNames city source to the search

## Context

See `proposal.md` for the motivation. The current state that shapes the approach:

- The search goes through the `CitySearch` port; `createCompositeCitySearch` combines the zone cities source and the abbreviation source (ADR-0006). `CityRecord.id` equals the zone ID, results are reduced to one per zone (`keepFirstResultPerZone`), and `getCityLabel` / `getExemplarCity` look a record up by zone.
- The zone cities are extracted from CLDR at build time by `scripts/zoneData/zoneDataPlugin.ts` and emitted as one asset, `city-search-*.json` (43 KB raw, budget 30 KB gzipped). `createFetchCitySearchLoader` fetches and validates it; `cityDataCache` shares one load between the search, the city labels and the exemplar city.
- The file is requested when the search opens, or once in the background while the list holds a location (city labels, exemplar city).
- Measured on the GeoNames dump of 2026-11-13: 6 368 cities with a population ≥ 100 000 or capitals, 335 zones, about 118 namesake records; names in English and Russian for all of them gzip to about 116 KB.
- Glossary owners touched: **City search** (`CitySearch`, `useCitySearch`), **City source** (`CitySource`), **City record** (`CityRecord`), **Zone cities source** (`createZoneCitiesSource`), **Exemplar city** (`getExemplarCity`), **City label** (`getCityLabel`, `isCityNameOfRecord`, `useCityLabels`), **Search result** (`PresentedSearchResult`, `presentSearchResults`), country name (`presentCountryName`), time zone ID (`canonicalizeTimeZoneId`), **Settings page** and **Deploy time** (the attribution now follows the release line). Each is extended in place; no concept gets a second owner. New term: **City data attribution** (`CityDataAttribution`, D10) in `docs/glossary/settings.md`.
- ADR-0006 (Accepted) says the composite adapter "removes duplicates by canonical `timeZoneId` and name" and "ranks by match quality, then by `rank`". With per-city records, two namesakes in one zone (Springfield, Illinois and Springfield, Missouri, both `America/Chicago`) share zone and name but are different cities. This change does not settle that global rule itself: ADR-0015 records it, and ADR-0006 gets a status note pointing at ADR-0015 (handoff H1, because the implement stage may not write `docs/adr/`). D3 and D7 implement what ADR-0015 records.

## Goals / Non-Goals

**Goals:**

- Add the GeoNames source behind the existing port without changing the model, the controller hooks' contracts or the stored location list.
- Keep one search data file and one request (FR14), within 130 KB gzipped (NFR-P1).
- Keep query work bounded and counted, not timed (NFR-P2, NFR-P3, ADR-0008).

**Non-Goals:**

- A search index structure (trie, n-grams). A linear pass over about 6 800 records with pre-normalized texts is enough; the benchmark (NFR-P4) reports if that stops being true.
- A generic multi-file lazy source loader. ADR-0006 allows it; this tier does not need it.

## Decision

### D1. One search data file with two sections (FR14, NFR-P1)

The build emits one asset with the zone cities (from CLDR, as today) and the GeoNames cities (from the committed dataset). `createFetchCitySearchLoader` stays the only loader and `cityDataCache` is untouched.

### D2. `CityRecord` identity, population and region (FR1, FR4, FR5, FR7)

`CityRecord` (owner of **City record**, `src/ports/citySearch.ts`) changes:

- `id` — unique per city: the zone ID for a zone city (unchanged), the decimal GeoNames ID for a GeoNames city. The two cannot collide: a zone ID is never all digits.
- `population: number` — new; `0` when unknown (a zone city with no GeoNames match, `UTC`).
- `region?: Record<CityNameLanguage, string>` — new; present for namesakes only (D4).
- `rank` keeps its meaning (popularity from `POPULAR_TIME_ZONE_IDS`); GeoNames cities have rank `0`.

The city source contract (`citySource.contract.ts`) drops "`id` equals `timeZoneId`" and requires unique IDs and canonical zones instead.

### D3. The exemplar city is one record, merged at compile time (FR1, FR10)

The compiler drops a GeoNames city that is the exemplar city of its own zone and records its population for that zone. Match rule: same canonical zone, same country code, and the CLDR English or Russian exemplar name equals one of the city's English or Russian names under `normalizeSearchText`. The committed dataset therefore has a `zoneCityPopulations` map (zone ID → population) next to the cities; the zone cities source reads it when it builds its records. The exemplar names stay CLDR's, so the exemplar city, suggestions and abbreviation results do not change (FR10).

The compiler needs the CLDR zone data for this; it calls the existing `extractZoneData` (owner of the zone cities and the alias map) instead of reading CLDR itself.

### D4. Regions are decided at compile time, for namesakes only (FR7, UX2)

The compiler (`markNamesakes`, called by `compileCityData`) groups all records (zone cities included) by country code and name normalized with `normalizeSearchText` (D11), in each language; a record in a group of two or more is a namesake and gets its admin1 name in English (`admin1CodesASCII.txt`) and Russian (alternate names of the admin1 feature, English as the fallback). Region names are stored once in a `regions` table and referenced by index. For a zone city that is a namesake the region is stored in a `zoneCityRegions` map.

The presenter shows the region whenever the record has one — it holds no namesake logic. That keeps the rule in one place (the compiler, checked by `city-data:check`) and the data small (about 118 records carry a region).

### D5. Dataset and served file formats (FR12, NFR-P1)

Committed file `packages/client/city-data/geonames-cities.json` (compact, one city per line so diffs are reviewable):

```
{
  "formatVersion": 1,
  "source": { "name": "GeoNames", "licence": "CC BY 4.0", "dumpDate": "2026-11-13" },
  "zones":   ["Africa/Abidjan", ...],            // canonical, sorted
  "regions": [["Illinois", "Иллинойс"], ...],    // [en, ru]
  "cities":  [[geonameId, "Kazan", "Казань", "RU", zoneIndex, population, regionIndex?], ...],
  "zoneCityPopulations": { "Europe/Moscow": 10381222, ... },
  "zoneCityRegions":     { "<zone ID>": regionIndex, ... }
}
```

Cities are sorted by GeoNames ID, so two compilations of the same dumps are byte-identical. A Russian name equal to the English one is stored as `0` to save bytes.

The served search data file is `{ "zoneCities": [...as today...], "cityData": <the committed object without "source"> }`. `parseZoneCityRecords` in `fetchCitySearch.ts` becomes `parseCitySearchData`, which validates both sections and expands the tuples into typed `GeoNamesCityData`; an invalid file is the existing "failed to load" state. The types live in `citySource.ts` next to `ZoneCityData`.

### D6. `createGeoNamesCitySource`, sharing the matcher (FR3, NFR-P2, NFR-P3)

A new `CitySource` in `src/adapters/city-search/geoNamesCitySource.ts`. The name and country matching (`toSearchableText`, `findMatchKind`, `readCountryTexts`) moves from `zoneCitiesSource.ts` into one shared module, `cityTextMatching.ts`, used by both sources — the matching rule keeps one owner.

- Country texts are read through one cache per search: one `Intl.DisplayNames` per city-name language, one lookup per country code (today: one formatter per record and language). This is the "at most one country-name formatter per language" bound of NFR-P2.
- Searchable texts are built lazily, on the first `match` call, and memoized. Loading the data for city labels or the exemplar city normalizes nothing (NFR-P3). That first `match` is the one-time preparation of NFR-P2: it normalizes every city and country text once and builds the country-name formatters; every later query normalizes only itself. The work-bound scenarios therefore count queries over a prepared search (the shared search in `searchWorld.ts` runs one preparation query when it is built), and a separate scenario counts the formatters of the preparation on a freshly built search.
- The source skips cities whose zone is not in `getKnownZoneIds()` (FR11), reusing `listKnownZones` of the zone cities source. Its signature is `createGeoNamesCitySource(cityData, listTimeZones: ListTimeZones = listKnownZones)`, the same zone-lister seam the zone cities source has, so its tests fake the installed release the way the zone cities tests do. `listKnownZones` is a module-private `const` of `zoneCitiesSource.ts` today; it moves to `cityTextMatching.ts` and is exported there, so both sources share one owner.

### D7. Composite adapter: per-city results, order, label lookup (FR4, FR5, FR6, FR8, FR9)

- `keepFirstResultPerZone` becomes `keepFirstResultPerCity`, keyed by `record.id`. Abbreviation results still come first, so a zone city matched by abbreviation keeps that kind.
- The comparator becomes: match kind → for `COUNTRY` matches, zone cities (`id === timeZoneId`) first → `rank` descending → `population` descending → collator on the name. One collator per query, as today.
- The signatures become `createCompositeCitySearch(zoneCities, cityData = EMPTY_GEONAMES_CITY_DATA)` and `createZoneCitiesSource(zoneCities, listTimeZones = listKnownZones, cityData = EMPTY_GEONAMES_CITY_DATA)`. `createZoneCitiesSource` keeps its existing second parameter, the zone lister that the tests of FR9 of add-zone-rules-from-iana inject (`zoneCitiesSource.test.ts`, `zoneCitiesSource.matching.test.ts`, `abbreviationSource.test.ts`); `cityData` is appended as the third. The composite adapter calls `createZoneCitiesSource(zoneCities, undefined, cityData)` (the default lister) and `createGeoNamesCitySource(cityData)`. The loader passes the parsed `cityData`, while the tests that are about zone cities alone keep passing the array (and, where they do today, a lister), so the change does not ripple through every test that builds a search.
- `getExemplarCity` and `suggest` keep reading the zone cities map.
- `getCityLabel(timeZoneId, storedLabel, language)` reads a `Map<zone ID, CityRecord[]>` built once at load without normalization, ordered zone city first, then by population descending, and returns the first record that satisfies `isCityNameOfRecord` (one zone's records are scanned, never all — a design choice in support of NFR-P3, not a separately tested requirement).
- `presentSearchResults` keeps `isAdded` as zone + `isCityNameOfRecord`; with per-city records this gives "namesakes in one zone are one location" (FR8) with no new rule. It adds `id` (the list key in the view, which today is zone + city name) and `regionName?: string` in the interface language.

### D8. Compile and check pipeline (FR1, FR2, FR11, FR12)

New `scripts/cityData/`, mirroring `scripts/zoneRules/`:

- `download.ts` — fetches `cities15000.zip`, `alternateNamesV2.zip` (205 MB) and `admin1CodesASCII.txt` from `download.geonames.org` into a temporary directory and extracts them with the system `unzip` through the existing `runChildProcess`. No new dependency.
- `compileCityData.ts` — pure: rows in, dataset out. Filters (population ≥ 100 000 or feature code `PPLC`), picks names (FR2), canonicalizes zones through the alias map of `extractZoneData` and fails on a zone outside the bundled release (FR11), merges exemplar cities (D3), marks namesakes through `markNamesakes` (D4). Every script imports from `src/` only through an index that plain Node can load (`src/lib/zoneRules/core/index.ts`, `src/lib/searchText/index.ts`, D11), never through `@/` or an extensionless index. Alternate names are read as a stream and only rows for the selected IDs and languages `en`, `ru` are kept, so memory stays small.
- `compile.ts` and `check.ts` are thin command-line entries shaped like `scripts/zoneRules/compile.ts`: an exported `runCityDataCompile` / `runCityDataCheck` takes its I/O (fetch, process runner, file reads and writes, log) as dependencies and returns the exit code, so `src/test/cityData/compile.test.ts` and `check.test.ts` test them with stubs; only the guarded `import.meta.url` block that binds the real I/O is excluded from mutation (`// Stryker disable all`), as in the zone rules entries.
- `checkCityData.ts` — pure validation of the committed object against the bundled release and the thresholds of the `city-data` spec; `check.ts` is its command-line entry. "The bundled release" is the zone ID set of `parseZoneRulesRelease(...).zones` read from `ZONE_RULES_RELEASE_FILE` (`app.config.ts`), imported through `src/lib/zoneRules/core/index.ts`; the compiler checks zones against the same set.
- Commands: `pnpm city-data:compile` (maintainer, network) and `pnpm city-data:check` (CI, offline), the latter a step of the `ci.yml` check job before `pnpm test` (handoff H2).
- The scripts run under Node's type stripping like `scripts/zoneRules/` (`"zone-rules:compile": "node scripts/zoneRules/compile.ts"`), so they use no `enum` or `namespace`. Vitest collects only `src/**/*.{test,steps}.{ts,tsx}` (`vitest.config.ts`), so their tests live under `src/test/cityData/`, as the tests of `scripts/zoneRules/` live under `src/test/zoneRules/`.
- Thresholds and URLs are constants in `scripts/cityData/constants.ts`; the budget `CITY_SEARCH_DATA_BUDGET_KB` moves from the script-local constant `30` in `check-bundle-size.mjs` to `app.config.ts` as `130`, next to `ZONE_RULES_ASSET_BUDGET_KB`, which the script already imports from there.

`zoneDataPlugin.ts` reads the committed file and serves the merged object (D5) as the build asset and from the dev middleware. In test mode `virtual:zone-cities` keeps its default export (the zone cities array) and adds a named `cityData` export, so its existing importers compile unchanged and only the tests about the whole search import the second section.

### D9. Region on the result row (FR7, NFR-A1, NFR-R1)

`LocationSearchResults` renders the secondary line as `regionName, countryName` when the result has a region, in the existing muted line; the line may wrap. The option's accessible name is its text content, so the region is in it without an extra attribute. The separator is a constant.

### D10. Attribution (FR13, UX4, NFR-A2)

A new `CityDataAttribution` component in `src/app/settings/`, modelled on `GnomishFactoryCredit` (link, new tab, `rel="noopener noreferrer"`, 44 px, token colours), rendered as the last child of the settings `<main>`, after `ZoneRulesReleaseLine` (UX4: below every settings group and line). The URL is `GEONAMES_URL` in `src/constants/`; the text is `settings.cityDataAttribution`. `packages/client/city-data/README.md` carries the credit and licence; the root READMEs get it through handoff H3.

### D11. Search text normalization moves to a module plain Node can load (FR3, FR7)

The compiler (D3, D4) must normalize names exactly as the search does, so it reuses `normalizeSearchText` rather than writing a second normalizer. Its current home, `src/adapters/city-search/`, cannot be imported by `node scripts/cityData/*.ts`: the module's `index.ts` exports without file extensions (`export { createCompositeCitySearch } from "./createCompositeCitySearch";`) and `createCompositeCitySearch.ts` imports through the `@/` alias, neither of which Node's resolver understands; importing the internal file directly would break "Import only through `index.ts` of a module".

`normalizeSearchText` and `splitIntoWords` therefore move unchanged to `src/lib/searchText/`, whose `index.ts` exports with `.ts` extensions and which imports nothing — the pattern of `src/lib/zoneRules/core/index.ts`, which `scripts/zoneRules/` and `scripts/zoneData/extractZoneData.ts` already import as `../../src/lib/zoneRules/core/index.ts`. The city search adapters import it from `@/lib/searchText`, and `src/adapters/city-search/index.ts` re-exports it, so existing callers (`src/locales/filterLocales.ts` and `src/controller/useCitySearch.ts`, both through `@/adapters`) do not change. The normalizer keeps one owner. A unit test spawns plain `node` to import the module, so a regression that only Vitest's resolver would hide fails the suite.

## Consequences

Positive:
- About 6 400 more cities are found by name in English and Russian, behind the unchanged `CitySearch` port (FR1, FR3).
- One file, one request, one loader: the loading, error and offline states do not change (FR14).
- The model, the controller hooks and the stored location list do not change; rollback is a revert.
- Namesake and exemplar-city rules live in the compiler and are enforced by the check, so the run-time code holds no data heuristics (D3, D4).
- Country names cost one formatter per language instead of one per record (NFR-P2).

Negative:
- The background request grows from 30 KB to about 116 KB gzipped for users with a non-empty list. Mitigation: It does not block rendering, happens once and is cached by the service worker; the budget check fails the build above 130 KB.
- Parsing about 310 KB of JSON and building 6 800 records on the main thread. Mitigation: Records are built without normalization (D6, D7); search texts are built on the first query. The benchmark reports query time; a work-bound scenario pins "no normalization on load".
- GeoNames lags behind tzdb and names a zone the release does not hold. Mitigation: Compiling fails and names the city (FR11); the fix is an entry in a small `ZONE_OVERRIDES` map in the compiler, reviewed in the same commit.
- Russian names in GeoNames are uneven. Mitigation: The preferred-name rule plus the English fallback (FR2); the check enforces ≥ 95% Cyrillic names (M4). Individual fixes go into a `NAME_OVERRIDES` map in the compiler rather than hand edits of the generated file.
- Fixed scenarios depend on live data ("Springfield" has three results). Mitigation: Tests run against the committed file, which changes only by a reviewed commit; the compile task updates the affected scenarios in that commit.
- Country codes of disputed territories follow GeoNames. Mitigation: Accepted; the country shown comes from `Intl.DisplayNames` for that code, as for zone cities.

## Alternatives Considered

**A second lazy file for GeoNames cities, loaded when the search opens (D1)**: It keeps the background request small (30 KB), but the city label of a listed GeoNames city (FR9) needs the GeoNames names too, so `useCityLabels` would have to know which file a stored label lives in, and the search would get a second loading state. Rejected: more states for a background, non-blocking 116 KB request that the service worker caches.

**Fold population into `rank` (D2)**: Rejected: popularity is an editorial list and must stay above population (FR5: "new" gives New York first), and two concepts in one number hide that order.

**Deduplicate at run time in the composite adapter (D3)**: Rejected: it costs normalizations on every load (against NFR-P3) and ships a duplicate record for most zones.

**Show the region for every city (D4)**: Clutters every result ("Tatarstan Republic, Russia") and adds an estimated 25 KB gzipped. Rejected.

**Detect namesakes among the results of a query (D4)**: The same city would show its region for one query and not for another. Rejected.

**Array of objects (D5)**: Larger before and after compression, because every record repeats its keys (not measured). Rejected for the budget.

**Download at build time, as `cldr-*` packages are read (D8)**: GeoNames is not an npm package; a 205 MB download would make the build slow and network-dependent. Rejected; the long-lived choice is recorded in ADR-0015.

**A ready-made npm city package (D8)**: The packages reviewed (`city-timezones`, `@vvo/tzdb`, `worldcities`) offer no Russian names and no controllable threshold. Rejected.

**A footer in the search dialog (D10)**: Closer to the data, but it takes a row from the results on phones. Rejected.

## Migration Plan

No stored data changes: locations keep their zone, label and country code, and existing locations are zone cities whose record IDs do not change. The search data file gets a new hashed name, so the service worker fetches it once after the update. Rollback is a revert of the change; a list that already holds a GeoNames city keeps working, because a location never references a city record — its row shows the stored label when no record matches.
