# Review: match-here-mark-to-design

## Summary

| Item | Value |
|---|---|
| Tasks verified | 16/17 |
| Requirements traced | 47/50 |
| CRITICAL | 1 |
| WARNING | 0 |
| SUGGESTION | 0 |

## Tasks

- ✅ 1.1 `LOCATION_MARK_ICON_SIZE_PX = 18` with JSDoc naming the screens and UX1 at `packages/client/src/constants/locations.ts:7-12`, exported at `packages/client/src/constants/index.ts:29`.
- ✅ 1.2 `locations.hereMarkLabel` / `locations.hereMarkCaption` in `packages/client/src/locales/en.json:31-32` ("You are here" / "here") and `packages/client/src/locales/ru.json:31-32` ("Вы здесь" / "здесь").
- ✅ 2.1 `LocationMarkKind` + `getLocationMarkKind` in `packages/client/src/model/locationMark.ts:8-24`; `it.each` with the three cases (Almaty/Almaty, Almaty/Tokyo, Minsk/Moscow) in `packages/client/src/model/locationMark.test.ts:7-23`; exported at `packages/client/src/model/index.ts:43`.
- ✅ 3.1 `LOCATION_MARK_TEXT_KEYS` and `presentLocationMarks` in `packages/client/src/presenter/locationMark.ts:22-49`; tests for English, Russian, stub translate and the kind × language `it.each` in `packages/client/src/presenter/locationMark.test.ts:11-48`.
- ✅ 3.2 `mark?: PresentedLocationMark` replaces `deviceTimeZoneLabel` (`packages/client/src/presenter/presentLocationRows.ts:26-27`), marks presented once before `locations.map` (`:67`), row picks `marks[markKind]` (`:86`); re-exports at `packages/client/src/presenter/index.ts:5,22-26`; "present the here mark" block in `packages/client/src/presenter/presentLocationRows.test.ts:126-162`; `grep deviceTimeZoneLabel` over `src` finds nothing.
- ✅ 4.1 `LocationMarkIcon` with `role="img"`, `aria-label`, `text-accent`, hidden filled 18 px svg in `packages/client/src/views/shared/LocationMarkIcon.tsx:33-49`; `LOCATION_MARK_ICONS` record at `:16-21`; tests incl. per-kind `it.each` in `packages/client/src/views/shared/LocationMarkIcon.test.tsx:14-41`; exported at `packages/client/src/views/shared/index.ts:4`.
- ✅ 4.2 Slot before the city and `aria-hidden` caption after it in `packages/client/src/views/shared/LocationRow.tsx:102-113`, `aria-labelledby` at `:88`; `BADGE_ICON_SIZE_PX` and the pill are gone; file is 148 lines; "here mark" block in `packages/client/src/views/shared/LocationRow.test.tsx:128-196` with the header at `:6`.
- ✅ 5.1 Steps and features switched to the here mark with `@match-here-mark-to-design` tags: `packages/client/src/test/features/locations/locations_device_time_zone_unit.feature:6-99`, `locations_clock_tick.feature:53-74`; caption check by exact text via `rowHasHereMark` in `steps/deviceTimeZoneWorld.tsx:39-41`.
- ✅ 5.2 `packages/client/src/test/features/locations/locations_here_mark_unit.feature` (4 scenarios, 39 lines) and `steps/locations_here_mark_unit.steps.tsx` (153 lines) reuse `deviceTimeZoneWorld.tsx` and import `LocationMarkIcon` from `@/views/shared`.
- ✅ 5.3 Whole unit suite: the implement stage's CI is green (not re-run here, per the stage rules on running tests).
- ✅ 6.1 `locations_device_time_zone_e2e.feature:7-64` has the new row name, here-mark steps, the new scenario "The mark icon is named and the caption is not announced" and the tags; steps in `steps/locations_device_time_zone_e2e.steps.ts:9-73`; `locations_local_time_e2e.feature:51-57` expects "Almaty You are here".
- ✅ 6.2 `locations.deviceTimeZoneBadge` removed from both locales; the grep of task 6.2 prints only absence assertions in `LocationRow.test.tsx:194`, `locations_here_mark_unit.steps.tsx:22` and `locations_here_mark_unit.feature:20`.
- ❌ 6.3 Ticked, but only 8 of the 32 baselines were re-approved: the branch changes only the `list` and `time-selected` states at 375 px (both themes, both projects) under `packages/client/src/test/features/__screenshots__/`. The 24 baselines of `pinned` and `calendar` at 375 px and of all four states at 1024 px are unchanged and still show the old "Your time zone" pill (seen in `chromium/Screenshot-of-the-list-state-at-1024-px-in-the-light-theme.png` and `chromium/Screenshot-of-the-pinned-state-at-375-px-in-the-light-theme.png`). See R1.
- ✅ 7.1 The M1 traceability loop of task 7.1, run from the repository root, prints nothing.
- ✅ 7.2 Stryker on the five files scores 96.34% overall, each file at least 90% (see Mutation).
- ✅ 7.3 `grep -rn "deviceTimeZone\|LocationMark" src/adapters src/ports` prints nothing; the "Device zone is not stored" scenario stays (`locations_device_time_zone_unit.feature:72-79`).
- ✅ 7.4 Lint, build and full BDD E2E: the implement stage's CI is green (not re-run here).

