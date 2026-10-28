# Design: Match the "here" mark on location rows to the approved design

## Context

FR1–FR4 and UX1–UX3 of the proposal ask for the screens' row header. It has an icon slot before the city (the arrow for "here", and later the house for home) and an accent "here" caption after the city. The current code carries one string through the layers:

- `model/deviceTimeZone.ts`: `isLocationInDeviceTimeZone(location, deviceTimeZoneId)` gives a boolean;
- `presenter/presentLocationRows.ts`: `LocationRow.deviceTimeZoneLabel` holds `translate("locations.deviceTimeZoneBadge")` or `""`;
- `views/shared/LocationRow.tsx`: when that label is not empty, renders a pill `<span id={badgeId} className="… rounded-full bg-accent … text-accent-foreground">` with `<Navigation aria-hidden size={BADGE_ICON_SIZE_PX} />` after the city, and names the `<li>` with `aria-labelledby="{cityId} {badgeId}"`.

A single string cannot say *which* mark a row has. So a home mark would need a second field and a second branch in the view. FR4 and G2 ask for the opposite. All layer rules follow `.claude/rules/architecture.md` and ADR-0002: the model returns enums, the presenter alone produces strings, and views render presenter output. ADR-0007 ("'Here' marker") defines the match rule. This change keeps that rule as it is.

## Decision

### D1. Mark kind is a model enum chosen by one selector (FR1, FR4)

New `model/locationMark.ts`:

```ts
/** Kinds of the leading mark of a location row. Implements FR4 of match-here-mark-to-design. */
export enum LocationMarkKind {
  HERE = "here",
}

/** The row's leading mark, or undefined. Implements FR1, FR4 of match-here-mark-to-design. */
export function getLocationMarkKind(
  location: Location,
  deviceTimeZoneId: string,
): LocationMarkKind | undefined
```

It returns `HERE` when `isLocationInDeviceTimeZone(location, deviceTimeZoneId)` is true. Otherwise it returns `undefined`. `model/index.ts` exports both. `isLocationInDeviceTimeZone` stays as it is and keeps its tests. The selector is the only place that decides a row's kind. The home change adds `HOME`, a home id parameter and the priority between the kinds here (proposal Q1). No caller changes shape for that.

### D2. The presenter turns the kind into a presented mark (FR3, FR4)

In `presenter/presentLocationRows.ts`, `deviceTimeZoneLabel: string` is replaced by:

```ts
export type PresentedLocationMark = {
  kind: LocationMarkKind;
  /** Accessible label: "You are here". */
  accessibleLabel: string;
  /** Visible caption after the city: "here"; empty when the kind has none. */
  caption: string;
};
// LocationRow gains: mark?: PresentedLocationMark  (undefined = no mark)
```

New `presenter/locationMark.ts` holds a table `LOCATION_MARK_TEXT_KEYS: Record<LocationMarkKind, { accessibleLabelKey: string; captionKey?: string }>`, with `HERE → { "locations.hereMarkLabel", "locations.hereMarkCaption" }`. It also holds `presentLocationMarks(translate): Record<LocationMarkKind, PresentedLocationMark>`. `presentLocationRows` calls `presentLocationMarks` once per call, before `locations.map`, as it does today with `deviceTimeZoneBadge`. Each row then picks `marks[kind]` or `undefined`. So no translation runs per row, and the formatter work bound (NFR-P1) does not change. `presenter/index.ts` re-exports `LocationMarkKind` (as it already does for `DayPeriod`) and the `PresentedLocationMark` type, so views never import `@/model`.

Because the table is typed `Record<LocationMarkKind, …>`, a new enum member does not compile until it has texts. The M3 test iterates `Object.values(LocationMarkKind)` and checks that each kind's label (and caption, where the kind has a caption key) is non-empty in both locales.

### D3. One leading slot and a caption in the row (FR1, FR4, UX1–UX3, NFR-A1)

New `views/shared/LocationMarkIcon.tsx`:

- `LOCATION_MARK_ICONS: Record<LocationMarkKind, { Icon: LucideIcon; isFilled: boolean }>`, with `HERE → { Navigation, isFilled: true }`. The exhaustive `Record` makes a new kind fail to compile without an icon. The house for home becomes `{ House, isFilled: false }` later, matching the outline house in `phone-travel.html`.
- `LocationMarkIcon({ mark, id })` renders `<span id={id} role="img" aria-label={mark.accessibleLabel} className="inline-flex shrink-0 text-accent">` around the icon. The icon gets `aria-hidden="true"`, `size={LOCATION_MARK_ICON_SIZE_PX}`, and `fill="currentColor"` when `isFilled`. The accessible name sits on the wrapper `span`, not on the `svg`. That way it does not depend on how `lucide-react` treats `aria-*` props on its icons.
- `views/shared/index.ts` exports `LocationMarkIcon`, so the unit BDD step that checks every kind's icon imports it through the module's index.

