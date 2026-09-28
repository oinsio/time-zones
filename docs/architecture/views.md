# Views

Views are interchangeable interfaces over the same model ([ADR-0002](../adr/0002-model-presenter-swappable-views.md)). The user picks one in settings or leaves `AUTO`. Views are plugged in through the view registry ([ADR-0005](../adr/0005-view-registry.md)).

**Rollout:** Cards is the first view; Grid comes next. Everything else stays view-independent so that adding Grid is a registry entry plus its folder.

## Catalog

| View | Best for | Screens | Status |
|---|---|---|---|
| **Cards** | converting: large exact time per location | phone in portrait, any | first release |
| **Grid** | planning: see where working hours overlap | desktop, tablet, phone in landscape | next |
| **Auto** (default) | picks the registered view that fits the container width | any | first release (resolves to Cards) |

Future views reuse the same model, e.g. a compact world-clock list.

## Grid

Each location is a header plus a strip of hour cells aligned across all rows. A selection frame crosses every row at the reference moment.

```
+------------------------------------------------------------+
| ^ Almaty                                          15:30    |
| Kazakhstan | GMT+5                         Mon, 28 Sep     |
| 10 | 11 | 12 | 13 | 14 |[15]| 16 | 17 | 18 | 19 | 20 | 21  |
|------------------------------------------------------------|
| -2 Moscow                                         13:30    |
| Russia | MSK                               Mon, 28 Sep     |
|  8 |  9 | 10 | 11 | 12 |[13]| 14 | 15 | 16 | 17 | 18 | 19  |
|------------------------------------------------------------|
| -5 UTC                                            10:30    |
| GMT+0                                      Mon, 28 Sep     |
| 23 |SEP |  1 |  2 |  3 | 4  | ...                          |
|    | 28 |                                                  |
|                          ^                                 |
|               selection frame across all rows              |
+------------------------------------------------------------+
```

- Narrow screens show 7-12 cells and scroll horizontally; all rows scroll in sync.
- Wide screens (desktop, landscape) show all 24 cells without scrolling.
- Tapping a cell selects its start instant; keyboard arrows move by 1 hour, with Shift by 15 minutes.
- A thin marker shows the current moment.

## Cards

Each location is a card with the exact time in large digits and a day-night track with a handle.

```
+------------------------------------------------------------+
| Almaty                                            15:30    |
| Kazakhstan | GMT+5                         Mon, 28 Sep     |
| ====-------==============(O)====-------====                |
+------------------------------------------------------------+
| Moscow                                            13:30    |
| Russia | MSK                               Mon, 28 Sep     |
| ======-------========(O)=========-------===                |
+------------------------------------------------------------+
```

- Dragging any handle changes the reference moment; all cards follow.
- Handles are not vertically aligned, so Cards are weaker for spotting overlap — use Grid for planning.

## Shared building blocks

Used by every view, implemented once in `views/shared/`:

| Block | Content |
|---|---|
| Row header | home icon or difference from home (`-2`, `-2:30`); city; country and zone abbreviation or `GMT+N`; date with a day-shift hint |
| Time display | time of the reference moment in large digits: follows the clock in `LIVE`, shows the selected moment in `PINNED`; tap to type an exact time. The current time is not shown separately — the Now control signals a pinned moment |
| Day-period colors | three bands: night, morning/evening, working hours — from design tokens, WCAG AA contrast |
| Midnight marker | cell or track mark with the new date, so day boundaries are visible per row |
| Now control | returns to `LIVE`; visible only when the moment is pinned |
| Date control | bottom bar `[<] Mon, 28 Sep [>]  [Now]`: arrows switch to the previous / next day, tapping the date opens a calendar for distant dates; placed at the bottom for thumb reach. Grid may reuse it or replace it with a day strip |

## Overlays

| Overlay | Content |
|---|---|
| Search | full screen on phones, dialog on wide screens; input plus results as "City, Region, Country" (region once a richer source is added, [ADR-0006](../adr/0006-city-data-sources.md)); suggestions are shown before typing (never an empty screen) |
| Settings | language (including dialects), hour format `12 / 24 / System`, view mode `Auto / Grid / Cards` |

## View contract

Every view must pass the same BDD E2E scenarios:

- select a time, select a date, return to now;
- add, remove and set home location;
- open settings and switch hour format, language and view mode;
- show loading, error, empty and offline states;
- pass axe-core and be operable with Tab, Enter, Esc and arrows.

## UI states

| State | When it happens | What the user sees |
|---|---|---|
| Loading | city search data is being loaded | skeleton in search results |
| Error | stored data is corrupted or city data failed to load | message with a recovery action (reset, retry) |
| Empty | all locations removed | explanation and an "Add location" action |
| Offline | no network | the app works fully; only a note when an update cannot be fetched |
| Storage unavailable | private mode, quota | warning that changes will not be saved |

On first launch the device time zone is added as the home location, so a new user never starts on an empty screen.
