# City data

The cities behind the location search that are not zone cities: one committed
file, `geonames-cities.json`, compiled by `scripts/cityData/compile.ts`.
Implements FR1, FR12, FR13 of add-geonames-city-source.

## Source and licence

City data: [GeoNames](https://www.geonames.org/), licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The app credits
GeoNames on its settings page. The file records the licence and the date of the
dump it was compiled from.

- Dump date: **2026-11-13** (`cities15000.zip`, `alternateNamesV2.zip`,
  `admin1CodesASCII.txt` from `download.geonames.org/export/dump/`).

## Contents

- 6 102 cities with a population of at least 100 000 or a country capital, each
  with its GeoNames ID, English and Russian names, country code, canonical IANA
  zone and population;
- 271 zones, 90 regions (first-level divisions) for 160 namesake cities;
- `zoneCityPopulations` for 265 zones: the population of the exemplar city of a
  zone, which is held once as the zone city and not as a GeoNames city;
- `zoneCityRegions`: the region of a zone city that is a namesake (1 zone).

Size: 366 993 bytes, 143 948 bytes gzipped (`gzip -9`).

Facts of this dump that the specs use: three cities named Springfield in `US`
(Illinois, Missouri, Massachusetts); Kazan in `Europe/Moscow` with 1 243 500
people (GeoNames' main name is "Kazan’", so `NAME_OVERRIDES` of
`scripts/cityData/selectCityNames.ts` names it "Kazan"); Astana and Shymkent in
`KZ`.

## Refresh

```sh
pnpm --filter @time-zones/client city-data:compile
pnpm --filter @time-zones/client city-data:check
```

`city-data:compile` needs the network and about 250 MB of temporary disk: it
downloads the three dumps, extracts them with the system `unzip`, and writes the
file only when every step succeeds. Building the app, running the tests and
running CI never request anything from GeoNames. A city whose zone the bundled
zone rules release does not hold fails the run; fix it with an entry in
`ZONE_OVERRIDES` (`scripts/cityData/zoneOverrides.ts`), and fix a wrong name
with an entry in `NAME_OVERRIDES`.

## Size and speed

The committed file gzips to 143 948 bytes as one tuple per city. The search data
file the build serves holds the cities as columns (the IDs as differences),
which gzips better: the whole file, with the zone cities, measures 119.4 KB
against the 130 KB budget (`CITY_SEARCH_DATA_BUDGET_KB`). The benchmark "search
one query over the full data" reports a mean of about 0.3 ms, far below 50 ms.
