# Move and restyle the Gnomish Factory credit

Builds on the archived `add-gnomish-factory-credit` (`openspec/changes/archive/2026/10/2026-10-31-add-gnomish-factory-credit/`), on `main`. The only other active change, `add-pr-preview-deploy`, touches no capability this change modifies.

## Why

The archived `add-gnomish-factory-credit` put the Gnomish Factory credit at the top of the settings page, above the back button and the "Settings" heading, in the muted text colour at 14 px. The owner wants it to sit lower and stand out more. It should go just above the theme preference group and take the colour of the theme option icons (sun, moon, monitor). Its text should be 15–20 % larger. Audience: every user who opens the settings, in both interface languages and both themes.

## What Changes

- MODIFIED `settings` requirement "Gnomish Factory credit":
  - **Place:** the credit is no longer the top line above the back button and the heading. It is the line directly above the theme group, below the header and below any settings note.
  - **Colour:** at rest the credit text has the colour of the theme option icons (the accent colour), not the muted foreground colour.
  - **Size:** the text is 15–20 % larger than the 14 px it has today.
  - **Keyboard order:** the credit comes after the back button in the Tab order, its new visual order.
  - Unchanged: the text, the address, the new tab, the underline, the 44 px target, the focus outline and offline behaviour.
- The approved settings page screenshots (375 px and 1024 px, light and dark) are re-approved with the credit in its new place.
- Glossary (`docs/glossary/settings.md`): the **Gnomish Factory credit** entry changes from "the top line of the settings page" to "the line of the settings page above the theme preference". `docs/architecture/views.md` changes the Settings overlay row to match. No new term. Terms used as they are: settings page, theme preference, Gnomish Factory, Gnomish Factory credit, settings button.
- No stored data, no new state, no network request, no change of the main page or of any view.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `settings`: MODIFIED "Gnomish Factory credit".

## Goals

- G1: A user who opens the settings finds the credit right above the theme group, not in the page header.
- G2: The credit has the same colour as the theme option icons in both themes.
- G3: The credit text is 15–20 % larger than before (from 14 px to between 16.1 px and 16.8 px).

## Non-Goals

- NG1: No change to the credit text, its address, its new-tab behaviour or its translations.
- NG2: No change to the back button, the heading, the option groups, the settings notes or the theme icons themselves.
- NG3: No new colour: the credit uses an existing token. No change of the token values.
- NG4: No credit on the main page, in a view or in the recovery screen.

## Users & Scenarios

- U1: A Russian-speaking user opens the settings. Under the header they see «Создано с помощью Гномской фабрики» in the accent colour of the sun, moon and monitor icons, right above «Тема».
- U2: A keyboard user opens the settings, where the focus is on the heading. One Tab press reaches the credit, and Enter opens the landing page in a new tab.
- U3: A user whose settings could not be read sees the note with Reset first, then the credit, then the theme group.

## Requirements

### Functional

- FR1: The settings page shows the Gnomish Factory credit as the line directly above the theme group, on every width. Nothing else stands between the credit and the theme group. The credit stands below the page header (the back button and the "Settings" heading) and below any settings note (the unreadable-settings note with Reset, the save-failed note). It is no longer in the page header.
- FR2: At rest, the credit text has the colour of the theme option icons (the accent colour of the active theme). It keeps that colour on hover and on keyboard focus. It follows the active theme, also when the theme changes while the settings page is open. It introduces no colour the tokens do not define.
- FR3: The credit text is 15–20 % larger than the 14 px of the change `add-gnomish-factory-credit`. Its computed font size is between 16.1 px and 16.8 px at the default root font size of 16 px.

### Non-Functional

#### Performance

No performance requirement: the credit is static text with no formatter, lookup or presenting pass.

#### Accessibility

