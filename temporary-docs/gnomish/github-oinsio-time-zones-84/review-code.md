# Review: fix-location-card-and-header-layout

## Summary

| Item | Value |
|---|---|
| Tasks verified | 16/16 |
| Requirements traced | 52/52 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 1 |

## Tasks

All paths below are under `packages/client/src/`.

- ✅ 1.1 RED tests present: `views/shared/LocationRow.test.tsx:151-173` ("should render the wall-time hint as the card's last element, after the location menu button" checks `card.lastElementChild` is the `status` and `compareDocumentPosition` after the menu button; "should render no status element without a hint"), header comment `LocationRow.test.tsx:6`.
- ✅ 1.2 `ZoneRowContent.tsx` no longer has the `wallTimeHint` prop or the `WallTimeHint` render (JSDoc `:34-35`); `LocationRow.tsx:184-186` renders `<WallTimeHint>` after `<LocationMenu>`; `WallTimeHint.tsx:18` adds `order-last`; JSDoc links in all three files.
- ✅ 2.1 `views/shared/AddLocationButton.test.tsx:54-66`: "should show no visible text on any width" (empty text in English and Russian) and the Russian accessible-name test expecting empty text; `// Verifies FR3 …` at `:2`.
- ✅ 2.2 `AddLocationButton.tsx:26` lost `md:order-2 md:border-border md:bg-surface` and the `addShort` span; `app/MainPage.tsx:31-32` header `grid grid-cols-[1fr_auto_1fr]` without `md:flex`, `<h1>` without `md:order-1 md:mr-auto md:text-left`; `SettingsButton.tsx:24` keeps `col-start-3 justify-self-end`; `addShort` removed from `locales/en.json` and `locales/ru.json` (`grep -rn addShort src` prints nothing); JSDoc in `AddLocationButton.tsx:13-14`, `MainPage.tsx:24-25`, `SettingsButton.tsx:10-11`.
- ✅ 3.1 `LocalDateTime.tsx:47` `md:w-44`, `:54` `whitespace-nowrap` on the time button; `DayTrack.tsx:135` `whitespace-nowrap` on each hour label; JSDoc `LocalDateTime.tsx:22-23`, `DayTrack.tsx:44`.
- ✅ 3.2 Noted "check green on main, no code change"; the handle keeps `bg-surface` like the card (`LocationRow.tsx` card `bg-surface`), and the card-based check exists (`time_selection_card_layout_e2e.steps.ts:79-106`).
- ✅ 4.1 `main_page/main_page_header_e2e.feature`: Narrow header gets the centre step (`:15`), "Wide header at <width> px" outline 768/1024/1440/2560 (`:19-32`), unreadable-list outline at 5 widths with centre and rightmost steps (`:67-82`), Tab order step in the a11y outline (`:91`), all tagged `@fix-location-card-and-header-layout`.
- ✅ 4.2 `main_page/steps/main_page_header_e2e.steps.ts:134-178` adds the centre, rightmost and Tab-order steps; "shows the visible text", "is directly before" and `MAX_ADJACENT_GAP_PX` removed.
- ✅ 5.1 `time_selection/time_selection_card_layout_e2e.feature:10-23` hint outline at 375/1024; steps `time_selection_card_layout_e2e.steps.ts:33-76`; `time_selection_wall_time_input_e2e.feature:99` uses "the hint is the bottom line of the card of \"New York\""; old step deleted from `time_selection_wall_time_input_e2e.steps.ts`.
- ✅ 5.2 Handle-fill outlines at `time_selection_card_layout_e2e.feature:25-57` (5 rows for the card fill, 4 dark rows for "not the page background"); `time_selection_labels_e2e.steps.ts:128-143` compares with the card; `time_selection_layout_e2e.feature:86` tagged `@fix-location-card-and-header-layout @FR2`.
- ✅ 5.3 Equal-tracks outline 768/1024/1440 (`time_selection_card_layout_e2e.feature:59-80`), Russian labels (`:82-89`), NFR-R1 outline 320/768/2560 with a 12-hour GAP hint (`:91-103`), axe outline (`:105-120`); helpers `cardLayoutE2eHelpers.ts`. The "in full" check is weak, see R1.
- ✅ 6.1 State `TWELVE_HOUR = "12-hour"` in `locations/steps/locationsStates.ts:68,180-182`, seeding in `locationsSeedHelpers.ts:93-115`; the 12-hour rows live in a separate `locations/locations_12_hour_screenshots_e2e.feature` (tagged `@NFR-R2`) instead of `locations_ui_e2e.feature`, which got the change tag (`:134`) for its re-approved rows — equivalent coverage, keeps the files small.
- ✅ 6.2 New `Screenshot-of-the-12-hour-state-*` PNGs (chromium and mobile-chrome, 375/1024, both themes) and re-approved 1024 px and `wall-time-hint` PNGs under `test/features/__screenshots__/`; the 1024 px light 12-hour and the dark `wall-time-hint` screenshots show "+" at the left, the centred title, one-line labels and the hint as the card's bottom line.
- ✅ 7.1 Measured here: `ZoneRowContent.tsx`, `LocationRow.tsx`, `WallTimeHint.tsx`, `AddLocationButton.tsx` all ≥ 98.5% (see Mutation).
- ✅ 7.2 CI is green for this branch (stage precondition); `.gnomish-task/attempts/implement/*/trace.jsonl` record the runs.
- ✅ 7.3 The traceability loop, run from `packages/client/`, prints nothing.

