# Specs review: make-location-menu-button-vertical

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 18/23 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 1 |

## Freshness

- ✅ design.md:9 — the trigger renders `<span aria-hidden="true">{LOCATION_MENU_TRIGGER_GLYPH}</span>` (`packages/client/src/views/shared/LocationMenu.tsx:209`), the constant is `"⋯"` (`src/constants/locations.ts:29`), re-exported at `src/constants/index.ts:58`, and nothing else in `src` uses it.
- ✅ design.md:9 — the button classes are `flex min-h-11 min-w-11 items-center justify-center rounded-md text-xl font-bold …` (`LocationMenu.tsx:207`), the root is `className="relative inline-flex"` (`LocationMenu.tsx:185`), and the non-fixed menu is `absolute right-0 top-full mt-1` (`LocationMenu.tsx:218`); Grid passes `isMenuFixedToViewport: true` (`locationRowVariant.ts:127`) and uses `useFixedMenuPosition`.
- ✅ design.md:10 — `TIME_GROUP_CLASS_NAMES` is `"ml-auto flex shrink-0 items-center gap-x-3.5 md:order-4 md:ml-0"` (`src/views/shared/locationRowVariant.ts:68-69`) and both variants use it (`:100`, `:123`).
- ✅ design.md:11 — card side paddings `card-side-small` 13px, `card-side` 15px, `card-side-large` 18px, `card-wide-x` 20px (`tailwind.config.ts:53-57`); `GRID_ROW_PADDING_PX = 16` (`src/constants/grid.ts:24`).
- ✅ design.md:12 — `lucide-react` `^0.577.0` is a dependency (`packages/client/package.json:44`) and `LocationMarkIcon.tsx`, `MeetingBar.tsx`, `CalendarMonthGrid.tsx` import from it.
- ✅ design.md:12, tasks.md:44 — exactly 29 of the 35 HTML files in `docs/design/screens/` contain `data-lucide="ellipsis"`; its circles are at `cy="12"` with `cx` 5 / 12 / 19 (e.g. `cards-phone-light.html:170`), so the upright version at `cx="12"`, `cy` 5 / 12 / 19 is that markup turned.
- ✅ design.md:13, proposal.md:11 — `README.md` and `README.ru.md` show exactly `cards-phone-light`, `cards-phone-dark`, `cards-tablet-light`, `grid-desktop-light`, `grid-desktop-meeting-dark` PNGs; each PNG is the `#screen` element at 2x (`docs/design/README.md:14`; `cards-phone-light.png` is 780×1688 for a 390×844 `#screen`, `grid-desktop-light.png` 2880×1400 for 1440×700, `cards-tablet-light.png` 1640×2360 for 820×1180).
- ✅ design.md:13 — no script renders the design screens today: nothing under `packages/client/scripts/` references `design/screens`.
- ✅ design.md:49, tasks.md:32 — all 29 affected HTML files load `https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap`; the 3 files with the `400;500;600;700` URL are the NG4 pre-redesign screens, which have no location menu button at all; `@fontsource-variable/manrope` is a dependency (`package.json:36`) and `@playwright/test` a dev dependency (`package.json:56`).
- ✅ design.md:51, tasks.md:31 — `src/test/zoneRules/*.test.ts` import their scripts as `../../../scripts/zoneRules/<name>.ts` (e.g. `addZoneRulesPreload.test.ts:3`), and `package.json` already runs scripts as `node scripts/<dir>/<name>.ts`.
- ✅ design.md:59 — `SCREENSHOT_MAX_DIFF_PIXEL_RATIO = 0.025` (`playwright.bdd.config.ts:70`).
- ✅ tasks.md:27, proposal.md:106 — `grep -rl screenshot src/test/features --include=*_e2e.feature` lists 11 features; the only `toHaveScreenshot` step is "the locations screen matches the approved screenshot" (`locations_layout_e2e.steps.ts:65`); baselines live in `__screenshots__/chromium` and `__screenshots__/mobile-chrome`, and "Screenshot-of-Cards-at-375-px-…" baselines exist (H1).
- ✅ tasks.md:9 — the glyph expectations are at `LocationMenu.test.tsx:33` (`toHaveTextContent("⋯")`) and `LocationRow.test.tsx:59` and `:99`.
- ✅ tasks.md:17-18 — `locations_ui_e2e.fixtures.ts` and `locationsCardLayoutHelpers.ts` (`LAYOUT_TOLERANCE_PX = 1`) exist, and the reused steps "the view mode is Grid", "the screen is {int} px wide for the locations", "the user sets the meeting range 09:00–11:00 in Almaty", "the user opens the location menu of {string}" and "the locations screen has no accessibility violations" are defined.
- ✅ tasks.md:23 — every feature named in task 4.1 exists (`locations_card_layout_e2e`, `grid_view_meeting_lock_e2e`, `grid_view_hour_frame_e2e`, `grid_view_redesign_e2e`, `locations_reorder_e2e`, `locations_view_contract_e2e`, `home_location/*_e2e`).
- ✅ tasks.md:5 — `docs/glossary/locations.md:17` names the menu «⋯»; `docs/architecture/views.md:54`, `:71` and `:84` are the only other «⋯» in those files; no README or locale file names the glyph.
- ✅ design.md:36 — `STICKY_BOX_CLASS_NAMES` has width `calc(var(--grid-panel-width)-2*var(--grid-row-padding))` (`locationRowVariant.ts:57-58`).
- ✅ specs/locations/spec.md:3 — the MODIFIED "Location menu" restates the stable requirement (`openspec/specs/locations/spec.md`) word for word apart from the glyph sentence and the added geometry sentences, and keeps all five existing scenarios.
- ✅ proposal.md:35 — `docs/design/README.md:62` marks the three pre-redesign Grid screens as superseded.
- ✅ Not already implemented: no archived change and no code shows vertical dots.
- ❌ design.md:35 — "The Grid menu is unchanged." The fixed menu is right-aligned to the trigger: `useFixedMenuPosition.ts:30-35` sets `right: clientWidth - triggerBox.right`, so with `-mr-3` the Grid menu moves 12 px right as well (R5).

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ "Vertical dots on the button" | ✅ 2.1, 2.2, 3.3 |
| FR2 | ✅ | ✅ "Compact button in Cards / in Grid / next to a meeting time" | ✅ 3.1, 3.2, 3.3 |
| FR3 | ✅ | ✅ overlap, containment, "Long city at 320 px", "Open menu inside the screen" | ✅ 3.3, 4.1 |
| FR4 | ✅ | ❌ no delta scenario; the stable approved-screenshot requirements apply unchanged, so no finding | ✅ 5.1 |
| FR5 | ✅ | ❌ no capability spec governs the design screens; repository artifact checked by 6.1–6.3, so no finding | ✅ 6.1, 6.2, 6.3 |
| FR6 | ✅ | ❌ docs-only; checked by the 1.1 greps, so no finding | ✅ 1.1 |
| NFR-A1 | ✅ | ✅ accessible name and hidden dots in the requirement, "Vertical dots on the button" | ✅ 2.1, 3.3 (axe scenario) |
| NFR-R1 | ✅ | ✅ width tables of the Cards and Grid scenarios | ✅ 3.3 |
| UX1 | ✅ | ❌ no scenario or sentence in the delta (R3) | ✅ 3.3, but only 4 widths and an undefined Grid border (R3, R4) |
| UX2 | ✅ | ❌ not in the delta (R2) | ❌ no task or test (R2) |
| M1 | ✅ | n/a | ✅ 3.3 |
| M2 | ✅ | n/a | ✅ 3.3 |
| M3 | ✅ | n/a | ✅ 3.3 |
| M4 | ✅ | n/a | ✅ 3.3 |
| M5 | ✅ | n/a | ✅ 5.1, 6.3 |
| M6 | ✅ | n/a | ✅ 7.1, 7.2 |
| G1 | ✅ | n/a, met by FR2 and M1 | n/a, met by FR2 and M1 |
| G2 | ✅ | n/a, met by FR3 and M3 | n/a, met by FR3 and M3 |
| G3 | ✅ | n/a, met by FR4, FR5 and M5 | n/a, met by FR4, FR5 and M5 |
| NG1 | ✅ | n/a | n/a, no artifact changes items, keys or lock |
| NG2 | ✅ | n/a | n/a, D2 keeps the 44 × 44 box |
| NG3 | ✅ | n/a | n/a, only the gap and the menu margin change |
| NG4 | ✅ | n/a | n/a, task 6.3 touches only the 29 files with the button |

