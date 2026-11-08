# Tasks

Paths are relative to `packages/client/` unless they start with `docs/`. Run tests strictly one command at a time (`CLAUDE.md`). Every new or touched production file gets a JSDoc line `Implements <ids> of compact-settings-controls (D<n>).`, every test file a `// Verifies <ids> of compact-settings-controls.` comment, and every new or changed Gherkin scenario the tags `@compact-settings-controls @<id>`.

## 1. Glossary and architecture docs (FR1, FR2, FR4, FR6)

- [x] 1.1 Update the glossary in the same change (`.claude/rules/glossary.md`), in the entry format of `docs/glossary/README.md`:
  - `docs/glossary/settings.md`: add a new **Option group** entry after **Toggle group**: "a compact settings group in one row: a caption and mutually exclusive options, exactly one checked, joined in one control; each option is shown by an icon or a pictogram, or by its name when it has neither, and its name is its accessible name and pointer hint. *RU:* группа выбора. *Code:* `SettingsOptionGroup`, `SettingsOption`, `SETTINGS_GROUP_ROW_CLASS_NAME`."
  - **Toggle group**: add "shares its row layout with the option group (`SETTINGS_GROUP_ROW_CLASS_NAME`)".
  - **Theme preference**: add "shown as icons only, in the order System, Light, Dark (`THEME_PREFERENCE_ORDER`)".
  - **Hour format**: add "shown by the pictograms `12` and `24` (`HOUR_FORMAT_PICTOGRAMS`)".
  - `docs/architecture/views.md`, Overlays table, row Settings: "theme (Light, Dark, System)" becomes "theme (System, Light, Dark; icons only)".

  Verify from the repository root: `grep -n "Option group" docs/glossary/settings.md`, `grep -n "THEME_PREFERENCE_ORDER" docs/glossary/settings.md`, `grep -n "HOUR_FORMAT_PICTOGRAMS" docs/glossary/settings.md` and `grep -n "System, Light, Dark; icons only" docs/architecture/views.md` each print a line. `grep -n "Light, Dark, System" docs/architecture/views.md` prints nothing. `wc -l docs/glossary/settings.md` is under 200.

## 2. Constants (FR2, FR4, FR5; design D2, D3, D5)

- [x] 2.1 RED: in `src/constants/preferences.test.ts` (create it if it does not exist; `// Verifies FR2, FR4, FR5 of compact-settings-controls.`) assert:
  - `THEME_PREFERENCE_ORDER` equals `[ThemePreference.SYSTEM, ThemePreference.LIGHT, ThemePreference.DARK]` and holds every `ThemePreference` value once;
  - `HOUR_FORMAT_PICTOGRAMS` equals `{ H12: "12", H24: "24" }`;
  - `SETTINGS_GROUP_ROW_CLASS_NAME` contains `flex-wrap` and `justify-between`.

  All three are imported from `@/constants`. Run `npx vitest run src/constants/preferences.test.ts` and see it fail.
- [x] 2.2 GREEN: add `THEME_PREFERENCE_ORDER`, `HOUR_FORMAT_PICTOGRAMS`, `SETTINGS_GROUP_ROW_CLASS_NAME` and `SETTINGS_GROUP_CAPTION_CLASS_NAME` (design D2, D3, D5) to `src/constants/preferences.ts` and export them from `src/constants/index.ts`. Re-run `npx vitest run src/constants/preferences.test.ts`: it passes.

## 3. Option group component (FR5, FR6, NFR-A1, NFR-A2, NFR-A3, UX2, UX3; design D1, D4, D5, D6)

