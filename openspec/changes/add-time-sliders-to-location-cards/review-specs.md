# Specs review: add-time-sliders-to-location-cards

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 44/44 |
| Contradictions | 1 |
| CRITICAL | 0 |
| WARNING | 3 |
| SUGGESTION | 1 |

## Freshness

- ✅ `model/locations.ts` is 153 lines; `LocationCommandType` has exactly `ADD_LOCATION`, `REMOVE_LOCATION`, `REPLACE_LOCATIONS`, `MOVE_LOCATION`, `SET_DEVICE_TIME_ZONE`, `SET_DATE`, `SHIFT_DATE`, `RESET_TO_NOW` (`packages/client/src/model/locations.ts:38-47`); `LocationErrorCode` ends with `INVALID_DATE`, `DATE_OUT_OF_RANGE` (`:49-56`); no `SELECT_INSTANT` / `INVALID_INSTANT` anywhere in `src/` (design.md:7).
- ✅ `ReferenceMoment` is `{ mode: LIVE }` or `{ mode: PINNED; instant; wallClockStatus; requestedWallTime }`, and `getReferenceZone` returns `deviceTimeZoneId` (`model/referenceMoment.ts:16-34`); `reduceReferenceMoment.ts` is 101 lines and returns the same state when nothing changes (`:42`, `:91`) (design.md:8).
- ✅ `resolveWallClock` and `WallClockStatus` `UNIQUE`/`GAP`/`AMBIGUOUS` exist (`model/wallClock.ts:4-8`, `:25`) (design.md:9).
- ✅ `createStore` notifies only when `outcome.state !== currentState` (`model/store.ts:32`) (design.md:10).
- ✅ List commands go through `dispatchAndSchedule` (`controller/LocationsProvider.tsx:110-116`); `useReferenceMoment` dispatches straight to the store and shows the gap note only while `wallClockStatus === GAP` (`controller/useReferenceMoment.ts:30-37`, `:73-77`) (design.md:11).
- ✅ `useLocations.ts` is 47 lines and presents rows in a `useMemo` depending on `minuteTick` with `getEffectiveInstant(state, clock.instant())` (`controller/useLocations.ts:35-45`) (design.md:12).
- ✅ `presentLocationRows.ts` is 77 lines; `LocationRow` has exactly the eight listed fields (`presenter/presentLocationRows.ts:14-28`); `formatLocalTime`/`formatLocalDate` live in `presenter/localDateTime.ts` (design.md:13).
- ✅ `LocationRow.tsx` is 129 lines; place column has `md:w-64` (`views/shared/LocationRow.tsx:89`); dnd-kit `listeners` are only on `DragHandle` (`:81-87`, `DragHandle.tsx:28`); `LocationList` uses `PointerSensor` with `REORDER_POINTER_ACTIVATION_DISTANCE_PX` and `KeyboardSensor` (`LocationList.tsx:47-53`); `CardsView` reads `useLocations()` and passes rows to `LocationList` (`views/cards/CardsView.tsx:18-55`) (design.md:14).
- ✅ `--color-day-night|morning|working|evening` defined for light and dark (`styles/tokens.css:14-17`, `:33-36`); mapped to `day.*` in `tailwind.config.ts:29-33` (design.md:15).
- ✅ `KeyboardKey` already has the eight arrow/Home/End/Page keys (`constants/keyboard.ts`); `MINUTES_PER_HOUR` exported from `constants/utcOffset.ts:3` (design.md:16).
- ✅ `fakeClock(isoTimestamp, timeZone)` in `lib/temporal.ts:30`; `temporal-polyfill` 0.3.2 in `pnpm-lock.yaml:3612`; `tsconfig.app.json` `target` `ES2020`, `lib` `ES2020, ES2022.Intl, DOM, DOM.Iterable` (design.md:17).
- ✅ E2E device zone `Asia/Almaty` (`playwright.bdd.config.ts:39`, `:80`); projects `chromium`, `mobile-chrome` and `view-contract-<id>` (`:51`, `:88-95`); step "the current time is {string}" in `locations_local_time_e2e.steps.ts:43` (design.md:18).
- ✅ Steps reused by task 7.1/7.2 exist: "the screen is {int} px wide for the locations" (`locations_layout_e2e.steps.ts:14`), "the user opens the locations app" (`locations_ui_e2e.steps.ts:22`), "the locations screen uses the (light|dark) theme" (`locations_view_a11y_e2e.steps.ts:17`), "the stored locations are …" (`locations_view_contract_e2e.steps.ts:21`), "the user returns to now with the bar" (`date_selection_view_contract_e2e.steps.ts:19`), "the view under contract is shown" (`view_contract/steps/view_contract_e2e.steps.ts:8`); `test` fixture in `locations_ui_e2e.fixtures.ts:117`.
- ✅ Test helpers named in tasks.md:6 exist: `createSwitchableClock` (`test/switchableClock.ts:9`), `createManualTickScheduler` (`test/tickSchedulers.ts:4`), `createManualWriteScheduler` with `lastDelayMs` (`test/writeSchedulers.ts:12-23`); `addCityInAnotherTab` (`date_selection/steps/dateSelectionWorld.tsx:133`); `performance.now()` timing in `referenceMomentRowsWorld.ts:91-106`; `locales/locales.test.ts` and `test/setup.ts` loading `localeResources` exist.
- ✅ Screenshot states with rows are exactly "list", "pinned", "calendar" (`locations/steps/locationsStates.ts:56-110`; "suggestions" and "IST results" seed no list); baselines exist under `test/features/__screenshots__/{chromium,mobile-chrome}/`; `LocationsState` enum in `locationsStates.ts:27-40` has no `TIME_SELECTED` yet.
- ✅ `date_selection_wall_clock.feature` and its steps file exist (`test/features/date_selection/`), as task 6.3 assumes.
- ✅ The MODIFIED "Wall-clock resolution on the new date" restates `openspec/specs/date-selection/spec.md:63-64` exactly, changing only the note-ending sentence; its other scenarios match `:66-91`.
- ✅ Nothing of the change is implemented: no `SELECT_INSTANT`, `dayTrack`, `DayPeriod` or `role="slider"` in `src/`; the archived `select-date-with-calendar-and-now` lists the slider as its NG1 (`proposal.md:44`).
- ✅ ADR-0007 "the day shown on every slider track … from its local midnight" (`docs/adr/0007-*.md`), `views.md` "Day-period colors" (1 h / 15 min blends) and the token colours in `views.md` "Visual style" match proposal FR6/NFR-R2.
- ✅ Spec numbers recomputed with IANA rules: M2 day `2026-03-07T19:00Z`–`2026-03-08T19:00Z` (Almaty UTC+5), fraction 0.520833, 0.75 → `13:00Z` (NY EDT 09:00); M3 eight moves; M4 1380/1500 min and `16:30Z`; M5 sixteen stops; Apia stops (transition `2011-12-30T10:00Z`, night on both sides); M6 labels including NY `03` at the `07:00Z` transition.
- ✅ The time selection does not write storage today's way: `flushWrite` is scheduled only from `dispatchAndSchedule` (`LocationsProvider.tsx:105-116`); `REPLACE_LOCATIONS` from another tab spreads the state, so the reference moment survives (`model/locations.ts:135-136`).
- ✅ No Storybook exists in `packages/client` (no `.storybook`, no `*.stories.*`), so the change omitting stories matches the project.

