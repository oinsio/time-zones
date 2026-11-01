# Review: keep-gnomish-factory-name-untranslated-in-credit

## Summary

| Item | Value |
|---|---|
| Tasks verified | 9/10 |
| Requirements traced | 24/24 |
| CRITICAL | 1 |
| WARNING | 0 |
| SUGGESTION | 0 |

## Tasks

- ✅ 1.1 — `docs/glossary/settings.md:10` adds "A brand name: written `Gnomish Factory` in every interface language, never translated." and *RU:* «Gnomish Factory»; `docs/glossary/settings.md:11` *RU:* «Создано с помощью Gnomish Factory». `grep -rn "Гномск" docs/glossary` prints nothing.
- ✅ 2.1 — `packages/client/src/test/features/settings/settings_factory_name.feature:6-9` (tags `@keep-gnomish-factory-name-untranslated-in-credit @FR2 @UX1`, the scenario text from the task); `packages/client/src/test/features/settings/steps/settings_factory_name.steps.ts:1,13,20-25,31-34` (header comment, tag comment, `SUPPORTED_LANGUAGES.map` with `i18n.getFixedT(language)`, `toHaveLength(SUPPORTED_LANGUAGES.length)` and `expect(creditText, language).toContain(factoryName)`).
- ✅ 2.2 — `packages/client/src/app/settings/GnomishFactoryCredit.test.tsx:3` traceability comment, `:16` row `["ru", "Создано с помощью Gnomish Factory"]`.
- ✅ 2.3 — `packages/client/src/locales/ru.json:107` is `"Создано с помощью Gnomish Factory"`; `en.json` and `GnomishFactoryCredit.tsx` are not in the branch diff. `npx vitest run` on the steps file, the component test and `src/locales` passes (3 files, 13 tests).
- ✅ 3.1 — `packages/client/src/test/features/settings/settings_factory_credit_e2e.feature:6` tags `@FR1 @NFR-A1 @UX1`, `:16` Russian cell `Создано с помощью Gnomish Factory`, `:76` tag `@NFR-R1`; step comments at `steps/settings_factory_credit_e2e.steps.ts:35` and `:176`; file is 181 lines.
- ✅ 3.2 — `packages/client/src/test/features/settings/settings_e2e.feature:43` tag `@FR1`, `:53` Russian cell, `:56` tag `@NFR-A1`; step comment at `steps/settings_factory_credit_e2e.steps.ts:78`. No file under `src/test/features/__screenshots__` is changed by the branch.
- ❌ 4.1 — ticked but not done: `tasks.md:62` says "Note it in this task." and no score is noted there. The score itself, measured in this review, is 100 % for `src/app/settings/GnomishFactoryCredit.tsx` (see Mutation); the missing note is R1.
- ✅ 4.2 — CI is green for the branch (stage precondition); the targeted Vitest files pass in this review.
- ✅ 4.3 — `grep -rn "Гномск" packages/client/src docs/glossary` prints nothing (run in this review).
- ✅ 4.4 — the traceability loop for FR1, FR2, NFR-A1, NFR-R1, UX1 prints nothing (run in this review from `packages/client/`).

## Requirements

