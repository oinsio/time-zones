# Design: Redesign the cards, the grid and the day colours

All decisions below are local to this change. The layering (ADR-0002, `.claude/rules/architecture.md`), the persistence envelope and migrations (ADR-0004), the view registry and shared blocks (ADR-0005), the reference zone and device time (ADR-0007, ADR-0010), the work bounds (ADR-0008), the supported engines (ADR-0009) and the sun-based day periods (ADR-0016) are followed and not changed; none of the decisions needs a new ADR. Paths are relative to `packages/client/`.

## D1. Tokens: one source, dark values written once

### Context
Driven by FR1, FR2 and M4. `src/styles/tokens.css` repeats every dark value twice today: in `:root[data-theme="dark"]` (Dark preference) and in `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` (System preference). `useThemePreference` removes `data-theme` for System, so the system theme is decided by CSS alone before React mounts. `src/styles/tokens.test.ts` reads both blocks.

### Decision
- `tokens.css` declares the light values in `:root` and the dark values once, in `:root[data-theme="dark"]`. A new local PostCSS plugin, `scripts/themeCss/copyDarkThemeToSystemTheme.mjs` (with a `.d.mts` like `scripts/legacyCss/expandInsetShorthand.d.mts`), finds that rule at build time and appends `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` with a clone of its declarations. It is registered in `postcss.config.js` next to `expandInsetShorthand()`. The source keeps one value per colour; the built CSS keeps the CSS-only system theme, so nothing flashes before React mounts.
- Token names follow the `:root` blocks of the screens: `--color-background`, `--color-surface`, `--color-card-border`, `--color-control-border`, `--color-control-border-inactive`, `--color-foreground`, `--color-muted-foreground`, `--color-accent`, `--color-accent-foreground`, `--color-handle-border`, `--handle-border-width` (2px / 3px), `--lift-shadow` (`0 8px 24px rgba(24,24,27,.18)` light, `0 8px 24px rgba(0,0,0,.5)` dark) and `--color-hour-cell-foreground` (digits on morning, day and evening cells: `#1c1c20` light as the screens draw it, `#0b1628` dark, §3). Night digits already use `text-foreground` (`DAY_COLOUR_FOREGROUND_CLASS_NAMES`), which is `#1c1c20` light and `#f7f8fc` dark, the §3 value. Values: `spec.md` §2 and §3.
- `--color-border` is removed. Every `border-border` class is replaced by `border-card-border` (cards, Grid panel and its dividers) or `border-control-border` (option groups, toggle groups, fields, location menu, dialogs, Now); `tailwind.config.ts` maps `card-border`, `control-border`, `control-border-inactive`, `handle-border` and `boxShadow.lift` to the variables.
- Tokens that `spec.md` §2 keeps (notice, danger, meeting colours, midnight shade, non-working grey, `--color-muted`) keep their current values; where a screen shows a different value (the dark midnight shade `rgba(11, 22, 40, 0.25)`, the Muted dark digits `#0f1729`), the document wins.

### Consequences
Positive: one edit per colour; no runtime cost; the system theme still needs no JavaScript. Negative: the built CSS differs from the source, so `tokens.test.ts` checks the source (one dark block) and a plugin test checks the output (both blocks, same declarations).

### Alternatives Considered
**Resolve System in JavaScript and set `data-theme` always**: one selector, but the page paints light before React mounts for a dark system. **CSS `light-dark()`**: one declaration per token, but not supported by iOS Safari 12.5 (ADR-0009). **Keep both blocks**: forbidden by §1.

## D2. Day palette: a preference applied as a root attribute

### Context
Driven by FR3, FR4, FR5, NFR-P1. Day colours reach the views as CSS variables: `DAY_COLOUR_VARIABLES` and `DAY_COLOUR_FOREGROUND_CLASS_NAMES` in `src/views/shared/dayTrackGradient.ts` map each `DayColour` to `--color-day-night` … and to a text class; `presentDayColourStops` and `presentHourCellColour` in `src/presenter/dayColours.ts` decide the colour, never the value.

