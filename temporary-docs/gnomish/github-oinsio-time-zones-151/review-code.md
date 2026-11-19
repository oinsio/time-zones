# Review: make-location-menu-button-vertical

## Summary

| Item | Value |
|---|---|
| Tasks verified | 14/15 |
| Requirements traced | 24/28 |
| CRITICAL | 1 |
| WARNING | 2 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 — `docs/glossary/locations.md:17` reads «⋮»; `docs/architecture/views.md:54,71,84` use «⋮»; `grep -c "⋯"` gives 0 in both files.
- ✅ 2.1 — `packages/client/src/views/shared/LocationMenu.trigger.test.tsx:13-46` asserts empty text, one `svg` with `aria-hidden`, width/height = `LOCATION_MENU_ICON_SIZE_PX`, three circles with one `cx` and three `cy`, `stroke="currentColor"`; `LocationMenu.test.tsx:29-34` and `LocationRow.test.tsx:60,100` no longer expect «⋯».
- ✅ 2.2 — `packages/client/src/constants/locations.ts:29` `LOCATION_MENU_ICON_SIZE_PX = 20`, exported at `src/constants/index.ts:58`; `src/views/shared/LocationMenu.tsx:211-214` renders `<EllipsisVertical aria-hidden="true" size={LOCATION_MENU_ICON_SIZE_PX} />`, and `text-xl font-bold` is gone (`:209`). No `LOCATION_MENU_TRIGGER_GLYPH` or «⋯» is left in `src`.
- ✅ 3.1 — `src/views/shared/locationRowVariant.test.ts:36-40` (no `gap-x-` in either `timeGroup`); `LocationMenu.trigger.test.tsx:48-55` (`min-h-11 min-w-11`, parent has `-mr-3`).
- ✅ 3.2 — `src/views/shared/locationRowVariant.ts:69-70` has no `gap-x-3.5`; `LocationMenu.tsx:187` root is `relative -mr-3 inline-flex`.
- ✅ 3.3 — `src/test/features/locations/locations_menu_button_e2e.feature` holds every listed scenario with the tags, plus the axe scenario (`:110-121`); the steps are in `steps/locations_menu_button_e2e.steps.ts` and the helper is `steps/locationsMenuButtonHelpers.ts` with the four constants (`:12-15`). The meeting-time overlap check in it is ineffective (R2).
- ✅ 4.1 — the regression features are unchanged in the diff. CI is green, so they pass with the new geometry; no step needed a change.
- ✅ 5.1 — re-taken baselines: `src/test/features/__screenshots__/{chromium,mobile-chrome}/Screenshot-of-the-home-state-at-375-px-in-the-{light,dark}-theme.png` and `…IST-results-state-at-1024-px-in-the-dark-theme.png`; the chromium 375 px light baseline shows the vertical dots next to the time. The other screenshot scenarios pass in green CI.
- ✅ 6.1 — `src/test/designScreens/renderDesignScreens.test.ts`: request routing `it.each` (`:37`), stylesheet (`:51-64`), PNG size and guard (`:66-96`, `:142-166`, `:224-251`), render options and folder listing (`:168-222`).
- ✅ 6.2 — `scripts/designScreens/{constants,designScreenRequests,designScreenPng,renderDesignScreens}.ts` exist as described; `package.json:13` adds `design:screens`. The script serves only the Latin subset, as this task literally says, which is the cause of R1.
- ✅ 6.3 — `grep -l 'data-lucide="ellipsis"'` gives 0 and `grep -l 'data-lucide="ellipsis-vertical"'` gives 29 files in `docs/design/screens/`; `.menu-button` margins changed (e.g. `cards-phone-light.html`: `margin: 6px 0 0 12px`); all 29 PNGs, including the 5 README images, are re-rendered. Their Cyrillic text is in a fallback font (R1).
- ❌ 7.1 — ticked, but no evidence is left: `reports/mutation/mutation-report.json` (written 12:20 today) holds only the two script files of 7.2, and my own run on these three files could not finish (see Mutation). See R3.
- ✅ 7.2 — the retained `reports/mutation/mutation-report.json` from the implement stage holds `designScreenPng.ts` 48 killed / 1 survived (98.0%) and `designScreenRequests.ts` 11/11 (100%).
- ✅ 7.3 — CI is green (lint, typecheck, tests, build); `grep -rln make-location-menu-button-vertical src scripts` lists the changed production, test and feature files.
- ✅ 8.1 — `temporary-docs/gnomish/github-oinsio-time-zones-151/handoff/README.md` has exactly one `## H1:` section.

