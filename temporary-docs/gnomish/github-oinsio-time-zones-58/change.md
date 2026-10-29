Change: support-legacy-ios-12-safari
Verdict: no-blocking-dependencies

## Notes

- The brief calls the zone-shim spike "design D3"; in `design.md` it is D4 (D3 is the polyfill set). The spike (task 1.1) covers `PlainDateTime#toZonedDateTime` with `compatible`, `earlier` and `later` through `resolveWallClock`, as the brief asks.
- The other active changes depend on this one and were left untouched, per the tracker decision.
