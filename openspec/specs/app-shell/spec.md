# app-shell Specification

## Purpose

The application frame that every view lives in: it names the app in the user's language, applies the theme and font, keeps the app usable offline, tells the user about offline readiness and new versions, and recovers from unexpected errors.

## Requirements

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
When a new version of the app is available, the shell SHALL show a non-blocking notice with a reload action and a dismiss control. The reload action MUST switch the app to the new version. The app MUST NOT reload by itself. The notice MUST NOT cover the page heading. The app MUST check for a new version when it starts, and again each time the page becomes visible once at least 15 minutes have passed since the last check; no check MUST run while the page is hidden. A failed check, because the network is unreachable or for any other reason, MUST show nothing: no note, no notice and no error, and the app MUST keep working as before; the next check runs by the same rule. <!-- implements FR7, UX2, NFR-A2 of setup-app-shell-and-pages-deploy; FR10 of support-legacy-ios-12-safari; FR7 of polish-settings-and-remove-offline-update-notice -->

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

#### Scenario: Returning to the app checks again
- **GIVEN** the app last checked for a new version 16 minutes ago
- **WHEN** the page becomes visible
- **THEN** the app checks for a new version

#### Scenario: Returning soon after a check does not check
- **GIVEN** the app last checked for a new version 5 minutes ago
- **WHEN** the page becomes visible
- **THEN** no check runs

#### Scenario: Hiding the page does not check
- **GIVEN** the app last checked for a new version 16 minutes ago
- **WHEN** the page becomes hidden
- **THEN** no check runs

#### Scenario: A check on return fails offline
- **GIVEN** the start-up check for a new version succeeded 16 minutes ago
- **AND** the network is now unreachable
- **WHEN** the page becomes visible
- **THEN** the app checks for a new version
- **AND** the notices region stays empty

#### Scenario: The start-up check fails
- **GIVEN** the network is unreachable
- **WHEN** the app starts and its check for a new version fails
- **THEN** the notices region stays empty
- **AND** a shown update or offline-ready notice stays visible

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
The application SHALL contain the layer modules model, presenter, controller and views, each exposing a single public entry point. The view registry MUST exist and MUST contain the Cards view. The shell MUST render the main page, which reads the registry, and MUST NOT fail if the registry is empty. <!-- implements FR2, FR3 of add-main-page-scaffold -->

#### Scenario: Shell renders the main page
- **WHEN** the app is opened
- **THEN** the shell renders the main page with the Cards view

#### Scenario: Shell with no registered views
- **WHEN** the view registry contains no views
- **THEN** the shell renders the app title and an error-free empty content region

### Requirement: Locale files describe themselves
Every locale file SHALL carry a metadata block with `code`, `name`, `nativeName`, `baseLanguage` and `emoji`, each a non-empty string. The `code` MUST equal the locale file name. Every shell string MUST exist in every locale file. The English locale MUST have the emoji 🇺🇸. The locale registry SHALL collect every locale file in the locales folder with no hand-written list of languages. A file whose metadata misses a field or has an empty one, or whose `code` differs from its file name or is not a canonical language tag, MUST be left out of the registry. The registry MUST always contain English. The metadata block MUST NOT be part of the translations. The registry SHALL be the only source of the supported languages and of the language list on the settings page. Inputs: the locale files. Output: the registered locales, sorted by `name`. Errors: none at run time; a rejected file is simply absent. <!-- implements FR10, FR2 of setup-app-shell-and-pages-deploy; implements FR9, FR11 of add-interface-language-selection -->

#### Scenario: Locale metadata matches the file
- **WHEN** the locale files are loaded
- **THEN** each file's metadata `code` equals its file name

#### Scenario: No missing shell strings
- **WHEN** the English and Russian locale files are compared
- **THEN** both contain the same set of keys

#### Scenario: Registry from locale files
- **GIVEN** locale files `en`, `ru` and `de` with complete metadata
- **WHEN** the registry is built
- **THEN** it lists `en`, `de` and `ru`, in this order, sorted by `name` (English, German, Russian)
- **AND** no other source names the languages

#### Scenario: Rejected locale files
- **GIVEN** a locale file `<file>` whose metadata `<defect>`
- **WHEN** the registry is built
- **THEN** the registry does not contain it

| file | defect |
|---|---|
| `de` | has no `nativeName` |
| `fr` | has an empty `emoji` |
| `es` | has the code `pt` |
| `en_pirate` | has the code `en_pirate`, not a language tag |

#### Scenario: Metadata is not a translation
- **WHEN** the registry gives the English translations to the interface
- **THEN** they contain no `_meta` key

#### Scenario: American flag for English
- **WHEN** the English locale file is read
- **THEN** its metadata emoji is 🇺🇸

### Requirement: Accessible and responsive shell
The shell, the recovery screen and both notices SHALL have no automated accessibility violations in light and dark themes, and MUST NOT scroll horizontally at viewport widths from 320 px to 2560 px. <!-- implements NFR-A1, NFR-A3, NFR-R1 of setup-app-shell-and-pages-deploy -->

#### Scenario: Accessibility check in both themes
- **WHEN** the shell is checked with axe-core in light and in dark theme
- **THEN** no violations are reported

#### Scenario: Narrow and wide screens
- **WHEN** the shell is opened at 320 px and at 2560 px wide
- **THEN** the page has no horizontal scrolling