## Coverage

| Requirement | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ time-selection "Day track spans the reference day" | ✅ 2.2, 3.2, 4.1, 5.3, 5.4, 6.2 |
| FR2 | ✅ | ✅ "Handle position" | ✅ 2.2, 4.1, 6.2 |
| FR3 | ✅ | ✅ "Select a time on a track", "Select a time in every view" | ✅ 2.1, 2.2, 4.2, 6.1, 7.1, 7.2 |
| FR4 | ✅ | ✅ "Move the handle with the keyboard" | ✅ 2.2, 4.2, 5.2, 6.1, 7.1 |
| FR5 | ✅ | ✅ "Time selection works with the date bar", date-selection MODIFIED | ✅ 2.1, 4.2, 6.1, 6.3, 7.2 |
| FR6 | ✅ | ✅ "Day-period colours" | ✅ 2.3, 2.4, 5.1, 6.2, 7.1 |
| FR7 | ✅ | ✅ "Local hour labels" | ✅ 3.1, 5.3, 6.2, 7.1 (placement of one scenario unclear, R3) |
| FR8 | ✅ | ✅ "Select a time on a track" errors, "Time selection is never stored" | ✅ 2.1, 4.2, 6.1 |
| FR9 | ✅ | ✅ "Track strings are localized" | ✅ 1.2, 3.1, 6.2, 7.1 |
| NFR-P1 | ✅ | ✅ "Time selection is fast" | ✅ 6.1 |
| NFR-P2 | ✅ | ✅ "Time selection is fast" | ✅ 2.4, 6.2 |
| NFR-A1 | ✅ | ✅ "Accessible day tracks" | ✅ 7.1 |
| NFR-A2 | ✅ | ✅ "Accessible day tracks" | ✅ 7.1 |
| NFR-A3 | ✅ | ✅ "Accessible day tracks" | ✅ 3.1, 7.1 |
| NFR-R1 | ✅ | ✅ "Day track layout" | ✅ 7.1 |
| NFR-R2 | ✅ | ✅ "Day track layout" | ✅ 7.1 |
| NFR-R3 | ✅ | ✅ "Day track layout" screenshots | ✅ 7.3, 7.4 |
| UX1 | ✅ | ✅ "Day track layout" | ✅ 7.1 |
| UX2 | ✅ | ✅ "Day track layout" | ✅ 7.1 |
| UX3 | ✅ | ✅ "Day track layout" | ✅ 7.1 |
| G1 | ✅ | n/a — met by FR3, FR4 | n/a — met by M2, M3 |
| G2 | ✅ | n/a — met by FR3 | n/a — met by M2 |
| G3 | ✅ | n/a — met by FR6 | n/a — met by M5 |
| M1 | ✅ | n/a | ✅ 8.1 |
| M2 | ✅ | ✅ | ✅ 2.2, 6.1 |
| M3 | ✅ | ✅ | ✅ 2.2, 6.1 |
| M4 | ✅ | ✅ | ✅ 2.1, 2.2, 4.2, 6.3 |
| M5 | ✅ | ✅ | ✅ 2.4, 6.2 |
| M6 | ✅ | ✅ | ✅ 3.1, 6.2 |
| M7 | ✅ | ✅ | ✅ 4.2, 6.1 |
| M8 | ✅ | n/a | ✅ 2.5, 3.3, 4.3, 5.5 |
| M9 | ✅ | ✅ | ✅ 7.1, 7.3, 7.4 |
| NG1 | ✅ | n/a | n/a — no artifact adds typed time or the wall-time hint |
| NG2 | ✅ | n/a | n/a — reference zone stays the device zone (D2 uses `getReferenceZone`) |
| NG3 | ✅ | n/a | n/a — no midnight marker is built |
| NG4 | ✅ | n/a | n/a — fixed schedule constants, no weekends |
| NG5 | ✅ | n/a | n/a — no Grid view work |
| NG6 | ✅ | n/a | n/a — nothing stored or shared (D6) |
| NG7 | ✅ | n/a | n/a — clamping in D2 keeps selections inside the day |
| NG8 | ✅ | n/a | n/a — labels use `hourCycle: "h23"` |
| Q1 | ✅ | n/a | n/a — decided in proposal, built by design D2/D7 |
| Q2 | ✅ | n/a | n/a — decided in proposal, design D5 |
| Q3 | ✅ | n/a | n/a — decided in proposal, design "Risks" |
| Q4 | ✅ | n/a | n/a — answered by design D4 |

