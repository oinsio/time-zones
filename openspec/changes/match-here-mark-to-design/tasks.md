# Tasks

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter`. Run tests one command at a time, never in the background. Mutation runs: at most 5 files per run, report in `reports/mutation/mutation-report.json`. Time and the device zone in tests come only from `fakeClock(instant, timeZone)` of `@/lib/temporal`, or a `Clock` whose `timeZoneId` the step controls (`deviceTimeZoneWorld.tsx`). Never use `vi.setSystemTime()` or `vi.useFakeTimers()`. Every new or changed test, step file and feature scenario carries `match-here-mark-to-design` traceability:
- `@match-here-mark-to-design @FR-X` tags above scenarios;
- `// @match-here-mark-to-design @FR-X` before `f.Scenario`;
- `// Verifies NFR-X of match-here-mark-to-design` in E2E steps;
- `// Verifies FR-X of match-here-mark-to-design` at the top of changed Vitest files;
- `Implements FR-X of match-here-mark-to-design` in the JSDoc of new or changed production code.

## 1. Constant and locale keys (no TDD: constants and strings)

- [ ] 1.1 Add `LOCATION_MARK_ICON_SIZE_PX = 18` to `constants/locations.ts` with a JSDoc that names the design screens and `Implements UX1 of match-here-mark-to-design`, and export it from `constants/index.ts` (design D3). Verify with `pnpm --filter @time-zones/client typecheck`.
- [ ] 1.2 Add `locations.hereMarkLabel` (en "You are here", ru "Вы здесь") and `locations.hereMarkCaption` (en "here", ru "здесь") to `locales/en.json` and `locales/ru.json` (design D4, FR3). Keep `locations.deviceTimeZoneBadge` for now; task 5.3 removes it. Verify with `npx vitest run src/locales/locales.test.ts` (key parity).

## 2. Model (TDD)

- [ ] 2.1 TDD `model/locationMark.ts` (design D1) in `model/locationMark.test.ts`, using `it.each`:
  - Almaty location with device `Asia/Almaty` → `LocationMarkKind.HERE`;
  - Almaty with `Asia/Tokyo` → `undefined`;
  - Minsk (`Europe/Minsk`) with `Europe/Moscow` → `undefined` (equality by canonical ID).

  Export `LocationMarkKind` and `getLocationMarkKind` from `model/index.ts` (FR1, FR4). Verify red, then green, with `npx vitest run src/model/locationMark.test.ts`.

## 3. Presenter (TDD)

- [ ] 3.1 TDD `presenter/locationMark.ts` (design D2) in `presenter/locationMark.test.ts`:
  - `presentLocationMarks(i18n.getFixedT("en"))[LocationMarkKind.HERE]` equals `{ kind: HERE, accessibleLabel: "You are here", caption: "here" }`;
  - the Russian `translate` gives `"Вы здесь"` / `"здесь"`;
  - a stub `translate` returning `"XYZ"` gives `"XYZ"` for both texts;
  - an `it.each` over `Object.values(LocationMarkKind)` × `["en", "ru"]` asserts a non-empty `accessibleLabel`, and a non-empty `caption` for every kind whose `LOCATION_MARK_TEXT_KEYS` entry has a `captionKey` (M3, FR4).

  Verify red, then green, with `npx vitest run src/presenter/locationMark.test.ts`.
- [ ] 3.2 Replace `deviceTimeZoneLabel` with `mark?: PresentedLocationMark` in `presenter/presentLocationRows.ts`:
  - call `presentLocationMarks(translate)` once before `locations.map`;
  - each row takes `mark = kind ? marks[kind] : undefined` from `getLocationMarkKind`;
  - drop the `deviceTimeZoneBadge` lookup;
  - re-export `LocationMarkKind`, `PresentedLocationMark` and `presentLocationMarks` from `presenter/index.ts`;
  - update the JSDoc (FR1, FR4).

  In `presenter/presentLocationRows.test.ts`, rewrite "present the device time zone badge" as "present the here mark", mapping rows to `row.mark?.caption ?? ""`:
  - match → `["here", ""]`;
  - no match → `["", ""]`;
  - Moscow + Saint Petersburg + Almaty with `Europe/Moscow` → `["here", "here", ""]`;
  - Russian → `"здесь"`.

  Update every other `LocationRow` fixture or expectation that names `deviceTimeZoneLabel`, by removing the key or expecting the mark: `controller/useLocations.test.tsx`, `controller/useLocations.deviceTimeZone.test.tsx` (`BADGE_RU` becomes the caption `"здесь"`, read from `row.mark?.caption`), `controller/useLocations.tick.test.tsx`, `views/shared/LocationRow.dragging.test.tsx`, `views/shared/LocationList.test.tsx`, `views/shared/useReorderAnnouncements.test.tsx`, `views/shared/LocationList.drop.test.tsx`, `test/features/locations/steps/locations_reorder_unit.steps.ts`. `LocationRow.tsx` is changed in task 4.2; until then it may read `row.mark?.caption` in place of `row.deviceTimeZoneLabel` so the build compiles.

  Verify with `npx vitest run src/presenter`, then `npx vitest run src/controller`, then `pnpm --filter @time-zones/client typecheck`.