In `LocationRow.tsx`, the city line becomes:

```
[LocationMarkIcon if row.mark] [city span id=cityId] [caption span aria-hidden if row.mark?.caption]
```

- The caption is `<span aria-hidden="true" className="text-xs font-bold text-accent">`, with no background and no border (UX2). The city keeps `font-semibold` at body size, so it stays larger.
- The `<li>` is `aria-labelledby="{cityId} {markId}"` when there is a mark, and `cityId` otherwise. That gives "Almaty You are here" (NFR-A1). The order follows the spoken order "city, then mark", not the visual one.
- Without a mark nothing is rendered before the city, so the city starts the line (UX3).
- `BADGE_ICON_SIZE_PX` (12) is removed. `LOCATION_MARK_ICON_SIZE_PX = 18` (the screens' `width="18"`) goes into `constants/locations.ts` and is exported from `constants/index.ts`, as `.claude/rules/code-style.md` requires for sizes.
- `LocationRow.tsx` stays under 200 lines: the pill branch it loses is about as long as the slot and caption it gains.

Contrast (NFR-A2): the caption uses `--color-accent` on `--color-surface`. In light, `#2f5bd3` on `#ffffff` is about 5.9:1. In dark, `#5ec2e8` on `#16213a` is about 7.9:1. Both clear WCAG AA 4.5:1 for small text. No new token is needed.

### D4. Locale keys (FR2, FR3)

| Key | en | ru |
|---|---|---|
| `locations.hereMarkLabel` | You are here | Вы здесь |
| `locations.hereMarkCaption` | here | здесь |

`locations.deviceTimeZoneBadge` is removed from both files. The key-parity test `src/locales/locales.test.ts` keeps the two files in step.

### D5. Tests follow the new wording; old scenario names stay (M1, M5)

- The OpenSpec delta keeps the existing scenario titles that contain "badge" ("Badge follows changes of the list", "Row name includes the badge", …). `openspec validate` refuses a MODIFIED requirement that drops a scenario title of the current spec, and those titles are only labels. Their steps speak of the here mark.
- The step texts in `locations_device_time_zone_unit.feature` and `locations_clock_tick.feature` change from "shows the badge" / "shows no badge" to "shows the here mark" / "shows no here mark". In unit BDD, "shows the here mark" means the row contains an element whose text is exactly the caption (`within(row).getByText(caption, { exact: true })`), not a substring of the row text. It does not assert accessible names: per `.claude/rules/bdd-unit.md` and the specify rules, names, focus and layout belong in `*_e2e.feature`.
- The new unit feature checks DOM order: in the city line, the mark wrapper comes before the city span and the caption after it. This is document order, which jsdom can check. Visual position is covered by the re-approved screenshots.
- Screenshots: four states of the outline "Screenshot of the <state> state at <width> px in the <theme> theme" (`locations_ui_e2e.feature`) seed Almaty and Moscow (`locationsStates.ts`, `LIST_CITY_NAMES`), and the E2E device zone is `Asia/Almaty` (`playwright.bdd.config.ts`). Those are list, pinned, calendar and time-selected, × 2 widths × 2 themes × 2 projects = 32 baselines. They are re-approved once with `--update-snapshots` and then must pass without it.

## Consequences

Positive:
- The row matches `phone-no-home` and `phone-travel`.
- Home is a local addition: one enum member, one text-key entry, one icon entry and a selection rule. The compiler and the M3 test point to each one.
- No per-row translation is added, and the stored document does not change.

Negative:
- `LocationRow` model fixtures and expectations in 10 test files change (`deviceTimeZoneLabel: ""` is dropped; the mark is optional).
- 32 screenshot baselines change in one go.
- Some spec scenario titles keep the word "badge" (D5).

## Alternatives Considered

**Keep `deviceTimeZoneLabel` and only restyle the view**: smallest diff, but a home mark would then need a second string and a second view branch. That is the coupling the task asks to avoid (FR4).

**Two independent boolean flags (`isHere`, `isHome`) on the row**: allows both icons at once and leaves the priority to every view. The design shows one slot, so one kind per row (FR4).

**`aria-label` directly on the lucide `svg`**: `lucide-react` decides on its own when to drop its default `aria-hidden`. A wrapper `span` with `role="img"` keeps the accessible name under our control.