## Requirements

- ✅ FR1 — `LocationRow.tsx:184-186`, `WallTimeHint.tsx:18`; tested by `LocationRow.test.tsx:151-166` and `time_selection_card_layout_e2e.feature:10-23` (`@FR1`).
- ✅ FR2 — handle `bg-surface` in `DayTrack.tsx`, card `bg-surface` in `LocationRow.tsx`; tested by `time_selection_card_layout_e2e.feature:25-57` and `time_selection_layout_e2e.feature:86-90`.
- ✅ FR3 — `AddLocationButton.tsx:26-31` (icon only); tested by `AddLocationButton.test.tsx:54-66` and `main_page_header_e2e.feature:9-32` ("shows no visible text").
- ✅ FR4 — `MainPage.tsx:31-32`, `SettingsButton.tsx:24`; tested by the centre step at 375/768/1024/1440/2560 with and without "+" (`main_page_header_e2e.feature:9-82`). The rightmost check is weak, see R2.
- ✅ FR5 — `LocalDateTime.tsx:47,54`; tested by "Equal tracks in the 12-hour format" (`time_selection_card_layout_e2e.feature:59-80`). The "in full" assertion is weak, see R1.
- ✅ FR6 — `DayTrack.tsx:135`; tested by `expectHourLabelsOnOneLine` (`cardLayoutE2eHelpers.ts:48-68`) in English (3 widths) and Russian.
- ✅ NFR-A1 — axe outline `time_selection_card_layout_e2e.feature:105-120`; header sizes, Tab order and axe `main_page_header_e2e.feature:84-99`.
- ✅ NFR-A2 — hint stays `<p role="status">` (`WallTimeHint.tsx:16-17`); tested by `LocationRow.test.tsx:151-166` and the role check in `time_selection_card_layout_e2e.steps.ts:48`.
- ✅ NFR-R1 — `time_selection_card_layout_e2e.feature:91-103` (12-hour, GAP hint, 320/768/2560).
- ✅ NFR-R2 — `locations_ui_e2e.feature:134` tag on the re-approved outline, `locations_12_hour_screenshots_e2e.feature`, new and updated PNGs.
- ✅ UX1 — same evidence as FR1 (`@UX1` on the hint outline, "have not moved" step `time_selection_card_layout_e2e.steps.ts:63-76`).
- ✅ UX2 — `@UX2` on the narrow and wide header scenarios.
- ✅ UX3 — `@UX3` on "Equal tracks in the 12-hour format".
- ✅ UX4 — `@UX4` on both handle-fill outlines.
- ✅ M1 — hint outline at 375 and 1024 px measures city, time, track and menu within 1 px (`time_selection_card_layout_e2e.steps.ts:63-76`).
- ✅ M2 — centre step at 375, 768, 1024, 1440, 2560 px, with "+" (`main_page_header_e2e.feature:9-32`) and without it (`:67-82`).
- ✅ M3 — "the tracks of the cards are equally long" at 768/1024/1440 (`time_selection_card_layout_e2e.steps.ts:126-135`).
- ✅ M4 — every label's height ≤ 16 px for 4 tracks at 768/1024 (`cardLayoutE2eHelpers.ts:55-60`).
- ✅ M5 — 4 dark rows of the handle-fill outline (system dark and Dark preference × 375/1024).
- ✅ M6 — measured here: `ZoneRowContent.tsx` 100%, `LocationRow.tsx` 98.51%.
- ✅ M7 — the task 7.3 loop prints nothing (run during this review).
- ✅ Scenario: Narrow screen — `locations_local_time_e2e.feature:7` "Time beside the city on a narrow screen".
- ✅ Scenario: Wide screen — `locations_local_time_e2e.feature:17` "Time in its own column on a wide screen".
- ✅ Scenario: One time column width in the 12-hour format — `time_selection_card_layout_e2e.feature:59-80` (times, equal columns, one line); "in full" weak, see R1.
- ✅ Scenario: Times fit narrow and wide screens — `locations_local_time_e2e.feature:27-36` (320, 2560).
- ✅ Scenario: List screenshots show the time and the date — `locations_ui_e2e.feature` "list" rows at 375/1024 in both themes, re-approved PNGs.
- ✅ Scenario: Narrow header — `main_page_header_e2e.feature:9-16`.
- ✅ Scenario: Wide header — `main_page_header_e2e.feature:19-32` (768/1024/1440/2560).
- ✅ Scenario: The header opens the search and the settings — `main_page_header_e2e.feature:35`.
- ✅ Scenario: Slash still opens the search — `main_page_header_e2e.feature:44`.
- ✅ Scenario: One Add location button — `main_page_header_e2e.feature:60`.
- ✅ Scenario: Header sizes and accessibility — `main_page_header_e2e.feature:84-99` (sizes, Tab order, axe at 375/1024 × light/dark).
- ✅ Scenario: No Add location button on an unreadable list — `main_page_header_e2e.feature:67-82` at 5 widths; rightmost step weak, see R2.
- ✅ Scenario: Track under the text on a narrow screen — `time_selection_layout_e2e.feature:7`.
- ✅ Scenario: Track beside the time on a wide screen — `time_selection_layout_e2e.feature:15`.
- ✅ Scenario: Handle centre matches the instant — `time_selection_layout_e2e.feature:33`.
- ✅ Scenario: The dragged handle stays under the pointer — `time_selection_drag_e2e.feature:48`.
- ✅ Scenario: Drag without scrolling or reordering — `time_selection_e2e.feature:18`.
- ✅ Scenario: The handle stays clear of the time and the menu — `time_selection_layout_e2e.feature:93` (768 and 1024, start and track end), green with the narrower track.
- ✅ Scenario: A vertical swipe on a track scrolls without selecting a time — `time_selection_touch_e2e.feature:7`.
- ✅ Scenario: A finger tap on a track selects a time — `time_selection_touch_e2e.feature:20`.
- ✅ Scenario: Touch targets — `time_selection_layout_e2e.feature:46`.
- ✅ Scenario: Tracks fit narrow and wide screens — `time_selection_layout_e2e.feature:58-72` (320, 2560, 768).
- ✅ Scenario: Screenshots show the tracks — `locations_ui_e2e.feature` list/pinned/calendar/time-selected rows and `locations_12_hour_screenshots_e2e.feature`.
- ✅ Scenario: The handle is filled with its card's fill — `time_selection_card_layout_e2e.feature:25-57` (5 rows; the dark "differs from the page background" part is its own 4-row outline).
- ✅ Scenario: Equal tracks in the 12-hour format — `time_selection_card_layout_e2e.feature:59-80`.
- ✅ Scenario: Hour labels on one line in Russian — `time_selection_card_layout_e2e.feature:82-89`.
- ✅ Scenario: Tracks in the 12-hour format fit narrow and wide screens — `time_selection_card_layout_e2e.feature:91-103`.
- ✅ Scenario: No horizontal scrolling — `time_selection_wall_time_input_e2e.feature:91-104` (320, 2560, New York hint).
- ✅ Scenario: The hint is the bottom line of its card — `time_selection_card_layout_e2e.feature:10-23`.
- ✅ Scenario: No accessibility violations with a hint in the 12-hour format — `time_selection_card_layout_e2e.feature:105-120`.
- ✅ Scenario: Hint screenshots — `locations_ui_e2e.feature:197-200` wall-time-hint rows, re-approved PNGs.

