# Compact settings controls

No other active change touches the capability this change modifies: the only one, `add-pr-preview-deploy`, changes `app-delivery`, not `settings`.

## Why

The settings page is long and will get longer as settings are added. The theme preference takes three full-width rows (icon, label and check icon in each), and the hour format takes two more, each with a caption above it. The zone label group already fits one row (the toggle group). The owner asked for a compact page:

1. The theme preference shows its icons only, without captions, in the order System, Light, Dark. Only the look changes, not how the setting behaves.
2. The hour format becomes compact, shown by text pictograms or icons, following common practice.
3. The settings use the project's existing controls where they fit. Otherwise a new one is made that other settings can reuse.

Audience: every user of the settings page, on phones in particular, where five tall rows push the zone label and language groups below the fold.

## What Changes

- MODIFIED `settings` → **Theme preference**: the three options show only their icons: monitor (System), sun (Light), moon (Dark), in this order. Their names («Системная», «Светлая», «Тёмная») stay as accessible names and as a pointer hint. The default, applying a theme and the stored value do not change.
- MODIFIED `settings` → **Hour format**: the two options show the text pictograms `12` and `24` in every interface language, named "12-hour" / «12 часов» and "24-hour" / «24 часа». Their effect on every time text does not change.
- ADDED `settings` → **Option group**: one reusable compact group of mutually exclusive options. It has a caption and its options in one row, and each option is shown by an icon, a pictogram or its label. The theme preference and the hour format are built from it. It shares the one-row layout of the toggle group.
- MODIFIED `settings` → **Toggle group**: it no longer says that the theme and the hour format keep a radio layout. It shares its row layout with the option group.
- MODIFIED `settings` → **Accessible settings**: both groups stay radio groups with one Tab stop. The arrow keys follow the new visual order. The checked option is marked by an accent fill instead of a check icon. Every option is at least 44 × 44 px.
- MODIFIED `settings` → **Settings page layout**: the theme and the hour format groups each take one row at every width from 320 px. The approved settings screenshots are re-approved once.
- Glossary (`docs/glossary/settings.md`):
  - new term **Option group** (*Code:* `SettingsOptionGroup`, `SettingsOption`);
  - **Theme preference** gets its display order (`THEME_PREFERENCE_ORDER`);
  - **Hour format** gets its pictograms (`HOUR_FORMAT_PICTOGRAMS`).
- `docs/architecture/views.md` (Overlays, Settings): the theme is listed as System, Light, Dark, shown by icons only.
- Unchanged: `ThemePreference`, `HourFormat`, the stored preferences document (no schema change, no migration), the locale keys and texts, the zone label group, the language group, the deploy time.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `settings`: compact theme and hour format groups built from a reusable option group, with the theme order System, Light, Dark, plus the related accessibility, layout and screenshot requirements.

## Goals

- G1: The theme preference and the hour format each take one row of the settings page instead of three and two.
- G2: A later single-choice setting can be added with the option group alone, with no new component.
- G3: Nothing a user chose, or how a choice acts, changes.

## Non-Goals

- NG1: No new setting, no new value of the theme preference or the hour format, no change of the default.
- NG2: No change of the stored preferences document, `ThemePreference`, `HourFormat` or their declaration order. The display order is a separate constant.
- NG3: No change of the zone label group's look or behaviour, the language group, the Gnomish Factory credit, the deploy time or the unreadable and save-failed notes.
- NG4: No new locale keys and no renamed texts. The existing labels stay the accessible names.
- NG5: No new icon dependency: the icons come from the installed `lucide-react`.

## Users & Scenarios

- U1: A phone user opens the settings and sees the theme as three icons in one row next to «Тема», and the hour format as `12` `24` next to «Формат времени». The zone label and language groups are visible without scrolling.
- U2: A screen reader user reaches the theme radio group «Тема», hears the checked option «Системная» and moves the choice with the arrow keys, as before.
- U3: A mouse user hovers the moon icon and sees the hint "Dark".
- U4: A developer adds a future single-choice setting by passing a caption and options to the option group.

## Requirements

### Functional

- FR1: The theme options show no visible text. System shows a monitor icon, Light a sun icon and Dark a moon icon. Each option keeps its name, "System" / «Системная», "Light" / «Светлая», "Dark" / «Тёмная», as its accessible name and as a pointer hint.
- FR2: The theme options come in the order System, Light, Dark: on screen, in the document and for the arrow keys.
- FR3: The theme preference behaves as before. Without a stored choice, System is checked. Choosing an option applies its theme at once and stores the same value as before (`SYSTEM`, `LIGHT`, `DARK`). System follows changes of the system color-scheme preference. A stored theme is applied before the header first appears.
- FR4: The hour format options show the text pictograms `12` and `24`, the same in every interface language, in this order. They are named "12-hour" / «12 часов» and "24-hour" / «24 часа», with the same name as a pointer hint. The hour format behaves as before: 24-hour by default, applied at once to every time text, stored as `H12` / `H24`.
- FR5: The theme group and the hour format group each show their caption and their options in one row.
- FR6: Both groups are built from one reusable option group. It takes a caption, any number of options and the chosen value. Each option has a value, a name, and either an icon or a pictogram; with neither, its name is shown as text. The group reports each choice the user makes. A later setting can use it with other options and no new component. The option group and the toggle group share one row layout.

