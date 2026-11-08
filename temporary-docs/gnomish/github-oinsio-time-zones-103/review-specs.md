# Specs review: compact-settings-controls

## Summary

| Item | Value |
|---|---|
| Stale claims | 2 |
| Requirements fully covered | 26/26 |
| Contradictions | 1 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 1 |

## Freshness

- ✅ `design.md:7` — `src/app/settings/SettingsOptionGroup.tsx` has 72 lines and is one `<fieldset>` + `<legend>` around a `div role="radiogroup" aria-label={legend}`, full-width `<label>`s around `sr-only` native radios, an optional `Icon` and a `Check` icon when checked (`SettingsOptionGroup.tsx:34-69`). It has no own test file, and `SettingsPage.tsx` is its only user (`SettingsPage.tsx:111-129`).
- ✅ `design.md:7` — the glossary has no option group entry (`docs/glossary/settings.md` has only **Toggle group** at line 12).
- ✅ `design.md:8` — `SettingsPage.tsx:113` maps `Object.values(ThemePreference)`, whose declaration order is `LIGHT`, `DARK`, `SYSTEM` (`src/preferences/preferences.ts:8-12`), with `THEME_OPTION_ICONS` / `THEME_OPTION_LABEL_KEYS` (`SettingsPage.tsx:22-32`); the hour format maps `Object.values(HourFormat)` (`H12`, `H24`) with `HOUR_FORMAT_LABEL_KEYS`. `parseStoredPreferences.ts:12` validates against `Object.values(ThemePreference)`.
- ✅ `design.md:9` — `SettingsToggleGroup.tsx:36-48` uses `div role="group" aria-labelledby` around a caption `<span>` and the row classes `flex flex-wrap items-center justify-between gap-x-4 gap-y-2`; caption classes `text-sm font-semibold text-muted-foreground`, as D5's constants restate.
- ✅ `design.md:9` — `src/constants/preferences.ts:48` holds `LANGUAGE_BUTTON_CLASS_NAME` and `:22` `ZONE_LABEL_PART_ORDER` (display order apart from enum order), and `constants/preferences.ts` already imports from `@/preferences`, so `THEME_PREFERENCE_ORDER` / `HOUR_FORMAT_PICTOGRAMS` can live there.
- ✅ `design.md:10` — `optionOf` is `getByRole("radio", { name, exact: true })` (`settingsE2eHelpers.ts:33-34`), choices use `check({ force: true })` (`settings_e2e.steps.ts:70`), "every settings option is at least {int} px high" measures every `label` that has a radio (`settings_e2e.steps.ts:160-172`), groups are found by `getByRole("radiogroup", { name })`.
- ✅ `design.md:11` — `readThemeIconColour` reads the first `svg` of the theme radiogroup (`settingsCreditE2eHelpers.ts:78-84`), `isCreditDirectlyAboveThemeGroup` searches the credit's next sibling for a radiogroup by `aria-label` (`:93-108`), the credit layout step reads `page.locator("legend").first()` (`settings_factory_credit_layout_e2e.steps.ts:85`), and the language step compares the theme radiogroup's width (`settings_language_layout_e2e.steps.ts:49-59`).
- ❌ `design.md:11` ("Some E2E helpers rely on the old markup") and `proposal.md:135` (Impact, tests) — the list is incomplete: the unit test `src/app/settings/SettingsPage.credit.test.tsx:39-44` also relies on the old nesting (`within(credit.nextElementSibling).getByRole("radiogroup", { name: "Theme" })`), which fails once the credit's next sibling is the radiogroup itself. See R2.
- ✅ `design.md:12` — `lucide-react` `^0.577.0` (`packages/client/package.json:36`); `--color-accent`, `--color-accent-foreground`, `--color-surface`, `--color-border` exist in both themes with the hex values D4 quotes (`src/styles/tokens.css:14-23, 35-44`); `readThemeColours` exists in `src/test/features/main_page/steps/themeTokens.ts:46` and has a `surface` field but no accent field, as task 6.1 states.
- ✅ `design.md:13` — no Storybook (no `.storybook/`, no script); approved screenshots live under `src/test/features/__screenshots__/{chromium,mobile-chrome}/`, 4 settings PNGs per project.
- ✅ `tasks.md:81` — the axe step "the locations screen has no accessibility violations" exists (`locations_view_a11y_e2e.steps.ts:34`); `createSettingsWorld` exists (`steps/settingsWorld.tsx:40`).
- ✅ `tasks.md:12` — `docs/architecture/views.md:112` reads "theme (Light, Dark, System)".
- ✅ `proposal.md:126` (M4) — the 6 named scenarios exist in `settings_e2e.feature` (lines 103, 110, 117, 125, 133, 144) and `settings_view_contract_e2e.feature` has exactly 2 scenarios (lines 10, 17).
- ✅ `proposal.md:18`, `:28` — locale texts are "12-hour"/"24-hour" and «12 часов»/«24 часа» (`en.json:121-122`, `ru.json:121-122`); only `en` and `ru` locale files exist, so the pictograms are contained in every accessible name (NFR-A3).
- ✅ MODIFIED requirements restated — **Theme preference** (`openspec/specs/settings/spec.md:33`), **Hour format** (`:56`), **Accessible settings** (`:264`), **Settings page layout** (`:287`) and **Toggle group** (`:577`) exist; every stable scenario of each is kept in the delta, and the requirement bodies keep all stable clauses except the ones the change replaces (check icon, radio layout of the toggle-group note).
- ✅ Not implemented already — no `THEME_PREFERENCE_ORDER`, `HOUR_FORMAT_PICTOGRAMS` or `SETTINGS_GROUP_ROW_CLASS_NAME` in `packages/client/src`, and no archived change under `openspec/changes/archive/` builds a compact option group.
- ❌ `proposal.md:7` — "three full-width rows (icon, label and check icon in each)": only the checked option draws a check icon (`SettingsOptionGroup.tsx:63-65`). No impact on what gets built; no finding.

