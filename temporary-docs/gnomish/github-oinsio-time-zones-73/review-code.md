# Review: fix-day-track-handle-overlap-and-end-of-day

## Summary

| Item | Value |
|---|---|
| Tasks verified | 15/16 |
| Requirements traced | 39/41 |
| CRITICAL | 1 |
| WARNING | 0 |
| SUGGESTION | 0 |

## Tasks

- ✅ 1.1 — `TRACK_END_BEFORE_DAY_END_MINUTES = 1` with the FR1 comment at `packages/client/src/constants/timeSelection.ts:12-14`, re-exported at `packages/client/src/constants/index.ts:67`.
- ✅ 2.1 — `packages/client/src/model/dayTrack.test.ts:92` (1439), `:127` (1379), `:136` (1499), fraction rows 0.99/0.996/1/7 at `:112-117`, move rows DAY_END, NEXT_STEP from 18:45 and 18:59, HOUR_FORWARD from 18:30, PREVIOUS_STEP and HOUR_BACK from 18:59 at `:147-154`.
- ✅ 2.2 — `getTrackEndMinutes` at `packages/client/src/model/dayTrack.ts:69-71`, used by the clamp at `:77` and by `TrackMove.DAY_END` at `:106`; module JSDoc FR1–FR3 at `:16`; `packages/client/src/model/index.ts:35` exports only the new name (`grep getLastTrackStepMinutes src` prints nothing).
- ✅ 3.1 — `packages/client/src/presenter/dayTrack.test.ts:71` expects 1439; `packages/client/src/presenter/dayTrack.ts:105` sets `maxMinutes: getTrackEndMinutes(day)`, JSDoc at `:27`; fixtures 1439 at `packages/client/src/views/shared/dayTrackFixture.tsx:11` and `packages/client/src/views/shared/LocationRow.test.tsx:101`.
- ✅ 4.1 — bar box mocked in `packages/client/src/views/shared/dayTrackFixture.tsx:51-55` (`BAR_BOX`/`WIDE_BOX` at `:35-36`), `DayTrack.input.test.tsx:78-94` (left edge and zero-width bar), `DayTrack.outside.test.tsx:11-30` (`it.each` left of / right of the bar → 0 / 1), `DayTrack.legacy.test.tsx:29-33`, `time_selection_legacy_tap.steps.tsx:54-58`.
- ✅ 4.2 — inset box `absolute inset-x-0 inset-y-0 md:inset-x-[22px]` at `packages/client/src/views/shared/DayTrack.tsx:147-150` wrapping bar and handle; hour-label row `md:mx-[22px]` at `:168`; `selectAt` reads `barElement` at `:63-69`; JSDoc FR1, FR4, UX1 at `:52-53`.
- ✅ 5.1 — `time_selection_select_time.feature:22-36` (0.99/0.996/1.0 rows, `@FR1`), `:56-71` (`end of day` 18:59, `@FR2`), `:87-94` (18:59, `@FR2`), new outlines at `:97-108` (`@FR1 @UX2`) and `:111-125` (`@FR2`); steps moved to `steps/selectTimeSteps.ts` and `steps/trackEndScenarios.ts`, so `time_selection_select_time.steps.tsx` is 186 lines.
- ✅ 5.2 — `TRACK_END_BEFORE_DAY_END_MINUTES` in `steps/dayBounds.ts:13` (used by `timeSelectionWorld.tsx:188-194`), `steps/time_selection_day_track.steps.tsx:74`, `home_location/steps/homeLocationWorld.ts:109`; tags at `time_selection_day_track.feature:13`, `time_selection_moment.feature:46` and the matching comments at `time_selection_day_track.steps.tsx:62`, `time_selection_moment.steps.tsx:109`; `grep -rn "maxMinutes + TRACK_STEP_MINUTES" src` prints nothing.
- ✅ 5.3 — `time_selection_e2e.feature:17-25` (Almaty `23:59`, `@FR1 @UX2`), `:41-57` (`End | 1439`, `@FR2`), `:66-72` (`0 to 1439`, `@FR3`), `:74` (`@NFR-A1`), new "End of the day on the slider" at `:89-96`.
- ✅ 5.4 — outline at `time_selection_layout_e2e.feature:92-106` (768/1024 × Home/End, `@FR4 @UX1`), step at `steps/time_selection_layout_e2e.steps.ts:110-133` (hit area inside slider, 12 px clearance from time and menu), `768` Examples block at `time_selection_layout_e2e.feature:69-72` (`@NFR-R1`).
- ❌ 5.5 — the tag is present at `packages/client/src/test/features/locations/locations_ui_e2e.feature:130`, but no screenshot baseline was re-approved: `git diff <task start>^ --name-only` lists no file under `src/test/features/__screenshots__/`, the last commit touching that folder is #72 (before this branch), and the implement traces never ran `--update-snapshots`. See R1.
- ✅ 5.6 — measured in this review: 100% on all three files (Mutation section).
- ✅ 6.1 — the loop run from `packages/client/` printed nothing in this review.
- ✅ 6.2 — `handoff/H1-glossary-track-end.patch` adds **Track end** and rewords Time selection, Track value and Track move; `handoff/README.md` has the H1 section; `git apply --check` passes.
- ✅ 6.3 — CI is green for this branch (stage precondition); `pnpm --filter @time-zones/client test:bdd` runs in CI (`.github/workflows/ci.yml:58`).
- ✅ 6.4 — both greps printed nothing in this review.

