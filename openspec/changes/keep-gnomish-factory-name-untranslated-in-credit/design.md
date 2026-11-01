# Design: Keep the Gnomish Factory name untranslated in the credit

## Context

Driven by FR1 and FR2 from proposal. The credit text comes from the i18n key `settings.gnomishFactoryCredit` (`packages/client/src/locales/en.json:107`, `ru.json:107`), rendered by `GnomishFactoryCredit` (`src/app/settings/GnomishFactoryCredit.tsx`) with `t("settings.gnomishFactoryCredit")`. FR1 only needs the Russian string to change. FR2 is about languages that do not exist yet, so it has to be checked by a test that reads every supported language. That test cannot be a fixed list of `en` and `ru`.

The change stays inside the existing owners named by the glossary (`GnomishFactoryCredit`, `settings.gnomishFactoryCredit`). It follows `.claude/rules/i18n.md`: "Add keys to **both** `src/locales/ru.json` and `src/locales/en.json`" and "Name domain concepts in both languages with the glossary terms … the *RU:* name in `ru.json`". So the glossary *RU:* names change together with `ru.json` (D3). No layer, port, store or ADR is touched. Only a translation string and tests change, so no decision here goes beyond this change.

## Decision

**D1: The name stays inside each locale string.** `ru.json` gets `"gnomishFactoryCredit": "Создано с помощью Gnomish Factory"`. `en.json` stays `"Built with Gnomish Factory"`. `GnomishFactoryCredit.tsx` is not changed. A translator keeps control of the word order around the name, which differs between languages.

**D2: One guard over every supported language.** A unit BDD feature `src/test/features/settings/settings_factory_name.feature` has one scenario, "The factory name in every supported interface language". Its steps (`steps/settings_factory_name.steps.ts`) loop over `SUPPORTED_LANGUAGES` from `@/i18n`. For each language they read the credit with `i18n.getFixedT(language)("settings.gnomishFactoryCredit")`, using the real resources that `src/test/setup.ts` loads from `localeResources`. Each credit must contain `Gnomish Factory`. A failing assertion names the language. `src/locales/locales.test.ts` already checks that every locale file matches a `SUPPORTED_LANGUAGES` entry ("should have one locale file per supported language"), so a new language file is covered by D2 without any edit to the test.

**D3: The glossary owns the spelling.** In `docs/glossary/settings.md`, **Gnomish Factory** gets *RU:* «Gnomish Factory». It also gets the sentence "A brand name: written `Gnomish Factory` in every interface language, never translated." and *Never:* «Гномская фабрика». **Gnomish Factory credit** gets *RU:* «Создано с помощью Gnomish Factory».

## Consequences

Positive:
- One string changes in production. The component, its classes and its Stryker score stay as they are.
- A later language cannot quietly translate the name: D2 fails for it with its code.

Negative:
- The name is written once per locale file and not taken from one constant. D2 is what keeps the copies equal.

## Alternatives Considered

**Interpolate the name from a constant (`{{factoryName}}` with a `GNOMISH_FACTORY_NAME` constant):** this would keep one copy of the name in code. But it changes the component and adds a constant and an interpolation argument. A translator can still drop the placeholder and write a local name, so a guard test is still needed. Rejected as more change for the same guarantee.

**Assert only `en` and `ru` in `GnomishFactoryCredit.test.tsx`:** this covers FR1 but not "languages added later" (FR2). The existing `it.each` keeps its fixed rows for FR1 (task 2.1). D2 adds the open-ended check.
