## ADDED Requirements

### Requirement: Open the search with the slash key
While the main page shows the "Add location" action, pressing `/` SHALL open the location search exactly as that action does: the suggestions are shown, focus is in the query field and the query is empty — the `/` MUST NOT be entered into the query field and the browser's own action for `/` MUST NOT start. Closing a search opened with `/`, with Esc or by adding a location, MUST return focus to the "Add location" action. Opening with `/` MUST keep the search data lazy: it is requested only when the search first opens. <!-- implements FR1, FR5, NFR-P1, UX1, UX2 of open-location-search-with-slash-shortcut -->

The shortcut MUST be ignored — the search state does not change and the key keeps its usual effect — while focus is in a text input, a textarea or a contenteditable element, while the search is already open, when Ctrl, Meta or Alt is held, and while the "Add location" action is not on the page (the stored list is unreadable). Shift MUST NOT be checked. <!-- implements FR2, FR3, FR4, FR6 of open-location-search-with-slash-shortcut -->

The "Add location" action MUST expose `/` as its keyboard shortcut to assistive technology (`aria-keyshortcuts="/"`) and keep the accessible name "Add location", with no automated accessibility violations and no visual change. <!-- implements NFR-A1, NFR-R1 of open-location-search-with-slash-shortcut -->

#### Scenario: Open the search and add a location with the keyboard
- **GIVEN** the main page shows the "Add location" action and focus is not in a text field
- **WHEN** the user presses `/`, types "Tokyo", presses Down and Enter
- **THEN** the search opened with focus in an empty query field
- **AND** Tokyo is in the list
- **AND** focus is on the "Add location" action

#### Scenario: Suggestions are shown
- **WHEN** the user presses `/` on the main page
- **THEN** the search is open with popular suggestions
- **AND** the query field is empty

#### Scenario: Data is requested only when the search opens
- **GIVEN** the user has not opened the search
- **WHEN** the user presses `/`
- **THEN** the search data is requested exactly once
- **AND** it was not requested before

#### Scenario: Typing in a text field
- **GIVEN** focus is in a text input, a textarea or a contenteditable element
- **WHEN** the user presses `/`
- **THEN** the search does not open
- **AND** the `/` is entered into that element

#### Scenario: Search already open
- **GIVEN** the search is open and focus is on its close action
- **WHEN** the user presses `/`
- **THEN** the search stays open
- **AND** the query does not change

#### Scenario: Modifier keys held
- **WHEN** the user presses `/` while holding Ctrl, Meta or Alt
- **THEN** the search does not open

#### Scenario: Shift on layouts that need it
- **WHEN** the user presses `/` while holding Shift
- **THEN** the search opens

#### Scenario: Stored list unreadable
- **GIVEN** the stored list is unreadable and the error with Reset is shown
- **WHEN** the user presses `/`
- **THEN** the search does not open

#### Scenario: Shortcut announced on the action
- **WHEN** the main page shows the "Add location" action
- **THEN** the action announces `/` as its keyboard shortcut
- **AND** its accessible name is "Add location"
