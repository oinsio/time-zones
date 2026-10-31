## ADDED Requirements

### Requirement: Gnomish Factory credit
The settings page SHALL show the Gnomish Factory credit as its top line, above the back button and the "Settings" heading, on every width. The credit MUST be one link whose text is the whole credit: "Built with Gnomish Factory" in English and «Создано с помощью Гномской фабрики» in Russian, following the interface language. The link's address MUST be `https://oinsio.github.io/gnomish-factory/`. Activating it MUST open that page in a new browsing context (a new tab, or the system browser for the installed app) that gets no reference to the app's window, and the app's own tab MUST keep the settings page with its locations, reference moment and preferences unchanged. The app MUST NOT request the landing page itself, so the settings page works the same offline. Inputs: the interface language, activation of the link. Output: the credit line; a new tab at the landing page. Errors: none; offline, the new tab shows the browser's own offline page and the app tab is unaffected. <!-- implements FR1, FR2, FR3, UX1, UX3 of add-gnomish-factory-credit -->

The credit MUST use the app's design tokens in the light and the dark theme: the Manrope font, the muted foreground colour at rest, the accent colour on hover and on keyboard focus, and an underline. It MUST follow the active theme, also when the theme changes while the settings page is open, and MUST NOT introduce a colour the tokens do not define. <!-- implements FR4, UX2 of add-gnomish-factory-credit -->

The credit MUST be exposed as a link named exactly by its visible text. It MUST be reachable with Tab and Shift+Tab, come before the back button in the Tab order, open with Enter, show a visible focus outline in the accent colour, and be at least 44 px high. Opening the settings page MUST still move the focus to the heading. Its text MUST have a contrast of at least 4.5:1 against the page background in both themes, at rest and on focus, and axe-core MUST report no violations on the settings page with the credit. At 320 px and 2560 px the credit text MUST be shown in full in both languages (it may wrap) and the page MUST NOT scroll horizontally. <!-- implements NFR-A1, NFR-A2, NFR-R1 of add-gnomish-factory-credit -->

#### Scenario: The credit in both languages
- **GIVEN** the interface language is `<language>`
- **WHEN** the user opens the settings
- **THEN** the first line of the page is a link named `<credit>` to `https://oinsio.github.io/gnomish-factory/`
- **AND** the link stands above the back button and the "Settings" heading

| language | credit |
|---|---|
| English | Built with Gnomish Factory |
| Russian | Создано с помощью Гномской фабрики |

#### Scenario: Following the credit keeps the app
- **GIVEN** the current time is `2026-03-09T07:30:00Z`
- **AND** the list is Moscow
- **AND** the settings page is shown
- **WHEN** the user follows the Gnomish Factory credit
- **THEN** a new tab opens at `https://oinsio.github.io/gnomish-factory/`
- **AND** the app's tab still shows the settings page
- **WHEN** the user goes back
- **THEN** the main page is shown with Moscow at `10:30`

#### Scenario: Token colours in both themes
- **GIVEN** the `<theme>` theme is active
- **WHEN** the user opens the settings
- **THEN** the credit text has the muted foreground colour of the `<theme>` theme and is underlined
- **WHEN** the credit gets the keyboard focus
- **THEN** the credit text has the accent colour of the `<theme>` theme
- **WHEN** the pointer rests on the credit without the keyboard focus
- **THEN** the credit text has the accent colour of the `<theme>` theme

| theme |
|---|
| light |
| dark |

#### Scenario: The credit follows a theme change
- **GIVEN** the theme System is chosen and the system color-scheme preference is light
- **AND** the settings page is shown
- **WHEN** the system color-scheme preference becomes dark
- **THEN** the credit text has the muted foreground colour of the dark theme

#### Scenario: Keyboard order and focus
- **GIVEN** the settings page is shown
- **THEN** the focus is on the "Settings" heading
- **WHEN** the user presses Shift+Tab twice
- **THEN** the focus is on the credit, with a focus outline in the accent colour
- **AND** the credit is at least 44 px high
- **WHEN** the user presses Enter
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

## MODIFIED Requirements

### Requirement: Settings strings are localized
Every string of the settings button, the settings page, its options, its notes, its Reset action and its Gnomish Factory credit SHALL exist in English and Russian, and Russian MUST use the glossary names: «Настройки», «Тема», «Светлая», «Тёмная», «Системная», «Формат времени», «12 часов», «24 часа», «Гномская фабрика». <!-- implements FR16 of add-settings-page-and-device-time-location; implements FR2 of add-gnomish-factory-credit -->

#### Scenario: Both languages
- **WHEN** the settings page is shown in `<language>`
- **THEN** the heading is `<heading>` and the groups are `<theme>` and `<hour format>`
- **AND** the credit is `<credit>`

| language | heading | theme | hour format | credit |
|---|---|---|---|---|
| English | Settings | Theme | Hour format | Built with Gnomish Factory |
| Russian | Настройки | Тема | Формат времени | Создано с помощью Гномской фабрики |
