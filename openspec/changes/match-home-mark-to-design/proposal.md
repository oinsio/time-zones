# Match the home mark on location rows to the approved design

## Why

The approved screens `docs/design/screens/phone-light.{html,png}` and `phone-dark.{html,png}` show the home mark on the Almaty row as a thin house **outline** in the accent colour: one closed line forming a pitched roof over two walls and a flat base, with no door and nothing painted inside (`phone-light.html`, lines 112–120: `fill: none; stroke: #2f5bd3; stroke-width: 2; stroke-linejoin: round`, path `M4 11l8-7 8 7v9H4z`; `phone-dark.html` is the same with stroke `#5ec2e8`). `phone-travel.html` and `tablet-light.html` use the same glyph.

The app draws something else. The approved screenshots of the `home` state (`packages/client/src/test/features/__screenshots__/chromium/Screenshot-of-the-home-state-at-375-px-in-the-light-theme.png`) show a **solid dark house** in the light theme. In the dark theme it looks like an outline only because its black fill blends into the dark card. The cause is in `packages/client/src/views/shared/LocationMarkIcon.tsx`. It passes `fill={isFilled ? "currentColor" : undefined}` to the icon. For the house (`isFilled: false`), the explicit `undefined` replaces the icon library's default `fill="none"`. The `<svg>` is left with no `fill` attribute, so the browser paints it with the SVG default, black. The glyph is also not the design's: lucide's `House` has a door and rounded corners.

The current requirement already asks for "a house icon outlined in the accent colour" (`openspec/specs/home-location/spec.md`, "Home mark"). The test meant to prove it (`views/shared/LocationMarkIcon.test.tsx`, "should draw the home mark as an outlined house in the accent color") only checks that `fill` is not `"currentColor"`, and it passes when there is no `fill` attribute at all. This change makes the requirement precise and makes the tests catch the defect.

Audience: every user who sets a home location. In the light theme they see a heavy black blob in place of the light accent outline the design calls for.

## What Changes

- MODIFIED (`home-location`, requirement "Home mark"): the house is the design's glyph, a single closed outline (pitched roof, two walls, flat base) with no door and no other inner line. Only its outline is drawn, in the accent colour of the active theme, and its inside is never painted, in light and dark themes alike. Its size, slot, accessible label, the absence of a caption and which row shows it are unchanged.
- Unchanged: the Here mark (filled location arrow, caption "here"), the precedence of home over here, the leading-mark slot, the stored document, the locale texts.
- Glossary: no new or changed terms. The change uses **Home mark** (`LocationMarkKind.HOME`, *RU:* «Домашнее место»), **Here mark** (`LocationMarkKind.HERE`) and **Shared block** (`docs/glossary/views.md`). The *Code:* owners stay the same: `LOCATION_MARK_ICONS` / `LocationMarkIcon` in `views/shared/LocationMarkIcon.tsx` for the icon, `LocationMarkKind` in `model/locationMark.ts` for the kind. The **Home mark** entry itself is pending as patch H1 of the archived change `set-home-location-and-show-differences`. This change does not alter its meaning or owner.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `home-location`: the requirement "Home mark" states the glyph, the outline-only drawing and the theme colour precisely, and gains scenarios for both themes.

## Impact

- `packages/client/src/views/shared/LocationMarkIcon.tsx`: the house glyph and the fill of outline kinds.
- Tests: `views/shared/LocationMarkIcon.test.tsx`; unit BDD `test/features/locations/locations_home_mark_unit.feature` and its steps; a new E2E feature `test/features/home_location/home_location_mark_e2e.feature` with its steps; tags on the existing a11y outline in `home_location_e2e.feature` and on the screenshot outline in `locations/locations_ui_e2e.feature`. 16 screenshot baselines are re-approved: states `home` and `travelling` × 375 / 1024 px × light / dark × `chromium` / `mobile-chrome`.
- No new dependency (`lucide-react` is already installed). No storage, locale, model or presenter change. No network.

## Goals

- G1: In both themes, 100% of home marks look like the design's house: an accent outline with nothing painted inside and no door.
- G2: A test fails when the home mark is painted inside or loses the design's glyph. Today no test does.

## Non-Goals

- NG1: The Here mark's glyph, colour or caption.
- NG2: The accessible label. The screens say «Домашняя локация», but the glossary names the concept «Домашнее место» and lists «локация» under *Never:* for a location in the interface (`docs/glossary/locations.md`, "Location"). Per `docs/design/README.md`, the document wins and the label stays «Домашнее место» / "Home location".
- NG3: Other differences between the cards and the screens: font sizes, padding, the meta line, the header, the bottom bar.
- NG4: Which row is home, how home is set, cleared or stored, and the precedence of home over here.
- NG5: The mark in search results or in views other than the shared row.

## Users & Scenarios