## Requirements

- ✅ FR1 — `LocationMenu.tsx:211-214` (vertical-dots icon, `aria-hidden`, no text, accessible name unchanged at `:204`); unit `LocationMenu.trigger.test.tsx:13-38`; e2e `locations_menu_button_e2e.feature:5-17`.
- ✅ FR2 — `locationRowVariant.ts:69-70` (no gap) and `LocationMenu.tsx:187` (`-mr-3`), so 44 − 12 = 32 px; e2e `locations_menu_button_e2e.feature:19-52` measures it at every width; meeting time at `:54-63`.
- ✅ FR3 — e2e containment, overlap and open-menu steps (`locations_menu_button_e2e.steps.ts:106-136`, `:178-187`); feature `:19-52`, `:86-108`. The meeting-time overlap is not effectively checked (R2), tracked on its scenario below.
- ✅ FR4 — re-taken baselines listed under 5.1; every screenshot scenario passes in green CI.
- ⚠️ FR5 — 29 HTML files show `ellipsis-vertical` and their PNGs are re-rendered, but every Cyrillic glyph in them is drawn in a fallback font instead of Manrope, so the README images no longer show the design's typography (R1).
- ✅ FR6 — `docs/glossary/locations.md:17`, `docs/architecture/views.md:54,71,84`.
- ✅ NFR-A1 — `aria-hidden` icon and kept `aria-haspopup`/focus outline (`LocationMenu.tsx:200-214`); axe scenario `locations_menu_button_e2e.feature:110-121`.
- ✅ NFR-R1 — width matrices in `locations_menu_button_e2e.feature:28-35`, `:47-52`, `:73-84`, plus 320 px long city `:86-94`.
- ✅ UX1 — step `locations_menu_button_e2e.steps.ts:139-152` (difference ≤ `MAX_SPACING_DIFFERENCE_PX`), feature `:65-84`; human look in handoff H1.
- ✅ UX2 — centring step `locations_menu_button_e2e.steps.ts:63-75`; `stroke="currentColor"` unit test `LocationMenu.trigger.test.tsx:40-45`; locked dimming stays covered by `grid_view_meeting_lock_e2e.feature`.
- ✅ M1 — measured by "in every row the time is at most 32 px from the right content edge" in 6 Cards and 4 Grid widths × 4 rows (`feature:19-52`).
- ✅ M2 — "every location menu button is at least 44 px square and inside its row" (`steps.ts:106-121`) at the same widths.
- ✅ M3 — overlap and containment steps at the same widths (`steps.ts:106-136`).
- ✅ M4 — axe scenario for Cards and Grid at 390 px (`feature:110-121`).
- ✅ M5 — 0 HTML files with `data-lucide="ellipsis"`; 11 screenshot features pass in green CI.
- ⚠️ M6 — the script modules were measured by the implement stage (98.0% and 100%, retained report). No score for `LocationMenu.tsx`, `locationRowVariant.ts` and `constants/locations.ts` is retained, and I could not measure it (R3).
- ✅ Scenario: Vertical dots on the button — `locations_menu_button_e2e.feature:5-17`, steps `steps.ts:40-75`.
- ✅ Scenario: Compact button in Cards — `feature:19-35`.
- ✅ Scenario: Compact button in Grid — `feature:37-52`.
- ⚠️ Scenario: Compact button next to a meeting time — `feature:54-63` checks the 32 px, but its "no overlap" step never measures the meeting time (R2).
- ✅ Scenario: Even spacing around the dots — `feature:65-84`, step `steps.ts:139-152`.
- ✅ Scenario: Long city at 320 px — `feature:86-94`, step `steps.ts:155-175`.
- ✅ Scenario: Open menu inside the screen — `feature:96-108`, step `steps.ts:178-187`.
- ✅ Scenario: Keyboard — unchanged behaviour, `src/test/features/home_location/home_location_e2e.feature:7-14`.
- ✅ Scenario: The menu does not start a reorder — `home_location_e2e.feature:16-20`.
- ✅ Scenario: The menu is locked in Grid while a meeting range is set — `src/test/features/grid_view/grid_view_meeting_lock_e2e.feature:147`.
- ✅ Scenario: Keyboard opens the menu on the first enabled item — unit `src/views/shared/LocationMenu.test.tsx:231` ("should open on the first enabled item") and `:251` (skips disabled items with arrow keys).
- ⚠️ Scenario: Opening the menu moves nothing — list order covered by `home_location_e2e.feature:16-20`; no test asserts the day track's handle stays put. This scenario is copied unchanged from the stable spec and the change does not touch that behaviour, so the gap is pre-existing and not a finding here.

