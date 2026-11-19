# Review: redesign-cards-grid-and-day-palettes

## Summary

| Item | Value |
|---|---|
| Tasks verified | 60/61 |
| Requirements traced | 279/293 |
| CRITICAL | 1 |
| WARNING | 3 |
| SUGGESTION | 0 |

## Tasks

Paths are relative to `packages/client/` unless they start with `docs/`.

- ✅ 1.1 `docs/glossary/settings.md` has **Day palette** and **Palette swatch** (grep count 2).
- ✅ 1.2 `grep -rni "drag handle" docs/glossary` prints nothing; Grab area, Universal Time label, Day period marker, Card border entries present in `docs/glossary/locations.md`, `time-selection.md`, `views.md`.
- ✅ 1.3 `docs/architecture/views.md` has 8 matches of `1120|Vivid|Muted|grab area`, 0 of "drag handle".
- ✅ 2.1 `src/test/legacyBuild/copyDarkThemeToSystemTheme.test.ts` exists (31 lines).
- ✅ 2.2 `scripts/themeCss/copyDarkThemeToSystemTheme.mjs` + `.d.mts`, registered in `postcss.config.js`.
- ✅ 2.3 `src/styles/tokens.test.ts:55-132` (one dark block, no duplicates, no `--color-border`, contrasts, card border exempt).
- ✅ 2.4 `src/styles/tokens.css` holds the §2 values; `tailwind.config.ts` maps `card-border`, `control-border`, `control-border-inactive`, `handle-border`, `boxShadow.lift`; no `border-border` left under `src/`.
- ✅ 2.5 `src/test/features/settings/settings_e2e.feature:127` "The system dark theme uses the same values".
- ✅ 3.1 `src/preferences/preferences.dayPalette.test.ts`, `src/adapters/preferencesDocument.dayPalette.test.ts`.
- ✅ 3.2 `DayPalette` in `src/preferences/preferences.ts`, `SET_DAY_PALETTE` in `preferencesCommands.ts`, validation in `parseStoredPreferences.ts`, `PREFERENCES_SCHEMA_VERSION = 7` and `DAY_PALETTE_ORDER` in `src/constants/preferences.ts`, migration step 6 and serialization in `src/adapters/preferencesDocument.ts:56,72`.
- ✅ 3.3 `src/test/features/settings/settings_day_palette_storage.feature` + steps.
- ✅ 4.1 `src/controller/useDayPalettePreference.test.tsx`; `PreferencesProvider.test.tsx` extended (+22 lines).
- ✅ 4.2 `src/controller/useDayPalettePreference.ts`, `AppShell.tsx:98`; per-palette tokens and `:root[data-day-palette="muted"]` mapping in `tokens.css`.
- ✅ 4.3 `src/styles/tokens.test.ts` + `tokensTestHelpers.ts` (palette values, digit and handle contrast per pair).
- ✅ 4.4 `src/test/features/day_colouring/day_colouring_budget.feature:26` "Changing the day palette re-presents nothing".
- ✅ 4.5 `src/test/features/day_colouring/day_colouring_palette_e2e.feature` (5 scenarios).
- ✅ 4.6 Mutation reports of the implement stage; re-measured here for `parseStoredPreferences.ts`, `preferencesCommands.ts`, `preferencesDocument.ts`, `useDayPalettePreference.ts` (see Mutation).
- ✅ 5.1 `src/app/settings/SettingsOptionGroup.test.tsx`, `PaletteSwatch.test.tsx`, `DayPaletteGroup.test.tsx`.
- ✅ 5.2 `SettingsOptionGroup.tsx` `swatch`, `PaletteSwatch.tsx`, `DayPaletteGroup.tsx`, `SettingsPage.tsx:144`; keys in both locales.
- ✅ 5.3 `src/test/features/settings/settings_day_palette_unit.feature` (4 scenarios).
- ✅ 5.4 `src/test/features/settings/settings_day_palette_e2e.feature` (incl. axe for 4 pairs at `:76`).
- ✅ 6.1 `src/app/MainPage.test.tsx:74,79,100`; `SettingsButton.test.tsx`.
- ✅ 6.2 `MainPage.tsx`, `SettingsButton.tsx` (Lucide `Settings`), `AddLocationButton.tsx`, `HEADER_ICON_SIZE_PX` in `src/constants/header.ts`, title sizes in `tailwind.config.ts`.
- ✅ 6.3 `main_page_header_e2e.feature` rewritten; `main_page_content_column_e2e.feature` added.
- ✅ 7.1 `locationMark.test.ts`, `presentLocationRows.zoneLine.test.ts:110,181-189`, `localDateTime.test.ts` (`formatLocalTimeParts`). The Universal Time flag lives in `presentLocationRows.ts:66-69` rather than as `presentZoneLine({ isUniversalTime })` (design D7), so `zoneLine.test.ts` is unchanged; behaviour and hiding with the country are tested at the row level.
- ✅ 7.2 caption removed (`presenter/locationMark.ts`), `locations.universalTime` in both locales, `formatLocalTimeParts` (`presenter/localDateTime.ts:38`) and `localTimeParts` in `presentZoneMoment.ts:138`.
- ✅ 7.3 here-mark, zone-line, device-time and UTC-offset unit features and steps updated (diff stat).
- ✅ 7.4 `src/test/features/locations/locations_local_time_unit.feature:70`.
- ✅ 7.5 Implement-stage runs; `localDateTime.ts` and `locationMark.ts` re-measured at 100 % here.
- ✅ 8.1 `src/views/shared/zoneLineBreaks.test.ts`, `ZoneLine.test.tsx`.
- ✅ 8.2 `zoneLineBreaks.ts`, `ZONE_LINE_SEPARATOR` in `src/constants/locations.ts`, `ZoneLine.tsx` with `ResizeObserver` cleanup.
- ✅ 8.3 `locations_zone_line_e2e.feature:38,47,57`.
- ❌ 9.1 RED tests for `locationRowVariant`, `ZoneRowContent`, `LocationMarkIcon`, `LocalDateTime` exist, but `src/views/shared/DayTrack.test.tsx` was not changed (no assertion of the 23 px handle, `bg-surface`, `border-handle-border`, `h-3` bar or removed `md:` inset), and the `DAY_TRACK_HANDLE_SIZE_PX` constant the task names does not exist (R3).
- ✅ 9.2 `locationRowVariant.ts`, `ZoneRowContent.tsx`, `LocalDateTime.tsx`, `LocationMarkIcon.tsx`, `DayTrack.tsx` (handle via `spacing.handle: 23px`), `LOCATION_MARK_ICON_SIZE_PX = 23`, `GRID_MARK_ICON_SIZE_PX = 20`.
- ✅ 9.3 `src/test/features/locations/locations_card_layout_e2e.feature` (9 scenario outlines).
- ✅ 9.4 `time_selection_layout_e2e.feature:8-117` (12 px bar, 23 px handle, border by theme, own line).
- ✅ 9.5 Implement-stage runs; `zoneLineBreaks.ts` re-measured at 100 % here.
- ✅ 10.1 `src/views/shared/DateBar.test.tsx` (+12), `MainPage.test.tsx:100`.
- ✅ 10.2 `DateBar.tsx:71` outlined Now, `NOW_ICON_SIZE_PX = 18`; `MainPage.tsx` footer `bg-background`, no `border-t`.
- ✅ 10.3 `date_selection_layout_e2e.feature:138-196`.
- ✅ 11.1 `useLocationMenuItems.test.ts`, `LocationMenu.test.tsx:230`, `LocationList.menu.test.tsx`, `ViewLocationList.test.tsx`; the disabled-skip logic is tested in the new `locationMenuNavigation.test.ts` instead of `locationMenuKeys.test.ts`.
- ✅ 11.2 `LocationMenu.tsx` (`isDisabled`, `aria-disabled`), `locationMenuNavigation.ts`, `useLocationMenuItems.ts`, `LocationList.tsx:132-137`, `ViewLocationList.tsx:78-88`; keys in both locales.
- ✅ 11.3 `LocationList.sensors.test.tsx`, `useSortableLocationRow.test.tsx`, `LocationRow.dragging.test.tsx`.
- ✅ 11.4 `MouseSensor` + `TouchSensor` in `LocationList.tsx`; lift in `useSortableLocationRow.ts`; `DragHandle.tsx` deleted; removed keys absent from both locales.
- ✅ 11.5 `locations_reorder_menu_unit.feature` (5 scenarios), `locations_reorder_unit.feature` trimmed.
- ✅ 11.6 `locations_reorder_e2e.feature` and `locations_reorder_legacy_touch_e2e.feature` rewritten.
- ✅ 11.7 The task is a one-off manual grep; ticked. The NFR it serves has no automated guard (R4).
- ✅ 11.8 Implement-stage runs; `useLocationMenuItems.ts` (100 %) and `useSortableLocationRow.ts` (92.31 %) re-measured here.
- ✅ 12.1 `src/views/grid/hourCellLayout.test.ts:28,36`, `HourStrip.test.tsx` (+9).
- ✅ 12.2 `src/constants/grid.ts` (`HOUR_CELL_GAP_PX = 3`, `HOUR_CELL_SCROLL_WIDTH_PX = 38`), `hourCellLayout.ts:28`, `HourCellView.tsx` (`rounded-cell`, `text-grid-cell`, `md:h-12`), grid variant in `locationRowVariant.ts`.
- ✅ 12.3 `main_page_grid_view_e2e.feature`, `grid_view_redesign_e2e.feature`, meeting-lock, hour-frame and layers features updated.
- ✅ 12.4 `hourCellLayout.ts` re-measured at 100 % here.
- ✅ 13.1 `time_selection_regressions_e2e.feature`: 5 scenarios tagged `@redesign-cards-grid-and-day-palettes @FR20`…`@FR24`.
- ✅ 13.2 `day_colouring_e2e.feature:85,102`.
- ✅ 13.3 width tables in the tagged E2E features (e.g. `main_page_grid_view_e2e.feature:8`, `time_selection_layout_e2e.feature:72`).
- ✅ 13.4 re-taken PNGs under `src/test/features/__screenshots__/` (commit 537b93f).
- ✅ 14.1 screens under `docs/design/screens/` (`cards-phone-light.html`, `settings-phone-light.png` …); `docs/design/redesign` is untracked by git (only an empty directory remains in the working copy); 0 `redesign/` links in `docs/design/README.md` and `docs/architecture/views.md`.
- ✅ 15.1 CI green per the stage brief.
- ✅ 15.2 CI green per the stage brief.
- ✅ 15.3 Every FR / NFR / UX / M id is found in at least one file carrying the change name (grep: FR20–FR24 and FR25 at least once each).
- ✅ 15.4 `temporary-docs/gnomish/github-oinsio-time-zones-149/handoff/README.md` has one `## H1:` section.

