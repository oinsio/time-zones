# Design: Add Gnomish Factory credit

## Context

Driven by FR1–FR4, NFR-A1, NFR-A2, NFR-R1, NFR-R2 and UX1–UX3 of `proposal.md`. Every owner below was opened on `main` under `packages/client/src/`.

- **Settings page**: `app/settings/SettingsPage.tsx` (126 lines), glossary owner of the settings page (`docs/glossary/settings.md`: *Code:* `SettingsPage`). Its `<header>` is `grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-border pt-6 pb-4` holding the back button (`min-h-11 min-w-11 … text-accent focus-visible:outline-accent`), the `<h1 tabIndex={-1}>` focused by a `useEffect` on mount, and an `aria-hidden` spacer `min-w-11`. `app/settings/index.ts` exports only `SettingsPage`. The settings page lives in `app/` (the shell), not in `views/`, so no view and no view-contract scenario is involved (ADR-0002, ADR-0005).
- **Strings**: the `settings.*` keys in `locales/en.json` and `locales/ru.json`; `locales/locales.test.ts` checks that both files share one set of keys.
- **Constants**: `constants/` has no URL constant and no `api.ts` today (`clock.ts` … `utcOffset.ts`, re-exported by `constants/index.ts`). No production file under `src/` contains an `https://` literal.
- **Tokens**: `styles/tokens.css` defines `--color-muted-foreground` (`#5b5b63` light, `#9aa8c2` dark), `--color-accent` (`#2f5bd3` light, `#5ec2e8` dark) and `--color-background` (`#f7f7f5` light, `#0f1729` dark), mapped by `tailwind.config.ts` to `text-muted-foreground`, `text-accent`, `outline-accent`. Contrast against the background: muted foreground 6.27:1 (light) and 7.45:1 (dark), accent 5.50:1 (light) and 8.82:1 (dark), so NFR-A1's 4.5:1 holds with existing tokens (proposal NG5).
- **E2E helpers that exist**: `settings/steps/settingsE2eHelpers.ts` (`openSettings`, `settingsHeading`, `BACK_BUTTON_NAME`, `MIN_OPTION_HEIGHT_PX = 44`, `seedPreferences`, `THEME_VALUES`); steps "the user opens the settings", "the user goes back from the settings", "the settings page needs no horizontal scrolling", "the locations interface language is English" (`settings/steps/settings_e2e.steps.ts`) and "… is Russian" (`home_location/steps/home_location_e2e.steps.ts`); `/^the system colour scheme is (light|dark)$/` and `… becomes (light|dark)` (`settings/steps/settings_theme_e2e.steps.ts`); `/^the locations screen uses the (light|dark) theme$/` and "the locations screen has no accessibility violations" (`locations/steps/locations_view_a11y_e2e.steps.ts`); "the screen is {int} px wide for the locations" and "the locations screen matches the approved screenshot" (`locations/steps/locations_layout_e2e.steps.ts`); `readTokenStyle(page, cssProperty, tokenVariable)` (`time_selection/steps/timeSelectionE2eHelpers.ts`). `settings_e2e.feature` is 161 lines and `settings_e2e.steps.ts` 171 lines, so new scenarios get their own files.
- **Screenshots**: the 4 settings baselines `Approved-screenshots-of-the-settings-at-{375,1024}-px-in-the-{light,dark}-theme.png` exist under `test/features/__screenshots__/chromium/` and `…/mobile-chrome/`.

Binding decisions: ADR-0002 (the shell and views render text through i18n; no domain logic in the page), ADR-0001 (focus, accessible names, layout and colour in playwright-bdd E2E), ADR-0008 (no timing assertions; none are needed). The credit stores nothing, reads no clock and makes no request, so ADR-0003, ADR-0004, ADR-0006, ADR-0007, ADR-0009 and ADR-0010 are respected by not being touched. ADR-0005 is untouched: no view is added or changed. No global decision is needed, so no ADR.

## Goals / Non-Goals

**Goals:** one small component owned by the settings page, one URL constant, one i18n key per language, existing tokens only.

**Non-Goals:** a shared link component, a new token, a change to the model, presenter, controller or ports.

## Decisions

### D1. The credit is the first row of the settings page header (FR1, NFR-A1, NFR-A2, NFR-R1, UX1)

The `<header>` of `SettingsPage` becomes `flex flex-col gap-2 border-b border-border pt-6 pb-4`: first `<GnomishFactoryCredit />` (centred, `self-center`), then a `<div>` that keeps today's `grid grid-cols-[auto_1fr_auto] items-center gap-2` with the back button, the heading and the spacer unchanged. DOM order equals visual order, so Tab reaches the credit before the back button (NFR-A1), and the existing mount effect keeps focusing the heading (NFR-A2). The credit wraps inside the page width at 320 px (`text-center`, no `whitespace-nowrap`).

