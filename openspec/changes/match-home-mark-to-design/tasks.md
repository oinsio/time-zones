# Tasks

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter`. Run tests one command at a time, never in the background. Mutation runs cover at most 5 files per run, and the report is `reports/mutation/mutation-report.json`. Every new or changed test, step file and feature scenario carries `match-home-mark-to-design` traceability:
- `@match-home-mark-to-design @FR-X` tags above scenarios;
- `// @match-home-mark-to-design @FR-X` before `f.Scenario`;
- `// Verifies NFR-X of match-home-mark-to-design` (or `FR-X`, `UX-X`) in E2E steps;
- `// Verifies FR-X of match-home-mark-to-design` at the top of changed Vitest files;
- `Implements FR-X of match-home-mark-to-design` in the JSDoc of changed production code.

## 1. View: the design's outlined house (TDD, jsdom component test)

- [ ] 1.1 RED. In `views/shared/LocationMarkIcon.test.tsx`, rewrite "should draw the home mark as an outlined house in the accent color" (design D3), using the existing `homeMark` fixture. It asserts:
  - the wrapper has `role="img"`, the name "Home location" and class `text-accent` (NFR-A1);
  - the `svg` has `aria-hidden="true"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linejoin="round"`, `viewBox="0 0 24 24"`, and `width` / `height` equal to `String(LOCATION_MARK_ICON_SIZE_PX)` (FR1, FR3, UX2);
  - `svg.querySelectorAll("path")` has length 1 and its `d` is `"M4 11l8-7 8 7v9H4z"`;
  - `svg.querySelectorAll("circle, rect, line, polyline, polygon, ellipse")` has length 0 (FR2, M3).

  Drop the `lucide-house` class assertion and the weak `not.toHaveAttribute("fill", "currentColor")`. Keep the Here-mark test that asserts `fill="currentColor"` (FR4), and add `// Verifies FR1, FR2, FR3, FR4, NFR-A1, UX2 of match-home-mark-to-design` to the file header. Verify red with `npx vitest run src/views/shared/LocationMarkIcon.test.tsx`: the `fill="none"` and path assertions must fail on the current code.
- [ ] 1.2 GREEN. In `views/shared/LocationMarkIcon.tsx`, apply design D1 and D2:
  - add the module-private `HOME_MARK_HOUSE_ICON_NODE` and `HomeMarkHouse = createLucideIcon("home-mark-house", HOME_MARK_HOUSE_ICON_NODE)`, with a comment naming `docs/design/screens/phone-light.html` as the source of the path;
  - point `LOCATION_MARK_ICONS[LocationMarkKind.HOME].Icon` at it and remove the `House` import;
  - add `FILLED_ICON_FILL = "currentColor"` and `OUTLINE_ICON_FILL = "none"`, and pass `fill={isFilled ? FILLED_ICON_FILL : OUTLINE_ICON_FILL}`;
  - add `Implements FR1, FR2, FR3, FR4 of match-home-mark-to-design` to the JSDoc of `LOCATION_MARK_ICONS` and `LocationMarkIcon`.

  Keep the file under 100 lines. Verify green with `npx vitest run src/views/shared/LocationMarkIcon.test.tsx`, then `npx vitest run src/views/shared`, then `pnpm --filter @time-zones/client typecheck`. The typecheck confirms that `createLucideIcon` and `IconNode` are exported by the installed `lucide-react` 0.577.0.

## 2. Unit BDD (vitest-cucumber, jsdom)

- [ ] 2.1 In `test/features/locations/locations_home_mark_unit.feature`, add the scenario "The home mark is the design's outlined house" (`@match-home-mark-to-design @FR1 @FR2 @FR4 @M3`):
  - Given the device time zone is "Europe/Moscow"
  - And the list contains "Almaty, Moscow"
  - And "Almaty" is home
  - When the user opens the app
  - Then the house of "Almaty" draws exactly 1 closed outline and paints nothing inside
  - And the arrow of "Moscow" is filled

  In `steps/locations_home_mark_unit.steps.tsx`, add the matching `f.Scenario` with `// @match-home-mark-to-design @FR1 @FR2 @FR4 @M3` and reuse `createDeviceTimeZoneWorld()` (`givenDeviceZone`, `givenList`, `givenHome`, `openApp`, `rowOf`). The house step finds `within(rowOf(city)).getByRole("img", { name: en.locations.homeMarkLabel })`. Its `svg` must have `fill="none"`, exactly 1 `path` whose `d` ends in `z` (a closed outline), and 0 `circle, rect, line, polyline, polygon, ellipse`. The arrow step finds the Here-mark image by `en.locations.hereMarkLabel`, and its `svg` has `fill="currentColor"`. Add `// Verifies FR1, FR2, FR4 of match-home-mark-to-design.` under the existing header line. Keep the steps file under 200 lines. Verify with `npx vitest run src/test/features/locations/steps/locations_home_mark_unit.steps.tsx`.

## 3. E2E BDD (playwright-bdd, real browser)