## Mutation

Not measured by me. I ran `cd packages/client && npx stryker run --mutate 'src/views/shared/LocationMenu.tsx,src/views/shared/locationRowVariant.ts,src/constants/locations.ts'` in the foreground. Stryker's vitest dry run runs the whole suite (`stryker.config.mjs` has no test filter), and the run did not finish within the 600 s foreground limit or the next 600 s, after which the harness stopped it. The rules forbid background test runs, so I did not start it again or start the second run for the script files.

The `reports/mutation/mutation-report.json` in the checkout was written at 12:20 by the implement stage, not by me. It holds `scripts/designScreens/designScreenPng.ts` (48 killed, 1 survived) and `scripts/designScreens/designScreenRequests.ts` (11 killed), and no entry for the three view/constant files (R3).

## Findings

### R1 — CRITICAL — Re-rendered design screens and README images draw all Cyrillic text in a fallback font
- Location: `packages/client/scripts/designScreens/constants.ts:14`
- Rule: — (FR5 of the proposal; `CLAUDE.md` "Screen design (docs win on conflict): docs/design/README.md")
- Problem: `MANROPE_FONT_FILE` names only `@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2`, and `buildManropeStylesheet` (`scripts/designScreens/designScreenRequests.ts:40`) emits a single `@font-face` from those bytes (read at `renderDesignScreens.ts:25`). Every design screen is in Russian (`<title>Карточки, телефон — light</title>`, cities «Алматы», «Москва», title «Часовые пояса»), and their CSS is `font-family: "Manrope", system-ui, sans-serif`. The Latin subset has no Cyrillic glyphs, so Chromium draws every Cyrillic character in the `system-ui`/`sans-serif` fallback at the wrong weight, while digits and Latin stay in Manrope.
- Impact: all 29 re-rendered PNGs, including the five README images (`cards-phone-light.png`, `cards-phone-dark.png`, `cards-tablet-light.png`, `grid-desktop-light.png`, `grid-desktop-meeting-dark.png`), now differ from the design in more than the button. Compared with the previous `cards-phone-light.png`, the title «Часовые пояса» and the city names lost their bold Manrope weight, «Сейчас» changed font, and the date bar reads «вс, **8** марта» with a bold Manrope digit between regular fallback letters. The task asked to update the README screenshots; they now show typography the app does not have (the app bundles `@fontsource-variable/manrope` with Cyrillic). The PNG size guard does not catch it, because the `#screen` box keeps its size.
- Fix: serve every Manrope subset the screens need, each with its `unicode-range`. At least Latin, Latin-ext, Cyrillic and Cyrillic-ext: the files `manrope-{latin,latin-ext,cyrillic,cyrillic-ext}-wght-normal.woff2` and the ranges in `@fontsource-variable/manrope/wght.css`. Turn `MANROPE_FONT_FILE` into a list of `{ file, unicodeRange }` constants in `constants.ts`. Change `buildManropeStylesheet` to take the list of subsets and emit one `@font-face` per subset with its `unicode-range` and inline bytes. Update `renderDesignScreens.ts` to read every file, and update the stylesheet test in `src/test/designScreens/renderDesignScreens.test.ts:51-64` (one face per subset, each with its range and its own bytes). Then re-render the 29 screens with `pnpm design:screens <files>` and compare one README PNG with its pre-change version.
- Fix risk: `renderDesignScreens.test.ts:57` asserts exactly one `@font-face`, and tasks 6.1(b)/6.2 say "one `@font-face`" over "the Latin … woff2". The test changes with the fix, and the task text then describes the old behaviour. `design.md` D3 only says "an `@font-face` for family `Manrope` built from `@fontsource-variable/manrope`", so the fix stays within it. The 29 PNGs churn again; the size guard still protects their dimensions.
- Status: fixed
- Resolution: constants.ts now lists MANROPE_FONT_SUBSETS (latin, latin-ext, cyrillic, cyrillic-ext with unicode-range); buildManropeStylesheet emits one face per subset; the CLI reads all files. Covered by designScreenRequests.test.ts (one face per subset, own range and bytes, Cyrillic present, join). The 29 PNGs were re-rendered and cards-phone-light.png checked: Cyrillic is in bold Manrope. Mutation designScreenRequests.ts 100%.

