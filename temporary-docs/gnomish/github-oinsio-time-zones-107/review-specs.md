# Specs review: add-grid-hour-cells-and-hour-frame

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 40/41 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 3 |
| SUGGESTION | 1 |

## Freshness

- ✅ The Grid view is a skeleton without hour cells: `packages/client/src/views/grid/GridView.tsx` renders only `<ViewLocationList rowVariant={LocationRowVariant.GRID_ROW} />`; `openspec/specs/main-page/spec.md:204` "MUST NOT contain a day track or hour cells".
- ✅ The REMOVED requirements exist as named: `openspec/specs/main-page/spec.md:203` "Grid view skeleton" and `:273` "View contract runs for every registered view". The ADDED "Grid view rows" carries over every skeleton scenario (one-line header, theme colours, typing, empty, unreadable, offline, narrow/wide) and replaces the 1024 px screenshots.
- ✅ The MODIFIED "Select a time in every view" exists at `openspec/specs/time-selection/spec.md:590` with the Grid exclusion sentence that the delta removes; its scenario is restated unchanged.
- ✅ The pending exclusion exists where the change says: `@grid-pending-hour-cells` and its comment at `src/test/features/time_selection/time_selection_view_contract_e2e.feature:11-12`, `VIEW_CONTRACT_PENDING_TAGS` at `playwright.bdd.config.ts:48-50` used as `grepInvert` at `:80`; the docs mentions are `docs/glossary/views.md:15` and `docs/architecture/views.md:137` (tasks 1.2, 1.3 remove them).
- ✅ "Select a time" drives `sliderOf(page, city)` + `PageUp` (`time_selection_view_contract_e2e.steps.ts:13-14`, `timeSelectionE2eHelpers.ts:36` by the name "Time in {city}"), so a Grid slider with the same name passes the step unchanged (D4).
- ✅ Reused owners exist under the named paths: `getReferenceDay(state, now)` and `getTrackEndMinutes` (`model/dayTrack.ts:43,87`), `getReferenceZone` / `getEffectiveInstant` (`model/referenceMoment.ts:50,58`), `findOffsetTransitions(timeZoneId, span, marginHours)` (`model/dayPeriodWindows.ts:44`), `getDayPeriod(wallTime, schedule)` (`model/dayPeriods.ts:63`), `DAY_PERIOD_COLOR_VARIABLES` (`views/shared/dayTrackGradient.ts`), `getDayPeriodMarkers`, `getDateTimeFormatter`, `DateTimeLabelKind.LOCAL_DATE`, `TWELVE_HOUR_WRAP`, `TRACK_VALUE_MIN_MINUTES`, `MINUTES_PER_HOUR`.
- ✅ `getTrackMoveForKey` maps Arrow Right/Up → `NEXT_STEP`, Arrow Left/Down → `PREVIOUS_STEP`, Page Up/Down → hour, Home/End → day start/end (`views/shared/dayTrackKeys.ts`), matching FR12; `TrackMove` values named in task 6.2 exist (`model/dayTrack.ts:33-40`).
- ✅ Every row already has `row.dayTrack` with `valueMinutes`, `maxMinutes`, `valueText` (`presenter/dayTrack.ts:27-31`, `presentZoneMoment.ts:138`), and `ViewLocationList` already passes `useTimeSelection().moveTrack` as `onMoveTrack` (`ViewLocationList.tsx:44,94`).
- ✅ Slider name/value claims: `locations.timeSliderLabel` "Time in {{city}}" / «Время — {{city}}»; value 750 within 0–1439 with text `12:30, Sun, Mar 8` is already asserted for Cards (`time_selection_e2e.feature:71`; `TRACK_END_BEFORE_DAY_END_MINUTES = 1`).
- ✅ `LocationsContext` provides `store`, `clock`, `minuteTick` (`controller/useLocations.ts:51`, `useCalendarMonth.ts:26`); `getHourLabels` uses the key-reset module cache D1/D2 copy (`presenter/dayTrack.ts:67-82`).
- ✅ Day-period sample: boundaries 07:00 / 09:00 / 18:00 / 22:00 (`constants/dayPeriods.ts:2-5`) give Almaty columns 0–6, 22–23 night, 7–8 morning, 9–17 work, 18–21 evening; M1 columns check out (Moscow 22 at column 0, midnight at 2; Kolkata `00:30` at 0, `23:30` at 23; New York midnight at 10, `1` at 11, `3` at 12 after the 07:00Z change).
- ✅ Work-bound constants: `MAX_FORMATTERS_PER_ZONE = 3`, `MAX_TRANSITION_LOOKUPS_PER_ZONE = 2`, `startWorkCount` in `src/test/workCounters.ts`.
- ✅ Test helpers named by tasks exist: `switchableClock`, `tickSchedulers`, `src/test/resizeObserverFake.ts`, `gridViewWorld.tsx`, `themeTokens.ts` (`readThemeColours`), the steps "the screen is {int} by {int} px for the locations", "the locations interface language is Russian", `/^the list holds (.+) and home is "([^"]+)"$/`, "the locations screen matches the approved screenshot"; the jsdom setup stubs `ResizeObserver` (`src/test/setup.ts:11-16`).
- ✅ Skeleton tests assert "no slider": `ViewLocationList.test.tsx:191-193` and `main_page_grid_view_unit.steps.tsx:53-54` (D7); the four `Approved-screenshots-of-Grid-at-1024-px-*.png` exist (2 per project).
- ✅ Environment claims: `tsconfig.app.json` lib `["ES2020", "ES2022.Intl", "DOM", "DOM.Iterable"]`; `installLegacySupport` installs `ResizeObserver` (`lib/legacy/installLegacySupport.ts:12`); `postcss.config.js` runs `autoprefixer`; E2E device zone `Asia/Almaty` (`playwright.bdd.config.ts:64,111`); projects `chromium`, `mobile-chrome`, `view-contract-*`; scripts `check:bundle-size`, `check:legacy-build`, `typecheck`, `lint`, `test:bdd:gen` exist.
- ✅ `LocationRow.tsx` is 183 lines today; `LOCATION_ROW_VARIANT_CLASS_NAMES` (`views/shared/locationRowVariant.ts`) already stacks the grid row's place and date-time columns below `md`, so D5's `flex-col-reverse` only reorders the right column.
- ✅ Design values: midnight shade `rgba(24, 24, 27, 0.10)` / `rgba(15, 23, 41, 0.22)` and dark digits `#0F1729` (`docs/architecture/views.md` → Visual style → Grid); the dark design draws the offset edge as `box-shadow: #eef2fa 3px 0px 0px inset` (`docs/design/screens/grid-desktop-dark.html:2299`), i.e. the dark `--color-foreground`, matching FR6.
- ✅ Not already implemented: no `hourCells`, `hourStrip`, `useHourGrid` or `views/grid/HourStrip.tsx` exists; the archived `2026/11/2026-11-09-add-view-mode-setting-and-grid-skeleton` built only the skeleton; the other active change `add-pr-preview-deploy` touches only `app-delivery`.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ grid-view → Hour cells of the reference day; main-page → Grid view rows | ✅ 2.1, 5.1, 6.4, 7.1 |
| FR2 | ✅ | ✅ Hour cells of the reference day (23/24/25) | ✅ 2.1, 5.1 |
| FR3 | ✅ | ✅ Hour cell label | ✅ 3.1, 5.1 |
| FR4 | ✅ | ✅ Hour cell colour | ✅ 2.1, 5.1, 7.1 |
| FR5 | ✅ | ✅ Midnight marker in the hour strip | ✅ 2.1, 3.1, 5.1, 7.1 |
| FR6 | ✅ | ✅ Offset edge in the hour strip | ✅ 2.1, 5.1, 7.1 |
| FR7 | ✅ | ✅ main-page → Grid view rows, "Row notes after the hour strip" | ✅ 6.2, 7.4 |
| FR8 | ✅ | ✅ Hour frame | ✅ 4.1, 5.2, 7.2 |
| FR9 | ✅ | ✅ Hour frame (live, pinned, Now) | ✅ 4.1, 5.2 |
| FR10 | ✅ | ✅ Hour frame lies behind texts | ✅ 7.2 (see R1 for the design it tests) |
| FR11 | ✅ | ✅ Hour cells take no pointer selection yet | ✅ 5.2, 6.2 |
| FR12 | ✅ | ✅ Time selection on the hour strip; time-selection → Select a time in every view | ✅ 6.2, 7.2 |
| FR13 | ✅ | ✅ main-page → View contract runs every scenario…; time-selection MODIFIED | ✅ 8.1, 9.3 |
| NFR-P1 | ✅ | ✅ Hour strips are fast | ✅ 5.3 |
| NFR-A1 | ✅ | ✅ Time selection on the hour strip (Tab stop, focus ring, axe) | ✅ 7.2 |
| NFR-A2 | ✅ | ✅ Time selection on the hour strip; View contract runs every scenario… | ✅ 7.2, 8.1 |
| NFR-R1 | ✅ | ✅ Hour strip width, "All hours fit" | ✅ 6.1, 7.3 |
| NFR-R2 | ✅ | ✅ Hour strip width, portrait and scroll-into-view scenarios | ✅ 6.1, 6.3, 7.3 |
| NFR-R3 | ✅ | ✅ Grid view rows, "Grid row header in two lines on a phone" | ✅ 6.3, 7.4 |
| NFR-R4 | ✅ | ✅ Grid view rows, "Approved Grid screenshots" (8 examples) | ✅ 7.4 (+ H1 comparison with the design) |
| UX1 | ✅ | ✅ Grid view rows (implements UX1, screenshots) | ✅ 7.1, 7.4 (+ H1) |
| UX2 | ✅ | ❌ substance in "Frame crosses every row in the accent colour", but no spec requirement links UX2 (R4) | ✅ 7.1, 7.2 tagged `@UX2` |
| UX3 | ✅ | ✅ Hour strip width (implements UX3) | ✅ 7.3 |
| M1 | ✅ | n/a | ✅ 2.1, 5.1 |
| M2 | ✅ | n/a | ✅ 2.1, 5.1 |
| M3 | ✅ | n/a | ✅ 4.1, 5.2 |
| M4 | ✅ | n/a | ✅ 7.3 |
| M5 | ✅ | n/a | ✅ 8.1, 9.3 |
| M6 | ✅ | n/a | ✅ 7.2 |
| M7 | ✅ | n/a | ✅ 7.4 |
| M8 | ✅ | n/a | ✅ 5.3 |
| G1 | ✅ | n/a met by FR1–FR7, M1 | n/a |
| G2 | ✅ | n/a met by FR8–FR10, M3 | n/a |
| G3 | ✅ | n/a met by FR13, M5 | n/a |
| G4 | ✅ | n/a met by FR1, FR11 and D1 (cells keep `start` instants) | n/a |
| NG1 | ✅ | n/a — nothing builds a meeting range, frame, handles or bar | n/a |
| NG2 | ✅ | n/a — no day shift mark is built | n/a |
| NG3 | ✅ | n/a — no colouring setting | n/a |
| NG4 | ✅ | n/a — Cards untouched (the `hourGrid` slot is optional, D5) | n/a |
| NG5 | ✅ | n/a — FR11 and D4 attach no pointer handler | n/a |
| NG6 | ✅ | n/a — `DAY_PERIOD_SCHEDULE` stays the constants | n/a |

