# Specs review: add-gnomish-factory-credit

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 28/28 |
| Contradictions | 1 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 2 |

## Freshness

- ✅ `design.md:7` — `packages/client/src/app/settings/SettingsPage.tsx` has 126 lines; its `<header>` (line 56) is `grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-border pt-6 pb-4` with the back button (`min-h-11 min-w-11 … text-accent … focus-visible:outline-accent`, line 61), the `<h1 tabIndex={-1}>` focused by the mount `useEffect` (lines 50–52, 65–71) and the `aria-hidden` `min-w-11` spacer (line 72).
- ✅ `design.md:7`, `design.md:32` — `app/settings/index.ts` exports only `SettingsPage`; `SettingsOptionGroup` is imported from the sibling file (`SettingsPage.tsx:6`).
- ✅ `design.md:8` — the `settings.*` keys exist in `locales/en.json:103-117` (and `ru.json`); `locales/locales.test.ts` checks one shared key set.
- ✅ `design.md:9` — `src/constants/` has no `api.ts` (files `clock.ts` … `utcOffset.ts`, re-exported by `constants/index.ts`), and no production `.ts`/`.tsx` under `src/` contains an `https://` literal (grep finds none).
- ✅ `design.md:10` — `styles/tokens.css:10,13,14,31,34,35` define the quoted light/dark values of `--color-background`, `--color-muted-foreground`, `--color-accent`; `tailwind.config.ts:19-22` maps them; recomputed contrasts are 6.27, 7.45, 5.50 and 8.82 :1 as stated.
- ✅ `proposal.md:55` (Manrope) — `tailwind.config.ts:6,46-47` sets `Manrope Variable` as `fontFamily.sans`.
- ✅ `design.md:11` — `test/features/settings/steps/settingsE2eHelpers.ts` exports `openSettings`, `settingsHeading`, `BACK_BUTTON_NAME`, `MIN_OPTION_HEIGHT_PX = 44`, `seedPreferences`, `THEME_VALUES`.
- ✅ `design.md:11` — the reused steps exist where named: "the user opens the settings", "the user goes back from the settings", "the settings page needs no horizontal scrolling", "the locations interface language is English" (`settings_e2e.steps.ts:22,36,140,167`); "… is Russian" (`home_location_e2e.steps.ts:36`); the system colour scheme regexes (`settings_theme_e2e.steps.ts:73,80`); the theme regex and "the locations screen has no accessibility violations" (`locations_view_a11y_e2e.steps.ts:18,34`); the width and screenshot steps (`locations_layout_e2e.steps.ts:15,63`); `readTokenStyle` (`timeSelectionE2eHelpers.ts:55`).
- ✅ `tasks.md:36` — "the time of {string} reads {string}" exists (`settings_theme_e2e.steps.ts:128`), and "the focus is on the settings heading" exists (`settings_e2e.steps.ts:50`).
- ✅ `design.md:11` — `settings_e2e.feature` has 161 lines and `settings_e2e.steps.ts` 171 lines; the outlines task 5.2 and 6.1 tag exist under those names (`settings_e2e.feature:44,56,74,86`).
- ✅ `design.md:12` — the four `Approved-screenshots-of-the-settings-at-{375,1024}-px-in-the-{light,dark}-theme.png` baselines exist under `__screenshots__/chromium/` and `__screenshots__/mobile-chrome/`, the two projects of `playwright.bdd.config.ts:88,93`.
- ✅ `tasks.md:24` — `app/settings/SettingsPage.test.tsx` switches the language with `i18n.changeLanguage` (lines 33, 36) and has 181 lines, so the task's split fallback is needed and named; `app/AppShell.settings.test.tsx` exists.
- ✅ `design.md:51` — `views/shared/DayTrack.tsx:20` carries the quoted `// Stryker disable all: … covered by time_selection_layout_e2e.feature` comment.
- ✅ `specs/settings/spec.md:74-85` — the MODIFIED "Settings strings are localized" restates `openspec/specs/settings/spec.md:173-183` in full and adds the credit; the ADDED "Gnomish Factory credit" duplicates no stable requirement.
- ✅ `tasks.md:16` — `docs/glossary/settings.md` (9 lines) has the **Settings page** entry as "the page with the theme preference and the hour format"; `docs/architecture/views.md:111` has the Overlays row "Settings".
- ✅ `proposal.md:100` — `docs/design/README.md:40` reads "Search, settings, empty, error and offline states have no screens yet".
- ✅ `proposal.md:3` — `add-pr-preview-deploy` has only `specs/app-delivery`; both named archived changes exist under `openspec/changes/archive/2026/10/`.
- ✅ Nothing is implemented yet: no "gnomish"/«фабрик» in `packages/client/src` or `docs/glossary`.
- ✅ `design.md:34`, `tasks.md:37` — Tailwind is `^3.4.17` with no `hoverOnlyWhenSupported`, so `hover:text-accent` applies in both Playwright projects; `.hover()` is already used in `time_selection_wall_time_input_e2e.steps.ts:208`.
- ✅ `design.md:42` — the service worker's scope is `APP_BASE_PATH` (`vite.config.ts:58`), so the cross-origin landing page is outside it.
- ✅ `design.md:14` — all ten ADRs in `docs/adr/` are Accepted (0007 partly superseded by 0010); the change stores nothing, reads no clock and adds no view.
- ❌ `proposal.md:89` — "settings page loading | none: the settings page renders synchronously with the shell, there is no loading state to cover". Reality: `app/AppShell.tsx:25-27` loads `SettingsPage` with `lazy(…import("./settings"))` and renders it inside `<Suspense fallback={<ViewSkeleton />}>` (`AppShell.tsx:98-107`).