## Requirements

Feature paths below are relative to `packages/client/src/test/features/`; other paths to `packages/client/`.

- ✅ FR1 — `src/styles/tokens.css` (§2 light and dark values, two border tokens, handle border and width); `tailwind.config.ts`; `tokens.test.ts`.
- ✅ FR2 — dark values once in `:root[data-theme="dark"]`, system theme copied by `scripts/themeCss/copyDarkThemeToSystemTheme.mjs`; `tokens.test.ts:120`, `settings_e2e.feature:127`.
- ✅ FR3 — `DayPalette`, `SET_DAY_PALETTE`, migration step 6 (`preferencesDocument.ts:56`); `settings_day_palette_storage.feature`.
- ✅ FR4 — `--color-day-*` point at `--color-day-vivid-*` / `--color-day-muted-*` via `data-day-palette` (`useDayPalettePreference.ts`); `day_colouring_palette_e2e.feature`.
- ⚠️ FR5 — group, order and accessible names done (`DayPaletteGroup.tsx`, `settings_day_palette_e2e.feature`), but the swatch outline is drawn inside the 24 px square, so the stripes show at 20 × 20 px (R2).
- ✅ FR6 — `MainPage.tsx` header row, `SettingsButton.tsx` (Lucide `Settings`, 27 px), `AddLocationButton.tsx`; `main_page_header_e2e.feature`.
- ⚠️ FR7 — sizes and lines in `locationRowVariant.ts`; `locations_card_layout_e2e.feature:6,21`. The 13 px list side padding is written as `padding-inline` in `src/styles/globals.css:13`, which iOS Safari 12.5 ignores (R1).
- ✅ FR8 — place `flex-1 basis-0 min-w-[min-content]`, time group `ml-auto` wraps; marker span `LocalDateTime.tsx` (`ml-1 text-card-marker font-bold`); `locations_card_layout_e2e.feature:46,58`.
- ✅ FR9 — `ZoneLine.tsx` leading dot hidden on `[data-line-start]`; `locations_zone_line_e2e.feature:38,47,57`.
- ✅ FR10 — `LocationMarkIcon.tsx` (`MapPin`, `House`), caption removed; `locations_card_layout_e2e.feature:98,111`.
- ✅ FR11 — `md:` classes of `locationRowVariant.ts` (lines become `md:contents`, track on its own line); `locations_card_layout_e2e.feature:30`.
- ⚠️ FR12 — `.content-column` (`src/styles/globals.css:8-14`) and `max-w-content` footer group; `main_page_content_column_e2e.feature`. Centring and side padding use `margin-inline` / `padding-inline`, ignored on iOS Safari 12.5 (R1).
- ✅ FR13 — `DayTrack.tsx` (`h-3` bar, `h-handle w-handle`, `bg-surface`, `border-handle-border`, 44 px hit areas kept); `time_selection_layout_e2e.feature:8-30`.
- ✅ FR14 — `DateBar.tsx:71`; `date_selection_layout_e2e.feature:138-196`.
- ✅ FR15 — `LocationList.tsx` sensors, grab area props in `LocationRow.tsx` / `ZoneRowContent.tsx`, lift in `useSortableLocationRow.ts`; `locations_reorder_e2e.feature:7-65,120`.
- ✅ FR16 — `useLocationMenuItems.ts`, `LocationMenu.tsx`, `LocationList.tsx:132`, `ViewLocationList.tsx:78`; `locations_reorder_menu_unit.feature`, `locations_reorder_e2e.feature:68,77`.
- ✅ FR17 — grid variant of `locationRowVariant.ts`, `HourCellView.tsx`, `constants/grid.ts`; `grid_view_redesign_e2e.feature`, `main_page_grid_view_e2e.feature`.
- ✅ FR18 — `presentLocationRows.ts` device-time place text; `locations_device_time_redesign_unit.feature`, `presentLocationRows.zoneLine.test.ts`.
- ✅ FR19 — `presentLocationRows.ts:66-69,84`; `presentLocationRows.zoneLine.test.ts:110,181-189`.
- ✅ FR20 — `time_selection_regressions_e2e.feature:6`.
- ✅ FR21 — `time_selection_regressions_e2e.feature:24`.
- ✅ FR22 — `time_selection_regressions_e2e.feature:41`.
- ✅ FR23 — `time_selection_regressions_e2e.feature:69`.
- ✅ FR24 — `time_selection_regressions_e2e.feature:87`; `RowNotes` stays the last child in `LocationRow.tsx`.
- ✅ FR25 — glossary, `docs/architecture/views.md`, `docs/design/README.md`, screens moved; `src/test/readme/readmeFacts.test.ts:236`.
- ✅ NFR-P1 — `formatLocalTimeParts` reuses the cached formatter (`localDateTime.test.ts` "should build no formatter"); `day_colouring_budget.feature:26`, `locations_local_time_unit.feature:70`.
- ⚠️ NFR-P2 — 150 KB is enforced by `scripts/check-bundle-size.mjs`; "holds no drag-and-drop code" is only a manual grep of task 11.7 (R4).
- ⚠️ NFR-A1 — `day_colouring_e2e.feature:102`, `settings_day_palette_e2e.feature:76` cover the four pairs, run at the project viewports (1280 px Desktop Chrome, 393 px Pixel 5) rather than 375 / 1024 px; same narrow and wide layouts, not worth a finding.
- ✅ NFR-A2 — `tokens.test.ts:90-132` (text 4.5:1, control border 3:1, inactive Now label, card border exempt, digits and handle per pair).
- ✅ NFR-A3 — menu pattern with `aria-disabled` and skipping (`LocationMenu.tsx`, `locationMenuNavigation.ts`), focus return (`LocationList.menu.test.tsx`), radio group (`settings_day_palette_e2e.feature`).
- ✅ NFR-R1 — width tables in `main_page_grid_view_e2e.feature:8`, `time_selection_layout_e2e.feature:72`, `main_page_content_column_e2e.feature:6`.
- ✅ NFR-R2 — re-taken baselines (commit 537b93f) for the scenarios listed in task 13.4.
- ✅ UX1 — handled as human handoff H1 by design (D10); section present in the handoff README.
- ✅ UX2 — `SettingsPage.tsx:143-145` (palette and working hours share one slot); `settings_day_palette_e2e.feature:6`.
- ✅ UX3 — `useSortableLocationRow.ts` (scale 1.02, `shadow-lift`); `locations_reorder_e2e.feature:84,120`.
- ✅ UX4 — `main_page_content_column_e2e.feature`.
- ⚠️ M1 — 12 axe scenarios × 2 projects = 24 checks, but at 393 / 1280 px instead of 375 / 1024 px (see NFR-A1).
- ✅ M2 — width tables named under NFR-R1 (7 widths × both formats in Cards and Grid) plus settings.
- ✅ M3 — 5 scenarios tagged `@FR20`…`@FR24` in `time_selection_regressions_e2e.feature`.
- ✅ M4 — `tokens.test.ts:55,120`.
- ✅ M5 — every file measured here is ≥ 90 % (see Mutation).
- ✅ M6 — `DragHandle` absent from `src/`; `useLocationMenuItems.test.ts` (Move up / Move down on every row).
- ✅ M7 — every FR / NFR / UX id found in a file carrying the change name (grep run during review).
- ✅ Scenario: Bar on a narrow screen — (date-selection) `date_selection/date_selection_layout_e2e.feature:8`
- ✅ Scenario: Bar on a wide screen — (date-selection) `date_selection/date_selection_layout_e2e.feature:38`
- ✅ Scenario: The group stays centred while the window is resized — (date-selection) `date_selection/date_selection_layout_e2e.feature:17`
- ✅ Scenario: Last card above the bar — (date-selection) `date_selection/date_selection_layout_e2e.feature:46`
- ✅ Scenario: Calendar on a narrow and a wide screen — (date-selection) `date_selection/date_selection_layout_e2e.feature:55` ("Calendar on a <width> px screen")
- ✅ Scenario: Bar controls look as approved — (date-selection) `date_selection/date_selection_layout_e2e.feature:70`
- ✅ Scenario: An inactive Now is grey — (date-selection) `date_selection/date_selection_layout_e2e.feature:167`
- ✅ Scenario: Now keeps its place — (date-selection) `date_selection/date_selection_now_e2e.feature:55`
- ✅ Scenario: The date is the most prominent text of the bar — (date-selection) `date_selection/date_selection_layout_e2e.feature:84`
- ✅ Scenario: Touch targets — (date-selection) `time_selection/time_selection_layout_e2e.feature:60`
- ✅ Scenario: Calendar days fit the narrowest screen — (date-selection) `date_selection/date_selection_layout_e2e.feature:111`
- ✅ Scenario: No horizontal scrolling — (date-selection) `time_selection/time_selection_wall_time_input_e2e.feature:91`
- ✅ Scenario: Vivid by default — (day-colouring) `settings/settings_day_palette_unit.feature:18`, `src/preferences/preferences.dayPalette.test.ts` ("should default to Vivid")
- ✅ Scenario: Palette colours in a real browser — (day-colouring) `day_colouring/day_colouring_palette_e2e.feature:6`
- ✅ Scenario: Other colourings ignore the palette — (day-colouring) `day_colouring/day_colouring_palette_e2e.feature:24`
- ✅ Scenario: Changing the palette keeps the moment — (day-colouring) `day_colouring/day_colouring_palette_e2e.feature:38`
- ✅ Scenario: Changing the day palette re-presents nothing — (day-colouring) `day_colouring/day_colouring_budget.feature:26`
- ✅ Scenario: Time of day by default — (day-colouring) `settings/settings_day_colouring_unit.feature:6`
- ✅ Scenario: Changing the colouring keeps the moment — (day-colouring) `day_colouring/day_colouring_day_tracks.feature:15`
- ✅ Scenario: Digit contrast on every cell colour — (day-colouring) `src/styles/tokens.test.ts` (MIN_TEXT_CONTRAST / MIN_NON_TEXT_CONTRAST checks per theme and palette, task 4.3)
- ✅ Scenario: Night digits in the dark theme — (day-colouring) `day_colouring/day_colouring_palette_e2e.feature:66`
- ✅ Scenario: Accent and grey in a real browser — (day-colouring) `day_colouring/day_colouring_e2e.feature:6`
- ⚠️ Scenario: No violations for every theme and palette — (day-colouring) `day_colouring/day_colouring_e2e.feature:102` covers the 4 pairs in Cards and Grid, but at the Playwright project viewports (Desktop Chrome 1280 px, Pixel 5 393 px), not at the 375 / 1024 px the scenario names; same narrow and wide layouts, so no finding
- ✅ Scenario: No violations in every colouring — (day-colouring) `day_colouring/day_colouring_e2e.feature:85`
- ✅ Scenario: Screenshots of the colourings — (day-colouring) `day_colouring/day_colouring_e2e.feature:124`
- ✅ Scenario: Cell sizes by width — (grid-view) `grid_view/grid_view_redesign_e2e.feature:6` ("Cell sizes at <width> px")
- ✅ Scenario: Cells 38 px wide on a phone — (grid-view) `grid_view/grid_view_redesign_e2e.feature:21`
- ✅ Scenario: Day periods of Almaty — (grid-view) `grid_view/grid_view_hour_cells_unit.feature:26`
- ✅ Scenario: The larger part decides — (grid-view) `grid_view/grid_view_hour_cells_unit.feature:32`
- ✅ Scenario: A tie takes the earlier period — (grid-view) `grid_view/grid_view_hour_cells_unit.feature:39`
- ✅ Scenario: Theme colours of the cells — (grid-view) `grid_view/grid_view_hour_cells_e2e.feature:14`
- ✅ Scenario: Controls are locked during the meeting and free after it — (grid-view) `grid_view/grid_view_meeting_lock_e2e.feature:100`
- ✅ Scenario: Setting a meeting range closes an open location menu — (grid-view) `grid_view/grid_view_meeting_lock_unit.feature:16`
- ✅ Scenario: Cards keeps its controls with a meeting range — (grid-view) `grid_view/grid_view_meeting_lock_unit.feature:22`
- ✅ Scenario: No accessibility violations in the meeting state — (grid-view) `grid_view/grid_view_meeting_share_e2e.feature:55`
- ✅ Scenario: No accessibility violations with the meeting range input — (grid-view) `grid_view/grid_view_meeting_lock_e2e.feature:79`
- ✅ Scenario: Tab order skips the locked controls — (grid-view) `grid_view/grid_view_meeting_lock_e2e.feature:6`
- ✅ Scenario: The open input's fields sit in place of the span in the Tab order — (grid-view) `grid_view/grid_view_meeting_lock_e2e.feature:29`
- ✅ Scenario: The keyboard alone sets the meeting — (grid-view) `grid_view/grid_view_meeting_lock_e2e.feature:47`
- ✅ Scenario: The open input fits on a phone — (grid-view) `grid_view/grid_view_meeting_lock_e2e.feature:61`
- ✅ Scenario: Approved screenshots of the meeting state — (grid-view) `grid_view/grid_view_meeting_screenshots_e2e.feature:6`
- ✅ Scenario: All hours fit — (grid-view) `grid_view/grid_view_width_e2e.feature:8`
- ✅ Scenario: Phone in portrait scrolls all strips together — (grid-view) `grid_view/grid_view_width_e2e.feature:24`
- ✅ Scenario: Frame moved out of view is scrolled into view — (grid-view) `grid_view/grid_view_width_e2e.feature:37`
- ✅ Scenario: Notes and header texts cover the frame — (grid-view) `grid_view/grid_view_hour_frame_e2e.feature:22`
- ✅ Scenario: The frame border runs through the empty parts of the header — (grid-view) `grid_view/grid_view_layers_e2e.feature:50`
- ✅ Scenario: Only the home row shows the home mark — (home-location) `home_location/home_location_reference_unit.feature:48`
- ✅ Scenario: The house is the design's outline — (home-location) `locations/locations_card_layout_e2e.feature:98` ("has no fill, the accent outline, 23 by 23 px"), `src/views/shared/LocationMarkIcon.tsx` maps HOME to Lucide `House`
- ✅ Scenario: Outlined in the accent colour in the light theme — (home-location) `home_location/home_location_mark_e2e.feature:7` (light row)
- ✅ Scenario: Outlined in the accent colour in the dark theme — (home-location) `home_location/home_location_mark_e2e.feature:7` (dark row)
- ⚠️ Scenario: The Here mark stays filled next to the house — (home-location) covered piecewise only: house in `locations_card_layout_e2e.feature:98`, map pin without "here" in `:111`; no scenario shows both marks in one list
- ✅ Scenario: The mark keeps its name — (home-location) `home_location/home_location_e2e.feature:31` ("has a mark named \"Home location\"")
- ✅ Scenario: Home in the device time zone — (home-location) `home_location/home_location_reference_unit.feature:56`
- ✅ Scenario: Travelling — (home-location) `home_location/home_location_reference_unit.feature:65`
- ✅ Scenario: Menu of a row that is not home — (home-location) `home_location/home_location_menu_unit.feature:6`
- ✅ Scenario: Menu of the home row — (home-location) `home_location/home_location_menu_unit.feature:14`
- ✅ Scenario: Setting home is announced — (home-location) `home_location/home_location_e2e.feature:25`
- ✅ Scenario: No home item for an unknown zone — (home-location) `home_location/home_location_menu_unit.feature:22`
- ✅ Scenario: Card sizes on a phone — (locations) `locations/locations_card_layout_e2e.feature:6`
- ✅ Scenario: Lines of a narrow card — (locations) `locations/locations_card_layout_e2e.feature:21`
- ✅ Scenario: Two lines from 768 px — (locations) `locations/locations_card_layout_e2e.feature:30`
- ✅ Scenario: A long city wraps and the time drops — (locations) `locations/locations_card_layout_e2e.feature:46`
- ✅ Scenario: Small day period marker — (locations) `locations/locations_card_layout_e2e.feature:58`
- ✅ Scenario: Presenting 50 rows again in the 12-hour format builds no formatter — (locations) `locations/locations_local_time_unit.feature:70`
- ✅ Scenario: Move up from the menu — (locations) `locations/locations_reorder_menu_unit.feature:12`
- ✅ Scenario: Move down with the keyboard only — (locations) `locations/locations_reorder_menu_unit.feature:19`
- ✅ Scenario: Items that cannot apply are disabled — (locations) `locations/locations_reorder_menu_unit.feature:25`
- ✅ Scenario: Menu order — (locations) `locations/locations_reorder_menu_unit.feature:31`
- ✅ Scenario: Rows show city and country — (locations) `locations/locations_ui_unit.feature:6`
- ✅ Scenario: Empty state after the last removal — (locations) `locations/locations_ui_unit.feature:13`
- ✅ Scenario: Remove action names the city — (locations) `locations/locations_ui_e2e.feature:53`
- ✅ Scenario: Focus after removal — (locations) `locations/locations_view_contract_e2e.feature:60`
- ✅ Scenario: Focus after the last removal — (locations) `locations/locations_view_contract_e2e.feature:66`
- ✅ Scenario: Drag a card to the top with the mouse — (locations) `locations/locations_reorder_e2e.feature:7`
- ✅ Scenario: Drag a card down by touch — (locations) `locations/locations_reorder_e2e.feature:14`
- ✅ Scenario: Scrolling over a card scrolls the page — (locations) `locations/locations_reorder_e2e.feature:48`
- ✅ Scenario: A single location has no handle — (locations) `locations/locations_reorder_e2e.feature:31` ("A single location has no grab cursor")
- ✅ Scenario: A quick swipe over the handle scrolls without Pointer Events — (locations) `locations/locations_reorder_legacy_touch_e2e.feature:18` (swipe over the city)
- ✅ Scenario: A swipe without a hold scrolls the page — (locations) `locations/locations_reorder_e2e.feature:48` ("Scrolling over a card scrolls the page")
- ✅ Scenario: A click on the city moves nothing — (locations) `locations/locations_reorder_e2e.feature:37`
- ⚠️ Scenario: Only the grab area starts a drag — (locations) structural check only: `src/views/shared/ZoneRowContent.test.tsx:88` (time, menu and day track carry no listeners); no pointer scenario presses on the time, the menu button or the track
- ✅ Scenario: Cancel a drag — (locations) `locations/locations_reorder_e2e.feature:22`
- ✅ Scenario: No drag handle anywhere — (locations) `locations/locations_reorder_e2e.feature:60`; `DragHandle.tsx` deleted
- ✅ Scenario: Drag by finger without Pointer Events — (locations) `locations/locations_reorder_legacy_touch_e2e.feature:7`
- ✅ Scenario: No drag in Grid while a meeting range is set — (locations) `grid_view/grid_view_meeting_lock_e2e.feature:118`
- ✅ Scenario: The picked-up card is lifted — (locations) `locations/locations_reorder_e2e.feature:120` with `steps/locations_reorder_motion_e2e.steps.ts:94` (width × 1.02, box-shadow not none)
- ✅ Scenario: Displaced card slides — (locations) `locations/locations_reorder_e2e.feature:84`
- ✅ Scenario: Dropped card settles into its slot — (locations) `locations/locations_reorder_e2e.feature:101`
- ✅ Scenario: The dragged card keeps its width and its slot — (locations) `locations/locations_reorder_e2e.feature:120`
- ✅ Scenario: Reduced motion — (locations) `locations/locations_reorder_e2e.feature:91`
- ✅ Scenario: Reduced motion has no drop animation — (locations) `locations/locations_reorder_e2e.feature:110`
- ✅ Scenario: No accessibility violations — (locations) `time_selection/time_selection_e2e.feature:75`
- ✅ Scenario: The grab area is not a Tab stop — (locations) `locations/locations_reorder_e2e.feature:65`
- ⚠️ Scenario: Handle target size — (locations) menu button 44 px in `home_location/home_location_e2e.feature:62`; menu items are `min-h-11` (`LocationMenu.tsx`) but no test measures them
- ✅ Scenario: List screenshots show the handles — (locations) `locations/locations_reorder_e2e.feature:198` ("The list state shows grab areas")
- ✅ Scenario: Narrow and wide screens — (locations) `settings/settings_language_e2e.feature:106`
- ✅ Scenario: 50 locations within the budget — (locations) `locations/locations_reorder_unit.feature:68`
- ⚠️ Scenario: Reorder stays out of the initial bundle — (locations) 150 KB enforced by `scripts/check-bundle-size.mjs`; "no drag-and-drop code" only by the manual grep of task 11.7 (R4)
- ✅ Scenario: Russian interface — (locations) `home_location/home_location_e2e.feature:43`
- ⚠️ Scenario: No handle strings remain — (locations) keys removed from `src/locales/en.json` / `ru.json` (verified), but no test asserts their absence
- ✅ Scenario: One row matches — (locations) `locations/locations_device_time_zone_unit.feature:7`
- ✅ Scenario: Icon before the city, caption after it — (locations) `locations/locations_card_layout_e2e.feature:111`
- ✅ Scenario: The former pill is gone — (locations) `locations/locations_here_mark_unit.feature:14`
- ✅ Scenario: No row matches — (locations) `locations/locations_device_time_zone_unit.feature:16`
- ✅ Scenario: Several rows match — (locations) `locations/locations_device_time_zone_unit.feature:24`
- ✅ Scenario: Legacy device identifier — (locations) `locations/locations_device_time_zone_unit.feature:34`
- ✅ Scenario: Unknown device identifier — (locations) `locations/locations_device_time_zone_unit.feature:43`
- ✅ Scenario: Badge follows changes of the list — (locations) `locations/locations_device_time_zone_unit.feature:52`
- ✅ Scenario: Device zone is read once — (locations) `locations/locations_device_time_zone_unit.feature:63`
- ✅ Scenario: Device zone is read again at the minute boundary — (locations) `locations/locations_clock_tick.feature:55`
- ✅ Scenario: Device zone is read again when the page becomes visible — (locations) `locations/locations_clock_tick.feature:66`
- ✅ Scenario: Device zone is not stored — (locations) `locations/locations_device_time_zone_unit.feature:74`
- ✅ Scenario: The home row shows no here mark — (locations) `locations/locations_home_mark_unit.feature:6`
- ✅ Scenario: English interface — (locations) `locations/locations_device_time_zone_unit.feature:83`
- ✅ Scenario: Russian interface — (locations) `home_location/home_location_e2e.feature:43`
- ⚠️ Scenario: No caption key remains — (locations) `hereMarkCaption` removed from both locales (verified), but no test asserts its absence
- ✅ Scenario: Row name includes the badge — (locations) `locations/locations_device_time_zone_e2e.feature:9`
- ✅ Scenario: 50 rows within the budget — (locations) `date_selection/date_selection_reference_moment_rows.feature:7`
- ✅ Scenario: No accessibility violations with the badge — (locations) `locations/locations_device_time_zone_e2e.feature:17`
- ✅ Scenario: Badge fits narrow and wide screens — (locations) `locations/locations_device_time_zone_e2e.feature:31`
- ✅ Scenario: List screenshots show the badge — (locations) `locations/locations_device_time_zone_e2e.feature:45`
- ✅ Scenario: A marked row has exactly one leading icon — (locations) `locations/locations_here_mark_unit.feature:23`
- ✅ Scenario: Every mark kind is fully defined — (locations) `locations/locations_here_mark_unit.feature:31`
- ✅ Scenario: Home wins over here — (locations) `locations/locations_home_mark_unit.feature:14`
- ✅ Scenario: Both kinds take the same slot — (locations) `locations/locations_card_layout_e2e.feature:98` and `:111` (house and pin both 23 × 23 px before the city at 390 px)
- ✅ Scenario: Texts in both languages — (locations) `locations/locations_clock_change_note_unit.feature:74`
- ✅ Scenario: Difference look in a card — (locations) `locations/locations_card_layout_e2e.feature:73`
- ✅ Scenario: Narrow screen — (locations) `settings/settings_zone_label_e2e.feature:74`
- ✅ Scenario: Wide screen — (locations) `locations/locations_local_time_e2e.feature:17` ("Date, time and menu on one line on a wide screen")
- ✅ Scenario: One time column width in the 12-hour format — (locations) `locations/locations_card_layout_e2e.feature:80`
- ✅ Scenario: Times fit narrow and wide screens — (locations) `locations/locations_local_time_e2e.feature:27`
- ✅ Scenario: List screenshots show the time and the date — (locations) `locations/locations_ui_e2e.feature:159`, `locations/locations_12_hour_screenshots_e2e.feature:8` (re-taken baselines)
- ✅ Scenario: Keyboard — (locations) `time_selection/time_selection_e2e.feature:28`
- ✅ Scenario: The menu does not start a reorder — (locations) `home_location/home_location_e2e.feature:17`
- ✅ Scenario: The menu is locked in Grid while a meeting range is set — (locations) `grid_view/grid_view_meeting_lock_e2e.feature:147`
- ✅ Scenario: Keyboard opens the menu on the first enabled item — (locations) `src/views/shared/LocationMenu.test.tsx:230`; `LocationMenu.tsx` `openAt(firstEnabledIndex)`
- ⚠️ Scenario: Opening the menu moves nothing — (locations) no test found that opens a menu by mouse and checks order and handles; behaviour unchanged by this branch apart from the new items
- ✅ Scenario: Device time location on the design sample — (locations) `locations/locations_device_time_unit.feature:7`
- ✅ Scenario: Device time zone line — (locations) `locations/locations_device_time_redesign_unit.feature:16`
- ✅ Scenario: The device moves to another zone — (locations) `locations/locations_device_time_unit.feature:27`
- ✅ Scenario: Unknown device time zone — (locations) `locations/locations_device_time_unit.feature:37`
- ✅ Scenario: Meta line follows the zone label — (locations) `locations/locations_zone_line_unit.feature:77`
- ✅ Scenario: Same menu as a city card — (locations) `locations/locations_device_time_unit.feature:45`
- ✅ Scenario: Reorder below a city — (locations) `locations/locations_device_time_e2e.feature:61`
- ✅ Scenario: Remove the device time location — (locations) `locations/locations_device_time_unit.feature:52`
- ✅ Scenario: Name and list size — (locations) `locations/locations_device_time_e2e.feature:8`
- ✅ Scenario: No violations — (locations) `settings/settings_day_palette_e2e.feature:76`
- ✅ Scenario: Narrow and wide screens — (locations) `settings/settings_language_e2e.feature:106`
- ✅ Scenario: The exemplar city keeps the height — (locations) `locations/locations_device_time_e2e.feature:43`
- ✅ Scenario: Approved screenshots — (locations) `grid_view/grid_view_meeting_screenshots_e2e.feature:6`
- ✅ Scenario: Whole-hour zone — (locations) `locations/locations_utc_offset_unit.feature:6`
- ✅ Scenario: Half-hour zone — (locations) `locations/locations_utc_offset_unit.feature:13`
- ✅ Scenario: 45-minute zone — (locations) `locations/locations_utc_offset_unit.feature:20`
- ✅ Scenario: Daylight saving time is respected — (locations) `locations/locations_utc_offset_unit.feature:27`
- ✅ Scenario: Zero offset — (locations) `locations/locations_utc_offset_unit.feature:39`
- ✅ Scenario: Offset is computed again when the list changes — (locations) `locations/locations_utc_offset_unit.feature:46`
- ✅ Scenario: Offset is computed again at the minute boundary — (locations) `locations/locations_clock_tick.feature:45`
- ✅ Scenario: Offset that cannot be computed — (locations) `locations/locations_utc_offset_unit.feature:55`
- ✅ Scenario: Offset hidden by the zone label — (locations) `locations/locations_zone_line_unit.feature:69`
- ✅ Scenario: Country, abbreviation and offset — (locations) `locations/locations_zone_line_unit.feature:6`
- ✅ Scenario: The zone label decides the elements — (locations) `locations/locations_zone_line_unit.feature:15`
- ✅ Scenario: No zone line when every part is hidden — (locations) `locations/locations_zone_line_country_unit.feature:6`
- ✅ Scenario: The abbreviation follows the reference moment — (locations) `locations/locations_zone_line_unit.feature:35`
- ✅ Scenario: Unknown elements leave nothing behind — (locations) `locations/locations_zone_line_unit.feature:44`
- ✅ Scenario: UTC with the zone abbreviation only — (locations) `locations/locations_zone_line_unit.feature:52`
- ✅ Scenario: Universal Time on the UTC row — (locations) `locations/locations_zone_line_unit.feature:95`
- ✅ Scenario: A change applies to every row at once — (locations) `locations/locations_zone_line_unit.feature:61`
- ✅ Scenario: Hiding the country applies to every row at once — (locations) `locations/locations_zone_line_unit.feature:113`
- ✅ Scenario: Elements joined by middle dots — (locations) `locations/locations_zone_line_e2e.feature:38`
- ✅ Scenario: No dot at a wrap — (locations) `locations/locations_zone_line_e2e.feature:47`
- ✅ Scenario: No overflow and no clipping — (locations) `locations/locations_zone_line_e2e.feature:8`
- ✅ Scenario: Wrapping between elements only — (locations) `locations/locations_zone_line_e2e.feature:29`
- ✅ Scenario: Re-approved screenshots — (locations) `locations/locations_ui_e2e.feature:159`, `locations/locations_utc_offset_e2e.feature:34` (baselines re-taken in 13.4)
- ✅ Scenario: Dots are not read — (locations) `locations/locations_zone_line_e2e.feature:57`
- ✅ Scenario: The column is centred on a wide screen — (main-page) `main_page/main_page_content_column_e2e.feature:6`
- ✅ Scenario: The bars span the viewport — (main-page) `main_page/main_page_content_column_e2e.feature:23`
- ✅ Scenario: The empty state sits in the column — (main-page) `main_page/main_page_content_column_e2e.feature:35`
- ✅ Scenario: Narrow header — (main-page) `main_page/main_page_header_e2e.feature:9`
- ✅ Scenario: Wide header — (main-page) `main_page/main_page_header_e2e.feature:23`
- ✅ Scenario: Title size by width — (main-page) `main_page/main_page_header_e2e.feature:40`
- ✅ Scenario: The header opens the search and the settings — (main-page) `main_page/main_page_header_e2e.feature:53`
- ✅ Scenario: Slash still opens the search — (main-page) `main_page/main_page_header_e2e.feature:62`
- ✅ Scenario: One Add location button — (main-page) `main_page/main_page_header_e2e.feature:78`
- ✅ Scenario: Header sizes and accessibility — (main-page) `main_page/main_page_header_e2e.feature:105`
- ✅ Scenario: No Add location button on an unreadable list — (main-page) `main_page/main_page_header_e2e.feature:85`
- ✅ Scenario: The meeting bar replaces the header — (main-page) `main_page/main_page_header_e2e.feature:121`
- ✅ Scenario: Cards keeps its header with a meeting range — (main-page) `main_page/main_page_header_e2e.feature:135`
- ✅ Scenario: Rows in one panel with hour strips — (main-page) `main_page/main_page_grid_view_unit.feature:7`
- ✅ Scenario: Row notes after the hour strip — (main-page) `main_page/main_page_grid_view_e2e.feature:68`
- ✅ Scenario: The location menu of a grid row is fully visible — (main-page) `main_page/main_page_grid_view_e2e.feature:87`
- ✅ Scenario: Grid row header in one line — (main-page) `main_page/main_page_grid_view_e2e.feature:28`
- ✅ Scenario: Grid row header in two lines on a phone — (main-page) `main_page/main_page_grid_view_e2e.feature:77`
- ✅ Scenario: Grid rows use the theme token colours — (main-page) `main_page/main_page_grid_view_e2e.feature:39`
- ✅ Scenario: Typing a time in Grid — (main-page) `main_page/main_page_grid_view_unit.feature:14`
- ✅ Scenario: Empty Grid — (main-page) `main_page/main_page_grid_view_unit.feature:20`
- ✅ Scenario: Unreadable list in Grid — (main-page) `main_page/main_page_grid_view_unit.feature:28`
- ✅ Scenario: Grid works offline — (main-page) `main_page/main_page_grid_view_e2e.feature:55`
- ✅ Scenario: Grid fits narrow and wide screens — (main-page) `main_page/main_page_grid_view_e2e.feature:8` (seven widths, both formats)
- ✅ Scenario: Approved Grid screenshots — (main-page) `main_page/main_page_grid_view_e2e.feature:103`
- ✅ Scenario: Shown only in the Time of day colouring — (settings) `settings/settings_day_palette_unit.feature:6`
- ✅ Scenario: Showing the group moves nothing above it — (settings) `settings/settings_day_palette_e2e.feature:6`
- ✅ Scenario: Vivid is checked by default — (settings) `settings/settings_day_palette_e2e.feature:33`
- ✅ Scenario: Swatches show the palette of the active theme — (settings) `settings/settings_day_palette_e2e.feature:39`
- ✅ Scenario: Choosing Muted recolours the main page — (settings) `settings/settings_day_palette_e2e.feature:52`
- ✅ Scenario: Keyboard choice — (settings) `settings/settings_day_palette_e2e.feature:61`
- ✅ Scenario: Names and sizes — (settings) `settings/settings_day_palette_e2e.feature:69`
- ✅ Scenario: No accessibility violations — (settings) `time_selection/time_selection_e2e.feature:75`
- ✅ Scenario: The palette survives a reload — (settings) `settings/settings_day_palette_storage.feature:6`
- ✅ Scenario: Existing users get Vivid — (settings) `settings/settings_day_palette_storage.feature:12`
- ✅ Scenario: Unknown palette is unreadable — (settings) `settings/settings_day_palette_storage.feature:18`
- ✅ Scenario: Another tab changes the palette — (settings) `settings/settings_day_palette_storage.feature:24`
- ✅ Scenario: The palette survives a colouring change — (settings) `settings/settings_day_palette_storage.feature:30`
- ✅ Scenario: Each colour is one value — (settings) `src/styles/tokens.test.ts` (one dark block, no `prefers-color-scheme`, no duplicate token) and `src/test/legacyBuild/copyDarkThemeToSystemTheme.test.ts`
- ✅ Scenario: The system dark theme uses the same values — (settings) `settings/settings_e2e.feature:127`
- ✅ Scenario: A group with three options — (settings) `settings/settings_option_group_unit.feature:7`
- ✅ Scenario: An option without an icon or a pictogram shows its name — (settings) `settings/settings_option_group_unit.feature:14`
- ✅ Scenario: An option with a swatch — (settings) `src/app/settings/SettingsOptionGroup.test.tsx` (swatch aria-hidden, name as accessible name and title)
- ✅ Scenario: Caption and options in one row — (settings) `settings/settings_option_group_e2e.feature:55`
- ✅ Scenario: Choosing moves nothing — (settings) `settings/settings_option_group_e2e.feature:84`
- ✅ Scenario: Narrow and wide screens — (settings) `settings/settings_language_e2e.feature:106`
- ✅ Scenario: Compact groups — (settings) `settings/settings_option_group_e2e.feature:72`
- ✅ Scenario: Groups use the control border — (settings) `settings/settings_day_palette_e2e.feature:123`
- ✅ Scenario: Approved screenshots — (settings) `grid_view/grid_view_meeting_screenshots_e2e.feature:6`
- ✅ Scenario: Compact colouring rows — (settings) `settings/settings_day_palette_e2e.feature:92`
- ✅ Scenario: The row appears without moving the groups above — (settings) `settings/settings_day_palette_e2e.feature:17`
- ✅ Scenario: No horizontal scrolling with the row — (settings) `settings/settings_day_palette_e2e.feature:108`
- ✅ Scenario: Both languages of the colouring settings — (settings) `settings/settings_day_colouring_unit.feature:30`
- ✅ Scenario: Both languages of the Colours group — (settings) `settings/settings_day_palette_unit.feature:23`
- ✅ Scenario: Every locale has the keys — (settings) `settings/settings_day_palette_unit.feature:34`
- ✅ Scenario: The handle never covers the time or the menu button — (time-selection) `time_selection/time_selection_regressions_e2e.feature:6`
- ✅ Scenario: Tracks of equal width in both hour formats — (time-selection) `time_selection/time_selection_regressions_e2e.feature:24`
- ✅ Scenario: Hour labels on one line and apart — (time-selection) `time_selection/time_selection_regressions_e2e.feature:41`
- ✅ Scenario: The handle has the fill of its own card — (time-selection) `time_selection/time_selection_regressions_e2e.feature:69`
- ✅ Scenario: A hint does not reshape its card — (time-selection) `time_selection/time_selection_regressions_e2e.feature:87`
- ✅ Scenario: Track under the text on a narrow screen — (time-selection) `time_selection/time_selection_layout_e2e.feature:8`
- ✅ Scenario: Track beside the time on a wide screen — (time-selection) `time_selection/time_selection_layout_e2e.feature:17` (own line, 12 px bar, 23 px handle at 1024 px)
- ✅ Scenario: Handle border by theme — (time-selection) `time_selection/time_selection_layout_e2e.feature:26`
- ✅ Scenario: Handle centre matches the instant — (time-selection) `time_selection/time_selection_layout_e2e.feature:47`
- ✅ Scenario: The dragged handle stays under the pointer — (time-selection) `time_selection/time_selection_drag_e2e.feature:48`
- ✅ Scenario: Drag without scrolling or reordering — (time-selection) `time_selection/time_selection_e2e.feature:18`
- ✅ Scenario: The handle stays clear of the time and the menu — (time-selection) `time_selection/time_selection_layout_e2e.feature:111`
- ✅ Scenario: A vertical swipe on a track scrolls without selecting a time — (time-selection) `time_selection/time_selection_touch_e2e.feature:7`
- ✅ Scenario: A finger tap on a track selects a time — (time-selection) `time_selection/time_selection_touch_e2e.feature:20`
- ✅ Scenario: Touch targets — (time-selection) `time_selection/time_selection_layout_e2e.feature:60`
- ✅ Scenario: Tracks fit narrow and wide screens — (time-selection) `time_selection/time_selection_layout_e2e.feature:72`
- ✅ Scenario: Screenshots show the tracks — (time-selection) `locations/locations_ui_e2e.feature:159`, `locations/locations_12_hour_screenshots_e2e.feature:8`
- ✅ Scenario: The handle is filled with its card's fill — (time-selection) `time_selection/time_selection_card_layout_e2e.feature:26`
- ✅ Scenario: Equal tracks in the 12-hour format — (time-selection) `time_selection/time_selection_card_layout_e2e.feature:59`
- ✅ Scenario: Hour labels on one line in Russian — (time-selection) `time_selection/time_selection_card_layout_e2e.feature:82`
- ✅ Scenario: Tracks in the 12-hour format fit narrow and wide screens — (time-selection) `time_selection/time_selection_card_layout_e2e.feature:92`

