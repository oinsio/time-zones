# Make the location menu button vertical

## Why

The location menu button of every card and grid row shows three horizontal dots («⋯»). The glyph is wide, and the button with the gap before it takes 58 px of the first line of the row header: 14 px of gap after the time and a 44 px box. On a 320–411 px phone that space is taken from the city and the time, and the wide glyph needs extra space to stay clear of the time. Users of both views (Cards and Grid) are affected on every screen. Vertical dots («⋮») need far less width, so the button can be made compact without making its hit area smaller.

## What Changes

- MODIFIED `locations` — requirement "Location menu": the location menu button shows three vertical dots instead of «⋯». In both the Cards and the Grid view the button takes at most 32 px of the line after the time, and it overlaps nothing. Its 44 × 44 px hit area, items, keyboard behaviour and Grid lock do not change.
- Visual regression baselines (`packages/client/src/test/features/__screenshots__/`) that show a row header are approved again.
- The design screens in `docs/design/screens/` that show the location menu button get vertical dots. Their PNGs are rendered again, and the README screenshots (`README.md`, `README.ru.md`) are among them.
- Glossary: the **Location menu** term (`docs/glossary/locations.md`) changes «⋯» to «⋮». No new term is introduced. `docs/architecture/views.md` follows.

### Capabilities

#### New Capabilities

_None._

#### Modified Capabilities

- `locations`: requirement "Location menu" (glyph, room taken in the row header, no overlap).

## Goals

- G1: The location menu button takes at most 32 px (now 58 px) of the row header line after the time, in Cards and in Grid, at every supported width.
- G2: No element of a row header overlaps the button, and the button stays inside its row.
- G3: The screenshots that show the button (test baselines, design screens, README images) show the vertical dots.

## Non-Goals

- NG1: No change to the menu itself: items, order, look of the open menu, keyboard pattern, Grid lock and behaviour without Pointer Events stay as they are.
- NG2: The hit area does not shrink below 44 × 44 px.
- NG3: No change to the row header layout other than the space next to the button: sizes of the city, time, date and zone line stay.
- NG4: The three pre-redesign Grid screens (`grid-tablet-meeting-light`, `grid-phone-landscape-light`, `grid-phone-landscape-meeting-light`) are not redrawn. `docs/design/README.md` already marks them as superseded.

## Users & Scenarios

- U1: A phone user with a long city name in Cards sees more of the line for the city and the time, and the button no longer crowds them.
- U2: A Grid user planning a meeting sees the row header with a narrower button next to the time or the meeting time.
- U3: A reader of the README sees screenshots of the current look.

## Requirements

### Functional

- FR1: The location menu button of every card and grid row shows three dots stacked vertically. It shows no «⋯» and no other text. The dots are decorative: the button keeps its accessible name "Actions for <city>" / «Действия: <city>».
- FR2: In both views, the space from the right edge of the time (or the meeting time in Grid) to the right content edge of the row is at most 32 px. The button's hit area stays at least 44 × 44 px.
- FR3: The button's hit area does not overlap the time, the date, the city, the offset difference or the zone line of its row. It lies inside the row's border box (card) or inside the Grid panel. An open menu lies inside the screen.
- FR4: The visual regression baselines that show a row header are approved again with the vertical dots, and every screenshot scenario passes.
- FR5: Every design screen that shows the location menu button shows the vertical dots, and its PNG is rendered again from its HTML. This includes the five images shown in `README.md` and `README.ru.md`.
- FR6: The glossary entry **Location menu** and `docs/architecture/views.md` name the vertical dots «⋮».

### Non-Functional

#### Performance

None: the change adds no work to presenting rows (no change to the model or the presenter), so it has no performance requirement.

#### Accessibility

- NFR-A1: The rows in Cards and Grid have no axe-core violations with the new button. The button keeps its accessible name, `aria-haspopup="menu"` and its focus outline, and the icon is hidden from assistive technology.

#### Responsive

- NFR-R1: FR2 and FR3 hold for Cards at 320, 390, 411, 768, 1024 and 1440 px and for Grid at 390, 844, 1180 and 1440 px. This covers the 320 px case where the time drops under a long city.

## UX Acceptance Criteria

- UX1: The dots sit roughly midway between the time and the right border of the row (card border or Grid panel border). Measured from the centre of the dots, the distance to the time's right edge and the distance to that border differ by at most 10 px at every NFR-R1 width, so the spacing looks even. A human confirms the look once (H1).
- UX2: The dots are vertically centred on the first line of the row header and are in the foreground colour. In the Grid while a meeting range is set they are dimmed like the rest of the locked button, as today.

## UI States Matrix

The button is part of a row and has no data loading of its own. Each state of the list keeps today's behaviour.

| Network | Data | UI |
|---|---|---|
| online or offline | locations loading | no rows yet, so no button (unchanged) |
| online or offline | load error | the load error, no rows (unchanged) |
| online or offline | empty list | the empty state, no button (unchanged) |
| online or offline | rows present | each row shows the vertical-dots button (FR1–FR3) |
| online or offline | Grid with a meeting range | the button is locked and dimmed, with the same geometry (FR2, FR3, UX2) |

Offline changes nothing: the icon is part of the bundle.

## Behavior

- `packages/client/src/test/features/locations/locations_menu_button_e2e.feature` (`@make-location-menu-button-vertical`): geometry, overlap, open menu and axe-core in Cards and Grid.
- The existing screenshot features re-approved under FR4 (see `tasks.md`).

## Visual Reference

`docs/design/screens/` (after this change). The design tokens and `docs/architecture/views.md` stay the source of truth.

## Affected IA

No changes.

## Success Metrics

- M1: The distance from the time's right edge to the row's right content edge is ≤ 32 px (now 58 px) in 100% of the measured rows: 6 Cards widths and 4 Grid widths, 4 rows each.
- M2: The button box measures ≥ 44 × 44 px in 100% of the measured rows.
- M3: 0 overlaps between the button box and the time, date, city, difference or zone line boxes in the measured rows. 0 buttons stick out of their card or the Grid panel.
- M4: 0 axe-core violations in Cards and Grid at 390 px.
- M5: Every screenshot scenario (`grep -rl screenshot src/test/features --include=*_e2e.feature`, 11 features) passes without `--update-snapshots`. 0 design screen HTML files keep `data-lucide="ellipsis"`.
- M6: Scoped Stryker on the changed production files and on the testable design-screen script modules (`designScreenRequests.ts`, `designScreenPng.ts`) scores ≥ 95% (minimum 90%).

## Open Questions

_None._ The decisions are in `design.md`.