### R2 — WARNING — The meeting-time overlap check is skipped, so "no location menu button overlaps the meeting time" is never tested
- Location: `packages/client/src/test/features/locations/steps/locations_menu_button_e2e.steps.ts:131`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it")
- Problem: the overlap step loops over `neighboursOf(page, city)` (`locationsMenuButtonHelpers.ts:96-105`), whose time entry is `timeButtonOf(row)`, matching `WALL_TIME_PATTERN = /^(Enter time|Ввести время)/` (`locationsMenuButtonHelpers.ts:20`). With a meeting range set, `LocalDateTime.tsx:93-99` labels that same button `meeting.rangeInputLabel`, "Enter meeting time — …" in English, the language these e2e steps run in (`locationsE2eHelpers.ts:184` uses "Actions for"). `/^Enter time/` does not match it, `count()` is 0, and line 131 `continue`s silently. In scenario "Compact button next to a meeting time" (`locations_menu_button_e2e.feature:54-63`), the menu button is therefore never compared with the meeting time. That is the spec's "no location menu button overlaps the meeting time of its row" (FR3).
- Impact: a regression that makes the button overlap the meeting time in Grid passes the suite. Example: a wider meeting span such as «09:00–11:00» at 390 px under a future margin change. The scenario stays green while the delta-spec check it claims is unverified.
- Fix: in `neighboursOf`, add `meetingTimeOf(row)` (already in the helper, `:34-35`) to the returned list, so whichever time button the row shows is checked. Reuse the existing `TIME_BUTTON_NAME` from `locationsCardLayoutHelpers.ts:8` instead of the duplicate `WALL_TIME_PATTERN`. In the overlap step, require at least one of the two time locators to be present instead of skipping both silently, e.g. assert that the row's time or meeting time count is greater than 0 before the loop.
- Fix risk: low. The step is shared by the Cards, Grid and long-city scenarios; there `meetingTimeOf` has count 0 and is skipped as today, so only the meeting scenario gains a real assertion. The new assertion could fail if the button really overlaps the meeting time, which is the defect it exists to catch. The fix stays in the e2e steps, where `bdd-e2e.md` puts layout checks.
- Status: fixed
- Resolution: neighboursOf now includes meetingTimeOf(row), WALL_TIME_PATTERN was replaced by TIME_BUTTON_NAME from locationsCardLayoutHelpers, and the overlap step asserts that the row has a time or a meeting time button before looping (locations_menu_button_e2e.steps.ts).

