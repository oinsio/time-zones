# Design: Compact settings controls

## Context

Driven by FR1–FR6, NFR-A1–NFR-A3, NFR-R1, NFR-R2 and UX1–UX3 from `proposal.md`. The facts below were checked in the code as it is:

- `src/app/settings/SettingsOptionGroup.tsx` (72 lines) draws one `<fieldset>` with a `<legend>` and an inner `div role="radiogroup" aria-label={legend}`. Each option is a full-width `<label>` around a `sr-only` native `<input type="radio">`, with an optional `Icon`, the label text and a `Check` icon when checked. `SettingsPage.tsx` is its only user, for the theme and the hour format. It has no test file of its own. `SettingsPage.test.tsx` covers it, and its glossary has no entry for it.
- `SettingsPage.tsx` maps `Object.values(ThemePreference)`, which is the enum order `LIGHT`, `DARK`, `SYSTEM` (`src/preferences/preferences.ts`), with `THEME_OPTION_ICONS` (Sun, Moon, Monitor) and `THEME_OPTION_LABEL_KEYS`. The hour format maps `Object.values(HourFormat)` (`H12`, `H24`) with `HOUR_FORMAT_LABEL_KEYS`. `parseStoredPreferences.ts` validates a stored theme against `Object.values(ThemePreference)`.
- `src/app/settings/SettingsToggleGroup.tsx` (the glossary's **Toggle group**) already lays out a caption and its controls in one row. It uses a `div role="group" aria-labelledby` around a caption `<span>`, and `flex flex-wrap items-center justify-between gap-x-4 gap-y-2` for the row. `src/constants/preferences.ts` already shares Tailwind classes between components as a constant (`LANGUAGE_BUTTON_CLASS_NAME`). It also holds a display order that differs from the enum order (`ZONE_LABEL_PART_ORDER`).
- The E2E helpers find options by role: `optionOf` is `getByRole("radio", { name, exact: true })`, and `check({ force: true })` chooses one (`settingsE2eHelpers.ts`, `settings_e2e.steps.ts`). "every settings option is at least 44 px high" measures every `<label>` that holds a radio. The groups are found with `getByRole("radiogroup", { name })`.
- Some E2E helpers rely on the old markup. In `settingsCreditE2eHelpers.ts`, `readThemeIconColour` reads the first `svg` of the theme radiogroup, and `isCreditDirectlyAboveThemeGroup` looks for a radiogroup inside the credit's next sibling by its `aria-label`. In `settings_factory_credit_layout_e2e.steps.ts`, a step reads the font size of the first `legend`. In `settings_language_layout_e2e.steps.ts`, the theme radiogroup's width is expected to equal the language group's width.
- `lucide-react` ^0.577.0 is installed. The design tokens `--color-accent`, `--color-accent-foreground`, `--color-surface` and `--color-border` exist in both themes (`src/styles/tokens.css`). `readThemeColours` (`src/test/features/main_page/steps/themeTokens.ts`) reads token colours in E2E.
- The project has no Storybook. Visual regression is the approved screenshots under `src/test/features/__screenshots__/` (`chromium` and `mobile-chrome`).

Bound by ADR-0001 (E2E through playwright-bdd), ADR-0002 (views render and emit events, the controller owns side effects), ADR-0004 (stored document and schema unchanged, so no migration), ADR-0009 (Safari 12 build level) and `.claude/rules/architecture.md`, `code-style.md`, `i18n.md`, `glossary.md`. The change makes no global decision, so no ADR is needed.

## Goals / Non-Goals

Design-level only. The preferences model, the controller hooks (`usePreferences`, `setTheme`, `setHourFormat`) and the stored document stay as they are (proposal NG2). Only `src/app/settings/` and `src/constants/preferences.ts` change in production code.

## Decision

### D1. `SettingsOptionGroup` is rewritten in place as the compact option group (FR5, FR6, NFR-A1)

The existing owner is kept and changed, not forked (`glossary.md`: "change the owner and its tests"). Its props become:

```ts
export type SettingsOption<Value extends string> = {
  value: Value;
  /** Accessible name and pointer hint; shown as text only without Icon and pictogram. */
  label: string;
  Icon?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Short language-neutral text shown instead of the label. */
  pictogram?: string;
};
type SettingsOptionGroupProps<Value extends string> = {
  caption: string;
  options: readonly SettingsOption<Value>[];
  selectedValue: Value;
  onSelect: (value: Value) => void;
};
```

Markup: one `div role="radiogroup" aria-labelledby={captionId}` holds the row. A caption `<span id={captionId}>` comes first, then a joined track (`div`, `flex`, `rounded-md border border-border bg-surface`). In the track, each option is a `<label title={label}>` around the same `sr-only` native radio with a shared `name` from `useId()`. Native radios keep one Tab stop per group and arrow-key movement in DOM order, which is the display order (FR2, NFR-A1). The label's content:

- with `Icon`: `<Icon aria-hidden="true" />` plus `<span className="sr-only">{label}</span>`;
- with `pictogram`: `<span aria-hidden="true">{pictogram}</span>` plus `<span className="sr-only">{label}</span>`;
- with neither: `<span>{label}</span>`.

So the input's accessible name is always exactly `label`. The radiogroup element is the whole full-width row, so it keeps the width the language layout step compares against. The credit helpers that read the old `legend`, `aria-label` and first icon are adapted in task 6.3: the unchecked theme icons keep `text-accent`, so "the colour of the theme icons" still means the accent colour. The spec delta restates **Gnomish Factory credit** in these words (the colour of the unchecked theme option icons, larger than the group captions), and task 6.3 renames the one step that named the legends. `exact: true` lookups in E2E keep working, and so do the existing names in every scenario (M4). The `<fieldset>`/`<legend>` and the extra `aria-label` go: before, the page exposed a group and a radiogroup with the same name, and now there is one radiogroup named by the visible caption.

Every label is `min-h-11 min-w-11` (44 px), centred, with the existing `has-[:focus-visible]:outline …` focus outline. `<label>` elements still wrap the radios, so the step "every settings option is at least 44 px high" still measures them. `Check` is no longer imported by the option group; the toggle group keeps its own check icon.

Alternative: a new `SettingsSegmentedGroup` next to the old one. Rejected: the old one would be left with no user, and the concept would have two owners. Alternative: buttons with `role="radio"` and a roving tabindex. Rejected: it reimplements what native radios give for free, and `check({ force: true })` in the E2E steps relies on real inputs.

### D2. The hour format pictograms are the digits `12` and `24` (FR4, NFR-A3)

Common practice was weighed:

- iOS ("24-Hour Time") and Android ("Use 24-hour format") use a switch. That fits a two-value setting, but not the option group the theme needs, and it would hide which format the off state means.
- Many web clocks and calendars use a segmented `12h | 24h`.
- Icons: lucide has clock faces (`Clock`, `Clock12`, …) but nothing that tells 12-hour from 24-hour.
- Sample times (`3:30 PM` / `15:30`) are clear, but wide, locale-dependent, and would need the presenter.

The decision is the segmented control with the bare digits `12` and `24`. They are the same in every language, they fit the 44 px square of the theme icons, and they stay inside the accessible name in both languages. "12-hour" and «12 часов» both contain `12`, so WCAG 2.5.3 Label in Name holds. `12h` would not be contained in "12-hour", and «12 ч» would need new locale keys. The caption "Hour format" / «Формат времени» next to them supplies the unit.

The digits live in `src/constants/preferences.ts` as `HOUR_FORMAT_PICTOGRAMS: Record<HourFormat, string> = { [HourFormat.H12]: "12", [HourFormat.H24]: "24" }`. They are language-neutral numerals, not translatable text, so they get no locale key (`i18n.md` asks for `t()` for user-visible strings; the accessible names still come from `t()`).

### D3. The display order of the theme is a constant, not the enum order (FR2, FR3)

`THEME_PREFERENCE_ORDER: readonly ThemePreference[] = [SYSTEM, LIGHT, DARK]` goes in `src/constants/preferences.ts`, exported from `src/constants/index.ts`, just as `ZONE_LABEL_PART_ORDER` separates display order from enum order. `SettingsPage` maps it instead of `Object.values(ThemePreference)`. The enum, `parseStoredPreferences` and the stored values stay as they are. Reordering the enum would also work today, but it would tie the screen order to the validation list and break the precedent. The hour format keeps `Object.values(HourFormat)`, whose order `H12`, `H24` is already the display order.

The Arrow Up scenario stays true: native radios wrap, so Arrow Up from System, now the first option, reaches Dark, now the last.

### D4. The checked option is an accent fill (NFR-A2, UX2)

Checked label: `bg-accent text-accent-foreground`. Unchecked: `bg-surface text-accent`, the colour the theme icons use today. The fill changes only the background and foreground colours: border, padding and size stay, so choosing moves nothing (spec "Choosing moves nothing"). Contrast of the glyphs against their fill, from `tokens.css`: light accent `#2f5bd3` on surface `#ffffff` and `#ffffff` on `#2f5bd3`; dark `#5ec2e8` on `#16213a` and `#0b1220` on `#5ec2e8`. All are well above 4.5:1, so axe's text contrast check passes for the pictograms. The checked and unchecked fills differ strongly in lightness in both themes, so the mark does not rely on hue alone. This replaces the check icon for the option group. The toggle group keeps its check icon, because a toggle's off state has no fill to compare against. The language list keeps its accent border and check icon too (`InterfaceLanguageList.tsx`); the spec delta restates **Interface language choice** without its comparison with the theme group, so the stable spec no longer points at a mark the theme group dropped.

### D5. One row layout shared by both groups (FR5, FR6, UX1)

Two constants are added to `src/constants/preferences.ts` next to `LANGUAGE_BUTTON_CLASS_NAME`: `SETTINGS_GROUP_ROW_CLASS_NAME = "flex flex-wrap items-center justify-between gap-x-4 gap-y-2"` and `SETTINGS_GROUP_CAPTION_CLASS_NAME = "text-sm font-semibold text-muted-foreground"`. Both `SettingsToggleGroup` and `SettingsOptionGroup` use them for their row and caption, so the two groups cannot drift apart. The toggle group's look does not change: the classes are its current ones.

Fit check (NFR-R1, M1): the content width at 320 px is 288 px (`px-4`). The widest caption, «Формат времени», is about 120 px in `text-sm font-semibold`. Two 44 px options with the track border take about 90 px, plus a 16 px gap, so the row needs about 226 px and fits. The theme row («Тема» plus three options, about 134 px) fits easily. The row height is the option height, 44 px plus the 2 px track border, under the 56 px of M1. `flex-wrap` stays as a safety net for longer captions of later languages, as in the toggle group.

Alternative: a shared `SettingsGroupRow` component. Rejected for now: the two groups differ in role (`group` and `radiogroup`) and in the description slot. Two class constants keep one owner of the layout with less indirection.

### D6. Pointer hint through `title` (FR1, FR4)

`title={label}` on each option's `<label>` gives mouse users the name on hover (U3). It is not the accessible name: that comes from the `sr-only` text. A `title` equal to the name adds no second announcement. The unit test checks the attribute. The browser draws the tooltip itself, and no test asserts that.

### D7. Tests and screenshots (NFR-R2, M1–M4)

- jsdom (Vitest, `SettingsOptionGroup.test.tsx`, `SettingsPage.test.tsx`, unit BDD `settings_option_group_unit.feature`): DOM order, which visual element each option has, the `title`, the absence of visible text, the reported value, the stored value. These need no layout.
- Real browser (`settings_option_group_e2e.feature`): accessible names in both languages, arrow keys, 44 × 44 px boxes, the focus outline, computed fill colours against `readThemeColours`, one row and the 56 px height per width and language, and position stability on choosing. They need layout, focus and computed styles (`bdd-e2e.md`, `gherkin.md`: "If a scenario requires a real browser (focus, aria, layout), it goes into `*_e2e.feature`").
- The settings screenshots in `settings_e2e.feature` (4) and `settings_language_e2e.feature` (4) are re-approved once with `--update-snapshots` for both Playwright projects. A second run without the flag must pass. The main page screenshots must pass unchanged.

## Consequences

Positive:
- The theme and the hour format take one row each, and a later single-choice setting needs only a caption and options (G1, G2).
- The option group keeps one owner; the toggle group and the option group share one layout owner.
- Names, values and stored data are untouched, so every behaviour scenario keeps its text (M4).

Negative:

- iOS Safari 12 does not support `:has()`, so the `has-[:focus-visible]` outline is missing there. This is not new: today's option group already uses it. The option is still reachable and announced.
- `title` tooltips do not appear on touch screens. The icons are the widely used sun, moon and monitor, and screen readers get the names.
- Digits without a unit rely on the caption. Accepted (D2); a later change can swap `HOUR_FORMAT_PICTOGRAMS` for another text without touching the group.

## Migration Plan

None: no stored data or schema changes.

## Open Questions

None.

## Alternatives Considered

**A new segmented component next to `SettingsOptionGroup`**: rejected in D1, two owners of one concept.

**Buttons with `role="radio"` and a roving tabindex**: rejected in D1, it reimplements native radio behaviour.

**`12h` / `24h`, clock icons or sample times for the hour format**: rejected in D2 (Label in Name, no telling icon, width and locale dependence).

**Reordering `ThemePreference`**: rejected in D3, it ties the screen order to validation.

**A shared `SettingsGroupRow` component**: rejected in D5 for two class constants.
