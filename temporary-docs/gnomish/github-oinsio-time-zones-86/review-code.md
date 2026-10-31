# Review: add-gnomish-factory-credit

## Summary

| Item | Value |
|---|---|
| Tasks verified | 11/12 |
| Requirements traced | 25/27 |
| CRITICAL | 1 |
| WARNING | 0 |
| SUGGESTION | 0 |

## Tasks

- ✅ 1.1 — `docs/glossary/settings.md:5,10,11` adds **Gnomish Factory** (*Code:* `GNOMISH_FACTORY_LANDING_URL`, *RU:* «Гномская фабрика») and **Gnomish Factory credit** (*Code:* `GnomishFactoryCredit`, `settings.gnomishFactoryCredit`) and changes the **Settings page** entry; `grep -c "Gnomish Factory"` prints 3. `docs/architecture/views.md:111` extends the Settings overlay row.
- ✅ 2.1 — `packages/client/src/constants/api.ts:1-6` (JSDoc `Implements FR3 of add-gnomish-factory-credit (D3)`), re-exported at `constants/index.ts:1`; `locales/en.json:107` "Built with Gnomish Factory", `locales/ru.json:107` «Создано с помощью Гномской фабрики». The only production `https://` literal under `src/` is `constants/api.ts:6`.
- ✅ 3.1 — `app/settings/GnomishFactoryCredit.test.tsx:1-43`: `it.each` over `en`/`ru` checking role link, name and `textContent`; `href` equals the constant and the literal address; `target="_blank"`, `rel` contains `noopener` and `noreferrer`.
- ✅ 3.2 — `app/settings/GnomishFactoryCredit.tsx:11-24`: one `<a>` with `href={GNOMISH_FACTORY_LANDING_URL}`, `target="_blank"`, `rel="noopener noreferrer"`, `t("settings.gnomishFactoryCredit")`, D2 classes with the Stryker disable comment (line 18) and the required JSDoc (lines 8-9); `app/settings/index.ts` does not export it.
- ✅ 4.1 — `SettingsPage.test.tsx` is already 181 lines, so the tests went to `app/settings/SettingsPage.credit.test.tsx:27-48` as the task allows: credit is the banner's first `a, button` and precedes "Back" by `compareDocumentPosition`; the heading keeps focus, the credit does not.
- ✅ 4.2 — `app/settings/SettingsPage.tsx:58-78`: header is `flex flex-col gap-2 …`, first child `<GnomishFactoryCredit />`, back button/heading/spacer moved into the `grid grid-cols-[auto_1fr_auto]` `<div>`; JSDoc line 38. `self-center` is on the link itself (`GnomishFactoryCredit.tsx:19`) rather than on the usage — same effect.
- ✅ 5.1 — `test/features/settings/settings_factory_credit_e2e.feature:6-87` holds all seven scenarios with change and id tags; steps in `steps/settings_factory_credit_e2e.steps.ts:35-199` (each with a `// Verifies … of add-gnomish-factory-credit` comment) and helpers in `steps/settingsCreditE2eHelpers.ts` (route stub on `page.context()` at lines 25-30).
- ✅ 5.2 — `settings_e2e.feature:43,56,74`: tags added to "Both languages", the axe-core outline and the width outline; "Both languages" gains `And the Gnomish Factory credit is "<credit>"` with a `credit` column (lines 48-54), defined at `settings_factory_credit_e2e.steps.ts:96-101`.
- ❌ 6.1 — tags were added (`settings_e2e.feature:86`), but only the two 375 px baselines per project were re-approved. The 1024 px baselines (`__screenshots__/{chromium,mobile-chrome}/Approved-screenshots-of-the-settings-at-1024-px-in-the-{light,dark}-theme.png`) are untouched by the branch and still show the page without the credit line. The task's own verification ("`git status` lists the 4 settings PNGs of each project") does not hold. See R1.
- ✅ 7.1 — scores noted in the task; re-measured here (see Mutation): `GnomishFactoryCredit.tsx` 100%, `constants/api.ts` 100%, `SettingsPage.tsx` 91.67% with the two survivors on the pre-existing focus effect (lines 53-54).
- ✅ 7.2 — CI for the branch is green (typecheck, lint, unit, build and BDD E2E run there); not re-run in this review.
- ✅ 7.3 — the traceability loop run from `packages/client/` prints nothing.

