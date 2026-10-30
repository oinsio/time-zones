# Specs review: fix-day-track-handle-overlap-and-end-of-day

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 20/20 |
| Contradictions | 1 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 2 |

## Freshness

- ✅ `model/dayTrack.ts` is 106 lines. `getLastTrackStepMinutes(day)` returns `day.lengthMinutes - TRACK_STEP_MINUTES` (`packages/client/src/model/dayTrack.ts:66-68`). The private `getInstantAtMinutes` clamps to `[0, getLastTrackStepMinutes(day)]` (`:74`). `getInstantAtTrackFraction` rounds to `TRACK_STEP_MINUTES` (`:83`). `TrackMove.DAY_END` targets `getLastTrackStepMinutes(day)` (`:103`). (design.md:7)
- ✅ `model/index.ts:34` exports `getLastTrackStepMinutes`. Its only production consumer is `presenter/dayTrack.ts:8,105`. (design.md:7-8)
- ✅ The JSDoc in `presenter/dayTrack.ts:27` reads "`aria-valuemax`: the last step of the reference day.", and `presentDayTrack` sets `maxMinutes: getLastTrackStepMinutes(day)` (`:105`). (design.md:8)
- ✅ `constants/timeSelection.ts:2,9-11` has `TRACK_STEP_MINUTES = 15`, `MIN_TRACK_FRACTION`, `MAX_TRACK_FRACTION` and `TRACK_VALUE_MIN_MINUTES`. `constants/index.ts:60-70` re-exports them. `TRACK_END_BEFORE_DAY_END_MINUTES` does not exist yet. (design.md:9)
- ✅ `views/shared/DayTrack.tsx` is 174 lines. The slider is `relative h-11 w-full` (`:141`), the bar is `absolute inset-x-0` (`:145`), and the handle is `h-11 w-11 -translate-x-1/2` with `left: formatPercent(track.fraction)` and a visible `h-7 w-7 … md:h-8 md:w-8` circle (`:150-153`). `selectAt` measures `event.currentTarget.getBoundingClientRect()` (`:63`). The hour-label row is `hidden … md:block` and places labels by percent (`:158-166`). (design.md:10)
- ✅ Row layout: `ZoneRowContent.tsx:67-125` renders the place and time column, then `DayTrack`, whose wrapper carries `md:flex-1` (`DayTrack.tsx:123`). `LocationRow.tsx:134,169` uses `gap-x-3` and puts `LocationMenu` after `ZoneRowContent`. `HereEntryRow.tsx:39-60` uses the same gap and `ZoneRowContent`, with nothing after it. (design.md:11)
- ✅ The tests that read the old end exist as named: `model/dayTrack.test.ts:91,124,135,146,149` (1425, 1365, 1485, `18:45`), `presenter/dayTrack.test.ts:70`, `views/shared/dayTrackFixture.tsx:10` and `views/shared/LocationRow.test.tsx:100` (`maxMinutes: 1425`). The day length is derived as `track.maxMinutes + TRACK_STEP_MINUTES` in `timeSelectionWorld.tsx:190` (`dayBoundsOf`), `time_selection_day_track.steps.tsx:73` and `homeLocationWorld.ts:108` (`thenTrackDay`). The feature files contain `time_selection_select_time.feature:33,70,87-92` and `time_selection_e2e.feature:25,57,71`. A grep for `1425|23:45|18:45|1365|1485` under `src` finds no other test. (design.md:12)
- ✅ None of the three day-length step files uses `TRACK_STEP_MINUTES` other than at its import and at the cited line, so the import swap in task 5.2 leaves no unused import. (design.md:42, tasks.md:121)
- ✅ Exactly `DayTrack.input.test.tsx:79,89`, `DayTrack.legacy.test.tsx:28`, `dayTrackFixture.tsx:48` and `time_selection_legacy_tap.steps.tsx:53` mock the slider's `getBoundingClientRect`. The Here-entry tests (`HereEntryRow.test.tsx:96`, `locations_here_entry_unit.steps.tsx:118`) use keys or attributes only. (design.md:13, tasks.md:108)
- ✅ The E2E helpers exist: `barOf`, `pointOnBar`, `visibleHandleOf`, `handleOf`, `sliderOf` and `timeTextOf` in `timeSelectionE2eHelpers.ts`, and `menuButton` in `locations/steps/locationsE2eHelpers.ts:72`. Every E2E pointer step (`time_selection_pointer_e2e.steps.ts:34,47`, `locations_here_entry_e2e.steps.ts:80`) presses at a point on the bar, so the inset does not shift them. (design.md:14)
- ✅ "Handle centre matches the instant" measures against the bar (`time_selection_labels_e2e.steps.ts:80-84`). "Labels only on wide screens" already asserts that the first label starts at or after `bar.x` and the last ends at or before the bar's right edge (`:61-66`), so the label row must follow the inset bar. (design.md:33)
- ✅ The E2E device time zone is `Asia/Almaty` (`playwright.bdd.config.ts:39`), so the reference day of the E2E scenarios is Almaty's 24-hour day, and `End | 1439` and Almaty `23:59` are the right expectations. (tasks.md:122-126)
- ✅ The scenario names that the tasks edit exist: "Days of 23 and 25 hours" (`time_selection_day_track.feature:14`), "50 rows within the time-selection budget" (`time_selection_moment.feature:47`), "Tracks fit a <width> px wide screen" with rows 320 and 2560 (`time_selection_layout_e2e.feature:58-67`), the screenshot outline (`locations/locations_ui_e2e.feature:131`) and "Keys stop at the ends of the day" (`time_selection_select_time.feature:85`). Baselines live in `src/test/features/__screenshots__/{chromium,mobile-chrome}/…-at-1024-px-….png`. (tasks.md:121-136)
- ✅ `DayTrack.tsx:34-42` already uses a `// Stryker disable all` comment that names the E2E scenario for `LABEL_ALIGNMENT_CLASS_NAMES`. (tasks.md:137)
- ✅ NG3: the wall-time input already accepts 23:59 (`MAX_WALL_TIME_HOUR = 23`, `MAX_WALL_TIME_MINUTE = 59`, `constants/timeSelection.ts:22-23`). (proposal.md:49)
- ✅ The stable `openspec/specs/time-selection/spec.md` contains the four MODIFIED requirements under the same names: "Select a time on a track" (`:64`), "Move the handle with the keyboard" (`:129`), "Accessible day tracks" (`:305`) and "Day track layout" (`:333`). Each delta keeps every stable scenario and adds new ones. The stable text says "the last step before the day's end", "End to its last 15-minute step" and "maximum … 1425", which the delta replaces. (specs/time-selection/spec.md)
- ✅ No other active change exists under `openspec/changes/`. The three predecessor changes are archived under `openspec/changes/archive/2026/10/`. No archived change already implements a 23:59 end or a track inset. (proposal.md:3)
- ✅ The glossary `docs/glossary/time-selection.md:8,11,12` has **Time selection** ("clamped to the reference day"), **Track value** and **Track move** ("the day's start or end"), and it has no **Track end** entry yet. The archived wall-time patch `H1-glossary-wall-time-input.patch` still applies to HEAD (`git apply --check` passes), and its time-selection hunk is `@@ -18,3 +18,5 @@`, as task 6.2 says. (proposal.md:22-28, tasks.md:154)
- ✅ The arithmetic in the scenarios holds against the code as it would be after D1. 0.99 × 1440 / 15 = 95.04, which rounds to 1425 (18:45Z). 0.996 × 1440 / 15 = 95.6, which rounds to 1440 and is clamped to 1439 (18:59Z). Previous step from 1439 gives ceil(1439/15)·15 − 15 = 1425. Hour back from 1439 gives 1440 − 60 = 1380 (18:00Z). New York's 2026-03-08 and 2026-11-01 days are 1380 and 1500 minutes long, so their ends are 1379 and 1499, which is 23:59 local. (spec.md:26-31,119-124; design.md:28)
- ✅ The D2 geometry holds: the 22 px inset is half the `h-11 w-11` handle. At fraction 0 the hit area spans 0–44 px of the slider, and the 32 px circle starts 6 px inside the slider, which gives 12 + 6 = 18 px from the time column. At 1439/1440 the right edge of the hit area is at most the slider's right edge, so the scenario's 1 px tolerance holds. (design.md:33-35)

