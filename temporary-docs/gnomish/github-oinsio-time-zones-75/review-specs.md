# Specs review: keep-now-button-visible-when-live

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 25/25 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 1 |

## Freshness

- ✅ `views/shared/DateBar.tsx` has 82 lines and renders Now as `{dateBar.isPinned && (<button …>)}` with `bg-accent … text-accent-foreground`, a `Clock` icon with `NOW_ICON_SIZE_PX = 16` and `t("date.now")`; `handleReturnToNow` calls `returnToNow()` and then focuses `dateButtonRef` (`DateBar.tsx:7`, `:30-33`, `:61-70`).
- ✅ The DateBar JSDoc reads "and, while pinned, Now" (`DateBar.tsx:13-14`), as task 2.2 quotes.
- ✅ `useReferenceMoment` passes `isPinned: state.reference.mode === ReferenceMode.PINNED` (`controller/useReferenceMoment.ts:41`), `presentDateBar` returns it unchanged (`presenter/dateBar.ts:49,74`), and `returnToNow` dispatches `RESET_TO_NOW` (`useReferenceMoment.ts:106`).
- ✅ `styles/tokens.css` defines `--color-muted-foreground` `#5b5b63` / `#9aa8c2` and no `--color-muted`; the dark values sit under `@media (prefers-color-scheme: dark)` (`tokens.css:9,24,28`).
- ✅ `tailwind.config.ts` maps `"muted-foreground"`, `accent`, `surface`, `border` and no `muted`; `darkMode: "media"`, Tailwind `^3.4.17` (`tailwind.config.ts:11,18-28`, `package.json:69`).
- ✅ `styles/tokens.test.ts` has `NEW_TOKENS`, `readRequired`, `contrastRatio`, `MIN_TEXT_CONTRAST = 4.5` and a `describe.each(["light","dark"])` block (`tokens.test.ts:8-9,49-62`).
- ✅ The contrast numbers of design D3 / M2 hold with the WCAG formula: `#5b5b63` on `#e4e4e7` = 5.30:1, `#9aa8c2` on `#2a3550` = 5.08:1; `#8a8a93` with `#5b5b63` ≈ 1.97:1 (the "about 2:1" of the rejected alternative).
- ✅ Unit tests that expect Now to be hidden: `DateBar.test.tsx:39,54` (two `not.toBeInTheDocument()` at `:50,:66`) and `CalendarDialog.test.tsx:65,77` (`:73,:87`), with the test names task 2.1 quotes.
- ✅ `isNowShown` lives in `test/features/date_selection/steps/dateSelectionQueries.tsx:14`, is used by `dateSelectionWorld.tsx:196-198` (`expectLive`), and `expectPinnedTo` does its own `within(barElement()).getByRole(…)` lookup (`dateSelectionWorld.tsx:201-204`); `dateSelectionWorld.tsx` has 217 lines.
- ✅ `referenceMomentStepHelpers.ts:35-36` defines `thenNowNotShown` / `thenNowShown`; `timeSelectionWorld.tsx:186` has `isNowShown: () => current().reference.dateBar.isPinned`; callers `selectTimeSteps.ts`, `time_selection_moment.steps.tsx`, `wallTimeStepHandlers.ts`, `time_selection_legacy_tap.steps.tsx`, `date_selection_calendar.steps.tsx:113` all exist.
- ✅ `hereEntryWorld.tsx:194` defines `nowButton()`, asserted with `toBeInTheDocument()` at `locations_here_entry_changes_unit.steps.tsx:100`.
- ✅ E2E: `showNextDay` waits for `nowButton(page)` `toBeVisible()` (`dateSelectionE2eHelpers.ts:45-48`); "the bar is live" expects `toHaveCount(0)` (`date_selection_e2e.steps.ts:165-166`); "the user returns to now with the bar" expects `toHaveCount(0)` (`date_selection_view_contract_e2e.steps.ts:19-21`); "the Now button is shown / is not shown" in `time_selection_pointer_e2e.steps.ts:134-141`.
- ✅ `nowButton`, `nextDayButton`, `requireBox`, `showNextDay`, `MIN_TOUCH_TARGET_PX` are exported by `dateSelectionE2eHelpers.ts`; `computedColourOfVariable` is a local function of `date_selection_theme_e2e.steps.ts:23` (161 lines); `date_selection_e2e.steps.ts` has 187 lines.
- ✅ The reused steps exist: "the locations screen uses the (light|dark) theme" (`locations_view_a11y_e2e.steps.ts:18`), "the screen is {int} px wide for the locations" (`locations_layout_e2e.steps.ts:15`), "the user opens the locations app" (`locations_ui_e2e.steps.ts:23`), "the locations interface language is Russian" (`home_location_e2e.steps.ts:36`).
- ✅ The Gherkin step texts "the Now button is shown / is not shown" appear in exactly the seven features design Context lists (`date_selection_reference_moment.feature:13,73,77`, `date_selection_calendar.feature:36`, `time_selection_moment.feature:12`, `time_selection_wall_time_input_unit.feature:98`, `time_selection_wall_time_input_e2e.feature:43`, `time_selection_touch_e2e.feature:14,25`, `locations_here_entry_changes_unit.feature:29`).
- ✅ "Bar in each state" exists in `date_selection_date_bar.feature:37` with the step "the date bar is shown with the previous-day, date and next-day buttons" (`date_selection_date_bar.steps.tsx:168`).
- ✅ The a11y outline "No accessibility violations in the <bar state> state in the <theme> theme" already has live/pinned × light/dark rows (`date_selection_e2e.feature:91-105`), and "No horizontal scrolling at <width> px in the <bar state> state" has 320/2560 × live/pinned (`date_selection_layout_e2e.feature:97-111`); "Tab order of the bar" is pinned (`date_selection_e2e.feature:7-12`).
- ✅ The screenshot outline is `locations_ui_e2e.feature:132` with `pinned` and `time-selected` rows (`:158-169`), and baselines named `Screenshot-of-the-pinned-state-at-…` under `test/features/__screenshots__/` match the grep of task 4.4.
- ✅ The repository has no Storybook and `Stryker disable next-line` comments that name the covering E2E feature are an existing convention (`CalendarDialog.tsx:57`, `DayTrack.tsx:174`).
- ✅ Every MODIFIED requirement exists in `openspec/specs/` under the same name, and the restated text differs only in the Now wording (date-selection: Reference moment, Return to now, Date bar, Date bar on every page state, Keyboard-operable date selection, Accessible date selection, Date bar layout; time-selection: Time selection works with the date bar, Day track layout, The pinned wall-time moment drives every row; locations: Select a time on the Here entry). No other stable spec mentions the Now button.
- ✅ The glossary entry "**Now button** — … It is shown only while the moment is pinned. *Code:* `RESET_TO_NOW`" (`docs/glossary/date-selection.md:8`), `docs/architecture/views.md:81,84` ("the Now button signals a pinned moment", "visible only when the moment is pinned"), and `open-questions.md:18` Q6 read as the H1 patch quotes; no ADR, IA or design-README text says Now is hidden while live.
- ✅ Nothing is implemented yet: no `--color-muted` token or `isNowActive` helper in `packages/client/src`, `DateBar.tsx` sets no `disabled`, and no archived change covers it.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ Date bar; Date bar on every page state; Reference moment | ✅ 2.1, 2.2, 3.2 |
| FR2 | ✅ | ✅ Return to now "An inactive Now changes nothing" | ✅ 2.1, 3.2, 4.2 |
| FR3 | ✅ | ✅ Return to now; time-selection and locations modified scenarios | ✅ 2.1, 3.2, 4.1 |
| FR4 | ✅ | ✅ Date bar layout "An inactive Now is grey" | ✅ 1.2, 2.2, 4.2 |
| NFR-A1 | ✅ | ✅ Accessible date selection "Now is named in both modes", axe rows | ✅ 4.2, 4.3 |
| NFR-A2 | ✅ | ✅ Keyboard-operable date selection "Tab skips an inactive Now" | ✅ 4.2, 4.3 |
| NFR-A3 | ✅ | ✅ Date bar layout (4.5:1 label on fill) | ✅ 1.1, 1.2 |
| NFR-R1 | ✅ | ✅ Date bar layout "Now keeps its place", "No horizontal scrolling" | ✅ 4.2, 4.3 |
| NFR-R2 | ✅ | ✅ Date bar layout (live screenshots show the inactive Now) | ✅ 4.4 |
| UX1 | ✅ | ✅ Date bar layout "An inactive Now is grey" | ✅ 4.2 |
| UX2 | ✅ | ✅ Date bar layout "Now keeps its place" | ✅ 4.2 |
| M1 | ✅ | n/a | ✅ 4.2 |
| M2 | ✅ | n/a | ✅ 1.1 |
| M3 | ✅ | n/a | ✅ 4.2 |
| M4 | ✅ | n/a | ✅ 4.3 |
| M5 | ✅ | n/a | ✅ 2.1, 3.2, 4.2 |
| M6 | ✅ | n/a | ✅ 4.5 |
| M7 | ✅ | n/a | ✅ 5.1 |
| G1 | ✅ | n/a met by FR1 | n/a met by FR1, M3 |
| G2 | ✅ | n/a met by FR4 | n/a met by FR4, M1 |
| NG1 | ✅ | n/a | n/a `handleReturnToNow` stays as is (task 2.2) |
| NG2 | ✅ | n/a | n/a no task touches other controls, calendar, gap note or announcement |
| NG3 | ✅ | n/a | n/a no task edits `model/`, `presenter/` or the controller |
| NG4 | ✅ | n/a | n/a no new i18n key or hint |
| NG5 | ✅ | n/a | n/a no task touches `docs/design/screens/` |

