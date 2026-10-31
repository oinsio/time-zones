# Tasks

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter` or `git`, or say "from the repository root". "design Dn" refers to `design.md`.

- **Running tests:** one command at a time, never in the background. Stryker runs only with `--mutate`, at most 5 files per run. Its report is `reports/mutation/mutation-report.json`.
- **E2E runs:** every Playwright command after a `.feature` edit starts with `npx bddgen -c playwright.bdd.config.ts && ` (the order of the `test:bdd` script).
- **Traceability:** every new or changed test, step and scenario carries `move-and-restyle-gnomish-factory-credit`:
  - `@move-and-restyle-gnomish-factory-credit @FR-X` tags above scenarios. A changed scenario keeps its `@add-gnomish-factory-credit` tags and adds this change's tags.
  - `// Verifies FR-X of move-and-restyle-gnomish-factory-credit` (or `NFR-X`, `UX-X`) above E2E steps and in Vitest files.
  - `Implements FR-X of move-and-restyle-gnomish-factory-credit (Dn)` in the JSDoc of changed production code.
- **Glossary:** use the terms of `docs/glossary/` (settings page, theme preference, Gnomish Factory credit).
- **File size:** every file stays under 200 lines.

## 1. Glossary and architecture docs (FR1)

- [x] 1.1 Update the docs (repository root):
  - In `docs/glossary/settings.md`, change the **Gnomish Factory credit** entry from "the top line of the settings page, one link …" to "the line of the settings page above the theme preference, one link "Built with Gnomish Factory" to the factory's landing page, opened in a new tab". Keep its *Code:* and *RU:* parts.
  - In `docs/architecture/views.md`, change the Settings overlay row from "the Gnomish Factory credit as the top line;" to "the Gnomish Factory credit above the theme;".

  Verify from the repository root: `grep -n "Gnomish Factory credit" docs/glossary/settings.md docs/architecture/views.md | grep -c "top line"` prints `0`, and `grep -c "above the theme" docs/glossary/settings.md docs/architecture/views.md` prints `1` for each file.

## 2. The credit's place on the settings page (FR1, NFR-A1, UX1; TDD, design D1)

- [x] 2.1 RED: in `app/settings/SettingsPage.credit.test.tsx`:
  - Add `// Verifies FR1, NFR-A1, UX1 of move-and-restyle-gnomish-factory-credit (D1).`
  - Replace the test "should show the Gnomish Factory credit as the first element of the header" with:
    - "should not show the credit in the header": `within(screen.getByRole("banner")).queryByRole("link")` is `null`.
    - "should show the credit directly above the theme group": the credit is inside `screen.getByRole("main")`, and its `nextElementSibling` contains `getByRole("radiogroup", { name: "Theme" })`.
    - "should show the unreadable note above the credit": render with `createInMemoryPreferencesRepository({ initialDocument: { status: PreferencesLoadStatus.UNREADABLE } })` (`PreferencesLoadStatus` from `@/ports`, as `SettingsPage.test.tsx` does). The `alert` comes before the credit by `compareDocumentPosition`, and the credit's `nextElementSibling` still contains the radio group "Theme".
  - Keep "should keep the focus on the heading with the credit shown".

  Run `npx vitest run src/app/settings/SettingsPage.credit.test.tsx` and see the new tests fail.
- [x] 2.2 GREEN: in `app/settings/SettingsPage.tsx`, apply design D1:
  - The `<header>` becomes `grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-border pt-6 pb-4`, with the back button, the heading and the spacer as its direct children. The inner `<div>` goes away.
  - `<GnomishFactoryCredit />` moves into `<main>`, right after the save-failed note and right before the theme `SettingsOptionGroup`.
  - Add `Implements FR1, NFR-A1, UX1 of move-and-restyle-gnomish-factory-credit (D1).` to the JSDoc.

  Verify, one at a time: `npx vitest run src/app/settings` and `npx vitest run src/app/AppShell.settings.test.tsx` pass.

## 3. Colour and size of the credit (FR2, FR3, UX2, NFR-A2; TDD, design D2, D3)