- [ ] 3.1 Write `test/features/home_location/home_location_mark_e2e.feature`. It has `Feature: Home mark in a real browser` and `Implements change match-home-mark-to-design.`, plus one outline (`@match-home-mark-to-design @FR1 @FR3 @UX1 @UX2 @M2`):

  ```gherkin
  Scenario Outline: The house is outlined in the accent colour in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the list holds "Almaty", "Moscow" and home is "Almaty"
    And the user opens the locations app
    Then the house of "Almaty" has no fill and an outline in the accent colour
    And the house of "Almaty" is 18 px wide and tall

    Examples:
      | theme |
      | light |
      | dark  |
  ```

  Write `steps/home_location_mark_e2e.steps.ts` with `createBdd(test)` from `../../locations/steps/locations_ui_e2e.fixtures`. The `Given` steps already exist (`locations_view_a11y_e2e.steps.ts`, `home_location_e2e.steps.ts`, and the open-app step) and are not redefined. The two new `Then` steps locate the drawn glyph as `listRow(page, city).getByRole("img", { name: englishLocale.locations.homeMarkLabel }).locator("svg")`. `listRow` comes from `../../locations/steps/locationsE2eHelpers`.
  - The paint step asserts `toHaveCSS("fill", "none")` and `toHaveCSS("stroke", await readTokenStyle(page, "stroke", ACCENT_TOKEN))`, with `ACCENT_TOKEN = "--color-accent"` and `readTokenStyle` from `../../time_selection/steps/timeSelectionE2eHelpers`.
  - The size step compares the `boundingBox()` width and height with `LOCATION_MARK_ICON_SIZE_PX` from `@/constants`. Other E2E steps already import through `@/`, for example `locations/steps/locations_reorder_legacy_touch_e2e.steps.ts`.

  Comment each step `// Verifies FR1, FR3, UX1, UX2 of match-home-mark-to-design`. Verify with `pnpm test:bdd --grep "house is outlined"`. Both examples must pass in the `chromium` and `mobile-chrome` projects. Confirm the check is real: the step must fail if `OUTLINE_ICON_FILL` is set back to `undefined`. Run the grep once with that temporary edit, then restore it.
- [ ] 3.2 NFR-A1: in `test/features/home_location/home_location_e2e.feature`, add `@match-home-mark-to-design @NFR-A1` to the tags of the outline "Accessibility in the <state> state in the <theme> theme" (home and travelling states, both themes) and of the scenario "Setting home is announced", which asserts the mark named "Home location". Verify with `pnpm test:bdd --grep "Accessibility in the (home|travelling) state|Setting home is announced"`.
- [ ] 3.3 NFR-R1 / M4: re-approve the 16 baselines `Screenshot-of-the-home-state-*` and `Screenshot-of-the-travelling-state-*` under `test/features/__screenshots__/chromium/` and `mobile-chrome/`. Add `@match-home-mark-to-design @NFR-R1 @M4` to the tags of the outline "Screenshot of the <state> state at <width> px in the <theme> theme" in `test/features/locations/locations_ui_e2e.feature`.
  - Run `pnpm test:bdd --grep "Screenshot of the (home|travelling) state" --update-snapshots=all` once. A bare `--update-snapshots` (Playwright 1.63 mode `changed`) rewrites only failing baselines. The 18 × 18 px icon stays under the 2.5% `maxDiffPixelRatio`, so a bare run would rewrite none.
  - Verify that `git status --short src/test/features/__screenshots__` lists exactly 16 files, all named `*home-state*` or `*travelling-state*`. Open one light and one dark rewritten baseline and confirm that the house before the city is an outline, not solid.
  - Then verify that `pnpm test:bdd --grep "Screenshot of the"` passes without the flag, so every other baseline is unchanged.

## 4. Verification

- [ ] 4.1 Traceability (M1). From the repository root, run `for id in FR1 FR2 FR3 FR4 NFR-A1 NFR-R1 UX1 UX2; do grep -rqE "match-home-mark-to-design.*@?${id}([^0-9]|$)|${id}([^0-9].*)?match-home-mark-to-design" packages/client/src --include='*.test.ts' --include='*.test.tsx' --include='*.feature' --include='*.steps.ts' --include='*.steps.tsx' || echo "missing $id"; done`. It must print nothing. It cannot pass on earlier changes' tags, because every match needs `match-home-mark-to-design`.
- [ ] 4.2 Mutation (M5): `npx stryker run --mutate 'src/views/shared/LocationMarkIcon.tsx'` must score at least 95% (minimum 90%), read from `reports/mutation/mutation-report.json`. Kill any survivors with new assertions in `views/shared/LocationMarkIcon.test.tsx` and re-run.
- [ ] 4.3 No stray library house: from `packages/client/`, `grep -rnw "House" src/views --include='*.tsx' | grep -v test` prints nothing.
- [ ] 4.4 Run lint, the unit suite, the build and the full BDD E2E run, one at a time: `pnpm --filter @time-zones/client lint`, then `pnpm --filter @time-zones/client test`, then `pnpm --filter @time-zones/client build`, then `pnpm --filter @time-zones/client test:bdd`.

## Human follow-up

None. Every step runs inside the implement stage's limits. Code, tests and baselines live under `packages/client/`, mutation testing is scoped to 1 file, the CI commands run locally in task 4.4, and the deliver stage pushes the branch and opens the pull request. No `docs/`, `.github/`, `.claude/` or ADR change is needed. The design screens already show this glyph, and the glossary's Home mark entry (pending patch H1 of the archived `set-home-location-and-show-differences`) keeps its meaning and owner.
