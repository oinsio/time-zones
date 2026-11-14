# Design: Day colouring setting and working hours

## Context

Driven by FR1–FR15, NFR-P1, NFR-A1–NFR-A4 and NFR-R1–NFR-R2 from `proposal.md`.

What the code does today, as checked in this round:

- The day periods and their schedule are model code. `DayPeriod`, `DAY_PERIOD_SCHEDULE` and `getDayPeriod` live in `src/model/dayPeriods.ts`. The boundary constants (`WORK_START_WALL_TIME = "09:00"` and others) live in `src/constants/dayPeriods.ts`. The blend windows and offset edges are in `src/model/dayPeriodWindows.ts`, and the memoized stops (`getDayPeriodStops`, cached per reference day for the default schedule) in `src/model/dayPeriodStops.ts`.
- Hour cells (`src/model/hourCells.ts`) carry `dayPeriod` from `getDayPeriod(localStart.toPlainTime(), DAY_PERIOD_SCHEDULE)`. They are cached per reference day and reference zone, and use one `findOffsetTransitions` call per zone.
- The presenter passes them on. `presentDayTrack` (`src/presenter/dayTrack.ts`) returns `stops: getDayPeriodStops(timeZoneId, day)`, and `presentHourStrip` (`src/presenter/hourStrip.ts`) returns `PresentedHourCell.dayPeriod`. The hour strip is cached by day, reference zone, language and hour format.
- The views map a period to a token. `DAY_PERIOD_COLOR_VARIABLES` and `buildDayTrackGradient` are in `src/views/shared/dayTrackGradient.ts`. `HourCellView` (`src/views/grid/HourCellView.tsx`) picks `text-foreground` for night and `text-hour-cell-foreground` otherwise. `HourFrame` (`src/views/grid/HourFrame.tsx`) is `border-2 border-accent`.
- The preferences hold `theme`, `hourFormat`, `interfaceLanguage`, `zoneLabelParts` and `viewMode` (`src/preferences/preferences.ts`). Their commands are reduced by `reducePreferences`, and `parseStoredPreferences` rejects any unknown value as a whole. The document is versioned by `PREFERENCES_SCHEMA_VERSION = 5` (`src/constants/preferences.ts`) and migrated by `createPreferencesMigrations` (`src/adapters/preferencesDocument.ts`, steps 1–4). `PreferencesProvider` (176 lines) owns the writes and the tab sync. Bare hooks like `useHourFormat` and `useZoneLabelParts` read the context with a default.
- The settings page (`src/app/settings/SettingsPage.tsx`) composes `SettingsOptionGroup` (radio group, icons or pictograms, `SETTINGS_GROUP_ROW_CLASS_NAME`), `ViewModeGroup` and `ZoneLabelGroup` (with `SettingsToggleGroup`).
- Typed times already have owners. `parseWallTimeInput` (`src/presenter/parseWallTimeInput.ts`) reads 24-hour and 12-hour texts with the markers from `getDayPeriodMarkers`. `getTypedTimeFieldText` (`src/views/shared/typedTimeFieldText.ts`) inserts the separator, and `isKeyKeptInField` (`src/views/shared/wallTimeFieldKeys.ts`) keeps field keys away from the row handlers. `MeetingRangeInput` shows how two fields are confirmed with Enter and blur, and how the outcome enum `MeetingRangeInputOutcome` is reported by the controller.
- Tokens: `--color-accent` is `#2f5bd3` / `#5ec2e8` and `--color-accent-foreground` is `#ffffff` / `#0b1220` (`src/styles/tokens.css`, three theme blocks). `src/styles/tokens.test.ts` already computes contrast ratios from that file.