- [x] 3.1 In `tailwind.config.ts` (`packages/client/`), add the constants `CREDIT_FONT_SIZE = "1.03125rem"` and `CREDIT_LINE_HEIGHT = "1.5rem"` next to `MANROPE_FONT_FAMILY`, each with a JSDoc that names `FR3 of move-and-restyle-gnomish-factory-credit (D3)`. Add `fontSize: { credit: [CREDIT_FONT_SIZE, CREDIT_LINE_HEIGHT] }` to `theme.extend`. Verify `pnpm --filter @time-zones/client typecheck` passes.
- [x] 3.2 RED: in `app/settings/GnomishFactoryCredit.test.tsx`:
  - Add `// Verifies FR2, FR3, UX2 of move-and-restyle-gnomish-factory-credit (D2, D3).`
  - Add the test "should use the accent colour and the credit font size": the link has the classes `text-accent` and `text-credit`, and has neither `text-muted-foreground` nor `text-sm`.

  Run `npx vitest run src/app/settings/GnomishFactoryCredit.test.tsx` and see it fail.
- [x] 3.3 GREEN: in `app/settings/GnomishFactoryCredit.tsx`, apply D2 and D3 to the class string:
  - `text-sm` → `text-credit`;
  - `text-muted-foreground` → `text-accent`;
  - drop `hover:text-accent` and `focus-visible:text-accent`;
  - keep the rest and the `// Stryker disable next-line StringLiteral` comment.

  Change the JSDoc so it no longer says the credit is on top. Add `Implements FR2, FR3, UX2 of move-and-restyle-gnomish-factory-credit (D2, D3).` Verify `npx vitest run src/app/settings/GnomishFactoryCredit.test.tsx` passes.

## 4. E2E: place, colour, size and keyboard in a real browser (FR1–FR3, NFR-A1, NFR-A2, NFR-R1, UX1, UX2)

- [ ] 4.1 In `test/features/settings/steps/settingsCreditE2eHelpers.ts`, add these helpers (design D4):
  - `FORMER_CREDIT_FONT_SIZE_PX = 14`, `MIN_CREDIT_FONT_SIZE_RATIO = 1.15`, `MAX_CREDIT_FONT_SIZE_RATIO = 1.2` and `TAB_KEY = "Tab"`;
  - `themeIconOf(page)`: the first `svg` in the radio group named "Theme" or «Тема», found by `RADIOGROUP_ROLE` from `settingsE2eHelpers.ts` and a name pattern like `ANY_LANGUAGE_BACK_BUTTON_NAME`;
  - `readThemeIconColour(page)`: the icon's computed `color`;
  - `readCreditFontSizeRatio(page)`: the credit's computed `font-size` in px divided by `FORMER_CREDIT_FONT_SIZE_PX`;
  - `isCreditDirectlyAboveThemeGroup(page)`: the credit's `nextElementSibling` contains the theme radio group.

  Verify `wc -l` of the file stays under 200 and `pnpm --filter @time-zones/client typecheck` passes.
