# Add Gnomish Factory credit

Builds on the archived `add-settings-page-and-device-time-location` (the settings page) and `fix-location-card-and-header-layout`, both on `main`. The only other active change, `add-pr-preview-deploy`, touches no capability this change modifies.

## Why

The app is written with the help of the Gnomish Factory («Гномская фабрика»), and the owner wants that said in the app itself, with a way to reach the factory's landing page (`https://oinsio.github.io/gnomish-factory/`). The settings page is where a user looks for "about the app" things, so the credit goes there, in its top line. Audience: every user who opens the settings, in both interface languages and both themes.

## What Changes

- ADDED `settings` requirement "Gnomish Factory credit": the top line of the settings page is one link, "Built with Gnomish Factory" («Создано с помощью Гномской фабрики»), that opens the factory's landing page in a new browser tab and leaves the app as it was. It takes the app's design tokens and follows the light and the dark theme.
- MODIFIED `settings` requirement "Settings strings are localized": the credit is one of the settings page strings that exist in English and Russian, and Russian uses the glossary name «Создано с помощью Гномской фабрики» (the Gnomish Factory credit).
- The approved settings page screenshots (375 px and 1024 px, light and dark) are re-approved with the credit line.
- No stored data, no new state, no network request by the app, no change of the main page or of any view. The reference moment, the locations and the preferences keep their owners (ADR-0002, ADR-0003, ADR-0004).

Glossary (`docs/glossary/settings.md`): new terms **Gnomish Factory** (*RU:* «Гномская фабрика») and **Gnomish Factory credit** (*RU:* «Создано с помощью Гномской фабрики»); the **Settings page** entry is changed to name the credit. Terms used as they are: settings page, theme preference, hour format, shell, offline.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `settings`: ADDED "Gnomish Factory credit"; MODIFIED "Settings strings are localized".

## Goals

- G1: Every user who opens the settings sees, in the first line of the page, that the app was built with the Gnomish Factory, in their interface language.
- G2: One activation of that line takes the user to the factory's landing page without losing the app's state.
- G3: The line looks like part of the app in both themes: the app's font and colour tokens, no new colour.

## Non-Goals

- NG1: No credit on the main page, in a view or in the recovery screen.
- NG2: No "about" page, version number, licence text or factory logo.
- NG3: No offline indication on the link: offline, the new tab shows the browser's own offline page; the app itself is unaffected.
- NG4: No change to the back button, the "Settings" heading, the option groups or the notes of the settings page.
- NG5: No new design token and no new shared UI component.

## Users & Scenarios

- U1: A Russian-speaking user opens the settings and reads «Создано с помощью Гномской фабрики» at the top; they tap it and the factory's landing page opens in a new tab, while the app tab still shows the settings.
- U2: An English-speaking user in the dark theme sees "Built with Gnomish Factory" in the muted text colour of the dark theme; on hover or focus it takes the accent colour.
- U3: A keyboard user on the settings page reaches the credit with Shift+Tab from the back button and opens it with Enter.

## Requirements

### Functional

- FR1: The settings page shows the Gnomish Factory credit as its top line, above the back button and the "Settings" heading, on every width. The whole credit text is one link; no part of the text is outside it.
- FR2: The credit text is "Built with Gnomish Factory" in English and «Создано с помощью Гномской фабрики» in Russian, following the interface language.
- FR3: The link's address is `https://oinsio.github.io/gnomish-factory/`. Activating it opens that page in a new browser tab (or the system browser for the installed app); the app's tab keeps the settings page, its locations, its reference moment and its preferences unchanged, and the opened page gets no access to the app's window.
- FR4: The credit uses the app's design tokens in the light and the dark theme: the Manrope font, the muted foreground colour at rest and the accent colour on hover and on keyboard focus, with an underline that marks it as a link. It follows the active theme, including a theme change while the settings page is open.

### Non-Functional

#### Performance

No performance requirement: the credit is static text with no formatter, lookup or presenting pass. The existing work-bound scenarios stay unchanged.

#### Accessibility

