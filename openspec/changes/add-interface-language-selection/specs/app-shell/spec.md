## ADDED Requirements

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
A locale whose base language differs from its code SHALL be a dialect; easter-egg languages are dialects too. Every text of a dialect MUST come from the dialect's own locale file, and a key the dialect does not translate MUST come from its base language, then from English. Language-keyed data that has no entry for the dialect (city names, the first day of the week) MUST follow the same order: the dialect, its base language, English. Inputs: the interface language, the locale registry. Output: the shown text. Errors: none; a key missing everywhere shows as in any other language. <!-- implements FR10 of add-interface-language-selection -->

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

## MODIFIED Requirements

### Requirement: Shell shows the app title in the active language
The shell SHALL render the app title as the only page heading. The heading, the document title and the page `lang` attribute MUST follow the active UI language, also when it changes while the app is open, without a reload. The supported languages are exactly the locales of the locale registry; today these are English and Russian. <!-- implements FR2 of setup-app-shell-and-pages-deploy; implements FR5, FR9 of add-interface-language-selection -->

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
