# ADR-0015: City data from GeoNames, compiled offline and committed

## Status
Accepted (2026-11-13)

Refined by ADR-0017: the compile command is also run by the scheduled city data refresh, which proposes its result as a data refresh pull request; pull request checks, the build and the deploy still never contact GeoNames.

## Context

ADR-0006 left room for a richer city source behind the `CitySearch` port. The zone cities alone find one city per time zone, so Kazan, Munich or Boston cannot be added by name. Related: ADR-0006, ADR-0014.

## Decision

City data comes from GeoNames (CC BY 4.0): every city with a population of at least 100 000 and every capital, with English and Russian names, country, canonical IANA zone and population. A maintainer command (`city-data:compile`) downloads the dumps, compiles one file and commits it; `city-data:check` validates it offline in CI. The build, the tests and CI never contact GeoNames.

The composite adapter removes duplicates by city (record ID) instead of by zone and name, so namesakes in one zone stay separate results, and orders results by match kind, then `rank`, then population, then name.

## Consequences

Positive:
- About 6 000 more cities are found, in both languages, behind the unchanged port.
- A build without network and a reviewable data change.

Negative:
- The search data file grows and its budget is raised for it.
- GeoNames can lag behind tzdb; compiling fails on a zone the release lacks.

## Alternatives Considered

**Download at build time**: a 205 MB download makes the build slow and network-dependent.

**npm city packages (`city-timezones`, `@vvo/tzdb`, `worldcities`)**: no Russian names and no control over the threshold.

**Wikidata**: heavier pipeline and less regular zone data than GeoNames.