## Consistency

- `tasks.md:123` puts every scenario of the spec requirements "Day-period colours" and "Local hour labels" into the unit feature `time_selection_day_track.feature` — which includes "Colours come from the theme tokens" (`specs/time-selection/spec.md:203`) and "Labels only on wide screens" (`specs/time-selection/spec.md:225`) — while `tasks.md:141` writes "Colours come from the theme tokens" as an E2E scenario in `time_selection_e2e.feature`, and no task names "Labels only on wide screens" as an E2E scenario.

## Findings

### R1 — WARNING — A vertical scroll that starts on a track pins the time on phones
- Location: `openspec/changes/add-time-sliders-to-location-cards/design.md:153`
- Rule: —
- Problem: Design D7 reports a selection in `onPointerDown`, for every pointer type, and relies on `touch-action: pan-y` so that vertical swipes still scroll. Proposal FR3 (`proposal.md:67`) and the spec (`specs/time-selection/spec.md:57`) also say that pressing a track pins the moment. With `touch-action: pan-y` the browser still sends `pointerdown` the moment the finger lands. It sends `pointercancel` only after it decides to scroll. So under D7 every vertical scroll that starts on a track first pins the reference moment to wherever the finger landed. The spec asks for exactly this case in `specs/time-selection/spec.md:293` ("A vertical swipe that starts on a track still scrolls the page"), but no scenario or task covers it.
- Impact: Below 768 px each track spans the card's full content width and its slider is 44 px high (D8, UX1), so many scroll gestures over the list start on a track. Each one silently moves the time on every card and leaves the moment pinned with the Now button shown. On phones, the main target, the user ends up seeing times they never chose. No test catches this, because every pointer test uses `page.mouse`.
- Fix: (1) Proposal FR3 and the spec's "Select a time on a track": add "On touch, the selection is made when the finger moves along the track or lifts without the browser taking over the gesture. A touch gesture that the browser takes over for vertical scrolling selects nothing." Mouse and pen keep selecting on press. (2) Design D7 "Pointer": for `pointerType === "touch"`, `onPointerDown` only captures the pointer and remembers it. The first `onPointerMove` reports the fraction (the browser delivers it only when it did not claim the gesture), and so does `onPointerUp` when no move happened (a tap). `onPointerCancel` discards. (3) Spec "Day track layout": add the scenario "A vertical swipe on a track scrolls without selecting a time". Given a live moment and a list long enough to scroll at 375 px, a vertical swipe starting on the Almaty track scrolls the page, the moment is still live and no Now button is shown. (4) Task 7.1: add that scenario (`@NFR-R2`), driven on the `mobile-chrome` project through CDP `Input.dispatchTouchEvent` (touchStart / touchMove / touchEnd), because `page.touchscreen` only taps.
- Fix risk: The CDP touch sequence works only in Chromium. Both E2E projects are Chromium, but the gesture may need explicit waits to stay stable. A tap now pins on release instead of on press, which changes nothing for the mouse-driven scenarios (7.1 drag, 7.3 click). FR3's wording changes slightly. No ADR or stable spec is affected.
- Status: open