- [ ] 4.2 Update `test/features/settings/settings_factory_credit_e2e.feature` and `steps/settings_factory_credit_e2e.steps.ts`. Each new or changed step gets its `// Verifies … of move-and-restyle-gnomish-factory-credit` comment. If the steps file would pass 200 lines, put the steps of the new place and size checks into `steps/settings_factory_credit_layout_e2e.steps.ts`, with the same `createBdd(test)` import.
  - Outline "The credit in both languages" (add `@move-and-restyle-gnomish-factory-credit @FR1 @UX1`):
    - "the first line of the settings page is the link {string} to the Gnomish Factory" becomes "the settings page shows the link {string} to the Gnomish Factory" (same check);
    - "the credit stands above the back button and the settings heading" becomes "the credit stands below the settings heading and directly above the theme group". The credit's box top is ≥ the heading's box bottom, `isCreditDirectlyAboveThemeGroup` is true, and the credit's centre is within `CENTRE_TOLERANCE_PX` of the theme group's centre.
  - New scenario "The credit below a settings note" (`@move-and-restyle-gnomish-factory-credit @FR1`): reusing "the stored preferences are unreadable", "the user opens the settings" and "the settings show the unreadable note with Reset". Then a new "the unreadable note stands above the credit" (the `alert` box bottom ≤ the credit's box top) and the "directly above the theme group" step above.
  - Outline "Token colours in the <theme> theme" keeps its name (add `@move-and-restyle-gnomish-factory-credit @FR2 @UX2 @NFR-A2`):
    - "the credit text has the muted foreground colour and is underlined" becomes "the credit text has the colour of the theme icons and is underlined" (`expect.poll` of the credit's `color` equals `readThemeIconColour`, and `text-decoration-line` contains `underline`);
    - "the credit gets the keyboard focus" now presses `TAB_KEY` once from the focused heading;
    - "the credit text has the accent colour with an accent focus outline" becomes "the credit text keeps the colour of the theme icons with an accent focus outline" (the colour as above; `outline-color` equals `readTokenStyle(page, "outline-color", ACCENT_TOKEN)`, and `outline-style` is not `none`);
    - after hover, "the credit text has the accent colour" becomes "the credit text keeps the colour of the theme icons".
    - Remove step definitions no scenario uses any more (`MUTED_FOREGROUND_TOKEN` too, if unused).
  - "The credit follows a theme change" (add `@move-and-restyle-gnomish-factory-credit @FR2`): its last step becomes "the credit text has the colour of the theme icons and is underlined". The icon's colour is read after the change, so it is the dark one.
  - New scenario "The larger credit text" (`@move-and-restyle-gnomish-factory-credit @FR3 @UX1`): "the user opens the settings", then "the credit's font size is 15 to 20 % larger than before" (`readCreditFontSizeRatio` is between `MIN_CREDIT_FONT_SIZE_RATIO` and `MAX_CREDIT_FONT_SIZE_RATIO`), then "the credit is larger than the group legends and smaller than the settings heading" (the credit's computed `font-size` is strictly greater than that of the theme group's `legend` and strictly smaller than that of `settingsHeading(page)`).
  - "Keyboard order and focus" (add `@move-and-restyle-gnomish-factory-credit @NFR-A1`): "the focus is on the settings heading". Then `the user presses the key "Tab"` (the existing generic step of `time_selection/steps/time_selection_pointer_e2e.steps.ts`; no new Tab step is defined), then "the credit has the focus" and "the credit is at least 44 px high". Then "the user presses Shift+Tab" and "the focus is on the back button". Then `the user presses the key "Tab"` and "the user presses Enter", then "a new tab opens at the Gnomish Factory landing page".
  - Outline "The full credit at <width> px in <language>": add `@move-and-restyle-gnomish-factory-credit @NFR-R1`, steps unchanged.

  Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_factory_credit_e2e.feature` passes, and `wc -l` of every changed steps file is under 200.
- [ ] 4.3 In `test/features/settings/settings_e2e.feature`, add the tags `@move-and-restyle-gnomish-factory-credit @NFR-A2` above "Settings have no accessibility violations in the <theme> theme" and above "No violations with the unreadable note". Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_e2e.feature --grep "accessibility violations|No violations with the unreadable note"` passes.

## 5. Screenshots (NFR-R2)

- [ ] 5.1 Add the tags `@move-and-restyle-gnomish-factory-credit @NFR-R2` above "Approved screenshots of the settings at <width> px in the <theme> theme" in `test/features/settings/settings_e2e.feature`.
  - Re-approve: `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_e2e.feature --grep "Approved screenshots of the settings" --update-snapshots`.
  - Open the changed 375 px PNGs under `src/test/features/__screenshots__/chromium/` with the Read tool. Confirm that the header holds only the back button and the heading. Confirm that the credit is centred right above the theme group, underlined and in the colour of the theme icons (the size relation is asserted by "The larger credit text" in 4.2).
  - Verify by running the same command again without `--update-snapshots`: it passes. `git status --short src/test/features/__screenshots__` lists the 4 settings PNGs of each project that runs them (chromium, mobile-chrome) and no other file.

## 6. Final checks

- [ ] 6.1 Stryker, scoped: `npx stryker run --mutate 'src/app/settings/GnomishFactoryCredit.tsx,src/app/settings/SettingsPage.tsx'`. Read `reports/mutation/mutation-report.json`. Kill survivors with Vitest tests in `app/settings/` until each file scores at least 95 % (minimum acceptable 90 %), and note the scores in this task. A survivor that was in the score of `add-gnomish-factory-credit` before this change may be noted as pre-existing, with its line.
- [ ] 6.2 Run, one at a time:
  - `pnpm --filter @time-zones/client typecheck`;
  - `pnpm --filter @time-zones/client lint`;
  - `pnpm --filter @time-zones/client test`;
  - `pnpm run build` (from the repository root);
  - `pnpm --filter @time-zones/client test:bdd`.

  All pass.
- [ ] 6.3 Traceability, from `packages/client/`: `for id in FR1 FR2 FR3 NFR-A1 NFR-A2 NFR-R1 NFR-R2 UX1 UX2; do grep -rlE "move-and-restyle-gnomish-factory-credit.*\b$id\b|\b$id\b.*move-and-restyle-gnomish-factory-credit" src >/dev/null || echo "missing $id"; done` prints nothing.

## Human follow-up

None. Every step of this change is a checkbox task above, including the docs edit, the screenshot re-approval and the scoped Stryker run. The deliver stage pushes the branch and opens the pull request.