### Non-Functional

#### Performance

None: the change replaces the markup of two groups and adds no computation.

#### Accessibility

- NFR-A1: Each group is a radio group named by its visible caption ("Theme" / «Тема», "Hour format" / «Формат времени»), with the checked option exposed as checked. Each group is one Tab stop, and the arrow keys move the choice in the visual order. Every option is at least 44 × 44 px and shows a visible focus outline when focused with the keyboard.
- NFR-A2: The checked option is marked by a fill in the accent colour, with its icon or pictogram in the accent foreground colour. The unchecked options keep the surface colour, so the mark is a change of fill, not of hue alone. axe-core reports no violations on the settings page in the light and the dark theme.
- NFR-A3: The visible pictogram of each hour format option is part of its accessible name (`12` in "12-hour" and «12 часов», `24` in "24-hour" and «24 часа»), so voice control users can say what they see (WCAG 2.5.3 Label in Name).

#### Responsive

- NFR-R1: At 320, 375, 1024 and 2560 px, in English and in Russian, the caption and the options of the theme group share one row, and so do those of the hour format group. The settings page does not scroll horizontally at 320 px or 2560 px.
- NFR-R2: The approved settings screenshots (375 px and 1024 px in both themes, and the 375 px language screenshots) are re-approved once for this change.

## UX Acceptance Criteria

- UX1: The theme and hour format groups read like the zone label group: caption at the start of the row, controls at the end.
- UX2: The checked option is visible at a glance as a filled segment. Unchecked options are outlined segments of the same size. Choosing another option moves nothing.
- UX3: The options of one group sit together as one joined control, so they read as one choice. The toggle group's separate toggle buttons read as independent switches.

## UI States Matrix

The groups show local preferences and load nothing. Their states are those of the settings page and do not change:

| Network | Data | UI |
|---|---|---|
| any (online or offline) | no stored preferences | System and 24-hour checked (FR3, FR4) |
| any | stored preferences | the stored choices checked |
| any | stored document unreadable | unreadable note with Reset above the groups; defaults checked; unchanged |
| any | storage unavailable / save failed | save-failed note; choices still apply in memory; unchanged |

There is no loading state: preferences are read synchronously before the page is shown. There is no empty state: both groups always have their options.

## Behavior

- New `packages/client/src/test/features/settings/settings_option_group_unit.feature` and `settings_option_group_e2e.feature` (`@compact-settings-controls`).
- Changed scenarios in `packages/client/src/test/features/settings/settings_e2e.feature` and `settings_language_e2e.feature` (`@compact-settings-controls` added to the screenshot outlines and the scenarios whose steps change).

## Visual Reference

No Figma. Colours come from the design tokens `--color-accent`, `--color-accent-foreground`, `--color-surface` and `--color-border`. The layout follows the existing toggle group (`SettingsToggleGroup`).

## Affected IA

No changes.

## Success Metrics

- M1: At 375 px, in both languages, the theme group and the hour format group are each at most 56 px high, down from three and two option rows of at least 44 px plus a caption row. That makes 4 of 4 measurements at most 56 px.
- M2: 5 of 5 options (3 theme, 2 hour format) keep their accessible names in 2 of 2 interface languages, 10 names in all, and the theme options come in the order System, Light, Dark in 2 of 2 languages.
- M3: axe-core reports 0 violations on the settings page in 2 of 2 themes, and the checked option's fill equals the accent token in 2 of 2 themes.
- M4: The 8 existing behaviour scenarios of the two settings are unchanged in their text and pass: "Dark on a light system", "Light on a dark system", "System follows a change of the system preference", "Stored Dark on a light system", "Switching to 12-hour" and "Choices survive a reload" in `settings_e2e.feature`, and both scenarios of `settings_view_contract_e2e.feature`.

## Open Questions

None. The choice between text pictograms and icons for the hour format is settled in `design.md` (D2).

## Impact

- `packages/client/src/app/settings/` (`SettingsOptionGroup.tsx` rewritten, `SettingsToggleGroup.tsx` shares the row layout, `SettingsPage.tsx`, `index.ts`), `src/constants/preferences.ts` (display order, pictograms, shared row classes).
- Tests: `src/app/settings/SettingsOptionGroup.test.tsx` (new), `SettingsPage.test.tsx`, the new option group features and steps, `settings_e2e.feature` steps, and the approved settings screenshots.
- `docs/glossary/settings.md`, `docs/architecture/views.md`.
- No new dependency, no stored data change, no locale change.