### Decision
- Model (`src/preferences/`): `enum DayPalette { VIVID = "VIVID", MUTED = "MUTED" }`, `Preferences.dayPalette` (default `VIVID`), command `SET_DAY_PALETTE` in `preferencesCommands.ts` (same object when unchanged), validation in `parseStoredPreferences.ts` (an unknown value rejects the document). `DAY_PALETTE_ORDER` (Vivid, Muted) in `src/constants/preferences.ts`; `PREFERENCES_SCHEMA_VERSION` 6 → 7; migration step 6 in `createPreferencesMigrations` (`src/adapters/preferencesDocument.ts`) adds `dayPalette: VIVID`; `serializePreferencesDocument` writes it.
- Controller: `PreferencesProvider` gains `setDayPalette`; a new hook `useDayPalettePreference()` (`src/controller/useDayPalettePreference.ts`) writes `data-day-palette` (`vivid` / `muted`, from a `Record<DayPalette, string>`) on `document.documentElement` in a layout effect, exactly as `useThemePreference` does for the theme; `AppShell` calls it next to `useThemePreference()`.
- Tokens: per theme, `--color-day-vivid-{night,morning,daylight,evening}` and `--color-day-muted-…` hold the eight values. `:root` sets `--color-day-night: var(--color-day-vivid-night)` (and the three others) and `:root[data-day-palette="muted"]` points them to the muted tokens. The presenter, the colour stops, `DAY_COLOUR_VARIABLES` and `DAY_COLOUR_FOREGROUND_CLASS_NAMES` do not change.
- Plain and Working hours use `--color-accent` and `--color-day-non-working`, which the palette does not touch (FR4).

### Consequences
Positive: a palette switch re-presents nothing (NFR-P1: no formatter, no stop recomputation); the palettes swap as a set; a future user-edited colour is one more variable. Negative: the swatch must read the per-palette variables directly (D3).

### Alternatives Considered
**Pass the palette through the presenter as a new `DayColour` set**: doubles the enum and re-presents every row on a switch. **Inline colours from TypeScript constants**: puts colour values in components, forbidden by §1.

## D3. Colours group and palette swatch

### Context
Driven by FR5, UX2, NFR-A3. `SettingsOptionGroup` takes `SettingsOption { value, label, Icon?, pictogram? }`; `WorkingHoursGroup` renders `null` unless the colouring is Working hours, directly after `DayColouringGroup` in `SettingsPage`.

### Decision
- `SettingsOption` gains `swatch?: ReactNode`, shown in `OptionFace` in place of an icon (wrapped `aria-hidden`), with the name `sr-only` and as `title`, like an icon option.
- `PaletteSwatch` (`src/app/settings/PaletteSwatch.tsx`): a 24 × 24 px span with a 5 px radius, `overflow: hidden`, a 2 px outline in `--color-surface`, and four equal flex stripes whose backgrounds are `var(--color-day-<palette>-night|morning|daylight|evening)` (the class names come from a `Record<DayPalette, …>`, no colour value in the component). The swatch follows the active theme through the variables.
- `DayPaletteGroup` (`src/app/settings/DayPaletteGroup.tsx`) renders `null` unless `dayColouring === TIME_OF_DAY`, otherwise a `SettingsOptionGroup` captioned `settings.dayPaletteLabel` with `settings.dayPaletteVivid` / `settings.dayPaletteMuted`. `SettingsPage` renders `<DayColouringGroup /><DayPaletteGroup /><WorkingHoursGroup />`; at most one of the last two is non-null, so the row under the colouring group is the same slot (UX2).

## D4. Header and content column

### Context
Driven by FR6, FR12, UX4. `MainPage` uses a three-column grid with a centred title and `border-b`; `AddLocationButton` and `SettingsButton` carry `order-1 col-start-1` / `order-3 col-start-3`; the page is `max-w-screen-2xl`.

