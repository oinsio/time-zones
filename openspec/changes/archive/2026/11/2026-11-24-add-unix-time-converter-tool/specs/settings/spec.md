# Spec Delta

## MODIFIED Requirements

### Requirement: Toggle group
The zone label group SHALL be built from one reusable toggle group: a caption and any number of options, each an independent toggle that is on or off, shown after the caption in one row while they fit and wrapping onto further rows only when they do not. The group MUST take the options and the set of options that are on, and report each toggle the user makes, so a later setting can use it with other options without a new component. An option MAY be shown by an icon alone: its name is then its accessible name and its pointer hint, as for an option of the option group, and it shows no visible text; an icon toggle that is on takes the accent colour for its icon and border and shows no check mark, so toggling moves nothing. The toggle group and the option group MUST share one row layout. The toggle group's options stay separate toggle buttons, so they read as independent switches. <!-- implements FR16 of show-zone-abbreviations-and-zone-label-setting; FR6, UX3 of compact-settings-controls; NFR-R1 of add-country-to-zone-label; FR2, NFR-A1, UX2 of add-unix-time-converter-tool -->

#### Scenario: A group with three options
- **GIVEN** a toggle group with the caption "Sample" and the options A, B and C, of which B is on
- **WHEN** the user turns A on
- **THEN** the group reports that A is now on
- **AND** B stays on and C stays off

#### Scenario: Icon options
- **GIVEN** a toggle group with the caption "Sample" and the icon options A and B, of which A is on
- **WHEN** the group is shown
- **THEN** A and B each show an icon and no visible text, and each is named by its option name
- **AND** A is exposed as pressed and B as not pressed
- **WHEN** the user turns B on
- **THEN** the group reports that B is now on and no toggle changes its size or place

### Requirement: Settings page layout
The settings page SHALL use the app's design tokens: the page background, the groups on surface cards with the control border, the Manrope font and the accent colour for the checked option and the deploy time. Its text MUST be at least 4.5:1 against its background in both themes, and the control border at least 3:1 against the surface. The theme group, the hour format group, the view group, the colouring group, the Colours group and the tools group MUST each take one row at 320, 375, 1024 and 2560 px in English and Russian. The page MUST NOT scroll horizontally at 320, 390, 768, 820, 1024, 1440 and 2560 px. The approved screenshots of the settings page at 375 px and 1024 px in both themes MUST match. They show the theme group as three icons in the order System, Light, Dark with System checked, the hour format group as `12` and `24` with 24 checked, the view group as "Cards" and "Grid" with Cards checked, the colouring group as three icons in the order Plain, Time of day, Working hours with Time of day checked, the Colours group with the swatches of Vivid and Muted and Vivid checked, no working hours row, the zone label group with its toggles on and its example, the tools group with its toggles off, and the language group collapsed. The tools group MUST stand after the zone label group and before the language group. A further approved screenshot at 375 px in the light theme shows the Working hours colouring with its working hours row and no Colours group. The deploy time keeps its place in them but its text is hidden, because it changes with every build. They are re-taken once for the redesign and once for the tools group. <!-- implements NFR-A3, NFR-R1, NFR-R3, UX2 of add-settings-page-and-device-time-location; implements NFR-R2 of add-interface-language-selection; NFR-R3 of show-zone-abbreviations-and-zone-label-setting; NFR-R2 of polish-settings-and-remove-offline-update-notice; NFR-R1, NFR-R2 of compact-settings-controls; NFR-R1, NFR-R2 of add-view-mode-setting-and-grid-skeleton; NFR-R2 of add-day-colouring-setting; FR1, FR5, NFR-R1, NFR-R2 of redesign-cards-grid-and-day-palettes; FR2, NFR-R1 of add-unix-time-converter-tool -->

#### Scenario: Narrow and wide screens
- **WHEN** the settings page is `<width>` px wide
- **THEN** the page does not scroll horizontally

| width |
|---|
| 320 |
| 390 |
| 768 |
| 820 |
| 1024 |
| 1440 |
| 2560 |

#### Scenario: Compact groups
- **WHEN** the settings page is shown 375 px wide in `<language>`
- **THEN** the theme group, the hour format group, the view group, the colouring group, the Colours group and the tools group are each at most 56 px high

| language |
|---|
| English |
| Russian |

#### Scenario: Groups use the control border
- **WHEN** the settings page is shown in the `<theme>` theme
- **THEN** the border of every option group's joined control is `<border>`

| theme | border |
|---|---|
| light | `#8a8a93` |
| dark | `#6b7a99` |

#### Scenario: Approved screenshots
- **WHEN** the settings page is rendered at `<width>` px in the `<theme>` theme with the colouring `<colouring>`
- **THEN** it matches the approved screenshot

| width | theme | colouring |
|---|---|---|
| 375 | light | Time of day |
| 375 | dark | Time of day |
| 1024 | light | Time of day |
| 1024 | dark | Time of day |
| 375 | light | Working hours |

#### Scenario: Place of the tools group
- **WHEN** the settings page is shown
- **THEN** the group «Инструменты» stands after the zone label group and before the language group