## Coverage

| Requirement | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ Theme preference, "Icons only, in the order System, Light, Dark" | ✅ 4.1, 4.2, 6.1 |
| FR2 | ✅ | ✅ Theme preference, "Arrow keys follow the visual order" | ✅ 2.1, 4.1, 6.1 |
| FR3 | ✅ | ✅ Theme preference, "The stored theme is unchanged" + kept scenarios | ✅ 5.1, 6.2 |
| FR4 | ✅ | ✅ Hour format, "Pictograms in every language" | ✅ 2.1, 4.1, 6.1 |
| FR5 | ✅ | ✅ Option group, "Caption and options in one row" | ✅ 3.1, 6.1 |
| FR6 | ✅ | ✅ Option group, "A group with three options", "…shows its name"; Toggle group | ✅ 3.1–3.3, 5.1 |
| NFR-A1 | ✅ | ✅ Accessible settings, "Arrow keys follow the visual order", "Size, focus and checked fill" | ✅ 3.1, 6.1, 6.2 |
| NFR-A2 | ✅ | ✅ Accessible settings, "Size, focus and checked fill", "No violations" | ✅ 3.1, 6.1 |
| NFR-A3 | ✅ | ✅ Accessible settings + "Pictograms in every language" | ✅ 6.1 |
| NFR-R1 | ✅ | ✅ Settings page layout, "Compact groups", "Narrow and wide screens"; Option group row scenario | ✅ 6.1 |
| NFR-R2 | ✅ | ✅ Settings page layout, "Approved screenshots" | ✅ 7.1, 7.2 |
| UX1 | ✅ | ✅ Option group (caption at the start), row scenario | ✅ 6.1 |
| UX2 | ✅ | ✅ "Choosing moves nothing", checked fill in Accessible settings | ✅ 3.1, 6.1 |
| UX3 | ✅ | ✅ Option group (one joined control), Toggle group (separate toggles) | ✅ 3.1 |
| M1 | ✅ | n/a ("Compact groups" exists) | ✅ 6.1 |
| M2 | ✅ | n/a | ✅ 6.1 |
| M3 | ✅ | n/a | ✅ 6.1 |
| M4 | ✅ | n/a | ✅ 6.2 |
| G1 | ✅ | n/a — met by FR5, NFR-R1, M1 | n/a — met by FR5, M1 |
| G2 | ✅ | n/a — met by FR6 | n/a — met by FR6 |
| G3 | ✅ | n/a — met by FR3, FR4, M4 | n/a — met by FR3, M4 |
| NG1 | ✅ | n/a — nothing adds a setting, value or default | n/a |
| NG2 | ✅ | n/a — enum, document and declaration order untouched (D3) | n/a |
| NG3 | ✅ | n/a — zone label, language, credit, deploy time behaviour untouched; only test helpers adapt (6.3) | n/a |
| NG4 | ✅ | n/a — no locale key added (D2) | n/a |
| NG5 | ✅ | n/a — icons from installed `lucide-react` | n/a |

