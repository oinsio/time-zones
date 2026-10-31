# Specs review: move-and-restyle-gnomish-factory-credit

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 26/26 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 3 |

## Freshness

- ✅ `GnomishFactoryCredit.tsx` is one `<a>` with exactly the class string quoted in design.md:7, under `// Stryker disable next-line StringLiteral: layout and colour, covered by settings_factory_credit_e2e.feature` (`packages/client/src/app/settings/GnomishFactoryCredit.tsx:18-19`).
- ✅ `SettingsPage.tsx` is 131 lines. Its `<header>` is `flex flex-col gap-2 border-b border-border pt-6 pb-4` and holds `<GnomishFactoryCredit />` and then the `grid grid-cols-[auto_1fr_auto] items-center gap-2` row with the back button, the `<h1 tabIndex={-1}>` and an `aria-hidden` spacer (`SettingsPage.tsx:58-78`).
- ✅ `<main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 py-6">` holds, in order: the unreadable `role="alert"` note with Reset, the save-failed `role="alert"` note, the theme group and the hour format group (`SettingsPage.tsx:79-119`).
- ✅ Before `add-gnomish-factory-credit` the header was `grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-border pt-6 pb-4` (`git show b5b2432^:packages/client/src/app/settings/SettingsPage.tsx:56`), which matches design D1.
- ✅ `SettingsOptionGroup` draws each option `Icon` with `className="text-accent"` inside a `<fieldset>`. Its `role="radiogroup"` div has `aria-label={legend}`. The legend is `text-sm` (`SettingsOptionGroup.tsx:34-61`). `THEME_OPTION_ICONS` maps the themes to `Sun`, `Moon` and `Monitor` (`SettingsPage.tsx:15-19`).
- ✅ `tokens.css` sets `--color-accent` to `#2f5bd3` / `#5ec2e8` and `--color-background` to `#f7f7f5` / `#0f1729` (`src/styles/tokens.css:10,14,31,35`). The WCAG contrast recomputes to 5.50:1 and 8.82:1.
- ✅ `tailwind.config.ts` maps `accent` and has no `fontSize` in `theme.extend`. `MANROPE_FONT_FAMILY` is at line 6. Tailwind is `^3.4.17` (`packages/client/package.json:69`).
- ✅ `SettingsPage.credit.test.tsx` has "should show the Gnomish Factory credit as the first element of the header" (checks the `banner`) and "should keep the focus on the heading with the credit shown" (`SettingsPage.credit.test.tsx:27,42`).
- ✅ `SettingsPage.test.tsx` imports `PreferencesLoadStatus` from `@/ports` and uses `createInMemoryPreferencesRepository({ initialDocument: { status: PreferencesLoadStatus.UNREADABLE } })` (`SettingsPage.test.tsx:7,128`). `src/app/AppShell.settings.test.tsx` exists.
- ✅ `settings_factory_credit_e2e.feature` is 87 lines, `steps/settings_factory_credit_e2e.steps.ts` 199 lines, `steps/settingsCreditE2eHelpers.ts` 68 lines. The steps check the muted colour (`:104-116`), "above the back button and the settings heading" (`:48-63`), and "the credit gets the keyboard focus" by Shift+Tab twice (`:119-124`).
- ✅ The reused E2E steps exist: "the stored preferences are unreadable" (`settings_theme_e2e.steps.ts:20`), "the settings show the unreadable note with Reset" (`settings_theme_e2e.steps.ts:40`), "the user opens the settings" (`settings_e2e.steps.ts:22`), "the user presses Shift+Tab" and "the focus is on the back button" (`settings_factory_credit_e2e.steps.ts:164,169`). All use the `locations_ui_e2e.fixtures` `test`.
- ✅ `RADIOGROUP_ROLE` and `settingsHeading` are exported by `settingsE2eHelpers.ts:8,31`. `readTokenStyle` is exported by `time_selection/steps/timeSelectionE2eHelpers.ts:55`. `ANY_LANGUAGE_BACK_BUTTON_NAME`, `CENTRE_TOLERANCE_PX`, `ACCENT_TOKEN` and `MUTED_FOREGROUND_TOKEN` are in `settingsCreditE2eHelpers.ts:8,9,16,53`.
- ✅ No step with the exact text "the user presses Tab" exists (grep over `src/test/features`). A generic `"the user presses the key {string}"` does exist, see R3.
- ✅ The playwright-bdd step glob is `src/test/features/**/steps/*_e2e.{steps,fixtures}.ts` (`playwright.bdd.config.ts:14`), so a new `steps/settings_factory_credit_layout_e2e.steps.ts` is picked up. The projects that run the settings features are `chromium` and `mobile-chrome` (`:88,93`).
- ✅ The 4 `Approved-screenshots-of-the-settings-at-{375,1024}-px-in-the-{light,dark}-theme.png` baselines exist under both `__screenshots__/chromium/` and `__screenshots__/mobile-chrome/`, and no other baseline file names the settings page.
- ✅ `settings_e2e.feature` has the outlines "Settings have no accessibility violations in the <theme> theme" (`:57`), "No violations with the unreadable note" (`:68`) and "Approved screenshots of the settings at <width> px in the <theme> theme" (`:87`).
- ✅ The stable `settings` requirement "Gnomish Factory credit" exists as the delta restates it: top line, muted colour at rest and accent on hover and focus, "come before the back button in the Tab order", and the scenarios both languages, following, offline, token colours, theme change, keyboard and full credit (`openspec/specs/settings/spec.md:260-330`). The delta keeps all seven scenarios and adds "The credit below a settings note" and "The larger credit text".
- ✅ `docs/glossary/settings.md:11` reads "the top line of the settings page, one link …", and `docs/architecture/views.md:111` reads "the Gnomish Factory credit as the top line;". The task 1.1 greps give the expected counts after the edit (glossary line 5 names the credit without "top line").
- ✅ "theme group" is already the stable spec's term (`openspec/specs/settings/spec.md:9,206`).
- ✅ The only other active change is `add-pr-preview-deploy`, which has only `specs/app-delivery` (`openspec/changes/`). `docs/ia/` does not exist. `docs/design/README.md:40` says settings have no screens yet.
- ✅ Nothing is implemented yet: the code still has the credit in the header with `text-sm text-muted-foreground`.