- U1: A user in the light theme makes Almaty home. Almaty shows a thin blue (`#2f5bd3`) house outline before the city, with the card's white surface inside it, as in `phone-light.png`.
- U2: The same user switches the system to dark. The outline turns light blue (`#5ec2e8`) and the dark card shows inside it, as in `phone-dark.png`.
- U3: A travelling user (home Almaty, device in Moscow) sees the house outline on Almaty and the filled arrow with "here" on Moscow, as in `phone-travel.png`.
- U4: A screen-reader user still hears the Almaty row as "Almaty Home location".

## Requirements

### Functional

- FR1: Only the home mark's outline is drawn. Its inside is never painted, so the row's surface shows through it, in the light and in the dark theme.
- FR2: The home mark's glyph is the design's house: one closed outline made of a pitched roof, two vertical walls and a flat base. It has no door, window, chimney or any other line inside or outside that outline.
- FR3: The outline is drawn in the accent colour of the active theme (`--color-accent`: `#2f5bd3` light, `#5ec2e8` dark) with rounded corners at the joins. Its line is as thick as the design's: 2 units on the icon's 24-unit grid.
- FR4: The Here mark keeps its filled location arrow in the accent colour. Fixing the house does not change it.

### Non-Functional

#### Performance

_None._ The glyph is static markup with no formatter, lookup or pass to count (ADR-0008), and the row's existing work bounds are unchanged.

#### Accessibility

- NFR-A1: The home mark stays one image named by its accessible label ("Home location" / «Домашнее место»). The drawn glyph stays hidden from assistive technology. axe-core reports no violations in the `home` and `travelling` states in both themes.

#### Responsive

- NFR-R1: The approved screenshots of the `home` and `travelling` states at 375 px and 1024 px in both themes show the outlined house and are re-approved. The screenshots of every other state stay unchanged.

## UX Acceptance Criteria

- UX1: The house reads like the screens' Almaty row: a light accent outline that is no heavier than the city text, never a solid shape, in both themes.
- UX2: The icon keeps its size (18 × 18 px, like the Here mark icon) and its place before the city name with the existing gap. It is centred on the city line.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | home set, some locations | the home row: accent house outline + city; other rows unchanged (FR1–FR3) |
| any | home set and in the device time zone | the home row shows the outlined house only, no arrow and no "here" (unchanged precedence) |
| any | home set, device elsewhere (travelling) | home row: outlined house; device-zone row: filled arrow + "here" (FR4) |
| any | no home | no row shows a house; Here marks unchanged |
| any | no locations | empty state unchanged, no mark |
| any | stored list unreadable | error with Reset unchanged; no mark |
| any | loading | none: the mark renders with its row; the view's existing loading state is unchanged |
| offline | any of the above | same behaviour: the glyph is part of the app bundle and needs no network |

## Behavior

Feature files under `packages/client/src/test/features/`, tagged `@match-home-mark-to-design`:

- `locations/locations_home_mark_unit.feature` (vitest-cucumber, jsdom) gains the scenario "The home mark is the design's outlined house". It checks the rendered markup: one closed outline shape, nothing painted inside, nothing else drawn (FR1, FR2), and the arrow of a Here mark still filled (FR4).
- New `home_location/home_location_mark_e2e.feature` (playwright-bdd, real browser) checks the computed paint per theme: no fill, an accent-coloured stroke, 18 × 18 px (FR1, FR3, UX1, UX2).
- The existing outline "Accessibility in the <state> state in the <theme> theme" (`home_location/home_location_e2e.feature`) and the scenario "Setting home is announced" gain `@match-home-mark-to-design @NFR-A1`.
- The screenshot outline in `locations/locations_ui_e2e.feature` gains `@match-home-mark-to-design @NFR-R1`. Its `home` and `travelling` baselines are re-approved.

## Visual Reference

[`phone-light`](../../../docs/design/screens/phone-light.html) and [`phone-dark`](../../../docs/design/screens/phone-dark.html): the house on Almaty. [`phone-travel`](../../../docs/design/screens/phone-travel.html) shows the house next to the "here" arrow. The colours come from the design tokens (`--color-accent` in `packages/client/src/styles/tokens.css`), not from the screens' inline values. The two agree today.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR4, NFR-A1, NFR-R1, UX1 and UX2 have at least one automated test tagged or commented with `match-home-mark-to-design`.
- M2: In the `home` state, the home mark's drawn glyph has the computed fill `none` and a computed stroke equal to the active accent colour in 2 of 2 themes (E2E, 2 checks).
- M3: The home mark's glyph has exactly 1 drawn shape and 0 painted fills. The Here mark's glyph is filled with `currentColor` (unit test, 3 assertions).
- M4: 16 of 16 screenshot baselines of the `home` and `travelling` states are re-approved and pass without `--update-snapshots`. 0 baselines of other states change.
- M5: The mutation score of `views/shared/LocationMarkIcon.tsx` is at least 95% (minimum 90%).

## Open Questions

_None._ The one conflict between the screens and the documents, the accessible label, is settled by `docs/design/README.md` ("the document wins") in NG2.
