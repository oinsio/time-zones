# Handoff

## H1: ADR-0015 city data from GeoNames

**Serves:** FR12 (design context, D3, D7).
**Files:** `docs/adr/0015-city-data-from-geonames.md` (new), `docs/adr/0006-city-data-sources.md`, `CLAUDE.md`.
**Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-128/handoff/H1-adr-0015-city-data.patch`.
**Why manual:** the factory may not write `docs/adr/` or `CLAUDE.md`.
**Automated part:** per-city deduplication and order are tested in `createCompositeCitySearch.cities.test.ts` and `location_search_ranking.feature`; the dataset is checked by `city-data:check`.

## H2: CI step "Check city data"

**Serves:** FR12.
**Files:** `.github/workflows/ci.yml`.
**Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-128/handoff/H2-ci-city-data-check.patch`.
**Why manual:** the factory may not edit `.github/`.
**Automated part:** `city-data:check` rules are unit-tested in `src/test/cityData/checkCityData.test.ts`.

## H3: GeoNames credit in the READMEs

**Serves:** FR13.
**Files:** `README.md`, `README.ru.md`.
**Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-128/handoff/H3-readme-geonames-credit.patch`.
**Why manual:** the implement stage writes only under `packages/` and `docs/`.
**Automated part:** the in-app attribution is tested by `CityDataAttribution.test.tsx` and `settings_city_data_attribution_e2e.feature`.
