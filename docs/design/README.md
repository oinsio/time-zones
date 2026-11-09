# Screen Design

Approved screens of the **Cards** view — the first view to build — and the **Grid** view, which comes next ([views](../architecture/views.md)).

Screens are the visual target for development. Documents stay the source of truth: when a screen and a document disagree, the document wins and the screen gets fixed:

- behavior and rules — [views.md](../architecture/views.md), [domain-model.md](../architecture/domain-model.md), ADRs;
- colors, fonts, sizes — the "Visual style" section of [views.md](../architecture/views.md), implemented as design tokens.

Each screen has a PNG (2x) and a self-contained HTML file with inline styles. Open the HTML in a browser to inspect sizes, spacing and colors with developer tools. The only external dependency is the Manrope font from Google Fonts.

## Sample data

All screens show the same moment so they can be compared:

- date: Sunday, 8 March 2026 — the day New York switches to daylight saving time;
- reference moment: 12:30 in Almaty (GMT+5), pinned;
- locations: Almaty, Moscow (−2 h), Kolkata (+0:30), New York (−9 h, EDT).

This one moment covers a :30 offset, a DST jump inside the reference day and the wall-time hint.

## Cards

| Screen | Files | Shows |
|---|---|---|
| Phone, light | [PNG](screens/phone-light.png) · [HTML](screens/phone-light.html) | home location (house icon), differences from home, day tracks on the shared reference day, wall-time hint, bottom date bar with Now |
| Phone, dark | [PNG](screens/phone-dark.png) · [HTML](screens/phone-dark.html) | the same layout with dark theme tokens |
| Tablet, light | [PNG](screens/tablet-light.png) · [HTML](screens/tablet-light.html) | one full-width row per location: city and zone, time and date, track with local hour labels |
| No home | [PNG](screens/phone-no-home.png) · [HTML](screens/phone-no-home.html) | derived Here entry for the device zone (location arrow, "here", "Device time"); differences from the device zone ([ADR-0007](../adr/0007-reference-zone-and-device-time.md)) |
| Travelling | [PNG](screens/phone-travel.png) · [HTML](screens/phone-travel.html) | home is Almaty, the device is in Moscow: Moscow gets the "here" mark, the reference day stays Almaty |

## What to read from the tracks

- Every track spans 00–24 of the reference zone, so all handles stand at the same position.
- Colors are the location's own day periods: night, morning, working hours, evening, with soft transitions.
- New York's track changes color abruptly at 12:00 Almaty time — the DST jump from EST to EDT.

## Grid

The Grid view in two states on every screen: the hour frame on the current hour, and a meeting range of 09:00–11:00 in Almaty ([ADR-0011](../adr/0011-meeting-range-in-grid-view.md)). The data is the sample above; the meeting starts the day before in New York.

| Screen | Now | Meeting |
|---|---|---|
| Desktop, light | [PNG](screens/grid-desktop-light.png) · [HTML](screens/grid-desktop-light.html) | [PNG](screens/grid-desktop-meeting-light.png) · [HTML](screens/grid-desktop-meeting-light.html) |
| Desktop, dark | [PNG](screens/grid-desktop-dark.png) · [HTML](screens/grid-desktop-dark.html) | [PNG](screens/grid-desktop-meeting-dark.png) · [HTML](screens/grid-desktop-meeting-dark.html) |
| Tablet, landscape | [PNG](screens/grid-tablet-light.png) · [HTML](screens/grid-tablet-light.html) | [PNG](screens/grid-tablet-meeting-light.png) · [HTML](screens/grid-tablet-meeting-light.html) |
| Phone, landscape | [PNG](screens/grid-phone-landscape-light.png) · [HTML](screens/grid-phone-landscape-light.html) | [PNG](screens/grid-phone-landscape-meeting-light.png) · [HTML](screens/grid-phone-landscape-meeting-light.html) |
| Phone, portrait | [PNG](screens/grid-phone-portrait-light.png) · [HTML](screens/grid-phone-portrait-light.html) | [PNG](screens/grid-phone-portrait-meeting-light.png) · [HTML](screens/grid-phone-portrait-meeting-light.html) |

The tablet and phones in the dark theme differ from the light screens only by the token values in [views.md](../architecture/views.md#visual-style).

What to read from the grid:

- All rows sit in one panel, so the hour frame and the meeting frame cross every row as one column.
- Desktop, tablet and phone in landscape fit all 24 hours; the phone in portrait shows 9 and scrolls all rows together.
- The midnight cell shows the date (`МАР 8`) in every row except the reference zone's, which starts with `0`.
- In the meeting state: the green meeting bar with Share and Clear, dimmed cells outside the range, local ranges in green, the meeting handles on different rows, and «днём раньше» for New York.
- The clock change note and the row header texts lie above the frame.

## Not covered yet

Search, settings, empty, error and offline states have no screens yet, in either view; build them from [views.md](../architecture/views.md) (Overlays, UI states).