## Consistency

- `design.md:131,134` (D5) wraps the row header and the notes of a grid row in a `sticky left-0` box and gives only the texts inside it `relative z-[2]`, with the frame `<li>` at `z-[1]`; a `position: sticky` box establishes its own stacking context, so the texts' `z-[2]` only orders them inside that box, and the box itself paints below the frame's `z-[1]`. That contradicts `proposal.md:79` FR10 / `specs/grid-view/spec.md:149` ("the frame … never covers them"). See R1.
- `design.md:134` (D5 Frame) makes the frame the last `<li>` child of the `<ul>` with `rounded-lg border-2 border-accent`, while `design.md:131` (D5 Panel) keeps the `<ul>`'s "border and dividers unchanged", i.e. `divide-y divide-border` (`packages/client/src/views/shared/locationRowVariant.ts:47`); Tailwind's divide selectors restyle that `<li>` to a 1 px top border in the border colour, against `proposal.md:77` FR8 ("An hour frame in the accent colour"), `proposal.md:104` UX1 and `specs/grid-view/spec.md:108`. See R2.

## Findings

### R1 — WARNING — D5's stacking puts the hour frame over the header texts and notes
- Location: `openspec/changes/add-grid-hour-cells-and-hour-frame/design.md:131` and `:134`
- Rule: `—`
- Problem: D5 makes the row header block and the notes of every grid row a `sticky left-0` box (`design.md:131`) and gives the city, difference, zone line, date, time button and notes `relative z-[2]` inside it, while the frame is an `absolute … z-[1]` `<li>` child of the `<ul>` (`design.md:134`). A `position: sticky` element always forms a stacking context, so the `z-[2]` of the texts is local to their sticky box; the sticky box itself has `z-index: auto` and is painted at level 0 of the `<ul>`'s parent context, below the frame at `z-[1]`. The frame therefore draws over the header texts and the clock change note, the opposite of FR10 (`proposal.md:79`: "the frame is interrupted behind them and never covers them") and of `docs/architecture/views.md` → Layers ("hour cells, then the frame, then the row header texts and row notes").
- Impact: implemented as written, the "Notes and header texts cover the frame" E2E (task 7.2, `elementFromPoint`) fails and the frame visibly crosses the New York note and header texts in every screenshot baseline; the implementer has to rediscover the layering rule during 7.2, and baselines written before that (7.4) would bake the wrong layering in.
- Fix: in D5 "Frame", state that the z-order is set on the sticky boxes themselves: the sticky header box and the sticky notes box of a `GRID_ROW` get `z-[2]` only — no `relative`, which would replace their `sticky` position, and none is needed because a sticky box is already positioned, so `z-index` applies — with a transparent background, and the texts inside keep their `bg-surface` / `bg-notice` so the frame shows only between them; the frame stays `z-[1]`. Mirror it in task 6.3 ("`z-[2]` on the sticky header and notes wrappers for `GRID_ROW` via `LOCATION_ROW_VARIANT_CLASS_NAMES`" instead of "`z-[2]` texts").
- Fix risk: every row's wrapper is then a `z-[2]` context, so a dropdown inside one row's wrapper can still be covered by the next row's wrapper (later in DOM, same level) — that is the separate problem R3 addresses; no other artifact or test depends on the texts' own z-index.
- Status: fixed
- Resolution: design.md D5 "Frame" now sets the z-order on the transparent sticky header and notes boxes themselves (`z-[2]`, no `relative`), with the texts keeping `bg-surface` / `bg-notice`, and explains why (a sticky box forms its own stacking context); task 6.3 names `z-[2]` on the sticky wrappers instead of on the texts.