### Decision
- The page wrapper becomes `max-w-content` (a `maxWidth.content: "70rem"` key, 1120 px, in `tailwind.config.ts`), centred. The header becomes `flex items-center justify-between` with no border; the title (`text-[27px] max-[360px]:text-[23px] font-bold`, sizes as named Tailwind font sizes `header-title` / `header-title-narrow`) comes first in the DOM, then a group holding Add location then Settings, so Tab follows the visual order. The icon size (27) is a constant `HEADER_ICON_SIZE_PX` in `src/constants/`. `SettingsButton` shows Lucide `Settings`.
- The meeting header (`MEETING_HEADER_CLASS_NAMES`) and the settings page header are not changed.
- The `footer` keeps `sticky bottom-0`, takes `bg-background`, loses `border-t`, and spans the viewport width (negative margins as today) while its inner group stays centred.

## D5. Card and grid row layout

### Context
Driven by FR7–FR11, FR17, FR20–FR24. `LOCATION_ROW_VARIANT_CLASS_NAMES` (`src/views/shared/locationRowVariant.ts`) holds the classes that differ between a card and a grid row; `ZoneRowContent` renders the place column, `LocalDateTime` and `DayTrack`; `LocationRow` adds the drag handle, the menu and the notes.

### Decision
- The row header is split into two lines in every variant: line 1 = `[grab area: mark, city, offset difference (+ zone line from 768 px)]` and `[time group: (date from 768 px), time, menu button]`; line 2 (below 768 px) = `[zone line]` and `[date]`. Each line is a `flex flex-wrap` row; the place element is `flex-1 basis-0` with `min-width: min-content`, so it is never narrower than its longest word and the time group (`ml-auto`) wraps to its own line at the right when city and time do not fit (FR8). The zone line is part of the grab area in both layouts (D6).
- The one-row card layout (`md:w-64`, `md:w-44`, the track `md:basis-0 md:flex-1`) is deleted. `DayTrack` is always `basis-full` on its own line; its bar is `h-3` on every width and spans the content width (inset 0 at every width, as the screens draw it); the visible handle is a 23 px circle (`h-[23px] w-[23px]`, size constant `DAY_TRACK_HANDLE_SIZE_PX` for tests) with `bg-surface` and `border-[length:var(--handle-border-width)] border-handle-border`; the 44 × 44 handle hit area and the 44 px slider stay. Hour labels stay as built (12 px, muted, first left-aligned, last right-aligned).
- Sizes of §5, §6 and §10 become named Tailwind values in `tailwind.config.ts` (`fontSize: card-city, card-time, card-meta, grid-city, grid-time…`, `borderRadius.card: 14px`, `borderRadius.cell: 5px`, `spacing` for the paddings) with the breakpoints `max-[360px]`, `min-[411px]` and `md` (768 px). No pixel value is written in a component.
- The 12-hour day period marker: the presenter adds `localTimeParts: { digits: string; dayPeriodMarker: string }` to the row (built in `presentZoneMoment` by a new `formatLocalTimeParts` in `src/presenter/localDateTime.ts` from `formatToParts` of the same cached formatter that `formatLocalTime` uses, `dayPeriod` part type as `getDayPeriodMarkers` reads it, so no formatter is built: NFR-P1). `LocalDateTime` renders the marker in a span (`text-[14px] font-bold ml-1`). `localTimeLabel` stays the accessible text and the wall-time input's text.
- The zone line (FR9): `ZoneLine` renders a middle dot (`ZONE_LINE_SEPARATOR = "·"`, `aria-hidden`) before every part except the first, inside the part's no-wrap box; a part that starts a wrapped line hides its leading dot. The view detects line starts after layout with a `ResizeObserver` (installed by the legacy support chunk on iOS 12, as `useHourStripScroll` already relies on) comparing each part's `offsetTop` with the previous part's, and sets `data-line-start` on it; CSS hides the dot of `[data-line-start]`. Pure helper `getZoneLinePartLineStarts(offsetTops)` is unit-tested; the layout is checked in E2E.
- Grid row (§10): the panel uses `border-card-border rounded-card`, dividers `border-card-border`; row header sizes from `grid-*` font sizes; mark 20 px (constant `GRID_MARK_ICON_SIZE_PX`); hour cells `rounded-cell`, `gap-[3px]` as a named spacing, digits 15 px / 500, height 48 px from `md`, 44 px below; `hourCellLayout.ts` subtracts the gap from the equal share and uses 38 px (`HOUR_CELL_SCROLL_WIDTH_PX`) below the 32 px threshold, replacing the 36–40 px rule.