- NFR-A1: The credit is exposed as a link named exactly by its visible text, in both languages. It is reachable with Tab and Shift+Tab, comes before the back button in the Tab order (its visual order), opens with Enter, and shows a visible focus outline in the accent colour. Its target is at least 44 px high. axe-core reports no violations on the settings page with the credit, in the light and the dark theme. Its text has a contrast of at least 4.5:1 against the page background in both themes, at rest and on focus.
- NFR-A2: Opening the settings page still moves the focus to the "Settings" heading, not to the credit.

#### Responsive

- NFR-R1: At 320 px and 2560 px the settings page does not scroll horizontally, and the credit text is shown in full in both languages (it may wrap, it is never clipped).
- NFR-R2: The approved screenshots of the settings page at 375 px and 1024 px in the light and the dark theme are re-approved with the credit line.

## UX Acceptance Criteria

- UX1: The credit reads as a quiet signature of the page, not as a control: smaller and lighter than the heading, centred on its own line above it.
- UX2: In both themes the credit looks like the rest of the settings page: same font, a token colour, no colour that the page does not use elsewhere.
- UX3: Following the credit never takes the user out of the app tab.

## UI States Matrix

The credit is static; it loads no data. Its behaviour in the states of the settings page:

| Network | Data | UI |
|---|---|---|
| online | any preferences | the credit line on top; the link opens the landing page in a new tab |
| offline | any preferences | the same credit line; the new tab shows the browser's offline page, the app tab is unchanged (NG3) |
| offline or online | unreadable preferences (note with Reset) | the credit line on top, the note below the header as today |
| offline or online | storage unavailable (save-failed note) | the credit line on top, the note below the header as today |
| offline or online | settings chunk loading | the existing skeleton fallback the shell shows while the lazily loaded settings page arrives; the credit appears together with the settings page, as part of it |

## Behavior

`packages/client/src/test/features/settings/`, tagged `@add-gnomish-factory-credit`:

- `settings_factory_credit_e2e.feature` (new): the credit line, text and link in both languages (FR1, FR2, NFR-A1), the new tab and the unchanged app (FR3, UX3), the credit offline (FR3), the token colours in both themes (FR4, UX2), keyboard order, focus and target size (NFR-A1, NFR-A2), full text at 320 px (NFR-R1);
- `settings_e2e.feature`: the existing axe-core, width and screenshot outlines get this change's tags (NFR-A1, NFR-R1, NFR-R2).

## Visual Reference

No Figma or screen for the settings page exists (`docs/design/README.md`: "Search, settings, empty, error and offline states have no screens yet"). Design tokens in `packages/client/src/styles/tokens.css` are the source of truth; the re-approved screenshots of NFR-R2 become the reference.

## Affected IA

No changes (`docs/ia/` does not exist; the settings page keeps its place in the shell).

## Success Metrics

- M1: The credit link is found with the exact name and the exact address in 2 of 2 interface languages, and it is the first element of the settings page in 2 of 2 checks.
- M2: Activating the credit opens 1 new tab at `https://oinsio.github.io/gnomish-factory/` and leaves the app tab on the settings page with the same URL in 1 of 1 checks.
- M3: The credit's text colour equals the muted foreground token at rest and the accent token on focus in 4 of 4 checks (light and dark × rest and focus).
- M4: axe-core reports 0 violations on the settings page in 2 of 2 themes.
- M5: 0 px of horizontal scroll and 0 clipped credit text at 2 of 2 widths (320 px, 2560 px) in 2 of 2 languages.
- M6: 4 of 4 settings page screenshots (375 and 1024 px × light and dark) match their re-approved baselines in each Playwright project that runs them.
- M7: Stryker scoped to the new credit component scores at least 95% (minimum acceptable 90%).
- M8: The traceability loop of the final tasks prints nothing: each of FR1–FR4, NFR-A1, NFR-A2, NFR-R1, NFR-R2 and UX1–UX3 has at least one test tagged with this change.

## Open Questions

- Q1: The English text is a natural rendering of «Создано с помощью Гномской фабрики» chosen by this change: "Built with Gnomish Factory". If the owner prefers "Made with Gnomish Factory", only the English locale value and the tests' expected text change.