## Consistency

- The delta's **Accessible settings** (`openspec/changes/compact-settings-controls/specs/settings/spec.md:112`: "The checked option MUST be marked by a fill in the accent colour with its icon or pictogram in the accent foreground colour") makes the checked theme icon accent-foreground, while the unmodified stable **Gnomish Factory credit** requirement (`openspec/specs/settings/spec.md:336`) still says the credit has "the same colour as the icons of the theme options (the accent colour of the active theme)" and is "larger than the group legends", and its scenarios say "the colour of the theme option icons" (`:376-391`) and "larger than the group legends" (`:396`). Design D1 (`design.md:50`) and task 6.3 (`tasks.md:83-87`) redefine the helpers to read an unchecked icon and the caption instead of a legend, but no delta updates the requirement. See R1.

## Findings

### R1 — WARNING — Stable credit requirement left stale by the new checked fill and the removed legends
- Location: `openspec/changes/compact-settings-controls/specs/settings/spec.md:112` (Accessible settings, delta) against `openspec/specs/settings/spec.md:336` and `:376-391` (Gnomish Factory credit, not in the delta)
- Rule: `.claude/rules/delta-specs.md` (a requirement whose meaning the change alters is restated under MODIFIED)
- Problem: The change draws the checked option's icon in `--color-accent-foreground` (D4, `design.md:77`) and removes every `<legend>` from the settings page (D1). The stable **Gnomish Factory credit** requirement still defines the credit's colour as "the same colour as the icons of the theme options" and its font size as "larger than the group legends", and its scenarios "Token colours in both themes" and "The credit follows a theme change" compare with "the theme option icons". The change does not list this requirement under MODIFIED; it only rewires the step helpers in task 6.3 (unchecked icon, caption font size) and keeps the step text "the credit is larger than the group legends and smaller than the settings heading" (`tasks.md:87`, `settings_factory_credit_e2e.feature:102`), while the spec text stays, including the scenario "The larger credit text" (`openspec/specs/settings/spec.md:396`: "the credit text is larger than the group legends").
- Impact: After archiving, the stable spec says the credit matches "the icons of the theme options", but by default the first and checked icon (System) is white in the light theme and `#0b1220` in the dark theme, so the spec is false for one of the three icons and refers to legends that no longer exist. The tests then pass only because task 6.3 quietly reinterprets the spec; the next change that reads the spec (or rewrites the helper back to "the first icon") builds or tests the wrong colour.
- Fix: Add `### Requirement: Gnomish Factory credit` under `## MODIFIED Requirements` of the delta, restated in full from `openspec/specs/settings/spec.md:333-420` with these wording edits and no others. Body (`:336`): "the same colour as the icons of the theme options (the accent colour of the active theme)" → "the accent colour of the active theme, the colour of the unchecked theme option icons", and "larger than the group legends" → "larger than the group captions". Scenarios: "the colour of the theme option icons" → "the colour of the unchecked theme option icons" in "Token colours in both themes" (`:376`, `:378`, `:380`) and "The credit follows a theme change" (`:391`); "the credit text is larger than the group legends and smaller than the "Settings" heading" → "the credit text is larger than the group captions and smaller than the "Settings" heading" in "The larger credit text" (`:396`). Append `FR5, FR6 of compact-settings-controls` to its `implements` comment. In `proposal.md` What Changes, add one bullet "MODIFIED `settings` → **Gnomish Factory credit**: wording only — its colour is named as the accent colour of the unchecked theme icons and its size is compared with the group captions; behaviour unchanged." In `tasks.md` 6.3, replace "the step text stays" with: rename the step "the credit is larger than the group legends and smaller than the settings heading" to "the credit is larger than the group captions and smaller than the settings heading" in both `src/test/features/settings/settings_factory_credit_e2e.feature:102` and `src/test/features/settings/steps/settings_factory_credit_layout_e2e.steps.ts:81` (update its `:79` comment, and rename `legendSize` at `:85`, `:87` to `captionSize`), and run `npx bddgen -c playwright.bdd.config.ts` before the existing verify command. The colour step texts ("the colour of the theme icons", feature `:43`, `:45`, `:48`, `:60`) may stay: they already paraphrase rather than quote the spec scenarios, and the helper reads an unchecked icon.
- Fix risk: The restated requirement is long (≈9 scenarios); copying it must not drop or alter any other scenario, or archiving would remove or change it. Renaming the step touches one feature file and one step file under `packages/`, inside the implement stage's limits; the feature line and the step definition must be renamed together, or `bddgen` fails with a missing step definition. NG3 still holds because the credit's behaviour and colour do not change.
- Status: open

