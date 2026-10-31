# Design: Fix location card and header layout

## Context

Driven by FR1–FR6, NFR-A1, NFR-A2, NFR-R1, NFR-R2 and UX1–UX4 of `proposal.md`. Every owner below was opened on `main` under `packages/client/src/`.

- **Card**: `views/shared/LocationRow.tsx` (185 lines) renders the `<li>` card, `flex flex-wrap items-center gap-x-3 gap-y-2 … bg-surface`, with the `DragHandle`, then `ZoneRowContent`, then the `LocationMenu` button.
- **Card content**: `views/shared/ZoneRowContent.tsx` (119 lines) renders the place column (`md:w-64`) with `LocalDateTime`, then `{wallTimeHint !== undefined && <WallTimeHint text={wallTimeHint} />}`, then `DayTrack`. `LocationRow` is its only user.
- **Hint**: `views/shared/WallTimeHint.tsx` is a `<p role="status">` with `flex w-full …`. Being `w-full` in the wrapping flex row and placed before the track, it forces a line break: from 768 px the track and the menu fall onto a line under the hint (approved screenshot `wall-time-hint` at 1024 px).
- **Day track**: `views/shared/DayTrack.tsx`. The wrapper is `order-last … basis-full … md:order-none md:basis-0 md:flex-1`. The visible handle is `<span class="h-7 w-7 rounded-full border-2 border-foreground bg-surface …">`. Hour labels are `<span class="absolute top-0 …">` placed by `left: <fraction>%`; the last one has `-translate-x-full`. An absolutely positioned span at `left: 100%` has no room left in its container, so its shrink-to-fit width wraps at the space of `7 PM`.
- **Time column**: `views/shared/LocalDateTime.tsx` is `<span class="flex shrink-0 flex-col items-end md:items-start">` with no width, so it is as wide as its text. The open field (`WallTimeInput`) is `w-24 md:w-36`.
- **Tokens**: `styles/tokens.css` sets `--color-surface` to `#ffffff` (light) and `#16213a` (dark, both for `[data-theme="dark"]` and the system dark media query) and `--color-background` to `#0f1729` in dark. `tailwind.config.ts` maps `surface` to `var(--color-surface)`.
- **Header**: `app/MainPage.tsx`'s `<header>` is `grid grid-cols-[auto_1fr_auto] … md:flex md:gap-4`; the `<h1>` is `order-2 col-start-2 text-center … md:order-1 md:mr-auto md:text-left`. `views/shared/AddLocationButton.tsx` is `order-1 col-start-1 justify-self-start md:order-2 … md:border-border md:bg-surface` with `<span className="hidden md:inline">{t("locations.addShort")}</span>`. `app/SettingsButton.tsx` is `order-3 col-start-3 justify-self-end`. `locations.addShort` exists in `locales/en.json` ("Add") and `locales/ru.json` ("Добавить") and is used only by `AddLocationButton`. The page container is `mx-auto … max-w-screen-2xl px-4`, symmetric around the page centre.
- **Tests**: `time_selection/steps/time_selection_labels_e2e.steps.ts` checks the handle against the `--color-surface` token (`readTokenStyle`), not against the card. `time_selection/steps/time_selection_wall_time_input_e2e.steps.ts` (293 lines) has the step "the hint sits below the place column and above the day track". `main_page/steps/main_page_header_e2e.steps.ts` has the header order, "shows no visible text", "shows the visible text" and "is directly before" steps. `locations/steps/locationsStates.ts` (191 lines) builds the screenshot states; `settings/steps/settingsE2eHelpers.ts` exports `seedPreferences`, `THEME_VALUES` and `HOUR_FORMAT_VALUES`. `views/shared/AddLocationButton.test.tsx` expects the short label.

Binding decisions: ADR-0002 and ADR-0005 (views render presenter output; `views/shared/` blocks are reused, not duplicated), ADR-0001 (layout, colour and focus checks in playwright-bdd E2E), ADR-0008 (no timing assertions). Nothing here touches the model, the presenter, the controller, storage or the clock, so ADR-0003, ADR-0004, ADR-0007, ADR-0009 and ADR-0010 are respected by not being touched. No global decision is needed, so no ADR.

## Goals / Non-Goals

**Goals:** fix the six defects inside their current owners in `views/shared/` and `app/`, with Tailwind classes and existing tokens only.

**Non-Goals:** a new component, a new token, a presenter or model change, or a change of the settings page header.

## Decision

### D1. The hint is rendered last in the card (FR1, NFR-A2, UX1)

`ZoneRowContent` drops its `wallTimeHint` prop and no longer renders the hint. `LocationRow` renders `{row.wallTimeHint !== undefined && <WallTimeHint text={row.wallTimeHint} />}` after the `LocationMenu`, as the card's last child. `WallTimeHint` adds `order-last` to its classes: below 768 px the day track wrapper is `order-last` too, and with equal `order` values flex keeps the DOM order, so the hint lands after the track; from 768 px the track is `md:order-none` and the hint, still `w-full`, wraps onto its own last line. The city, time, track and menu line is then the same with and without the hint. The `<p role="status">` and its text stay as they are, so nothing new is announced.