## Consistency

- tasks.md:16 has the @UX1 scenario measure "the distance to the row's right border", while proposal.md:70 measures to "the right border of the row (card border or Grid panel border)". A Grid row `li` has no right border and is `w-max` (`locationRowVariant.ts:108`) (R4).
- tasks.md:16 runs the @UX1 check at Cards 390/1024 and Grid 390/1440 only, while proposal.md:70 requires it "at every NFR-R1 width" (R3).

## Findings

### R1 — WARNING — Task 4.1 omits existing e2e features that measure the menu button
- Location: `openspec/changes/make-location-menu-button-vertical/tasks.md:23`
- Rule: `.claude/rules/test-planning.md` (the verification section names concrete commands)
- Problem: Task 4.1 re-runs the e2e features that might measure the old geometry. Its list leaves out three features whose steps measure the location menu button box next to the time. (1) `src/test/features/time_selection/time_selection_regressions_e2e.feature` ("the handle of {string} lies inside its card and clear of its time and its menu", 6 widths). (2) `time_selection/time_selection_layout_e2e.feature`, whose step at `time_selection_layout_e2e.steps.ts:62-65` measures `menuButton` against the track. (3) `locations/locations_local_time_e2e.feature`, whose steps at `locations_local_time_e2e.steps.ts:60-86` assert `menuButton.x >= time.x + time.width` and the date-time-menu line. This change removes the 14 px gap and pushes the button 12 px into the padding, which is exactly what these assertions measure. None of these features is a screenshot feature, so task 5.1 does not run them either.
- Impact: The implement stage runs only `pnpm test` (task 7.3), which skips e2e. If one of these assertions breaks (for example the edge-to-edge `>=` check at a sub-pixel position, or the handle that is now 12 px nearer the menu box), nobody sees it until CI after delivery.
- Fix: In task 4.1, add `src/test/features/time_selection/time_selection_regressions_e2e.feature`, `src/test/features/time_selection/time_selection_layout_e2e.feature` and `src/test/features/locations/locations_local_time_e2e.feature` to the list. Keep its rule: run each one at a time, without `--update-snapshots`, and fix any step that measured the old geometry while keeping its intent.
- Fix risk: none. It adds three e2e runs to the implement stage's time and changes no requirement.
- Status: fixed
- Resolution: task 4.1 in tasks.md now also runs time_selection_regressions_e2e.feature, time_selection_layout_e2e.feature and locations_local_time_e2e.feature, one at a time without --update-snapshots, under its existing rule to fix any step that measured the old geometry while keeping its intent.

