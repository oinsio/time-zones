# Screen Design

Approved screens of the **Cards** and **Grid** views and of the settings page, after the redesign of November 2026 ([views](../architecture/views.md)).

Screens are the visual target for development. Documents stay the source of truth: when a screen and a document disagree, the document wins and the screen gets fixed:

- behavior and rules — [views.md](../architecture/views.md), [domain-model.md](../architecture/domain-model.md), ADRs;
- colors, fonts, sizes — the "Visual style" section of [views.md](../architecture/views.md), implemented as design tokens (`packages/client/src/styles/tokens.css`).

The decisions of the redesign (tokens, day palettes, sizes, reorder) now live in [views.md](../architecture/views.md); the glossary names every term.

## How to read a screen

Every screen is a PNG (2x) and a self-contained HTML file. The HTML starts with a `:root` block that lists the design tokens of that screen (theme and day palette), then one stylesheet shared by all screens. Open it in a browser to inspect sizes, spacing and colours. The only external dependency is the Manrope font from Google Fonts. The PNG is the `#screen` element of the HTML.

Icons carry `data-lucide="<name>"`: the name of the Lucide icon to use.

## Sample data

The sample: Sunday, 8 March 2026, 12:30 in Almaty, pinned; Almaty (home), Moscow (−2 h), Kolkata (+0:30), New York (−9 h, EDT). The day tracks, hour labels and hour cells are the values the app computes for that moment (commit `aa7310d`). The edge-case screens use other cities; their day tracks are illustrative.

## Cards

| Screen | Files | Shows |
|---|---|---|
| Phone, light | [PNG](screens/cards-phone-light.png) · [HTML](screens/cards-phone-light.html) | narrow card, home mark, offset differences, zone line with dots, wall-time hint, date bar with an active Now |
| Phone, dark | [PNG](screens/cards-phone-dark.png) · [HTML](screens/cards-phone-dark.html) | the same with dark tokens and the Vivid palette |
| Phone, Muted | [dark PNG](screens/cards-phone-dark-muted.png) · [dark HTML](screens/cards-phone-dark-muted.html) · [light PNG](screens/cards-phone-light-muted.png) · [light HTML](screens/cards-phone-light-muted.html) | the Muted palette |
| No home, live | [PNG](screens/cards-phone-no-home-light.png) · [HTML](screens/cards-phone-no-home-light.html) · [dark PNG](screens/cards-phone-no-home-dark.png) · [dark HTML](screens/cards-phone-no-home-dark.html) | device time location with the Here mark and no caption, inactive Now, clock change note |
| Travelling | [PNG](screens/cards-phone-travel-light.png) · [HTML](screens/cards-phone-travel-light.html) | home is Almaty, the device is in Moscow |
| UTC | [PNG](screens/cards-phone-utc-light.png) · [HTML](screens/cards-phone-utc-light.html) · [dark PNG](screens/cards-phone-utc-dark.png) · [dark HTML](screens/cards-phone-utc-dark.html) | the UTC location: "Всемирное время" and a plain accent track |
| Location menu | [PNG](screens/cards-phone-menu-light.png) · [HTML](screens/cards-phone-menu-light.html) | the menu with Move up and Move down |
| Reorder | [PNG](screens/cards-phone-reorder-light.png) · [HTML](screens/cards-phone-reorder-light.html) | a card picked up by its place area, lifted, the others making room |
| Tablet | [PNG](screens/cards-tablet-light.png) · [HTML](screens/cards-tablet-light.html) · [dark PNG](screens/cards-tablet-dark.png) · [dark HTML](screens/cards-tablet-dark.html) | wide card at 820 px |
| Desktop | [PNG](screens/cards-desktop-light.png) · [HTML](screens/cards-desktop-light.html) · [dark PNG](screens/cards-desktop-dark.png) · [dark HTML](screens/cards-desktop-dark.html) | wide card in the 1120 px column at 1440 px |
| Edge cases, 390 px | [PNG](screens/cards-phone-edge-light.png) · [HTML](screens/cards-phone-edge-light.html) | long city, `+5:30`, long country, device time |
| Edge cases, 12-hour | [390 px PNG](screens/cards-phone-edge-12h-light.png) · [HTML](screens/cards-phone-edge-12h-light.html) · [320 px PNG](screens/cards-phone-320-edge-12h-light.png) · [HTML](screens/cards-phone-320-edge-12h-light.html) · [tablet PNG](screens/cards-tablet-edge-12h-light.png) · [HTML](screens/cards-tablet-edge-12h-light.html) | small AM/PM, the time dropping under a long city at 320 px, 12-hour hour labels |

