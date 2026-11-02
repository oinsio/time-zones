## MODIFIED Requirements

### Requirement: Interface language choice
The settings page SHALL show the group "Language" («Язык») directly below the hour format group, with a caption styled like the captions of the theme and hour format groups. Collapsed, the group MUST show one button with the emoji and native name of the active interface language and a chevron pointing down. Activating the button MUST expand the language list directly under it, in the page flow, with no dialog, popover or overlay, and the chevron MUST turn; activating it again MUST collapse the list. The list MUST have one row per registered locale, showing the locale's metadata emoji and native name, never translated, sorted by the metadata `name`. The row of the active interface language MUST be marked by the accent border and a check icon at its end, like the checked option of the theme group. Choosing a row MUST apply that language at once, without a reload and without a loading state, and collapse the list. Every interface text, country name, date, month and weekday name, city name in the search results, city label of a city location, exemplar city of the device time location, the page `lang` attribute and the document title MUST follow the new language at once. Inputs: the button, the chosen row. Output: the interface language in force, the stored choice. Errors: none. <!-- implements FR1, FR2, FR3, FR4, FR5, UX1, UX2, UX3 of add-interface-language-selection; FR2 of show-city-labels-in-interface-language -->

#### Scenario: Collapsed group
- **GIVEN** the interface language is English
- **WHEN** the user opens the settings
- **THEN** below the hour format group a group "Language" shows a button "🇺🇸 English" with a chevron
- **AND** no language list is shown

#### Scenario: Expand and collapse
- **GIVEN** the settings page is shown
- **WHEN** the user expands the language group
- **THEN** the list shows "🇺🇸 English" and then "🇷🇺 Русский", right under the button
- **AND** "🇺🇸 English" is marked as chosen
- **WHEN** the user activates the button again
- **THEN** the list is not shown

#### Scenario: Names are not translated
- **GIVEN** the interface language is Russian
- **WHEN** the user expands the language group
- **THEN** the rows read "🇺🇸 English" and "🇷🇺 Русский"

#### Scenario: Choosing Russian applies at once
- **GIVEN** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is Almaty
- **WHEN** the user chooses «Русский» in the language group
- **THEN** the list collapses and the button shows "🇷🇺 Русский"
- **AND** the settings heading reads «Настройки» without a reload
- **AND** after going back Almaty reads «Алматы» and shows the country «Казахстан», and the date bar shows a Russian weekday
- **AND** searching `Алм` offers «Алматы»

