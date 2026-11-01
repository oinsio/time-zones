# Tasks

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter` or `git`, or say "from the repository root". "design Dn" refers to `design.md`.

- **Running tests:** one command at a time, never in the background. Stryker runs only with `--mutate`, at most 5 files per run. Its report is `reports/mutation/mutation-report.json`.
- **E2E runs:** every Playwright command after a `.feature` edit starts with `npx bddgen -c playwright.bdd.config.ts && ` (the order of the `test:bdd` script).
- **Traceability:** every new or changed test, step and scenario carries `keep-gnomish-factory-name-untranslated-in-credit`:
  - `@keep-gnomish-factory-name-untranslated-in-credit @FR-X` tags above scenarios. A changed scenario keeps its earlier tags and adds this change's tags.
  - `// Verifies FR-X of keep-gnomish-factory-name-untranslated-in-credit` (or `NFR-X`, `UX-X`) above steps and in Vitest files. In unit BDD steps, also `// @keep-gnomish-factory-name-untranslated-in-credit @FR-X` before `f.Scenario`.
- **Glossary:** use the terms of `docs/glossary/` (Gnomish Factory, Gnomish Factory credit, settings page).
- **File size:** every file stays under 200 lines.

## 1. Glossary (FR1, FR2; design D3)

- [ ] 1.1 In `docs/glossary/settings.md` (repository root):
  - **Gnomish Factory**: after "linked from the settings page." add "A brand name: written `Gnomish Factory` in every interface language, never translated." Change *RU:* «Гномская фабрика» to *RU:* «Gnomish Factory».  - **Gnomish Factory credit**: change *RU:* «Создано с помощью Гномской фабрики» to *RU:* «Создано с помощью Gnomish Factory». Keep the rest of the entry.

  Verify from the repository root: `grep -c "Создано с помощью Gnomish Factory" docs/glossary/settings.md` prints `1`, `grep -c "never translated" docs/glossary/settings.md` prints `1`, and `grep -n "Гномск" docs/glossary/settings.md` prints nothing.

## 2. The Russian credit and the guard for every language (FR1, FR2, UX1; TDD, design D1, D2)

- [ ] 2.1 RED, unit BDD for FR2 (design D2):
  - Create `test/features/settings/settings_factory_name.feature`: `Feature: The Gnomish Factory name in every interface language`, the line `Implements change keep-gnomish-factory-name-untranslated-in-credit.`, and one scenario tagged `@keep-gnomish-factory-name-untranslated-in-credit @FR2 @UX1`:

    ```gherkin
    Scenario: The factory name in every supported interface language
      When the Gnomish Factory credit is read in every supported interface language
      Then every credit contains the factory name "Gnomish Factory"
    ```

  - Create `test/features/settings/steps/settings_factory_name.steps.ts` with the vitest-cucumber pattern of `settings_hour_format_unit.steps.tsx`: `loadFeature("../settings_factory_name.feature")`, a `// Verifies FR2, UX1 of keep-gnomish-factory-name-untranslated-in-credit (D2).` header, and the tag comment before `f.Scenario`.
    - The When step maps `SUPPORTED_LANGUAGES` from `@/i18n` to `{ language, creditText: i18n.getFixedT(language)("settings.gnomishFactoryCredit") }` (`i18n` from `i18next`, set up by `src/test/setup.ts` with `localeResources`).
    - The Then step asserts, for each entry, `expect(creditText, language).toContain(factoryName)`, so a failure names the language. It also asserts that the list has `SUPPORTED_LANGUAGES.length` entries.

  Run `npx vitest run src/test/features/settings/steps/settings_factory_name.steps.ts` and see it fail for `ru`.
