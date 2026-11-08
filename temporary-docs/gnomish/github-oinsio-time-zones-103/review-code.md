# Review: compact-settings-controls

## Summary

| Item | Value |
|---|---|
| Tasks verified | 17/18 |
| Requirements traced | 52/54 |
| CRITICAL | 1 |
| WARNING | 0 |
| SUGGESTION | 0 |

## Tasks

- ✅ 1.1 — `docs/glossary/settings.md:8-13` adds **Option group** (`SettingsOptionGroup`, `SettingsOption`, `SETTINGS_GROUP_ROW_CLASS_NAME`), the toggle group's shared row, `THEME_PREFERENCE_ORDER` and `HOUR_FORMAT_PICTOGRAMS`; `docs/architecture/views.md:112` reads "theme (System, Light, Dark; icons only)".
- ✅ 2.1 — `packages/client/src/constants/preferences.test.ts` asserts the order, every value once, the pictograms and the `flex-wrap` / `justify-between` row classes, imported from `@/constants`.
- ✅ 2.2 — `packages/client/src/constants/preferences.ts:56-80` defines the four constants; `packages/client/src/constants/index.ts` exports them.
- ✅ 3.1 — `packages/client/src/app/settings/SettingsOptionGroup.test.tsx:34-126` covers every listed assertion (labelled-by caption, order, checked, `onSelect`, `title` via `it.each`, icon/pictogram/plain faces, `bg-accent`/`bg-surface`, no `lucide-check`, one bordered track without the caption, no `fieldset`).
- ✅ 3.2 — `packages/client/src/app/settings/SettingsOptionGroup.tsx:53-99` follows D1/D4/D5/D6 (`role="radiogroup"` + `aria-labelledby`, native `sr-only` radios sharing `useId()` name, `title={option.label}`, accent fill); exported with `SettingsOption` from `src/app/settings/index.ts`; 99 lines.
- ✅ 3.3 — `packages/client/src/app/settings/SettingsToggleGroup.tsx:47-48` uses `SETTINGS_GROUP_ROW_CLASS_NAME` / `SETTINGS_GROUP_CAPTION_CLASS_NAME` (identical to the removed literals); JSDoc line 29.
- ✅ 4.1 — `packages/client/src/app/settings/SettingsPage.test.tsx:44-105, 146-152` (icons + `title` + no visible text, order System/Light/Dark, `12`/`24` named 12-hour/24-hour, fill instead of check, names via `aria-labelledby`); the Russian test moved to `SettingsPage.russian.test.tsx` and checks the Russian names in order.
- ✅ 4.2 — `packages/client/src/app/settings/SettingsPage.tsx:113-132` maps `THEME_PREFERENCE_ORDER`, passes `pictogram: HOUR_FORMAT_PICTOGRAMS[hourFormat]` and `caption`; JSDoc line 51.
- ✅ 5.1 — `packages/client/src/test/features/settings/settings_option_group_unit.feature` (3 scenarios) with steps in `steps/settings_option_group_unit.steps.tsx:27-106`.
- ✅ 6.1 — `packages/client/src/test/features/settings/settings_option_group_e2e.feature` holds all seven listed scenarios with their tags; steps in `steps/settings_option_group_e2e.steps.ts`, including the axe step in "Size, focus and checked fill".
- ✅ 6.2 — `settings_e2e.feature` adds `@compact-settings-controls @NFR-A1` to the two scenarios and `@M4` to six; `settings_view_contract_e2e.feature:10,18` to two; no step text changed.
- ✅ 6.3 — `steps/settingsCreditE2eHelpers.ts:79-118` (unchecked icon, caption helper, sibling-or-descendant radiogroup matched by its caption); step renamed in `settings_factory_credit_e2e.feature:102` and `settings_factory_credit_layout_e2e.steps.ts:83`; `SettingsPage.credit.test.tsx:39-47`.
- ❌ 7.1 — Only the 375 px settings baselines and the language baselines were re-approved. The four 1024 px baselines in `src/test/features/__screenshots__/{chromium,mobile-chrome}/Approved-screenshots-of-the-settings-at-1024-px-in-the-{light,dark}-theme.png` are untouched and still show the old Light/Dark/System rows with a check icon (see R1).
- ✅ 7.2 — No other baseline under `__screenshots__/` changed in the branch diff.
- ✅ 7.3 — CI is green for the unit and BDD suites (stage premise); the old-markup expectations were updated (`SettingsPage.test.tsx`, `SettingsPage.credit.test.tsx`).
- ✅ 8.1 — Measured here: the four files score 100 / 100 / 100 / 90.91 % (see Mutation).
- ✅ 8.2 — CI green (lint, typecheck, build, bundle size, legacy build run in CI).
- ✅ 8.3 — The task's grep prints at least two lines for each of the 18 ids (e.g. FR1 5, NFR-R2 2, UX3 2, M4 8).

## Requirements

