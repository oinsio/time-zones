## MODIFIED Requirements

### Requirement: Shell shows the app title in the active language
The shell SHALL render the app title as the only page heading, except while the meeting bar is shown (`grid-view` → Meeting bar), when the meeting bar title is the only page heading in place of the app title; the document title stays the app title. The heading, the document title and the page `lang` attribute MUST follow the active UI language, also when it changes while the app is open, without a reload. The supported languages are exactly the locales of the locale registry; today these are English and Russian. <!-- implements FR2 of setup-app-shell-and-pages-deploy; implements FR5, FR9 of add-interface-language-selection; FR13 of add-grid-meeting-range-and-share -->

#### Scenario: English user opens the app
- **WHEN** the active UI language is English
- **THEN** the page heading and the document title read "Time Zones"
- **AND** the page `lang` attribute is `en`

#### Scenario: Russian user opens the app
- **WHEN** the active UI language is Russian
- **THEN** the page heading and the document title read "Часовые пояса"
- **AND** the page `lang` attribute is `ru`

#### Scenario: The language changes while the app is open
- **GIVEN** the active UI language is English
- **WHEN** the user chooses Russian on the settings page
- **THEN** the document title reads "Часовые пояса" and the page `lang` attribute is `ru` without a reload

#### Scenario: The meeting bar title replaces the heading
- **GIVEN** the active UI language is English
- **WHEN** the Grid view shows a meeting range of 2 hours
- **THEN** the only page heading reads "Meeting · 2 h"
- **AND** the document title reads "Time Zones"
