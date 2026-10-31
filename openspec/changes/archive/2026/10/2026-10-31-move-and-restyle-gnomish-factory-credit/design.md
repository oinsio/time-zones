# Design: Move and restyle the Gnomish Factory credit

## Context

Driven by FR1–FR3, NFR-A1, NFR-A2, NFR-R1, NFR-R2, UX1 and UX2 of `proposal.md`. Every owner below was opened on `main` under `packages/client/`.

- **Gnomish Factory credit**: `src/app/settings/GnomishFactoryCredit.tsx`, the glossary *Code:* owner (`docs/glossary/settings.md`). It is one `<a>` with the classes `inline-flex min-h-11 items-center justify-center self-center rounded-md px-2 text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-accent focus-visible:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent`, under `// Stryker disable next-line StringLiteral: layout and colour, covered by settings_factory_credit_e2e.feature`.
- **Settings page**: `src/app/settings/SettingsPage.tsx` (131 lines), *Code:* `SettingsPage`.
  - Its `<header>` is `flex flex-col gap-2 border-b border-border pt-6 pb-4`. The header holds `<GnomishFactoryCredit />` and then a `grid grid-cols-[auto_1fr_auto] items-center gap-2` row with the back button, the `<h1 tabIndex={-1}>` and an `aria-hidden` spacer.
  - Its `<main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 py-6">` holds, in order: the unreadable note (`role="alert"`, with the Reset button), the save-failed note (`role="alert"`), the theme `SettingsOptionGroup` and the hour format `SettingsOptionGroup`.
- **Theme option icons**: `src/app/settings/SettingsOptionGroup.tsx` draws each option `Icon` (`Sun`, `Moon`, `Monitor` from `THEME_OPTION_ICONS` in `SettingsPage.tsx`) with `className="text-accent"`, inside a `<fieldset>` whose `role="radiogroup"` div is named by the legend ("Theme" / «Тема»).
- **Tokens**: `src/styles/tokens.css` defines `--color-accent` as `#2f5bd3` (light) and `#5ec2e8` (dark), and `--color-background` as `#f7f7f5` (light) and `#0f1729` (dark). The contrast is 5.50:1 in light and 8.82:1 in dark (WCAG relative luminance, the formula of `src/styles/tokens.test.ts`), so NFR-A2 holds with an existing token. `tailwind.config.ts` maps the token to `text-accent` and `outline-accent`. It defines no `fontSize`, so `text-sm` is Tailwind's default `0.875rem` (14 px) and `text-base` is `1rem` (16 px).
- **Tests that pin today's place and colour**:
  - `src/app/settings/SettingsPage.credit.test.tsx` checks the credit is the first link or button in the `banner` landmark.
  - `src/test/features/settings/settings_factory_credit_e2e.feature` (87 lines) with `steps/settings_factory_credit_e2e.steps.ts` (199 lines) and `steps/settingsCreditE2eHelpers.ts` (68 lines). Its steps check the muted colour, the position "above the back button and the settings heading", and "the credit gets the keyboard focus" by Shift+Tab twice.
  - The screenshot baselines `Approved-screenshots-of-the-settings-at-{375,1024}-px-in-the-{light,dark}-theme.png` exist under `src/test/features/__screenshots__/chromium/` and `…/mobile-chrome/`.
- **E2E steps that exist and are reused**:
  - "the stored preferences are unreadable" (`settings_theme_e2e.steps.ts`);
  - "the settings show the unreadable note with Reset" and "the locations screen has no accessibility violations" (used by `settings_e2e.feature`);
  - "the user presses Shift+Tab" and "the focus is on the back button" (`settings_factory_credit_e2e.steps.ts`);
  - `RADIOGROUP_ROLE`, `settingsHeading` (`settingsE2eHelpers.ts`) and `readTokenStyle` (`time_selection/steps/timeSelectionE2eHelpers.ts`).
  - "the user presses the key {string}" (`time_selection/steps/time_selection_pointer_e2e.steps.ts`, same `locations_ui_e2e.fixtures` `test`, picked up by the step glob `src/test/features/**/steps/*_e2e.{steps,fixtures}.ts`). No step with the exact text "the user presses Tab" exists, and none is added.

Binding decisions:
- ADR-0002: the page renders i18n text only, with no domain logic.
- ADR-0001: place, colour, font size and focus are checked in playwright-bdd E2E, not in jsdom.
- ADR-0008: no timing assertions.

The change stores nothing, reads no clock and makes no request, so ADR-0003, ADR-0004, ADR-0006, ADR-0007, ADR-0009 and ADR-0010 are not touched. ADR-0005 is not touched either: no view changes. No global decision, so no ADR.

## Goals / Non-Goals

**Goals:** change only the existing owner `GnomishFactoryCredit` and its place in `SettingsPage`. Use the existing accent token and one named font size.

**Non-Goals:** no new component, no new colour token, no change to `SettingsOptionGroup`.

## Decisions

### D1. The credit moves into `<main>`, right before the theme group (FR1, NFR-A1, UX1)

`<GnomishFactoryCredit />` leaves the `<header>` and becomes the child of `<main>` between the save-failed note and the theme `SettingsOptionGroup`. The `<header>` goes back to one grid row, as it was before `add-gnomish-factory-credit`: `grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-border pt-6 pb-4`, holding the back button, the heading and the spacer.