## Mutation

Scoped Stryker runs, one at a time, `cd packages/client && npx stryker run --mutate '<files>'`, report read from `reports/mutation/mutation-report.json`:

| File | Score | Survivors |
|---|---|---|
| `src/views/shared/locationMenuNavigation.ts` | 100.00 % | — |
| `src/views/shared/zoneLineBreaks.ts` | 100.00 % | — |
| `src/presenter/localDateTime.ts` | 100.00 % | — |
| `src/presenter/locationMark.ts` | 100.00 % | — |
| `src/controller/useDayPalettePreference.ts` | 100.00 % | — |
| `src/preferences/preferencesCommands.ts` | 100.00 % | — |
| `src/views/grid/hourCellLayout.ts` | 100.00 % | — |
| `src/views/shared/useLocationMenuItems.ts` | 100.00 % | — |
| `src/preferences/parseStoredPreferences.ts` | 100.00 % | — |
| `src/adapters/preferencesDocument.ts` | 97.44 % | line 84, block of `deserializePreferencesDocument` (untouched code) |
| `src/app/settings/DayPaletteGroup.tsx` | 100.00 % | — |
| `src/app/settings/PaletteSwatch.tsx` | 100.00 % | — |
| `src/views/shared/useSortableLocationRow.ts` | 92.31 % | line 59, `setItemRef` body emptied — no test checks that the row element reaches `setNodeRef` / the drop-settle ref (above the 90 % minimum, below the 95 % target) |

