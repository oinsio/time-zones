# Review: colour-locations-without-day-periods-in-accent

## Summary

| Item | Value |
|---|---|
| Tasks verified | 15/15 |
| Requirements traced | 16/16 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 — `docs/glossary/time-selection.md:38` now reads `DayColour.NO_DAY_PERIOD (the accent colour of a location without day periods)`; the "non-working grey of a location without day periods" wording is gone.
- ✅ 1.2 — `docs/architecture/domain-model.md:121` reads "has no day periods and is coloured in the accent colour of the active theme"; "is coloured grey" is gone.
- ✅ 2.1 — `packages/client/src/views/shared/dayTrackGradient.test.ts:36` (`[DayColour.NO_DAY_PERIOD, "--color-accent"]`), `:49` (`[DayColour.NO_DAY_PERIOD, "text-accent-foreground"]`) and `:62-68` ("should write a single no-day-period stop as two accent stops").
- ✅ 2.2 — `packages/client/src/views/shared/dayTrackGradient.ts:19` maps `NO_DAY_PERIOD` to `--color-accent`, `:35` to `text-accent-foreground`, JSDoc `:8-9` updated; `packages/client/src/presenter/dayColours.ts:21` doc comment says "the accent colour of a location without day periods", logic unchanged (`:45-51`, `:85`). No `NO_DAY_PERIOD` line in `dayTrackGradient.ts` names `color-day-non-working`.
- ✅ 2.3 — `packages/client/src/styles/tokens.test.ts:120` adds `["no day period", "accent", "accent-foreground"]` to `DAY_COLOUR_TOKENS`, which feeds the 4.5:1 digit check per theme (`:130-139`) and the handle check (`:142-151`).
- ✅ 2.4 — `packages/client/src/views/grid/HourStrip.test.tsx:132-137` asserts `var(--color-accent)` background and `text-accent-foreground` for a `NO_DAY_PERIOD` cell; `// Verifies FR2 …` at `:1`; no `HourCellView.test.tsx` was created.
- ✅ 2.5 — measured in this review: `dayTrackGradient.ts` scores 100% (see Mutation).
- ✅ 3.1 — `day_colouring_hour_cells.feature:42-46` carries `@colour-locations-without-day-periods-in-accent @FR2` and the step "Then every cell of UTC has no day period"; `steps/day_colouring_hour_cells.steps.ts:179` renamed, still asserting `DayColour.NO_DAY_PERIOD`.
- ✅ 3.2 — `day_colouring_day_tracks.feature:89` (`@FR1`), `:98` (`@FR3`), "0 no-day-period" at `:96`; `steps/dayColouringChecks.ts:16` label `"no-day-period"`; no `neutral` left under `src/test/features/day_colouring`.
- ✅ 4.1 — `day_colouring_e2e.feature:53-66` Scenario Outline "UTC track in the accent in a real browser in the <theme> theme" (`@FR1 @UX1`), light and dark, using the existing track step (`steps/day_colouring_e2e.steps.ts:76-93`).
- ✅ 4.2 — `day_colouring_e2e.feature:68-...` "Readable digits on the accent in the <theme> theme" (`@FR2 @NFR-A1 @UX1`) with the axe step; step regex widened to `(non-working grey|accent colour)` and colour picked through `colourOf` (`steps/day_colouring_e2e.steps.ts:96-113`).
- ✅ 4.3 — `day_colouring_e2e.feature:36-51` now uses "Working hours", the column 15 accent / column 13 grey step (`steps/day_colouring_e2e.steps.ts:57-74`; default working hours 10:00–18:00 per `src/preferences/workingHours.ts:10`), the new digit-contrast step (`steps/day_colouring_e2e.steps.ts:116-122`) and the tags `@colour-locations-without-day-periods-in-accent @FR3`.
- ✅ 4.4 — the e2e scenarios and steps exist and are coherent; the stage brief states CI is green. Not re-run in this review (e2e is out of the review's test budget).
- ✅ 5.1 — CI green per the stage brief; the Stryker dry run in this review executed the full Vitest suite without failure.
- ✅ 5.2 — 14 hits of the change name under `src`, including `dayTrackGradient.ts`, `dayTrackGradient.test.ts`, `HourStrip.test.tsx`, `tokens.test.ts` and the three feature files; tags `@FR1 @FR2 @FR3 @NFR-A1 @UX1` all present in the day colouring feature files; `day_colouring_budget.feature` unchanged.

## Requirements

- ✅ FR1 — `dayTrackGradient.ts:19` maps the single `NO_DAY_PERIOD` stop (presenter `dayColours.ts:45-46,85`) to `--color-accent`; tests `dayTrackGradient.test.ts:36,62-68`, unit BDD `day_colouring_day_tracks.feature:89-96`, e2e `day_colouring_e2e.feature:53-66` in both themes.
- ✅ FR2 — `dayTrackGradient.ts:19,35`; tests `HourStrip.test.tsx:132-137`, `dayTrackGradient.test.ts:49`, unit BDD `day_colouring_hour_cells.feature:42-46`, e2e "Readable digits on the accent" asserting every UTC cell is the theme accent.
- ✅ FR3 — presenter logic untouched; unit BDD "UTC in the other colourings" (`day_colouring_day_tracks.feature:98`, tagged `@FR3`) and "A location gains coordinates" (`:112-113`, unchanged); e2e "Readable digits on the grey" in Working hours (`day_colouring_e2e.feature:36-51`).
- ✅ NFR-P1 — no presenter or model code changed (only the `DayColour` doc comment); `day_colouring_budget.feature` is unchanged and runs in the suite.
- ✅ NFR-A1 — `tokens.test.ts:120` (4.5:1 digits, 3:1 handle, both themes); e2e digit contrast + axe in "Readable digits on the accent" for light and dark.
- ✅ UX1 — the same token `--color-accent` as `PLAIN` (`dayTrackGradient.ts:16,19`); e2e compares to `readThemeColours(theme).accent`, the colour of a plain track.
- ✅ M1 — e2e step `steps/day_colouring_e2e.steps.ts:96-113` asserts every UTC cell's computed background equals the theme accent (hence 0 grey cells), light and dark.
- ✅ M2 — e2e "UTC track in the accent …" asserts accent at 0% and 100% of the gradient in both themes.
- ✅ M3 — `expectDigitContrast` ≥ 4.5:1 on every UTC cell and the axe step, both themes.
- ✅ M4 — `NO_DAY_PERIOD` is mapped only in `dayTrackGradient.ts:19,35`, neither to the grey token; scoped mutation score 100% measured.
- ✅ Scenario: UTC in the Time of day colouring — unit BDD `day_colouring_day_tracks.feature:89-96` (one `no-day-period` stop) and `day_colouring_hour_cells.feature:42-46`; token mapping tested in `dayTrackGradient.test.ts`.
- ✅ Scenario: UTC in the other colourings — `day_colouring_day_tracks.feature:98-…` (Plain, Working hours), tagged `@FR3`.
- ✅ Scenario: A location gains coordinates — `day_colouring_day_tracks.feature:113-…` (existing, unchanged, passes).
- ✅ Scenario: UTC track in the accent in a real browser — `day_colouring_e2e.feature:53-66`, light and dark.
- ✅ Scenario: Readable digits on the accent — `day_colouring_e2e.feature:68-…`, accent fill, 4.5:1 digits, axe, light and dark.
- ✅ Scenario: Readable digits on the grey — `day_colouring_e2e.feature:36-51`, Working hours, column 15 accent / column 13 grey, 4.5:1 on every UTC cell, light and dark.

## Mutation

- `packages/client/src/views/shared/dayTrackGradient.ts` — 100.00% (30 killed, 6 timeout, 0 survived, 0 no coverage), measured with `npx stryker run --mutate 'src/views/shared/dayTrackGradient.ts'`.
- `packages/client/src/presenter/dayColours.ts` — not measured: the branch changed only a doc comment and the JSDoc header there, which yield no mutants.

## Findings

### R1 — SUGGESTION — Two touched step files lack the change's traceability comment
- Location: `packages/client/src/test/features/day_colouring/steps/day_colouring_hour_cells.steps.ts:1`
- Rule: `.claude/rules/traceability.md`; the `tasks.md` preamble of this change ("every touched test file a `// Verifies <ids> of colour-locations-without-day-periods-in-accent.` comment")
- Problem: The branch changed `day_colouring_hour_cells.steps.ts` (step renamed at `:179`) and `steps/dayColouringChecks.ts` (label `no-day-period` at `:16`), but neither file got a `// Verifies … of colour-locations-without-day-periods-in-accent.` header line; their headers name only `add-day-colouring-setting` and `bind-day-periods-to-sun`.
- Impact: `grep -rl colour-locations-without-day-periods-in-accent src` does not reach the step definitions that assert FR2 and FR1, so the requirement-to-test trace the change's own tasks prescribe is incomplete.
- Fix: Add `// Verifies FR2 of colour-locations-without-day-periods-in-accent.` as the first line of `day_colouring_hour_cells.steps.ts`, and `// Implements FR1 of colour-locations-without-day-periods-in-accent: …` (matching its existing `// Implements …` header style) to `dayColouringChecks.ts`.
- Fix risk: none — comment-only lines; no behaviour or test outcome changes.
- Status: open

## Verdict

Ready. No blocking findings; R1 is a low-stakes traceability polish.