ADRs read and followed: 0002 (layers; the view contract runs for every view), 0003 (absolute hour cells, IANA identifiers, explicit disambiguation), 0004 (versioned envelope, step migrations with fixtures, an unreadable document is recoverable, tab sync), 0005 (registry-driven view contract), 0007 (reference zone), 0008 (work bounds, never timings, in tests), 0009 (Safari 12 level, no BigInt: instants are compared in milliseconds), 0014 (zone rules through the wrapper; no offset is cached). No global decision is made here. The domain model already planned a user schedule instead of constants ("Day periods", Q3), and this change uses that extension point for a second, separate rule. So no new ADR is needed. Q3 in `docs/architecture/open-questions.md` is amended by a docs task.

## Decision

### D1. The preferences: day colouring and working hours (FR1–FR7)

- `src/preferences/preferences.ts`: `enum DayColouring { PLAIN, TIME_OF_DAY, WORKING_HOURS }`. `Preferences` gains `dayColouring: DayColouring` and `workingHours: WorkingHours`, and `DEFAULT_PREFERENCES` gets `TIME_OF_DAY` and `DEFAULT_WORKING_HOURS`.
- New `src/preferences/workingHours.ts`:
  - `type WorkingHours = { start: string; end: string }`: canonical ISO 8601 wall-clock times `HH:MM`, the same form `parseWallTimeInput` returns.
  - `DEFAULT_WORKING_HOURS = { start: "10:00", end: "18:00" }`, kept next to the type as `DEFAULT_PREFERENCES` is; `src/constants` imports `@/preferences`, so it cannot hold it without a cycle.
  - `enum WorkingHoursError { START_NOT_BEFORE_END }`.
  - `checkWorkingHours(workingHours): WorkingHoursError | undefined`, which compares `Temporal.PlainTime.from(...)` values.
  - `isWorkingHours(value): value is WorkingHours`, which checks two `HH:MM` strings and the order.
- `src/preferences/preferencesCommands.ts`:
  - `SET_DAY_COLOURING { dayColouring }`.
  - `SET_WORKING_HOURS { workingHours }`. The reducer returns the same object for an unchanged value and for a range that `checkWorkingHours` refuses, so an invalid range can never enter the state. The typed error is returned to the caller by `checkWorkingHours`, which the controller calls first (D5).
- `parseStoredPreferences` validates `dayColouring` against the enum and `workingHours` with `isWorkingHours`. Any other value makes the document unreadable, the existing policy.
- `src/constants/preferences.ts`: `DAY_COLOURING_ORDER = [PLAIN, TIME_OF_DAY, WORKING_HOURS]` (the display order) and `PREFERENCES_SCHEMA_VERSION = 6`.

### D2. Persistence: schema version 6 (FR2, FR3, FR7)

`createPreferencesMigrations` gains step `5: payload → { ...payload, dayColouring: TIME_OF_DAY, workingHours: DEFAULT_WORKING_HOURS }`. `serializePreferencesDocument` writes both fields. Nothing else changes: the same repository, storage key, debounce, `pagehide` flush and `createStorageDocumentSync` tab sync apply, so FR3 and FR7 follow from the existing tested path. Fixture tests cover a version-5 document, a version-1 document (all steps) and broken values.

### D3. Working time is model code, owned once (FR8, FR10, FR11, NFR-P1)

New `src/model/workingTime.ts`, with `WORKING_WEEKDAYS = [1, 2, 3, 4, 5]` (Temporal `dayOfWeek`, Monday = 1) and `WORKING_CELL_MIN_SHARE = 0.5` in new `src/constants/workingTime.ts`. The model imports only `type WorkingHours` from `@/preferences`. `architecture.md` names `src/model/` and `src/preferences/` together as the model layer, and nothing in the rule forbids it.