Not measured: `src/presenter/presentLocationRows.ts` (the run with `parseStoredPreferences.ts` exceeded the 10-minute tool limit and was stopped by `timeout 590`; the file is exercised by most of the suite), and the view components `ZoneLine.tsx`, `LocalDateTime.tsx`, `LocationMenu.tsx`, `LocationList.tsx`, `ViewLocationList.tsx`, `DayTrack.tsx`, `presentZoneMoment.ts` for the same time reason. No score is claimed for them.

## Findings

### R1 — CRITICAL — Content column uses logical properties that iOS Safari 12.5 ignores
- Location: `packages/client/src/styles/globals.css:8-14`
- Rule: ADR-0009 ("The supported engines are the latest evergreen browsers and iOS Safari 12.5"); `.claude/rules/code-style.md` ("Is any value repeated in 2+ places? → Must be a constant")
- Problem: `.content-column`, the class on the header row and on `main` (`MainPage.tsx` `COLUMN_CLASS_NAME`), is written as `width: 100%; max-width: 70rem; margin-inline: auto; padding-inline: 13px;`. The built CSS keeps it verbatim (`dist/assets/main-*.css`: `.content-column{width:100%;max-width:70rem;margin-inline:auto;padding-inline:13px}`). The `margin-inline` and `padding-inline` shorthands need Safari 14.1; iOS Safari 12.5 drops both declarations. No PostCSS step rewrites them (`postcss.config.js` only has `expandInsetShorthand` and the new dark-theme copy), and `check:legacy-build` only scans for `inset:`. In addition, `70rem` and `13px` repeat `maxWidth.content` and `spacing.column` of `tailwind.config.ts`, which the footer group uses (`max-w-content`), so the two column widths can drift apart.
- Impact: on an iPhone 6 / 5s or iPad Air 2 (iOS 12.5, a supported engine), the title and every card touch the screen edges: the 13 px list side padding of FR7 / §5 is lost, and on screens wider than 1120 px the column is not centred (FR12). Editing the column width in `tailwind.config.ts` would leave the header and list at the old width while the date bar group follows.
- Fix: write the class with physical properties from the Tailwind theme, e.g. `@apply mx-auto w-full max-w-content px-column;` (Tailwind 3.4 emits `margin-left/right` and `padding-left/right`), or plain CSS `margin-left: auto; margin-right: auto; padding-left: theme("spacing.column"); padding-right: theme("spacing.column"); max-width: theme("maxWidth.content");`. Optionally extend `scripts/legacyBuild/findLegacySyntaxIssues.ts` to flag `margin-inline` / `padding-inline` declarations like it flags `inset:`.
- Fix risk: commit 03cada3 replaced an `@apply` of the same classes with plain CSS without stating why; if `@apply` caused a build problem, the `theme()` variant avoids it. Modern-browser rendering is identical, so the re-taken screenshots should not change; run the content-column and header E2E features once to confirm.
- Status: open

