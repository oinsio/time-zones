# Specs review: match-home-mark-to-design

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 18/20 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 0 |

## Freshness

- ✅ `proposal.md` Why: the design's house is `fill: none; stroke: #2f5bd3; stroke-width: 2; stroke-linejoin: round`, path `M4 11l8-7 8 7v9H4z` — `docs/design/screens/phone-light.html:112-120`; `phone-dark.html:112-120` has stroke `#5ec2e8`; `phone-travel.html:117-119` and `tablet-light.html:120-122` use the same path.
- ✅ The approved light `home` screenshot shows a solid dark house — `packages/client/src/test/features/__screenshots__/chromium/Screenshot-of-the-home-state-at-375-px-in-the-light-theme.png` (filled black house before "Almaty"), while `docs/design/screens/phone-light.png` shows a thin blue outline.
- ✅ The defect's cause: `fill={isFilled ? "currentColor" : undefined}` and `{ Icon: House, isFilled: false }` — `packages/client/src/views/shared/LocationMarkIcon.tsx:22,48`; the JSDoc "(house, once home exists)" is at line 7.
- ✅ The weak test "should draw the home mark as an outlined house in the accent color" asserts `toHaveClass("lucide-house")` and `not.toHaveAttribute("fill", "currentColor")` — `views/shared/LocationMarkIcon.test.tsx:22-31`; the Here-mark test asserting `fill="currentColor"` exists at lines 41-48.
- ✅ Stable requirement "Home mark" reads "a house icon outlined in the accent colour, the size of the Here mark icon, with the accessible label … and no caption. No other row MAY show it", with the one scenario "Only the home row shows the home mark" — `openspec/specs/home-location/spec.md:89-96`; the MODIFIED block restates all of it.
- ✅ `lucide-react` 0.577.0 is the installed version — `packages/client/package.json:37`, `pnpm-lock.yaml:2977`.
- ✅ Accent tokens `#2f5bd3` / `#5ec2e8` — `packages/client/src/styles/tokens.css:10,29`.
- ✅ `LOCATION_MARK_ICON_SIZE_PX = 18` exported from `@/constants` — `src/constants/locations.ts:12`; `@/` imports in E2E steps exist — `locations/steps/locations_reorder_legacy_touch_e2e.steps.ts:3`.
- ✅ `views/shared/index.ts:4` exports only `LocationMarkIcon`, so a module-private `HomeMarkHouse` needs no index change.
- ✅ `getLocationMarkKind` / `LocationMarkKind` in `model/locationMark.ts:8,20`, `presentLocationMarks` in `presenter/locationMark.ts:38`.
- ✅ E2E helpers exist: `readTokenStyle(page, cssProperty, tokenVariable)` — `test/features/time_selection/steps/timeSelectionE2eHelpers.ts:55`; `listRow` — `locations/steps/locationsE2eHelpers.ts:64`; `test` fixture — `locations/steps/locations_ui_e2e.fixtures` (used by `home_location_e2e.steps.ts:3`).
- ✅ Reused Given/When steps exist: `^the locations screen uses the (light|dark) theme$` — `locations_view_a11y_e2e.steps.ts:18`; `^the list holds (.+) and home is "([^"]+)"$` — `home_location_e2e.steps.ts:23`; "the user opens the locations app" — `locations_ui_e2e.steps.ts:23`.
- ✅ The new steps file name `home_location_mark_e2e.steps.ts` matches the BDD config glob `src/test/features/**/steps/*_e2e.{steps,fixtures}.ts` — `packages/client/playwright.bdd.config.ts:12-17`.
- ✅ The a11y outline "Accessibility in the <state> state in the <theme> theme" covers home/travelling × light/dark, and "Setting home is announced" asserts the mark named "Home location" — `test/features/home_location/home_location_e2e.feature:23-30,62-76`.
- ✅ The screenshot outline holds the 8 `home` / `travelling` rows — `locations/locations_ui_e2e.feature:119,157-164`; the 16 baselines exist (8 under `__screenshots__/chromium/`, 8 under `mobile-chrome/`).
- ✅ Unit BDD world exposes `givenDeviceZone`, `givenList`, `givenHome`, `openApp`, `rowOf` — `locations/steps/deviceTimeZoneWorld.tsx:56-116`; `locations_home_mark_unit.steps.tsx` is 66 lines; locale keys `homeMarkLabel` / `hereMarkLabel` — `src/locales/en.json:31,34`.
- ✅ The glossary has no Home mark entry yet; it is pending as patch H1 of the archived change — `openspec/changes/archive/2026/10/2026-10-29-set-home-location-and-show-differences/handoff/H1-glossary-home-location.patch:21`.
- ✅ No other source names `House` or `lucide-house` — only `views/shared/LocationMarkIcon.tsx:1,22`, so task 4.3's grep can pass after the change.
- ❌ `tasks.md:64-65`, `design.md:52,57` and `proposal.md:118` assume that one `--update-snapshots` run rewrites the 16 `home`/`travelling` baselines and that the screenshot test catches a painted house. Reality: Playwright is 1.63.0 (`pnpm-lock.yaml:1423`), where a bare `--update-snapshots` means mode `changed` and rewrites only baselines that fail the comparison. The config allows `maxDiffPixelRatio: 0.025` (`packages/client/playwright.bdd.config.ts:32,76`). An 18 × 18 px icon is far below 2.5% of a 375 × 800 px or 1024 px wide page, so the old baselines (solid house) pass and are not rewritten.

## Coverage

