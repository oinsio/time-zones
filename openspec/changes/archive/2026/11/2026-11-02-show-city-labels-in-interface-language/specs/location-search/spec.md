## MODIFIED Requirements

### Requirement: Search is fast and lazy
Computing the results of one query over the full bundled data SHALL take at most 50 ms. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: one non-empty query MUST normalize exactly one text, the query itself, and MUST build at most one collator. The search data MUST NOT be part of the initial JavaScript; it MUST be a separate file of at most 30 KB gzipped, and the initial JavaScript MUST stay at most 150 KB gzipped. While the list is empty, the page MUST NOT request the search data before the search is first opened. While the list holds at least one location of any kind, the page MAY request it once in the background for the city labels of city locations and the exemplar city of the device time location, and the search MUST reuse that data without a second request. The service worker MAY download and cache it in the background for offline use. <!-- implements NFR-P1, NFR-P2 of add-locations-via-search; FR4, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks; FR8 of show-here-entry-for-device-time; NFR-P2 of add-settings-page-and-device-time-location; FR4 of show-city-labels-in-interface-language -->

#### Scenario: Query timing
- **WHEN** each of 10 sample queries is run over the full data
- **THEN** each query normalizes exactly one text
- **AND** each query builds at most one collator

#### Scenario: Data loads only when the search opens
- **GIVEN** the stored list is empty
- **WHEN** the user opens the app and has not opened the search
- **THEN** the page has not requested the search data
- **AND** the page requests it when the user opens the search

#### Scenario: The Here entry's request is the only one
- **GIVEN** the list holds the device time location and Tokyo
- **WHEN** the user opens the app, the search data finishes loading, and the user opens the search
- **THEN** the page has requested the search data exactly once

#### Scenario: Bundle budget
- **WHEN** the app is built
- **THEN** the search data is a separate file of at most 30 KB gzipped
- **AND** that file is not part of the initial JavaScript
- **AND** the initial JavaScript is at most 150 KB gzipped

### Requirement: Open the search with the slash key
While the main page shows the header's "Add location" button, pressing `/` SHALL open the location search exactly as that button does: the suggestions are shown, focus is in the query field and the query is empty — the `/` MUST NOT be entered into the query field and the browser's own action for `/` MUST NOT start. Closing a search opened with `/`, with Esc or by adding a location, MUST return focus to the "Add location" button. Opening with `/` MUST keep the search data lazy: while the list is empty, it is requested only when the search first opens. <!-- implements FR1, FR5, NFR-P1, UX1, UX2 of open-location-search-with-slash-shortcut; FR8 of show-here-entry-for-device-time; FR2, NFR-P2 of add-settings-page-and-device-time-location; FR4 of show-city-labels-in-interface-language -->

The shortcut MUST be ignored — the search state does not change and the key keeps its usual effect — while focus is in a text input, a textarea or a contenteditable element, while the search is already open, when Ctrl, Meta or Alt is held, and while the "Add location" button is not on the page (the stored list is unreadable, or the settings page is shown). Shift MUST NOT be checked. <!-- implements FR2, FR3, FR4, FR6 of open-location-search-with-slash-shortcut; FR3 of add-settings-page-and-device-time-location -->

The "Add location" button MUST expose `/` as its keyboard shortcut to assistive technology (`aria-keyshortcuts="/"`) and keep the accessible name "Add location", with no automated accessibility violations. <!-- implements NFR-A1, NFR-R1 of open-location-search-with-slash-shortcut; FR2 of add-settings-page-and-device-time-location -->

#### Scenario: Open the search and add a location with the keyboard
- **GIVEN** the main page shows the "Add location" button and focus is not in a text field
- **WHEN** the user presses `/`, types "Tokyo", presses Down and Enter
- **THEN** the search opened with focus in an empty query field
- **AND** the key press did not reach the browser's own `/` action
- **AND** Tokyo is in the list
- **AND** focus is on the "Add location" button

#### Scenario: Suggestions are shown
- **WHEN** the user presses `/` on the main page
- **THEN** the search is open with popular suggestions
- **AND** the query field is empty

#### Scenario: Data is requested only when the search opens
- **GIVEN** the user has not opened the search
- **AND** the stored list is empty
- **WHEN** the user presses `/`
- **THEN** the search data is requested exactly once
- **AND** it was not requested before

#### Scenario: Typing in a text field
- **GIVEN** focus is in a text input, a textarea or a contenteditable element
- **WHEN** the user presses `/`
- **THEN** the search does not open
- **AND** the `/` is entered into that element

#### Scenario: Slash typed in the open search
- **GIVEN** the search was opened with `/` and focus is in its query field
- **WHEN** the user presses `/`
- **THEN** exactly one search is open
- **AND** the query field holds `/`

#### Scenario: Search already open
- **GIVEN** the search is open and focus is on its close action
- **WHEN** the user presses `/`
- **THEN** the search stays open
- **AND** the query does not change

#### Scenario: Modifier keys held
- **WHEN** the user presses `/` while holding Ctrl, Meta or Alt
- **THEN** the search does not open

#### Scenario: Shift on layouts that need it
- **GIVEN** a keyboard layout on which `/` is typed with Shift
- **WHEN** the user presses Shift and the key that produces `/`
- **THEN** the search opens

#### Scenario: Stored list unreadable
- **GIVEN** the stored list is unreadable and the error with Reset is shown
- **WHEN** the user presses `/`
- **THEN** the search does not open

#### Scenario: Settings page shown
- **GIVEN** the settings page is shown
- **WHEN** the user presses `/`
- **THEN** the search does not open

#### Scenario: Shortcut announced on the action
- **WHEN** the main page shows the "Add location" button
- **THEN** the button announces `/` as its keyboard shortcut
- **AND** its accessible name is "Add location"

