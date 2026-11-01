# Specs review: keep-gnomish-factory-name-untranslated-in-credit

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 20/20 |
| Contradictions | 1 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 1 |

## Freshness

- ✅ `settings.gnomishFactoryCredit` is at line 107 of both locale files: `packages/client/src/locales/en.json:107` "Built with Gnomish Factory", `packages/client/src/locales/ru.json:107` "Создано с помощью Гномской фабрики" (design.md:5, proposal.md:7).
- ✅ `GnomishFactoryCredit` (`packages/client/src/app/settings/GnomishFactoryCredit.tsx:12-24`) renders `t("settings.gnomishFactoryCredit")` as the whole link text, so D1 needs no component edit.
- ✅ `GnomishFactoryCredit.test.tsx:13-16` has an `it.each` with rows `["en", "Built with Gnomish Factory"]` and `["ru", "Создано с помощью Гномской фабрики"]` (task 2.2).
- ✅ `SUPPORTED_LANGUAGES = ["en", "ru"]` is exported from `packages/client/src/i18n.ts:8` (`@/i18n`). `localeResources` is exported there too and loaded by `src/test/setup.ts`, which runs `i18n.init({ resources: localeResources, … })` (D2, task 2.1).
- ✅ `src/locales/locales.test.ts:42-45` "should have one locale file per supported language" compares the locale files with `SUPPORTED_LANGUAGES` (D2).
- ✅ `vitest.config.ts:13` includes `src/**/*.{test,steps}.{ts,tsx}` and excludes only `*_e2e.steps.ts`. The new `settings_factory_name.steps.ts` gets picked up. `playwright.bdd.config.ts` reads only `*_e2e.feature`, so the new unit feature does not reach playwright-bdd. Leaving out the `_unit` suffix follows `bdd-unit.md` ("added only when a paired `_e2e` file exists"). The pattern file `steps/settings_hour_format_unit.steps.tsx` exists.
- ✅ `settings_factory_credit_e2e.feature:7-16` has the outline "The credit in both languages" with the Russian row "Создано с помощью Гномской фабрики". Lines 76-87 have "The full credit at <width> px in <language>" with rows 320/English, 320/Russian, 2560/Russian (tasks 3.1, M5).
- ✅ `steps/settings_factory_credit_e2e.steps.ts` has 178 lines and defines "the settings page shows the link {string} to the Gnomish Factory" (line 36), "the Gnomish Factory credit is {string}" (line 78) and "the credit text is shown in full" (line 175) (tasks 3.1, 3.2).
- ✅ `settings_e2e.feature:44-53` has the outline "Both languages" with the Russian credit cell, and lines 56-65 have "Settings have no accessibility violations in the <theme> theme" for light and dark (task 3.2, M4).
- ✅ There are 8 approved settings screenshots, 4 each in `__screenshots__/chromium` and `__screenshots__/mobile-chrome`, from `settings_e2e.feature:87`. They show the English interface ("Built with Gnomish Factory" in `chromium/Approved-screenshots-of-the-settings-at-375-px-in-the-light-theme.png`) (proposal Visual Reference, M6).
- ✅ The MODIFIED "Settings strings are localized" and "Gnomish Factory credit" requirements match `openspec/specs/settings/spec.md:173-184` and `:260-350`. Only the Russian credit text and the brand-name sentence change. The scenarios and the 320/320/2560 table match the stable spec.
- ✅ The glossary entries **Gnomish Factory** (*RU:* «Гномская фабрика») and **Gnomish Factory credit** (*RU:* «Создано с помощью Гномской фабрики») are at `docs/glossary/settings.md:10-11`, as tasks 1.1 and D3 restate them.
- ✅ Today `grep -rn "Гномск"` over `packages/client/src` and `docs/glossary` hits exactly the 5 places the tasks edit: glossary lines 10-11, `ru.json:107`, `GnomishFactoryCredit.test.tsx:15`, `settings_e2e.feature:53`, `settings_factory_credit_e2e.feature:16`. With tasks 1.1-3.2 done, only the new *Never:* text stays, so M3 and task 4.3 hold as written.
- ✅ Scripts `typecheck`, `lint`, `test` and `test:bdd` exist in `packages/client/package.json:13-22`, with package name `@time-zones/client` (task 4.2).
- ✅ Not implemented yet. No archived change sets the Russian credit to «… Gnomish Factory». The earlier `add-gnomish-factory-credit` and `move-and-restyle-gnomish-factory-credit` are in `openspec/changes/archive/2026/10/`.
- ✅ `README.ru.md:20,94` still uses «Гномская фабрика» (the "## Гномская фабрика" section about the tooling), as NG5 says.

## Coverage