| Requirement id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ "The house is the design's outline", light/dark scenarios | ✅ 1.1, 1.2, 2.1, 3.1 |
| FR2 | ✅ | ✅ "The house is the design's outline" | ✅ 1.1, 1.2, 2.1 |
| FR3 | ✅ | ✅ light/dark scenarios | ✅ 1.1, 1.2, 3.1 |
| FR4 | ✅ | ✅ "The Here mark stays filled next to the house" | ✅ 1.1, 2.1 |
| NFR-A1 | ✅ | ✅ "The mark keeps its name" | ✅ 1.1, 3.2 |
| NFR-R1 | ✅ | ✅ requirement text "in the light and in the dark theme" + light/dark scenarios | ❌ 3.3 does not re-approve the baselines (R1) |
| UX1 | ✅ | ✅ light/dark scenarios | ✅ 3.1 |
| UX2 | ✅ | ✅ "it is 18 × 18 px" | ✅ 1.1, 3.1 |
| M1 | ✅ | n/a | ✅ 4.1 |
| M2 | ✅ | n/a | ✅ 3.1 |
| M3 | ✅ | n/a | ✅ 1.1, 2.1 |
| M4 | ✅ | n/a | ❌ 3.3 accepts 0 rewritten baselines (R1) |
| M5 | ✅ | n/a | ✅ 4.2 |
| G1 | ✅ | n/a — met by FR1–FR3 | n/a — met by FR1–FR3 |
| G2 | ✅ | n/a — met by M2, M3 | n/a — met by M2, M3 |
| NG1 | ✅ | n/a | n/a — no artifact changes the Here mark (D2 keeps `Navigation`, `isFilled: true`) |
| NG2 | ✅ | n/a | n/a — the label stays «Домашнее место» / "Home location"; no locale task |
| NG3 | ✅ | n/a | n/a — only `LocationMarkIcon.tsx` changes |
| NG4 | ✅ | n/a | n/a — no model, presenter or storage task |
| NG5 | ✅ | n/a | n/a — only the shared row icon changes |

## Consistency

None.

## Findings

### R1 — WARNING — `--update-snapshots` will not re-approve the 16 baselines, so the old solid-house screenshots stay approved
- Location: `openspec/changes/match-home-mark-to-design/tasks.md:64-65`; also `design.md:52,57`, `proposal.md:76,118`
- Rule: `.claude/rules/test-planning.md` ("Visual regression tests — catch unintended visual changes"); `.gnomish/stages/specify/handoff.md` (every checkbox task must be verifiable by the implement stage)
- Problem: Task 3.3 re-approves the baselines with `pnpm test:bdd --grep "Screenshot of the (home|travelling) state" --update-snapshots`. It then accepts "at most 16" changed files. The installed Playwright is 1.63.0 (`pnpm-lock.yaml:1423`). In that version a bare `--update-snapshots` means mode `changed`: only baselines that fail the comparison are rewritten. The config allows `maxDiffPixelRatio: 0.025` (`packages/client/playwright.bdd.config.ts:32,76`). Going from a solid house to an outlined one changes at most the 18 × 18 px icon area, far below 2.5% of the page. Every current baseline therefore still passes, none is rewritten, and "at most 16" passes with 0 files changed. For the same reason, `design.md:57` is wrong to say that a painted house "fails three test levels": the screenshot level cannot detect it. `design.md:52` also says unchanged other baselines prove "the Here mark … untouched", which the same threshold makes too weak to prove.
- Impact: Implemented as written, the change ships with all 16 approved `home`/`travelling` baselines still showing the black house that the task asks to remove. NFR-R1 ("show the outlined house and are re-approved") and M4 ("16 of 16 … re-approved") are reported done but are not met. The paint is still guarded by the E2E computed-style check (task 3.1) and the unit tests, so the risk is stale, misleading baselines, not a broken mark.
- Fix: In `tasks.md` 3.3, change the command to `pnpm test:bdd --grep "Screenshot of the (home|travelling) state" --update-snapshots=all`. Change the check to "`git status --short src/test/features/__screenshots__` lists exactly 16 files, all named `*home-state*` or `*travelling-state*`". In `design.md` D3 "Visual regression", add one sentence: the 2.5% `maxDiffPixelRatio` is too loose to detect the icon's fill, so the screenshots record the approved look, and the fill is guarded by the unit and E2E paint checks. Then change the Consequences line from "fails three test levels" to "fails the unit, unit BDD and E2E paint checks". Optionally reword `proposal.md` M4 to "16 of 16 … are rewritten by this change and pass without `--update-snapshots`".
- Fix risk: `--update-snapshots=all` rewrites every baseline matched by the grep. The grep matches only the 8 `home`/`travelling` rows × the `chromium` and `mobile-chrome` projects (the view-contract projects only run `@view-contract`, `playwright.bdd.config.ts:48-59`), so no other baseline is touched. The rewritten files must come from the same Linux environment as the existing baselines. The config comment at lines 26-31 already tolerates cross-OS rendering within the ratio.
- Status: fixed
- Resolution: confirmed Playwright 1.63.0 (`pnpm-lock.yaml:1423`) and `maxDiffPixelRatio: 0.025` (`playwright.bdd.config.ts`). In `tasks.md` 3.3, the command now uses `--update-snapshots=all`, and the check requires exactly 16 changed `*home-state*`/`*travelling-state*` files plus a look at one light and one dark baseline. In `design.md` D3 "Visual regression", the text now says the ratio cannot detect the icon fill, so the paint checks guard it. The Consequences line now reads "fails the unit, unit BDD and E2E paint checks". `proposal.md` M4 now says the 16 baselines are rewritten by this change and show the outlined house.

## Verdict

Needs revision. Blocking: R1 (WARNING). The model, layering, glyph, fill fix and test placement (attributes in jsdom, computed paint and size in a real browser) are sound and match the code, the ADRs and the rules.