Alternatives: **the right grid column** (where the spacer is) — at 320 px the 288 px content width cannot hold the back button, "Settings" in `text-2xl` and the credit (Russian is 34 characters), and a wide right column moves the heading off centre. **A footer line** — the task asks for the top line. **Render after the heading and move it up with CSS `order`** — visual order would differ from the Tab and reading order (WCAG 1.3.2, 2.4.3).

### D2. `GnomishFactoryCredit` in `app/settings/` (FR1–FR4)

A new component `app/settings/GnomishFactoryCredit.tsx` renders one `<a>` with `href={GNOMISH_FACTORY_LANDING_URL}`, `target="_blank"`, `rel="noopener noreferrer"` and the text `t("settings.gnomishFactoryCredit")`. It is used only by `SettingsPage` and imported from the sibling file, as `SettingsOptionGroup` is; `app/settings/index.ts` does not export it. It is not in `views/shared/`, because no view renders it (ADR-0005 "a view folder contains only what is specific to it"; the settings page is the shell's). It becomes the glossary *Code:* owner of the Gnomish Factory credit. Being imported only by `SettingsPage`, the credit ships in the lazily loaded settings chunk (`app/AppShell.tsx` loads `SettingsPage` with `lazy` inside `<Suspense fallback={<ViewSkeleton />}>`), so it adds nothing to the initial JavaScript and needs no loading state of its own; neither `AppShell` nor `views/shared/` imports it.

Classes (all existing tokens, UX2): `inline-flex min-h-11 items-center justify-center rounded-md px-2 text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-accent focus-visible:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent`. `min-h-11` is the 44 px target the page already uses for its back button and options. The font is inherited Manrope. The theme switch needs no code: the classes read CSS variables that `tokens.css` swaps.

### D3. The address is a constant, the text an i18n key (FR2, FR3)

`.claude/rules/code-style.md` places "API endpoints, URLs" in `src/constants/api.ts`. The change creates that file with `export const GNOMISH_FACTORY_LANDING_URL = "https://oinsio.github.io/gnomish-factory/";` and re-exports it from `constants/index.ts`. The texts are one key, `settings.gnomishFactoryCredit`, in the existing `settings` namespace (`.claude/rules/i18n.md`: "Do not create new namespaces unless it's clearly a new domain"): English "Built with Gnomish Factory", Russian «Создано с помощью Гномской фабрики». The whole phrase is one string, so no translation splits the link text.

### D4. A new tab with `noopener noreferrer` (FR3, UX3)

Navigating the app's own tab would leave the app and, in the installed standalone app, replace its only window. `target="_blank"` opens a new tab in a browser and the system browser from an installed PWA; `rel="noopener noreferrer"` keeps the opened page from reaching `window.opener`. The service worker does not intercept a cross-origin navigation, and the app makes no request itself, so offline nothing in the app changes (NG3).

Alternative: **same-tab link** — rejected, it loses the pinned moment (ADR-0003: the reference moment is not persisted).

### D5. Tests by what they assert (all requirements)

- Vitest (jsdom) `app/settings/GnomishFactoryCredit.test.tsx`: role link, name per language, `href`, `target`, `rel`; `app/settings/SettingsPage.test.tsx`: the credit is the header's first focusable element, before Back, and the heading still has the focus.
- playwright-bdd `settings/settings_factory_credit_e2e.feature` with `steps/settings_factory_credit_e2e.steps.ts`: position above the heading, the popup's URL (the route to `https://oinsio.github.io/**` is fulfilled with a stub page on the browser context, so the run needs no network), computed colours against `readTokenStyle` of `--color-muted-foreground` and `--color-accent`, Shift+Tab order, focus outline, 44 px height, full text at 320/2560 px (`scrollWidth <= clientWidth` of the link and of the page).
- The existing axe-core, width and screenshot outlines of `settings_e2e.feature` get this change's tags and the screenshots are re-approved.
- Class strings that only the browser can see get `// Stryker disable next-line StringLiteral: layout and colour, covered by settings_factory_credit_e2e.feature`, in the spirit of the `// Stryker disable all: … label alignment is layout, untested in jsdom by design …, covered by time_selection_layout_e2e.feature` comment at the top of `views/shared/DayTrack.tsx`.

## Risks / Trade-offs

- [The credit line makes the settings header taller, by about 52 px] → accepted: the option groups stay above the fold at 375 px; the re-approved screenshots (NFR-R2) record it.
- [The landing page may move] → its address is one constant (D3) and one expected value in the tests.
- [Popup checks depend on the browser allowing `target="_blank"` in headless Chromium] → Playwright reports it as a `popup` event on the page; the route stub removes the network dependency.

## Migration Plan

None: no stored data. Rollback is reverting the change.
