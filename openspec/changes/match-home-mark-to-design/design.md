# Design: Match the home mark on location rows to the approved design

## Context

The proposal's FR1–FR4, UX1, UX2 and NFR-A1 ask for the screens' house: an accent outline, painted nowhere inside, with the glyph `M4 11l8-7 8 7v9H4z` on a 24-unit grid (`docs/design/screens/phone-light.html` and `phone-dark.html`, lines 112–120). The code today, in `packages/client/src/views/shared/LocationMarkIcon.tsx`:

```tsx
export const LOCATION_MARK_ICONS: Record<LocationMarkKind, LocationMarkIconDefinition> = {
  [LocationMarkKind.HERE]: { Icon: Navigation, isFilled: true },
  [LocationMarkKind.HOME]: { Icon: House, isFilled: false },
};
// …
<Icon aria-hidden="true" size={LOCATION_MARK_ICON_SIZE_PX}
      fill={isFilled ? "currentColor" : undefined} />
```

lucide-react builds the `<svg>` from its default attributes (`fill: "none"`, `stroke: "currentColor"`, `stroke-width: 2`, `stroke-linecap/linejoin: "round"`, `viewBox: "0 0 24 24"`) and then spreads the caller's props over them. An explicit `fill: undefined` therefore replaces `"none"`, and React drops the attribute. The house keeps the SVG default fill, black. The approved `home`-state screenshots show exactly that: a solid dark house in the light theme, and one that only looks hollow in the dark theme. lucide's `House` also draws a door path and rounded corners that the design does not have.

The layer rules stay as they are (`.claude/rules/architecture.md`, ADR-0002). The mark kind comes from the model (`getLocationMarkKind` in `model/locationMark.ts`), the texts from the presenter (`presentLocationMarks` in `presenter/locationMark.ts`), and the icon is a shared block in `views/shared/` (ADR-0005 "Shared blocks"). This change touches only that view block. It does not touch the model, the presenter, the locales or storage. No global decision is needed, so there is no ADR.

## Decision

### D1. The house glyph is the design's path, built with lucide's own factory (FR2, FR3, UX2)

`LocationMarkIcon.tsx` defines the design's house next to the icon record:

```tsx
import { createLucideIcon, type IconNode, Navigation } from "lucide-react";

/** The design's house: one closed outline, no door (docs/design/screens/phone-light.html). */
const HOME_MARK_HOUSE_ICON_NODE: IconNode = [
  ["path", { d: "M4 11l8-7 8 7v9H4z", key: "home-mark-house" }],
];

/** Implements FR2, FR3 of match-home-mark-to-design. */
const HomeMarkHouse = createLucideIcon("home-mark-house", HOME_MARK_HOUSE_ICON_NODE);
```

`LOCATION_MARK_ICONS[LocationMarkKind.HOME].Icon` becomes `HomeMarkHouse`, and the `House` import goes away. `HomeMarkHouse` is module-private: tests reach it through `LOCATION_MARK_ICONS` and the rendered markup, so `views/shared/index.ts` does not change. `createLucideIcon` returns a `LucideIcon`, so the record's type, the `size` prop and every lucide default stay the same. The defaults are the stroke in `currentColor`, which is the wrapper's `text-accent`, a stroke width of 2, round joins and a 24-unit `viewBox`. FR3 asks for exactly those. The path string is SVG geometry, copied once from the design file with a comment naming its source. It is not a business constant, so it stays next to the only icon that draws it, as lucide keeps its own icon nodes. The record entry's JSDoc gains `Implements FR2 of match-home-mark-to-design`.

### D2. Outline kinds pass an explicit `fill="none"` (FR1, FR4)

The component passes `fill={isFilled ? FILLED_ICON_FILL : OUTLINE_ICON_FILL}`. The two module constants are `FILLED_ICON_FILL = "currentColor"` and `OUTLINE_ICON_FILL = "none"`, with a JSDoc saying that `undefined` would drop lucide's default and paint the shape black. `isFilled` keeps its meaning, and the Here mark (`Navigation`, `isFilled: true`) is unchanged (FR4). Its JSDoc comment "(house, once home exists)" is corrected to "(house)".

### D3. Tests assert the rendered paint, not the icon library's class (G2)

The existing test asserts `toHaveClass("lucide-house")` and `not.toHaveAttribute("fill", "currentColor")`. The second passes with no fill at all, which is the bug. Both assertions are replaced:

- **Unit (jsdom, `LocationMarkIcon.test.tsx`):** the home `<svg>` has `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linejoin="round"`, `viewBox="0 0 24 24"` and width / height `18`. Its only drawn child is one `path` with `d="M4 11l8-7 8 7v9H4z"`. It has no `circle`, `rect`, `line`, `polyline` or `polygon`, and no second `path`.
- **Unit BDD (jsdom):** the same markup facts, read through the real app (`deviceTimeZoneWorld.tsx`).
- **E2E (real browser):** `getComputedStyle(svg).fill` is `"none"`, and the computed `stroke` equals the accent token resolved in the active theme. The token is resolved by `readTokenStyle(page, "stroke", "--color-accent")` from `test/features/time_selection/steps/timeSelectionE2eHelpers.ts`. The bounding box is 18 × 18 px. jsdom computes no inherited paint and applies no `prefers-color-scheme`, so the per-theme check needs the browser. ADR-0001: "vitest-cucumber runs in jsdom — no real focus, aria, layout".
- **Visual regression:** the 16 `home` and `travelling` baselines are re-approved. The other baselines must not change, which proves the Here mark and the rest of the row are untouched.

## Consequences

Positive:
- The house matches the design in both themes, and a regression back to a painted or library-shaped house fails three test levels.
- No new dependency, no new file in `src/`, no layer or type change. `LOCATION_MARK_ICONS` stays the one owner of mark icons.

Negative:
- One glyph is now drawn by the app rather than taken from the icon set, so a later lucide restyle does not reach it. That is intended, since the design owns the glyph.
- 16 screenshot baselines are re-approved in this change.

## Alternatives Considered

**Keep lucide `House` and only fix the fill**: the inside would no longer be black, but the door and rounded corners stay, which fails FR2 and UX1.

**A hand-written `<svg>` component**: it works, but it would repeat lucide's defaults (stroke, joins, `viewBox`, `aria-hidden` handling) and break the `LucideIcon` type of the record. `createLucideIcon` keeps one icon contract.

**Use a different lucide glyph (`HouseIcon` variants, `Home`)**: every lucide house has a door or inner line. None matches the design's single outline.
