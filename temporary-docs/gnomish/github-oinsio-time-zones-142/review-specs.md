# Specs review: colour-locations-without-day-periods-in-accent

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 17/17 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 1 |

## Freshness

- ✅ `design.md:114` — `presentDayColourStops` returns one `{ fraction: 0, colour: DayColour.NO_DAY_PERIOD }` stop for a track without day periods and `presentHourCellColour` gives `NO_DAY_PERIOD` for a cell without a period: `packages/client/src/presenter/dayColours.ts:44-51` (`NO_DAY_PERIOD_STOPS`, `periodColour`) and `:84` (`if (periodStops === undefined) return NO_DAY_PERIOD_STOPS;`).
- ✅ `design.md:115` — `DAY_COLOUR_VARIABLES[DayColour.NO_DAY_PERIOD] = "--color-day-non-working"` and `DAY_COLOUR_FOREGROUND_CLASS_NAMES[DayColour.NO_DAY_PERIOD] = "text-foreground"`, with `PLAIN`/`WORKING_TIME` on `--color-accent`/`text-accent-foreground`: `packages/client/src/views/shared/dayTrackGradient.ts:10-35`. The JSDoc "`NO_DAY_PERIOD` is the non-working grey" is at `:8`.
- ✅ `proposal.md:14`, `design.md:116` — `--color-accent` `#2f5bd3` light / `#5ec2e8` dark and `--color-accent-foreground` `#ffffff` / `#0b1220`: `packages/client/src/styles/tokens.css:16-17,43-44,70-71`.
- ✅ `design.md:116` — `tokens.test.ts` already checks 4.5:1 digits and 3:1 handle over `DAY_COLOUR_TOKENS`, which has rows "plain" and "working time" on `accent`/`accent-foreground` and no "no day period" row: `packages/client/src/styles/tokens.test.ts:111-150`.
- ✅ `design.md:130`, tasks 2.2 — the `DayColour` doc comment says "`NO_DAY_PERIOD` is the neutral colour of a location without day periods": `packages/client/src/presenter/dayColours.ts:20`.
- ✅ `design.md:134` — the hour frame is `ACCENT` in Time of day and decided by `getHourFrameColour` from the colouring alone; the stable `grid-view` requirement "Hour frame" says so at `openspec/specs/grid-view/spec.md:124`.
- ✅ `proposal.md:15`, task 1.1 — glossary entry **Day colour** reads "`DayColour.NO_DAY_PERIOD` (the non-working grey of a location without day periods)": `docs/glossary/time-selection.md:38`.
- ✅ `proposal.md:16`, task 1.2 — "a location without coordinates (UTC) has no day periods and is coloured grey": `docs/architecture/domain-model.md:121`.
- ✅ `specs/day-colouring/spec.md` MODIFIED "Locations without day periods" — exists in `openspec/specs/day-colouring/spec.md:225-253` with the grey wording and the scenarios "UTC in the Time of day colouring", "UTC in the other colourings", "A location gains coordinates", "Readable digits on the grey" that the delta restates; `grid-view` (`spec.md:62`) and `time-selection` (`spec.md:1020`) only delegate to it, so no other stable requirement names the grey for such a location.
- ✅ `proposal.md:3` — no other active change touches `day-colouring`: the only other active change, `apply-data-updates-silently`, has deltas for `app-delivery`, `app-shell`, `settings`, `zone-rules-updates` only. Nothing is already implemented (`dayTrackGradient.ts:18,34` still map to the grey).
- ✅ Tasks 3.1/3.2 — "Then every cell of UTC is the non-working grey" (`src/test/features/day_colouring/day_colouring_hour_cells.feature:46`), "0 neutral" (`day_colouring_day_tracks.feature:96`) and the label `neutral` (`steps/dayColouringChecks.ts:16`) exist; "neutral" occurs nowhere else under `src/test/features/day_colouring`, so the 3.2 grep can print nothing.
- ✅ Tasks 4.1–4.3 — the steps "the view mode is Cards" (`steps/day_colouring_e2e.steps.ts:36`), the track gradient step with `(accent colour|non-working grey)` (`:58`), the "every cell … non-working grey with digits …" step at line 77, `colourOf(theme, colourName)` (`:28-33`) and the column step "the cell of … in column N has the … accent colour and the cell in column M the … non-working grey" (`:39`) exist; the E2E device zone is `Asia/Almaty` (`playwright.bdd.config.ts:69,125`), and `cellOf` indexes cells from column 0 = 00:00 of the reference day (`grid_view/steps/hourGridE2eHelpers.ts:20`, as in the Almaty scenario "column 10 accent, column 8 grey" of `day_colouring_e2e.feature:13`), so column 15 is 10:00 UTC and column 13 is 08:00 UTC on Monday 2026-03-09.
- ✅ Approved screenshots (`openspec/specs/day-colouring/spec.md:184-204`) list Almaty, Moscow, Kolkata and New York only, no UTC, so the change needs no re-approval.
- ❌ Task 2.4 (`tasks.md:15`) — "`src/views/grid/HourCellView.tsx` has no test today". It has no file of its own, but its day colour and digit class are already tested through `HourStrip`: `packages/client/src/views/grid/HourStrip.test.tsx:124-138` asserts `var(--color-accent)` + `text-accent-foreground` for `PLAIN` and `var(--color-day-non-working)` + `text-foreground` for `NON_WORKING_TIME` on rendered cells. See R1.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ scenarios "UTC in the Time of day colouring", "UTC track in the accent in a real browser" | ✅ 2.1, 2.2, 3.2, 4.1 |
| FR2 | ✅ | ✅ scenarios "UTC in the Time of day colouring", "Readable digits on the accent" | ✅ 2.1, 2.2, 2.4, 3.1, 4.2 |
| FR3 | ✅ | ✅ scenarios "UTC in the other colourings", "A location gains coordinates", "Readable digits on the grey" | ✅ 3.2, 4.3 |
| NFR-P1 | ✅ | ✅ unchanged stable requirement "Day periods are fast" (`openspec/specs/day-colouring/spec.md:255`) | ✅ 5.1 runs `day_colouring_budget.feature` (noted in 5.2) |
| NFR-A1 | ✅ | ✅ scenario "Readable digits on the accent" | ✅ 2.3, 4.2 |
| UX1 | ✅ | ✅ SHALL text "The accent is the same colour as a plain track" | ✅ 2.1, 4.1, 4.2 |
| M1 | ✅ | n/a | ✅ 4.2, 4.4 |
| M2 | ✅ | n/a | ✅ 4.1, 4.4 |
| M3 | ✅ | n/a | ✅ 2.3, 4.2, 4.4 |
| M4 | ✅ | n/a | ✅ 2.2 grep, 2.5 Stryker |
| G1 | ✅ | n/a — met by FR1, FR2, UX1 | n/a — met by FR1, FR2, UX1 |
| G2 | ✅ | n/a — met by M4 and design D1 | n/a — met by M4 |
| NG1 | ✅ | n/a | n/a — no artifact touches day periods or coordinates |
| NG2 | ✅ | n/a | n/a — no task touches the hour frame (D2) |
| NG3 | ✅ | n/a | n/a — the grey token and the Plain/Working hours maps stay; 4.3 only re-tests them |
| NG4 | ✅ | n/a | n/a — no task adds a token or a setting |
| Q1 | ✅ | n/a | n/a — deliberately left open (`design.md` D2, Alternatives) |

