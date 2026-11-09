# Views

Views are interchangeable interfaces over the same model ([ADR-0002](../adr/0002-model-presenter-swappable-views.md)). The user picks one in settings or leaves `AUTO`. Views are plugged in through the view registry ([ADR-0005](../adr/0005-view-registry.md)).

**Rollout:** Cards is the first view; Grid comes next. Everything else stays view-independent so that adding Grid is a registry entry plus its folder.

## Catalog

| View | Best for | Screens | Status |
|---|---|---|---|
| **Cards** | converting: large exact time per location | phone in portrait, any | first release |
| **Grid** | planning a meeting: see where working hours overlap and pick a meeting range ([ADR-0011](../adr/0011-meeting-range-in-grid-view.md)) | any; all 24 hours fit from about 830 px | next |
| **Auto** (default) | picks the registered view that fits the container width | any | first release (resolves to Cards) |

Future views reuse the same model, e.g. a compact world-clock list.

## Grid

The user picks Grid in settings to plan a meeting; Cards stays the view for reading and converting one moment. Screens: [docs/design](../design/README.md#grid).

All rows sit in one panel with dividers, so a frame can cross every row. Each row is a header line above a strip of hour cells aligned across all rows:

```
+---------------------------------------------------------------------------+
| :: ^ Almaty  Kazakhstan UTC+5                         Sun, 8 Mar 12:30 ... |
| [0][1][2][3][4][5][6][7][8][9][10][11]|12|[13][14] ... [22][23]            |
|---------------------------------------|--|--------------------------------|
| :: Moscow -2 h  Russia MSK UTC+3                      Sun, 8 Mar 10:30 ... |
| [22][23][MAR 8][1][2] ...         [9]|10|[11] ...                [21]      |
+---------------------------------------^-----------------------------------+
                               hour frame across all rows
```

- **Row header:** drag handle, home or here icon, city, difference, zone line; on the right the date with the day shift mark, the time and the location menu. On a narrow screen it takes two lines (city and zone line on the left, time and date on the right).
- **Hour cells:** one absolute hour of the reference day each, labelled with the location's local start hour (`9`, `9:30`), coloured by its day period. Where a location's local midnight falls the cell shows the date (`MAR` over `8`) instead of `0` and is shaded; the row of the reference zone shows a plain `0`, since its day always starts there. A DST offset edge is a dark line on the cell's left side.
- **Width:** all 24 cells when each is at least 32 px wide (desktop about 58 px, tablet 46 px, phone in landscape 33 px). Otherwise about 9 cells of 36–40 px (phone in portrait) and the strips of all rows scroll horizontally together.
- **Cell colouring:** by day period. A later setting may offer working hours only or no colouring.

### Hour frame and meeting frame

- **Hour frame:** a blue (accent) frame across all rows around the hour cell of the effective instant; its text in the cell is bold. While live it follows the current hour.
- **Meeting:** tapping a cell sets a one-hour meeting range, dragging across cells stretches it ([ADR-0011](../adr/0011-meeting-range-in-grid-view.md)). The frame turns green and spans the range, cells outside it are dimmed, and every row shows its local range in green (`23:00–01:00`).
- **Meeting handles:** green grips on the left and right side of the meeting frame, placed on different rows so both are easy to grab. They move the start and the end by the 15-minute track step; for assistive technology they are sliders (arrows ±15 min, Page Up / Page Down ±1 h, Home / End the day's ends).
- **Meeting bar:** while a meeting range is set the header turns green: the title «Встреча · 2 ч», then «Поделиться встречей» (Lucide `Share2`) and «Сбросить выбор встречи» (Lucide `X`). Clear returns the hour frame; the Now button also clears the range.
- **Layers:** hour cells, then the frame, then the row header texts and row notes, then the meeting handles. Text and notes have the surface background, so the frame breaks behind them and never covers them.

## Cards

Each row is a card with the exact time in large digits and a day track with a handle.

```
+------------------------------------------------------------+
| Almaty                                            15:30    |
| Kazakhstan | GMT+5                         Mon, 28 Sep     |
| ====-------==============(O)====-------====                |
+------------------------------------------------------------+
| Moscow                                            13:30    |
| Russia | MSK                               Mon, 28 Sep     |
| ======-------============(O)======-------==                |
+------------------------------------------------------------+
```

- Every track spans the same day: 00-24 of the reference zone ([ADR-0007](../adr/0007-reference-zone-and-device-time.md)). The track of each row is colored by that location's own day periods, so the colors shift by the offset while all handles stand at the same position.
- An offset change inside the day (DST) is a hard color edge on the track.
- Dragging any handle changes the reference moment; all handles move together.
- Phone: one card per row, text above the track. Tablet and wider: one full-width row per location — city and zone, then time and date, then the track with local hour labels (`22 · 04 · 10 · 16 · 22`).

```
+----------------------------------------------------------------------------+
| Moscow  -2 h        10:30      |===night===~morning~====work====~even~==|  |
| Russia | MSK        Sun, 8 Mar  22     04     10(O)   16     22           |
+----------------------------------------------------------------------------+
```

## Shared building blocks

Used by every view, implemented once in `views/shared/`:

| Block | Content |
|---|---|
| Row header | home icon (wins) or "here" icon (location arrow); city; difference from the reference zone (`−2 h`, `+0:30`, `0 h`); caption "here"; country and zone abbreviation or `GMT+N`; date with the day shift mark: «днём раньше» / «днём позже» in red before the date when the local date differs from the reference zone's |
| Location menu | «⋯» button with a hit area of 44 px; opens on click, so it works without Pointer Events; items "Make home" / "Clear home" and "Remove" |
| Device time location | a location of the list for the device zone; removable, reorderable, can be home; meta line "Device time · UTC+5" ([ADR-0010](../adr/0010-device-time-location.md)) |
| Time display | time of the reference moment in large digits: follows the clock in `LIVE`, shows the selected moment in `PINNED`; tap to type an exact time. The current time is not shown separately — an active Now button signals a pinned moment |
| Day-period colors | four pastel bands: night, morning, working hours, evening — from design tokens. Soft gradient transitions: 1 hour around night boundaries, 15 minutes around working hours, so 09:00 and 18:00 stay readable. Colors also differ in lightness, not only in hue |
| Midnight marker | cell or track mark with the new date, so day boundaries are visible per row |
| Now button | returns to `LIVE`; always shown, active when the moment is pinned, inactive and grey while live |
| Wall-time hint | shown in the card where a time was typed when the model reports `GAP` or `AMBIGUOUS`: "02:30 does not exist on this day — clocks moved forward. Showing 03:30." / "01:30 occurs twice — showing the first (UTC−4)."; stays until the next change; `role="status"` (polite); text comes from the presenter; hides the clock change note of its row |
| Clock change note | shown after the day track of a card whose zone changes its UTC offset within seven days of the date in the date bar: "On Oct 25 at 03:00 clocks will go back 1 h"; same place and look as the wall-time hint, but not a live region and not part of the row's accessible name; hidden in a row with a wall-time hint; text comes from the presenter |
| Date bar | bottom bar `[<] Mon, 28 Sep [>]  [Now]`: arrows switch to the previous / next day, tapping the date opens a calendar for distant dates; placed at the bottom for thumb reach. Grid uses the same bar |

## Visual style

Screens: [docs/design](../design/README.md). Values become design tokens.

- One layout for light and dark themes; only token values differ. The theme follows the theme preference (System by default).
- Font: Manrope; time uses tabular figures.
- Accent: `#2F5BD3` (light), `#5EC2E8` (dark).
- Inactive control (the Now button while live): fill `#E4E4E7` (light), `#2A3550` (dark), label in the muted foreground colour.
- Day track (pastel, 10 px on phones, 12 px on tablets):

| Period | Light | Dark |
|---|---|---|
| Night | `#A3AFD3` | `#56679A` |
| Morning | `#F8CBBE` | `#E0B1A4` |
| Working hours | `#F8E6A6` | `#EEDBA3` |
| Evening | `#D4C6EE` | `#B9AADB` |

- Grid (hour cells take the day-track colours above; in the dark theme digits on morning, working and evening cells use `#0F1729`):

| Element | Light | Dark |
|---|---|---|
| Meeting frame, meeting handles, meeting bar icons | `#00AA00` | `#3DD13D` |
| Meeting time text | `#008800` | `#5EDB5E` |
| Meeting bar background | `#E0F5E0` | `#13301D` |
| Day shift mark (danger colour) | `#B42318` | `#FF8A80` |
| Midnight cell shade | `rgba(24, 24, 27, 0.10)` | `rgba(15, 23, 41, 0.22)` |
| Cells outside a meeting | opacity 0.4 | opacity 0.4 |

## Overlays

| Overlay | Content |
|---|---|
| Search | full screen on phones, dialog on wide screens; input plus results as "City, Region, Country" (region once a richer source is added, [ADR-0006](../adr/0006-city-data-sources.md)); suggestions are shown before typing (never an empty screen) |
| Settings | the Gnomish Factory credit above the theme; theme (System, Light, Dark; icons only) and hour format (12 / 24); interface language (collapsible list of the locale registry); view mode later |

## View contract

Every view must pass the same BDD E2E scenarios:

- select a time, select a date, return to now;
- add and remove a location, set and clear home;
- see the device time location, and the "here" mark when a location matches the device zone;
- open settings and switch the theme and the hour format;
- show loading, error, empty and offline states;
- pass axe-core and be operable with Tab, Enter, Esc and arrows.

Grid also passes the meeting scenarios: set, resize, share and clear a meeting range.

## UI states

| State | When it happens | What the user sees |
|---|---|---|
| Loading | city search data is being loaded | skeleton in search results |
| Error | stored data is corrupted or city data failed to load | message with a recovery action (reset, retry) |
| Empty | no locations in the list | an explanation and the header "Add location" action |
| Offline | no network | the app works fully; no note is shown |
| Storage unavailable | private mode, quota | warning that changes will not be saved |

On first launch the list holds the device time location; after that the stored list is the truth, also when it is empty.
