# Design: Make the location menu button vertical

## Context

Driven by FR1–FR5, NFR-A1, NFR-R1 and UX1 of the proposal. The concept is the **Location menu** (`docs/glossary/locations.md`). Its *Code:* owner is `LocationMenu` (`packages/client/src/views/shared/LocationMenu.tsx`), a shared block that both views use through `LocationRow` → `ZoneRowContent` (the `menu` slot after `LocalDateTime` in the time group). This change extends that owner and adds no second one.

The code today:

- The trigger renders `<span aria-hidden="true">{LOCATION_MENU_TRIGGER_GLYPH}</span>`. The constant is `"⋯"` in `src/constants/locations.ts` and is re-exported from `src/constants/index.ts`. The button classes are `flex min-h-11 min-w-11 … text-xl font-bold`, so the box is 44 × 44 px. The root is `<span className="relative inline-flex">`, and in Cards the open menu is `absolute right-0 top-full` of that root. In Grid it is fixed to the viewport by `useFixedMenuPosition`.
- `TIME_GROUP_CLASS_NAMES` in `src/views/shared/locationRowVariant.ts` is `"ml-auto flex shrink-0 items-center gap-x-3.5 md:order-4 md:ml-0"`. Cards and Grid both use it. So after the time come a 14 px gap and the 44 px box, 58 px in total.
- The side padding is 13 / 15 / 18 px for narrow cards and 20 px for wide cards (`tailwind.config.ts`: `card-side-small`, `card-side`, `card-side-large`, `card-wide-x`). Grid rows use `GRID_ROW_PADDING_PX = 16` (`src/constants/grid.ts`).
- `lucide-react` (`^0.577.0`) is a dependency, and views already import icons from it (`LocationMarkIcon`, `MeetingBar`, `CalendarMonthGrid`). The design screens name Lucide icons by `data-lucide` (`docs/design/README.md`). They show the button as `data-lucide="ellipsis"` in 29 HTML files.
- The README images are `docs/design/screens/{cards-phone-light,cards-phone-dark,cards-tablet-light,grid-desktop-light,grid-desktop-meeting-dark}.png`. Each PNG is the `#screen` element of its HTML at 2x. No script in the repository renders them today.

## Goals / Non-Goals

Goals: one shared change in `LocationMenu` and the time group, so both views get it at once (ADR-0002 "Views share building blocks … no per-view duplicates"; ADR-0005 shared blocks in `views/shared/`).

Non-Goals: no change to the model, the presenter or the controller. The button gets no new props.

## Decision

### D1. Lucide `EllipsisVertical` icon instead of a text glyph (FR1, NFR-A1)

`LocationMenu` renders `<EllipsisVertical aria-hidden="true" size={LOCATION_MENU_ICON_SIZE_PX} />` from `lucide-react` in place of the glyph span. `LOCATION_MENU_ICON_SIZE_PX = 20` is a new constant in `src/constants/locations.ts`, exported through `src/constants/index.ts`. `LOCATION_MENU_TRIGGER_GLYPH` is removed, since nothing else uses it. The classes `text-xl font-bold` go, and the icon uses `currentColor`, so the disabled `opacity-40` dims it as before (UX2). The accessible name stays `t("locations.locationMenu", { city })`, so no i18n key changes.

Alternatives: the text glyph «⋮» (U+22EE) in the constant. Rejected: how the dots look depends on whether the app font has the glyph or which fallback font each engine picks, so their size and position could differ between engines (iOS Safari 12.5 is supported, ADR-0009). It would also not match the Lucide icons that the design screens name.

### D2. Keep the 44 × 44 hit area and let it reach into the row padding (FR2, FR3, UX1)

- The time group loses its gap: `gap-x-3.5` is removed from `TIME_GROUP_CLASS_NAMES`. The group holds only `LocalDateTime` and the menu, so no other spacing changes.
- The menu root span gets `-mr-3`, a 12 px negative right margin. The 44 px box then ends 12 px into the side padding, which is always at least 13 px (cards) or 16 px (Grid). It stays inside the card's border box and the Grid panel.
- The time-to-content-edge distance becomes 44 − 12 = 32 px (FR2, M1). The dots' centre sits 22 px right of the time's right edge and 10 px left of the content edge. From the dots to the row border that is 10 + padding + 1 px border: 24–31 px for cards, 27 px for Grid. The difference from the 22 px on the time side is at most 9 px, which meets UX1's ≤ 10 px.
- The hit area starts right at the time's right edge, so it overlaps nothing (FR3).
- The Cards menu stays `right-0` of the root, so it moves 12 px right and stays inside the card padding. The Grid menu is unchanged.
- "Right content edge" means: for a card, the card box minus its right border and right padding (computed style). For Grid, the sticky header box (`STICKY_BOX_CLASS_NAMES`, width `calc(var(--grid-panel-width) - 2*var(--grid-row-padding))`), which ends one row padding before the panel edge.

