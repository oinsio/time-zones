## MODIFIED Requirements

### Requirement: Date bar on every page state
The date bar SHALL be shown at the bottom of the main page in every state of the page: while the view loads, when the view failed to load, with an empty list, with an unreadable stored list, with storage unavailable, and offline. In every one of these states the bar MUST hold the Now button, inactive while the moment is live and active while it is pinned (see "Return to now"). The notices (offline-ready, update, storage warning) MUST stay visible above the bar and MUST NOT cover it. Date selection needs no network. <!-- implements FR8 of select-date-with-calendar-and-now; FR1 of keep-now-button-visible-when-live; FR7 of polish-settings-and-remove-offline-update-notice -->

#### Scenario: Bar in each state
- **WHEN** the main page is in the `<state>` state, with the moment live as the app opens
- **THEN** the date bar is shown with the previous-day, date and next-day buttons and an inactive Now

| state |
|---|
| view loading |
| view error |
| empty |
| unreadable |
| storage unavailable |
| offline |

#### Scenario: Notice above the bar
- **GIVEN** storage is unavailable
- **WHEN** the main page is shown
- **THEN** the storage warning is above the date bar and does not overlap it
