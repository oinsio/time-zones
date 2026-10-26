## MODIFIED Requirements

### Requirement: Time selection is fast
One time selection SHALL work out the new reference moment and re-present 50 location rows, with their track positions, in at most 50 ms. A date change SHALL re-present 50 rows, including the new colour stops and hour labels of their tracks, in at most 50 ms. Both budgets cover the model and presenter work for rows that were already presented once. Drawing into the page is not part of the budgets, but it MUST happen in the same render as the change, with no loading state. A selection that keeps the reference day MUST NOT compute the colour stops again. Both budgets MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking checks are work bounds: a selection that keeps the reference day MUST build no date, time or region name formatter and MUST look up no time zone transition; a date change MUST build no date, time or region name formatter and MUST look up at most 2 time zone transitions per zone, and presenting that new day a second time MUST look up none. Inputs: 50 locations with canonical IANA identifiers, the current instant (ISO 8601 with `Z`), the device time zone. Output: every row at the new moment. <!-- implements NFR-P1, NFR-P2 of add-time-sliders-to-location-cards; FR1, FR3, FR5, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks -->

#### Scenario: 50 rows within the time-selection budget
- **GIVEN** 50 locations whose rows have been presented at `2026-03-08T07:30:00Z` with the device time zone `UTC`
- **WHEN** a time selection pins `2026-03-08T18:00:00Z` and the rows are presented again
- **THEN** no date, time or region name formatter is built
- **AND** no time zone transition is looked up
- **AND** every row's handle stands at `0.75`

#### Scenario: 50 tracks within the date-change budget
- **GIVEN** 50 locations whose rows have been presented at `2026-03-08T07:30:00Z` with the device time zone `UTC`
- **WHEN** the date moves to the next day and the rows are presented again
- **THEN** no date, time or region name formatter is built
- **AND** at most 2 time zone transitions are looked up per zone
- **AND** every row carries colour stops and hour labels for the day starting `2026-03-09T00:00:00Z`

#### Scenario: The new day's tracks are computed once
- **GIVEN** 50 locations whose rows have been presented for the day starting `2026-03-09T00:00:00Z`
- **WHEN** their rows are presented again for that day
- **THEN** no time zone transition is looked up

#### Scenario: Hour labels are unchanged by formatter reuse
- **GIVEN** the list contains Kolkata, Kathmandu and New York
- **WHEN** their tracks are presented for the day starting `2026-03-08T00:00:00Z` in English and then in Russian
- **THEN** each track shows the same hour labels as the platform's own date formatting gives for that zone, with the hour label's format, in the same language, without the shared formatters
