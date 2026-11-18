# Redesign: target screens

Target look of the Cards and Grid views after the redesign agreed with the owner on 18–19 November 2026. Nothing here is built yet. The approved screens in [`../screens`](../screens) and the "Visual style" section of [views.md](../../architecture/views.md) still describe the app as it is.

Each change that builds a part of the redesign:

- takes its sizes, colours and behaviour from [spec.md](spec.md) and from the screens below, and invents nothing beyond them;
- updates [views.md](../../architecture/views.md), the glossary and the stable specs for its part;
- moves the screens it has built from `redesign/screens` to `../screens`, replacing the old ones.

When the last change is archived, this folder is removed.

Russian summary of the decisions for the owner: the project document `claude/redesign-decisions.md`.

## How to read a screen

Every screen is a PNG (2x) and a self-contained HTML file. The HTML starts with a `:root` block that lists the design tokens of that screen (theme and day palette), then one stylesheet shared by all screens. Open it in a browser to inspect sizes, spacing and colours. The only external dependency is the Manrope font from Google Fonts. The PNG is the `#screen` element of the HTML.

Icons carry `data-lucide="<name>"`: the name of the Lucide icon to use.

## Sample data

The sample of [`../README.md`](../README.md): Sunday, 8 March 2026, 12:30 in Almaty, pinned; Almaty (home), Moscow (−2 h), Kolkata (+0:30), New York (−9 h, EDT). The day tracks, hour labels and hour cells are the values the app computes for that moment (commit `aa7310d`). The edge-case screens use other cities; their day tracks are illustrative.

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
| Desktop, UTC | [PNG](screens/grid-desktop-utc-dark.png) · [HTML](screens/grid-desktop-utc-dark.html) | accent hour cells of UTC |
| Tablet, landscape | [PNG](screens/grid-tablet-light.png) · [HTML](screens/grid-tablet-light.html) | 1180 px |
| Phone, portrait | [PNG](screens/grid-phone-portrait-light.png) · [HTML](screens/grid-phone-portrait-light.html) · [dark PNG](screens/grid-phone-portrait-dark.png) · [dark HTML](screens/grid-phone-portrait-dark.html) | nine cells, two-line row header |
| Phone, meeting | [PNG](screens/grid-phone-portrait-meeting-light.png) · [HTML](screens/grid-phone-portrait-meeting-light.html) | the meeting on a phone |

## Settings

| Screen | Files | Shows |
|---|---|---|
| Colours group | [PNG](screens/settings-palette-light.png) · [HTML](screens/settings-palette-light.html) | where the new group stands. Only its place and its two options are the target; the look of the other groups stays as built |

## Not covered

Search, calendar, the rest of the settings page, empty, error and offline states keep their built look; they take the new tokens of [spec.md](spec.md) and nothing else.