## D6. Reorder without a handle

### Context
Driven by FR15, FR16, NFR-A3, NFR-P2. `LocationList` uses dnd-kit `PointerSensor` (4 px) on Pointer Events engines, `TouchSensor` (250 ms, 5 px) without them, plus `KeyboardSensor`; `DragHandle` is the activator; `useSortableLocationRow` returns `attributes`, `listeners`, `setActivatorNodeRef`; `useReorderAnnouncements` builds the live announcements. The constants `REORDER_POINTER_ACTIVATION_DISTANCE_PX = 4`, `REORDER_TOUCH_ACTIVATION_DELAY_MS = 250`, `REORDER_TOUCH_ACTIVATION_TOLERANCE_PX = 5` exist in `src/constants/reorder.ts`.

### Decision
- Sensors on every engine: `MouseSensor` with `{ distance: REORDER_POINTER_ACTIVATION_DISTANCE_PX }` for mouse and pen, and `TouchSensor` with `{ delay: REORDER_TOUCH_ACTIVATION_DELAY_MS, tolerance: REORDER_TOUCH_ACTIVATION_TOLERANCE_PX }` for fingers, so a finger needs the hold on every engine. `KeyboardSensor` and `sortableKeyboardCoordinates` are removed.
- The grab area is the place element and the zone line element of the row header: both get `listeners` (not `attributes`, so no `role="button"`, `tabIndex` or role description), `setActivatorNodeRef` goes on the place element; the classes `cursor-grab select-none [-webkit-touch-callout:none] touch-manipulation` (`cursor-default` while locked). `DragHandle.tsx`, its test and the `locations.moveLocation`, `locations.reorderRoleDescription` and `locations.reorderInstructions` keys are deleted; `screenReaderInstructions` is dropped from the `DndContext` accessibility.
- Lift: while `isDragging`, `useSortableLocationRow` sets `scaleX`/`scaleY` to `REORDER_LIFT_SCALE = 1.02` in the transform it passes to `CSS.Transform.toString`, and adds `shadow-lift z-dragged-row`; the slide transition and the drop settle stay.
- Menu moves: `LocationMenuItem` gains `isDisabled?: boolean`; disabled items render `aria-disabled="true"`, ignore activation and are skipped by `locationMenuKeys.ts`; the menu opens on the first enabled item. `useLocationMenuItems(row, rowIndex, rowCount, …)` returns home action, `locations.moveUp`, `locations.moveDown`, `locations.remove`. `ViewLocationList` owns `onMoveByStep(id, step)`: it calls the existing `moveLocation(id, targetIndex)` and sets its polite announcement to `locations.reorderMovedOver` ({{city}}, {{position}}, {{total}}); focus returns to the row's menu button through the existing `menuButtons` refs. No new model command: `MOVE_LOCATION` already moves by target index.
- Lock in Grid: `areRowControlsLocked` passes `disabled` to `useSortable` (as today) and the default cursor to the grab area.