### R2 — SUGGESTION — The credit unit test that relies on the old nesting is not named in any task
- Location: `openspec/changes/compact-settings-controls/design.md:11`, `openspec/changes/compact-settings-controls/tasks.md:83`
- Rule: `.claude/rules/test-planning.md`
- Problem: `packages/client/src/app/settings/SettingsPage.credit.test.tsx:39-44` asserts `within(credit.nextElementSibling).getByRole("radiogroup", { name: "Theme" })`. Testing Library's `within` searches descendants only; with D1 the credit's next sibling is the radiogroup itself, so the query finds nothing and the test fails. Design lists only the E2E helpers that rely on the old markup, and no task names this unit test; task 4.2 runs only `SettingsPage.test.tsx` and `AppShell.settings.test.tsx`.
- Impact: The failure surfaces late, in the whole-suite run of task 7.3 (whose catch-all does cover a `fieldset`-caused failure), instead of next to task 4.2 where the markup changes.
- Fix: In `tasks.md` task 6.3 (or 4.2), add: "In `src/app/settings/SettingsPage.credit.test.tsx`, `expectThemeGroupRightAfter` accepts the credit's next element sibling when it is itself the radiogroup named "Theme" (same rule as `isCreditDirectlyAboveThemeGroup`), with `// Verifies FR5, FR6 of compact-settings-controls`; run `npx vitest run src/app/settings/SettingsPage.credit.test.tsx`." Add the file to design.md's list of tests relying on the old markup.
- Fix risk: none — the credit's position does not change, only the query.
- Status: open

## Verdict

Needs revision. Blocking: R1 (WARNING — the stable credit requirement contradicts the new checked fill and the removed legends). R2 is a non-blocking SUGGESTION. Everything else is ready to implement: every requirement has a scenario and an automated test task, the handoff has no human item, and no task leaves the implement stage's limits.
