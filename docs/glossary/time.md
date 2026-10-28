# Glossary: Time

How the app represents "when" and "where in time". Decisions: ADR-0003 (reference instant), ADR-0007 (reference zone and device time). See [README](README.md) for the entry format.

- **Instant** — an exact point on the time line, independent of any zone. Stored and exchanged as ISO 8601 with `Z`. *Code:* `Temporal.Instant`. *Not:* a local date and time, which needs a zone to become an instant. *Never:* timestamp in the model (only in storage), epoch.
- **Reference moment** — the one instant every location is shown at. It is in one of two modes, live or pinned, and it is never stored: the app always opens live. *Code:* `ReferenceMoment`. *Never:* selected time, current time (for the pinned case), cursor.
- **Live** — the mode of the reference moment that follows the clock. *Code:* `ReferenceMode.LIVE`.
- **Pinned** — the mode of the reference moment fixed by the user (a time or date selection). Only Now returns it to live. *Code:* `ReferenceMode.PINNED`. *Never:* frozen, paused, locked.
- **Effective instant** — the instant the reference moment stands for right now: the clock's instant while live, the pinned instant otherwise. *Code:* `getEffectiveInstant`.
- **Time zone ID** — a canonical IANA identifier such as `Europe/Moscow`. It is the only way a zone is stored or compared. *Code:* `timeZoneId`. *Not:* a UTC offset, an abbreviation or a legacy zone name. *Never:* raw offset as an identifier, tz string.
- **Legacy zone name** — an older IANA name that CLDR maps to a canonical time zone ID (`Europe/Kiev` → `Europe/Kyiv`). Input with a legacy zone name is canonicalized before it is stored. *Code:* `virtual:time-zone-aliases`, `canonicalizeTimeZoneId`. *Never:* old zone, deprecated zone.
- **Unknown zone** — a name that is not an IANA zone the engine accepts. Adding it fails, and a stored list containing it is unreadable. *Code:* `LocationErrorCode.UNKNOWN_TIME_ZONE`.
- **Device time zone** — the zone the device reports, read only through the clock, canonicalized, and never stored. An unknown value becomes `UTC`. *Code:* `deviceTimeZoneId`, `SET_DEVICE_TIME_ZONE`. *Never:* local zone, user zone, browser zone.
- **Home location** *(planned)* — a location the user marks as home. The app never assigns it. *Code:* `homeLocationId`.
- **Reference zone** — the zone that defines the reference day, the date kept by a date change and every difference: the home location's zone if home is set, otherwise the device time zone. *Code:* `getReferenceZone`. *Not:* the zone of the location the user last touched. *Never:* main zone, base zone.
- **Wall-clock time** — a local date and time as a clock on the wall shows it in some zone ("02:30 on 8 Mar in New York"). Turned into an instant with `disambiguation: "compatible"`. *Code:* `resolveWallClock`, `requestedWallTime`. *Never:* local timestamp.
- **Wall-clock status** — how a wall-clock time maps to instants: unique (exactly one), gap (does not exist, moved forward), ambiguous (happens twice, the earlier is taken). *Code:* `WallClockStatus.UNIQUE | GAP | AMBIGUOUS`.
- **DST gap** — the wall-clock hour skipped when clocks move forward. A wall-clock time inside it has status gap. *Never:* missing hour, hole.
- **DST overlap** — the wall-clock hour repeated when clocks move back. A wall-clock time inside it has status ambiguous. *Never:* double hour, fold (except when quoting Temporal docs).
- **UTC offset** — the difference of a zone's wall-clock time from UTC at an instant (`UTC+5`, `UTC−4`, `UTC+5:30`). Derived, never stored. *Code:* `getUtcOffsetMinutes`, `formatUtcOffset`. *RU:* UTC+5. *Never:* GMT offset in new text (the design screens say `GMT+5`; the app shows `UTC`).
- **Offset difference** *(planned)* — a location's UTC offset minus the reference zone's, shown as `-2` or `+0:30`. *Not:* the UTC offset itself.
- **Day shift** *(planned)* — whether a location's local date is the reference zone's date, the day before or the day after (`-1 / 0 / +1`).
- **Clock** — the port that gives the current instant and the device time zone. Production uses `systemClock`. Tests use `fakeClock`. *Code:* `Clock` in `@/lib/temporal`. *Never:* `Date.now()` or `new Date()` in production code.
- **Minute tick** — the controller's re-read of the clock at every minute boundary, paused while the page is hidden. *Code:* `useMinuteTick`, `TickScheduler`. *Never:* interval timer, polling.