### R2 — WARNING — No task re-runs the existing E2E suites that the new row layout can break
- Location: `openspec/changes/add-time-sliders-to-location-cards/tasks.md:158`
- Rule: `.claude/rules/test-planning.md` ("The `tasks.md` verification section must list concrete test commands")
- Problem: D8 turns every card's content into a wrapping flex container, adds a 44 px slider line on phones and a track column on wide screens. Several existing E2E features check the card's geometry and behaviour. `locations_local_time_e2e.steps.ts:61-89` checks "the time … is at the right end of its city line with the date right-aligned under it" and "follows its place column in the left half of the card". `locations_reorder_checks_e2e` / `locations_reorder_motion_e2e` use `boundingBox` for dragging, and date-selection layout is also covered. The tasks run E2E only filtered to this change (7.1 `--grep @add-time-sliders-to-location-cards`, 7.2) and to screenshots (7.4 `--grep Screenshot`). Final verification 8.2 runs `pnpm --filter @time-zones/client test`, which is `vitest run` (`packages/client/package.json:12`) and contains no Playwright suite.
- Impact: The change can break the stable "Local time and date layout" (`openspec/specs/locations/spec.md:683`) or the reorder requirements without anyone noticing, and the change would still be reported as verified.
- Fix: In task 8.2, after the unit run, add one run of the whole E2E suite, alone and not in the background: `pnpm --filter @time-zones/client test:bdd` (bddgen plus all projects, including `view-contract-cards`). Fix any failure it shows before archiving.
- Fix risk: A long E2E run (it builds and previews the app). CLAUDE.md requires it to run strictly alone, which the task must say. It does not conflict with the Stryker ban, which covers only mutation runs.
- Status: open

