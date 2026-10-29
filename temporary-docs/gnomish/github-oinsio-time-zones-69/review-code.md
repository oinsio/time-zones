# Review: match-home-mark-to-design

## Summary

| Item | Value |
|---|---|
| Tasks verified | 10/10 |
| Requirements traced | 19/19 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 — `packages/client/src/views/shared/LocationMarkIcon.test.tsx:2` carries `// Verifies FR1, FR2, FR3, FR4, NFR-A1, UX2 of match-home-mark-to-design`. Lines 29–43 assert `aria-hidden="true"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linejoin="round"`, `viewBox="0 0 24 24"`, width/height `LOCATION_MARK_ICON_SIZE_PX`, exactly 1 `path` with `d="M4 11l8-7 8 7v9H4z"`, and 0 `circle, rect, line, polyline, polygon, ellipse`. The weak `not.toHaveAttribute("fill", "currentColor")` and the `lucide-house` class assertion are gone. The Here-mark `fill="currentColor"` test is kept.
- ✅ 1.2 — `packages/client/src/views/shared/LocationMarkIcon.tsx:10-20` defines `FILLED_ICON_FILL`, `OUTLINE_ICON_FILL`, the module-private `HOME_MARK_HOUSE_ICON_NODE` with a comment naming `docs/design/screens/phone-light.html`, and `HomeMarkHouse = createLucideIcon(...)`. Line 40 points `LocationMarkKind.HOME` at `HomeMarkHouse`. The `House` import is removed (lines 1–6). Line 66 passes `fill={isFilled ? FILLED_ICON_FILL : OUTLINE_ICON_FILL}`. JSDoc at lines 33 and 52 says `Implements FR1, FR2, FR3, FR4 of match-home-mark-to-design`. The file is 70 lines. (The icon node has no `key`, unlike design D1; see R1.)
- ✅ 2.1 — `packages/client/src/test/features/locations/locations_home_mark_unit.feature:21-28` holds the scenario with `@match-home-mark-to-design @FR1 @FR2 @FR4 @M3`. `steps/locations_home_mark_unit.steps.tsx:68-104` implements it with the tag comment and reuses `givenDeviceZone`/`givenList`/`givenHome`/`openApp`/`rowOf`. It asserts `fill="none"`, 1 path whose `d` ends in `z`, no other shapes, and the arrow `fill="currentColor"`. The header is at line 2, and the file is 105 lines.
- ✅ 3.1 — `packages/client/src/test/features/home_location/home_location_mark_e2e.feature` holds the outline with `@match-home-mark-to-design @FR1 @FR3 @UX1 @UX2 @M2` for the light and dark themes. `steps/home_location_mark_e2e.steps.ts:20-42` asserts `toHaveCSS("fill", "none")`, `toHaveCSS("stroke", await readTokenStyle(page, "stroke", "--color-accent"))` and an 18 × 18 `boundingBox()` against `LOCATION_MARK_ICON_SIZE_PX`. The reused `Given` steps exist (`locations_view_a11y_e2e.steps.ts:18`, `home_location_e2e.steps.ts:23`, `locations_ui_e2e.steps.ts:23`).
- ✅ 3.2 — `packages/client/src/test/features/home_location/home_location_e2e.feature:24` ("Setting home is announced") and `:64` (the outline "Accessibility in the <state> state in the <theme> theme") carry `@match-home-mark-to-design @NFR-A1`.
- ✅ 3.3 — The branch diff rewrites exactly 16 PNG baselines: `home` and `travelling` × 375/1024 × light/dark × `chromium`/`mobile-chrome`. `chromium/Screenshot-of-the-home-state-at-375-px-in-the-light-theme.png` shows a thin blue house outline before "Almaty". `packages/client/src/test/features/locations/locations_ui_e2e.feature:119` carries `@match-home-mark-to-design @NFR-R1 @M4`.
- ✅ 4.1 — Every id FR1–FR4, NFR-A1, NFR-R1, UX1 and UX2 appears next to `match-home-mark-to-design` in test files. FR1–FR4, NFR-A1 and UX2 are in `LocationMarkIcon.test.tsx:2`. FR1, FR3, UX1 and UX2 are in `home_location_mark_e2e.feature:6`. NFR-A1 is in `home_location_e2e.feature:24`, and NFR-R1 in `locations_ui_e2e.feature:119`.
- ✅ 4.2 — Stryker on `src/views/shared/LocationMarkIcon.tsx` scored 100% in this review (see Mutation).
- ✅ 4.3 — `grep -rnw "House" src/views --include='*.tsx' | grep -v test` prints nothing.
- ✅ 4.4 — CI is green for this branch (stage precondition). `npx vitest run src/views/shared/LocationMarkIcon.test.tsx` passes 5/5 in this review.