### D2. The handle's fill is checked against the card (FR2, UX4)

The visible handle and the card already take the same token (`bg-surface`), and the approved Chromium `device-time` dark screenshot shows both at `#16213a` (proposal Q1). The fix pins the relation that matters to the user, the handle against the card it stands on, instead of the handle against a token: the E2E step compares the computed `background-color` of the visible handle with the computed `background-color` of its card (`listRow`), for the system dark theme (`emulateMedia`) and for the Dark preference with a light system (`seedPreferences` with `THEME_VALUES.Dark`), and checks that in dark the colour differs from the `<body>`'s page background. If the step fails, the handle takes its fill from the card's token in `DayTrack.tsx` (the only place that styles it); no new token is added.

### D3. One header grid on every width (FR3, FR4, UX2)

The `<header>` becomes `grid grid-cols-[1fr_auto_1fr] items-center gap-2` on every width, without the `md:flex` overrides. The `<h1>` is `col-start-2 text-center` without `md:order-1 md:mr-auto md:text-left`. `AddLocationButton` is `col-start-1 justify-self-start` without `md:order-2 md:border-border md:bg-surface`, and the `locations.addShort` span is removed together with the key in both locale files. `SettingsButton` keeps `col-start-3 justify-self-end`. With two equal `1fr` side columns the middle column is centred in the header whatever the button widths, and the header is centred on the page by the symmetric container, so the title's centre is the page centre. Without the Add location button (unreadable list) the grid keeps its three columns, so the title stays centred. DOM order (Add location, then Settings, after the title) keeps the Tab order.

### D4. A fixed time column from 768 px (FR5, UX3)

`LocalDateTime`'s outer span gets `md:w-44` (176 px), and the time button gets `whitespace-nowrap`. 176 px holds the widest 12-hour time (`12:59 PM`, `text-4xl` bold with tabular figures) and the open field (`md:w-36`). With the place column (`md:w-64`), the time column, the drag handle and the menu button all fixed from 768 px, the remaining width given to the `md:flex-1 md:basis-0` track is the same on every card. If the E2E check of one-line times shows that 176 px clips a time, the implementer takes the next Tailwind width that fits and records it in the task; the check is the source of truth. The 24-hour format uses the same width, so the tracks there get shorter by the difference; the 1024 px screenshots are re-approved (NFR-R2). Below 768 px nothing changes.

### D5. Hour labels never wrap (FR6)

Each hour label span gets `whitespace-nowrap`. The alignment classes (`-translate-x-1/2`, `-translate-x-full`) stay, so the first label still starts at the track's left edge and the last still ends at its right edge.

### D6. Where the tests go

Layout, colour, focus order and axe-core need a real browser (`bdd-unit.md`: "Responsive layout … E2E"; `bdd-e2e.md`), so FR1–FR6, NFR-A1, NFR-R1 and UX1–UX4 are checked in playwright-bdd. The new feature `time_selection/time_selection_card_layout_e2e.feature` gets its own steps file, because `time_selection_wall_time_input_e2e.steps.ts` is near the 300-line cap. The DOM order of the hint (last child of the card, after the menu button) and the removed short label are checked in Vitest component tests, which jsdom can do. The old step "the hint sits below the place column and above the day track" is replaced by "the hint is the bottom line of the card of {string}"; the token-based handle step is replaced by the card-based one; the header steps "shows the visible text" and "is directly before" lose their last scenarios and are removed with their constant.

## Consequences

Positive:

- The hint no longer reshapes its card; the card keeps one line layout from 768 px.
- One header pattern on every width, with less responsive code.
- Tracks line up across cards in both hour formats, and the 12-hour labels read like the 24-hour ones.
- The handle-to-card fill is guarded in both dark-theme sources.

Negative:

- In the 24-hour format the time column is wider than its text, so each track is shorter from 768 px.
- Every 1024 px screenshot changes and must be re-approved.
- D2 changes no production code unless the check fails; the owner's report is not reproduced from the repository (proposal Q1).

## Alternatives Considered

**Keep the hint in `ZoneRowContent` with `order-last`**: below 768 px the track is also `order-last` and comes later in the DOM, so the hint would stay above the track. Rejected.

**A time column width that depends on the hour format**: keeps the 24-hour tracks as long as now, but the view would need the hour format, which only the presenter applies (ADR-0002). Rejected for this change.

**A CSS grid across all cards (subgrid) for equal columns**: aligns columns exactly, but rewrites the card layout and the reorder transforms. Rejected as out of scope.

**`grid-cols-[auto_1fr_auto]` kept for the header**: centres the title between the buttons, not on the page, when the two buttons differ in width. Rejected.
