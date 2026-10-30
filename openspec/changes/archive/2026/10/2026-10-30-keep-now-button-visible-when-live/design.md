# Design: Keep the Now button visible when live

## Context

Driven by FR1–FR4, NFR-A1–NFR-A3, NFR-R1, NFR-R2, UX1 and UX2 of `proposal.md`. The motivation is in the proposal's Why section. Every owner below was opened on `main` under `packages/client/src/`, and the glossary (`docs/glossary/date-selection.md`, `docs/glossary/time.md`) names each one.

- **Mode of the reference moment**: the model owns it as `ReferenceMode.LIVE | PINNED` (glossary "Live", "Pinned"). `useReferenceMoment` in `controller/useReferenceMoment.ts` passes `isPinned: state.reference.mode === ReferenceMode.PINNED` to `presentDateBar` (`presenter/dateBar.ts`), which returns it unchanged as `PresentedDateBar.isPinned`. `returnToNow` dispatches `RESET_TO_NOW`.
- **Now button**: `views/shared/DateBar.tsx` (82 lines). It renders `{dateBar.isPinned && (<button …>)}` with the classes `flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground focus-visible:outline …`, a `Clock` icon (`NOW_ICON_SIZE_PX = 16`) and `t("date.now")`. `handleReturnToNow` calls `returnToNow()` and then focuses the date button through `dateButtonRef`.
- **Tokens**: `styles/tokens.css` defines `--color-muted-foreground` (`#5b5b63` light, `#9aa8c2` dark) but no grey fill. `tailwind.config.ts` maps `muted-foreground`, `accent`, `surface`, `border` and others, but no `muted`. `styles/tokens.test.ts` checks contrast with its own `contrastRatio` helper.
- **Tests that read "Now is hidden"**:
  - unit: `views/shared/DateBar.test.tsx` and `views/shared/CalendarDialog.test.tsx` (`not.toBeInTheDocument()` twice each); `test/features/date_selection/steps/dateSelectionQueries.tsx` (`isNowShown`, used by `dateSelectionWorld.tsx`'s `isNowShown`, `expectLive` and `expectPinnedTo`, and by `referenceMomentStepHelpers.ts`); `test/features/time_selection/steps/timeSelectionWorld.tsx` (`isNowShown: () => current().reference.dateBar.isPinned`, used by `selectTimeSteps.ts`, `time_selection_moment.steps.tsx`, `wallTimeStepHandlers.ts`, `time_selection_legacy_tap.steps.tsx`); `test/features/locations/steps/hereEntryWorld.tsx` (`nowButton()`, read by `locations_here_entry_changes_unit.steps.tsx`).
  - E2E: `dateSelectionE2eHelpers.ts` (`showNextDay` waits for `toBeVisible()`); `date_selection_e2e.steps.ts` ("the bar is live" expects `toHaveCount(0)`); `date_selection_view_contract_e2e.steps.ts` ("the user returns to now with the bar" expects `toHaveCount(0)`); `time_selection_pointer_e2e.steps.ts` ("the Now button is shown" / "is not shown").
  - Gherkin with the step texts "the Now button is shown" / "is not shown": `date_selection_reference_moment.feature`, `date_selection_calendar.feature`, `time_selection_moment.feature`, `time_selection_wall_time_input_unit.feature`, `time_selection_wall_time_input_e2e.feature`, `time_selection_touch_e2e.feature`, `locations_here_entry_changes_unit.feature`.
- **Screenshots**: the outline "Screenshot of the <state> state at <width> px in the <theme> theme" in `test/features/locations/locations_ui_e2e.feature`, with baselines in `test/features/__screenshots__/`. Every state with a live moment now shows the date bar with a grey Now.
- **Storybook**: the repository has no Storybook (`package.json` has no such dependency, and there are no `*.stories.tsx` files). The UI states of the bar are covered by the BDD and screenshot scenarios above.

## Decisions

### D1: The view keeps the button rendered and disables it while live

`DateBar` always renders the Now button and sets the native `disabled` attribute to `!dateBar.isPinned`. No model, controller or presenter code changes. The mode keeps its one owner (`ReferenceMode`), and `PresentedDateBar.isPinned` stays the only input the view reads (NG3).

Native `disabled` gives every part of FR2 and NFR-A1–NFR-A2 from the platform:

- browsers do not fire `click` on a disabled button;
- the button is not a Tab stop, so Enter and Space cannot reach it;
- assistive technology gets the button's name ("Now", «Сейчас») and its disabled state;
- axe-core does not apply the colour-contrast rule to it, but NFR-A3 is still kept through D3.

`handleReturnToNow` stays as it is. It moves the focus to the date button in the same handler that dispatches `RESET_TO_NOW`, before React re-renders the button as disabled. So the focus is never left on a disabled control (FR3, NFR-A2).

### D2: Colours through `disabled:` variants on one class list

The button keeps one class string. The active look stays `bg-accent text-accent-foreground`, and the inactive look is added with Tailwind's `disabled:` variants: `disabled:bg-muted disabled:text-muted-foreground disabled:cursor-default`. The `Clock` icon has no colour of its own and inherits `currentColor`, so it turns grey with the label. Size, padding, gap and radius do not change, so the box is the same in both modes (NFR-R1, UX2). No mode-dependent class branch is needed in TypeScript, and the look follows the attribute that D1 sets.

### D3: One new design token, the grey fill

`styles/tokens.css` gets `--color-muted`: `#e4e4e7` in the light theme and `#2a3550` in the dark theme (under the existing `prefers-color-scheme: dark` block). `tailwind.config.ts` maps it as `muted: "var(--color-muted)"`, next to the existing `muted-foreground`. The label reuses `--color-muted-foreground`. Contrast of the label on the fill (WCAG formula, as in `tokens.test.ts`): 5.30:1 light (`#5b5b63` on `#e4e4e7`), 5.08:1 dark (`#9aa8c2` on `#2a3550`). The fill also differs from the page background (`#f7f7f5` light, `#0f1729` dark), so the inactive button stays visible as a shape. `tokens.test.ts` checks the 4.5:1 for both themes (NFR-A3, M2). The design rule "One layout for light and dark themes; only token values differ" (`docs/architecture/views.md`) holds: only the token value differs between the themes.

### D4: Step texts say "active" and "inactive"

"The Now button is shown" becomes "the Now button is active", and "is not shown" becomes "is inactive", in every feature listed in Context and in their step definitions. Each test helper that answers this question is renamed from `isNowShown` to `isNowActive`:

- DOM worlds (`dateSelectionQueries.tsx`): the button named `date.now` is in the bar and is not `disabled`. "Inactive" means it is in the bar and `disabled`, so neither answer passes when the button is missing.
- Hook world (`timeSelectionWorld.tsx`): it keeps reading `dateBar.isPinned`. That world renders no `DateBar`, and D1 makes "active" exactly "pinned".
- `hereEntryWorld.tsx`'s `nowButton()` is asserted with `toBeEnabled()`.
- E2E: `nowButton(page)` is asserted with `toBeEnabled()` / `toBeDisabled()` instead of `toBeVisible()` / `toHaveCount(0)`.

### D5: New real-browser scenarios in a new feature file

`date_selection_e2e.steps.ts` has 187 lines and `date_selection_theme_e2e.steps.ts` 161, so the new E2E scenarios go into `test/features/date_selection/date_selection_now_e2e.feature` with `steps/date_selection_now_e2e.steps.ts`: Tab skips an inactive Now, names and disabled state in English and Russian, a forced click on an inactive Now, grey colours in both themes, and the same box live and pinned. They reuse `dateSelectionE2eHelpers.ts` (`nowButton`, `nextDayButton`, `requireBox`, `showNextDay`) and the existing steps "the current time is …", "the locations screen uses the <theme> theme", "the screen is <width> px wide for the locations", "the user opens the locations app" and "the locations interface language is Russian". The colour step reads the tokens the same way `date_selection_theme_e2e.steps.ts` does (`computedColourOfVariable`). That helper moves into `dateSelectionE2eHelpers.ts` so it is not duplicated.

## Consequences

Positive:
- The change touches one component, one token and test wording. The mode keeps a single owner.
- The bar's layout no longer changes between live and pinned.
- Disabled behaviour, focus order and the exposed state come from the platform, not from custom handlers.

Negative:
- A screen reader user who tabs through the bar while live no longer hears Now. It is still found when browsing the page, named and marked as disabled.
- Every live-state screenshot baseline changes once.

## Alternatives Considered

**`aria-disabled="true"` and an ignoring click handler**: keeps Now focusable while live. Rejected: Tab would stop on a control that does nothing, the handler adds a branch the platform already provides, and NFR-A2 asks to skip it.

**A new `isNowActive` field in `PresentedDateBar`**: rejected. It would be a second name for `isPinned`, a second owner of the same concept.

**Reuse `--color-border` as the grey fill**: rejected. `#8a8a93` with the light muted foreground `#5b5b63` gives about 2:1, below NFR-A3.

**Opacity on the accent button**: rejected. A faded accent is still blue or cyan, not the theme's grey the task asks for (UX1).