## Requirements

- ✅ FR1 — `LocationMarkIcon.tsx:11,66` passes `fill="none"` to outline kinds. Unit coverage: `LocationMarkIcon.test.tsx:31` and the unit BDD house step (`locations_home_mark_unit.steps.tsx:84`). Real-browser computed fill per theme: `home_location_mark_e2e.steps.ts:26`.
- ✅ FR2 — `LocationMarkIcon.tsx:14-16` uses the design path `M4 11l8-7 8 7v9H4z`. Covered by `LocationMarkIcon.test.tsx:38-43` (1 path, exact `d`, no other shapes) and the unit BDD step (`d` closed with `z`, no other shapes).
- ✅ FR3 — The lucide defaults (`stroke="currentColor"`, width 2, round joins, 24-unit `viewBox`) are asserted at `LocationMarkIcon.test.tsx:32-35`. The wrapper's `text-accent` is asserted at `:28`. The computed stroke equals the resolved `--color-accent` per theme at `home_location_mark_e2e.steps.ts:27-30`.
- ✅ FR4 — `LocationMarkIcon.tsx:39` is unchanged (`Navigation`, `isFilled: true`). Covered by the Here-mark `fill="currentColor"` test in `LocationMarkIcon.test.tsx` and the unit BDD "arrow … is filled" step (`locations_home_mark_unit.steps.tsx:94-102`).
- ✅ NFR-A1 — The wrapper `role="img"` with `aria-label` and the `aria-hidden` svg are at `LocationMarkIcon.tsx:59-64`, asserted at `LocationMarkIcon.test.tsx:26,30`. axe-core runs in the home/travelling × light/dark outline, tagged at `home_location_e2e.feature:64`.
- ✅ NFR-R1 — The 16 `home`/`travelling` baselines are re-approved and show the outline. The screenshot outline is tagged at `locations_ui_e2e.feature:119`.
- ✅ UX1 — Fill `none` plus an accent stroke are checked in the real browser in both themes (`home_location_mark_e2e.steps.ts:20-31`), and the baselines show a thin outline.
- ✅ UX2 — `size={LOCATION_MARK_ICON_SIZE_PX}` at `LocationMarkIcon.tsx:65`. Width/height 18 is asserted at `LocationMarkIcon.test.tsx:36-37`, and the real bounding box at `home_location_mark_e2e.steps.ts:34-42`.
- ✅ M1 — Every listed id has a test tagged or commented with `match-home-mark-to-design` (see task 4.1).
- ✅ M2 — The E2E outline runs 2 theme examples, each checking computed `fill: none` and `stroke` equal to the accent token (`home_location_mark_e2e.feature:7-17`).
- ✅ M3 — 1 drawn shape and 0 fills: `LocationMarkIcon.test.tsx:31,38-43`. The Here mark is filled with `currentColor`: the existing Here-mark test and the unit BDD arrow step.
- ✅ M4 — Exactly 16 baselines changed, all `*home-state*`/`*travelling-state*`. CI is green without `--update-snapshots`.
- ✅ M5 — Mutation score of `LocationMarkIcon.tsx` is 100% (14/14 killed), measured in this review.
- ✅ Scenario: Only the home row shows the home mark — covered by the existing `home_location/home_location_reference_unit.feature:48` scenario, unchanged by this change.
- ✅ Scenario: The house is the design's outline — `locations_home_mark_unit.feature:22` ("The home mark is the design's outlined house") plus `LocationMarkIcon.test.tsx:38-43`.
- ✅ Scenario: Outlined in the accent colour in the light theme — `home_location_mark_e2e.feature`, example `light`.
- ✅ Scenario: Outlined in the accent colour in the dark theme — `home_location_mark_e2e.feature`, example `dark`.
- ✅ Scenario: The Here mark stays filled next to the house — `locations_home_mark_unit.feature:22-28` (house outline plus the Moscow arrow filled). The "here" caption is covered by the existing `home_location_reference_unit.feature:65` "Travelling" scenario.
- ✅ Scenario: The mark keeps its name — `LocationMarkIcon.test.tsx:26,30` (image named "Home location", svg `aria-hidden="true"`) and the `@NFR-A1` "Setting home is announced" E2E scenario.

