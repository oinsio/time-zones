# Redesign: specification

Decisions of the owner for the redesign. Screens: [README.md](README.md). Where a screen and this document disagree, this document wins and the screen gets fixed. Sizes are CSS px.

## 1. Rules for every change

- The mock-ups the redesign started from were phone-only and decorative. Take nothing from them that is not written here.
- Behaviour stays as built unless this document changes it: search, calendar, settings page, wall-time input, meeting range, notices, device time location.
- Font stays Manrope; times use tabular figures.
- **Colours must be cheap to change.** Every colour is a design token defined once per theme; no colour value lives in a component. The day-period colours form named palettes (section 3) that can be swapped as a set. The dark theme values are written once: today `tokens.css` repeats them for the forced and the system dark theme, and that duplication goes. A later change may let the user edit each colour; nothing built now may block that.

## 2. Tokens

| Token | Light | Dark |
|---|---|---|
| Page background | `#f7f7f5` | `#0b1628` |
| Surface (card, grid panel, menu) | `#ffffff` | `#142136` |
| Card border (cards, grid panel and its dividers) | `#a9adb8` | `#647a98` |
| Control border (buttons, fields, settings groups, menu) | `#8a8a93` | `#6b7a99` |
| Control border, inactive Now | `#c9ccd4` | `#33415c` |
| Foreground | `#1c1c20` | `#f7f8fc` |
| Muted foreground | `#60616c` | `#9aaed1` |
| Accent | `#3159e7` | `#4dd5f4` |
| Accent foreground | `#ffffff` | `#0b1220` |
| Handle border | `#1c1c20`, 2 px | `#f8f9ff`, 3 px |

- The card border in the light theme has a contrast of 2.2:1 on white. That is accepted for cards only: a control keeps the darker control border (at least 3:1).
- The surface is one flat colour. No gradient on cards.
- Tokens not listed (notice, danger, meeting colours, midnight shade, non-working grey, muted fill) keep their values.

## 3. Day palettes

A new setting, the **day palette**, picks the colours of the four day periods. It has two values: **Vivid** (default) and **Muted**.

| Period | Vivid, light | Vivid, dark | Muted, light | Muted, dark |
|---|---|---|---|---|
| Night | `#a4afd4` | `#4c5efa` | `#a3afd3` | `#56679a` |
| Morning | `#f0c6b8` | `#ffc3a5` | `#f8cbbe` | `#e0b1a4` |
| Day | `#f8e5a0` | `#fff68e` | `#f8e6a6` | `#eedba3` |
| Evening | `#e8c7df` | `#fda9e9` | `#d4c6ee` | `#b9aadb` |

- Muted is today's palette. In the light theme the two palettes are close on purpose: the owner will tune Vivid later, and the mechanism must already work in both themes.
- Vivid night in the dark theme is `#4c5efa`: light digits (`#f7f8fc`) on it reach 4.6:1. Digits on morning, day and evening cells in the dark theme use `#0b1628`.
- The palette colours the day tracks of Cards and the hour cells of Grid, and only in the Time of day colouring. Plain (accent) and Working hours (accent and non-working grey) do not change.
- Settings: a group captioned «Цвета» / "Colours" directly under the colouring group, with the options «Яркие» / "Vivid" and «Приглушённые» / "Muted", built from the reusable option group. It is shown only while the colouring is Time of day, like the working hours row. The choice is stored with the other preferences and survives a restart.
- "Day palette" is a new glossary term; the change that builds it adds the entry.

## 4. Header

- Title at the left: 27 px, weight 700 (23 px up to 360 px wide).
- Add location ("+", Lucide `Plus`) and Settings (Lucide `Settings`, the gear) both at the right, in the accent colour in both themes, 27 px icons in 44 × 44 px targets. Tab order follows the visual order.
- No divider line under the header.
- The meeting bar keeps its built layout (centred title, Share and Clear at the right).

## 5. Location card, narrow (below 768 px)

- Card: surface, 1 px card border, radius 14 px, padding 10 / 15 / 11 px (side padding 18 px from 411 px wide); 12 px between cards; list side padding 13 px.
- Line 1: mark, city, offset difference; at the right the time, then the location menu button. City 24 px / 700; time 26 px / 700. From 411 px wide: city 26, time 28, second line 15 px. Up to 360 px wide: city 21, time 24, second line 13 px, card padding 13 px.
- Offset difference right after the city: 16 px / 600, muted.
- Location menu button ("⋯") on line 1, 14 px after the time; hit area 44 × 44 px.
- Line 2: the zone line at the left, the local date at the right; 14 px, muted. The date follows the interface language's conventions (Russian: lower case).
- Zone line: its parts are joined by a middle dot (` · `) with even spacing. When the line wraps, no dot is shown at the break: a line never starts or ends with a dot. The zone label setting still decides which parts are shown.
- Marks: home is Lucide `House`, Here is Lucide `MapPin`; 23 px, accent colour. The visible "here" caption is removed; the accessible labels stay.
- No drag handle (section 9).
- Line 3: the day track (section 7), 12 px under line 2.
- Wall-time hint and clock change note: the last element of the card, under the track, as built.

