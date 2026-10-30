# Spec Delta

## MODIFIED Requirements

### Requirement: Theme follows the system and uses design tokens
All colors SHALL come from design tokens that have a light and a dark value. The active theme MUST follow the theme preference (see the `settings` capability): Light and Dark apply their token values whatever the system color-scheme preference is, and System, the default, follows the system color-scheme preference. Without a stored theme preference, the system color-scheme preference MUST be applied before the first paint. A stored Light or Dark choice MUST be applied before the main page is first shown. Text MUST use the Manrope font, which MUST be available without network after the first visit. <!-- implements FR9, UX1, NFR-A3 of setup-app-shell-and-pages-deploy; FR4 of add-settings-page-and-device-time-location -->

#### Scenario: System prefers dark
- **GIVEN** the theme preference is System
- **WHEN** the system color-scheme preference is dark
- **THEN** the page renders with the dark token values from the first paint

#### Scenario: System prefers light
- **GIVEN** the theme preference is System
- **WHEN** the system color-scheme preference is light
- **THEN** the page renders with the light token values

#### Scenario: Stored Dark on a light system
- **GIVEN** the stored theme preference is Dark
- **AND** the system color-scheme preference is light
- **WHEN** the app is opened
- **THEN** the main page renders with the dark token values from its first render

#### Scenario: Font works offline
- **WHEN** the app is opened offline after a previous visit
- **THEN** the heading is rendered in Manrope