## Coverage

| Requirement id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ "The credit in both languages", "The credit below a settings note" | ✅ 1.1, 2.1–2.2, 4.2 |
| FR2 | ✅ | ✅ "Token colours in both themes", "The credit follows a theme change" | ✅ 3.2–3.3, 4.2 |
| FR3 | ✅ | ✅ "The larger credit text" | ✅ 3.1–3.3, 4.2 |
| NFR-A1 | ✅ | ✅ "Keyboard order and focus" | ✅ 2.1, 4.2 |
| NFR-A2 | ✅ | ✅ contrast and axe-core in the requirement text | ✅ 4.2, 4.3 |
| NFR-R1 | ✅ | ✅ "The full credit on narrow and wide screens" | ✅ 4.2 |
| NFR-R2 | ✅ | ✅ the existing stable requirement on approved settings screenshots (`openspec/specs/settings/spec.md:225,236`), unchanged | ✅ 5.1 |
| UX1 | ✅ | ✅ place and centring in "The credit in both languages" | ✅ 2.1, 4.2; the size relation only by the 5.1 screenshot look, see R2 |
| UX2 | ✅ | ✅ "Token colours in both themes" | ✅ 3.2, 4.2 |
| M1 | ✅ | n/a | ✅ 4.2 |
| M2 | ✅ | n/a | ✅ 4.2 |
| M3 | ✅ | n/a | ✅ 4.2 |
| M4 | ✅ | n/a | ✅ 4.2 |
| M5 | ✅ | n/a | ✅ 4.3 |
| M6 | ✅ | n/a | ✅ 4.2 |
| M7 | ✅ | n/a | ✅ 5.1 |
| M8 | ✅ | n/a | ✅ 6.1 |
| M9 | ✅ | n/a | ✅ 6.3 |
| G1 | ✅ | n/a, met by FR1, M1 | n/a, met by FR1, M1 |
| G2 | ✅ | n/a, met by FR2, M2 | n/a, met by FR2, M2 |
| G3 | ✅ | n/a, met by FR3, M3 | n/a, met by FR3, M3 |
| NG1 | ✅ | n/a | n/a; no artifact changes the text, address, new tab or translations |
| NG2 | ✅ | n/a | n/a; the header loses only the credit, and the back button, heading, groups, notes and icons are unchanged |
| NG3 | ✅ | n/a | n/a; D2 reuses `text-accent`, and no token value changes |
| NG4 | ✅ | n/a | n/a; no artifact adds the credit elsewhere |
| Q1 | ✅ | n/a | n/a; answered in `design.md` D3 (16.5 px), and deliberately left open to the owner's preference |

## Consistency

