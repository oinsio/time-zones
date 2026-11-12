# Spec Delta

## ADDED Requirements

### Requirement: Zone rules release line
The settings page SHALL show the zone rules release line directly after the deploy time, as the last line of its content: "Time zone rules: `<release>`" («Правила часовых поясов: `<release>`»), naming the active release. It MUST be plain text in the accent colour of the deploy time, not a link, not a Tab stop and not a live region, and its strings MUST exist in every locale file. When no release is active, the line MUST be absent. It MUST fit one line from 375 px and MUST NOT make the page scroll horizontally at 320 px. Inputs: the active release, the interface language. Output: the release line. <!-- implements FR8, UX3, NFR-A1, NFR-R1 of add-remote-zone-rules-updates -->

#### Scenario: The line in both languages
- **GIVEN** the active release is `2026f`
- **WHEN** the settings page is shown in `<language>`
- **THEN** the line after the deploy time reads `<text>`

| language | text |
|---|---|
| English | Time zone rules: 2026f |
| Russian | Правила часовых поясов: 2026f |

#### Scenario: The line names the active release
- **GIVEN** the bundled release is `2026f` and the stored release `2026g` is active
- **WHEN** the settings page is shown
- **THEN** the line names `2026g`

#### Scenario: No active release
- **GIVEN** the zone rules failed to load at start
- **WHEN** the settings page is shown
- **THEN** the deploy time is the last line and no release line is shown

#### Scenario: Plain text in the accent colour
- **WHEN** the settings page is shown in the `<theme>` theme
- **THEN** the release line has the colour of the deploy time
- **AND** it is not a Tab stop
- **AND** axe-core reports no violations

| theme |
|---|
| light |
| dark |

#### Scenario: The line fits one line
- **WHEN** the settings page is 375 px wide in `<language>`
- **THEN** the release line takes one line

| language |
|---|
| English |
| Russian |

#### Scenario: The line at 320 px
- **WHEN** the settings page is 320 px wide in Russian
- **THEN** the settings page does not scroll horizontally

## MODIFIED Requirements

### Requirement: Deploy time
The settings page SHALL show the deploy time directly after the language group, also while the language list is expanded; only the zone rules release line follows it. The deploy time is the instant at which the running build of the app was made; it MUST be fixed into the build, MUST be the same online and offline and after a reload, and MUST change only with a new build. The line MUST read "Deployed `<date>` at `<time>`" («Развёрнуто `<date>` в `<time>`»): the date with the day, the month name and the year, and the time in the hour format, both in the interface language and in the device time zone. It MUST follow a change of the interface language and of the hour format at once, without a reload. The line MUST be plain text: not a link, not a Tab stop and not a live region. Its colour MUST be the accent colour of the settings page icons (the back button's chevron) in the light and the dark theme, and axe-core MUST report no violations on the settings page in both themes. The line MUST fit one line from 375 px; at 320 px it MAY wrap between words but MUST NOT make the page scroll horizontally. Inputs: the build instant, the interface language, the hour format, the device time zone. Output: the deploy time line. Errors: none; the build instant is always present. <!-- implements FR5, FR6, NFR-A1, NFR-R1, UX2 of polish-settings-and-remove-offline-update-notice; FR8 of add-remote-zone-rules-updates -->

#### Scenario: The deploy time in the interface language
- **GIVEN** the build was made at `2026-03-08T07:30:00.000Z`
- **AND** the device time zone is `<zone>`
- **WHEN** the settings page is shown in `<language>` with the hour format `<hour format>`
- **THEN** the line after the language group reads `<text>`

| zone | language | hour format | text |
|---|---|---|---|
| UTC | English | 24-hour | Deployed March 8, 2026 at 07:30 |
| UTC | English | 12-hour | Deployed March 8, 2026 at 7:30 AM |
| UTC | Russian | 24-hour | Развёрнуто 8 марта 2026 г. в 07:30 |
| Asia/Kolkata | English | 24-hour | Deployed March 8, 2026 at 13:00 |

#### Scenario: The deploy time follows the settings at once
- **GIVEN** the settings page shows the deploy time in English with the hour format 24-hour
- **WHEN** the user chooses the hour format 12-hour
- **THEN** the deploy time shows its time in the 12-hour format without a reload

#### Scenario: The deploy time is fixed into the build
- **GIVEN** the app was built at an instant
- **WHEN** the settings page is shown later, online or offline
- **THEN** the deploy time shows the build instant, not the current time

#### Scenario: The deploy time in the icon colour
- **WHEN** the settings page is shown in the `<theme>` theme
- **THEN** the deploy time has the colour of the back button's icon
- **AND** it is not a Tab stop
- **AND** axe-core reports no violations

| theme |
|---|
| light |
| dark |

#### Scenario: The deploy time fits one line
- **WHEN** the settings page is `<width>` px wide in `<language>`
- **THEN** the deploy time takes one line

| width | language |
|---|---|
| 375 | English, 12-hour |
| 375 | Russian |
| 1024 | English, 12-hour |
| 1024 | Russian |

#### Scenario: The deploy time at 320 px
- **WHEN** the settings page is 320 px wide in English with the hour format 12-hour or in Russian
- **THEN** the settings page does not scroll horizontally