## Requirements

- ✅ FR1 — `SettingsPage.tsx:59` renders the credit first in the header; whole text inside one `<a>` (`GnomishFactoryCredit.tsx:14-22`). Tests: `SettingsPage.credit.test.tsx:27-40`; E2E "The credit in both languages" (`settings_factory_credit_e2e.feature:6-16`, position check at steps lines 48-63).
- ✅ FR2 — `en.json`/`ru.json` key `settings.gnomishFactoryCredit`; unit `GnomishFactoryCredit.test.tsx:11-23`; E2E outlines in both feature files.
- ✅ FR3 — `href`, `target="_blank"`, `rel="noopener noreferrer"` (`GnomishFactoryCredit.tsx:15-17`); unit tests lines 25-42; E2E "Following the credit keeps the app" (popup URL + unchanged app URL + Moscow still at 10:30) and "The credit offline".
- ✅ FR4 — token classes `text-muted-foreground`, `hover:text-accent`, `focus-visible:text-accent`, `underline`, `focus-visible:outline-accent` (`GnomishFactoryCredit.tsx:19`); E2E "Token colours in the <theme> theme" compares computed colours with `readTokenStyle` (steps lines 104-161) and "The credit follows a theme change".
- ✅ NFR-A1 — link named by its text, Tab order and focus outline, 44 px (`min-h-11`); E2E "Keyboard order and focus" (feature lines 62-73), axe-core outline tagged in `settings_e2e.feature:56`; contrast at rest checked by axe-core, on focus the colour is asserted to equal `--color-accent`, whose contrast (5.50:1 light, 8.82:1 dark) is recorded in `design.md`.
- ✅ NFR-A2 — heading focus unchanged (`SettingsPage.tsx:52-54`); `SettingsPage.credit.test.tsx:42-48` and E2E step "the focus is on the settings heading" in "Keyboard order and focus".
- ✅ NFR-R1 — `text-center`, no `whitespace-nowrap`; E2E "The full credit at <width> px in <language>" (320 EN/RU, 2560 RU) and the tagged width outline in `settings_e2e.feature:74`.
- ❌ NFR-R2 — "The approved screenshots of the settings page at 375 px and 1024 px … are re-approved with the credit line": only the 375 px ones were; the 1024 px baselines still lack the credit (R1).
- ✅ UX1 — `text-sm` muted link, centred on its own line above the `text-2xl` heading; centre-alignment asserted in steps lines 48-63; visible in the re-approved 375 px baseline.
- ✅ UX2 — only existing tokens used; colour assertions in the token-colour outline.
- ✅ UX3 — new tab via `target="_blank"`; "the settings page is still shown" checks the app tab URL is unchanged (steps lines 89-93).
- ✅ M1 — name and address checked in both languages by "The credit in both languages"; first element checked by `SettingsPage.credit.test.tsx:27-40` and the above-heading E2E step.
- ✅ M2 — "Following the credit keeps the app" asserts one popup at the landing URL and the unchanged app URL.
- ✅ M3 — token-colour outline, light and dark × rest and focus.
- ✅ M4 — axe-core outline in `settings_e2e.feature:56` tagged with this change, both themes.
- ✅ M5 — width outlines at 320 and 2560 px in both languages (`settings_factory_credit_e2e.feature:75-87`).
- ⚠️ M6 — the 4 screenshot comparisons pass, but the two 1024 px baselines predate the credit and pass only within the 2.5 % `maxDiffPixelRatio`; they are not "re-approved baselines" (R1).
- ✅ M7 — Stryker on `GnomishFactoryCredit.tsx`: 100 % (measured in this review).
- ✅ M8 — the traceability loop of task 7.3 prints nothing.
- ✅ Scenario: The credit in both languages — `settings_factory_credit_e2e.feature:6-16` with steps lines 35-63.
- ✅ Scenario: Following the credit keeps the app — feature lines 18-28, steps lines 65-93.
- ✅ Scenario: The credit offline — feature lines 30-37, step lines 95-101.
- ✅ Scenario: Token colours in both themes — feature lines 39-53, steps lines 103-161.
- ✅ Scenario: The credit follows a theme change — feature lines 55-60.
- ✅ Scenario: Keyboard order and focus — feature lines 62-73, steps lines 163-193.
- ✅ Scenario: The full credit on narrow and wide screens — feature lines 75-87, step lines 195-199.
- ✅ Scenario: Both languages — `settings_e2e.feature:43-54` with the new credit column and step.