## 4. View (TDD, jsdom component tests)

- [ ] 4.1 TDD `views/shared/LocationMarkIcon.tsx` (design D3) in `views/shared/LocationMarkIcon.test.tsx`:
  - for `HERE`, the wrapper has `role="img"`, the given `id`, `aria-label` equal to `mark.accessibleLabel` and class `text-accent`;
  - the inner `svg` has `aria-hidden="true"`, `width="18"` and `fill="currentColor"`;
  - an `it.each` over `Object.values(LocationMarkKind)` asserts that every kind has a `LOCATION_MARK_ICONS` entry that renders an `svg` (M3, FR4, UX1).

  Verify red, then green, with `npx vitest run src/views/shared/LocationMarkIcon.test.tsx`.
- [ ] 4.2 TDD the slot in `views/shared/LocationRow.tsx`. In `views/shared/LocationRow.test.tsx`, replace the "device time zone badge" block with "here mark", using a row with `mark: { kind: HERE, accessibleLabel: "You are here", caption: "here" }`:
  - the city line's first child is the mark image and the city span is its next sibling;
  - the caption `"here"` is the city span's next sibling, has `aria-hidden="true"` and classes `text-accent font-bold`, and has no `bg-accent`, `rounded-full` or `border` class (UX2);
  - the row is named `"Kolkata You are here"` (NFR-A1);
  - without a mark the row is named `"Kolkata"` and the city span is the line's only child (UX3);
  - no element has the text `"Your time zone"` (FR2).

  Remove `BADGE_ICON_SIZE_PX` and the pill branch, and keep the file under 200 lines. Update the test file header to `// Verifies FR1, FR2, FR4, UX1, UX2, UX3, NFR-A1 of match-here-mark-to-design`. Verify red, then green, with `npx vitest run src/views/shared/LocationRow.test.tsx`, then `npx vitest run src/views`.

## 5. Unit BDD (vitest-cucumber, jsdom)

- [ ] 5.1 Switch the existing features to the here mark (design D5):
  - In `test/features/locations/locations_device_time_zone_unit.feature` and `locations_clock_tick.feature`, the steps "the {string} row shows the badge", "the {string} row shows no badge" and "no row shows the badge" become "… shows the here mark", "… shows no here mark" and "no row shows the here mark".
  - "English interface" expects `the "Almaty" row shows the caption "here"`. "Russian interface" expects `the "Almaty" row shows the Russian here caption`.
  - Add `@match-here-mark-to-design` with `@FR1` (match scenarios), `@FR5` (list change, read once, minute boundary, page visible, not stored), `@FR3` (both languages) and `@NFR-P1` ("50 rows within the budget") next to the existing tags.
  - In `steps/deviceTimeZoneWorld.tsx`, `steps/locations_device_time_zone_unit.steps.tsx` and `steps/locations_clock_tick.steps.tsx`, the mark check is `within(row).queryByText(caption, { exact: true })` with the caption from `en.locations.hereMarkCaption` / `ru.locations.hereMarkCaption`, never a substring of the row text.

  Verify with `npx vitest run src/test/features/locations/steps/locations_device_time_zone_unit.steps.tsx`, then `npx vitest run src/test/features/locations/steps/locations_clock_tick.steps.tsx`.
- [ ] 5.2 Write `test/features/locations/locations_here_mark_unit.feature` and `steps/locations_here_mark_unit.steps.tsx`, reusing `deviceTimeZoneWorld.tsx` (keep each file under 200 lines). Scenarios:
  - "Icon before the city, caption after it" (`@FR1 @UX1 @UX2 @UX3`): device `Asia/Almaty`, list Almaty and Moscow. On Almaty's city line the mark image precedes the city and the caption `here` follows it. Moscow's city line starts with the city.
  - "The former pill is gone" (`@FR2 @M2`): device `Europe/Moscow`, list Moscow, Saint Petersburg, Almaty. Exactly 2 rows show the here mark, and `screen.queryByText(/Your time zone/)` is null.
  - "A marked row has exactly one leading mark" (`@FR4`): Almaty has exactly 1 `svg` before its city span on the city line, Moscow has 0 (DOM count, no accessible-name assertion; names are checked in task 6.1).
  - "Every mark kind is fully defined" (`@FR4 @FR3 @M3`): for each `Object.values(LocationMarkKind)` in `en` and `ru`, `presentLocationMarks` (from `@/presenter`) gives a non-empty accessible label, and a non-empty caption where the kind has one.

  Verify with `npx vitest run src/test/features/locations/steps/locations_here_mark_unit.steps.tsx`.
