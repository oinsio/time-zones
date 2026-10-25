## MODIFIED Requirements

### Requirement: Main page regions
The main page SHALL consist of a header with the app title as the only page heading and an empty slot for future controls, a content region hosting the active view, a bottom bar holding the date bar (see the `date-selection` capability) that stays at the bottom of the viewport, and a polite notices region, out of the document flow, that keeps the offline-ready and update notices and stacks the update-check-failed note and the storage warning with them. The notices region MUST sit above the bottom bar and MUST NOT cover it. <!-- implements FR1, UX3 of add-main-page-scaffold; FR8 of select-date-with-calendar-and-now -->

#### Scenario: User opens the app
- **WHEN** the user opens the app
- **THEN** the header shows the app title as the only heading
- **AND** the content region shows the active view
- **AND** the bottom bar shows the date bar

#### Scenario: Notices stay available
- **WHEN** a new version becomes available while a view is shown
- **THEN** the update notice is announced politely in the notices region
- **AND** the bottom bar still shows the date bar

#### Scenario: Header keeps its position
- **WHEN** the page shows the update-check-failed note or the storage warning
- **THEN** the header keeps its position