## Mutation

- `packages/client/src/views/shared/LocationMarkIcon.tsx` — 100.00% (14 killed, 0 survived, 0 no coverage). Measured with `cd packages/client && npx stryker run --mutate 'src/views/shared/LocationMarkIcon.tsx'`.

This is the only production file the branch changed.

## Findings

### R1 — WARNING — House icon node has no React key, so every render logs a key warning
- Location: `packages/client/src/views/shared/LocationMarkIcon.tsx:15`
- Rule: design D1 of `openspec/changes/match-home-mark-to-design/design.md` (specifies `["path", { d: "M4 11l8-7 8 7v9H4z", key: "home-mark-house" }]`)
- Problem: `HOME_MARK_HOUSE_ICON_NODE` is `[["path", { d: "M4 11l8-7 8 7v9H4z" }]]` and has no `key`. lucide-react 0.577.0's `Icon` (`node_modules/lucide-react/dist/esm/Icon.js`) renders children as an array: `[...iconNode.map(([tag, attrs]) => createElement(tag, attrs)), ...]`. So React needs a `key` on each node. Every built-in lucide node has one; `Navigation`'s polygon, for example, has `key: "1ltx0t"`. The design's D1 code includes `key: "home-mark-house"`, but the implementation dropped it.
- Impact: Every render of a home mark logs `Warning: Each child in a list should have a unique "key" prop. Check the render method of ForwardRef.` I saw this warning when I ran `npx vitest run src/views/shared/LocationMarkIcon.test.tsx`, and it shows up in every dev session and every unit/BDD test that renders a home row. The noise hides real key warnings, and the code departs from the design decision it claims to implement.
- Fix: Change line 15 to `["path", { d: "M4 11l8-7 8 7v9H4z", key: "home-mark-house" }]`, as design D1 shows.
- Fix risk: none. React takes `key` out of the props and never renders it as a DOM attribute, so the `d`/path-count assertions in `LocationMarkIcon.test.tsx` and the unit BDD step, and the screenshots, are unaffected.
- Status: fixed
- Resolution: added `key: "home-mark-house"` to the house icon node as design D1 shows; the React key warning no longer appears in LocationMarkIcon.test.tsx output.

### R2 — SUGGESTION — Outline-fill constants lack the D2 explanation, and the stale "(house, once home exists)" comment remains
- Location: `packages/client/src/views/shared/LocationMarkIcon.tsx:10-11,24`
- Rule: design D2 of `openspec/changes/match-home-mark-to-design/design.md` ("with a JSDoc saying that `undefined` would drop lucide's default and paint the shape black … Its JSDoc comment "(house, once home exists)" is corrected to "(house)"")
- Problem: `FILLED_ICON_FILL` and `OUTLINE_ICON_FILL` have no JSDoc. Nothing in the source explains why the outline kinds pass an explicit `"none"`, which is the root cause this change fixes. Line 24 still reads "outline glyph (house, once home exists)", although home now exists.
- Impact: Low. A maintainer who "simplifies" `OUTLINE_ICON_FILL` back to `undefined` gets no warning from the source, and only the tests catch the regression. The stale comment wrongly says home is a future feature.
- Fix: Add `/** Outline kinds pass "none" explicitly: undefined would drop lucide's default fill and the browser would paint the glyph black. */` above `OUTLINE_ICON_FILL`, and change line 24 to `Filled glyph (arrow) or outline glyph (house).`
- Fix risk: none (comments only; the file stays well under 100 lines).
- Status: fixed
- Resolution: added the JSDoc on OUTLINE_ICON_FILL explaining why "none" is explicit and corrected the stale "(house)" comment; comment-only, LocationMarkIcon.test.tsx stays green.

## Verdict

Ready. There is no CRITICAL finding, and every task, requirement and scenario is implemented and tested. R1 (WARNING) should be fixed: it is a one-line change that removes a React key warning. R2 is optional.