- [ ] 3.1 RED: create `src/app/settings/SettingsOptionGroup.test.tsx` (`// Verifies FR5, FR6, NFR-A1, NFR-A2, NFR-A3, UX2, UX3 of compact-settings-controls.`). Render the group with the caption "Sample" and the options A (with an `Icon`), B (with `pictogram: "2"`) and C (neither), with B checked. Use `it.each` where the cases repeat. Assert:
  - `getByRole("radiogroup", { name: "Sample" })` exists, and its name comes from `aria-labelledby` pointing at the visible caption;
  - the radios come in DOM order A, B, C;
  - B is checked;
  - choosing A calls `onSelect` once with `"A"`;
  - each option's `<label>` has `title` equal to its name;
  - A's label holds an `svg` with `aria-hidden="true"` and no text outside a `.sr-only` element;
  - B's label shows `2` in an `aria-hidden` element, and B's accessible name is its label;
  - C's label shows the text "C";
  - only the checked label has the class `bg-accent`, and the others have `bg-surface`;
  - no label holds `svg.lucide-check`;
  - all three labels are children of one track element, which has the class `border` (UX3), while the caption is outside it;
  - the group contains no `fieldset`.

  Run `npx vitest run src/app/settings/SettingsOptionGroup.test.tsx` and see it fail.
- [ ] 3.2 GREEN: rewrite `src/app/settings/SettingsOptionGroup.tsx` to the props and markup of design D1, with the fill of D4, `SETTINGS_GROUP_ROW_CLASS_NAME` and `SETTINGS_GROUP_CAPTION_CLASS_NAME` (D5) and `title` (D6). Export `SettingsOptionGroup` and the type `SettingsOption` from `src/app/settings/index.ts`. Keep the file under 200 lines. Re-run `npx vitest run src/app/settings/SettingsOptionGroup.test.tsx`: it passes.
- [ ] 3.3 Refactor the toggle group to the shared layout (FR6, D5): replace the row and caption class strings in `src/app/settings/SettingsToggleGroup.tsx` with `SETTINGS_GROUP_ROW_CLASS_NAME` and `SETTINGS_GROUP_CAPTION_CLASS_NAME`, and add `Implements FR6 of compact-settings-controls (D5).` to its JSDoc. Verify `npx vitest run src/app/settings/SettingsToggleGroup.test.tsx` passes unchanged.

## 4. Settings page (FR1–FR4; design D1–D3)

- [ ] 4.1 RED: in `src/app/settings/SettingsPage.test.tsx` (add `// Verifies FR1, FR2, FR3, FR4 of compact-settings-controls.`):
  - the theme radios come in DOM order "System", "Light", "Dark";
  - the existing icon test keeps its pairs (System → `monitor`, Light → `sun`, Dark → `moon`) and also asserts that each theme label has no text outside `.sr-only` and has `title` equal to its name;
  - the hour format labels show `12` and `24`, in this order, and are named "12-hour" and "24-hour";
  - the Russian test also expects «Системная», «Светлая», «Тёмная» in this order and «12 часов», «24 часа»;
  - replace "should draw a check icon on the checked option only" with "should fill the checked option only": the checked label has `bg-accent` and the others do not;
  - in "should list the groups…", take the radiogroup names from their accessible names (`aria-labelledby`), not the `aria-label` attribute.

  Run `npx vitest run src/app/settings/SettingsPage.test.tsx` and see the new expectations fail.
- [ ] 4.2 GREEN: in `src/app/settings/SettingsPage.tsx`, map `THEME_PREFERENCE_ORDER` for the theme options. Pass the hour format options with `pictogram: HOUR_FORMAT_PICTOGRAMS[hourFormat]`. Pass `caption` instead of `legend`. Add `Implements FR1, FR2, FR3, FR4 of compact-settings-controls (D1–D3).` to its JSDoc. Re-run `npx vitest run src/app/settings/SettingsPage.test.tsx`, then `npx vitest run src/app/AppShell.settings.test.tsx`: both pass.

## 5. Unit BDD (FR3, FR6)

- [ ] 5.1 Create `src/test/features/settings/settings_option_group_unit.feature` (paired with the E2E file of task 6.1), with these scenarios of the spec delta:
  - "A group with three options" (`@FR6`);
  - "An option without an icon or a pictogram shows its name" (`@FR6`);
  - "The stored theme is unchanged" (`@FR3`): choose Dark, flush the write scheduler, then the `STORAGE_KEYS.PREFERENCES` document's payload has `theme: "DARK"` and `hourFormat: "H24"`.

  Scenarios that assert accessible names live in the E2E file (task 6.1).

  Put the steps in `src/test/features/settings/steps/settings_option_group_unit.steps.tsx`. Render with `createSettingsWorld` from `steps/settingsWorld.tsx` where the page is needed, and render `SettingsOptionGroup` directly for the generic scenarios. Verify `npx vitest run src/test/features/settings/steps/settings_option_group_unit.steps.tsx`.

