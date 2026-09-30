## MODIFIED Requirements

### Requirement: Layered modules and empty view registry
The application SHALL contain the layer modules model, presenter, controller and views, each exposing a single public entry point. The view registry MUST exist and MUST contain the Cards view. The shell MUST render the main page, which reads the registry, and MUST NOT fail if the registry is empty. <!-- implements FR2, FR3 of add-main-page-scaffold -->

#### Scenario: Shell renders the main page
- **WHEN** the app is opened
- **THEN** the shell renders the main page with the Cards view

#### Scenario: Shell with no registered views
- **WHEN** the view registry contains no views
- **THEN** the shell renders the app title and an error-free empty content region
