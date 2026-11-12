# Zone rules

The app's compiled time zone data: one IANA release, committed as `release.json`
and compiled by `scripts/zoneRules/compile.ts`. Implements FR2, FR7 of
add-zone-rules-from-iana.

## Size

Spike of task 1.1 (release `2026f`, `zic -b slim` of `africa antarctica asia
australasia europe northamerica southamerica etcetera backward`, truncated to
the cutoff `2000-01-01T00:00:00Z`, D1 JSON with link entries):

- 597 zones, of which 253 are link entries;
- 120 261 bytes, 24 350 bytes gzipped (the specify stage measured 20 070 bytes
  gzipped without link entries);
- below the 30 KB ceiling, so the D1 format stays (no D1-compact).

`ZONE_RULES_ASSET_BUDGET_KB = 29` in `app.config.ts` is the gzipped size plus
20 %, rounded up.
