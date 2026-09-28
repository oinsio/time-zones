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

**Never:**
- `new Date()` / `Date.now()` in production code
- `date.toISOString().split("T")[0]` — use `Temporal.Now.plainDateISO().toString()`
- Store `Temporal` objects directly — they don't serialize

