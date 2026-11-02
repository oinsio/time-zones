# Glossary: Search

Finding a city, country or zone abbreviation and adding it as a location. Decision: ADR-0006 (pluggable city data sources). See [README](README.md) for the entry format.

- **City search** — the port that answers a query with ranked results. *Code:* `CitySearch`, `useCitySearch`. *RU:* «Поиск». *Never:* lookup, autocomplete.
- **City source** — one provider of city records behind the city search. The composite adapter merges, deduplicates and ranks what the sources return. *Never:* provider, backend.
- **City record** — one searchable place in the common format: time zone ID, localized names, optional region, country code, aliases, rank. *Code:* `CityRecord`. *Not:* a location (a record becomes a location only when added).
- **Zone cities source** — the city source with one record per IANA zone, named by its exemplar city. *Code:* `createZoneCitiesSource`.
- **Exemplar city** — the city CLDR uses to name a time zone (`Almaty` for `Asia/Almaty`), in English and Russian. *Code:* `CitySearch.getExemplarCity`, `CitySearch.getCityLabel`, `deriveCityNameFromTimeZoneId`.
- **Abbreviation source** — the city source that maps common zone abbreviations (`EST`, `IST`, `MSK`) to zones. An ambiguous abbreviation returns every match. *Code:* `timeZoneAbbreviations`.
- **Search result** — one presented answer: city, country, zone and how it matched. *Code:* `PresentedSearchResult`, `SearchMatchKind`.
- **Suggestions** — the popular locations shown before the user types, so the search never opens empty. *Code:* `SearchMatchKind.SUGGESTION`. *RU:* «Популярные места». *Never:* defaults, recent.
- **Search shortcut** — the `/` key that opens the search from anywhere on the main page. *Code:* `useSearchShortcut`.
- **Device time option** — the first search option, offered while no device time location is listed, also while the city data loads or failed. *Code:* `isDeviceTimeOptionShown`, `presentDeviceTimeOptionLabels`. *RU:* «Время устройства».