### R2 — WARNING — UX2 has no scenario and no task
- Location: `openspec/changes/make-location-menu-button-vertical/proposal.md:71`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it"); `.claude/rules/traceability.md`
- Problem: UX2 says the dots are vertically centred on the first line of the row header, are in the foreground colour, and are dimmed with the locked Grid button. The delta requirement (`specs/locations/spec.md:4`) does not state this, and no scenario covers it. No task in `tasks.md` names UX2. Only design D1 (`design.md:25`) argues it, by relying on `currentColor`.
- Impact: The icon could end up with a fixed colour (so the dimming rule and the dark theme are not followed), or off-centre against the time, and every test would still pass. UX2 would also have no implementing artifact, which `traceability.md` "Verification rule" forbids.
- Fix: In `specs/locations/spec.md`, add this sentence to the requirement: "The dots are vertically centred on the line of the time and drawn in the current text colour, so a locked button dims them". Add `UX2 of make-location-menu-button-vertical` to its implements comment. Add to scenario "Vertical dots on the button" the line "**AND** the dots are vertically centred on the line of the time". In task 2.1, add assertion (d): the `svg` has `stroke="currentColor"` (a jsdom attribute check). In task 3.3, tag "Vertical dots on the button" also `@UX2`. Its step asserts that the vertical centre of the `svg` box and of the time box differ by at most a named tolerance constant. The dimming itself stays covered by the existing `grid_view_meeting_lock_e2e.feature` (opacity 0.4 of the locked button, `openspec/specs/grid-view/spec.md:655`).
- Fix risk: The time text's line box and the 44 px button centre can differ by 1–2 px because of font metrics, so a 1 px tolerance could be flaky. Name a tolerance of a few px as a constant in the steps file.
- Status: fixed
- Resolution: specs/locations/spec.md now requires the dots to be vertically centred on the line of the time and drawn in the current text colour, its implements comment lists UX2, and "Vertical dots on the button" gains the centring AND line; tasks.md 2.1 adds assertion (d) `stroke="currentColor"`, and 3.3 tags the scenario @UX2 with a centring step bounded by MAX_DOTS_CENTRE_OFFSET_PX = 3, the dimming staying covered by grid_view_meeting_lock_e2e.feature.