- `isWorkingDay(date: Temporal.PlainDate): boolean`.
- `isWorkingTime(instant, timeZoneId, workingHours): boolean`. This is the definition of FR8: the local date is a working day, and the local time is at or after the start and before the end. Every other function must agree with it, and the tests compare against it.
- `getWorkingTimeSpans(timeZoneId, day, workingHours): readonly { start; end }[]`: the working time of a location clipped to the reference day, as instants. It is the one owner of the concept. It works on local dates from the day before the day's local start to the day's local end, and keeps the working days.
  - The offset changes come from the compiled clock changes of the day's window. The helper `getClockChangesAround` in `dayPeriodStops.ts` reads them through `getClockChanges` and makes no `getTimeZoneTransition` call. It is moved, exported, next to `getClockChanges` in `src/model/clockChange.ts` and used by both, not copied.
  - Without an offset change near the day, the start and the end are plain millisecond arithmetic on the day's offset, as `collectBlendWindows` does.
  - Otherwise, it takes as candidate edges each wall time resolved with `disambiguation: "earlier"` and `"later"`, each local midnight, and each transition. It then classifies every segment between two candidates with `isWorkingTime` at the segment's start and merges neighbours. This makes a gap start the span at the clock change, makes an overlap follow the repeated local time, and keeps the Cairo case of FR8 exact.
  - The result is memoized per zone. The cache key is the day start and end plus `start|end`, and the cache is reset when the key changes, as `getDayPeriodStops` does.
- `getWorkingTimeStops(timeZoneId, day, workingHours): readonly WorkingTimeStop[]` with `{ fraction; isWorkingTime }`:
  - two stops per span end that lies strictly inside the day;
  - one stop at `0` when there is no edge.
  It is memoized on the spans array.
- `getHourCellWorkingFlags(timeZoneId, day, workingHours): readonly boolean[]`: one flag per column of `getHourCellCount(day)`, from `getHourCellStart` and the next cell start or `day.end`. A flag is set when the overlap with the spans is at least `WORKING_CELL_MIN_SHARE` of the cell's own length. It is memoized like the spans.

Work bound: in the Working hours colouring, the only transition lookups of a zone are those `getHourCells` already makes (unchanged). The spans add none, and they are shared by the track and the strip. That stays within `MAX_TRANSITION_LOOKUPS_PER_ZONE` (2). The day-period stops are not computed in this colouring.

### D4. Day colours are presented, not recomputed (FR2, FR9–FR13)

New `src/presenter/dayColours.ts`:

- `enum DayColour { NIGHT, MORNING, WORK, EVENING, PLAIN, WORKING_TIME, NON_WORKING_TIME }`. The four period members have the string values of `DayPeriod`.
- `type DayColourStop = { fraction; colour: DayColour }`.
- `presentDayColourStops(timeZoneId, day, dayColouring, workingHours): readonly DayColourStop[]`:
  - `PLAIN` returns one module constant `[{ 0, PLAIN }]`;
  - `TIME_OF_DAY` maps `getDayPeriodStops(timeZoneId, day)` one-to-one;
  - `WORKING_HOURS` maps `getWorkingTimeStops`.
  The mapped arrays are kept in a `WeakMap` keyed by the model array, so a minute tick returns the same object (NFR-P1).
- `presentHourCellColour(cell, workingFlag, dayColouring): DayColour`.
- `getHourFrameColour(dayColouring): HourFrameColour.ACCENT | FOREGROUND`, with `ACCENT` only for `TIME_OF_DAY` (FR13).

Callers:

- `presentDayTrack`: `DayTrackContext` gains `dayColouring` and `workingHours`, and `PresentedDayTrack.stops` becomes `readonly DayColourStop[]`. The context passes through `presentZoneMoment` and `LocationRowsContext`.
- `presentHourStrip`: `HourStripContext` gains the same two fields, and they join the strip cache key. `PresentedHourCell.dayPeriod` is replaced by `dayColour`. `HourCell.dayPeriod` in the model stays, because Time of day reads it.
- The controller passes the preferences in: `useLocations` and `useHourGrid` read `useDayColouring()`, a new bare hook with the default outside a provider, like `useZoneLabelParts`. `useHourGrid` also returns `hourFrameColour`.

Views map a `DayColour` to tokens only:

- `src/views/shared/dayTrackGradient.ts`: `DAY_PERIOD_COLOR_VARIABLES` becomes `DAY_COLOUR_VARIABLES: Record<DayColour, string>`, and `buildDayTrackGradient` takes `DayColourStop[]`. Two stops at one position already draw a hard edge. A single stop (Plain, or a Working hours track with no edge, such as Moscow on a Saturday) is written as two stops of its colour, at `0%` and `100%`: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) 100%)`. Today the builder would emit `linear-gradient(to right, var(--color-accent) 0%)`, and CSS Images Level 3 requires at least two colour stops, so an engine at the ADR-0009 level drops the declaration and the track loses its colour. A plain `background-color` was rejected: `DayTrack` sets `backgroundImage` only, and two code paths would be needed.
- New `DAY_COLOUR_FOREGROUND_CLASS_NAMES: Record<DayColour, string>` in the same file, one theme-independent class per day colour: `NIGHT` and `NON_WORKING_TIME` → `text-foreground`; `MORNING`, `WORK` and `EVENING` → `text-hour-cell-foreground` (as today); `PLAIN` and `WORKING_TIME` → `text-accent-foreground`. `HourCellView` uses it. The tokens behind each class switch with the theme (D6).
- `HourFrame` takes a `colour` prop and maps it to `border-accent` or `border-foreground`.

### D5. Working hours input: the controller parses, the view only types (FR4–FR6, FR14)

- `src/presenter/workingHours.ts`:
  - `formatWorkingHoursTime(wallTime, language, hourFormat)` uses `getDateTimeFormatter(language, UTC_ZONE_ID, DateTimeLabelKind.LOCAL_TIME, hourFormat)` on the wall time placed on the epoch date, exactly as `getDayPeriodMarkers` reads its markers. So the field shows what the app writes everywhere else (`09:07`, `9:07 AM`), and no new formatter kind is added.
  - `presentWorkingHoursTexts(workingHours, language, hourFormat): { startText; endText }`.
- `src/controller/useWorkingHoursInput.ts`: returns `{ startText, endText, confirmWorkingHoursInput(startText, endText): WorkingHoursInputOutcome }`. The outcome enum is `SAVED | INVALID_START_TEXT | INVALID_END_TEXT | START_NOT_BEFORE_END`, modelled on `MeetingRangeInputOutcome`. It parses with `parseWallTimeInput(text, getDayPeriodMarkers(language))`, checks with `checkWorkingHours`, and on success calls `setWorkingHours`.
- `PreferencesContextValue` gains `setDayColouring` and `setWorkingHours`. `PreferencesProvider` grows to about 190 lines, which is still under the 200-line target.

### D6. Tokens: non-working grey and cell digits (FR10, NFR-A3, UX4)

New tokens are declared in all three theme blocks of `tokens.css`:

| Token | Light | Dark |
|---|---|---|
| `--color-day-non-working` | `#ececef` | `#3b4660` |

- The plain colour and the working-time colour are `var(--color-accent)`, so they follow the theme and FR9 and FR10 need no copy of the accent.
- Digits use these colours:
  - `--color-accent-foreground` on accent cells: `#ffffff` on `#2f5bd3` is about 5.9:1, and `#0b1220` on `#5ec2e8` about 9.2:1;
  - `--color-foreground` on grey cells in both themes, because one class per day colour cannot switch tokens by theme (D4): `#18181b` on `#ececef` is about 15.0:1 in light (the same value as the light `--color-hour-cell-foreground`), and `#eef2fa` on `#3b4660` about 8.4:1 in dark. The dark `--color-hour-cell-foreground` `#0f1729` would give only about 1.9:1 on the dark grey.