Growth rules:

- A long city wraps onto more lines; it is never cut and never ends in an ellipsis. The offset difference follows it.
- When the city and the time do not fit on one line, the time with the menu button moves to its own line at the right.
- The zone line wraps between its parts; the card grows.
- 12-hour format: the day half (`AM` / `PM`) is 14 px / 700, 4 px after the digits.

## 6. Location card, wide (from 768 px)

There are two card layouts only: narrow and wide. The built one-row layout (city, time and track in one row) is removed.

- Line 1: mark, city (26 px), offset difference and zone line (15 px) on one baseline; at the right the local date (15 px), the time (28 px) and the location menu button.
- Line 2: the day track across the card's content width, hour labels under it (12 px, muted, tabular; first under the left edge, last under the right edge, each on one line).
- Card padding 12 / 20 px; the other card values as in section 5.
- The content (header, list, date bar group) sits in a column of at most 1120 px, centred. The page no longer stretches to the full width.

## 7. Day track

- Real day periods by the sun, one reference day for every track, all handles at the same position: as built.
- Bar 12 px high, fully rounded, on every width.
- Visible handle: a 23 px circle filled with the surface colour of its card, with the handle border of section 2. Hit areas as built: slider at least 44 px high, handle 44 × 44 px.
- A location without day periods (UTC) keeps a plain accent bar in the Time of day colouring.

## 8. Date bar

- Background is the page background; no top line. It stays stuck to the bottom of the viewport, so it is not transparent.
- Arrows, date and Now form one centred group, as built. No divider before Now.
- Date: 16 px / 700, foreground colour, written by the language's conventions.
- Now: an outlined button, 44 px high, radius 13 px, 1 px control border, clock icon 18 px and label 16 px / 600. Active (pinned): foreground label. Inactive (live): inactive control border and muted label (5.7:1 light, 8.1:1 dark). Same place and size in both states. When it is active is unchanged.

## 9. Reorder

- No drag handle, in Cards and in Grid.
- The grab area is the place part of the row header: mark, city, offset difference, zone line. The time, the menu button, the day track and the hour cells are not part of it.
- Touch: hold 250 ms; a move of up to 5 px keeps the hold; a move before that scrolls the page. Mouse and pen: a drag starts after 4 px of movement; the cursor over the grab area is `grab`.
- The picked-up card is lifted (shadow, scale 1.02); the other cards make room before the drop.
- Text selection and the iOS long-press callout are off in the grab area.
- The location menu gains «Поднять выше» / "Move up" and «Опустить ниже» / "Move down" between the home action and Remove; the one that cannot apply is disabled. They are the keyboard way and the single-pointer alternative to dragging (WCAG 2.5.7). The built keyboard reorder through the handle is removed with the handle; announcements of a move stay.
- In Grid, while a meeting range is set, reorder stays locked.

## 10. Grid

- One panel: surface, card border, radius 14 px, dividers in the card border colour; in the 1120 px column from 768 px.
- Row header from 768 px: mark (20 px), city 22 px / 700, offset difference, zone line (14 px); at the right the date (14 px), the time 26 px / 700, the menu button. Below 768 px: city 20 px with the zone line under it; the time 24 px with the date under it.
- Hour cells: radius 5 px, 3 px apart, 15 px / 500 digits; 48 px high from 768 px, 38 × 44 px below. Colours by the day palette; hour frame, midnight cell, DST edge, meeting frame, handles and dimming as built.

## 11. Device time location and UTC

- Device time location: the Here mark, no caption, zone line «Время устройства · CET · UTC+1» ("Device time" in place of the country).
- UTC: zone line «Всемирное время» / "Universal Time" in place of the country. It is hidden by the country toggle of the zone label setting.

## 12. Regressions to keep out

Each was a defect fixed earlier; the redesign must not bring it back.

1. The handle covering the time or the menu button (`fix-day-track-handle-overlap-and-end-of-day`). In the wide card the track has its own line.
2. Day tracks of different widths in the 12-hour format (`fix-location-card-and-header-layout`). All tracks of the list have the same width, within 1 px.
3. Hour labels wrapping onto two lines or touching each other.
4. The handle filled with another colour than its card.
5. The wall-time hint changing the shape of its card. Hint and note stay last in the card.

## 13. Open points

- A truly vivid palette for the light theme: later, by the owner.
- The order of the changes is set by the factory tasks.
