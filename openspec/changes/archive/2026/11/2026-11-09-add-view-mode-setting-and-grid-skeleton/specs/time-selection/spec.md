## MODIFIED Requirements

### Requirement: Select a time in every view
Selecting a time is part of the view contract (ADR-0002). For every registered view, a time selection in any location MUST change the time shown for every location, and Now MUST return them to the current time. A view that has no time selection control yet MAY be excluded from the scenario "Select a time" by the marker of `main-page` → View contract runs for every registered view; Grid is excluded until the hour cells change, and every other registered view MUST still pass it. <!-- implements FR3, FR5 of add-time-sliders-to-location-cards; FR8 of add-view-mode-setting-and-grid-skeleton -->

#### Scenario: Select a time
- **GIVEN** the view under contract is shown
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the stored locations are Almaty and Moscow
- **WHEN** the user moves the time of Moscow one hour forward
- **THEN** Almaty shows `13:30` and Moscow shows `11:30`
- **WHEN** the user returns to now
- **THEN** Almaty shows `12:30` and Moscow shows `10:30`