## Mutation

Measured in this review, two runs, one at a time, from `packages/client/`:

- Run 1 (`--mutate` the five changed files of `views/shared/`): `AddLocationButton.tsx` 100% (2/2), `LocalDateTime.tsx` 100% (22/22), `LocationRow.tsx` 98.51% (66 killed, 1 survived), `WallTimeHint.tsx` 100% (1/1), `ZoneRowContent.tsx` 100% (25/25); total 99.15%. The single survivor is the `ref` callback block at `LocationRow.tsx:129`, untouched by this branch.
- Run 2 (`DayTrack.tsx`, `app/MainPage.tsx`, `app/SettingsButton.tsx`): 100% each (17, 2 and 2 mutants killed).

No file is below 90%.

## Findings

### R1 — WARNING — The "time shown in full" check cannot detect a time that overflows its column
- Location: `packages/client/src/test/features/time_selection/steps/cardLayoutE2eHelpers.ts:44`
- Rule: `.claude/rules/test-planning.md` (every FR has an automated test covering it); FR5 of `proposal.md`
- Problem: `measureTimeButton` reports `isClipped: button.scrollWidth > button.clientWidth`, and `time_selection_card_layout_e2e.steps.ts:173` asserts it is false. The time button sits in `LocalDateTime`'s `flex flex-col … md:w-44 md:items-start` column (`LocalDateTime.tsx:47`) and has `whitespace-nowrap` (`:54`), so the button is always as wide as its text: when the text is wider than the 176 px column the button overflows the column, but its own `scrollWidth` equals its `clientWidth`. The companion check "the time columns of the cards are equally wide" measures the fixed `md:w-44` span, so it also passes whatever the text width.
- Impact: FR5 requires every time to be shown "in full, on one line" inside a fixed column, and design D4 makes "the E2E check of one-line times" the source of truth for whether 176 px is wide enough. If the column becomes too narrow (a font, size or width change), the time text runs over the day track's left edge and both steps stay green, so the regression ships undetected.
- Fix: in `measureTimeButton`, also return whether the button's right edge passes its column's right edge, e.g. `overflowsColumn: button.getBoundingClientRect().right > (button.parentElement?.getBoundingClientRect().right ?? 0) + 1` (the button is a direct child of the `md:w-44` span), and in the step at `time_selection_card_layout_e2e.steps.ts:173` assert `overflowsColumn` is false (keeping or replacing the `isClipped` assertion).
- Fix risk: low — the 1024 px 12-hour screenshot shows the widest tested time, `12:30 PM`, about 157 px wide in the 176 px column, and the time size is `md:text-4xl` from 768 px on, so the strengthened check should pass at 768/1024/1440; if it fails at some width, that is a real FR5 defect to fix by widening `md:w-44` as design D4 already prescribes. The test stays in the playwright-bdd step file, where `bdd-unit.md` puts responsive layout.
- Status: fixed
- Resolution: measureTimeButton now returns overflowPx (button right edge minus its column right edge) and the step "show their time on one line in full" asserts it is within TOLERANCE_PX.