## Requirements

- ✅ FR1 — `getLocationMarkKind` (`packages/client/src/model/locationMark.ts:17-24`) feeds `presentLocationRows.ts:70,86`; icon before and caption after the city in `LocationRow.tsx:102-113`; tested by `locationMark.test.ts`, `LocationRow.test.tsx:135-151` and unit BDD `locations_here_mark_unit.feature:5-11`, `locations_device_time_zone_unit.feature:6-48`.
- ✅ FR2 — pill branch and `locations.deviceTimeZoneBadge` removed; absence asserted in `LocationRow.test.tsx:192-195` and `locations_here_mark_unit.feature:13-20`. (The 24 stale screenshot baselines are tracked under NFR-R2 / R1.)
- ✅ FR3 — texts from `locales/en.json:31-32` and `locales/ru.json:31-32` via `LOCATION_MARK_TEXT_KEYS` (`presenter/locationMark.ts:22-30`); tested in `presenter/locationMark.test.ts:11-35` and the English / Russian interface scenarios (`locations_device_time_zone_unit.feature:81-97`).
- ✅ FR4 — single `mark?` field and exhaustive `Record<LocationMarkKind, …>` tables (`presenter/locationMark.ts:22`, `views/shared/LocationMarkIcon.tsx:16`); one-leading-mark and every-kind scenarios in `locations_here_mark_unit.feature:21-39`.
- ✅ FR5 — mark recomputed per presentation, nothing stored; scenarios "Badge follows changes of the list", "Device zone is read once", "Device zone is not stored" (`locations_device_time_zone_unit.feature:50-79`) and the minute / visibility re-reads (`locations_clock_tick.feature:53-74`), all tagged `@match-here-mark-to-design @FR5`.
- ✅ NFR-P1 — marks translated once per call (`presentLocationRows.ts:67`); work bound scenario "50 rows within the budget" tagged at `locations_device_time_zone_unit.feature:99-101`.
- ✅ NFR-A1 — `aria-labelledby="{cityId} {markId}"` (`LocationRow.tsx:88`), wrapper `role="img"` with the label (`LocationMarkIcon.tsx:36-41`), caption `aria-hidden` (`LocationRow.tsx:108`); E2E `locations_device_time_zone_e2e.feature:7-13,59-64` and `locations_local_time_e2e.feature:51-57`.
- ✅ NFR-A2 — axe outline in both themes tagged `@match-here-mark-to-design @NFR-A2 @M4` (`locations_device_time_zone_e2e.feature:15-27`).
- ✅ NFR-R1 — 320 / 2560 px outline tagged `@NFR-R1 @M4` (`locations_device_time_zone_e2e.feature:29-41`).
- ❌ NFR-R2 — the requirement asks for re-approved screenshots of the list, pinned, calendar and time-selected states at 375 and 1024 px in both themes showing the new mark; 24 of the 32 baselines still show the pill. See R1.
- ✅ UX1 — filled `Navigation` icon, `text-accent`, `LOCATION_MARK_ICON_SIZE_PX` = 18 (`LocationMarkIcon.tsx:20,40-46`), placed before the city with `gap-x-2` (8 px, as `gap: 8px` in `phone-travel.html:111`); tested in `LocationMarkIcon.test.tsx:23-30`.
- ✅ UX2 — caption `text-xs font-bold text-accent` with no background or border (`LocationRow.tsx:109`); tested in `LocationRow.test.tsx:158-169`.
- ✅ UX3 — nothing rendered before the city without a mark (`LocationRow.tsx:102`); tested in `LocationRow.test.tsx:185-190` and `locations_here_mark_unit.feature:11`.
- ✅ M1 — the task 7.1 grep loop prints nothing: every FR, NFR and UX id has a tagged test.
- ✅ M2 — "The former pill is gone" counts 2 marked rows, 2 leading icons and no "Your time zone" (`locations_here_mark_unit.steps.tsx:83-102`).
- ✅ M3 — `it.each` over `Object.values(LocationMarkKind)` in `presenter/locationMark.test.ts:37-48` and `LocationMarkIcon.test.tsx:32-41`, plus the unit BDD outline (`locations_here_mark_unit.feature:29-39`).
- ✅ M4 — axe outline (2 themes) and scroll outline (2 widths) tagged `@M4` (`locations_device_time_zone_e2e.feature:15-41`).
- ❌ M5 — "32 of 32 screenshot baselines … re-approved": only 8 were re-approved; the other 24 pass only within the 2.5% pixel tolerance (`playwright.bdd.config.ts:32,76`). See R1.
- ✅ M6 — measured 96.34% overall; every file at least 90% (see Mutation).
- ✅ Scenario: One row matches — `locations_device_time_zone_unit.feature:6-12`.
- ✅ Scenario: Icon before the city, caption after it — `locations_here_mark_unit.feature:5-11`, steps `locations_here_mark_unit.steps.tsx:55-80`.
- ✅ Scenario: The former pill is gone — `locations_here_mark_unit.feature:13-20`.
- ✅ Scenario: No row matches — `locations_device_time_zone_unit.feature:14-20`.
- ✅ Scenario: Several rows match — `locations_device_time_zone_unit.feature:22-30`.
- ✅ Scenario: Legacy device identifier — `locations_device_time_zone_unit.feature:32-39`.
- ✅ Scenario: Unknown device identifier — `locations_device_time_zone_unit.feature:41-48`.
- ✅ Scenario: Badge follows changes of the list — `locations_device_time_zone_unit.feature:50-59`.
- ✅ Scenario: Device zone is read once — `locations_device_time_zone_unit.feature:61-70`.
- ✅ Scenario: Device zone is read again at the minute boundary — `locations_clock_tick.feature:53-62`.
- ✅ Scenario: Device zone is read again when the page becomes visible — `locations_clock_tick.feature:64-74`.
- ✅ Scenario: Device zone is not stored — `locations_device_time_zone_unit.feature:72-79`.
- ✅ Scenario: English interface — `locations_device_time_zone_unit.feature:81-88`, step at `locations_device_time_zone_unit.steps.tsx:140-150`.
- ✅ Scenario: Russian interface — `locations_device_time_zone_unit.feature:90-97`.
- ✅ Scenario: Row name includes the badge — E2E `locations_device_time_zone_e2e.feature:7-13` expects "Almaty You are here".
- ✅ Scenario: 50 rows within the budget — here-mark work bound in `locations_device_time_zone_unit.feature:99-107`, steps `locations_device_time_zone_unit.steps.tsx:168-211`.
- ✅ Scenario: No accessibility violations with the badge — `locations_device_time_zone_e2e.feature:15-27`.
- ✅ Scenario: Badge fits narrow and wide screens — `locations_device_time_zone_e2e.feature:29-41`.
- ❌ Scenario: List screenshots show the badge — the mark is asserted in the list state at 375 / 1024 px (`locations_device_time_zone_e2e.feature:43-57`), but "the screen matches the re-approved screenshot" does not hold: the pinned, calendar and all 1024 px baselines were never re-approved and show the pill. See R1.
- ✅ Scenario: 50 rows within the budget — local-time work bound, unchanged, `locations_local_time_unit.feature`.
- ✅ Scenario: Labels are unchanged by formatter reuse — unchanged, `locations_local_time_unit.feature`.
- ✅ Scenario: No accessibility violations with times — unchanged, `locations_local_time_e2e.feature:39`.
- ✅ Scenario: Time does not change the row name and is not announced — `locations_local_time_e2e.feature:51-57` expects "Almaty You are here".
- ✅ Scenario: The time changes at the minute boundary — unchanged, `locations_clock_tick.feature`.
- ✅ Scenario: No updates while the page is hidden — unchanged, `locations_clock_tick.feature`.
- ✅ Scenario: The offset follows a DST change while the app is open — unchanged, `locations_clock_tick.feature`.
- ✅ Scenario: Updates write nothing — unchanged, `locations_clock_tick.feature`.
- ✅ Scenario: A pinned moment ignores minute updates — unchanged, `date_selection/date_selection_reference_moment_rows.feature:33`.
- ✅ Scenario: Rows follow the clock again after now — unchanged, `date_selection/date_selection_reference_moment_rows.feature:45`.
- ✅ Scenario: A marked row has exactly one leading icon — `locations_here_mark_unit.feature:21-27` ("A marked row has exactly one leading mark"), DOM count 1 / 0.
- ✅ Scenario: Every mark kind is fully defined — `locations_here_mark_unit.feature:29-39`, steps `locations_here_mark_unit.steps.tsx:123-152`.