## Consistency

None.

## Findings

### R1 — SUGGESTION — FR2's "nothing is announced" has no assertion
- Location: `openspec/changes/keep-now-button-visible-when-live/proposal.md:67`
- Rule: `.claude/rules/test-planning.md`
- Problem: FR2 says activating an inactive Now changes nothing: "the moment stays live and nothing is announced", and the delta "Return to now" repeats "nothing is announced" (`specs/date-selection/spec.md:36`). Its scenario "An inactive Now changes nothing" (`specs/date-selection/spec.md:49-57`) and the tests planned for it (tasks 2.1, 3.2, 4.2) check only the live mode, the shown date and the row. None of them reads the polite live region. `returnToNow` goes through `dispatchAndAnnounce` (`controller/useReferenceMoment.ts:106`), so a Now that is not really disabled would announce the date.
- Impact: one clause of FR2 stays untested. With native `disabled` (design D1) the clause holds anyway, so the risk is only a later regression slipping through unseen.
- Fix: in task 2.1's new test "should keep the moment live when the inactive Now is clicked", also expect the `[aria-live="polite"]` region of the bar to stay empty. The announcement starts as `""` (`useReferenceMoment.ts:65`). Add `- **AND** nothing is announced` to the delta scenario "An inactive Now changes nothing".
- Fix risk: low. If the Gherkin line is added, task 3.2 needs a matching unit step that reads the live region of `barElement()` in jsdom. That step goes into `referenceMomentStepHelpers.ts` (42 lines) so `date_selection_reference_moment.steps.tsx` (186 lines) stays under 200.
- Status: open

## Verdict

Ready to implement. No blocking findings. R1 is optional polish.
