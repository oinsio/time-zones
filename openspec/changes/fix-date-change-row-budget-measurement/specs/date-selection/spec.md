## MODIFIED Requirements

### Requirement: Date changes are fast
A date change SHALL re-present 50 location rows in at most 50 ms, in the same render, with no loading state. The 50 ms budget MUST cover working out the new reference moment and re-presenting every row's labels (local time, local date with its ISO date, UTC offset, device time zone badge) for rows that were already presented once, as they are while the app is open. Drawing the rows into the page is not part of the budget. It MUST still happen in the same render as the date change, with no loading state in between. Inputs: 50 locations with canonical IANA identifiers, the current instant (ISO 8601 with `Z`), the device time zone, a move to the next day. Output: every row carries its local date at the new moment. A date change needs no network and behaves the same offline. <!-- implements NFR-P1 of select-date-with-calendar-and-now; NFR-P1, FR1, UX1 of fix-date-change-row-budget-measurement -->

#### Scenario: 50 rows within the budget
- **GIVEN** 50 locations whose rows have been presented at the current instant `2026-03-08T07:30:00Z` with the device time zone `UTC`
- **WHEN** the date moves to the next day and the rows are presented again
- **THEN** it takes at most 50 ms
- **AND** every row carries its local date at `2026-03-09T07:30:00Z`

#### Scenario: The new date shows in the same render
- **GIVEN** 50 locations
- **AND** the app is open
- **WHEN** the user moves to the next day
- **THEN** the rows show the new date with no loading state