### R3 — WARNING — "Labels only on wide screens" and "Colours come from the theme tokens" have no clear home
- Location: `openspec/changes/add-time-sliders-to-location-cards/tasks.md:123`
- Rule: `.claude/rules/bdd-unit.md` (table: "Responsive layout — Unit BDD no, E2E BDD yes"); `.claude/rules/test-planning.md` ("If a scenario is in Gherkin — it must have step definitions")
- Problem: Task 6.2 writes the unit feature "with the scenarios of … 'Day-period colours' and 'Local hour labels'" and adds that "the last two take only the presented values". That puts the scenarios "Colours come from the theme tokens" (`specs/time-selection/spec.md:203`) and "Labels only on wide screens" (`specs/time-selection/spec.md:225`) into a jsdom feature, which cannot check either one. At the same time, task 7.1 (`tasks.md:141`) writes "Colours come from the theme tokens" as an E2E scenario. No task names "Labels only on wide screens" as an E2E scenario: the narrow/wide label checks are folded into other layout scenarios (`tasks.md:143-144`).
- Impact: The implementer will either (a) write unit scenarios with those titles that assert only presented values, so a scenario named for viewport visibility passes without checking it, or (b) write "Colours come from the theme tokens" in two feature files with different meanings. Either way, the spec scenario "Labels only on wide screens" ends up without a step definition that checks what it states.
- Fix: In task 6.2, list the unit scenarios by name and leave out "Colours come from the theme tokens" and "Labels only on wide screens" ("these two are E2E, task 7.1"). In task 7.1, under layout, add the named scenario "Labels only on wide screens" (`@FR7 @NFR-R2`): at 375 px no hour label is visible, and at 1024 px every track shows its five labels under it.
- Fix risk: none. The new E2E scenario reuses the label checks that 7.1 already plans for the narrow and wide layout scenarios.
- Status: open

### R4 — SUGGESTION — design.md lacks the "Consequences" and "Alternatives Considered" sections
- Location: `openspec/changes/add-time-sliders-to-location-cards/design.md:178`
- Rule: `.claude/rules/design-decisions.md` ("Required sections": Context, Decision, Consequences, Alternatives Considered)
- Problem: The design has Context, Goals / Non-Goals, Decisions, Risks / Trade-offs and Migration Plan. It has no "Consequences" section and no "Alternatives Considered" section. The rejected options appear only inside decisions: the native `<input type="range">` in D7 (`design.md:158`) and the `SHIFT_TIME` command in D1 (`design.md:50`).
- Impact: A reader looking for what was rejected and why has to scan every decision. The archived design of this change would also not match the format the rule requires (the archived `select-date-with-calendar-and-now/design.md` has both sections).
- Fix: Add `## Consequences` (positive: one command for pointer and keys, stops reused within a day; negative: one Tab stop per card, every screenshot baseline re-approved). Add `## Alternatives Considered` with the native range input (moved from D7) and a separate `SHIFT_TIME` command (moved from D1).
- Fix risk: none. Text moves between sections and no decision changes.
- Status: open

## Verdict

Needs revision. Blocking: R1, R2, R3 (WARNING). R4 is optional polish.