- The handle (`bg-surface` with a `border-foreground` ring) keeps at least 3:1 through its fill on accent: `#ffffff` against `#2f5bd3` is about 5.9:1, and `#16213a` against `#5ec2e8` about 7.9:1. On grey it keeps 3:1 through its border: about 15.0:1 in light and 8.4:1 in dark.
- `tokens.test.ts` asserts every pair and both ratios for all seven day colours, so a later token change cannot quietly break FR-level readability (M5).
- UX4 asks for a grey lighter than any day-period colour in the light theme. Relative luminance (WCAG): `#ececef` is about 0.841, and the light day-period colours are `#f8e6a6` 0.793 (the lightest), `#f8cbbe` 0.664, `#d4c6ee` 0.606 and `#a3afd3` 0.432. The light `--color-muted` `#e4e4e7` (0.778) was rejected because it is darker than `#f8e6a6`. In the dark theme `#3b4660` (0.062) is darker than every dark day-period colour (the darkest, `#56679a`, is 0.140), so it does not glare. `tokens.test.ts` asserts both orders (UX4).
- The work-period token `--color-day-working` is renamed `--color-day-work` (values unchanged), so that "working" names only the working hours and working time (`docs/glossary/`: one term, one concept). Its readers are `tailwind.config.ts` (`day.working` → `day.work`), `dayTrackGradient.ts` and its test, `HourStrip.test.tsx`, `themeTokens.ts` (`dayWorking` → `dayWork`), `grid_view_hour_cells_e2e.steps.ts` and `time_selection_labels_e2e.steps.ts`. The executable specs that still call the period "working hours" or name its stops `working` (`time_selection_day_colours.feature` with `dayColourChecks.ts`, `grid_view_hour_cells_unit.feature` and `grid_view_hour_cells_e2e.feature` with their steps) say "work", as the modified requirements do (task 6.4), because the `day-colouring` features use `working` for working time.

### D7. The hour frame on accent cells (FR13)

An accent frame on accent cells cannot be seen. The meeting frame stays green (NG6), because its hue differs from the accent. The hour frame switches to `--color-foreground` in Plain and Working hours, and keeps the accent in Time of day, so the approved Grid screenshots stay unchanged (M2). The alternatives were rejected:

- a double ring: a new visual element;
- a white frame: invisible in the light theme on grey cells.

### D8. The settings controls, after a look at common practice (FR1, FR4, FR14, NFR-R1, UX1, UX2)

Researched before choosing:

- Apple HIG "Segmented controls" and Material 3 "Segmented buttons" recommend one joined control for 2–5 mutually exclusive options. They require icons and text not to be mixed within one control, and an accessible label for icon-only segments.
- NN/g "Icon Usability" notes that icons without a visible label are understood only when familiar. So each icon needs a pointer hint and an accessible name.
- For a time range, Google Calendar's working hours, Slack's notification schedule and Android's Do Not Disturb schedule all use a pair of compact "from – to" time fields in one row.
- MDN `<input type="time">` documents that its display format follows the browser's locale, not an app setting. iOS Safari shows a wheel picker for it.

Decisions:

- **Colouring group**: the existing `SettingsOptionGroup` with three Lucide icons, `PaintBucket` (Plain), `SunMoon` (Time of day) and `BriefcaseBusiness` (Working hours). Their names are `settings.dayColouringPlain` and the other option keys, used as the accessible name and the `title` hint, exactly like the theme group. Text segments were rejected: «По рабочему времени» alone is wider than a 320 px row, so three text segments would wrap and break NFR-R1. `DayColouringGroup.tsx` in `src/app/settings/` wires it to `usePreferences`. It stands after `ViewModeGroup`, because both decide how the main page looks.
- **Working hours row**: a new reusable `SettingsTimeRangeGroup.tsx` in `src/app/settings/`. It is a row with `SETTINGS_GROUP_ROW_CLASS_NAME`, the caption in `SETTINGS_GROUP_CAPTION_CLASS_NAME`, and two text fields joined by `–`.
  - Fields are `inputMode="numeric"`, at least 44 px high, wide enough for `10:00 AM`.
  - It types with `getTypedTimeFieldText` and keeps Enter and the arrow keys with `isKeyKeptInField`. Escape is not kept by that set here: the settings page leaves on Esc through the document listener of `AppShell`, and the stable "Open the settings page" allows only the expanded language list to hold Esc. So the group stops Escape only when it has something to undo, as `InterfaceLanguageGroup` stops it only while its list is expanded.
  - Enter or blurring the row calls `onConfirm(startText, endText)`. Esc while the field texts differ from the texts it was given, or while a hint is shown, calls `onRestore` and stops the key. Otherwise Escape propagates and the page closes (the settings delta modifies "Open the settings page" for this one added exception).
  - It takes `hint?: string` and `invalidFields`, renders the hint in a `role="status"` element with `aria-live="polite"`, and links it with `aria-describedby`.
  - It does not parse anything.
  - `WorkingHoursGroup.tsx` wires it to `useWorkingHoursInput` and maps the outcome to `locations.wallTimeInputError` (the existing wall-time text, reused because it is the same concept) or the new `settings.workingHoursOrderError`. It renders nothing unless the colouring is `WORKING_HOURS`. It is keyed by the stored range and hour format, so a change from another tab or a new hour format resets its texts.
  - Native `type="time"` was rejected: it ignores the app's 12/24 h choice (FR5) and differs per engine, including iOS 12.