## Mutation

One run: `cd packages/client && npx stryker run --mutate 'src/model/locationMark.ts,src/presenter/locationMark.ts,src/presenter/presentLocationRows.ts,src/views/shared/LocationMarkIcon.tsx,src/views/shared/LocationRow.tsx'`, read from `packages/client/reports/mutation/mutation-report.json`.

| File | Score | Killed | Survived | No coverage |
|---|---|---|---|---|
| `src/model/locationMark.ts` | 100.00% | 1 | 0 | 0 |
| `src/presenter/locationMark.ts` | 90.91% | 10 | 0 | 1 |
| `src/presenter/presentLocationRows.ts` | 100.00% | 15 | 0 | 0 |
| `src/views/shared/LocationMarkIcon.tsx` | 100.00% | 5 | 0 | 0 |
| `src/views/shared/LocationRow.tsx` | 96.00% | 48 | 2 | 0 |
| All files | 96.34% | 79 | 2 | 1 |

- `presenter/locationMark.ts:45:43` (no coverage): the `""` caption of a kind without `captionKey`. No such kind exists yet (only `HERE`, which has a caption), so the branch is unreachable today; it is the hook for a later home kind and needs no finding.
- `LocationRow.tsx:75:56` and `:79:27` (survived): `hasSecondaryLine` and the `ref` callback, lines this branch did not change. Out of scope.