- ✅ FR1 — `SettingsOptionGroup.tsx:25-43,76` (icon `aria-hidden`, `sr-only` name, `title`); `SettingsPage.tsx:117-118`; tests `SettingsPage.test.tsx:44-58`, E2E "Icons only, in the order System, Light, Dark".
- ✅ FR2 — `constants/preferences.ts:56-60`, `SettingsPage.tsx:115`; `SettingsPage.test.tsx` "should order the theme options…", E2E "Arrow keys follow the visual order".
- ✅ FR3 — enum, parser and setters untouched; unit BDD "The stored theme is unchanged", the M4 E2E scenarios.
- ✅ FR4 — `constants/preferences.ts:66-69`, `SettingsPage.tsx:125-129`; `SettingsPage.test.tsx` "should show the hour formats as 12 and 24…", E2E "Pictograms in every language".
- ✅ FR5 — `SettingsOptionGroup.tsx:62-70` with `SETTINGS_GROUP_ROW_CLASS_NAME`; E2E "Caption and options in one row" (320/375/1024/2560, both languages).
- ✅ FR6 — generic `SettingsOptionGroup<Value>` with `SettingsOption`; shared row constant in both groups; unit BDD "A group with three options", "An option without an icon or a pictogram shows its name".
- ✅ NFR-A1 — native radios in one `radiogroup` named by `aria-labelledby`; `min-h-11 min-w-11` and `has-[:focus-visible]:outline` at `SettingsOptionGroup.tsx:78`; E2E "Size, focus and checked fill", "Arrow keys follow the visual order".
- ✅ NFR-A2 — `SettingsOptionGroup.tsx:79-81`; E2E step compares the checked fill with the accent colour and unchecked with `readThemeColours(theme).surface`, plus axe in both themes.
- ✅ NFR-A3 — names "12-hour"/«12 часов» contain the pictogram; E2E "Pictograms in every language" asserts the visible pictogram and the exact accessible names.
- ✅ NFR-R1 — E2E "Caption and options in one row" (no horizontal scroll step included) and "Compact groups".
- ❌ NFR-R2 — the 1024 px settings baselines were not re-approved and still show the old layout (R1).
- ✅ UX1 — caption first, track after, `justify-between`; E2E one-row step asserts caption left of the track.
- ✅ UX2 — fill-only change of colour classes; E2E "Choosing moves nothing" compares the boxes before and after.
- ✅ UX3 — one bordered track for the options (`SettingsOptionGroup.tsx:70`); `SettingsOptionGroup.test.tsx:107-114`; toggle group keeps separate buttons.
- ✅ M1 — E2E "Compact groups at 375 px" asserts each radiogroup ≤ 56 px in English and Russian.
- ✅ M2 — E2E "Icons only…" and "Pictograms in every language" check 5 names × 2 languages and the order.
- ✅ M3 — E2E "Size, focus and checked fill" (axe + accent fill) in light and dark.
- ✅ M4 — `@compact-settings-controls @M4` on the 6 + 2 named scenarios with unchanged step text.
- ✅ Scenario: A group with three options — `settings_option_group_unit.feature:7`.
- ✅ Scenario: An option without an icon or a pictogram shows its name — `settings_option_group_unit.feature:14`.
- ✅ Scenario: Caption and options in one row — `settings_option_group_e2e.feature` outline at 320/375/1024/2560.
- ✅ Scenario: Choosing moves nothing — `settings_option_group_e2e.feature` last scenario.
- ✅ Scenario: Default is System — `settings_preferences_unit.feature:7`.
- ✅ Scenario: Icons only, in the order System, Light, Dark — `settings_option_group_e2e.feature:7`.
- ✅ Scenario: Dark on a light system — `settings_e2e.feature:107`.
- ✅ Scenario: Light on a dark system — `settings_e2e.feature:115`.
- ✅ Scenario: System follows a change of the system preference — `settings_e2e.feature:123`.
- ✅ Scenario: The stored theme is unchanged — `settings_option_group_unit.feature` third scenario.
- ✅ Scenario: Default is 24-hour — `settings_preferences_unit.feature:13`.
- ✅ Scenario: Pictograms in every language — `settings_option_group_e2e.feature` outline.
- ✅ Scenario: Switching to 12-hour — `settings_e2e.feature:141`.
- ✅ Scenario: Gap note in 12-hour format — `settings_hour_format_unit.feature:7`.
- ✅ Scenario: Arrow keys change the theme — `settings_e2e.feature:30` (Arrow Up from System still reaches Dark).
- ✅ Scenario: Arrow keys follow the visual order — `settings_option_group_e2e.feature`.
- ✅ Scenario: Names and checked state — `settings_e2e.feature:39` plus the Russian group names of "Both languages" (scenario text unchanged from the stable spec).
- ✅ Scenario: Size, focus and checked fill — `settings_option_group_e2e.feature` outline, light and dark.
- ✅ Scenario: No violations — `settings_e2e.feature` "Settings have no accessibility violations" and "No violations with the unreadable note".
- ✅ Scenario: Narrow and wide screens — `settings_e2e.feature` "Settings fit a screen <width> px wide" (320, 2560).
- ✅ Scenario: Compact groups — `settings_option_group_e2e.feature` outline.
- ⚠️ Scenario: Approved screenshots — the 375 px baselines show three icons and `12`/`24`; the 1024 px baselines still show the old rows (R1).
- ✅ Scenario: A group with three options — toggle group, `settings_zone_label_unit.feature:67`, unchanged.
- ✅ Scenario: The credit in both languages — `settings_factory_credit_e2e.feature:7`, via the adapted `isCreditDirectlyAboveThemeGroup`.
- ✅ Scenario: The credit below a settings note — `settings_factory_credit_e2e.feature:91`.
- ✅ Scenario: Following the credit keeps the app — `settings_factory_credit_e2e.feature:19`.
- ✅ Scenario: The credit offline — `settings_factory_credit_e2e.feature:31`.
- ✅ Scenario: Token colours in both themes — `settings_factory_credit_e2e.feature:40`, reads an unchecked theme icon (`settingsCreditE2eHelpers.ts:79`).
- ✅ Scenario: The credit follows a theme change — `settings_factory_credit_e2e.feature:56`.
- ✅ Scenario: The larger credit text — `settings_factory_credit_e2e.feature:99`, compares with the theme caption.
- ✅ Scenario: Keyboard order and focus — `settings_factory_credit_e2e.feature:63`.
- ✅ Scenario: The full credit on narrow and wide screens — `settings_factory_credit_e2e.feature:77`.
- ✅ Scenario: Collapsed group — `settings_language_e2e.feature:7`.
- ✅ Scenario: Expand and collapse — `settings_language_e2e.feature:14`.
- ✅ Scenario: Names are not translated — `settings_language_unit.feature:19`.
- ✅ Scenario: Choosing Russian applies at once — `settings_language_unit.feature:7`, `settings_language_e2e.feature:24`.