### R2 — WARNING — The list's dividers restyle the hour frame's border
- Location: `openspec/changes/add-grid-hour-cells-and-hour-frame/design.md:134` and `:131`
- Rule: `—`
- Problem: D5 "Frame" (`design.md:134`) makes `HourFrame` "the last child of the `<ul>`, an `<li aria-hidden="true">` with … `rounded-lg border-2 border-accent`", while D5 "Panel" (`design.md:131`) keeps the `<ul>`'s "border and dividers unchanged". For `GRID_ROW` that `<ul>` carries `rounded-md border border-border divide-y divide-border` (`packages/client/src/views/shared/locationRowVariant.ts:47`). On Tailwind `^3.4.17` (`packages/client/package.json:69`), `divide-y` compiles to `.divide-y > :not([hidden]) ~ :not([hidden]) { border-top-width: 1px; border-bottom-width: 0 }` and `divide-border` sets `border-color` through the same selector. That selector (specificity 0,3,0) beats `.border-2` and `.border-accent` (0,1,0 each), and the frame `<li>` follows the rows, so it matches: the frame gets a 1 px top border, no bottom border and 2 px sides, all in the `--color-border` colour.
- Impact: implemented as written, the frame is not an accent-coloured box but a grey outline open at the bottom. That contradicts FR8 (`proposal.md:77`: "An hour frame in the accent colour") and UX1 (`proposal.md:104`). The task 7.2 E2E "Frame crosses every row in the accent colour" (`border-color` equals `--color-accent`) fails, and the implementer has to rediscover the cause; baselines written in 7.4 would bake the wrong frame in if 7.2 is worked around.
- Fix: in D5 "Panel", replace "border and dividers unchanged" with this rule: for `GRID_ROW` the dividers move from the `<ul>` to the row `<li>`s. `LOCATION_ROW_VARIANT_CLASS_NAMES[GRID_ROW].list` becomes `rounded-md border border-border` (no `divide-y divide-border`), and `.row` adds `border-t border-border first:border-t-0`, so the frame `<li>`, which is not a row, gets no divider style. Mirror it in task 6.3 ("dividers on the row `<li>`s instead of `divide-y` on the `<ul>` for `GRID_ROW`") and update `src/views/shared/ViewLocationList.test.tsx:172-179` ("should draw the rows in one panel with dividers") to assert `border border-border` on the list and `border-t border-border first:border-t-0` on every row.
- Fix risk: the existing unit test at `ViewLocationList.test.tsx:172-179` asserts `divide-y` / `divide-border` on the list and must change in the same task. The test at `:182-189` (`not.toHaveClass("border")` on each row) still passes, since `border-t` is a different class. With the frame as the last child, the last row no longer matches `last:rounded-b-md` (`locationRowVariant.ts:48`), but the `<ul>`'s `overflow-x-auto` already clips its children to its rounded corners, so nothing visible changes. The divider pixels stay the same, and Cards (`CARD` variant) is untouched.
- Status: fixed
- Resolution: design.md D5 "Panel" moves the GRID_ROW dividers from the `<ul>` (`rounded-md border border-border`, no `divide-y divide-border`) to the rows (`border-t border-border first:border-t-0`) so the frame `<li>` keeps `border-2 border-accent`; tasks 6.2 (update "should draw the rows in one panel with dividers" in ViewLocationList.test.tsx) and 6.3 (variant classes) mirror it.