### R2 — SUGGESTION — "rightmost header control" only checks that Settings is right of the title
- Location: `packages/client/src/test/features/main_page/steps/main_page_header_e2e.steps.ts:156`
- Rule: —
- Problem: the step "the button named {string} is the rightmost header control" asserts only `buttonBox.x > titleBox.x + titleBox.width`. With the new `grid-cols-[1fr_auto_1fr]` header, a Settings button at the start of the third column (for example if `justify-self-end` were dropped from `SettingsButton.tsx:24`) is still right of the title, so the step passes although Settings no longer stands at the right edge that FR4 and the unreadable-list scenario require ("the settings button at the right").
- Impact: a regression of FR4's "settings button stays the rightmost control / at the right" would not be caught by the step written for it; low stakes because the screenshots of the main-page states would still show the change.
- Fix: in that step, also assert that the button's right edge equals the header's right edge within the existing `CENTRE_TOLERANCE_PX` (`Math.abs(buttonBox.x + buttonBox.width - (headerBox.x + headerBox.width)) <= 1`, with `headerBox` from `requireBox(headerOf(page))`).
- Fix risk: none — the `<header>` has no horizontal padding (`MainPage.tsx:31`: `border-b … pt-6 pb-4`) and `SettingsButton` is `justify-self-end` in the last grid column, so its right edge is the header's right edge today.
- Status: fixed
- Resolution: the rightmost-header-control step now also asserts the button right edge equals the header right edge within CENTRE_TOLERANCE_PX.

## Verdict

Ready. No CRITICAL finding; the WARNING R1 (a no-op "in full" assertion) and the SUGGESTION R2 strengthen tests and block nothing. All 16 tasks, every requirement id and all 31 delta-spec scenarios have implementing code and tests, and every changed production file scores at least 98.5% under Stryker.
