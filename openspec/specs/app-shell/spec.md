# app-shell Specification

## Purpose

The application frame that every view lives in: it names the app in the user's language, applies the theme and font, keeps the app usable offline, tells the user about offline readiness and new versions, and recovers from unexpected errors.

## Requirements

### Requirement: Shell shows the app title in the active language
The shell SHALL render the app title as the only page heading. The heading, the document title and the page `lang` attribute MUST follow the active UI language. Supported languages are English and Russian. <!-- implements FR2 of setup-app-shell-and-pages-deploy -->

#### Scenario: English user opens the app
- **WHEN** the active UI language is English
- **THEN** the page heading and the document title read "Time Zones"
- **AND** the page `lang` attribute is `en`

#### Scenario: Russian user opens the app
- **WHEN** the active UI language is Russian
- **THEN** the page heading and the document title read "Часовые пояса"
- **AND** the page `lang` attribute is `ru`

### Requirement: Theme follows the system and uses design tokens
All colors SHALL come from design tokens that have a light and a dark value. The active theme MUST follow the system color-scheme preference and MUST be applied before the first paint. Text MUST use the Manrope font, which MUST be available without network after the first visit. <!-- implements FR9, UX1, NFR-A3 of setup-app-shell-and-pages-deploy -->

#### Scenario: System prefers dark
- **WHEN** the system color-scheme preference is dark
- **THEN** the page renders with the dark token values from the first paint

#### Scenario: System prefers light
- **WHEN** the system color-scheme preference is light
- **THEN** the page renders with the light token values

#### Scenario: Font works offline
- **WHEN** the app is opened offline after a previous visit
- **THEN** the heading is rendered in Manrope

### Requirement: Offline-ready notice
When the app finishes preparing for offline use, the shell SHALL show a notice that the app works offline. The notice MUST be dismissible, MUST NOT take focus, MUST be announced to screen readers, and MUST appear at most once per installation. <!-- implements FR6, UX3, NFR-A2 of setup-app-shell-and-pages-deploy -->

#### Scenario: App becomes ready to work offline
- **WHEN** the app reports that it is ready to work offline for the first time
- **THEN** the offline-ready notice is shown and announced politely

#### Scenario: User dismisses the offline-ready notice
- **WHEN** the offline-ready notice is shown and the user dismisses it
- **THEN** the notice disappears

#### Scenario: Offline readiness is not announced again
- **WHEN** the app was already reported ready to work offline on an earlier visit
- **THEN** no offline-ready notice is shown

### Requirement: New version notice
When a new version of the app is available, the shell SHALL show a non-blocking notice with a reload action and a dismiss control. The reload action MUST switch the app to the new version. The app MUST NOT reload by itself. The notice MUST NOT cover the page heading. <!-- implements FR7, UX2, NFR-A2 of setup-app-shell-and-pages-deploy -->

#### Scenario: New version becomes available
- **WHEN** a new version of the app is waiting
- **THEN** the update notice is shown with a reload action
- **AND** the page keeps working without reloading

#### Scenario: User accepts the update
- **WHEN** the update notice is shown and the user chooses reload
- **THEN** the app switches to the new version

#### Scenario: User postpones the update
- **WHEN** the update notice is shown and the user dismisses it
- **THEN** the notice disappears and the current version keeps running

#### Scenario: Keyboard user handles the notice
- **WHEN** the update notice is shown and the user uses only the keyboard
- **THEN** the reload action and the dismiss control are reachable with Tab and work with Enter
- **AND** Esc dismisses the notice

### Requirement: Recovery screen on unexpected errors
If rendering fails unexpectedly, the shell SHALL replace the page content with a recovery screen that explains the problem in plain language and offers a reload action. The recovery screen MUST NOT show technical error details. <!-- implements FR8, UX4 of setup-app-shell-and-pages-deploy -->

#### Scenario: A part of the page fails to render
- **WHEN** rendering throws an unexpected error
- **THEN** the recovery screen is shown instead of a blank page
- **AND** it offers a reload action

#### Scenario: User recovers by reloading
- **WHEN** the recovery screen is shown and the user chooses reload
- **THEN** the app is loaded again

### Requirement: Layered modules and empty view registry
The application SHALL contain the layer modules model, presenter, controller and views, each exposing a single public entry point. The view registry MUST exist and MUST be empty in this change. The shell MUST read the registry and render no view while the registry is empty, without errors. <!-- implements FR11 of setup-app-shell-and-pages-deploy -->

#### Scenario: Shell with no registered views
- **WHEN** the view registry contains no views
- **THEN** the shell renders only the app title
- **AND** no error is reported

### Requirement: Locale files describe themselves
Every locale file SHALL carry a metadata block with `code`, `name`, `nativeName`, `baseLanguage` and `emoji`. The `code` MUST equal the locale file name. Every shell string MUST exist in every locale file. <!-- implements FR10, FR2 of setup-app-shell-and-pages-deploy -->

#### Scenario: Locale metadata matches the file
- **WHEN** the locale files are loaded
- **THEN** each file's metadata `code` equals its file name

#### Scenario: No missing shell strings
- **WHEN** the English and Russian locale files are compared
- **THEN** both contain the same set of keys

### Requirement: Accessible and responsive shell
The shell, the recovery screen and both notices SHALL have no automated accessibility violations in light and dark themes, and MUST NOT scroll horizontally at viewport widths from 320 px to 2560 px. <!-- implements NFR-A1, NFR-A3, NFR-R1 of setup-app-shell-and-pages-deploy -->

#### Scenario: Accessibility check in both themes
- **WHEN** the shell is checked with axe-core in light and in dark theme
- **THEN** no violations are reported

#### Scenario: Narrow and wide screens
- **WHEN** the shell is opened at 320 px and at 2560 px wide
- **THEN** the page has no horizontal scrolling
