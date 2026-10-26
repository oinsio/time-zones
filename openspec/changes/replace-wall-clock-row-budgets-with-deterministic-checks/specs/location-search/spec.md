## MODIFIED Requirements

### Requirement: Search is fast and lazy
Computing the results of one query over the full bundled data SHALL take at most 50 ms. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: one non-empty query MUST normalize exactly one text, the query itself, and MUST build at most one collator. The search data MUST NOT be part of the initial JavaScript; it MUST be a separate file of at most 30 KB gzipped, and the initial JavaScript MUST stay at most 150 KB gzipped. The page MUST NOT request the search data before the search is first opened; the service worker MAY download and cache it in the background for offline use. <!-- implements NFR-P1, NFR-P2 of add-locations-via-search; FR4, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks -->

#### Scenario: Query timing
- **WHEN** each of 10 sample queries is run over the full data
- **THEN** each query normalizes exactly one text
- **AND** each query builds at most one collator

#### Scenario: Data loads only when the search opens
- **WHEN** the user opens the app and has not opened the search
- **THEN** the page has not requested the search data
- **AND** the page requests it when the user opens the search

#### Scenario: Bundle budget
- **WHEN** the app is built
- **THEN** the search data is a separate file of at most 30 KB gzipped
- **AND** that file is not part of the initial JavaScript
- **AND** the initial JavaScript is at most 150 KB gzipped