## Coverage

| Requirement id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ ADDED "Gnomish Factory credit", scenario "The credit in both languages" | ✅ 3.1–3.2, 4.1–4.2, 5.1 |
| FR2 | ✅ | ✅ same scenario + MODIFIED "Both languages" | ✅ 2.1, 3.1, 5.1, 5.2 |
| FR3 | ✅ | ✅ "Following the credit keeps the app" | ✅ 2.1, 3.1, 5.1 |
| FR4 | ✅ | ✅ "Token colours in both themes", "The credit follows a theme change" | ✅ 3.2, 5.1 |
| NFR-A1 | ✅ | ✅ "Keyboard order and focus" + axe-core clause | ✅ 3.1, 4.1, 5.1, 5.2 |
| NFR-A2 | ✅ | ✅ "Keyboard order and focus" | ✅ 4.1, 5.1 |
| NFR-R1 | ✅ | ✅ "The full credit on narrow and wide screens" | ✅ 5.1, 5.2 |
| NFR-R2 | ✅ | ✅ unchanged stable "Settings page layout" scenario "Approved screenshots" | ✅ 6.1 |
| UX1 | ✅ | ✅ "The credit in both languages" (above the heading) | ✅ 4.2, 5.1, 6.1 |
| UX2 | ✅ | ✅ "Token colours in both themes" | ✅ 5.1 |
| UX3 | ✅ | ✅ "Following the credit keeps the app" | ✅ 5.1 |
| M1 | ✅ | n/a | ✅ 3.1, 4.1, 5.1 |
| M2 | ✅ | n/a | ✅ 5.1 |
| M3 | ✅ | n/a | ✅ 5.1 |
| M4 | ✅ | n/a | ✅ 5.2 |
| M5 | ✅ | n/a | ✅ 5.1, 5.2 |
| M6 | ✅ | n/a | ✅ 6.1 |
| M7 | ✅ | n/a | ✅ 7.1 |
| M8 | ✅ | n/a | ✅ 7.3 |
| G1 | ✅ | n/a — met by FR1, FR2, M1 | n/a — met by FR1, FR2, M1 |
| G2 | ✅ | n/a — met by FR3, M2 | n/a — met by FR3, M2 |
| G3 | ✅ | n/a — met by FR4, M3 | n/a — met by FR4, M3 |
| NG1 | ✅ | n/a | n/a — no artifact touches the main page, views or the recovery screen |
| NG2 | ✅ | n/a | n/a — no about page, version, licence or logo is built |
| NG3 | ✅ | n/a | n/a — no offline indication is built |
| NG4 | ✅ | n/a | n/a — D1/4.2 move the back button, heading and spacer into a wrapper with unchanged classes |
| NG5 | ✅ | n/a | n/a — no token; `GnomishFactoryCredit` is local to `app/settings/`, not shared |
| Q1 | ✅ | n/a | n/a — decided in the proposal itself ("Built with Gnomish Factory"), mirrored by design D3; left open only for an owner preference |

## Consistency

- `specs/settings/spec.md:75` requires the Russian settings strings to use the glossary name «Гномская фабрика» (as does `proposal.md:12`), while the only Russian string the change adds, `tasks.md:20` (task 2.1) «Создано с помощью Гномской фабрики», contains only the genitive «Гномской фабрики»; the glossary *RU:* of the credit (`tasks.md:16`) is the full phrase.

## Findings