## 6. E2E (FR1, FR2, FR4, FR5, NFR-A3, NFR-A1, NFR-A2, NFR-R1, UX2, M1, M2, M3)

- [ ] 6.1 Create `src/test/features/settings/settings_option_group_e2e.feature` with the spec delta scenarios, each tagged `@compact-settings-controls` and its ids:
  - "Icons only, in the order System, Light, Dark" (`@FR1 @FR2 @M2`, English and Russian: accessible names in DOM order, an `svg` and an empty `innerText` per label);
  - the outline "Pictograms in every language" (`@FR4 @NFR-A3 @M2`, English and Russian): each hour format label's `innerText` is `12` or `24`, in this order, and its radio's accessible name is the name of the spec table, which contains that pictogram;
  - "Arrow keys follow the visual order" (`@FR2 @NFR-A1`);
  - "Size, focus and checked fill" (`@NFR-A1 @NFR-A2 @UX2 @M3`, light and dark). Every theme and hour format label is ≥ 44 × 44 px. The checked label's computed `background-color` equals the computed `color` of the back button's chevron `svg`, which is `text-accent`. `readThemeColours` (`themeTokens.ts`) has no accent field. The unchecked labels' `background-color` equals `readThemeColours(theme).surface`. A label focused with Tab shows a non-`none` `outline-style`;
  - "Caption and options in one row" (`@FR5 @NFR-R1 @UX1`, 320 Russian, 375 English, 1024 Russian, 2560 English): the caption's and the track's bounding boxes overlap vertically for both groups, the caption's left edge is left of the track's, and the page does not scroll horizontally;
  - "Compact groups" (`@NFR-R1 @M1`, 375 px, English and Russian): each radiogroup's height is ≤ 56 px;
  - "Choosing moves nothing" (`@UX2`): the bounding boxes of the three theme options are equal before and after choosing Dark.

  Put the steps in `src/test/features/settings/steps/settings_option_group_e2e.steps.ts` (`// Verifies … of compact-settings-controls`), reusing `optionOf`, `openSettings` and the width and language Givens of `settings_e2e.steps.ts`, and the axe step "the locations screen has no accessibility violations" in the "Size, focus and checked fill" outline. Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_option_group_e2e.feature`.
- [ ] 6.2 Run the existing theme and hour format E2E unchanged (M4): `npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_e2e.feature --grep-invert "creenshot"`, then `npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_view_contract_e2e.feature`. Both pass with no change to their step texts. A step that measured the old markup gets fixed in its step file only, with a `// Verifies … of compact-settings-controls` comment; for example "every settings option is at least 44 px high" keeps measuring every `<label>` that holds a radio. Add `@compact-settings-controls @NFR-A1` to "Arrow keys change the theme" and "Names and checked state" in `settings_e2e.feature`. Add `@compact-settings-controls @M4` to the 8 scenarios named in M4 (6 in `settings_e2e.feature`, 2 in `settings_view_contract_e2e.feature`) without changing their steps.
- [ ] 6.3 Adapt the Gnomish Factory credit helpers to the new markup (FR5, FR6; the credit's behaviour does not change). In `src/test/features/settings/steps/settingsCreditE2eHelpers.ts`:
  - `readThemeIconColour` reads the `svg` of an unchecked theme option, whose colour stays `text-accent`; the checked one is now drawn in the accent foreground;
  - `isCreditDirectlyAboveThemeGroup` accepts the credit's next element sibling when it is itself the theme radiogroup, or contains it, and matches the name through the text of the element its `aria-labelledby` points at instead of `aria-label`.

  Rename the step "the credit is larger than the group legends and smaller than the settings heading" to "the credit is larger than the group captions and smaller than the settings heading", following the restated **Gnomish Factory credit** scenario "The larger credit text", in both `src/test/features/settings/settings_factory_credit_e2e.feature` and `src/test/features/settings/steps/settings_factory_credit_layout_e2e.steps.ts`, together, so `bddgen` finds the definition. The step reads the font size of the theme radiogroup's caption (its `aria-labelledby` element) instead of `legend`; rename `legendSize` to `captionSize` and update the step's `// Verifies` comment. The colour step texts ("the colour of the theme icons") stay: the helper reads an unchecked icon, as the restated requirement says. In `src/app/settings/SettingsPage.credit.test.tsx`, `expectThemeGroupRightAfter` accepts the credit's next element sibling when it is itself the radiogroup named "Theme", or contains it (the same rule as `isCreditDirectlyAboveThemeGroup`), with `// Verifies FR5, FR6 of compact-settings-controls: <what>`; verify `npx vitest run src/app/settings/SettingsPage.credit.test.tsx` passes. Each changed helper gets `// Verifies FR5, FR6 of compact-settings-controls: <what>`. Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_factory_credit_e2e.feature --grep-invert "creenshot"` passes.

## 7. Screenshots and the whole suite (NFR-R2)

- [ ] 7.1 Add `@compact-settings-controls @NFR-R2` to the screenshot outlines of `src/test/features/settings/settings_e2e.feature` and `settings_language_e2e.feature`. For each file, one at a time, run `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts <file> --grep "creenshot" --update-snapshots`. Open the changed 375 px PNGs under `src/test/features/__screenshots__/` with the Read tool and confirm:
  - the theme row shows three icons (monitor, sun, moon) with System filled;
  - the hour format row shows `12` `24` with 24 filled;
  - the zone label, language and deploy time blocks are unchanged.

  Then run each command again without `--update-snapshots`: it passes.
- [ ] 7.2 Run the other screenshots unchanged: `npx playwright test -c playwright.bdd.config.ts --grep "creenshot" --grep-invert "settings|language"` passes without `--update-snapshots`.
- [ ] 7.3 Run the whole unit suite once, `pnpm --filter @time-zones/client test`, and then the whole E2E suite once, `pnpm --filter @time-zones/client test:bdd`. A test that fails only because it expected the old theme order, the visible labels, the check icon or the `fieldset` gets its expectation updated to this change's spec, with a `// Verifies <id> of compact-settings-controls` comment. Any other failure is fixed in the code. Re-run the failing files one at a time until both suites pass.

## 8. Quality gates

- [ ] 8.1 Mutation testing, scoped (at most 5 files, one run, `CLAUDE.md`): `cd packages/client && npx stryker run --mutate 'src/app/settings/SettingsOptionGroup.tsx,src/app/settings/SettingsPage.tsx,src/app/settings/SettingsToggleGroup.tsx,src/constants/preferences.ts'`. Read `reports/mutation/mutation-report.json` and add tests until the score is >= 95% (minimum 90%).
- [ ] 8.2 Run the CI commands one at a time: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm --filter @time-zones/client check:bundle-size`, `pnpm --filter @time-zones/client check:legacy-build`. Each exits 0.
- [ ] 8.3 Traceability: from the repository root, for each id in FR1 FR2 FR3 FR4 FR5 FR6 NFR-A1 NFR-A2 NFR-A3 NFR-R1 NFR-R2 UX1 UX2 UX3 M1 M2 M3 M4, `grep -rnE "(@|\b)$id\b.*compact-settings-controls|compact-settings-controls.*(@|\b)$id\b" packages/client/src` prints at least one line. `grep -rn "@compact-settings-controls" packages/client/src/test/features` prints the feature tags. The grep matches this change's name, so artifacts of earlier changes cannot satisfy it.

## Human follow-up

None. Every step above runs inside the implement stage: no forbidden path is edited, mutation testing is scoped (task 8.1), the CI commands run locally (task 8.2), and the screenshots are re-approved by task 7.1. The deliver stage pushes the branch and opens the pull request.