### R2 — WARNING — Palette swatch outline is drawn inside the 24 px square
- Location: `packages/client/src/app/settings/PaletteSwatch.tsx:29`
- Rule: FR5 of the proposal (spec.md §3, now `docs/architecture/views.md`): ("Each option SHALL show a palette swatch (24 × 24 px, radius 5 px, four equal vertical stripes … 2 px outline in the surface colour)")
- Problem: the swatch uses `outline outline-2 -outline-offset-2 outline-surface`. The negative offset paints the 2 px surface ring over the inner 2 px of the square, so the four stripes are visible only in the inner 20 × 20 px. The approved screen (`docs/design/screens/settings-phone-light.html:154`, `.palette-swatch { … width: 24px; height: 24px; … outline: 2px solid var(--color-surface); }`) draws the outline outside the 24 × 24 px stripes. The E2E step "each swatch is 24 by 24 px" (`settings_day_palette_e2e.steps.ts:123-135`) measures the bounding box, which is 24 px either way, and the unit test only checks for `outline-surface`, so nothing catches it.
- Impact: the swatches render a sixth smaller than specified in both themes on the settings page, with the colours framed by a wide surface ring; the re-approved settings screenshots now lock in this look.
- Fix: drop `-outline-offset-2` so the outline sits outside the square as on the screen; re-take the settings screenshots of task 13.4 that show the Colours group (`settings_e2e.feature`, `settings_language_e2e.feature`) and add an assertion in the swatch E2E step that `outline-offset` is `0px`.
- Fix risk: the ring then extends 2 px beyond the 24 px square inside the option button; the button is at least 44 × 44 px, so nothing is clipped. Re-taken baselines change only in the swatch.
- Status: open