## Grid

| Screen | Files | Shows |
|---|---|---|
| Desktop | [PNG](screens/grid-desktop-light.png) · [HTML](screens/grid-desktop-light.html) · [dark PNG](screens/grid-desktop-dark.png) · [dark HTML](screens/grid-desktop-dark.html) | panel in the 1120 px column, row header without a drag handle, hour frame, clock change note |
| Desktop, dark, Muted | [PNG](screens/grid-desktop-dark-muted.png) · [HTML](screens/grid-desktop-dark-muted.html) | hour cells in the Muted palette |
| Desktop, meeting | [PNG](screens/grid-desktop-meeting-light.png) · [HTML](screens/grid-desktop-meeting-light.html) · [dark PNG](screens/grid-desktop-meeting-dark.png) · [dark HTML](screens/grid-desktop-meeting-dark.html) | meeting bar, meeting frame, handles, day shift mark |
| Meeting move, phone | [top](screens/grid-meeting-move-phone-top-light.png) · [middle](screens/grid-meeting-move-phone-middle-light.png) · [bottom](screens/grid-meeting-move-phone-bottom-light.png) · [moving](screens/grid-meeting-move-phone-moving-light.png) | sticky meeting bar, move handle on the frame line or the bar line, lifted look (PNG from the browser screenshot; no HTML) |
| Meeting past midnight | [phone](screens/grid-meeting-tail-phone-light.png) · [desktop, dark](screens/grid-meeting-tail-desktop-dark.png) | the strip tail with the midnight cell (PNG from the browser screenshot; no HTML) |
| Desktop, UTC | [PNG](screens/grid-desktop-utc-dark.png) · [HTML](screens/grid-desktop-utc-dark.html) | accent hour cells of UTC |
| Tablet, landscape | [PNG](screens/grid-tablet-light.png) · [HTML](screens/grid-tablet-light.html) | 1180 px |
| Phone, portrait | [PNG](screens/grid-phone-portrait-light.png) · [HTML](screens/grid-phone-portrait-light.html) · [dark PNG](screens/grid-phone-portrait-dark.png) · [dark HTML](screens/grid-phone-portrait-dark.html) | nine cells, two-line row header |
| Phone, meeting | [PNG](screens/grid-phone-portrait-meeting-light.png) · [HTML](screens/grid-phone-portrait-meeting-light.html) | the meeting on a phone |

## Settings

| Screen | Files | Shows |
|---|---|---|
| Settings, Time of day | [PNG](screens/settings-phone-light.png) · [HTML](screens/settings-phone-light.html) · [dark PNG](screens/settings-phone-dark.png) · [dark HTML](screens/settings-phone-dark.html) | the Colours group under the colouring group, with the palette swatches |
| Settings, Working hours | [PNG](screens/settings-phone-working-hours-light.png) · [HTML](screens/settings-phone-working-hours-light.html) | no Colours group; the working hours row stands in its place, as built |

The settings screens copy the built page with the new tokens. Only the Colours group is new.

## Proposals

Proposed changes that are not approved yet live apart from the approved screens:

- [Sharing, moving and extending the meeting range](proposals/meeting-range/README.md) — the share window, a meeting range past midnight, moving the whole range (November 2026). Part 1, the share window, is in change `add-meeting-share-dialog`; parts 2 and 3, the range past midnight and the move of the whole range, are in change `move-meeting-range-and-extend-past-midnight`.

## Before the redesign

Three Grid screens have no redesigned counterpart and still show the layout before the redesign (a drag handle, a "here" caption, the old header): [tablet, meeting](screens/grid-tablet-meeting-light.png), [phone in landscape](screens/grid-phone-landscape-light.png) and [phone in landscape, meeting](screens/grid-phone-landscape-meeting-light.png). Their sizes and colours are superseded by [views.md](../architecture/views.md).

## Not covered

Search, calendar, the rest of the settings page, empty, error and offline states keep their built look; they take the new tokens of [views.md](../architecture/views.md) and nothing else.
