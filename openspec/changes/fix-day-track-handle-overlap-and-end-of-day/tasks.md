# Tasks

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter`, `git` or say "from the repository root". "design Dn" refers to `design.md`.

- **Running tests:** one command at a time, never in the background. Stryker runs only with `--mutate`, at most 5 files per run, and its report is `reports/mutation/mutation-report.json`.
- **Time in tests:** only `fakeClock(instant, timeZone)` of `@/lib/temporal`. Never `vi.setSystemTime()` or `vi.useFakeTimers()`.
- **E2E runs:** every Playwright command after a `.feature` edit starts with `npx bddgen -c playwright.bdd.config.ts && ` (the order of the `test:bdd` script).
- **Traceability:** every new or changed test, step file and feature carries `fix-day-track-handle-overlap-and-end-of-day`:
  - `@fix-day-track-handle-overlap-and-end-of-day @FR-X` tags above scenarios, and `// @fix-day-track-handle-overlap-and-end-of-day @FR-X` before `f.Scenario`;
  - `// Verifies NFR-X of fix-day-track-handle-overlap-and-end-of-day` in E2E steps;
  - `Implements FR-X of fix-day-track-handle-overlap-and-end-of-day` in the JSDoc of changed production code.
- **Glossary:** use the terms of `docs/glossary/time-selection.md` and the new **track end** of the proposal. Never "slider" for the day track outside its accessible role, and never "thumb" or "knob" for the handle.
- **File size:** every file stays under 200 lines.

## 1. Constant (no TDD: constants)

- [ ] 1.1 Add `TRACK_END_BEFORE_DAY_END_MINUTES = 1` to `constants/timeSelection.ts`, with the comment `// Implements FR1 of fix-day-track-handle-overlap-and-end-of-day (D1).`, and re-export it from `constants/index.ts` (design D1). Verify with `pnpm --filter @time-zones/client typecheck`.

## 2. Model: the track end (TDD)

- [ ] 2.1 RED: in `model/dayTrack.test.ts`, replace the expectations for the last step with the track end (design D1, FR1–FR3):
  - `getTrackEndMinutes` gives 1439 for Almaty's day, 1379 on the 23-hour day and 1499 on the 25-hour day;
  - `getInstantAtTrackFraction` gives `2026-03-08T18:45:00Z` for 0.99, and `2026-03-08T18:59:00Z` for 0.996, 1 and values above 1;
  - `TrackMove.DAY_END` gives `18:59:00Z`, `NEXT_STEP` from `18:45:00Z` and from `18:59:00Z` give `18:59:00Z`, `HOUR_FORWARD` from `18:30:00Z` gives `18:59:00Z`, `PREVIOUS_STEP` from `18:59:00Z` gives `18:45:00Z`, and `HOUR_BACK` from `18:59:00Z` gives `18:00:00Z`.

  Run `npx vitest run src/model/dayTrack.test.ts` and see it fail.
- [ ] 2.2 GREEN: in `model/dayTrack.ts`, rename `getLastTrackStepMinutes` to `getTrackEndMinutes`, returning `day.lengthMinutes - TRACK_END_BEFORE_DAY_END_MINUTES`. Clamp `getInstantAtMinutes` to it and use it for `TrackMove.DAY_END`. Export the new name from `model/index.ts` instead of the old one, and add `FR1, FR2, FR3 of fix-day-track-handle-overlap-and-end-of-day` to the module JSDoc. Verify `npx vitest run src/model/dayTrack.test.ts` passes; task 6.4 later checks that the old name is gone.

## 3. Presenter: slider maximum (TDD)

- [ ] 3.1 RED then GREEN: in `presenter/dayTrack.test.ts`, expect `maxMinutes` 1439 for Almaty. Run it and see it fail. Then set `maxMinutes: getTrackEndMinutes(day)` in `presenter/dayTrack.ts` and change its JSDoc to "`aria-valuemax`: the track end, the last minute of the reference day" (FR3). In the same task, change the `maxMinutes: 1425` fixtures in `views/shared/dayTrackFixture.tsx` and `views/shared/LocationRow.test.tsx` to 1439. Verify with `npx vitest run src/presenter/dayTrack.test.ts`, then `npx vitest run src/views/shared` (one at a time).