### R3 — WARNING — The scrolling Grid panel clips the location menu
- Location: `openspec/changes/add-grid-hour-cells-and-hour-frame/design.md:131`
- Rule: `—`
- Problem: D5 makes the grid `<ul>` `relative overflow-x-auto overscroll-x-contain` and moves the location menu into a per-row sticky box. The location menu's dropdown is an `absolute right-0 top-full z-20` element inside a `relative inline-flex` wrapper in the row (`packages/client/src/views/shared/LocationMenu.tsx:123,152`), not a portal. With `overflow-x: auto`, the `<ul>`'s `overflow-y` computes to `auto` as well, so the dropdown of the last row (which opens below the panel's bottom edge) is clipped and only reachable through an inner vertical scrollbar of the panel, on every screen width, not only on phones. In addition each row's sticky box is its own stacking context, so a dropdown opened in row N is painted under row N+1's sticky header. Neither D5 nor any task mentions the menu.
- Impact: Grid's existing ability to remove a location and set/clear home through the row menu (`openspec/specs/main-page/spec.md:204`, kept in the ADDED "Grid view rows") degrades undeclared: the menu of the bottom rows is cut off and the menu of other rows is partly hidden by the next row's header. Playwright auto-scrolls inside the panel before clicking, so the existing view-contract "remove a location" scenarios are likely to stay green and the regression ships.
- Fix: add to D5 how the open menu escapes the panel, and test it: for `GRID_ROW`, `LocationMenu` positions its open dropdown with `position: fixed` from the button's `getBoundingClientRect()` (closing it on panel scroll), and the row's sticky header box gets a higher z-index while its menu is open (e.g. `has-[[aria-expanded=true]]:z-[3]` through `LOCATION_ROW_VARIANT_CLASS_NAMES`). Add to task 6.3 the change in `LocationMenu.tsx` and a unit test of the variant class, and to task 7.4 an E2E scenario in `main_page_grid_view_e2e.feature` "The location menu of the last grid row is fully visible" (1440 × 900, four locations: the open menu's box lies inside the viewport and `document.elementFromPoint` at its last item's centre returns that item), tagged `@add-grid-hour-cells-and-hour-frame @FR1`.
- Fix risk: touches a shared block used by Cards; gating it on the row variant keeps Cards unchanged, but `LocationMenu.test.tsx` / `LocationMenu.legacy.test.tsx` need a grid-variant case, and fixed positioning must be checked on the legacy Safari 12 build (`check:legacy-build`); `:has()` does not exist on iOS Safari 12 (ADR-0009), so there the raised z-index should come from a `data-menu-open` attribute on the row rather than `has-[…]`. `LocationMenu.tsx` must stay under 200 lines.
- Status: fixed
- Resolution: confirmed (`LocationMenu.tsx:152` absolute dropdown; the main-page "Grid view rows" requirement keeps remove/set home in Grid). Closed my own way: specs/main-page/spec.md "Grid view rows" now requires an open grid-row menu to be whole and above other rows, with scenario outline "The location menu of a grid row is fully visible" (Almaty and New York at 1440x900, New York at 390x844); design.md D5 "Location menu over the panel" uses `position: fixed` from the trigger rect via `views/shared/useFixedMenuPosition.ts` behind an `isMenuFixedToViewport` variant flag (Cards unchanged) and `focus-within:z-[3]` on the sticky header (not `:has()`, which iOS Safari 12 lacks, ADR-0009); tasks 6.2/6.3 (LocationMenu.test.tsx and ViewLocationList.test.tsx cases, hook), 7.4 (E2E, `@FR1`) and 9.1 (Stryker on the hook and LocationMenu.tsx).

### R4 — SUGGESTION — UX2 is not linked from any delta-spec requirement
- Location: `openspec/changes/add-grid-hour-cells-and-hour-frame/specs/grid-view/spec.md:108`
- Rule: `.claude/rules/traceability.md`
- Problem: UX2 ("the frame reads as one column … not drawn per row, runs through the dividers") is tested by the scenario "Frame crosses every row in the accent colour" (`spec.md:137-146`) and tagged `@UX2` in tasks 7.1/7.2, but the "Hour frame" requirement's comment reads `implements FR8, FR9` only, and no other requirement names UX2.
- Impact: the proposal → spec link for UX2 is missing, so a traceability grep over the specs finds no implementing requirement for UX2 after archive.
- Fix: change the comment on `specs/grid-view/spec.md:108` to `<!-- implements FR8, FR9, UX2 of add-grid-hour-cells-and-hour-frame -->`.
- Fix risk: none.
- Status: fixed
- Resolution: specs/grid-view/spec.md "Hour frame" requirement comment now reads `implements FR8, FR9, UX2 of add-grid-hour-cells-and-hour-frame`.

## Verdict

Needs revision — no CRITICAL finding; WARNINGs R1, R2 and R3 block: all three come from D5's layout decision, R1 and R2 would otherwise surface only as failing E2E in 7.2 (frame layering, frame colour), and R3 not at all. R4 is optional polish.
