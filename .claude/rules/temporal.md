---
paths:
  - "packages/client/src/**/*.ts"
  - "packages/client/src/**/*.tsx"
---

# Rule: Temporal API usage conventions

**Always:**
- Import from `@/lib/temporal`, never from `temporal-polyfill`
- Use `Temporal.Instant` for timestamps, `Temporal.PlainDate` for date-only
- Use `Temporal.ZonedDateTime` with an IANA time zone ID for any wall-clock time in a location
- Derive UTC offsets and DST state from `ZonedDateTime` for the specific instant — never cache or hardcode offsets
- Call `.toString()` before serializing to localStorage, IndexedDB, or URL
- Add `clock: Clock = systemClock` parameter to functions using current time
- Use `fakeClock` in tests, never `vi.setSystemTime()` or `vi.useFakeTimers()`
- Pass an explicit `disambiguation` when converting wall-clock time to an instant and report `UNIQUE | GAP | AMBIGUOUS` (ADR-0003)
- Canonicalize IANA IDs on input and on load (`Europe/Kiev` -> `Europe/Kyiv`); compare canonical IDs only
- Build hour sequences from absolute one-hour spans — a local day can have 23 or 25 hours
- Support :30 and :45 offsets in labels and differences (`9:30`, `-2:30`)
- Read the device time zone only through `clock.timeZoneId()`; the controller passes it to the model with `SET_DEVICE_TIME_ZONE` (ADR-0007)
- Compute differences, day boundaries and date changes from the reference zone (home if set, otherwise device), never from a hardcoded location

**Never:**
- `new Date()` / `Date.now()` in production code
- `date.toISOString().split("T")[0]` — use `Temporal.Now.plainDateISO().toString()`
- Store `Temporal` objects directly — they don't serialize
- Assume a day has 24 hours or that offsets are whole hours
- Call `Temporal.Now.timeZoneId()` or `Intl.DateTimeFormat().resolvedOptions().timeZone` outside `@/lib/temporal`
- Use `Intl` time zone abbreviations for search or identity — they are locale-dependent, ambiguous (`IST`) or just `GMT+N`