## Mutation

Measured with `npx stryker run --mutate 'src/app/settings/GnomishFactoryCredit.tsx,src/app/settings/SettingsPage.tsx,src/constants/api.ts'` (one run), read from `reports/mutation/mutation-report.json`:

- `src/app/settings/GnomishFactoryCredit.tsx` — 100.00 % (2 killed, 0 survived)
- `src/constants/api.ts` — 100.00 % (1 killed)
- `src/app/settings/SettingsPage.tsx` — 91.67 % (22 killed, 2 survived). Both survivors are on the pre-existing heading-focus effect, unchanged by this branch: line 53 `OptionalChaining` (`headingRef.current?.focus()` → `.focus()`, the ref is always set) and line 54 `ArrayDeclaration` (`[]` → `["Stryker was here"]`, a constant dependency is equivalent). No survivor sits in the lines this change added; not a finding.

## Findings

### R1 — CRITICAL — 1024 px settings screenshots were not re-approved with the credit
- Location: `packages/client/src/test/features/__screenshots__/chromium/Approved-screenshots-of-the-settings-at-1024-px-in-the-light-theme.png:1` (and the `…-1024-px-in-the-dark-theme.png` siblings in `chromium/` and `mobile-chrome/`)
- Rule: `openspec/changes/add-gnomish-factory-credit/proposal.md` NFR-R2, M6; `tasks.md` task 6.1 (ticked)
- Problem: Task 6.1 is ticked and NFR-R2 requires the settings screenshots "at 375 px and 1024 px in the light and the dark theme" to be re-approved with the credit line. The branch changes only the four 375 px PNGs (two per project); the four 1024 px PNGs are not in the branch diff, and the chromium 1024 px light baseline visibly shows the old header — back button and "Settings" with no "Built with Gnomish Factory" line. They still pass because `playwright.bdd.config.ts:32` sets `SCREENSHOT_MAX_DIFF_PIXEL_RATIO = 0.025` and the ~52 px header shift on a mostly empty 1024 px page stays under it; and Playwright 1.63's `--update-snapshots` preset is `changed`, which only rewrites snapshots that fail the comparison, so the task's command silently skipped them.
- Impact: A ticked task is not done and NFR-R2 / M6 are unmet. The 1024 px baselines — the wide-screen reference the proposal says "become the reference" — do not contain the credit, so a regression that drops or misplaces the credit at 1024 px would be compared against a baseline that never had it and could pass within the 2.5 % tolerance.
- Fix: From `packages/client/`, run `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_e2e.feature --grep "Approved screenshots of the settings" --update-snapshots=all`, open the 1024 px PNGs with the Read tool to confirm the credit line is centred above the back button and heading in both themes, then re-run without the flag and confirm `git status --short src/test/features/__screenshots__` lists the 1024 px PNGs of `chromium` and `mobile-chrome`. Commit only the settings PNGs (revert any other PNG that `all` rewrites, since `--grep` limits the run to the settings outline).
- Fix risk: `--update-snapshots=all` rewrites the 375 px baselines too; they should come out pixel-identical or near-identical, but if they differ only by anti-aliasing noise, keep the committed ones to avoid churn. No production code is touched.
- Status: open

## Verdict

Not ready — blocking: R1 (the 1024 px settings screenshots were never re-approved, so task 6.1 / NFR-R2 are not met). The component, constant, locales, glossary, unit tests and E2E scenarios are otherwise complete and traced, and the new production files score 100 % under Stryker.
