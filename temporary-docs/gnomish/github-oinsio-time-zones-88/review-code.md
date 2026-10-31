# Review: move-and-restyle-gnomish-factory-credit

## Summary

| Item | Value |
|---|---|
| Tasks verified | 12/13 |
| Requirements traced | 25/27 |
| CRITICAL | 1 |
| WARNING | 0 |
| SUGGESTION | 0 |

## Tasks

- ✅ 1.1 Glossary and views docs updated. `docs/glossary/settings.md:11` reads "the line of the settings page above the theme preference …" and keeps *Code:* and *RU:*. `docs/architecture/views.md:111` reads "the Gnomish Factory credit above the theme;". No "top line" is left for the credit.
- ✅ 2.1 `packages/client/src/app/settings/SettingsPage.credit.test.tsx:2` carries the traceability comment. The tests "should not show the credit in the header" (:39), "should show the credit directly above the theme group" (:44) and "should show the unreadable note above the credit" (:51) use `PreferencesLoadStatus.UNREADABLE` and `compareDocumentPosition`. The focus test is kept (:65).
- ✅ 2.2 `packages/client/src/app/settings/SettingsPage.tsx:59` makes the `<header>` the single grid row with the back button, the `h1` and the spacer. `<GnomishFactoryCredit />` is at :98, after the save-failed note and before the theme `SettingsOptionGroup`. The JSDoc line is at :39.
- ✅ 3.1 `packages/client/tailwind.config.ts:8-12` adds `CREDIT_FONT_SIZE = "1.03125rem"` and `CREDIT_LINE_HEIGHT = "1.5rem"`, each with a JSDoc naming FR3 (D3). `fontSize: { credit: [...] }` is in `theme.extend` (:21).
- ✅ 3.2 `packages/client/src/app/settings/GnomishFactoryCredit.test.tsx:2` carries the comment. The test "should use the accent colour and the credit font size" is at :36-43.
- ✅ 3.3 `packages/client/src/app/settings/GnomishFactoryCredit.tsx:20` uses the class string with `text-credit text-accent`. `text-sm`, `text-muted-foreground`, `hover:text-accent` and `focus-visible:text-accent` are gone, and the Stryker disable comment is kept (:19). The JSDoc (:5, :10) names the new place and FR2, FR3, UX2.
- ✅ 4.1 `packages/client/src/test/features/settings/steps/settingsCreditE2eHelpers.ts:17-21` adds the constants and `ANY_LANGUAGE_THEME_GROUP_NAME`. `themeGroupOf`, `themeIconOf`, `readThemeIconColour`, `readCreditFontSizeRatio` and `isCreditDirectlyAboveThemeGroup` are at :75-108. `MUTED_FOREGROUND_TOKEN` is removed. The file has 108 lines.
- ✅ 4.2 `settings_factory_credit_e2e.feature` has the retagged and reworded scenarios (:6-75) and the new scenarios "The credit below a settings note" (:91) and "The larger credit text" (:99). The steps are in `settings_factory_credit_e2e.steps.ts` (178 lines; colour steps :84-140, Tab at :98) and the new `settings_factory_credit_layout_e2e.steps.ts` (place, note and size). "Keyboard order and focus" reuses `the user presses the key "Tab"`. I ran the credit, unreadable-note and axe scenarios: 118 passed.
- ✅ 4.3 `settings_e2e.feature` tags "Settings have no accessibility violations in the <theme> theme" and "No violations with the unreadable note" with `@move-and-restyle-gnomish-factory-credit @NFR-A2`. Both pass in my run.
- ❌ 5.1 The tags are added (`settings_e2e.feature:86`), and the 375 px baselines were re-approved in `chromium/` and `mobile-chrome/`. The four 1024 px baselines were not: their only commits are `73ea5c1` and `b5b2432`, which predate this change. They still show the credit above the heading in the muted colour. The task's claim that `git status` lists "the 4 settings PNGs of each project" is false: only 2 per project changed. See R1.
- ✅ 6.1 Scores noted in tasks.md. My scoped run gives the same figures: `GnomishFactoryCredit.tsx` 100 % and `SettingsPage.tsx` 91.67 %. The two survivors are pre-existing, at `SettingsPage.tsx:54-55`.
- ✅ 6.2 CI is green for the implement stage. I re-ran the affected E2E subset (118 passed), the 1024 px screenshot scenarios (4 passed) and scoped Stryker, which runs the Vitest suite of these files, with no failure.
- ✅ 6.3 The traceability loop, run from `packages/client/`, prints nothing.

