## MODIFIED Requirements

### Requirement: Gnomish Factory credit
The settings page SHALL show the Gnomish Factory credit as the line directly above the theme group, on every width: below the page header with the back button and the "Settings" heading, below any settings note (the unreadable-settings note with its Reset action, the save-failed note), and with nothing between the credit and the theme group. The credit MUST NOT be part of the page header. The credit MUST be one link whose text is the whole credit: "Built with Gnomish Factory" in English and «Создано с помощью Гномской фабрики» in Russian, following the interface language. The link's address MUST be `https://oinsio.github.io/gnomish-factory/`. Activating it MUST open that page in a new browsing context (a new tab, or the system browser for the installed app) that gets no reference to the app's window, and the app's own tab MUST keep the settings page with its locations, reference moment and preferences unchanged. The app MUST NOT request the landing page itself, so the settings page works the same offline. Inputs: the interface language, the settings notes shown, activation of the link. Output: the credit line; a new tab at the landing page. Errors: none; offline, the new tab shows the browser's own offline page and the app tab is unaffected. <!-- implements FR1, FR2, FR3, UX1, UX3 of add-gnomish-factory-credit; implements FR1, UX1 of move-and-restyle-gnomish-factory-credit -->

The credit MUST use the app's design tokens in the light and the dark theme: the Manrope font, an underline, and at rest, on hover and on keyboard focus the same colour as the icons of the theme options (the accent colour of the active theme). Its font size MUST be 15–20 % larger than 14 px, that is between 16.1 px and 16.8 px at the default root font size of 16 px. It MUST follow the active theme, also when the theme changes while the settings page is open, and MUST NOT introduce a colour the tokens do not define. <!-- implements FR4, UX2 of add-gnomish-factory-credit; implements FR2, FR3, UX2 of move-and-restyle-gnomish-factory-credit -->

The credit MUST be exposed as a link named exactly by its visible text. It MUST be reachable with Tab and Shift+Tab, come after the back button and before the theme group in the Tab order, open with Enter, show a visible focus outline in the accent colour, and be at least 44 px high. Opening the settings page MUST still move the focus to the heading. Its text MUST have a contrast of at least 4.5:1 against the page background in both themes, at rest and on focus, and axe-core MUST report no violations on the settings page with the credit. At 320 px and 2560 px the credit text MUST be shown in full in both languages (it may wrap) and the page MUST NOT scroll horizontally. <!-- implements NFR-A1, NFR-A2, NFR-R1 of add-gnomish-factory-credit; implements NFR-A1, NFR-A2, NFR-R1 of move-and-restyle-gnomish-factory-credit -->

#### Scenario: The credit in both languages
- **GIVEN** the interface language is `<language>`
- **WHEN** the user opens the settings
- **THEN** a link named `<credit>` to `https://oinsio.github.io/gnomish-factory/` is shown
- **AND** the link stands below the "Settings" heading and directly above the theme group

| language | credit |
|---|---|
| English | Built with Gnomish Factory |
| Russian | Создано с помощью Гномской фабрики |

#### Scenario: The credit below a settings note
- **GIVEN** the stored preferences document is not valid JSON
- **WHEN** the user opens the settings
- **THEN** the note about unreadable settings stands above the credit
- **AND** the credit stands directly above the theme group

#### Scenario: Following the credit keeps the app
- **GIVEN** the current time is `2026-03-09T07:30:00Z`
- **AND** the list is Moscow
- **AND** the settings page is shown
- **WHEN** the user follows the Gnomish Factory credit
- **THEN** a new tab opens at `https://oinsio.github.io/gnomish-factory/`
- **AND** the app's tab still shows the settings page
- **WHEN** the user goes back
- **THEN** the main page is shown with Moscow at `10:30`

#### Scenario: The credit offline
- **GIVEN** the app is installed for offline use
- **WHEN** the user reopens the app without network
- **AND** the user opens the settings
- **THEN** the credit is "Built with Gnomish Factory"

#### Scenario: Token colours in both themes
- **GIVEN** the `<theme>` theme is active
- **WHEN** the user opens the settings
- **THEN** the credit text has the colour of the theme option icons and is underlined
- **WHEN** the credit gets the keyboard focus
- **THEN** the credit text still has the colour of the theme option icons, with a focus outline in the accent colour
- **WHEN** the pointer rests on the credit without the keyboard focus
- **THEN** the credit text still has the colour of the theme option icons

| theme |
|---|
| light |
| dark |

#### Scenario: The credit follows a theme change
- **GIVEN** the theme System is chosen and the system color-scheme preference is light
- **AND** the settings page is shown
- **WHEN** the system color-scheme preference becomes dark
- **THEN** the credit text has the colour of the theme option icons of the dark theme

#### Scenario: The larger credit text
- **WHEN** the user opens the settings
- **THEN** the credit's font size is between 1.15 and 1.20 times 14 px

#### Scenario: Keyboard order and focus
- **GIVEN** the settings page is shown
- **THEN** the focus is on the "Settings" heading
- **WHEN** the user presses Tab
- **THEN** the focus is on the credit, with a focus outline in the accent colour
- **AND** the credit is at least 44 px high
- **WHEN** the user presses Shift+Tab
- **THEN** the focus is on the back button
- **WHEN** the user presses Tab and then Enter
- **THEN** a new tab opens at `https://oinsio.github.io/gnomish-factory/`

#### Scenario: The full credit on narrow and wide screens
- **GIVEN** the interface language is `<language>`
- **WHEN** the settings page is `<width>` px wide
- **THEN** the credit text is shown in full
- **AND** the page does not scroll horizontally

| language | width |
|---|---|
| English | 320 |
| Russian | 320 |
| Russian | 2560 |