- [ ] 2.2 RED, component test for FR1: in `app/settings/GnomishFactoryCredit.test.tsx`, change the `ru` row of the `it.each` to `["ru", "Создано с помощью Gnomish Factory"]`. Add `// Verifies FR1, UX1 of keep-gnomish-factory-name-untranslated-in-credit (D1).` under the header comments. Run `npx vitest run src/app/settings/GnomishFactoryCredit.test.tsx` and see the `ru` case fail.
- [ ] 2.3 GREEN: in `locales/ru.json`, set `settings.gnomishFactoryCredit` to `"Создано с помощью Gnomish Factory"`. Leave `locales/en.json` and `app/settings/GnomishFactoryCredit.tsx` unchanged (D1). Verify, one at a time:
  - `npx vitest run src/test/features/settings/steps/settings_factory_name.steps.ts` passes;
  - `npx vitest run src/app/settings/GnomishFactoryCredit.test.tsx` passes;
  - `npx vitest run src/locales` passes.

## 3. E2E: the new Russian text in a real browser (FR1, NFR-A1, NFR-R1, UX1)

- [ ] 3.1 In `test/features/settings/settings_factory_credit_e2e.feature`:
  - In the outline "The credit in both languages", change the Russian `credit` cell to `Создано с помощью Gnomish Factory` and add the tags `@keep-gnomish-factory-name-untranslated-in-credit @FR1 @NFR-A1 @UX1`.
  - Add the tags `@keep-gnomish-factory-name-untranslated-in-credit @NFR-R1` above "The full credit at <width> px in <language>". Its steps and rows do not change.

  In `test/features/settings/steps/settings_factory_credit_e2e.steps.ts`, add `// Verifies FR1, NFR-A1, UX1 of keep-gnomish-factory-name-untranslated-in-credit: the Russian credit keeps the brand name.` above "the settings page shows the link {string} to the Gnomish Factory". Add `// Verifies NFR-R1 of keep-gnomish-factory-name-untranslated-in-credit.` above "the credit text is shown in full". Step bodies do not change. The file stays under 200 lines (178 now).

  Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_factory_credit_e2e.feature` passes.
- [ ] 3.2 In `test/features/settings/settings_e2e.feature`:
  - In the outline "Both languages", change the Russian `credit` cell to `Создано с помощью Gnomish Factory` and add the tags `@keep-gnomish-factory-name-untranslated-in-credit @FR1`.
  - Add the tags `@keep-gnomish-factory-name-untranslated-in-credit @NFR-A1` above "Settings have no accessibility violations in the <theme> theme".

  In `steps/settings_factory_credit_e2e.steps.ts`, add `// Verifies FR1 of keep-gnomish-factory-name-untranslated-in-credit.` above "the Gnomish Factory credit is {string}".

  Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_e2e.feature` passes. The approved screenshot scenarios in this run must pass without `--update-snapshots`: they show the English interface. `git status --short src/test/features/__screenshots__` must print nothing.

## 4. Final checks

- [ ] 4.1 Stryker, scoped: `npx stryker run --mutate 'src/app/settings/GnomishFactoryCredit.tsx'`. Read `reports/mutation/mutation-report.json`. The score must be at least 95 % (minimum acceptable 90 %). Note it in this task.
- [ ] 4.2 Run, one at a time:
  - `pnpm --filter @time-zones/client typecheck`;
  - `pnpm --filter @time-zones/client lint`;
  - `pnpm --filter @time-zones/client test`;
  - `pnpm run build` (from the repository root);
  - `pnpm --filter @time-zones/client test:bdd`.

  All pass.
- [ ] 4.3 From the repository root, `grep -rn "Гномск" packages/client/src docs/glossary` prints nothing (M3).
- [ ] 4.4 Traceability, from `packages/client/`: `for id in FR1 FR2 NFR-A1 NFR-R1 UX1; do grep -rlE "keep-gnomish-factory-name-untranslated-in-credit.*\b$id\b|\b$id\b.*keep-gnomish-factory-name-untranslated-in-credit" src >/dev/null || echo "missing $id"; done` prints nothing.

## Human follow-up

None. Every step of this change is a checkbox task above, including the glossary edit and the scoped Stryker run. The approved screenshots show the English interface and need no re-approval. The deliver stage pushes the branch and opens the pull request.