### R3 — WARNING — Task 9.1 ticked without its DayTrack RED test
- Location: `packages/client/src/views/shared/DayTrack.tsx:106-118`
- Rule: `.claude/rules/tdd-workflow.md` ("Never write implementation before its test exists"); task 9.1 of `tasks.md`
- Problem: task 9.1 asks for `src/views/shared/DayTrack.test.tsx` to assert the visible handle size via `DAY_TRACK_HANDLE_SIZE_PX` (23), `bg-surface`, `border-handle-border`, the `h-3` bar on every width and no `md:` inset, and names `npx vitest run src/views/shared/DayTrack.test.tsx` as its failing check. `DayTrack.test.tsx` is unchanged on this branch and `DAY_TRACK_HANDLE_SIZE_PX` does not exist (`grep -rn DAY_TRACK_HANDLE_SIZE_PX packages/client/src` prints nothing); the size is a Tailwind `spacing.handle` value instead. The task is ticked. The behaviour itself is implemented and is guarded by E2E scenarios (`time_selection_layout_e2e.feature:13,22,30`).
- Impact: the task record claims a unit test that does not exist; `DayTrack.tsx` was not in any mutation run of tasks 9.5 / M5, and a class regression (e.g. the handle border token) is caught only by the slow E2E project. Severity kept at WARNING because the user-visible behaviour is implemented and E2E-tested.
- Fix: extend `src/views/shared/DayTrack.test.tsx` with the assertions task 9.1 lists (bar `h-3` without `md:` classes, inset without `md:inset-x`, handle `h-handle w-handle`, `bg-surface`, `border-handle-border`, `border-[length:var(--handle-border-width)]`), and either add `DAY_TRACK_HANDLE_SIZE_PX = 23` to `src/constants/` for the tests or amend task 9.1/9.2 to say the size is the `handle` spacing token.
- Fix risk: none — tests only; amending `tasks.md` text is allowed in an active change.
- Status: open