## Requirements

- ✅ FR1 — clamp to the track end at `packages/client/src/model/dayTrack.ts:77`; tested by `model/dayTrack.test.ts:109-122`, `time_selection_select_time.feature:22-36` and `:97-108`, `time_selection_e2e.feature:17-25`.
- ✅ FR2 — `TrackMove.DAY_END` → `getTrackEndMinutes` at `model/dayTrack.ts:106`; previous step from 1439 gives 1425 through the existing ceil step; tested by `model/dayTrack.test.ts:147-154`, `time_selection_select_time.feature:56-71`, `:87-94`, `:111-125`, `time_selection_e2e.feature:41-57`.
- ✅ FR3 — `maxMinutes: getTrackEndMinutes(day)` at `presenter/dayTrack.ts:105`, rendered as `aria-valuemax` at `views/shared/DayTrack.tsx:134`; tested by `presenter/dayTrack.test.ts:71`, `model/dayTrack.test.ts:92,127,136`, `time_selection_day_track.feature:14` (23/25-hour days), `time_selection_e2e.feature:66-72` and `:89-96`.
- ✅ FR4 — inset box and label margin at `views/shared/DayTrack.tsx:147-150,168`, bar-relative `selectAt` at `:65-73`; tested by `DayTrack.outside.test.tsx`, `DayTrack.input.test.tsx:78-94`, E2E `time_selection_layout_e2e.feature:92-106`; labels under the bar's edges by the existing "every track shows 5 hour labels under its bar" step (`steps/time_selection_labels_e2e.steps.ts:62-66`, measured against `[data-day-track-bar]`); handle centre against the bar at `:80-85`.
- ✅ NFR-P1 — no formatter or lookup added (`getTrackEndMinutes` is arithmetic); "50 rows within the time-selection budget" tagged at `time_selection_moment.feature:46` and still passes.
- ✅ NFR-A1 — `time_selection_e2e.feature:74-87` tagged `@NFR-A1`; slider keeps `h-11` and `tabIndex={0}` (`DayTrack.tsx:131,145`); touch-target and visible-focus scenarios unchanged and green.
- ✅ NFR-R1 — 768 px Examples added to "Tracks fit a <width> px wide screen" (`time_selection_layout_e2e.feature:58-72`), covering 320, 768 and 2560 px.
- ❌ NFR-R2 — the requirement says the 1024 px screenshots "are re-approved with the new track geometry"; none was (see 5.5 and R1). Only the tag exists at `locations_ui_e2e.feature:130`.
- ✅ UX1 — `time_selection_layout_e2e.feature:92-106` asserts ≥ 12 px between the visible handle and the time and the menu at 768/1024 px, both ends.
- ✅ UX2 — `time_selection_e2e.feature:17-25` (drag Moscow to 100%, Almaty reads `23:59`) and `time_selection_select_time.feature:97-108`.
- ✅ M1 — the four rows of `time_selection_layout_e2e.feature:101-106` assert containment and 12 px clearance (`steps/time_selection_layout_e2e.steps.ts:122-132`).
- ✅ M2 — right end → 23:59 on 23- and 25-hour days (`time_selection_select_time.feature:97-108`) and 24 hours (`:35`); maxima 1379/1439/1499 at `model/dayTrack.test.ts:92,127,136`.
- ✅ M3 — measured in this review: 100% on `model/dayTrack.ts`, `presenter/dayTrack.ts`, `views/shared/DayTrack.tsx`.
- ✅ M4 — the traceability loop of task 6.1 printed nothing.
- ✅ Scenario: Dragging one track moves every card — `time_selection_select_time.feature:6`, `time_selection_e2e.feature:7`.
- ✅ Scenario: Selections snap to quarter hours and stay inside the day — `time_selection_select_time.feature:22-36` with the 0.52/0.99/0.996/1.0/0 rows.
- ✅ Scenario: The right end reaches the last minute of 23- and 25-hour days — `time_selection_select_time.feature:97-108`, steps `steps/trackEndScenarios.ts:24-39`; the date is fixed by the Given instant and the clamp keeps the selection inside that day, so the time `23:59` is the meaningful assertion.
- ✅ Scenario: Selection on a 23-hour day — `time_selection_select_time.feature:39` (unchanged; the middle fraction is not near the clamp).
- ✅ Scenario: A malformed instant changes nothing — `time_selection_select_time.feature:49`.
- ✅ Scenario: A tap selects a time without Pointer Events — `time_selection_legacy_tap.feature:6`, step now mocks the bar (`time_selection_legacy_tap.steps.tsx:54-58`).
- ✅ Scenario: A finger tap keeps the slider accessible without Pointer Events — `time_selection_legacy_touch_e2e.feature:6`.
- ✅ Scenario: A click adds nothing where Pointer Events exist — `time_selection_legacy_tap.feature:17`.
- ✅ Scenario: Keys from a pinned quarter hour — `time_selection_select_time.feature:56-71` (`end of day` 18:59) and `time_selection_e2e.feature:42-57` (`End | 1439`).
- ✅ Scenario: Keys from a live moment between steps — `time_selection_select_time.feature:75`.
- ✅ Scenario: Keys stop at the ends of the day — `time_selection_select_time.feature:87-94` (from 18:59, next step stays 18:59).
- ✅ Scenario: Keys around the track end — `time_selection_select_time.feature:111-125`, four rows as in the spec.
- ✅ Scenario: No accessibility violations with tracks — `time_selection_e2e.feature:75`.
- ✅ Scenario: Slider name, range and value — `time_selection_e2e.feature:67-72` (`0 to 1439`).
- ✅ Scenario: End of the day on the slider — `time_selection_e2e.feature:89-96` (value 1439, `23:59, Sun, Mar 8`).
- ✅ Scenario: Keyboard moves every card — `time_selection_e2e.feature:28`.
- ✅ Scenario: Visible focus — `time_selection_e2e.feature:60`.
- ✅ Scenario: Track under the text on a narrow screen — `time_selection_layout_e2e.feature:7`.
- ✅ Scenario: Track beside the time on a wide screen — `time_selection_layout_e2e.feature:15`.
- ✅ Scenario: Handle centre matches the instant — `time_selection_layout_e2e.feature:33`, measured against the bar (`steps/time_selection_labels_e2e.steps.ts:80-85`).
- ✅ Scenario: Drag without scrolling or reordering — `time_selection_e2e.feature:17-25` (Almaty `23:59`).
- ✅ Scenario: The handle stays clear of the time and the menu — `time_selection_layout_e2e.feature:92-106`.
- ✅ Scenario: A vertical swipe on a track scrolls without selecting a time — `time_selection_touch_e2e.feature:6`.
- ✅ Scenario: A finger tap on a track selects a time — `time_selection_touch_e2e.feature:18`.
- ✅ Scenario: Touch targets — `time_selection_layout_e2e.feature:46`.
- ✅ Scenario: Tracks fit narrow and wide screens — `time_selection_layout_e2e.feature:58-72` (320, 2560, 768).
- ⚠️ Scenario: Screenshots show the tracks — the outline at `locations_ui_e2e.feature:132` runs and passes, but its 1024 px baselines still show the pre-change geometry and pass only through the `maxDiffPixelRatio: 0.025` tolerance (`playwright.bdd.config.ts:32,76`). See R1.

