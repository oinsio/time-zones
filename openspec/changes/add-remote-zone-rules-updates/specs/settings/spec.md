# Spec Delta

## ADDED Requirements

### Requirement: Zone rules release line
The settings page SHALL show the zone rules release line directly after the deploy time: "Time zone rules: `<release>`" («Правила часовых поясов: `<release>`»), naming the active release. It MUST be plain text in the accent colour of the deploy time, not a link, not a Tab stop, and its strings MUST exist in every locale file. It MUST fit one line from 375 px and MUST NOT make the page scroll horizontally at 320 px. <!-- implements FR8, UX3, NFR-A1, NFR-R1 of add-remote-zone-rules-updates -->

#### Scenario: The line in both languages
- **GIVEN** the active release is `2026c`
- **WHEN** the settings page is shown in `<language>`
- **THEN** the line after the deploy time reads `<text>`

| language | text |
|---|---|
| English | Time zone rules: 2026c |
| Russian | Правила часовых поясов: 2026c |

#### Scenario: The line names the active release
- **GIVEN** the bundled release is `2026a` and the stored release `2026c` is active
- **WHEN** the settings page is shown
- **THEN** the line names `2026c`

#### Scenario: Plain text in the accent colour
- **WHEN** the settings page is shown in the `<theme>` theme
- **THEN** the release line has the colour of the deploy time
- **AND** it is not a Tab stop
- **AND** axe-core reports no violations

| theme |
|---|
| light |
| dark |

#### Scenario: The line fits
- **WHEN** the settings page is `<width>` px wide in `<language>`
- **THEN** the release line takes one line and the page does not scroll horizontally

| width | language |
|---|---|
| 375 | English |
| 375 | Russian |
| 320 | Russian |