## Requirements

- ✅ FR1 — `SettingsPage.tsx:98` puts the credit in `<main>` right before the theme group, and the header (:59) no longer holds it. Covered by the Vitest tests at `SettingsPage.credit.test.tsx:39-63` and by the E2E scenarios "The credit in both languages" and "The credit below a settings note" (`settings_factory_credit_layout_e2e.steps.ts`, box positions plus `isCreditDirectlyAboveThemeGroup`).
- ✅ FR2 — `GnomishFactoryCredit.tsx:20` sets `text-accent`, the same utility as the theme icons (`SettingsOptionGroup.tsx`, `className="text-accent"`). The E2E "Token colours in the <theme> theme" and "The credit follows a theme change" compare the credit's computed `color` with `readThemeIconColour` at rest, on focus, on hover and after the scheme change.
- ✅ FR3 — `text-credit` comes from `tailwind.config.ts:21` and is 16.5 px. The E2E "The larger credit text" asserts a ratio of 1.15–1.20 to 14 px.
- ✅ NFR-A1 — DOM order in `SettingsPage.tsx` is back button → notes → credit → theme group. The E2E "Keyboard order and focus" covers heading → Tab → credit (≥ 44 px), Shift+Tab → back button, and Tab, Enter → new tab. The note-before-credit order, which gives Shift+Tab → Reset, is asserted by `SettingsPage.credit.test.tsx:51`.
- ✅ NFR-A2 — The accent token is used. The axe outlines in `settings_e2e.feature` are tagged `@NFR-A2` and pass in both themes and with the unreadable note.
- ✅ NFR-R1 — The outline "The full credit at <width> px in <language>" is tagged `@NFR-R1` and passes at 320/2560 px.
- ⚠️ NFR-R2 — Only the 375 px baselines were re-approved. The 1024 px light and dark baselines (chromium, mobile-chrome) still show the old credit place and colour, and pass only within `SCREENSHOT_MAX_DIFF_PIXEL_RATIO = 0.025`. See R1.
- ✅ UX1 — The credit is centred above the theme group (`self-center`; the E2E centre check against the theme group is within `CENTRE_TOLERANCE_PX`). It is larger than the legends and smaller than the heading (E2E "The larger credit text").
- ✅ UX2 — The credit's computed colour equals the sun icon's colour in both themes (E2E "Token colours in the <theme> theme").
- ✅ M1 — "The credit in both languages" (2 languages) and "The credit below a settings note" (1 check) pass.
- ✅ M2 — "Token colours" × 2 themes × rest, focus and hover gives 6 checks, plus "The credit follows a theme change". All pass.
- ✅ M3 — "The larger credit text" passes (16.5 / 14 = 1.179).
- ✅ M4 — "Keyboard order and focus" passes.
- ✅ M5 — The axe outline passes in light and dark.
- ✅ M6 — The full-credit outline passes for English 320, Russian 320 and Russian 2560.
- ⚠️ M7 — The 4 screenshots pass in both projects, but the 1024 px pair is compared with the old, non-re-approved baselines, not with "re-approved baselines". See R1.
- ✅ M8 — Measured: `GnomishFactoryCredit.tsx` 100 %. `SettingsPage.tsx` is 91.67 %, at the minimum acceptable; its 2 survivors are in untouched lines 54-55.
- ✅ M9 — The traceability loop prints nothing.
- ✅ Scenario: The credit in both languages — `settings_factory_credit_e2e.feature:7`, steps in `settings_factory_credit_e2e.steps.ts:35` and `settings_factory_credit_layout_e2e.steps.ts`. Passes.
- ✅ Scenario: The credit below a settings note — `settings_factory_credit_e2e.feature:91`. Passes.
- ✅ Scenario: Following the credit keeps the app — `settings_factory_credit_e2e.feature:19` is unchanged. Passes.
- ✅ Scenario: The credit offline — `settings_factory_credit_e2e.feature:31` is unchanged. Passes.
- ✅ Scenario: Token colours in both themes — `settings_factory_credit_e2e.feature:40`. Passes.
- ✅ Scenario: The credit follows a theme change — `settings_factory_credit_e2e.feature:56`. Passes.
- ✅ Scenario: The larger credit text — `settings_factory_credit_e2e.feature:99`. Passes.
- ✅ Scenario: Keyboard order and focus — `settings_factory_credit_e2e.feature:63`. Passes.
- ✅ Scenario: The full credit on narrow and wide screens — `settings_factory_credit_e2e.feature:77`. Passes.