None.

## Findings

### R1 — SUGGESTION — NFR-A1's Shift+Tab claim is false when the unreadable note is shown
- Location: `openspec/changes/move-and-restyle-gnomish-factory-credit/proposal.md:66`
- Rule: `.claude/rules/proposal-format.md`
- Problem: NFR-A1 says "From the focused heading, Tab reaches it when no settings note is shown. Shift+Tab from it reaches the back button." Only the Tab sentence is limited to "no settings note". Design D1 (`design.md:43`) places the Reset button of the unreadable note between the back button and the credit in the Tab order. So with that note, Shift+Tab from the credit reaches Reset, not the back button. The delta spec (`specs/settings/spec.md:8`) says only "come after the back button and before the theme group", which stays true.
- Impact: Read literally, the requirement is false in the note state that FR1 and the UI States Matrix (`proposal.md:87`) define. An implementer who writes a keyboard check for "The credit below a settings note" scenario from NFR-A1 gets a failing assertion, or may think the notes must come after the credit, which D1 rejects.
- Fix: In `proposal.md:66`, change "Shift+Tab from it reaches the back button." to "Shift+Tab from it reaches the back button when no settings note is shown, and the Reset button when the unreadable note is shown."
- Fix risk: none. It matches D1 and the delta spec, and no task asserts the note-state Tab order.
- Status: open

### R2 — SUGGESTION — UX1's size relation has no automated assertion
- Location: `openspec/changes/move-and-restyle-gnomish-factory-credit/proposal.md:76`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it")
- Problem: UX1 asks for the credit to be "larger than the group legends and smaller than the heading". Task 4.2 checks UX1's place and centring. Task 4.2 "The larger credit text" checks only the ratio to a 14 px constant. The size relation to the legends (`text-sm`, `SettingsOptionGroup.tsx:35`) and to the heading (`text-2xl`, `SettingsPage.tsx:72`) is checked only when the implementer looks at the screenshots in task 5.1 (`tasks.md:89`).
- Impact: That half of UX1 rests on a visual look, not an assertion. The approved screenshot only freezes what was approved. Today the FR3 ratio implies "larger than the legends" only because the legends happen to be 14 px, and "smaller than the heading" is not checked at all.
- Fix: In `tasks.md` 4.2, add to the scenario "The larger credit text" (tag it `@UX1` too) the step "the credit is larger than the group legends and smaller than the settings heading". It compares the credit's computed `font-size` with that of the theme group's `legend` (strictly greater) and with `settingsHeading(page)` (strictly smaller). Put the step in `steps/settings_factory_credit_layout_e2e.steps.ts` if the main steps file would pass 200 lines, as 4.2 already allows. In 5.1, drop "and larger than the group legends" from the visual confirmation.
- Fix risk: one more E2E step in a steps area near the 200-line cap. The split file that task 4.2 already provides absorbs it. It stays in playwright-bdd, where computed styles belong (ADR-0001).
- Status: open

### R3 — SUGGESTION — The new step "the user presses Tab" duplicates an existing generic key step
- Location: `openspec/changes/move-and-restyle-gnomish-factory-credit/tasks.md:79`
- Rule: —
- Problem: Task 4.2 (and design D4, `design.md:22,76`) adds a new step "the user presses Tab" because no step with that text exists. But `time_selection/steps/time_selection_pointer_e2e.steps.ts:80-85` already defines `When("the user presses the key {string}", …)`, which calls `locationsWorld.page.keyboard.press(key)` with the same `locations_ui_e2e.fixtures` `test`. The step glob `src/test/features/**/steps/*_e2e.{steps,fixtures}.ts` makes it available to the settings features.
- Impact: The change adds a second step definition for the same action. It does so in `settings_factory_credit_e2e.steps.ts`, which is already at 199 lines, so the file split becomes more likely.
- Fix: In `tasks.md` 4.2 "Keyboard order and focus", use `When the user presses the key "Tab"` (both times) instead of the new "the user presses Tab". Drop the definition of that new step. Keep `TAB_KEY` for "the credit gets the keyboard focus". In `design.md:22` and `:76`, replace "a new step 'the user presses Tab'" with a reference to the existing `the user presses the key {string}`.
- Fix risk: the scenario reads a little more mechanically, as does the existing time-selection usage. The delta-spec scenario text ("the user presses Tab") needs no change.
- Status: open

## Verdict

Ready to implement. No blocking findings: R1–R3 are SUGGESTIONs and the change can be implemented as written.
