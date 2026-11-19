## ADDED Requirements

### Requirement: Day palette
The day palette SHALL decide the colours of the four day periods in the Time of day colouring. It has two values, Vivid (the default) and Muted, with these colours:

| Period | Vivid, light | Vivid, dark | Muted, light | Muted, dark |
|---|---|---|---|---|
| Night | `#a4afd4` | `#4c5efa` | `#a3afd3` | `#56679a` |
| Morning | `#f0c6b8` | `#ffc3a5` | `#f8cbbe` | `#e0b1a4` |
| Day | `#f8e5a0` | `#fff68e` | `#f8e6a6` | `#eedba3` |
| Evening | `#e8c7df` | `#fda9e9` | `#d4c6ee` | `#b9aadb` |

In the Time of day colouring, the day tracks of Cards and the hour cells of Grid MUST use the colours of the day palette in force and of the active theme. The Plain colouring (accent) and the Working hours colouring (accent and non-working grey) MUST NOT change with the day palette, and a location without day periods keeps its accent colour in both palettes. A change of the day palette MUST recolour every day track and every hour cell at once, without a reload, and MUST NOT change the reference moment, the meeting range, the location list, the colour stops or the hour labels. Each colour of each palette and theme is one design token value, so a palette is swapped as a set. Inputs: the day palette, the day colouring, the active theme. Output: the colours of the day periods. Errors: none. <!-- implements FR3, FR4, NFR-P1 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Vivid by default
- **GIVEN** no preferences document is stored, the day colouring is Time of day and the light theme is active
- **WHEN** the main page shows Almaty in Cards
- **THEN** the day colours of the Almaty track are the Vivid light colours

#### Scenario: Palette colours in a real browser
- **GIVEN** the day colouring is Time of day, the `<theme>` theme and the `<palette>` day palette
- **WHEN** the main page is shown in the `<view>` view with Almaty at `2026-03-08T07:30:00Z`
- **THEN** the night colour used by Almaty's track or hour cells is `<night>`

| theme | palette | view | night |
|---|---|---|---|
| light | Vivid | Cards | `#a4afd4` |
| light | Muted | Cards | `#a3afd3` |
| dark | Vivid | Grid | `#4c5efa` |
| dark | Muted | Grid | `#56679a` |

#### Scenario: Other colourings ignore the palette
- **GIVEN** the list contains Almaty and the day colouring is `<colouring>`
- **WHEN** the user switches the day palette from Vivid to Muted
- **THEN** the colours of Almaty's track and hour cells do not change

| colouring |
|---|
| Plain |
| Working hours |

#### Scenario: Changing the palette keeps the moment
- **GIVEN** the list contains Almaty and the moment is pinned to `2026-03-09T06:00:00Z`
- **WHEN** the user chooses the Muted day palette
- **THEN** the moment is still pinned to `2026-03-09T06:00:00Z` and Almaty's colour stops are unchanged

#### Scenario: Changing the day palette re-presents nothing
- **GIVEN** 50 location rows are presented in the Time of day colouring with the Vivid day palette
- **WHEN** the day palette changes to Muted
- **THEN** the colour stops of every row keep their identity
- **AND** no date, time or region name formatter is built and no zone transition is looked up

## MODIFIED Requirements

### Requirement: Day colouring
The app SHALL colour the day tracks and the hour cells by one day colouring chosen in the settings: Plain, Time of day or Working hours. Time of day is the default. It colours by the day periods exactly as the `time-selection` requirement "Day-period colours by the sun" and the `grid-view` requirement "Hour cell colour" define, in the colours of the day palette in force ("Day palette"). Plain and Working hours colour as the requirements below define. A change of the day colouring MUST recolour every day track and every hour cell at once, without a reload, and MUST NOT change the reference moment, the meeting range, the location list or the hour labels. Inputs: the day colouring, the day palette, the working hours, the location's IANA identifier and coordinates, the reference day. Output: the colours of the location's day track and hour cells. Errors: none for known zones. <!-- implements FR2, FR3, FR9, FR10, FR11 of add-day-colouring-setting; FR5, FR10 of bind-day-periods-to-sun; FR4 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Time of day by default
- **GIVEN** no preferences document is stored
- **AND** the device time zone is `Asia/Almaty` and the current instant is `2026-03-08T07:30:00Z`
- **WHEN** the tracks of Almaty and New York are presented
- **THEN** their colour stops are the day-period stops of the `time-selection` scenario "Colour stops of Almaty and New York"

#### Scenario: Changing the colouring keeps the moment
- **GIVEN** the list contains Almaty and the moment is pinned to `2026-03-09T06:00:00Z`
- **WHEN** the user chooses the Plain colouring
- **THEN** the moment is still pinned to `2026-03-09T06:00:00Z`
- **AND** the Almaty track has one colour, plain