### R1 — WARNING — UI States Matrix claims the settings page has no loading state
- Location: `openspec/changes/add-gnomish-factory-credit/proposal.md:89`
- Rule: `.claude/rules/proposal-format.md` (UI States Matrix); `CLAUDE.md` "UI must handle ALL states: loading, error, empty, offline"
- Problem: the matrix row "settings page loading" says "none: the settings page renders synchronously with the shell, there is no loading state to cover". The code loads the settings page lazily: `app/AppShell.tsx:24-27` (`const SettingsPage = lazy(async () => ({ default: (await import("./settings")).SettingsPage }))`, commented "Loaded on demand so the settings page stays out of the initial JavaScript (NFR-P1 budget)") and renders it inside `<Suspense fallback={<ViewSkeleton />}>` (`AppShell.tsx:98-107`).
- Impact: the archived proposal records a false fact about the code, and the one real loading state, while the settings chunk loads, is left undescribed. The implementer is not told that the credit belongs inside the lazy chunk. `GnomishFactoryCredit` has to be imported only by `SettingsPage`, not by `AppShell` or a shared module, so that it adds nothing to the initial JavaScript budget.
- Fix: replace the row with `| offline or online | settings chunk loading | the existing ViewSkeleton fallback of AppShell's Suspense; the credit appears with the settings page, because it ships in the lazily loaded settings chunk |`. Then add one sentence to design D2 (`design.md:32`): "Being imported only by `SettingsPage`, the credit ships in the lazily loaded settings chunk (`AppShell.tsx:25`) and adds nothing to the initial JavaScript."
- Fix risk: none. D2 already keeps the component out of `app/settings/index.ts` and `views/shared/`, so the edit only records what that layout does, and no task changes.
- Status: fixed
- Resolution: proposal.md UI States Matrix row is now "settings chunk loading" — the shell's existing skeleton fallback while the lazily loaded settings page arrives, the credit appearing with it; design.md D2 adds that the credit ships in the lazy settings chunk (AppShell lazy + Suspense ViewSkeleton) and that neither AppShell nor views/shared/ imports it.

### R2 — SUGGESTION — The MODIFIED localization requirement names a Russian form no string uses
- Location: `openspec/changes/add-gnomish-factory-credit/specs/settings/spec.md:75`
- Rule: `.claude/rules/i18n.md` ("Name domain concepts in both languages with the glossary terms … the *RU:* name in `ru.json`")
- Problem: the MODIFIED requirement adds «Гномская фабрика» to the glossary names that the Russian settings strings MUST use (and `proposal.md:12` says "Russian uses the glossary name «Гномская фабрика»"). The only Russian string the change adds is «Создано с помощью Гномской фабрики» (task 2.1, `tasks.md:20`). It contains only the genitive «Гномской фабрики», and the glossary *RU:* name of the Gnomish Factory credit is that full phrase (task 1.1, `tasks.md:16`).
- Impact: read literally, the SHALL clause cannot be met. A check that looks for the listed names in `ru.json` would never find «Гномская фабрика», and the archived requirement would name the wrong form as the binding Russian text.
- Fix: in `specs/settings/spec.md:75`, replace «Гномская фабрика» in the list with «Создано с помощью Гномской фабрики». In `proposal.md:12`, write "Russian uses the glossary name «Создано с помощью Гномской фабрики» (the Gnomish Factory credit)".
- Fix risk: none. The **Gnomish Factory** glossary entry keeps its nominative *RU:* «Гномская фабрика» (task 1.1), and no test text changes.
- Status: fixed
- Resolution: specs/settings/spec.md MODIFIED "Settings strings are localized" now lists «Создано с помощью Гномской фабрики» instead of «Гномская фабрика», and proposal.md What Changes says Russian uses that glossary name (the Gnomish Factory credit); the glossary entry for Gnomish Factory keeps its nominative RU name.

### R3 — SUGGESTION — The offline row and "works the same offline" have no scenario
- Location: `openspec/changes/add-gnomish-factory-credit/specs/settings/spec.md:4`
- Rule: `CLAUDE.md` ("UI must handle ALL states: loading, error, empty, offline"); `.claude/rules/test-planning.md`
- Problem: the ADDED requirement says "The app MUST NOT request the landing page itself, so the settings page works the same offline", and the matrix offline row (`proposal.md:86`) promises "the same credit line" offline. No delta scenario covers it, and no task covers it either. The existing "Offline reopen" scenario (`settings_e2e.feature:153-161`) never opens the settings page.
- Impact: the offline state of the credit line stays untested. If, for example, an icon or font were fetched from the factory's site, nothing would catch the break offline.
- Fix: add the spec scenario "The credit offline" (GIVEN the app is installed for offline use, WHEN the user reopens the app without network and opens the settings, THEN the credit is "Built with Gnomish Factory"). In task 5.1 (`tasks.md:34`), add a scenario `@add-gnomish-factory-credit @FR3` that reuses "the app is installed for offline use" (`settings_theme_e2e.steps.ts:50`), "the user reopens the locations app without network" (`locations_tabs_offline_e2e.steps.ts:56`), "the user opens the settings" and the task 5.2 step `the Gnomish Factory credit is "Built with Gnomish Factory"`.
- Fix risk: one more E2E scenario in both projects adds run time. It relies on the settings chunk being precached, and it is: `vite.config.ts:63` precaches `**/*.js`.
- Status: fixed
- Resolution: added scenario "The credit offline" to the ADDED requirement in specs/settings/spec.md; task 5.1 gets an `@FR3` E2E scenario reusing "the app is installed for offline use", "the user reopens the locations app without network" and "the user opens the settings", and defines the step `the Gnomish Factory credit is "<credit>"` that task 5.2 now reuses; proposal Behavior lists it.

## Verdict

Ready to implement. No finding blocks the change: R1 (WARNING) corrects a stale matrix row and adds one sentence to a design note, and R2 and R3 are optional polish.
