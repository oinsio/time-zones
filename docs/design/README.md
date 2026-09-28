# Design Mockups

Reference mockups of the **Cards** view — the first view to build ([views](../architecture/views.md)).

Mockups are a visual reference, not the source of truth. When a mockup and a document disagree, the document wins:

- behavior and rules — [views.md](../architecture/views.md), [domain-model.md](../architecture/domain-model.md), ADRs;
- colors, fonts, sizes — the "Visual style" section of [views.md](../architecture/views.md), implemented as design tokens.

Each screen has a PNG (2x) and a self-contained HTML file with inline styles. Open the HTML in a browser to inspect sizes, spacing and colors with developer tools. The only external dependency is the Manrope font from Google Fonts.

## Sample data

All screens show the same moment so they can be compared:

- date: Sunday, 8 March 2026 — the day New York switches to daylight saving time;
- reference moment: 12:30 in Almaty (GMT+5), pinned;
- locations: Almaty, Moscow (−2 h), Kolkata (+0:30), New York (−9 h, EDT).

This one moment covers a :30 offset, a DST jump inside the reference day and the wall-time hint.

## Screens

| Screen | Files | Shows |
|---|---|---|
| Phone, light | [PNG](mockups/phone-light.png) · [HTML](mockups/phone-light.html) | home location (house icon), differences from home, day tracks on the shared reference day, wall-time hint, bottom date bar with Now |
| Phone, dark | [PNG](mockups/phone-dark.png) · [HTML](mockups/phone-dark.html) | the same layout with dark theme tokens |
| Tablet, light | [PNG](mockups/tablet-light.png) · [HTML](mockups/tablet-light.html) | one full-width row per location: city and zone, time and date, track with local hour labels |
| No home | [PNG](mockups/phone-no-home.png) · [HTML](mockups/phone-no-home.html) | derived Here entry for the device zone (location arrow, "here", "Device time"); differences from the device zone ([ADR-0007](../adr/0007-reference-zone-and-device-time.md)) |
| Travelling | [PNG](mockups/phone-travel.png) · [HTML](mockups/phone-travel.html) | home is Almaty, the device is in Moscow: Moscow gets the "here" mark, the reference day stays Almaty |

## What to read from the tracks

- Every track spans 00–24 of the reference zone, so all handles stand at the same position.
- Colors are the location's own day periods: night, morning, working hours, evening, with soft transitions.
- New York's track changes color abruptly at 12:00 Almaty time — the DST jump from EST to EDT.

## Not covered yet

Search, settings, empty, error and offline states have no mockups yet; build them from [views.md](../architecture/views.md) (Overlays, UI states).