## Coverage

| Requirement | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ "Select a time on a track": snap rows 0.99/0.996/1.0, "The right end reaches the last minute of 23- and 25-hour days" | ✅ 1.1, 2.1–2.2, 4.1–4.2, 5.1, 5.3 |
| FR2 | ✅ | ✅ "Move the handle with the keyboard": "Keys from a pinned quarter hour", "Keys stop at the ends of the day", "Keys around the track end" | ✅ 2.1–2.2, 5.1, 5.3 |
| FR3 | ✅ | ✅ "Accessible day tracks": "Slider name, range and value" (0 to 1439), "End of the day on the slider" | ✅ 2.1, 3.1, 5.2, 5.3 |
| FR4 | ✅ | ✅ "Day track layout": "The handle stays clear of the time and the menu", "Handle centre matches the instant" | ✅ 4.1–4.2, 5.4 |
| NFR-P1 | ✅ | ✅ stable "Time selection is fast", unchanged by intent ("No change") | ✅ 5.2 (tags the work-bound scenario) |
| NFR-A1 | ✅ | ✅ "Accessible day tracks": "No accessibility violations with tracks", "Visible focus"; "Touch targets" | ✅ 5.3, 5.4 |
| NFR-R1 | ✅ | ✅ "Tracks fit narrow and wide screens" (320, 768, 2560 px) | ✅ 5.4 |
| NFR-R2 | ✅ | ✅ "Screenshots show the tracks" | ✅ 5.5 |
| UX1 | ✅ | ✅ "The handle stays clear of the time and the menu" | ✅ 4.2, 5.4 |
| UX2 | ✅ | ✅ "Drag without scrolling or reordering" (Almaty `23:59`), "The right end reaches the last minute…" | ✅ 5.1, 5.3 |
| G1 | ✅ | n/a — met by FR1–FR3 | n/a — met by FR1–FR3, M2 |
| G2 | ✅ | n/a — met by FR4 | n/a — met by FR4, M1 |
| NG1 | ✅ | n/a — no artifact changes `TRACK_STEP_MINUTES` or the rounding (D1 keeps it) | n/a — nothing builds it |
| NG2 | ✅ | n/a — every layout change is `md:`-prefixed (D2), and 375 px baselines must stay unchanged (5.5) | n/a — nothing builds it |
| NG3 | ✅ | n/a — no wall-time requirement is touched | n/a — nothing builds it |
| NG4 | ✅ | n/a — no new screen, token, colour or hit-area size; see Consistency for the shorter bar | n/a — nothing builds a redesign |
| M1 | ✅ | n/a | ✅ 5.4 (2 widths × 2 ends) |
| M2 | ✅ | n/a | ✅ 2.1 (1379/1439/1499), 5.1, 5.2 |
| M3 | ✅ | n/a | ✅ 5.6 |
| M4 | ✅ | n/a | ✅ 6.1 |

