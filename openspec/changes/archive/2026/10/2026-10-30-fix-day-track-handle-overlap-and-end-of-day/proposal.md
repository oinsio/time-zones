# Fix day track handle overlap and end of day

Builds on the archived `add-time-sliders-to-location-cards`, `show-here-entry-for-device-time` and `add-wall-time-input-with-hint`, which are all on `main`. No active change touches the `time-selection` capability, so nothing blocks this change.

## Why

The day track has two defects that users of the Cards view see:

1. **The handle covers the time on wide screens.** From 768 px the track sits right of the time column, only the card gap (12 px) away. The handle's centre stands on the track's left edge at the start of the reference day, so the 32 px visible handle reaches 16 px past that edge and covers the last digits of the time. At the end of the day it covers the location menu button the same way.
2. **The track stops at 23:45.** A time selection is clamped to the last 15-minute track step before the day's end. On any day the right end of the track, the End key and the slider maximum (1425) give 23:45. The last quarter of an hour of the reference day cannot be selected, so the track does not cover the whole day from 00:00.

Audience: every Cards view user. Defect 1 affects screens 768 px and wider; defect 2 affects every width.

## What Changes

- MODIFIED `time-selection` "Select a time on a track": selections are clamped to the **track end**, the last minute of the reference day, instead of the last 15-minute step. A position that rounds to the end of the day pins 23:59 in the reference zone.
- MODIFIED `time-selection` "Move the handle with the keyboard": End goes to the track end. Next step and Page Up stop at it. Previous step from it goes to the day's last 15-minute step.
- MODIFIED `time-selection` "Accessible day tracks": the slider maximum is the track end (1439 on a 24-hour day, 1379 on 23 hours, 1499 on 25 hours).
- MODIFIED `time-selection` "Day track layout": from 768 px the handle stays inside its slider's hit area at both ends of the day and never covers the row's time or the location menu button. The hour labels follow the track's edges.
- No stored data changes. The reference moment is never stored (ADR-0003, ADR-0004). The track needs no network.

Glossary terms (`docs/glossary/time-selection.md`, delivered as handoff patch H1 because the implement stage writes only under `packages/`):

- NEW **Track end**: the last minute of the reference day, one minute before its end in absolute time (23:59 in the reference zone). It is the right end of a day track, the maximum track value and the target of the End key. *Not:* the end of the reference day itself, which is the next local midnight. *Code:* `getTrackEndMinutes`, which replaces `getLastTrackStepMinutes`.
- CHANGED **Time selection**: "clamped to the reference day" becomes "clamped between the start of the reference day and the track end".
- CHANGED **Track value**: ranges from 0 to the track end.
- CHANGED **Track move**: "the day's start or end" becomes "the day's start or the track end".
- Used as they are: day track, handle, track step, track fraction, hour label, reference day, reference zone, location menu, Here entry.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `time-selection`: MODIFIED "Select a time on a track", "Move the handle with the keyboard", "Accessible day tracks" and "Day track layout".

## Goals

- G1: Every minute of the reference day from 00:00 to 23:59 in the reference zone can be reached on a day track, by pointer and by keys.
- G2: From 768 px, no day track handle covers any other element of its row, at any position.

## Non-Goals

- NG1: Changing the 15-minute track step or the pointer's rounding to the nearest step. Only the clamp at the right end changes.
- NG2: Changing the layout below 768 px. There the track has its own line, and the handle at either end stays inside the card's padding without covering another element.
- NG3: Changing the wall-time input. It already accepts 23:59.
- NG4: New screens or a redesign of the track: its height, colours, the handle's size and the hit areas stay as they are. From 768 px the visible bar becomes 44 px shorter, so that the handle fits inside the slider's hit area (FR4).

## Users & Scenarios

- U1: On a laptop, a user drags the Almaty handle all the way left to see 00:00. The Almaty time stays readable next to the track.
- U2: A user planning a late call drags the handle all the way right, or presses End, and gets 23:59 instead of 23:45.