### Requirement: Interface language at start
The app SHALL start in the interface language chosen on the settings page when one is stored and its code is registered. Otherwise it SHALL use the first browser language, in the browser's order of preference, that matches a registered locale: first a locale whose code equals the browser language exactly, then a locale whose code equals its own base language and equals the browser language's primary subtag (`ru-RU` matches `ru`). A dialect MUST be picked from the browser language only by an exact code match. When no browser language matches, the app MUST use English. The language in force MUST be applied before the main page is first shown, with no flash of another language, online and offline alike. Inputs: the stored interface language, the browser languages, the locale registry. Output: the interface language in force. Errors: none; an unknown stored code is treated as no choice. <!-- implements FR7, FR8 of add-interface-language-selection -->

#### Scenario: Browser language decides without a choice
- **GIVEN** no interface language is chosen
- **WHEN** the app starts with the browser languages `<browser>`
- **THEN** the interface language is `<language>`

| browser | language |
|---|---|
| `ru-RU` | `ru` |
| `de-DE`, `ru` | `ru` |
| `en-US` | `en` |
| `de-DE` | `en` |

#### Scenario: A chosen language wins over the browser
- **GIVEN** the chosen interface language is `ru`
- **WHEN** the app starts with the browser language `en-US`
- **THEN** the page heading reads "Часовые пояса" from the first render

#### Scenario: A chosen code that is no longer registered
- **GIVEN** the chosen interface language is `xx`, which no locale file has
- **WHEN** the app starts with the browser language `ru-RU`
- **THEN** the interface language is `ru`
- **AND** nothing is written to the preferences document

#### Scenario: A dialect is not picked by its base language
- **GIVEN** the registry has `ru` and a dialect `ru-KZ` with base language `ru`
- **WHEN** the app starts with the browser language `ru-RU`
- **THEN** the interface language is `ru`

### Requirement: Dialect fallback
A locale whose base language differs from its code SHALL be a dialect; easter-egg languages are dialects too. Every text of a dialect MUST come from the dialect's own locale file, and a key the dialect does not translate MUST come from its base language, then from English. Language-keyed data that has no entry for the dialect (city names, the first day of the week) MUST follow the same order: the dialect, its base language, English. Dates, weekdays, months and country names formatted through `Intl` MUST be formatted with that order as their locale list, so a dialect whose code `Intl` does not support reads its base language, or else English, and never the device's own locale. Inputs: the interface language, the locale registry. Output: the shown text. Errors: none; a key missing everywhere shows as in any other language. <!-- implements FR10 of add-interface-language-selection; FR5 of show-city-labels-in-interface-language -->

#### Scenario: Fallback order of a dialect
- **GIVEN** a dialect `ru-KZ` with base language `ru`
- **AND** the key `a` is translated in `ru-KZ`, `ru` and `en`
- **AND** the key `b` is translated in `ru` and `en` only
- **AND** the key `c` is translated in `en` only
- **WHEN** the interface language is `ru-KZ`
- **THEN** `a` shows the `ru-KZ` text, `b` the `ru` text and `c` the `en` text

#### Scenario: Language-keyed data of a dialect
- **GIVEN** a dialect `ru-KZ` with base language `ru`
- **WHEN** the interface language is `ru-KZ`
- **THEN** the city of `Asia/Almaty` is named «Алматы»
- **AND** calendar weeks start on Monday

#### Scenario: Intl data of a dialect Intl does not know
- **GIVEN** a dialect `tlh` with base language `ru`, a code `Intl` supports no data for
- **AND** the device's own locale is English
- **WHEN** the interface language is `tlh`
- **THEN** the country of `KZ` is named «Казахстан»
- **AND** the local date of a row and the date bar weekday equal their Russian texts

### Requirement: Zone rules update notice
When a check finds a newer zone rules release than the active one that is the stored release (stored before or by this check; see zone-rules-updates "Stored release document"), the shell SHALL show a non-blocking notice naming the release, with a Reload action and a dismiss control, in the notices region after the update notice. Reload MUST reload the page, and when a new version is also waiting, Reload MUST apply that version as the update notice's Reload does, so either Reload applies both. The app MUST NOT reload by itself. The notice MUST NOT cover the page heading and MUST behave as the update notice for keyboard and focus. <!-- implements FR7, UX1, UX2, NFR-A1 of add-remote-zone-rules-updates -->

#### Scenario: Notice names the release
- **WHEN** a check finds the newer release `2026g`
- **THEN** the notice reads "Time zone rules 2026g are ready. Reload to use them." and offers a Reload action and a dismiss control

#### Scenario: User reloads
- **WHEN** the zone rules update notice is shown and the user chooses Reload
- **THEN** the page reloads

#### Scenario: User dismisses
- **WHEN** the zone rules update notice is shown and the user dismisses it
- **THEN** the notice disappears and the page keeps running

#### Scenario: Keyboard user handles the notice
- **WHEN** the zone rules update notice is shown and the user uses only the keyboard
- **THEN** Reload and the dismiss control are reachable with Tab and work with Enter
- **AND** Esc dismisses the notice
- **AND** the page heading stays visible

#### Scenario: Both notices at once
- **WHEN** a new version is waiting and a check finds a newer zone rules release
- **THEN** both notices are shown, each with its own Reload
- **AND** the Reload of the zone rules update notice applies the waiting version

#### Scenario: Russian notice
- **GIVEN** the interface language is Russian
- **WHEN** a check finds the newer release `2026g`
- **THEN** the notice reads «Доступны правила часовых поясов 2026g. Перезагрузите, чтобы применить.»

#### Scenario: No accessibility violations
- **WHEN** the zone rules update notice is shown in the `<theme>` theme
- **THEN** axe-core reports no violations

| theme |
|---|
| light |
| dark |
