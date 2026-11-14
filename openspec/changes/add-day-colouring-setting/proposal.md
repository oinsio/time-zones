# Add the day colouring setting and the user's working hours

No other change is active in `openspec/changes/`, so no other change touches the `settings`, `time-selection` or `grid-view` capabilities this change modifies.

## Why

The day tracks of Cards and the hour cells of Grid are coloured by day period (night, morning, work, evening) with boundaries fixed in code: the work period is always 09:00–18:00 (`DAY_PERIOD_SCHEDULE`, `src/constants/dayPeriods.ts`). For planning a meeting, the question is when people are at work, and everyone's working hours differ. Some users find the four colours distracting and want one calm colour instead. `docs/architecture/domain-model.md` ("Day periods") and Q3 of `docs/architecture/open-questions.md` already expected a user setting to take the place of the constants. This change is the first step: the user picks how the day is coloured and sets their working hours. Later changes will refine the display.

Audience: every user of Cards and Grid, especially those planning meetings across zones.

## What Changes

- ADDED `day-colouring`: three day colourings (Plain, Time of day, Working hours) that apply to every day track and every hour cell. The capability also defines working time (the user's working hours in each location's local time, on Monday to Friday by the local date), the colours of the Plain and the Working hours colourings, the half-hour rule for an hour cell, and contrast rules for hour cell digits and the handle on every day colour.
- MODIFIED `settings`: a colouring group «Раскраска» / "Colouring" with three options; a working hours row «Рабочие часы» / "Working hours" with a start field and an end field, shown only for the Working hours colouring; both stored on the device in the preferences document, migrated for existing users, shared between tabs; a reusable time range group that other settings can use later.
- MODIFIED `time-selection`: "Day-period colours" now applies only while the day colouring is Time of day.
- MODIFIED `grid-view`: "Hour cell colour" follows the day colouring. "Hour frame" is drawn in the foreground colour when the cells are accent-coloured (Plain, Working hours), because an accent frame cannot be seen on accent cells.
- Glossary, new terms: **Day colouring** (`docs/glossary/settings.md`; it replaces the *(planned)* entry of `docs/glossary/views.md` that covered the Grid only) — *RU:* «Раскраска»: «Обычная», «По времени суток», «По рабочему времени». **Working hours** (`settings.md`) — *RU:* «Рабочие часы». **Time range group** (`settings.md`) — *RU:* группа диапазона времени. **Working day**, **Working time** and **Day colour** (`docs/glossary/time-selection.md`).
- Glossary, changed terms: **Colour stop** (a position and a day colour, not only a day period), **Hour cell** (coloured by the day colouring), **Day period** (its third period is named "work", not "working hours", so that **Working hours** names only the user's range; *Never:* working hours for the period), the work-period token `--color-day-working` renamed `--color-day-work`, **Hour frame** (foreground colour on accent cells), **Preferences** and **Settings page** (list the day colouring and the working hours).
- Architecture docs: `docs/architecture/domain-model.md` (Preferences, commands, "Day periods" → day colouring and working time), `docs/architecture/views.md` (Cell colouring, Day-period colors, Visual style tokens, Overlays → Settings), `docs/architecture/open-questions.md` (Q3 resolution amended).

## Capabilities

### New Capabilities
- `day-colouring`: the three day colourings, working days and working time, the colours of each colouring on day tracks and hour cells, readability of digits and the handle, and the work bounds of colouring.

### Modified Capabilities
- `settings`: ADDED "Colouring group", "Working hours row", "Time range group", "Day colouring and working hours are kept on the device", "Accessible colouring group and working hours row", "Colouring settings layout", "Colouring strings are localized".
- `time-selection`: MODIFIED "Day-period colours" (only in the Time of day colouring).
- `grid-view`: MODIFIED "Hour cell colour", "Hour frame".

## Impact

- `src/preferences/` (the day colouring enum, the working hours and their order rule, two commands, parsing), `src/adapters/preferencesDocument.ts` (schema version 6, migration step 5), `src/constants/preferences.ts` (schema version, option order) and a new `src/constants/workingTime.ts`.
- `src/model/` (new `workingTime.ts`: working days, working time spans, working-time stops, working hour cells), `src/presenter/` (new `dayColours.ts`: day colours and colour stops for every colouring, the hour frame colour; `dayTrack.ts`, `hourStrip.ts`, `presentZoneMoment.ts`, `presentLocationRows.ts` contexts; new `workingHours.ts` for the field texts).
- `src/controller/` (`PreferencesProvider`, `preferencesContext`, new `useDayColouring`, new `useWorkingHoursInput`; `useLocations`, `useHourGrid` pass the colouring).
- `src/views/shared/dayTrackGradient.ts`, `views/grid/HourCellView.tsx`, `views/grid/HourFrame.tsx`, `views/grid/GridView.tsx`; `src/app/settings/` (new `DayColouringGroup`, `WorkingHoursGroup`, `SettingsTimeRangeGroup`; `SettingsPage`); `src/styles/tokens.css` and `tailwind.config.ts` (the non-working grey; the work-period token `--color-day-working` renamed `--color-day-work` with its readers, same values); `src/locales/en.json`, `ru.json`.
- Features under `src/test/features/settings/`, `time_selection/`, `grid_view/`, the hour strip and row benchmarks, and the approved settings screenshots, which are re-approved once. The approved Cards and Grid screenshots keep their pixels.
- No new runtime dependency (the option icons come from the installed `lucide-react`), no new port, no new storage key: the preferences document gains two fields.

## Goals

- G1: A user can switch the day colouring between Plain, Time of day and Working hours in one tap on the settings page, and it applies to Cards and Grid at once.
- G2: A user who plans meetings sees, for every location, when that location is inside the user's working hours, to the minute on day tracks and by the half-hour rule on hour cells.
- G3: Nothing changes for users who do not open the setting: Time of day is the default and draws exactly what is drawn today.
- G4: The setting is compact and reusable: two one-row groups built from reusable settings elements.

## Non-Goals

- NG1: Public holidays and non-working days of a country.
- NG2: Weekends on days other than Saturday and Sunday (for example Friday and Saturday); every location has Saturday and Sunday off.
- NG3: Separate working hours per location.
- NG4: Working hours across midnight (night shifts); the start is always before the end within one local day.
- NG5: Changing the day-period boundaries of the Time of day colouring.
- NG6: Restyling the meeting frame, the meeting handles, the dimming outside a meeting or the midnight shade in any colouring.
- NG7: A legend explaining the colours on the main page.

## Users & Scenarios

- U1: A user in Moscow who works 09:07–17:30 chooses «По рабочему времени», types `9:07` and `17:30`, and sees in Grid which hours of New York and Tokyo overlap with those hours in each city's own local time.
- U2: A user who dislikes many colours chooses «Обычная»; tracks and cells become one accent colour, and the hour frame stays visible.
- U3: A user with the 12-hour format sees the working hours as `10:00 AM` and `6:00 PM` and types `5:30 pm`.
- U4: A user types an end before the start; the hint «Начало должно быть раньше конца» appears and the colouring keeps the last valid hours.
- U5: On Saturday in Moscow, a user still sees New York's Friday working hours at the start of the reference day.
- U6: A user switches to Time of day and back; the working hours they typed are still there.

## Requirements

### Functional

- FR1: The settings page SHALL show a colouring group captioned «Раскраска» / "Colouring" directly after the view group, with three options in the order «Обычная» / "Plain", «По времени суток» / "Time of day", «По рабочему времени» / "Working hours".
- FR2: The day colouring SHALL be Time of day by default, both for new users and for users whose stored preferences have no day colouring. In this colouring the day tracks and hour cells SHALL be drawn exactly as today.
- FR3: A choice of the day colouring SHALL apply to the main page at once, without a reload. It SHALL be stored on the device, survive a reload and be applied in every other open tab, under the existing preferences rules (nothing written before a change, debounced write, flush on hide, last write wins).
- FR4: While the day colouring is Working hours, a working hours row «Рабочие часы» / "Working hours" SHALL be shown directly under the colouring group, with a start field and an end field, 10:00–18:00 by default. In the other colourings the row SHALL be absent.
- FR5: The working hours fields SHALL show and accept times in the hour format chosen in the settings (12-hour or 24-hour), to the minute. A confirmed time SHALL be used exactly as typed, with no rounding: `9:07` is 09:07. The fields SHALL accept the same texts as the wall-time input.
- FR6: The start SHALL be before the end. A range whose start is at or after its end, or a text that is not a time, SHALL NOT be applied: a clear hint SHALL be shown, and the stored working hours SHALL stay the last valid ones.
- FR7: The working hours SHALL be stored on the device, survive a reload, be applied in every other open tab, and be kept when the day colouring changes.
- FR8: There SHALL be one set of working hours for all locations, read in each location's local time. An instant is working time for a location when the location's local date at that instant is Monday to Friday and its local wall-clock time is at or after the start and before the end. Saturday and Sunday are never working time. Because the rule reads local time at every instant, after a clock change inside the day the boundaries follow the local time after the change.
- FR9: In the Plain colouring, every day track and every hour cell SHALL be filled with the accent colour of the active theme, with no day periods and no working hours.
- FR10: In the Working hours colouring, a day track SHALL show working time in the accent colour and all other time in a light grey of the active theme, with a dark-theme grey of its own. The edge between them SHALL be hard, with no blend, at the exact instant of the boundary (for example 09:07).
- FR11: In the Working hours colouring, an hour cell SHALL be working when working time covers at least half of the cell (30 minutes of a one-hour cell), and SHALL be filled with the accent colour; otherwise it SHALL be grey. The same rule SHALL hold for cells that start at :30 or :45.
- FR12: The day colouring SHALL apply alike in every registered view: on the day tracks of Cards and the hour cells of Grid.
- FR13: While the hour cells are accent-coloured (Plain and Working hours), the hour frame SHALL be drawn in the foreground colour of the active theme. In Time of day it stays in the accent colour.
- FR14: The colouring group SHALL be built from the existing option group, with an icon per option. The working hours row SHALL be built from a new time range group: a reusable settings element with a caption, two named time fields, the texts it shows, the confirmed pair it reports and a hint it shows.
- FR15: Every string of the colouring group and the working hours row SHALL exist in every locale file, with the glossary names in Russian.

### Non-Functional

#### Performance

- NFR-P1: Presenting the day tracks and hour strips of 50 rows in 10 zones in the Working hours colouring SHALL look up at most 2 time zone transitions and build at most 3 formatters per zone the first time. A second presentation within the same reference day, colouring and working hours SHALL build no formatter, look up no transition and return the same colour stops and strip for every row. Changing the day colouring SHALL build no date-time formatter for the colours. Timings are reported by the existing `hourStrip.bench.ts` and `rowPresenting.bench.ts` benchmarks and never asserted (ADR-0008).

#### Accessibility

- NFR-A1: The colouring group SHALL be a radio group named by its caption, one Tab stop, with arrow keys in display order. Each option SHALL be named by its option name, be at least 44 × 44 px and show a visible focus outline.
- NFR-A2: The working hours fields SHALL be named «Начало рабочего дня» / "Start of working hours" and «Конец рабочего дня» / "End of working hours", be at least 44 px high and show a visible focus outline. A refused field SHALL be marked invalid and described by the hint, and the hint SHALL be announced politely.
- NFR-A3: In every day colouring and both themes, hour cell digits SHALL have a contrast of at least 4.5:1 against their cell colour. The handle's fill or border SHALL have a contrast of at least 3:1 against every track colour under it.
- NFR-A4: axe-core SHALL report no violations on the settings page with the working hours row (also with the hint shown), and on the main page in Cards and Grid in the Plain and Working hours colourings, in the light and the dark theme.

#### Responsive

- NFR-R1: The colouring group and the working hours row SHALL each take one row at most 56 px high at 375, 1024 and 2560 px, in English and Russian, in the 24-hour and the 12-hour format. The settings page SHALL NOT scroll horizontally at 320 and 2560 px with the working hours row shown.
- NFR-R2: The approved settings screenshots (375 and 1024 px, both themes) are re-approved once with the colouring group. New approved screenshots SHALL be added of Grid at 1280 px and Cards at 375 px in the Plain and the Working hours colourings, in both themes. The existing approved Cards and Grid screenshots SHALL match unchanged.

## UX Acceptance Criteria

- UX1: The colouring options look like the theme options: one joined control of three icons, with the option name as the pointer hint. The icons are a paint bucket for Plain, a sun with a moon for Time of day and a briefcase for Working hours.
- UX2: The working hours row reads as "Working hours  [10:00] – [18:00]". When it appears or disappears, the groups above it do not move.
- UX3: The hints are short and plain. «Начало должно быть раньше конца» / "The start must be before the end" for an order error, and the wall-time input's «Введите время в формате ЧЧ:ММ» / "Enter the time as HH:MM" for an unreadable time.
- UX4: The non-working grey is calm and lighter than any day-period colour in the light theme. In the dark theme it is a muted grey that does not glare on the dark background. Working hours stand out because they are the only accent-coloured parts.
- UX5: A confirmed time is shown again in the canonical form of the hour format (`9:7` → `09:07` in 24-hour, `9:07 AM` in 12-hour).

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | no stored preferences (first launch, empty) | Time of day checked, working hours row absent; default 10:00–18:00 shown once Working hours is chosen |
| any | stored preferences of version 5 or older | migrated: Time of day, 10:00–18:00, every other choice kept; nothing written until a change |
| any | stored preferences unreadable (error) | existing unreadable note with Reset; the defaults apply until Reset or a change |
| any | storage unavailable (degraded) | choices apply in memory; the existing save-failed note |
| any | a typed range refused (error) | fields marked invalid with the hint; stored range and colours unchanged |
| offline | any | everything works; no note (the settings need no network) |
| any | location list empty | the setting applies; the empty state of the view is unchanged |

There is no loading state: the preferences are read synchronously before the first render, as today.

## Behavior

- `packages/client/src/test/features/day_colouring/` (new): `day_colouring_day_tracks.feature`, `day_colouring_hour_cells.feature`, `day_colouring_budget.feature`, `day_colouring_e2e.feature`, `day_colouring_view_contract_e2e.feature`.
- `packages/client/src/test/features/settings/` (new): `settings_day_colouring_unit.feature`, `settings_working_hours.feature`, `settings_day_colouring_storage.feature`, `settings_day_colouring_e2e.feature`.
- Every scenario is tagged `@add-day-colouring-setting` with its requirement id. The existing day-period, hour-cell and screenshot scenarios still pass in the default colouring.

## Visual Reference

No Figma frame. The theme group (option group with icons) and the meeting range input (two compact time fields) are the visual reference. Design tokens are the source of truth: the accent `#2F5BD3` / `#5EC2E8` (`docs/architecture/views.md`, "Visual style"), and the new non-working greys of design D6 (`#ececef` light, `#3b4660` dark).

## Affected IA

No changes (the project has no `docs/ia/` document for the settings page).

## Success Metrics

- M1: 3 of 3 day colourings can be chosen, are restored after a reload and are applied in a second tab (the 3-row outline "Each colouring is kept and shared" of `settings_day_colouring_storage.feature`, unit BDD), and the working hours survive 2 of 2 colouring switches ("Working hours are kept across colourings").
- M2: 0 changed pixels in the existing approved Cards and Grid screenshots, which use the default Time of day colouring.
- M3: 100% of the hour cells match the half-cell rule in the 7 sample cases of `day_colouring_hour_cells.feature` (09:07, 09:40, Kolkata 10:00 and 10:15, Kathmandu 10:00, the Saturday in Moscow with Friday in New York, and Cairo's clock change on a Friday).
- M4: 0 axe-core violations in each of 12 runs: 4 on the settings page with the working hours row (light and dark, each without and with the hint shown) and 8 on the main page (Cards and Grid × Plain and Working hours × light and dark).
- M5: 7 day colours × 2 themes = 14 digit pairs at ≥ 4.5:1 and 14 handle checks at ≥ 3:1 in `tokens.test.ts`.
- M6: Mutation score ≥ 95% (minimum acceptable 90%) on the new and changed production files of `src/model/workingTime.ts`, `src/presenter/dayColours.ts`, `src/presenter/workingHours.ts`, `src/preferences/` and `src/adapters/preferencesDocument.ts`.

## Open Questions

None. Decided here and in the design: the colouring group stands after the view group (FR1, D8), equal start and end is refused (FR6), the hour frame turns to the foreground colour on accent cells (FR13, D7), and the 12-hour fields reuse the wall-time parser (FR5, D5).
