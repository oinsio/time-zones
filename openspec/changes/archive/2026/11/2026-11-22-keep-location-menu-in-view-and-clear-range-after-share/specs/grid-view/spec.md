## MODIFIED Requirements

### Requirement: Grid layers stay under the page bars and dialogs
Everything of the grid panel — the row header texts, the hour strips, the row notes, the hour frame, the meeting frame and the meeting handles — SHALL lie below the date bar, the notices region above it, and every dialog of the main page (the search, opened from Add location without a meeting range, and the calendar, in any state) with its backdrop, in every state of the Grid view and at every scroll position of the page and of the strips. An open location menu MUST still lie above the date bar and the grid panel. <!-- implements FR6, FR7 of fix-grid-meeting-range-lock-and-layering -->

#### Scenario: Dialogs cover the grid
- **GIVEN** the Grid view at 390 by 844 px with Almaty, Moscow, Kolkata and New York and `<state>`
- **WHEN** the user opens `<dialog>`
- **THEN** at the centre of every row header text, hour cell and meeting handle under the dialog's backdrop, the topmost element belongs to the dialog or its backdrop

| state | dialog |
|---|---|
| the hour frame | the search |
| the hour frame | the calendar |
| the meeting range 09:00–11:00 | the calendar |

#### Scenario: Rows scroll under the date bar
- **GIVEN** the Grid view at 390 by 844 px with 12 locations and the meeting range 09:00–11:00
- **WHEN** the page is scrolled so that rows pass under the date bar
- **THEN** the topmost element at the centre of the calendar button and of the Now button is that button
- **AND** no point of the date bar has a grid element on top

#### Scenario: An open location menu lies above the date bar
- **GIVEN** the Grid view at 390 by 844 px with 12 locations and no meeting range
- **AND** the page is scrolled so that a row's location menu opens under its button and reaches over the date bar
- **WHEN** the user opens that row's location menu
- **THEN** the menu lies under its button and at least one menu item lies over the date bar
- **AND** at the centre of every menu item that lies over the date bar, the topmost element is that menu item <!-- implements NFR-A1 of keep-location-menu-in-view-and-clear-range-after-share -->