## Mutation

Run in this review, one run, from `packages/client/`:
`npx stryker run --mutate 'src/model/dayTrack.ts,src/presenter/dayTrack.ts,src/views/shared/DayTrack.tsx'`.

| File | Score | Killed | Survived | No coverage | Errors |
|---|---|---|---|---|---|
| `src/model/dayTrack.ts` | 100.00% | 32 | 0 | 0 | 0 |
| `src/presenter/dayTrack.ts` | 100.00% | 24 | 0 | 0 | 0 |
| `src/views/shared/DayTrack.tsx` | 100.00% | 63 | 0 | 0 | 1 |

`src/constants/timeSelection.ts` and `src/constants/index.ts` were not measured: the change adds only a numeric literal and a re-export, which Stryker does not mutate.

## Findings

### R1 — CRITICAL — 1024 px screenshot baselines were not re-approved (task 5.5 ticked, NFR-R2 unmet)
- Location: `packages/client/src/test/features/locations/locations_ui_e2e.feature:130`
- Rule: `.claude/rules/test-planning.md` ("Visual regression … go into CI pipeline"); requirement NFR-R2 and task 5.5 of the change
- Problem: NFR-R2 says "The approved screenshots at 1024 px in both themes are re-approved with the new track geometry", and task 5.5 (ticked) says "Re-approve the baselines once". The branch only adds the `@fix-day-track-handle-overlap-and-end-of-day @NFR-R2` tag at line 130. No file under `packages/client/src/test/features/__screenshots__/` changed on this branch; the last commit that touched that folder is #72, before the task started. Yet from 768 px `DayTrack.tsx:149` now insets the bar and handle by 22 px on each side and `:168` insets the hour labels, so every 1024 px "list", "pinned", "calendar" and "time-selected" screenshot renders differently from its baseline. The check stays green only because `playwright.bdd.config.ts:32` allows `maxDiffPixelRatio: 0.025`. Note: on Playwright 1.61 (`package.json:49`) a bare `--update-snapshots` rewrites only failing screenshots, so the command written in task 5.5 would leave these baselines untouched even if it had been run.
- Impact: the approved images still show the handle overlapping the time — the defect this change fixes. A later change that drops the inset (or reintroduces the overlap) differs from the baseline by less than before and passes the visual check, so the visual regression guard for FR4/UX1 approves the bug. NFR-R2 is not met and task 5.5 is ticked but not done.
- Fix: from `packages/client/`, on Linux (the environment the baselines were taken in), run `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "Screenshot of the .* at 1024 px" --update-snapshots=all`. Then check that `git status --short src/test/features/__screenshots__ | grep -v -- "-at-1024-px-"` prints nothing, revert (`git checkout -- <file>`) any rewritten 1024 px baseline whose image shows no visible change (pure byte churn), and commit the new 1024 px baselines for both `chromium` and `mobile-chrome`. Finally run `npx playwright test -c playwright.bdd.config.ts --grep "Screenshot of the"` without the flag and see it pass.
- Fix risk: `=all` rewrites every matching 1024 px baseline, including states where the track change may not be visible; that churn is avoided by reverting the unchanged-looking files as described. Baselines rendered on a machine whose fonts or rendering differ from CI would make the screenshot scenarios fail in CI, so they must be produced in the same Linux/Chromium setup CI uses. No production code changes.
- Status: fixed
- Resolution: re-approved the 1024 px baselines for both chromium and mobile-chrome with --update-snapshots=all; kept the 20 light/dark files of the list, pinned, time-selected, travelling and calendar states that show tracks, reverted the 1024 px baselines of states without tracks as byte churn; the "Screenshot of the" scenarios pass (104) unflagged.

## Verdict

Not ready — blocking: R1. The production change (track end and inset) is correct, traced and fully mutation-tested; only the screenshot re-approval of NFR-R2 / task 5.5 is missing.