- [ ] 5.3 Remove `locations.deviceTimeZoneBadge` from `locales/en.json` and `locales/ru.json`, and remove every remaining reference (FR2). Verify:
  - from the repository root, `grep -rn "deviceTimeZoneBadge\|deviceTimeZoneLabel\|Your time zone\|Ваш часовой пояс" packages/client/src --include='*.ts' --include='*.tsx' --include='*.json'` prints only lines of `locations_here_mark_unit.steps.tsx` and `LocationRow.test.tsx` that assert the text's absence;
  - then `npx vitest run src/locales/locales.test.ts`;
  - then `pnpm --filter @time-zones/client typecheck`.
- [ ] 5.4 Run the whole unit suite once, to catch other features that rendered the badge. Verify with `pnpm --filter @time-zones/client test`.

## 6. E2E BDD (playwright-bdd, real browser; device zone `Asia/Almaty` from `playwright.bdd.config.ts`)

- [ ] 6.1 Update `test/features/locations/locations_device_time_zone_e2e.feature` and `steps/locations_device_time_zone_e2e.steps.ts`:
  - "Row name includes the badge" expects `the row of "Almaty" is named "Almaty You are here"` and gains `@match-here-mark-to-design @NFR-A1`.
  - The steps "shows the device time zone badge" / "shows no device time zone badge" become "shows the here mark" / "shows no here mark". The row contains / does not contain `getByText(englishLocale.locations.hereMarkCaption, { exact: true })`.
  - The axe outline gains `@match-here-mark-to-design @NFR-A2 @M4`, and the 320 / 2560 px outline gains `@match-here-mark-to-design @NFR-R1 @M4`.
  - The list-state outline gains `@match-here-mark-to-design @NFR-R2`.
  - Add the scenario "The mark icon is named and the caption is not announced" (`@match-here-mark-to-design @NFR-A1 @FR1`). In the Almaty row, `getByRole("img", { name: "You are here", exact: true })` is visible, and the caption element has `aria-hidden="true"`.
  - The steps file comment becomes `// Verifies NFR-A1, NFR-A2, NFR-R1, NFR-R2 of match-here-mark-to-design`.

  Then in `locations_local_time_e2e.feature`, "Time does not change the row name" expects `"Almaty You are here"` and gains `@match-here-mark-to-design @NFR-A1`.

  Verify with `pnpm test:bdd --grep "[Bb]adge|here mark|mark icon|row name"`. Every example must pass in the `chromium` and `mobile-chrome` projects.
- [ ] 6.2 NFR-R2 / M5: re-approve the 32 baselines of the outline "Screenshot of the <state> state at <width> px in the <theme> theme" (`locations_ui_e2e.feature`) for the states list, pinned, calendar and time-selected, under `test/features/__screenshots__/chromium/` and `mobile-chrome/`. Add `@match-here-mark-to-design @NFR-R2 @M5` to the outline's tags.
  - Run `pnpm test:bdd --grep "Screenshot of the (list|pinned|calendar|time-selected) state" --update-snapshots` once.
  - Verify that `git status --short src/test/features/__screenshots__` lists only files of those four states.
  - Then verify that `pnpm test:bdd --grep "Screenshot of the"` passes without the flag.

## 7. Verification

- [ ] 7.1 Traceability (M1). From the repository root, run `for id in FR1 FR2 FR3 FR4 FR5 NFR-P1 NFR-A1 NFR-A2 NFR-R1 NFR-R2 UX1 UX2 UX3; do grep -rqE "match-here-mark-to-design.*@?${id}([^0-9]|$)|${id}([^0-9].*)?match-here-mark-to-design" packages/client/src --include='*.test.ts' --include='*.test.tsx' --include='*.feature' --include='*.steps.ts' --include='*.steps.tsx' || echo "missing $id"; done`. It must print nothing.
- [ ] 7.2 Mutation (M6): `npx stryker run --mutate 'src/model/locationMark.ts,src/presenter/locationMark.ts,src/presenter/presentLocationRows.ts,src/views/shared/LocationMarkIcon.tsx,src/views/shared/LocationRow.tsx'` must score at least 95% (minimum 90%), read from `reports/mutation/mutation-report.json`. Kill any survivors with new tests in the files of tasks 2–4 and re-run.
- [ ] 7.3 Domain rule: the stored document is unchanged and the device zone is never stored. Verify with `npx vitest run src/adapters`, then from `packages/client/` check that `grep -rn "deviceTimeZone\|LocationMark" src/adapters src/ports` prints nothing.
- [ ] 7.4 Lint, build, then the full BDD E2E run, one at a time: `pnpm --filter @time-zones/client lint`, then `pnpm --filter @time-zones/client build`, then `pnpm --filter @time-zones/client test:bdd`.

## Human follow-up

None. Every step of this change runs inside the implement stage's limits: all code and tests live under `packages/client/`, mutation testing is scoped to 5 files, and the deliver stage pushes the branch and opens the pull request. No `docs/`, `.github/`, `.claude/` or ADR change is needed: `docs/architecture/views.md` ("Row header") and `docs/design/README.md` already describe this mark.