## Requirements

### Functional

- FR1: A time selection by pointer, touch or tap is clamped between the start of the reference day and the track end. A position that rounds to the end of the reference day pins the track end (23:59 in the reference zone on days of 23, 24 and 25 hours). Every other position keeps the rounding to the nearest 15-minute step.
- FR2: The End key pins the track end. Next step and Page Up stop at the track end. Previous step from the track end pins the day's last 15-minute step (23:45), and Page Down from it pins 23:00.
- FR3: The slider's maximum value is the track end in minutes since the start of the reference day: 1439, 1379 or 1499 on days of 24, 23 or 25 hours. The value at the track end is that maximum, and the value text reads `23:59` with the card's date.
- FR4: From 768 px, with the handle at the start of the reference day or at the track end, its 44 × 44 px hit area lies inside the slider's hit area. At least 12 px separate the visible handle from the row's time and from the location menu button. The track's left and right edges still mark the start and the end of the reference day, the handle's centre stays at the effective instant's position on the track, and the hour labels stand under the track's edges.

### Non-Functional

#### Performance

- NFR-P1: No change. Presenting the track end adds no date, time or region name formatter and no time zone transition lookup. The existing work bounds of "Time selection is fast" keep passing unchanged.

#### Accessibility

- NFR-A1: The page with tracks still has no axe-core violations in the light and dark themes. Each slider keeps its 44 px hit area, one Tab stop and a focus ring around its handle.

#### Responsive

- NFR-R1: The page with tracks does not scroll horizontally at 320, 768 and 2560 px.
- NFR-R2: The approved screenshots at 1024 px in both themes are re-approved with the new track geometry. The 375 px screenshots stay unchanged.

## UX Acceptance Criteria

- UX1: At 768 px and 1024 px, with the handle at either end of the day, the time digits and the location menu button are fully visible, and the handle does not touch them (at least 12 px of free space).
- UX2: Dragging a handle to the far right shows 23:59 in the reference zone's card, and every other card shows the same instant.

## UI States Matrix

The change adds no data loading. The existing states stay as they are:

| Network | Data | UI |
|---|---|---|
| offline or online | locations with known zones | tracks as specified here; nothing needs the network |
| offline or online | empty list | no track (only the Here entry's track, when shown) |
| offline or online | a zone the browser does not know | that row has no track; the others are unaffected |
| offline or online | stored list unreadable | the existing error state; no track |

## Behavior

`packages/client/src/test/features/time_selection/`, tagged `@fix-day-track-handle-overlap-and-end-of-day`:

- `time_selection_select_time.feature` (unit): track end by pointer and keys (FR1, FR2);
- `time_selection_day_track.feature` (unit): day lengths read from the track end (FR3);
- `time_selection_e2e.feature`: drag to the right end, End key, slider range (FR1, FR2, FR3, NFR-A1);
- `time_selection_layout_e2e.feature`: handle clear of the time and the menu (FR4, UX1, NFR-R1).

## Visual Reference

`docs/design/screens/tablet-light.png`: the track starts right of the time column with free space between them. Design tokens stay the source of truth.

## Affected IA

No changes.

## Success Metrics

- M1: 4 of 4 layout checks pass (768 px and 1024 px × start of day and track end). Each finds 0 px of overlap and at least 12 px of space between the visible handle and both the time and the location menu button.
- M2: The right end of the track pins 23:59 on 3 of 3 day lengths (23, 24, 25 hours). The slider maximum is 1379, 1439 and 1499 on those days.
- M3: Stryker scoped to `model/dayTrack.ts`, `presenter/dayTrack.ts` and `views/shared/DayTrack.tsx` scores at least 95% (minimum acceptable 90%).
- M4: The traceability loop of task 6.1 prints nothing: each of FR1–FR4, NFR-P1, NFR-A1, NFR-R1, NFR-R2, UX1, UX2 has at least one test tagged with this change.

## Open Questions

None.
