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

## Signing key

IANA publishes `tzdata<release>.tar.gz` with a detached signature
(`.asc`). The compiler accepts an archive only when that signature was made by
the key pinned in `scripts/zoneRules/signing.ts`; the key itself is committed
as `scripts/zoneRules/tz-coordinator-key.asc` and is never fetched at compile
time.

- Owner: Paul Eggert <eggert@cs.ucla.edu> (the tz coordinator)
- Key: rsa4096, created 2010-09-03
- Fingerprint: `7E3792A9D8ACF7D633BC1588ED97E90E62AA7E34`
- Expires: 2031-07-24 (rotate `TZ_COORDINATOR_KEY_EXPIRES`, the fingerprint and the key file together)
- Verified by a human on 2026-11-12: the same fingerprint is served by
  keys.openpgp.org, keyserver.ubuntu.com and `github.com/eggert.gpg`; it signs
  `tzdata2026f.tar.gz` on `data.iana.org` and the tag `2026f` of
  `github.com/eggert/tz`.
