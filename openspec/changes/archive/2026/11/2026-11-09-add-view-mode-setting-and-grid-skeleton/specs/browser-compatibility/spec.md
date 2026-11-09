## MODIFIED Requirements

### Requirement: Width measurement on legacy engines
On an engine without `ResizeObserver`, a polyfill SHALL make a `ResizeObserver` available to the app before any application module runs, and the app MUST start on the chosen view as on modern engines. The view is never chosen by width. <!-- implements FR6 of support-legacy-ios-12-safari; FR6 of add-view-mode-setting-and-grid-skeleton -->

#### Scenario: View selection without ResizeObserver
- **GIVEN** the environment has no native `ResizeObserver`
- **WHEN** the app starts
- **THEN** a `ResizeObserver` is available to the app
- **AND** the Cards view is shown