## Mutation

Command: `cd packages/client && npx stryker run --mutate 'src/app/settings/GnomishFactoryCredit.tsx,src/app/settings/SettingsPage.tsx'`. Report: `packages/client/reports/mutation/mutation-report.json`.

- `src/app/settings/GnomishFactoryCredit.tsx`: 100.00 % (2 killed, 0 survived).
- `src/app/settings/SettingsPage.tsx`: 91.67 % (22 killed, 2 survived). The survivors are the optional chaining in `headingRef.current?.focus()` (:54) and the `[]` dependency array (:55) of the heading-focus effect. This change did not touch those lines, so they are not a finding.
- `packages/client/tailwind.config.ts` is build configuration, outside Stryker's `src/` mutate scope. Its effect is covered by the E2E font-size scenario.

## Findings

### R1 — CRITICAL — The 1024 px settings screenshots were not re-approved
- Location: `packages/client/src/test/features/settings/settings_e2e.feature:97`
- Rule: `.claude/rules/test-planning.md` ("Visual regression tests — catch unintended visual changes"); task 5.1 and NFR-R2 of this change
- Problem: Task 5.1 is ticked and NFR-R2 requires re-approval of the settings screenshots "at 375 px and 1024 px in the light and the dark theme … with the credit in its new place, colour and size". Only the four 375 px PNGs changed (`__screenshots__/{chromium,mobile-chrome}/Approved-screenshots-of-the-settings-at-375-px-…`). The four 1024 px baselines (`…-at-1024-px-in-the-{light,dark}-theme.png` in `chromium/` and `mobile-chrome/`) were last written by `b5b2432` (add-gnomish-factory-credit). They still show "Built with Gnomish Factory" in the muted colour above the back button and the heading. The scenarios rows `| 1024 | light |` and `| 1024 | dark |` (:97-98) pass only because the changed pixels stay under `SCREENSHOT_MAX_DIFF_PIXEL_RATIO = 0.025` (`playwright.bdd.config.ts:32`); I ran them and all 4 pass. The cause: Playwright 1.63's bare `--update-snapshots` defaults to mode `changed`, which rewrites only the baselines that fail.
- Impact: The task is ticked but not done, and NFR-R2 and M7 are not met at 1024 px. The approved desktop reference still documents the old layout. Because the tolerance absorbs the move, a regression at 1024 px is not caught: for example, the credit going back into the header in the muted colour. Those are exactly the visual properties this change is about.
- Fix: From `packages/client/`, run `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "Approved screenshots of the settings at 1024" --update-snapshots=all`. Open the 4 rewritten 1024 px PNGs and confirm that the header holds only the back button and the heading, and that the credit is centred above "Theme" in the accent colour. Rerun the same command without `--update-snapshots` and confirm it passes. Change the re-approval command in tasks.md 5.1 to `--update-snapshots=all` so the record matches what was run.
- Fix risk: Low. The `--grep` limits the rewrite to the four 1024 px settings baselines (two per project). The 375 px baselines and all other screenshots stay untouched. The new PNGs are rendered in the same environment that produced the re-approved 375 px ones.
- Status: open

## Verdict

Not ready. Blocking: R1. The 1024 px settings screenshots must be re-approved so that task 5.1, NFR-R2 and M7 hold. The code itself (place, colour, size, keyboard order, tests and traceability) is correct, and the scoped mutation scores meet the threshold.