## Consistency

- NG4 says that the track's "sizes … stay as they are" (`proposal.md:50`). D2 makes every track 44 px shorter from 768 px (`design.md:33`, risk acknowledged at `design.md:55`), and FR4 needs that (`proposal.md:64`). See R1.

## Findings

### R1 — SUGGESTION — NG4 says track sizes stay, while D2 shortens the bar
- Location: `openspec/changes/fix-day-track-handle-overlap-and-end-of-day/proposal.md:50`
- Rule: `.claude/rules/proposal-format.md` ("Non-Goals … prevent scope creep")
- Problem: NG4 reads "New screens or a redesign of the track: sizes, colours, the handle and the hit areas stay as they are." D2 (`design.md:33`) insets the bar and handle by 22 px on each side from 768 px, so the visible bar becomes 44 px shorter, which `design.md:55` acknowledges ("every track gets 44 px shorter"). Read literally, the non-goal excludes the size change that FR4 and D2 make.
- Impact: The proposal contradicts its own design. A reviewer of the implementation, or the fix stage, could treat the shorter bar as scope creep under NG4. No wrong code would be built, because D2 and the tasks are explicit.
- Fix: Reword NG4 to: "New screens or a redesign of the track: its height, colours, the handle's size and the hit areas stay as they are. From 768 px the visible bar becomes 44 px shorter, so that the handle fits inside the slider's hit area (FR4)."
- Fix risk: none. The new wording matches D2, FR4 and task 4.2. No spec or test asserts the bar's width.
- Status: fixed
- Resolution: reworded NG4 in proposal.md:50. The track's height, colours, handle size and hit areas still stay the same, and NG4 now says that from 768 px the visible bar becomes 44 px shorter so the handle fits inside the slider's hit area (FR4). This matches D2, design.md:50 and design.md:55.

### R2 — SUGGESTION — Task 6.2 reads `$scratch` in a separate command
- Location: `openspec/changes/fix-day-track-handle-overlap-and-end-of-day/tasks.md:154-157`
- Rule: `.claude/rules/test-planning.md` ("verification section must list concrete test commands")
- Problem: Task 6.2 says to run its checks "one command at a time". The second bullet defines `scratch=$(mktemp -d)`, and the third bullet runs `grep -c … "$scratch/docs/glossary/time-selection.md"` as a separate command. Shell variables do not survive between the implement stage's separate commands, so `$scratch` is empty when the grep runs.
- Impact: As written, the grep looks at `/docs/glossary/time-selection.md` and fails with "No such file". The implementer must improvise, or report a failed verification for a patch that is correct.
- Fix: Merge the two greps into the scratch command of the second bullet: append `&& test "$(grep -c "Track end" "$scratch/docs/glossary/time-selection.md")" -ge 1 && ! grep -q "getLastTrackStepMinutes" "$scratch/docs/glossary/time-selection.md"` inside the same command. Then drop the separate third bullet.
- Fix risk: none. The checks stay the same, and only the command grouping changes. `git status --short docs` stays a separate command.
- Status: fixed
- Resolution: in tasks.md task 6.2, the `Track end` / `getLastTrackStepMinutes` greps are now appended with `&&` to the scratch command that sets `$scratch`, and the separate grep bullet is gone. `git apply --check` and `git status --short docs` are still separate commands.

## Verdict

Ready to implement. There are no blocking findings: 0 CRITICAL, 0 WARNING and 2 SUGGESTION (R1, R2). Both are optional polish.