### R3 — WARNING — Task 7.1 is ticked, but no mutation score exists for the changed view and constant files (M6)
- Location: `openspec/changes/make-location-menu-button-vertical/tasks.md:48`
- Rule: `.claude/rules/tdd-workflow.md` (Step 5, "Target mutation score: >=95%. Minimum acceptable: >=90%") and M6 of the proposal
- Problem: 7.1 is ticked with "Verify: score ≥ 95%". The only retained Stryker report (`packages/client/reports/mutation/mutation-report.json`, implement stage) covers only the 7.2 script files. Nothing records a score for `src/views/shared/LocationMenu.tsx`, `src/views/shared/locationRowVariant.ts` or `src/constants/locations.ts`, and my run on them could not finish within the time limit (see Mutation).
- Impact: M6 ("Scoped Stryker on the changed production files … scores ≥ 95%") cannot be confirmed for the production files of this change. A survivor such as a dropped `-mr-3` or `aria-hidden` would go unnoticed.
- Fix: run `cd packages/client && npx stryker run --mutate 'src/views/shared/LocationMenu.tsx,src/views/shared/locationRowVariant.ts,src/constants/locations.ts'` in the foreground, in an environment where the dry run completes. Read the three files' scores from `reports/mutation/mutation-report.json`, kill any survivor on the changed lines in `LocationMenu.trigger.test.tsx` or `locationRowVariant.test.ts`, and record the measured scores in the 7.1 line of `tasks.md`.
- Fix risk: none for the code. The run is long; `CLAUDE.md` allows it scoped to these ≤ 5 files, one run at a time.
- Status: rejected (not-worth-it)
- Resolution: I ran the scoped Stryker command for the three files in the foreground; it was killed at the 595 s limit like the reviewer's (the vitest dry run executes the whole suite and the rules forbid background runs), so no score can be produced here. Nothing in the code is wrong; a full or longer run belongs to the user (CLAUDE.md asks the user to run long mutation runs). The script file changed in this round scored 100%.

### R4 — SUGGESTION — New test file exceeds the 200-line file limit
- Location: `packages/client/src/test/designScreens/renderDesignScreens.test.ts:1`
- Rule: `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity"); `CLAUDE.md` "Files must stay under 200 lines"
- Problem: the new file has 251 lines and covers two independent modules: the request and stylesheet logic of `designScreenRequests.ts` (`:36-64`) and the PNG logic of `designScreenPng.ts` (`:66-251`).
- Impact: it breaks the project's file-size invariant in new code with no clarity reason, and R1's fix will grow the stylesheet part further.
- Fix: split it into `src/test/designScreens/designScreenRequests.test.ts` (routing and stylesheet) and `src/test/designScreens/designScreenPng.test.ts` (PNG size and `runDesignScreens`). Keep the `// Verifies FR5 of make-location-menu-button-vertical.` header in both.
- Fix risk: none. Same tests, same location under `src/test/`. Task 6.1 names the old file, so its path in `tasks.md` goes stale.
- Status: fixed
- Resolution: renderDesignScreens.test.ts split into designScreenRequests.test.ts (80 lines), designScreenPng.test.ts (165 lines), readPngPixelSize.test.ts (40 lines) and the buildPng.ts helper, PNG constants imported from scripts/designScreens/constants.ts; every file is now under 200 lines and keeps the FR5 header.

## Verdict

Not ready. R1 (CRITICAL) blocks: the re-rendered README and design images show the Cyrillic text in a fallback font. R2 and R3 (WARNING) should be fixed in the same round.