## Mutation

One scoped run: `npx stryker run --mutate 'src/app/settings/SettingsOptionGroup.tsx,src/app/settings/SettingsPage.tsx,src/app/settings/SettingsToggleGroup.tsx,src/constants/preferences.ts'`.

- `src/app/settings/SettingsOptionGroup.tsx` — 100 % (21 killed)
- `src/app/settings/SettingsPage.tsx` — 100 % (24 killed)
- `src/app/settings/SettingsToggleGroup.tsx` — 100 % (18 killed)
- `src/constants/preferences.ts` — 90.91 % (10 killed, 1 survived). The survivor empties `LANGUAGE_BUTTON_CLASS_NAME` (line 49), a constant this branch did not touch; every constant the branch added is killed.

`renderSettingsPage.tsx` is a test helper (renders the page with in-memory providers) and was not measured.

## Findings

### R1 — CRITICAL — The 1024 px settings screenshots were not re-approved
- Location: `packages/client/src/test/features/__screenshots__/chromium/Approved-screenshots-of-the-settings-at-1024-px-in-the-light-theme.png` (and the dark one, and both in `mobile-chrome/`)
- Rule: spec delta **Settings page layout** / scenario "Approved screenshots"; proposal NFR-R2; task 7.1
- Problem: Task 7.1 is ticked and NFR-R2 says the settings screenshots "375 px and 1024 px in both themes" are re-approved once. The spec says they "show the theme group as three icons in the order System, Light, Dark with System checked, the hour format group as `12` and `24` with 24 checked". The branch re-approved only the two 375 px settings baselines and the four language baselines per project (12 PNGs). The four 1024 px settings baselines are unchanged: opening the chromium light one shows the old full-width rows "Light", "Dark", "System ✓" and "12-hour", "24-hour ✓". The scenario still passes (I ran `--grep "settings at 1024 px in the light" --project chromium`: 1 passed) only because the old and new layouts differ by less than `SCREENSHOT_MAX_DIFF_PIXEL_RATIO = 0.025` (`playwright.bdd.config.ts:44`): the rows were near-white on a near-white background, and only glyphs and borders count as changed.
- Impact: The approved wide-screen visual reference contradicts the spec, and the 1024 px visual regression guards the wrong layout. A later regression at 1024 px that brings back stacked rows or breaks the compact group would still be within the 2.5 % of a baseline that shows stacked rows, so it would pass. Anyone reviewing the baselines would see the old design as approved.
- Fix: From `packages/client`, run `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "Approved screenshots of the settings at 1024" --update-snapshots`. This covers both projects. Open the four new PNGs with the Read tool and confirm the three theme icons with System filled and `12` `24` with 24 filled. Then run the same command without `--update-snapshots`: it must pass. Commit only those four files.
- Fix risk: Low. Only the four 1024 px baselines change. Their text rendering is now Linux's, which the shared 2.5 % tolerance already absorbs for every other baseline (`playwright.bdd.config.ts:38-43`). Do not lower the global tolerance: that would affect every other screenshot and is outside this change's scope.
- Status: open

## Verdict

Not ready: R1 is blocking. Task 7.1 is ticked, but the 1024 px settings baselines still show the pre-change layout, so NFR-R2 is not met. Everything else checks out: the production code, the traceability and the tests match the spec and design, and the changed production files score 100 / 100 / 100 / 90.91 % in mutation testing.