- NFR-A1: The credit stays a link named exactly by its visible text. In the Tab order it comes after the back button and before the theme group, which is its visual order. From the focused heading, Tab reaches it when no settings note is shown. Shift+Tab from it reaches the back button when no settings note is shown, and the Reset button when the unreadable note is shown. Enter opens it. It shows the accent focus outline and stays at least 44 px high. Opening the settings page still moves the focus to the heading.
- NFR-A2: The credit text has a contrast of at least 4.5:1 against the page background in both themes. The accent token gives 5.50:1 in light and 8.82:1 in dark. axe-core reports no violations on the settings page in the light and the dark theme.

#### Responsive

- NFR-R1: At 320 px and 2560 px the larger credit text is shown in full in both languages (it may wrap, it is never clipped), and the settings page does not scroll horizontally.
- NFR-R2: The approved screenshots of the settings page at 375 px and 1024 px in the light and the dark theme are re-approved with the credit in its new place, colour and size.

## UX Acceptance Criteria

- UX1: The credit reads as a caption of the settings content: centred on its own line between the header and the theme group, larger than the group legends and smaller than the heading.
- UX2: The credit's colour matches the sun, moon and monitor icons of the theme options in both themes, so the two read as one accent.

## UI States Matrix

The credit is static and loads no data. Its place in the states of the settings page:

| Network | Data | UI |
|---|---|---|
| online | any preferences | the credit right above the theme group; the link opens the landing page in a new tab |
| offline | any preferences | the same credit and place; the new tab shows the browser's offline page, and the app tab does not change |
| offline or online | unreadable preferences (note with Reset) | the note first, then the credit, then the theme group |
| offline or online | storage unavailable (save-failed note) | the note first, then the credit, then the theme group |
| offline or online | settings chunk loading | the shell's existing skeleton fallback; the credit appears together with the settings page, as part of it |

## Behavior

`packages/client/src/test/features/settings/`, tagged `@move-and-restyle-gnomish-factory-credit`:

- `settings_factory_credit_e2e.feature`:
  - the place above the theme group, also with a settings note (FR1, UX1);
  - the icon colour at rest, on focus, on hover and after a theme change (FR2, UX2, NFR-A2);
  - the font size (FR3);
  - the Tab order (NFR-A1);
  - the full text at 320 px and 2560 px (NFR-R1).
- `settings_e2e.feature`: the existing axe-core and screenshot outlines get this change's tags (NFR-A2, NFR-R2).

## Visual Reference

No screen for the settings page exists (`docs/design/README.md`: "Search, settings, empty, error and offline states have no screens yet"). The design tokens in `packages/client/src/styles/tokens.css` are the source of truth. The re-approved screenshots of NFR-R2 become the reference.

## Affected IA

No changes (`docs/ia/` does not exist; the settings page keeps its place in the shell).

## Success Metrics

- M1: The credit stands below the heading and directly above the theme group, with no element between them, in 2 of 2 interface languages. It stays directly above the theme group, below the note, in 1 of 1 checks with the unreadable-settings note.
- M2: The credit's computed text colour equals the computed colour of the theme option icon in 6 of 6 checks: light and dark, each at rest, on focus and on hover. It also does in 1 of 1 checks after a system theme change.
- M3: The credit's computed font size divided by 14 px is between 1.15 and 1.20 in 1 of 1 checks.
- M4: Tab from the focused heading reaches the credit, and Shift+Tab from it reaches the back button, in 1 of 1 checks.
- M5: axe-core reports 0 violations on the settings page in 2 of 2 themes.
- M6: 0 px of horizontal scroll and 0 clipped credit text in 3 of 3 checks (English 320 px, Russian 320 px, Russian 2560 px).
- M7: 4 of 4 settings page screenshots match their re-approved baselines in each Playwright project that runs them.
- M8: Stryker scoped to the changed production files scores at least 95 % (minimum acceptable 90 %).
- M9: The traceability loop of the final tasks prints nothing: each of FR1–FR3, NFR-A1, NFR-A2, NFR-R1, NFR-R2, UX1 and UX2 has at least one test tagged with this change.

## Open Questions

- Q1: The task names a 15–20 % range. This change picks 16.5 px (+17.9 %), the middle of the range. If the owner prefers another value inside the range, only the font size constant and the screenshots change.