### Requirement: Day colours are readable
In every day colouring, both themes and both day palettes, the digits and texts of an hour cell SHALL have a contrast of at least 4.5:1 against the cell's colour: the four day-period colours of each palette, the accent colour and the non-working grey. In the dark theme the digits MUST be `#f7f8fc` on night cells and `#0b1628` on morning, day and evening cells, in both palettes; in the light theme the digits on day-period cells are the foreground colour. The handle of a day track MUST keep its fill or its border at a contrast of at least 3:1 against every track colour under it. The non-working grey MUST differ from the accent colour. In the light theme it MUST be a light grey with a higher relative luminance than each of the four light day-period colours of both palettes. In the dark theme it MUST be a muted grey of its own with a lower relative luminance than each of the four dark day-period colours of both palettes, so it does not glare on the dark background. axe-core MUST report no violations on the main page in Cards and in Grid in every colouring, and in the Time of day colouring for each of the four pairs of theme and day palette. <!-- implements NFR-A3, NFR-A4, UX4 of add-day-colouring-setting; FR4, NFR-A1, NFR-A2 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Digit contrast on every cell colour
- **WHEN** the design tokens of the `<theme>` theme and the `<palette>` day palette are read
- **THEN** the hour cell digit colour of each day colour has at least 4.5:1 against that colour
- **AND** the handle's fill or border has at least 3:1 against each track colour
- **AND** the non-working grey is `<lightness>` than each of the four day-period colours of that theme and palette

| theme | palette | lightness |
|---|---|---|
| light | Vivid | lighter (higher relative luminance) |
| light | Muted | lighter (higher relative luminance) |
| dark | Vivid | darker (lower relative luminance) |
| dark | Muted | darker (lower relative luminance) |

#### Scenario: Night digits in the dark theme
- **GIVEN** the view mode is Grid, the dark theme, the `<palette>` day palette and the stored location Almaty at `2026-03-08T07:30:00Z`
- **WHEN** the main page is shown
- **THEN** the digits of Almaty's night cells are `#f7f8fc` and those of its day cells `#0b1628`

| palette |
|---|
| Vivid |
| Muted |

#### Scenario: Accent and grey in a real browser
- **GIVEN** the view mode is Grid, the stored location is Almaty, the `<theme>` theme is active and the day colouring is Working hours with 10:00–18:00
- **WHEN** the main page is shown at `2026-03-09T06:00:00Z`
- **THEN** the cell of Almaty in column 10 has the `<theme>` accent colour and the cell in column 8 the `<theme>` non-working grey

| theme |
|---|
| light |
| dark |

#### Scenario: No violations for every theme and palette
- **GIVEN** the stored locations are Almaty, Moscow, Kolkata and New York and the day colouring is Time of day
- **WHEN** axe-core checks the main page in the `<view>` view, the `<theme>` theme and the `<palette>` day palette
- **THEN** it reports no violations

| view | theme | palette |
|---|---|---|
| Cards | light | Vivid |
| Cards | light | Muted |
| Cards | dark | Vivid |
| Cards | dark | Muted |
| Grid | light | Vivid |
| Grid | light | Muted |
| Grid | dark | Vivid |
| Grid | dark | Muted |

#### Scenario: No violations in every colouring
- **GIVEN** the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** axe-core checks the main page in the `<view>` view, the `<colouring>` colouring and the `<theme>` theme
- **THEN** it reports no violations

| view | colouring | theme |
|---|---|---|
| Cards | Plain | light |
| Cards | Working hours | dark |
| Grid | Plain | dark |
| Grid | Working hours | light |

### Requirement: Approved screenshots of the colourings
The approved screenshots of Grid at 1280 px and of Cards at 375 px, with Almaty, Moscow, Kolkata and New York at `2026-03-09T06:00:00Z`, MUST match in the Plain, the Time of day and the Working hours (10:00–18:00) colourings, in the light and the dark theme, and in the Time of day colouring also with the Muted day palette. They are re-taken once for the redesign and then MUST match on every run. <!-- implements NFR-R2, UX4 of add-day-colouring-setting; NFR-R1, FR10 of bind-day-periods-to-sun; NFR-R2 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Screenshots of the colourings
- **WHEN** the `<view>` view is rendered at `<width>` px in the `<colouring>` colouring, the `<theme>` theme and the `<palette>` day palette
- **THEN** it matches the approved screenshot

| view | width | colouring | theme | palette |
|---|---|---|---|---|
| Grid | 1280 | Plain | light | Vivid |
| Grid | 1280 | Plain | dark | Vivid |
| Grid | 1280 | Time of day | light | Vivid |
| Grid | 1280 | Time of day | dark | Vivid |
| Grid | 1280 | Time of day | dark | Muted |
| Grid | 1280 | Working hours | light | Vivid |
| Grid | 1280 | Working hours | dark | Vivid |
| Cards | 375 | Plain | light | Vivid |
| Cards | 375 | Plain | dark | Vivid |
| Cards | 375 | Time of day | light | Vivid |
| Cards | 375 | Time of day | dark | Vivid |
| Cards | 375 | Time of day | light | Muted |
| Cards | 375 | Time of day | dark | Muted |
| Cards | 375 | Working hours | light | Vivid |
| Cards | 375 | Working hours | dark | Vivid |
