# Review: fix-day-track-drag-continuity-and-smoothness

## Summary

| Item | Value |
|---|---|
| Tasks verified | 16/16 |
| Requirements traced | 50/50 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 — `TrackTouchEvent` enum and `TRACK_TOUCH_MOVE_LISTENER_OPTIONS = { passive: false }` at `packages/client/src/constants/timeSelection.ts:18-33` under the required `// Implements FR1, FR2, FR4 …` comment (plus `TRACK_TOUCH_START_LISTENER_OPTIONS`, used by the fallback's passive `touchstart`); re-exported in `constants/index.ts:70-74`.
- ✅ 2.1 — `views/shared/dayTrackPointer.test.ts:6-18`: `it.each` over clientX 300 → 0.5, 50 → 0, 900 → 1, and width 0 → `null`.
- ✅ 2.2 — `views/shared/dayTrackPointer.ts:8-17` clamps with `MIN_TRACK_FRACTION`/`MAX_TRACK_FRACTION`; `selectAt` uses it (`useDayTrackDrag.ts:36-44`).
- ✅ 3.1 — `views/shared/DayTrack.drag.test.tsx`: touch drag to y 500 selects 0.75 (`:21-29`), `touchMove` cancelled only during a drag, true before/after (`:31-39`) and during a vertical swipe (`:41-47`), handle `51.2%` with `aria-valuenow` 750 (`:49-57`), settles after `pointerUp`/`pointerCancel` (`:59-70`), vertical swipe leaves the handle (`:72-78`).
- ✅ 3.2 — `views/shared/useDayTrackDrag.ts` holds the pointer handlers, `dragFraction` (`:34`) and the non-passive `touchmove` guard (`:57-74`); `DayTrack.tsx:119` places the handle at `formatPercent(dragFraction ?? track.fraction)`; JSDoc `DayTrack.tsx:40-41`. `DayTrack.input.test.tsx`, `DayTrack.legacy.test.tsx`, `DayTrack.test.tsx` are not in the diff (unchanged).
- ✅ 4.1 — `views/shared/DayTrack.touchFallback.test.tsx` covers every listed case: drag off the bar (`:44-54`), vertical move (`:56-64`), handle follows and settles after `touchEnd`/`touchCancel` (`:66-80`), click after drag ignored (`:82-92`), tap selects once (`:94-103`), second finger ignored (`:105-115`), nothing with Pointer Events (`:117-123`).
- ✅ 4.2 — `views/shared/useDayTrackTouchFallback.ts:46-114` adds listeners only when `IS_POINTER_EVENTS_SUPPORTED` is false and removes them on unmount; wired into `DayTrack.tsx` by one hook call (`:64-69`) and one `onClick` guard (`:92-98`); JSDoc `DayTrack.tsx:42-43`.
- ✅ 5.1 — `test/features/time_selection/time_selection_drag_unit.feature` (6 scenarios with the listed tags) and `steps/time_selection_drag_unit.steps.tsx`, helpers in `steps/dragSteps.ts`; the driver re-renders with `world.trackOf(city)` after every input (`dragSteps.ts:46,86-101`); NFR-P1 scenario uses `startWorkCount()` and `toBe` per row (`steps:165-196`).
- ✅ 5.2 — `time_selection_drag_e2e.feature` holds all five scenarios with their tags; steps in `steps/time_selection_drag_e2e.steps.ts` reuse the existing steps, drive `page.mouse` / `startTouch`+`dispatchTouch`, move 20 px first (`:31,56-79`) and assert both points inside the viewport (`:47-54,103-104`). The screen is 375 × 340 px instead of 375 × 300, which keeps the spec's 120 px offset as the task allows.
- ✅ 5.3 — the five existing scenarios and the two `//` comments in `time_selection_legacy_tap.steps.tsx:66,85` gained only `@fix-day-track-drag-continuity-and-smoothness @FR5` (diff of the four `.feature` files shows only tag lines).
- ✅ 5.4 — measured in this review: 98.92% over the four files (see Mutation).
- ✅ 6.1 — the loop run from `packages/client/` prints nothing.
- ✅ 6.2 — done in substance. `handoff/H1-glossary-handle-drag.patch` exists and carries the proposal's wording for **Day track** and **Handle**. `handoff/README.md:5-15` holds the H1 section with the required opening sentence, the relative path and the **Apply** line (track-end patch first). That **Apply** line, run on a clean copy of `docs`, applies both patches, and the file then contains "except a handle that is being dragged" and "Track end". `git apply --check --unidiff-zero …/H1-glossary-handle-drag.patch` and plain `git apply --check` both exit 0 on the committed file, the **Apply** grep prints `1`, and `git status --short docs` prints nothing. The patch deviates from the letter of the task: it keeps context lines (`@@ -5,4 +5,4 @@`) and is applied with `-C0`, not `--unidiff-zero`. As a result the task's scratch check, which still uses `--unidiff-zero`, exits 1 after the track-end patch. The README section also does not follow the field order of `handoff.md`. Both points are in R1.
- ✅ 6.3 — `handoff/README.md` `## H2: Drag on real iOS devices` with the checklist, **Serves**, **Verify**, **Why manual**, **Automated part**, **Fallback**; `grep -c "^## H[12]:"` prints 2.
- ✅ 6.4 — the stage premise is green CI (typecheck, lint, test, build, test:bdd); Stryker's dry run in this review ran the whole Vitest suite green.
- ✅ 6.5 — the glossary grep over the six files prints nothing.

## Requirements

- ✅ FR1 — `useDayTrackDrag.ts:76-109` (capture on press / on `SELECT`, every captured move calls `dragAt`), `dayTrackPointer.ts:8-17` clamp; tests `DayTrack.drag.test.tsx:21-29`, unit BDD `time_selection_drag_unit.feature:5-29`, E2E `time_selection_drag_e2e.feature:5-33`.
- ✅ FR2 — non-passive `touchmove` guard `useDayTrackDrag.ts:57-74`, fallback `useDayTrackTouchFallback.ts:73`; tests `DayTrack.drag.test.tsx:31-47`, E2E "the page has not scrolled" in `time_selection_drag_e2e.feature:15,33` and the vertical swipe `:35-45`.
- ✅ FR3 — `DayTrack.tsx:119`, `dragFraction` set in `useDayTrackDrag.ts:46-55` and cleared at `:111-126`; tests `DayTrack.drag.test.tsx:49-70`, unit BDD `time_selection_drag_unit.feature:31-51`, E2E `time_selection_drag_e2e.feature:47-65`.
- ✅ FR4 — `useDayTrackTouchFallback.ts:46-114`, click guard `DayTrack.tsx:92-98`; tests `DayTrack.touchFallback.test.tsx`, unit BDD `time_selection_drag_unit.feature:19,53-61`, E2E `time_selection_drag_e2e.feature:21,35-45`.
- ✅ FR5 — mouse/pen select on press and touch tap on lift kept (`useDayTrackDrag.ts:76-88,111-120`); `@FR5` tags on the existing scenarios of task 5.3; the existing `DayTrack.*.test.tsx` files pass unchanged.
- ✅ NFR-P1 — no throttle needed: the store skips unchanged state (design D5); unit BDD `time_selection_drag_unit.feature:63-73` asserts same row objects and 0 formatter builds.
- ✅ NFR-A1 — `aria-valuenow`/`aria-valuetext` still read `track.valueMinutes`/`track.valueText` (`DayTrack.tsx:90-91`); tests `DayTrack.drag.test.tsx:56`, E2E `time_selection_drag_e2e.feature:67-82` (value, text, axe-core, light and dark).
- ✅ NFR-R1 — E2E outline at 375 and 1024 px `time_selection_drag_e2e.feature:47-65`, finger drags at 375 px `:5-21`, run in the `chromium` and `mobile-chrome` projects.
- ✅ UX1 — E2E `time_selection_drag_e2e.feature:5-21` (finger 120 px below the track, no scroll); unit BDD `time_selection_drag_unit.feature:5-19`.
- ✅ UX2 — E2E handle within 1 px of the pointer and of the step after release `time_selection_drag_e2e.feature:47-65` (steps `:159-189`); unit BDD `:31-51`.
- ✅ UX3 — fallback drag `useDayTrackTouchFallback.ts`; E2E row `finger on an engine without Pointer Events` (`time_selection_drag_e2e.feature:21`); tap kept (`DayTrack.touchFallback.test.tsx:94-103`).
- ✅ M1 — the five E2E drag scenarios exist (mouse, finger, finger past the right end, finger without Pointer Events, vertical swipe without Pointer Events), each drag ending with "the page has not scrolled" (`time_selection_pointer_e2e.steps.ts:88-94` asserts `scrollY` 0).
- ✅ M2 — "The dragged handle stays under the pointer" asserts 3 off-step positions within 1 px and the settled step within 1 px (`time_selection_drag_e2e.steps.ts:159-189`).
- ✅ M3 — `git diff` of the existing `time_selection/*.feature` files shows only tag-line changes.
- ✅ M4 — 98.92% measured over the four `views/shared/` files (see Mutation).
- ✅ M5 — the task 6.1 loop prints nothing.
- ✅ Scenario: All handles stand at the same position — unchanged, `time_selection_day_track.feature`.
- ✅ Scenario: A live handle follows the clock — unchanged, `time_selection_day_track.feature`.
- ✅ Scenario: A pinned handle ignores minute updates — unchanged, `time_selection_day_track.feature`.
- ✅ Scenario: The dragged handle follows the pointer between track steps — `time_selection_drag_unit.feature:31-40`.
- ✅ Scenario: The handle settles on the selected step at release — `time_selection_drag_unit.feature:42-51`.
- ✅ Scenario: Dragging one track moves every card — `time_selection_select_time.feature`, `time_selection_e2e.feature:6-7` (now also `@FR5`).
- ✅ Scenario: Selections snap to quarter hours and stay inside the day — unchanged, `time_selection_select_time.feature`.
- ✅ Scenario: The right end reaches the last minute of 23- and 25-hour days — unchanged, `time_selection_select_time.feature`.
- ✅ Scenario: Selection on a 23-hour day — unchanged, `time_selection_select_time.feature`.
- ✅ Scenario: A malformed instant changes nothing — unchanged, `time_selection_select_time.feature`.
- ✅ Scenario: A tap selects a time without Pointer Events — `time_selection_legacy_tap.feature` (now `@FR5`), plus `DayTrack.touchFallback.test.tsx:94-103`.
- ✅ Scenario: A finger tap keeps the slider accessible without Pointer Events — unchanged, `time_selection_legacy_touch_e2e.feature:6`.
- ✅ Scenario: A click adds nothing where Pointer Events exist — `time_selection_legacy_tap.feature` (now `@FR5`).
- ✅ Scenario: A drag continues when the pointer leaves the track — `time_selection_drag_e2e.feature:5-21` and `time_selection_drag_unit.feature:5-19`.
- ✅ Scenario: A drag past the right end pins the track end — `time_selection_drag_e2e.feature:23-33` and `time_selection_drag_unit.feature:21-29`.
- ✅ Scenario: A finger drag adds no selection when the finger lifts — `time_selection_drag_unit.feature:53-61` (click after the lift leaves 13:00 pinned).
- ✅ Scenario: A vertical swipe without Pointer Events still scrolls — `time_selection_drag_e2e.feature:35-45`.
- ✅ Scenario: The slider reports the selected step after a drag — `time_selection_drag_e2e.feature:67-82`.
- ✅ Scenario: 50 rows within the time-selection budget — unchanged, `time_selection_moment.feature`.
- ✅ Scenario: 50 tracks within the date-change budget — unchanged, `time_selection_day_track.feature`.
- ✅ Scenario: The new day's tracks are computed once — unchanged, `time_selection_day_track.feature`.
- ✅ Scenario: Hour labels are unchanged by formatter reuse — unchanged, `time_selection_day_track.feature`.
- ✅ Scenario: A drag move inside the pinned track step re-presents no row — `time_selection_drag_unit.feature:63-73`.
- ✅ Scenario: Track under the text on a narrow screen — unchanged, `time_selection_layout_e2e.feature`.
- ✅ Scenario: Track beside the time on a wide screen — unchanged, `time_selection_layout_e2e.feature`.
- ✅ Scenario: Handle centre matches the instant — unchanged, `time_selection_layout_e2e.feature`.
- ✅ Scenario: The dragged handle stays under the pointer — `time_selection_drag_e2e.feature:47-65`.
- ✅ Scenario: Drag without scrolling or reordering — unchanged, `time_selection_e2e.feature:18`.
- ✅ Scenario: The handle stays clear of the time and the menu — unchanged, `time_selection_layout_e2e.feature`.
- ✅ Scenario: A vertical swipe on a track scrolls without selecting a time — `time_selection_touch_e2e.feature` (now `@FR5`).
- ✅ Scenario: A finger tap on a track selects a time — `time_selection_touch_e2e.feature` (now `@FR5`).
- ✅ Scenario: Touch targets — unchanged, `time_selection_layout_e2e.feature`.
- ✅ Scenario: Tracks fit narrow and wide screens — unchanged, width outline with 320/768/2560 in `time_selection_layout_e2e.feature:67`.
- ✅ Scenario: Screenshots show the tracks — unchanged, `time-selected` rows in `locations/locations_ui_e2e.feature:166-169`.

## Mutation

One scoped run, measured in this review:
`npx stryker run --mutate 'src/views/shared/DayTrack.tsx,src/views/shared/useDayTrackDrag.ts,src/views/shared/useDayTrackTouchFallback.ts,src/views/shared/dayTrackPointer.ts,src/constants/timeSelection.ts'`

| File | Score | Killed | Timeout | Survived | Errors |
|---|---|---|---|---|---|
| `views/shared/DayTrack.tsx` | 100.00% | 17 | 0 | 0 | 0 |
| `views/shared/dayTrackPointer.ts` | 100.00% | 9 | 0 | 0 | 0 |
| `views/shared/useDayTrackDrag.ts` | 98.59% | 70 | 0 | 1 | 0 |
| `views/shared/useDayTrackTouchFallback.ts` | 98.31% | 58 | 0 | 1 | 1 |
| `constants/timeSelection.ts` | 100.00% | 22 | 7 | 0 | 0 |
| All | 98.92% | 176 | 7 | 2 | 1 |

Survivors:
- `useDayTrackDrag.ts:123` `isDragActive.current = false` → `true` in `handlePointerCancel` — no test checks that the scroll guard ends after a browser cancel (R2).
- `useDayTrackTouchFallback.ts:105` cleanup block → `{}` — listeners on a removed element go away with it, so this has no practical effect; not raised as a finding.

The runtime error (`index += 1` → `index -= 1` in `findTouch`) is an infinite-loop mutant, not a test gap. Every file is above 95%.

## Findings

### R1 — WARNING — H1 handoff: tasks.md command fails and README breaks the handoff field order
- Location: `openspec/changes/fix-day-track-drag-continuity-and-smoothness/tasks.md:90` and `openspec/changes/fix-day-track-drag-continuity-and-smoothness/handoff/README.md:9-15`
- Rule: `.gnomish/stages/specify/handoff.md` ("`README.md`: one `## H<n>: <title>` section per item, in this order: **Serves:** …; **Files:** the paths the patch changes; **Apply:** the exact command, run from the repository root …; **Verify:** …; **Why manual:** and **Automated part:**, copied from `tasks.md`")
- Problem: there are two defects in the H1 handoff of task 6.2. (a) The patch `handoff/H1-glossary-handle-drag.patch` keeps context lines (hunk `@@ -5,4 +5,4 @@`, lines 5 and 8 as context), and `handoff/README.md:9` applies it with `git apply -C0`. tasks.md still prescribes `git apply --unidiff-zero` for this patch in three places: the 6.2 **Apply** line (`tasks.md:90`), the 6.2 scratch check (`tasks.md:95`) and the Human follow-up H1 bullet (`tasks.md:106`). I ran the scratch check. After the archived `H1-glossary-track-end.patch`, `git apply --unidiff-zero …/H1-glossary-handle-drag.patch` exits 1 with "patch does not apply". The README's `-C0` command does apply, and it leaves both "except a handle that is being dragged" and "Track end" in the file. (b) The H1 section of `handoff/README.md:9-15` has no **Files:** line. Its fields come in the order Apply, Patch, Changes, Serves, Why manual, Automated part, Verify, not the order `handoff.md` requires. Its **Why manual:** ("the glossary lives in `docs/`, which the implement stage does not edit") and **Automated part:** are not the texts of the tasks.md Human follow-up H1 (`tasks.md:107-108`).
- Impact: (a) The same handoff has two commands, and one of them fails. The operator reviews the tasks.md Human follow-up on the pull request. If they follow it once the track-end patch is in, they get "patch does not apply", and the FR3/UX2 glossary entries stay out of date. The ticked task 6.2 also fails its own scratch check. (b) The deliver stage lists each handoff item in the pull request from this README. Without **Files:**, the reviewer cannot see from the section which file the patch touches. The section breaks the fixed field order that `handoff.md` sets for every item, and its manual-reason texts differ from the plan they are supposed to copy.
- Fix: keep the patch file and the README **Apply** command as they are. A context patch is what `handoff.md` needs for a plain `git apply --check`. (a) In `tasks.md`, use `git apply -C0 openspec/changes/fix-day-track-drag-continuity-and-smoothness/handoff/H1-glossary-handle-drag.patch` in place of `git apply --unidiff-zero …H1-glossary-handle-drag.patch` in the 6.2 **Apply** line (`:90`), the 6.2 scratch check (`:95`) and the Human follow-up H1 bullet (`:106`). They then match `handoff/README.md:9`, and the scratch check exits 0. (b) In `handoff/README.md`, reorder the H1 bullets to **Serves:** (FR3, UX2), **Files:** `docs/glossary/time-selection.md`, **Apply:** (the line 9 command unchanged), **Patch:** (the relative path, kept right after **Apply:**, since `handoff.md` and task 6.2 ask for the path relative to the README as well), **Verify:**, **Why manual:**, **Automated part:**. Copy the last two verbatim from the tasks.md Human follow-up H1, after the `-C0` edit of (a). Move the **Changes:** sentence into the paragraph under the heading.
- Fix risk: low. Both edits touch only this active (not archived) change's plan and handoff text, and change no code. The 6.2 grep `^- \*\*Apply:\*\*.*H1-glossary-track-end\.patch.*H1-glossary-handle-drag\.patch` still prints `1`, because the **Apply** line keeps its text, and `grep -c "^## H[12]:"` still prints `2`. The other route, regenerating the patch with `git diff -U0` so that `--unidiff-zero` works, would break the plain `git apply --check` that `handoff.md` relies on, so it is not proposed.
- Status: rejected (contradicts-spec)
- Resolution: the fix edits tasks.md and the change handoff/README.md; instructions.md for fix-code keeps tasks.md and the plan artifacts untouched and the stage check allows edits only under packages/client/ plus this report. Fixing it belongs to a plan update (update-change), not this stage.

### R2 — WARNING — No test shows that a cancelled touch drag gives scrolling back
- Location: `packages/client/src/views/shared/useDayTrackDrag.ts:123`
- Rule: `.claude/rules/tdd-workflow.md` (each surviving mutant is a missed scenario or a weak assertion)
- Problem: `handlePointerCancel` resets `isDragActive.current = false`, so the non-passive `touchmove` guard (`:60-62`) stops cancelling scroll once the browser cancels the pointer. Stryker's mutant `false` → `true` on that line survives: no test fires `touchmove` after `pointercancel`. `DayTrack.drag.test.tsx:31-39` checks only the release path (`pointerUp`).
- Impact: a regression that leaves the guard on after `pointercancel` would pass CI. After such a cancel (NG3, e.g. a system edge swipe), every later `touchmove` on that track, including a vertical swipe that starts on it, would have its default cancelled. The page would stop scrolling from that track, which breaks FR2 ("a touch gesture that is not a drag … still scrolls the page") and FR5.
- Fix: in `views/shared/DayTrack.drag.test.tsx`, add a case (or turn `:31-39` into an `it.each` over `"pointerUp"` and `"pointerCancel"`). Do a touch `pointerDown` at x 100, then a `pointerMove` to x 150 (`SELECT`), then fire the end event, and assert `fireEvent.touchMove(slider)` returns `true`. Then re-run `npx stryker run --mutate 'src/views/shared/useDayTrackDrag.ts'` to confirm the mutant is killed.
- Fix risk: none. It adds a test only and uses the fixture and `pointer()` helper the file already has.
- Status: fixed
- Resolution: DayTrack.drag.test.tsx touchmove guard test is now an it.each over pointerUp and pointerCancel; Stryker on useDayTrackDrag.ts is 100% (the line 123 mutant is killed).

### R3 — SUGGESTION — Drag steps declare their own percent-per-fraction constants
- Location: `packages/client/src/test/features/time_selection/steps/time_selection_drag_unit.steps.tsx:25`
- Rule: `.claude/rules/code-style.md` ("Is any value repeated in 2+ places? → Must be a constant"); review instruction "Reinvention"
- Problem: the unit steps declare `const PERCENT_PER_FRACTION = 100;`, which repeats the exported `PERCENT_PER_FRACTION` of `constants/timeSelection.ts` (the constant `formatPercent` uses to draw the handle the steps read back). `time_selection_drag_e2e.steps.ts:33` declares the same value again as `PERCENT = 100`.
- Impact: there are two more owners of the fraction-to-percent factor. The steps turn the handle's `left` back into a fraction with their own copy, not the factor the view uses, so they would drift apart if the drawing factor ever changed.
- Fix: delete both local constants. Import `PERCENT_PER_FRACTION` from `@/constants` in `time_selection_drag_unit.steps.tsx` and in `time_selection_drag_e2e.steps.ts`, and use it at `time_selection_drag_unit.steps.tsx:114,134` and `time_selection_drag_e2e.steps.ts:183`.
- Fix risk: none. Both step files already import through the `@/` alias (`@/test/workCounters`, `@/test/e2e/withoutPointerEvents`), and `@/constants` is a pure module with no DOM or Vitest dependency, so it also loads in playwright-bdd.
- Status: fixed
- Resolution: both step files now import PERCENT_PER_FRACTION from @/constants and drop their local copies; time_selection_drag_unit.steps.tsx passes.

## Verdict

Ready, with two WARNINGs to fix before merge. The production code meets FR1–FR5, NFR-P1, NFR-A1 and NFR-R1 and their UX criteria, and mutation is at 98.92%. All 16 tasks are done in substance, so nothing blocks at CRITICAL. R1 (a handoff command in tasks.md that fails, and an H1 README section without **Files:** and out of the `handoff.md` field order) and R2 (an untested reset of the scroll guard after a cancel) should be fixed by the fix-code stage. R3 is optional.