## Findings

### R1 — CRITICAL — 24 of the 32 screenshot baselines were not re-approved and still show the old pill
- Location: `packages/client/src/test/features/__screenshots__/chromium/Screenshot-of-the-list-state-at-1024-px-in-the-light-theme.png:1`
- Rule: `openspec/changes/match-here-mark-to-design/tasks.md` task 6.3, proposal NFR-R2 and M5
- Problem: Task 6.3 is ticked ("re-approve the 32 baselines … for the states list, pinned, calendar and time-selected"), but the branch changes only 8 PNGs: the `list` and `time-selected` states at 375 px in both themes for `chromium` and `mobile-chrome`. The other 24 baselines (`pinned` and `calendar` at 375 px; `list`, `pinned`, `calendar` and `time-selected` at 1024 px; both themes, both projects) are byte-identical to the base and still draw the filled "Your time zone" pill after "Almaty". The example at the Location and `chromium/Screenshot-of-the-pinned-state-at-375-px-in-the-light-theme.png` show the pill. They pass only because the pill-to-arrow change stays under `SCREENSHOT_MAX_DIFF_PIXEL_RATIO = 0.025` (`packages/client/playwright.bdd.config.ts:32,76`). Playwright 1.63's plain `--update-snapshots` rewrites only the baselines that fail, so it skipped them.
- Impact: The task is ticked but not done, and NFR-R2 / M5 are unmet: 24 approved reference images contradict FR2 ("No row shows the 'Your time zone' pill"). A later change that brings back a pill-sized badge at 1024 px or in the pinned / calendar states passes these screenshot checks, because the baselines already contain it. Anyone reviewing the baselines as the visual source of truth sees the old design.
- Fix: From `packages/client/`, run `pnpm test:bdd --grep "Screenshot of the (list|pinned|calendar|time-selected) state" --update-snapshots=all` once. Check that `git status --short src/test/features/__screenshots__` lists the 24 remaining files of those four states and nothing else, and that the regenerated images show the arrow and "here" on Almaty. Then run `pnpm test:bdd --grep "Screenshot of the"` without the flag and confirm it passes.
- Fix risk: `--update-snapshots=all` rewrites every baseline the grep matches, including the 8 already re-approved ones. Those come out identical or differ only by anti-aliasing noise. The grep keeps the `empty`, `suggestions` and `IST results` baselines untouched. No code or test changes.
- Status: fixed
- Resolution: re-approved the baselines with `--update-snapshots=all` for the four states; 21 more PNGs changed (pinned 375 px, all four states at 1024 px, both themes and projects). The `calendar` 375 px baselines stay unchanged on purpose: the calendar sheet covers the list, so no Almaty row is visible in them.

## Verdict

Not ready — blocked by R1 (task 6.3 ticked but undone; NFR-R2 and M5 unmet). The production code, presenter / model layering, locale keys, traceability and mutation scores are otherwise sound.