- The row appears below the colouring group, so nothing above it moves (UX2).

### D9. i18n keys

New keys in `en.json` and `ru.json` under `settings`:

| Key | EN | RU |
|---|---|---|
| `dayColouringLabel` | Colouring | Раскраска |
| `dayColouringPlain` | Plain | Обычная |
| `dayColouringTimeOfDay` | Time of day | По времени суток |
| `dayColouringWorkingHours` | Working hours | По рабочему времени |
| `workingHoursLabel` | Working hours | Рабочие часы |
| `workingHoursStartLabel` | Start of working hours | Начало рабочего дня |
| `workingHoursEndLabel` | End of working hours | Конец рабочего дня |
| `workingHoursOrderError` | The start must be before the end | Начало должно быть раньше конца |

### D10. Tests by layer

- Unit (Vitest): `workingTime.test.ts`, `dayColours.test.ts`, `workingHours.test.ts` (presenter), `preferences.dayColouring.test.ts`, `preferencesDocument.dayColouring.test.ts`, `useWorkingHoursInput.test.tsx`, `SettingsTimeRangeGroup.test.tsx`, `DayColouringGroup.test.tsx`, `WorkingHoursGroup.test.tsx`, `tokens.test.ts`.
- Unit BDD (vitest-cucumber, jsdom). These cover rules and data: the stops, the cells, storage, sync and migration, the texts and the hints.
- BDD E2E (playwright-bdd). These cover everything a real browser decides: computed colours, accessible names, `aria-invalid` and `aria-describedby`, focus outlines, arrow keys, sizes, layout, axe-core and screenshots.

## Consequences

Positive:
- One owner per concept. Working time lives in `getWorkingTimeSpans`, the colour of a position or cell in `presentDayColourStops` and `presentHourCellColour`, and the tokens in the views.
- Time of day keeps its code path and its approved screenshots.
- `SettingsTimeRangeGroup` can serve a later quiet-hours or per-location setting.

Negative:
- `PresentedDayTrack.stops` and `PresentedHourCell.dayPeriod` change type, so tests that read `period` or `dayPeriod` (for example `dayColourChecks.ts`, `dayTrackFixture.tsx`, `hourStripFixture.tsx`, `dayTrackGradient.test.ts`; find all with `grep -rn "\.period\b\|dayPeriod:" src`) are updated in the same task.
- The model now imports one type from `@/preferences`.
- The hour frame has two colours, depending on the colouring.

## Alternatives Considered

**Replace the day-period schedule with the working hours**: the planned extension point, but FR2 and NG5 keep Time of day unchanged, and Working hours has two colours and hard edges, not four periods with blends.

**Store the colouring per view**: the task asks for one colouring for both views (FR12).

**Put `DayColour` in the model**: the model would know about "plain", which is not a rule of time, only a way of showing it.

**Round typed times to the track step**: refused by FR5.

**Refuse a stored broken range silently and fall back to the default**: ADR-0004 makes a value of the wrong shape unreadable, with Reset. Only references that no longer resolve are cleared silently.