## Consistency

None.

## Findings

### R1 — SUGGESTION — Task 2.4 creates a new test file for coverage that HourStrip.test.tsx already holds
- Location: `openspec/changes/colour-locations-without-day-periods-in-accent/tasks.md:15` (and the file list of task 5.2 at `tasks.md:33`)
- Rule: `.claude/rules/process-invariants.md` ("One file = one thing"); `CLAUDE.md` ("Read existing code, tests, and patterns before generating new code")
- Problem: Task 2.4 says `HourCellView.tsx` "has no test today" and asks for a new `src/views/grid/HourCellView.test.tsx` with a `NO_DAY_PERIOD` case and a `NON_WORKING_TIME` case. The cell colour and digit class of `HourCellView` are already tested through the strip in `packages/client/src/views/grid/HourStrip.test.tsx:124-138` ("should colour a plain cell with the accent …", "should colour a non-working cell grey with foreground digits"), and its `NON_WORKING_TIME` case is exactly the second case 2.4 asks for.
- Impact: The implementer adds a second test file that repeats an existing assertion verbatim and splits the cell-colour tests of Grid over two files, so a later change of the cell colour must find and edit both.
- Fix: Rewrite task 2.4 as: "Grid cell rendering (FR2): in `src/views/grid/HourStrip.test.tsx`, next to the plain and non-working cases, add `it(\"should colour a cell without a day period with the accent and its digits with the accent foreground\")` rendering `stripOf(DayColour.NO_DAY_PERIOD)` and asserting `cellOf(3).style.backgroundColor` is `var(--color-accent)` and `cellOf(3)` has the class `text-accent-foreground`; add the `// Verifies FR2 of colour-locations-without-day-periods-in-accent.` comment. Verify: `npx vitest run src/views/grid/HourStrip.test.tsx` passes." In task 5.2 replace `views/grid/HourCellView.test.tsx` by `views/grid/HourStrip.test.tsx`.
- Fix risk: none — `HourStrip.test.tsx` is 148 lines, so one more case keeps it under 200; it is a jsdom unit test like the cases next to it, and the M4/FR2 coverage stays the same.
- Status: open

## Verdict

Ready to implement. No blocking findings; R1 is an optional SUGGESTION.