The credit keeps `self-center`, so it is centred in the `max-w-xl` column (UX1). DOM order equals visual order, so the Tab order is back button → (Reset, when the unreadable note is shown) → credit → theme group (NFR-A1). The mount effect still focuses the heading. From the focused heading, Tab reaches the next tabbable element in document order: the credit, or the Reset button when the note is shown.

Alternatives:
- **Render the credit inside the theme `<fieldset>`, before its legend.** Rejected: the theme group's accessible name and the radio group of `SettingsOptionGroup` would have to change for one page, and the credit is not a theme option.
- **Put the credit first in `<main>`, before the notes.** Rejected: the task asks for "above the theme setting". An alert that the settings could not be read is more urgent than a credit, so the notes stay on top.

### D2. The accent colour at rest (FR2, UX2, NFR-A2)

In the class string, `text-muted-foreground` becomes `text-accent`, the same utility the theme icons use in `SettingsOptionGroup`. `hover:text-accent` and `focus-visible:text-accent` are dropped, because they would now repeat the rest colour. The underline, `underline-offset-4` and the `focus-visible:outline-accent` outline stay, so hover and focus are still visible (the underline marks the link, the outline marks focus).

Alternative: **a new colour token for the credit.** Rejected by NG3. The task names the icons' colour, and `--color-accent` already is that colour.

### D3. A named `credit` font size of 16.5 px (FR3, NFR-R1)

FR3 needs 16.1–16.8 px. No default Tailwind size falls in that range: `text-base` is 16 px (+14.3 %) and `text-lg` is 18 px (+28.6 %). `tailwind.config.ts` therefore gets `theme.extend.fontSize.credit = [CREDIT_FONT_SIZE, CREDIT_LINE_HEIGHT]`, with two named constants next to `MANROPE_FONT_FAMILY`:
- `CREDIT_FONT_SIZE = "1.03125rem"`: 16.5 px, +17.9 %;
- `CREDIT_LINE_HEIGHT = "1.5rem"`.

The credit's class `text-sm` becomes `text-credit`. Tailwind 3.4 resolves `text-credit` to the font size, because no colour is named `credit`. The size is in `rem`, so it follows the user's root font size; at the default 16 px root it is 16.5 px. At 320 px the Russian credit wraps to a second line inside `min-h-11`, so the target only grows (NFR-R1).

Alternatives:
- **An arbitrary class `text-[1.03125rem]`.** Rejected: it is a magic number in a class string (`.claude/rules/ui-states.md`: "No inline styles or magic numbers — use design tokens").
- **`text-base` or `text-lg`.** Rejected: they fall outside the 15–20 % range.

### D4. Tests by what they assert (all requirements)

- **Vitest (jsdom):**
  - `app/settings/SettingsPage.credit.test.tsx`: the credit is not inside the `banner` landmark. It is inside `main`, and its next element sibling contains the radio group "Theme". With an `UNREADABLE` in-memory document, the `alert` note precedes the credit by `compareDocumentPosition`. The heading still has the focus.
  - `app/settings/GnomishFactoryCredit.test.tsx`: the link carries `text-accent` and `text-credit` and not `text-muted-foreground` or `text-sm`. This is a fast guard only; the browser proves the effect.
- **playwright-bdd** (`settings_factory_credit_e2e.feature`):
  - **Colour:** the credit's computed `color` equals the computed `color` of the first `svg` in the theme radio group (the sun icon of Light), at rest, on focus, on hover and after a system theme change. This checks "the colour of the theme icons" directly, not only the token.
  - **Font size:** `parseFloat(getComputedStyle(credit).fontSize) / FORMER_CREDIT_FONT_SIZE_PX`, with the constant `14`, is between `1.15` and `1.20`.
  - **Place:** the credit's box top is at least the heading's box bottom. The credit's `nextElementSibling` contains the radio group named by the theme legend. With the note, the note's box bottom is at most the credit's box top.
  - **Keyboard:** Tab is pressed with the existing step `the user presses the key "Tab"`, so no second step definition for the same key press is added.
- **Step file size:** `settings_factory_credit_e2e.steps.ts` is at 199 lines. Its new measurement helpers go into `settingsCreditE2eHelpers.ts`, so the steps file stays under 200 lines. If it would still pass 200, the steps of the new place and size checks go into `steps/settings_factory_credit_layout_e2e.steps.ts`.
- Class strings stay under the existing `// Stryker disable next-line StringLiteral` comment, whose reason is still true.

## Consequences

Positive:
- One owner changes (`GnomishFactoryCredit`) plus its place in `SettingsPage`. No new component, colour or term.
- The credit and the theme icons share one token, so a future change of `--color-accent` keeps them alike.

Negative (risks and trade-offs):

- [The accent colour at rest makes hover give no colour change] → accepted. The underline and the pointer cursor mark the link, and the focus outline marks keyboard focus. The task asks for the icons' colour.
- [A user root font size other than 16 px changes the pixel value] → accepted. The 1.15–1.20 ratio to `text-sm` holds at any root size, because both are in `rem`. The E2E check runs at the default root.
- [The settings header gets shorter and the content moves up] → the re-approved screenshots (NFR-R2) record it.

## Alternatives Considered

Each decision lists its rejected alternatives: D1 (inside the theme fieldset, first in `<main>`), D2 (a new colour token), D3 (an arbitrary class, `text-base`, `text-lg`).

## Migration Plan

None: no stored data. Rollback is reverting the change.