| id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ both MODIFIED requirements, Russian rows of "Both languages" and "The credit in both languages" | ✅ 2.2, 2.3, 3.1, 3.2 |
| FR2 | ✅ | ✅ "Settings strings are localized", scenario "The factory name is never translated" | ✅ 1.1, 2.1, 2.3 |
| NFR-A1 | ✅ | ✅ restated a11y paragraph of "Gnomish Factory credit" plus the Russian link-name row | ✅ 3.1, 3.2 |
| NFR-R1 | ✅ | ✅ "The full credit on narrow and wide screens", Russian 320 and 2560 rows | ✅ 3.1 |
| UX1 | ✅ | ✅ "in every language the factory name stays `Gnomish Factory`" plus "The factory name is never translated" | ✅ 2.1, 2.2, 3.1 |
| M1 | ✅ | n/a | ✅ 3.1, 3.2 |
| M2 | ✅ | n/a | ✅ 2.1 |
| M3 | ✅ | n/a | ✅ 4.3 |
| M4 | ✅ | n/a | ✅ 3.2 |
| M5 | ✅ | n/a | ✅ 3.1 |
| M6 | ✅ | n/a | ✅ 3.2 (screenshots pass without `--update-snapshots`) |
| M7 | ✅ | n/a | ✅ 4.1 |
| M8 | ✅ | n/a | ✅ 4.4 |
| G1 | ✅ | n/a, met by FR1, M1 | n/a, met by FR1, M1 |
| G2 | ✅ | n/a, met by FR2, M2 | n/a, met by FR2, M2 |
| NG1 | ✅ | n/a | n/a, no artifact changes `en.json` (task 2.3 leaves it) |
| NG2 | ✅ | n/a | n/a, no class, address or layout change; the component is untouched |
| NG3 | ✅ | n/a | n/a, no locale file is added |
| NG4 | ✅ | n/a | n/a, «Создано с помощью» is kept |
| NG5 | ✅ | n/a | n/a, no artifact edits `README.ru.md` (see R1 for the glossary conflict this leaves) |

## Consistency

- `proposal.md:40` (NG5) keeps «Гномская фабрика» in `README.ru.md:94`, the section about the same tool. But `design.md:15` (D3), `proposal.md:14` and `tasks.md:16` add «Гномская фабрика» to the glossary *Never:* list, and `.claude/rules/glossary.md` bans *Never:* words "in code, comments, specs, docs, translations or discussions".

## Findings

### R1 — WARNING — The new *Never:* word conflicts with README.ru.md, which NG5 keeps
- Location: `openspec/changes/keep-gnomish-factory-name-untranslated-in-credit/design.md:15`
- Rule: `.claude/rules/glossary.md`. It says: "Words listed under *Never:* must not appear for that concept in code, comments, specs, docs, translations or discussions. Quoting an external source verbatim is the one exception." `docs/glossary/README.md:12` says: "*Never:* — banned synonyms that must not appear in code, specs, docs or translations."
- Problem: D3 (and `proposal.md:14`, `tasks.md:16`) appends «Гномская фабрика» to the *Never:* list of the glossary term **Gnomish Factory** ("the tool the app is built with"). `README.ru.md:20` and `:94` use exactly that word for the same tool: the anchor `[Гномская фабрика](#гномская-фабрика)` and the section "## Гномская фабрика", which introduces "[Gnomish Factory](https://github.com/oinsio/gnomish-factory)". NG5 (`proposal.md:40`) deliberately leaves `README.ru.md` unchanged. The implement stage cannot edit it anyway, because `.gnomish/stages/specify/handoff.md` allows writes only under `packages/` and `docs/`. The task asks only that the name stay untranslated in the interface. It does not ask for a ban on the word in repository docs.
- Impact: Implemented as written, the PR adds a glossary rule that the repository breaks the moment it merges. The next glossary review check (`grep -rniE "<never words>"`), or anyone following the rule, will flag `README.ru.md`, and no task or handoff item settles it. The change contradicts itself: NG5 keeps a word that D3 bans.
- Fix: Drop the *Never:* addition and keep the rest of D3. Edit as follows:
  - In `design.md:15`, delete "and *Never:* «Гномская фабрика»".
  - In `proposal.md:14`, delete ", and «Гномская фабрика» is added under *Never:*".
  - In `tasks.md:16`, delete "Append *Never:* «Гномская фабрика»."
  - In the task 1.1 verification (`tasks.md:19`), make `grep -n "Гномск" docs/glossary/settings.md` print nothing.
  - Change M3 (`proposal.md:103`) and task 4.3 (`tasks.md:71`) to "finds 0 lines" (and drop "with its *Never:* part").
  
  The sentence "A brand name: written `Gnomish Factory` in every interface language, never translated." and the *RU:* «Gnomish Factory» stay, and so does the D2 guard.
- Fix risk: The glossary loses an explicit ban on the Russian rendering. The brand rule still lives in the glossary sentence, in the *RU:* name and in the D2 unit BDD guard, which fails for any language whose credit lacks `Gnomish Factory`. With tasks 1.1-3.2 done, the grep in M3 and task 4.3 really prints 0 lines (Freshness shows the 5 current hits are all edited). No code, spec or other task depends on the *Never:* entry.
- Status: fixed
- Resolution: dropped the *Never:* «Гномская фабрика» addition: design.md D3 now says the entry gets no *Never:* word (README.ru.md keeps it, NG5),
  proposal.md What Changes no longer adds it, M3 expects 0 lines; tasks.md 1.1 drops the append and its grep prints nothing; task 4.3 prints nothing (M3).

### R2 — SUGGESTION — design.md cites the wrong task for the `it.each` rows
- Location: `openspec/changes/keep-gnomish-factory-name-untranslated-in-credit/design.md:30`
- Rule: —
- Problem: The alternative "Assert only `en` and `ru` in `GnomishFactoryCredit.test.tsx`" says "The existing `it.each` keeps its fixed rows for FR1 (task 2.1)". Task 2.1 creates the new unit BDD feature. The `it.each` edit is task 2.2 (`tasks.md:37`).
- Impact: An implementer who follows the cross-reference lands on the wrong task. It is low stakes, because task 2.2 itself is explicit.
- Fix: In `design.md:30`, replace "(task 2.1)" with "(task 2.2)".
- Fix risk: none
- Status: fixed
- Resolution: design.md:30 now cites task 2.2, the task that edits the `it.each` rows of GnomishFactoryCredit.test.tsx.

## Verdict

Ready to implement. No finding blocks: R1 is a WARNING to fix before implementing, so the glossary does not ban a word the change deliberately keeps in `README.ru.md`. R2 is polish.