## 4. View: track inset from 768 px (TDD)

- [ ] 4.1 RED: in `views/shared/DayTrack.input.test.tsx`, mock `getBoundingClientRect` on the bar (`[data-day-track-bar]`) instead of the slider. The test "should measure the position from the left edge of the track" then mocks the bar at `{ left: 100, width: TRACK_WIDTH }` and gives the slider a different box, so it fails while `selectAt` still reads the slider. Add `it.each` cases: a press left of the bar selects 0, a press right of the bar selects 1 (design D2, FR4). Keep "should select nothing on a track without width", now with a zero-width bar. Move `dayTrackFixture.tsx`, `DayTrack.legacy.test.tsx` and the step `time_selection_legacy_tap.steps.tsx` to the bar's box as well. Run `npx vitest run src/views/shared/DayTrack.input.test.tsx` and see it fail.
- [ ] 4.2 GREEN: in `views/shared/DayTrack.tsx`, wrap the bar and the handle in one box, `absolute inset-y-0 inset-x-0 md:inset-x-[22px]` (half of the handle's `h-11 w-11`). Keep the handle's `left` percentage relative to that box. Give the hour-label row `md:mx-[22px]`. Make `selectAt` measure the bar through a `ref` (design D2). Extend the component JSDoc with `Implements FR1, FR4, UX1 of fix-day-track-handle-overlap-and-end-of-day`. Verify, one at a time: `npx vitest run src/views/shared`, then `npx vitest run src/test/features/time_selection/steps/time_selection_legacy_tap.steps.tsx`.

## 5. Behaviour features

- [ ] 5.1 Unit BDD, `test/features/time_selection/time_selection_select_time.feature` and `steps/time_selection_select_time.steps.tsx` (FR1, FR2):
  - in "Selections snap to quarter hours and stay inside the day", change the `1.0` row to `2026-03-08T18:59:00Z`, add rows `0.99 → 2026-03-08T18:45:00Z` and `0.996 → 2026-03-08T18:59:00Z`, and add the tags `@fix-day-track-handle-overlap-and-end-of-day @FR1`;
  - in "Keys from a pinned quarter hour", change `end of day` to `2026-03-08T18:59:00Z`;
  - in "Keys stop at the ends of the day", use `2026-03-08T18:59:00Z`. Add the tags `@fix-day-track-handle-overlap-and-end-of-day @FR2` to both;
  - add "The right end reaches the last minute of 23- and 25-hour days" (`America/New_York`, `2026-03-08` and `2026-11-01`: the New York card shows `23:59`; `@FR1 @UX2`);
  - add "Keys around the track end" with the 4 rows of the spec delta (`@FR2`).

  If the steps file passes 200 lines, move the new scenarios' steps into a helper next to it. Verify `npx vitest run src/test/features/time_selection/steps/time_selection_select_time.steps.tsx`.
- [ ] 5.2 Unit BDD, day length and work bounds (FR3, NFR-P1): in `test/features/time_selection/steps/timeSelectionWorld.tsx` (`dayBoundsOf`), `test/features/time_selection/steps/time_selection_day_track.steps.tsx` ("Days of 23 and 25 hours") and `test/features/home_location/steps/homeLocationWorld.ts` (`thenTrackDay`), derive the day length as `track.maxMinutes + TRACK_END_BEFORE_DAY_END_MINUTES` instead of `track.maxMinutes + TRACK_STEP_MINUTES`, and replace the now unused `TRACK_STEP_MINUTES` import with the new constant (design D3). Add `@fix-day-track-handle-overlap-and-end-of-day @FR3` above "Days of 23 and 25 hours" in `time_selection_day_track.feature`, and `@fix-day-track-handle-overlap-and-end-of-day @NFR-P1` above "50 rows within the time-selection budget" in `time_selection_moment.feature`, with the matching `//` tag comments in `steps/time_selection_day_track.steps.tsx` and `steps/time_selection_moment.steps.tsx`. Verify, one at a time: `npx vitest run src/test/features/time_selection/steps/time_selection_day_track.steps.tsx`, then `npx vitest run src/test/features/time_selection`, then `npx vitest run src/test/features/home_location/steps/home_location_reference_unit.steps.tsx`. Finally `grep -rn "maxMinutes + TRACK_STEP_MINUTES" src` prints nothing.
- [ ] 5.3 E2E, `time_selection_e2e.feature` (FR1, FR2, FR3, NFR-A1, UX2):
  - "Drag without scrolling or reordering": Almaty reads `23:59`, tags `@fix-day-track-handle-overlap-and-end-of-day @FR1 @UX2`;
  - "Keys from a pinned quarter hour": `End | 1439`, tags `@fix-day-track-handle-overlap-and-end-of-day @FR2`;
  - "Slider name, range and value": `0 to 1439`, tags `@fix-day-track-handle-overlap-and-end-of-day @FR3`;
  - add "End of the day on the slider" (End gives value 1439 and value text `23:59, Sun, Mar 8`; `@FR3`), reusing the existing key and slider steps;
  - add `@fix-day-track-handle-overlap-and-end-of-day @NFR-A1` above "No accessibility violations with tracks".

  Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "@fix-day-track-handle-overlap-and-end-of-day"`.
- [ ] 5.4 E2E layout, `time_selection_layout_e2e.feature` and `steps/time_selection_layout_e2e.steps.ts` (FR4, UX1, NFR-R1):
  - add the outline "The handle stays clear of the time and the menu" with rows 768/1024 × start/track end, tags `@fix-day-track-handle-overlap-and-end-of-day @FR4 @UX1`. The handle is moved with Home or End on the focused slider;
  - the new step asserts that the handle's box (`handleOf`) lies inside the slider's box (`sliderOf`), within 1 px. It also asserts that the visible handle (`visibleHandleOf`) starts at least 12 px right of the time button (`timeTextOf`) and ends at least 12 px left of the location menu button (`menuButton` of `locations/steps/locationsE2eHelpers.ts`);
  - add a `768` row to "Tracks fit a <width> px wide screen" as a second `Examples:` block tagged `@fix-day-track-handle-overlap-and-end-of-day @NFR-R1`, so the outline covers 320, 768 and 2560 px (spec "Tracks fit narrow and wide screens").

  The steps carry `// Verifies FR4, UX1 of fix-day-track-handle-overlap-and-end-of-day`; move helpers into `timeSelectionE2eHelpers.ts` if the steps file passes 200 lines. Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "@fix-day-track-handle-overlap-and-end-of-day"`, and that the existing "Handle centre matches the instant" and "Touch targets" scenarios still pass: `npx playwright test -c playwright.bdd.config.ts --grep "Handle centre|Touch targets"`.
- [ ] 5.5 Screenshots (NFR-R2): add `@fix-day-track-handle-overlap-and-end-of-day @NFR-R2` above the outline "Screenshot of the <state> state at <width> px in the <theme> theme" in `test/features/locations/locations_ui_e2e.feature`. Re-approve the baselines once, in Linux: `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "Screenshot of the .* at 1024 px" --update-snapshots`. Then verify that `git status --short src/test/features/__screenshots__ | grep -v -- "-at-1024-px-"` prints nothing, so no 375 px baseline changed. Finally check that `npx playwright test -c playwright.bdd.config.ts --grep "Screenshot of the"` passes without the flag.
- [ ] 5.6 Mutation (M3): `npx stryker run --mutate 'src/model/dayTrack.ts,src/presenter/dayTrack.ts,src/views/shared/DayTrack.tsx'`. Read `reports/mutation/mutation-report.json`: the score of the three files is at least 95% (minimum acceptable 90%). Kill survivors with tests; mark layout-only class strings with a `// Stryker disable` comment that names the E2E scenario covering them, as `DayTrack.tsx` already does for `LABEL_ALIGNMENT_CLASS_NAMES`.

## 6. Handoff patch and final verification

- [ ] 6.1 Traceability (M4): this loop, run from `packages/client/`, must print nothing.

  ```
  for id in FR1 FR2 FR3 FR4 NFR-P1 NFR-A1 NFR-R1 NFR-R2 UX1 UX2; do
    grep -rqE "fix-day-track-handle-overlap-and-end-of-day.*(^|[^A-Za-z0-9-])@?$id([^0-9]|$)|(^|[^A-Za-z0-9-])@?$id([^0-9]|$).*fix-day-track-handle-overlap-and-end-of-day" src || echo "missing $id"
  done
  ```
- [ ] 6.2 Handoff H1: write `openspec/changes/fix-day-track-handle-overlap-and-end-of-day/handoff/H1-glossary-track-end.patch` and its section in `handoff/README.md`, following `.gnomish/stages/specify/handoff.md`. The patch edits `docs/glossary/time-selection.md`:
  - it adds **Track end** after **Track value**, as worded in the proposal ("What Changes");
  - **Time selection** says "clamped between the start of the reference day and the track end";
  - **Track value** ranges "from 0 to the track end";
  - **Track move** ends with "the day's start or the track end".

  The archived `add-wall-time-input-with-hint/handoff/H1-glossary-wall-time-input.patch` is not on `main` yet. It edits lines 18–20 of the same file, and this patch edits lines 8–12 only, so either applies before the other. Verify from the repository root, one command at a time:
  - `git apply --check openspec/changes/fix-day-track-handle-overlap-and-end-of-day/handoff/H1-glossary-track-end.patch`;
  - the scratch check `scratch=$(mktemp -d) && git archive HEAD docs | tar -x -C "$scratch" && (cd "$scratch" && git apply "$OLDPWD/openspec/changes/archive/2026/10/2026-10-30-add-wall-time-input-with-hint/handoff/H1-glossary-wall-time-input.patch" && git apply "$OLDPWD/openspec/changes/fix-day-track-handle-overlap-and-end-of-day/handoff/H1-glossary-track-end.patch") && test "$(grep -c "Track end" "$scratch/docs/glossary/time-selection.md")" -ge 1 && ! grep -q "getLastTrackStepMinutes" "$scratch/docs/glossary/time-selection.md"` exits 0. It is one command, so `$scratch` is still set when the greps run: **Track end** is in the patched glossary and `getLastTrackStepMinutes` is not;
  - `git status --short docs` prints nothing.
- [ ] 6.3 Run each command alone, in this order: `pnpm --filter @time-zones/client typecheck`, `pnpm --filter @time-zones/client lint`, `pnpm --filter @time-zones/client test`, `pnpm run build`. Then run `pnpm --filter @time-zones/client test:bdd` once, alone, and fix every remaining scenario that still expects 23:45 or 1425.
- [ ] 6.4 Glossary check (`.claude/rules/glossary.md`, "Review checklist"): `grep -rn "getLastTrackStepMinutes\|last step of the reference day" src` prints nothing, and `grep -rniE "\b(thumb|knob|scrubber|timeline)\b" src/views/shared/DayTrack.tsx src/model/dayTrack.ts src/presenter/dayTrack.ts` prints nothing.

## Human follow-up

The operator reviews this item on the pull request the deliver stage opens, then applies the patch.

- H1 (FR1, FR2, FR3): apply `handoff/H1-glossary-track-end.patch`. It adds **Track end** to `docs/glossary/time-selection.md` (*Code:* `getTrackEndMinutes`) and aligns **Time selection**, **Track value** and **Track move** with it.
  Why manual: the implement stage writes only under `packages/` and the change's `handoff/` folder, and the glossary lives in `docs/glossary/`.
  Automated part: `git apply --check` and the scratch check in task 6.2. The owner it names is covered by the tests of sections 2–5.
