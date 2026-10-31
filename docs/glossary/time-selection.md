# Glossary: Time selection

Choosing a time of day, and showing each location's day around the reference moment. Decisions: ADR-0003 (absolute hours), ADR-0007 (the day of the reference zone); detail in `docs/architecture/domain-model.md` ("Day periods") and `views.md` ("Cards"). See [README](README.md) for the entry format.

- **Reference day** — the span of absolute time from local midnight of the reference zone on the effective instant's date to the next local midnight. It is 23, 24 or 25 hours long. Every day track and hour cell spans it. *Code:* `ReferenceDay`, `getReferenceDay`. *Not:* a calendar date, and not the location's own local day. *Never:* current day, today (unless it is today).
- **Day track** — the horizontal bar on a card that spans the reference day, coloured by the location's day periods, with a handle at the reference moment. All handles stand at the same position, except a handle that is being dragged. *Code:* `DayTrack`, `presentDayTrack`. Its accessibility role is `slider`, and only in that sense is "slider" correct (`locations.timeSliderLabel` «Время — {city}»). *Never:* time slider, timeline, scrubber.
- **Handle** — the circle on a day track at the position of the reference moment. Dragging it, or tapping the track, selects a time. During a drag, the handle follows the pointer along the track. When released, it settles at the reference moment. *Not:* the drag handle of a card. *Never:* thumb, knob.
- **Time selection** — pinning the reference moment to an instant chosen on a day track: by pointer, tap or keys, rounded to a track step and clamped between the start of the reference day and the track end. *Code:* `SELECT_INSTANT`, `useTimeSelection`. *Never:* scrubbing, seeking.
- **Track step** — the 15-minute granularity of a time selection, counted from the start of the reference day. *Code:* `TRACK_STEP_MINUTES`.
- **Track fraction** — a position on a day track as a share 0–1 of the reference day's length. *Code:* `getTrackFraction`, `getInstantAtTrackFraction`.
- **Track value** — the minutes from the start of the reference day to the handle, exposed as the slider value; it ranges from 0 to the track end. *Code:* `getTrackValueMinutes`.
- **Track end** — the last minute of the reference day, one minute before its end in absolute time (23:59 in the reference zone). It is the right end of a day track, the maximum track value and the target of the End key. *Code:* `getTrackEndMinutes`. *Not:* the end of the reference day itself, which is the next local midnight.
- **Track move** — a keyboard step of the handle: next or previous step, an hour forward or back, the day's start or the track end. *Code:* `TrackMove`.
- **Day period** — the part of a location's local day: night (22:00–07:00), morning (07:00–09:00), working hours (09:00–18:00), evening (18:00–22:00). *Code:* `DayPeriod.NIGHT | MORNING | WORK | EVENING`, `getDayPeriod`. *Never:* business hours, office hours, daytime.
- **Day-period schedule** — the boundaries of the day periods, passed to `getDayPeriod` as a parameter. Constants in the MVP. *Code:* `DAY_PERIOD_SCHEDULE`.
- **Blend window** — the span around a day-period boundary where the two colours blend: 60 minutes around 07:00 and 22:00, 15 minutes around 09:00 and 18:00. *Code:* `BlendWindow`, `collectBlendWindows`.
- **Offset edge** — a hard colour edge on a day track where a UTC offset change inside the reference day moves the local time into another day period. *Code:* `OffsetEdge`, `collectOffsetEdges`.
- **Colour stop** — one position and day period of a day track's gradient. *Code:* `DayPeriodStop`, `getDayPeriodStops`.
- **Hour label** — a location's local time printed under its day track on wide screens, at the start, every 6 hours and at the end of the reference day (`22 · 04 · 10 · 16 · 22`). *Code:* `HourLabel`, `formatHourLabel`.
- **Hour cell** *(planned, Grid view)* — one absolute hour of the reference day in a grid row.
- **Midnight marker** *(planned)* — a mark with the new date where a location's local midnight falls on its track or row.
- **Wall-time input** — typing an exact wall-clock time in a location card. *RU:* «Ввести время». *Not:* a time selection, which is a choice on a day track in track steps. *Never:* time picker, time edit. *Code:* `SET_WALL_TIME`, `parseWallTimeInput`, `useWallTimeInput`, `WallTimeInput`.
- **Wall-time target** — the row a wall-time input was typed in: a location. It decides where the wall-time hint is shown. *Code:* `WallTimeTarget`.
