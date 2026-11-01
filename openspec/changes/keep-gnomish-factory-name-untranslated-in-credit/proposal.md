# Keep the Gnomish Factory name untranslated in the credit

Builds on the archived `add-gnomish-factory-credit` and `move-and-restyle-gnomish-factory-credit` (`openspec/changes/archive/2026/10/`), both on `main`. The only other active change, `add-pr-preview-deploy`, touches no capability this change modifies.

## Why

The Gnomish Factory credit on the settings page reads «Создано с помощью Гномской фабрики» in Russian, so the Russian name hides the brand that the link leads to. The landing page, the repository and the English credit all say "Gnomish Factory". The owner wants the Russian credit to read «Создано с помощью Gnomish Factory», so people recognise the brand. Every interface language added later should also keep "Gnomish Factory" as it is, without translating it. Audience: every user who opens the settings in Russian, and whoever adds the next interface language.

## What Changes

- MODIFIED `settings` requirement "Gnomish Factory credit": the Russian credit text is «Создано с помощью Gnomish Factory». The factory name stays `Gnomish Factory` in every language. Unchanged: the English text "Built with Gnomish Factory", the place, colour, size, address, new tab, keyboard order and offline behaviour.
- MODIFIED `settings` requirement "Settings strings are localized": the Russian glossary name of the credit becomes «Создано с помощью Gnomish Factory». The factory name is a brand name: the credit of every interface language, English, Russian and any later one, contains `Gnomish Factory` exactly, in Latin letters.
- Glossary (`docs/glossary/settings.md`):
  - **Gnomish Factory**: *RU:* «Гномская фабрика» becomes «Gnomish Factory». The entry also says the name is never translated, and «Гномская фабрика» is added under *Never:*.
  - **Gnomish Factory credit**: *RU:* «Создано с помощью Гномской фабрики» becomes «Создано с помощью Gnomish Factory».
  - No new term. Terms used as they are: settings page, Gnomish Factory, Gnomish Factory credit.
- No stored data, no new state, no network request, no change of layout or of any other string.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `settings`: MODIFIED "Settings strings are localized" and "Gnomish Factory credit".

## Goals

- G1: A Russian-speaking user reads the brand name "Gnomish Factory" in the credit, the same name as on the landing page.
- G2: Any interface language added later keeps "Gnomish Factory" untranslated in its credit, and an automated check fails if it does not.

## Non-Goals

- NG1: No change to the English credit "Built with Gnomish Factory".
- NG2: No change to the credit's place, colour, font size, address, new-tab behaviour or keyboard order.
- NG3: No new interface language. FR2 only fixes the rule for languages added later.
- NG4: No change to the Russian part of the credit around the name («Создано с помощью»).
- NG5: No change to texts outside the app, such as `README.ru.md`, which describes the factory tooling and not the app's interface.

## Users & Scenarios

- U1: A Russian-speaking user opens the settings and sees «Создано с помощью Gnomish Factory» above «Тема». They follow it and land on the "Gnomish Factory" page, with the same name they just read.
- U2: A developer adds a third interface language and translates the credit as "built with" plus a local name for the factory. The unit BDD check fails and names the language, so the name stays "Gnomish Factory".

## Requirements

### Functional

- FR1: In Russian, the Gnomish Factory credit reads exactly «Создано с помощью Gnomish Factory». This is both its visible text and the link's accessible name. In English it still reads "Built with Gnomish Factory".
- FR2: In every supported interface language, current or added later, the credit contains the factory name `Gnomish Factory`, written exactly as in English, in Latin letters, never translated or transliterated. An automated check runs over every supported language and fails for a language whose credit does not contain it.

### Non-Functional

#### Performance

No performance requirement: only a translation string changes. No formatter, lookup or presenting pass is added.

#### Accessibility

- NFR-A1: The Russian credit stays a link named exactly by its new visible text, and axe-core reports no violations on the settings page.

#### Responsive

- NFR-R1: At 320 px and 2560 px, the new Russian credit text is shown in full (it may wrap, it is never clipped), and the settings page does not scroll horizontally.

## UX Acceptance Criteria

- UX1: The brand name in the credit looks the same in every language: "Gnomish Factory", in the same Latin spelling and capitalisation as on the landing page. The Russian words around it read naturally: «Создано с помощью Gnomish Factory».

## UI States Matrix

The credit is static text and loads no data. Its states are unchanged by this change, apart from the Russian wording:

| Network | Data | UI |
|---|---|---|
| online | any preferences | the credit «Создано с помощью Gnomish Factory» (Russian) or "Built with Gnomish Factory" (English) above the theme group |
| offline | any preferences | the same text; the new tab shows the browser's offline page |
| offline or online | unreadable preferences or storage unavailable | the note first, then the same credit, then the theme group |
| offline or online | settings chunk loading | the shell's existing skeleton fallback; the credit appears with the settings page |

## Behavior

`packages/client/src/test/features/settings/`, tagged `@keep-gnomish-factory-name-untranslated-in-credit`:

- `settings_factory_name.feature` (unit BDD, new): the factory name in every supported interface language (FR2, UX1).
- `settings_factory_credit_e2e.feature`: the Russian row of "The credit in both languages" (FR1, NFR-A1, UX1) and the Russian rows of "The full credit at <width> px in <language>" (NFR-R1).
- `settings_e2e.feature`: the Russian row of "Both languages" (FR1) and the axe-core outline "Settings have no accessibility violations in the <theme> theme" (NFR-A1).

## Visual Reference

No screen for the settings page exists (`docs/design/README.md`: "Search, settings, empty, error and offline states have no screens yet"). The approved settings screenshots in `packages/client/src/test/features/__screenshots__/` show the English interface, so their credit text does not change and they are not re-approved.

## Affected IA

No changes (`docs/ia/` does not exist).

## Success Metrics

- M1: In Russian, the settings page shows the credit «Создано с помощью Gnomish Factory» in 2 of 2 E2E checks ("The credit in both languages" checks it as the link name, "Both languages" as the text) and «Создано с помощью Гномской фабрики» in 0 of 2.
- M2: The unit BDD check finds `Gnomish Factory` in the credit of 2 of 2 supported languages (`en`, `ru`). It covers 100 % of `SUPPORTED_LANGUAGES`, so a third language is checked with no edit to the test.
- M3: `grep -rn "Гномск" packages/client/src docs/glossary` finds 1 line: the *Never:* list of the glossary entry **Gnomish Factory**.
- M4: axe-core reports 0 violations on the settings page in 2 of 2 themes.
- M5: 0 px of horizontal scroll and 0 clipped credit text in 2 of 2 Russian checks (320 px, 2560 px).
- M6: 0 of the 8 approved settings screenshots (4 per Playwright project, chromium and mobile-chrome) change.
- M7: Stryker scoped to `src/app/settings/GnomishFactoryCredit.tsx` keeps a score of at least 95 % (minimum acceptable 90 %).
- M8: The traceability loop of the final tasks prints nothing: each of FR1, FR2, NFR-A1, NFR-R1 and UX1 has at least one test tagged with this change.

## Open Questions

None. The task gives the exact Russian text and the rule for later languages.