### Alternatives Considered
**Keep `PointerSensor` with one constraint**: a finger would start a drag after 4 px, so a swipe over the city could not scroll. **A custom sensor reading `pointerType`**: subclasses dnd-kit internals; `MouseSensor` + `TouchSensor` are its documented pair for this case.

## D7. Marks, device time location and UTC

### Context
Driven by FR10, FR18, FR19, Q1. `LOCATION_MARK_ICONS` maps `HERE` to `Navigation` and `HOME` to a custom house; `presentLocationMarks` gives a caption for `HERE` (`locations.hereMarkCaption`); `presentZoneLine({ placeText, …, isDeviceTimeMeta })` already shows "Device time" whatever the zone label says.

### Decision
- `LOCATION_MARK_ICONS`: `HERE → MapPin`, `HOME → House` (both outline, `fill="none"`); the custom house node goes. `LOCATION_MARK_ICON_SIZE_PX` becomes 23, a new `GRID_MARK_ICON_SIZE_PX = 20`. `PresentedLocationMark.caption`, `captionKey` and `locations.hereMarkCaption` are removed, and the caption span in `ZoneRowContent`.
- `presentZoneLine` gains `isUniversalTime: boolean` (set by `presentLocationRows` for a city location whose canonical zone is `UTC_ZONE_ID` and whose country code is empty): its place text is `locations.universalTime` («Всемирное время» / "Universal Time"), shown only with `ZoneLabelPart.COUNTRY`, and the zone abbreviation and UTC offset parts are dropped. Decision on Q1: `spec.md` §11 writes the UTC zone line as «Всемирное время» alone, the three UTC screens show nothing after it, and both remaining parts would only repeat the city label `UTC`; with the country hidden the row has no zone line, by the existing "no element left" rule.

## D8. Date bar

Driven by FR14. In `DateBar.tsx` Now becomes `h-11 rounded-[13px]` (named `borderRadius.now`) with `border border-control-border text-foreground bg-transparent`, `disabled:border-control-border-inactive disabled:text-muted-foreground`, the clock icon 18 px (`NOW_ICON_SIZE_PX` 16 → 18) and the label `text-base font-semibold`; the date button text `text-base font-bold text-foreground`. Its disabled semantics, focus and placement do not change.

## D9. Tests in a real browser

Driven by NFR-A1, NFR-R1, NFR-R2, FR20–FR24, M1–M3. Layout, colour, contrast, cursor, focus and axe-core checks are playwright-bdd scenarios (`*_e2e.feature`, `.claude/rules/bdd-e2e.md`); the theme-and-palette pairs are seeded through the stored preferences document (schema 7) by the existing seed helpers (`settingsE2eHelpers.ts`, `locationsSeedHelpers.ts`). Screenshot baselines under `src/test/features/__screenshots__/` are re-generated with `--update-snapshots` for the scenarios this change touches and committed. Model, presenter, controller and token logic is unit-tested (Vitest, vitest-cucumber) and mutation-tested with scoped Stryker runs of at most 5 files each.

## D10. Docs and screens

Driven by FR25. The glossary gets the terms listed in the proposal; `docs/architecture/views.md` replaces its "Visual style", Cards and Grid sketches and shared-block rows with the built redesign (the token tables of `spec.md` §2–§3 move there); the 32 screens are moved with `git mv` from `docs/design/redesign/screens/` to `docs/design/screens/`, the old screens they replace are deleted (`phone-light`, `phone-dark`, `tablet-light`, `phone-no-home`, `phone-travel`, and the Grid screens of the same name are overwritten), the three Grid screens without a redesign counterpart (`grid-tablet-meeting-light`, `grid-phone-landscape-light`, `grid-phone-landscape-meeting-light`) stay and are marked in `docs/design/README.md` as showing the layout before the redesign, and `docs/design/redesign/` is removed: this change builds every section of its `spec.md`, whose decisions now live in `views.md`.

The visual comparison of the re-approved screenshots with the design screens is a human judgement (UX1): it is handoff item H1.