### R4 — WARNING — "No drag-and-drop code in the initial JavaScript" has no automated check
- Location: `packages/client/scripts/check-bundle-size.mjs:1-50`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it"); NFR-P2 of the proposal and the `locations` scenario "Reorder stays out of the initial bundle" ("AND it contains no drag-and-drop code")
- Problem: this branch moves the reorder to `MouseSensor` + `TouchSensor` and lazy-loads the calendar month grid to stay in budget, but the only check that dnd-kit stays out of the initial scripts is the one-off shell loop in task 11.7. `check-bundle-size.mjs` enforces the 150 KB budget and the per-view chunks, not the absence of dnd-kit.
- Impact: a later import of `@dnd-kit/*` (or of `LocationList`) from the entry or main chunk passes CI as long as the total stays under 150 KB, silently breaking NFR-P2 and slowing the first paint on the iOS 12 devices this budget protects.
- Fix: in `check-bundle-size.mjs`, read the files returned by `collectInitialScriptUrls` (already imported there) and fail when any contains `DndDescribedBy`; also fail when no built chunk contains it, so the check cannot pass vacuously after a dnd-kit upgrade renames the marker.
- Fix risk: the marker is a dnd-kit implementation string; the "must appear somewhere" guard turns a rename into a visible failure rather than a silent pass. No runtime change.
- Status: open

## Verdict

Not ready: R1 (CRITICAL) breaks the card and header layout on iOS Safari 12.5, a supported engine. R2–R4 are warnings to fix in the same round.