Alternatives:

- (a) Shrink the hit area to 24 px wide (the WCAG 2.5.8 minimum). Rejected: it breaks the "at least 44 × 44 px" of the `locations` spec and NG2.
- (b) Keep the 44 px box but widen the hit area with a pseudo-element over the gap. Rejected: the hit area would cover the time, which is the wall-time input button in Cards (FR3).
- (c) Keep the 14 px gap. Rejected: that gives 46 px, which misses FR2.

### D3. Re-render the design screens with a script (FR5)

- The 29 HTML files with `data-lucide="ellipsis"` get the Lucide `ellipsis-vertical` SVG. Its three circles are at `cx="12"` and `cy` 5 / 12 / 19: the circles of today's `ellipsis` markup, turned upright. The width and height are 20.
- The `.menu-button` rules of the shared stylesheet in those files are adjusted so the dots' centre sits 22 px right of the time and 10 px left of the content edge, as in D2.
- The new script `packages/client/scripts/designScreens/renderDesignScreens.ts` is exposed as `design:screens` in `packages/client/package.json`. It opens each named HTML file (all files when none is given) in Playwright Chromium with `deviceScaleFactor: 2` and writes the `#screen` element to the PNG of the same name.
- The script serves Manrope locally: it routes the `fonts.googleapis.com` stylesheet request to an `@font-face` for family `Manrope` built from `@fontsource-variable/manrope` (already a dependency), and blocks other network requests. So the render works offline and gives the same result on every run.
- The script refuses to write a PNG whose pixel size differs from the PNG it replaces.
- The logic is split from the CLI so it is unit-tested without a browser (`src/test/designScreens/renderDesignScreens.test.ts`), as `scripts/zoneRules/*` are tested in `src/test/zoneRules/`: `designScreenRequests.ts` decides each request (serve the font stylesheet, continue a `file:` URL, abort the rest) and builds the `@font-face`; `designScreenPng.ts` reads the PNG pixel size and runs the screens with an injected renderer and file access. `renderDesignScreens.ts` only wires Playwright and the file system.

Alternatives: hand-made screenshots, which cannot be repeated and are a human step (`handoff.md` "Automate first"). Leaving the PNGs stale breaks FR5.

## Risks / Trade-offs

- [The local Manrope build differs slightly from the Google Fonts one] → The PNG size check catches layout drift. H1 has a human glance at the five README images.
- [The negative margin could go past the padding if a padding token shrinks below 12 px] → The e2e "inside its card / the Grid panel" assertions fail first.
- [Screenshot baselines differ between machines] → `SCREENSHOT_MAX_DIFF_PIXEL_RATIO` (0.025 in `playwright.bdd.config.ts`) already covers that. Only baselines whose scenarios fail without `--update-snapshots` are re-taken.

## Migration Plan

None. This is view-only: nothing is stored and no schema changes. Rollback is reverting the commit.

## Consequences

Positive:
- Both views get the compact button from one shared change: `LocationMenu` and `TIME_GROUP_CLASS_NAMES`.
- The time, city and date get 26 px more of the first line (58 → 32 px), and the hit area stays 44 × 44 px.
- The design screens can be rendered again with one offline command (`pnpm --filter @time-zones/client design:screens`, or `pnpm design:screens` inside `packages/client`).

Negative:
- The button's box reaches 12 px into the row padding. A future padding below 12 px would need another rule, and the e2e containment assertions guard this.
- Screenshot baselines and design PNGs churn once.

## Alternatives Considered

**Text glyph «⋮»**: rejected in D1, because it depends on fonts.
**24 px wide hit area**: rejected in D2 (a), because it breaks the 44 × 44 px rule.
**Pseudo-element hit area over the gap**: rejected in D2 (b), because it overlaps the time.
**Hand-made PNGs**: rejected in D3, because they cannot be repeated and need a human.