- ✅ FR1 — `packages/client/src/locales/ru.json:107`; covered by `GnomishFactoryCredit.test.tsx:14-16` (link named by the whole text, `ru` row), and E2E rows `settings_factory_credit_e2e.feature:16` (link name) and `settings_e2e.feature:53` (text), both tagged `@keep-gnomish-factory-name-untranslated-in-credit @FR1`.
- ✅ FR2 — `steps/settings_factory_name.steps.ts:20-34` loops over `SUPPORTED_LANGUAGES` and fails with the language as message; `settings_factory_name.feature:6` tagged `@FR2`.
- ✅ NFR-A1 — link name by visible text checked at `steps/settings_factory_credit_e2e.steps.ts:36-45` (`exact: true`); axe-core outline `settings_e2e.feature:56-57` tagged `@NFR-A1` of this change.
- ✅ NFR-R1 — `settings_factory_credit_e2e.feature:76-77` (Russian rows at 320 and 2560 px) tagged `@NFR-R1`; step `steps/settings_factory_credit_e2e.steps.ts:176-178` (`measureCreditFit`).
- ✅ UX1 — Latin "Gnomish Factory" in `ru.json:107`; checked by `settings_factory_name.feature:6` (`@UX1`) and `settings_factory_credit_e2e.feature:6` (`@UX1`).
- ✅ M1 — the two E2E rows `settings_factory_credit_e2e.feature:16` and `settings_e2e.feature:53` expect the new text; the old text appears nowhere in `packages/client/src`.
- ✅ M2 — `steps/settings_factory_name.steps.ts:20,31` derive the list from `SUPPORTED_LANGUAGES` (`en`, `ru`) and assert its length; the test passes.
- ✅ M3 — `grep -rn "Гномск" packages/client/src docs/glossary` finds 0 lines.
- ✅ M4 — axe-core outline `settings_e2e.feature:56-64` runs in light and dark.
- ✅ M5 — `settings_factory_credit_e2e.feature:76-89` Russian rows at 320 and 2560 px check full text and no horizontal scroll.
- ✅ M6 — the branch diff touches no file under `src/test/features/__screenshots__`; the screenshot outline `settings_e2e.feature:87` is unchanged and shows the English interface.
- ✅ M7 — Stryker on `src/app/settings/GnomishFactoryCredit.tsx`: 100 % (measured here).
- ✅ M8 — the task 4.4 loop prints nothing.
- ✅ Scenario: Both languages — `settings_e2e.feature:43-54`, Russian row `Создано с помощью Gnomish Factory`; step `steps/settings_factory_credit_e2e.steps.ts:79-84`.
- ✅ Scenario: The factory name is never translated — `settings_factory_name.feature:7-9` with `steps/settings_factory_name.steps.ts`.
- ✅ Scenario: The credit in both languages — `settings_factory_credit_e2e.feature:6-16`; step `steps/settings_factory_credit_e2e.steps.ts:36-45`.
- ✅ Scenario: The credit below a settings note — `settings_factory_credit_e2e.feature:91`, unchanged; the change touches only text.
- ✅ Scenario: Following the credit keeps the app — `settings_factory_credit_e2e.feature:19`, unchanged.
- ✅ Scenario: The credit offline — `settings_factory_credit_e2e.feature:31`, unchanged (English text, as the spec says).
- ✅ Scenario: Token colours in both themes — `settings_factory_credit_e2e.feature:40`, unchanged.
- ✅ Scenario: The credit follows a theme change — `settings_factory_credit_e2e.feature:56`, unchanged.
- ✅ Scenario: The larger credit text — `settings_factory_credit_e2e.feature:99`, unchanged.
- ✅ Scenario: Keyboard order and focus — `settings_factory_credit_e2e.feature:63`, unchanged.
- ✅ Scenario: The full credit on narrow and wide screens — `settings_factory_credit_e2e.feature:76-89`, rows English 320, Russian 320, Russian 2560.

## Mutation

The only production change is `packages/client/src/locales/ru.json`, which Stryker does not mutate. For M7 and task 4.1 I ran `npx stryker run --mutate 'src/app/settings/GnomishFactoryCredit.tsx'`:

- `src/app/settings/GnomishFactoryCredit.tsx`: 100.00 % (2 killed, 0 survived, 0 no coverage, 0 errors).

## Findings

### R1 — CRITICAL — Task 4.1 ticked but its required score note is missing
- Location: `openspec/changes/keep-gnomish-factory-name-untranslated-in-credit/tasks.md:62`
- Rule: task 4.1 in `openspec/changes/keep-gnomish-factory-name-untranslated-in-credit/tasks.md:62` — "The score must be at least 95 % (minimum acceptable 90 %). Note it in this task."
- Problem: Task 4.1 says "Read `reports/mutation/mutation-report.json`. The score must be at least 95 % (minimum acceptable 90 %). Note it in this task." It is ticked `[x]`, but no score is written in the task, so the task is ticked but not done.
- Impact: A ticked-but-undone task: the M7 measurement is not recorded in the change, so after archiving (archives are immutable) nobody can see what score was measured without running Stryker again. The score itself is fine (100 %, measured in this review).
- Fix: Append to task 4.1 in `tasks.md`: "Measured: 100 % (2 killed, 0 survived)."
- Fix risk: none — one line of documentation in an active (not archived) change; no code or test changes.
- Status: open

## Verdict

Not ready. Blocking: R1 (CRITICAL — task 4.1 ticked but not done). The fix is one line in `tasks.md`; no code change is needed.