### R3 — WARNING — UX1 has no delta scenario and its check covers only 4 of the 10 NFR-R1 widths
- Location: `openspec/changes/make-location-menu-button-vertical/specs/locations/spec.md:4`; `openspec/changes/make-location-menu-button-vertical/tasks.md:16`
- Rule: `.claude/rules/delta-specs.md`, `.claude/rules/traceability.md` (Gherkin scenario tags)
- Problem: Task 3.3 adds an `@UX1` scenario "Even spacing around the dots" to the feature file. The delta spec has no matching requirement sentence or scenario, and the implements comment at `spec.md:4` lists no UX1. The scenario also runs only Cards at 390 and 1024 and Grid at 390 and 1440. UX1 (`proposal.md:70`) requires the at most 10 px difference "at every NFR-R1 width".
- Impact: When the change is archived, the stable `locations` spec loses the ≤ 10 px spacing rule, and a later change can break it without touching a spec. The 411–767 px card padding (18 px, so a 7 px difference by D2) and the Grid 844/1180 widths are never measured, so UX1 as written is only partly verified.
- Fix: Add to the delta requirement: "Measured from the centre of the dots, the distance to the time's right edge and the distance to the row's right border (card border or Grid panel border) MUST differ by at most 10 px." Add a scenario "Even spacing around the dots" with an Examples table of view and width: Cards at 320, 390, 411, 768, 1024 and 1440, and Grid at 390, 844, 1180 and 1440. Add `UX1` to the implements comment. In task 3.3, run the @UX1 scenario at those same widths.
- Fix risk: Six more e2e examples. By D2's arithmetic the largest difference is 9 px (cards at md+: 10 + 20 + 1 − 22), so every width passes with 1 px to spare. A sub-pixel rounding could make that edge tight, which is already true at 1024 in the current plan.
- Status: fixed
- Resolution: the delta requirement in specs/locations/spec.md now carries the ≤ 10 px spacing rule (implements comment lists UX1) and a new scenario "Even spacing around the dots" with Cards 320/390/411/768/1024/1440 and Grid 390/844/1180/1440; task 3.3 in tasks.md runs that scenario at exactly those widths (@UX1 @NFR-R1).

### R4 — WARNING — Task 3.3 measures UX1 against "the row's right border", which a Grid row does not have
- Location: `openspec/changes/make-location-menu-button-vertical/tasks.md:16`
- Rule: —
- Problem: The @UX1 step measures "the distance to the row's right border". In Grid the row `li` has only `border-t` and is `min-w-full w-max` (`packages/client/src/views/shared/locationRowVariant.ts:115`), so it has no right border. It also extends past the panel wherever the hour strips scroll. UX1 (`proposal.md:70`) measures to the "Grid panel border", the `ul` with `border border-card-border` (`locationRowVariant.ts:107`). Design D2 (`design.md:36`) defines only the "content edge", not this border.
- Impact: An implementer who measures the `li` box in Grid gets the far right end of a scrolling row. The step then fails at 390 px, or gets "fixed" by measuring something else, so the 27 px Grid distance that D2 relies on is never actually checked.
- Fix: In task 3.3, replace "the distance to the row's right border" with "the distance to the right border: in Cards the right edge of the card box minus its computed `border-right-width`, in Grid the right edge of the Grid list (`ul`) box minus its computed `border-right-width`". Add the same definition to the measurement-rules bullet of task 3.3 (`tasks.md:18`).
- Fix risk: none. The definition matches UX1 and the containment box task 3.3 already uses for Grid.
- Status: fixed
- Resolution: the measurement-rules bullet of task 3.3 in tasks.md now defines the right border: the card box minus its computed border-right-width in Cards, and the Grid list (ul) box minus its computed border-right-width in Grid, never the borderless w-max row li; the @UX1 scenario text in 3.3 measures to "the right border" so defined.

### R5 — SUGGESTION — Design says the Grid menu does not move, but it moves 12 px with the button
- Location: `openspec/changes/make-location-menu-button-vertical/design.md:35`
- Rule: —
- Problem: D2 says "The Grid menu is unchanged." `useFixedMenuPosition` right-aligns the fixed menu to the trigger (`packages/client/src/views/shared/useFixedMenuPosition.ts:30-35`, `right: document.documentElement.clientWidth - triggerBox.right`), so the `-mr-3` margin moves the Grid menu 12 px right, just as in Cards.
- Impact: Low. An implementer who trusts the sentence may not expect the Grid menu or the `grid_view_layers_e2e` "open location menu lies above the date bar" screenshot to shift. The "Open menu inside the screen" Grid 390 scenario still guards the containment.
- Fix: Replace the sentence with "The Grid menu is right-aligned to the button by `useFixedMenuPosition`, so it also moves 12 px right; it stays inside the screen because the button stays inside the Grid panel."
- Fix risk: none
- Status: open

## Verdict

Needs revision. No CRITICAL finding blocks the change. Fix the WARNINGs R1, R2, R3 and R4 before implementation: they leave UX1 and UX2 partly or wholly unverified and existing geometry regressions unrun. R5 is optional polish.
