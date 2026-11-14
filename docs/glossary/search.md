# Glossary: Search

Finding a city, country or zone abbreviation and adding it as a location. Decision: ADR-0006 (pluggable city data sources). See [README](README.md) for the entry format.

- **City search** — the port that answers a query with ranked results. *Code:* `CitySearch`, `useCitySearch`. *RU:* «Поиск». *Never:* lookup, autocomplete.
- **City source** — one provider of city records behind the city search. The composite adapter merges, deduplicates and ranks what the sources return. *Never:* provider, backend.
- **City record** — one searchable place in the common format: an ID unique per city (the zone ID for a zone city, the GeoNames ID otherwise), time zone ID, localized names, country code, aliases, rank, population and a region for namesakes only. *Code:* `CityRecord`. *Not:* a location (a record becomes a location only when added).
- **Zone cities source** — the city source with one record per IANA zone, named by its exemplar city. *Code:* `createZoneCitiesSource`.
- **Exemplar city** — the city CLDR uses to name a time zone (`Almaty` for `Asia/Almaty`), in English and Russian. *Code:* `CitySearch.getExemplarCity`, `CitySearch.getCityLabel`, `deriveCityNameFromTimeZoneId`.
- **Abbreviation source** — the city source that maps every zone abbreviation of the zone abbreviation table to the zones whose abbreviation pair contains it; an ambiguous abbreviation returns every match. *Code:* `createAbbreviationSource`, `getZoneAbbreviations`.
- **Search result** — one presented answer: city, country (with its region for a namesake), zone and how it matched. *Code:* `PresentedSearchResult`, `SearchMatchKind`.
- **Suggestions** — the popular locations shown before the user types, so the search never opens empty. *Code:* `SearchMatchKind.SUGGESTION`. *RU:* «Популярные места». *Never:* defaults, recent.
- **Search shortcut** — the `/` key that opens the search from anywhere on the main page. *Code:* `useSearchShortcut`.
- **Device time option** — the first search option, offered while no device time location is listed, also while the city data loads or failed. *Code:* `isDeviceTimeOptionShown`, `presentDeviceTimeOptionLabels`. *RU:* «Время устройства».
- **GeoNames source** — the city source with one record per city of the city data, beside the zone cities source. *Code:* `createGeoNamesCitySource`.
- **City data** — the committed dataset of cities with a population of at least 100 000 and all capitals, compiled offline from GeoNames and served as the second section of the search data file. *Code:* `city-data/geonames-cities.json`, `compileCityData`, `checkCityData`, `parseCitySearchData`. *Never:* city database, city list.
- **Population** — the number of inhabitants of a city record; `0` when unknown. It orders results after `rank`. *Code:* `CityRecord.population`.
- **Namesake** — a city record that shares its name and country with another record; it is shown with its region. *Code:* `markNamesakes`, called by `compileCityData`. *Not:* two cities with one name in different countries.
- **Region** — the first-level administrative area of a namesake, in English and Russian, shown before the country. *Code:* `CityRecord.region`, `PresentedSearchResult.regionName`. *Never:* state, province, admin1 in the interface.
