# Handoff

## H1: ADR status notes for coordinates

- **Serves:** FR5, FR7 of add-city-coordinates-to-locations
- **Files:** `docs/adr/0006-city-data-sources.md`, `docs/adr/0010-device-time-location.md`
- **Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-135/handoff/H1-adr-coordinates-notes.patch`, then after applying `grep -n "add-city-coordinates-to-locations" docs/adr/0006-city-data-sources.md docs/adr/0010-device-time-location.md` lists both notes.
- **Why manual:** the factory may not write `docs/adr/`.
- **Automated part:** the record coordinates are tested by `location_search_coordinates.feature` (task 6.3), the version 4 document and its migration by `localStorageLocationRepository.migration.test.ts` and `locations_coordinates_storage.feature` (tasks 7.3, 7.4); the glossary carries both facts (task 1.1).
