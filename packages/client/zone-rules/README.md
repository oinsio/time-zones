# Zone rules

The app's compiled time zone data: one IANA release, committed as `release.json`
and compiled by `scripts/zoneRules/compile.ts`. Implements FR2, FR7 of
add-zone-rules-from-iana.

Beside it the compiler writes `zone-coordinates.json`: the coordinates, in
tenths of a degree, of the principal place of every zone of the release's zone
table (`zone.tab`), naming the release it was read from. A release bump commits
both files. Implements FR2, FR3 of add-city-coordinates-to-locations.

## Size

Spike of task 1.1 (release `2026f`, `zic -b slim` of `africa antarctica asia
australasia europe northamerica southamerica etcetera backward`, truncated to
the cutoff `2000-01-01T00:00:00Z`, D1 JSON with link entries):

- 597 zones, of which 253 are link entries;
- 120 261 bytes, 24 350 bytes gzipped (the specify stage measured 20 070 bytes
  gzipped without link entries);
- below the 30 KB ceiling, so the D1 format stays (no D1-compact).

The spike did not yet drop the types nothing uses. The committed release
(`release.json`, 105 590 bytes) gzips to 18 204 bytes, so
`ZONE_RULES_ASSET_BUDGET_KB = 22` in `app.config.ts` is that size plus 20 %,
rounded up.

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

## Commands

Run from `packages/client/`. Both need `cc`, `make` and `gpg`, and reach
`data.iana.org` (never a `-latest` link). Both download `tzdata<release>.tar.gz`
and `tzcode<release>.tar.gz` with their `.asc`, verify both signatures against
the pinned key (every `gpg` call runs with a temporary `GNUPGHOME`) and build
the zone tools: `make zic zdump` over both archives unpacked into one
directory. They never use the `zic` or `zdump` of the operating system: glibc's
`zic` (Ubuntu 24.04, Debian 12) miscompiles `America/Ojinaga` in 2022 and
`Asia/Gaza` after 2073. Implements FR1–FR5, FR8 of build-zic-from-tzcode.

- `pnpm zone-rules:compile 2026f`: compiles with the zone tools' `zic -b slim`,
  truncates to the cutoff `2000-01-01T00:00:00Z` and writes
  `zone-rules/release.json`.
- `pnpm zone-rules:check`: compiles the release the committed file names with
  the zone tools' `zic` (or takes `--compiled <dir>` of an already compiled
  release; the zone tools are built either way), runs their
  `zdump -v -c 2000,2041` on every compiled file and compares it with the
  committed file. It prints `0 differences` or the first difference and exits
  non-zero.

To bump the release: run `zone-rules:compile <release>`, then
`zone-rules:check`, and commit `release.json`.

## Publication of a newer release

Implements FR1 of add-remote-zone-rules-updates (design D7).

The workflow `.github/workflows/zone-rules-publication.yml` ("Zone rules
publication") runs every day and on manual dispatch. It reads the IANA releases
listing, never a `-latest` archive, with `pnpm zone-rules:latest`, which prints
`already current` when the committed release is not older than the newest
`tzdata` release by the release order (`2026z` precedes `2026aa`). For a newer
release it compiles it (`zone-rules:compile`), runs `zone-rules:check` and
`pnpm test`, compares it with the committed release (the refresh guard) and
opens or updates the data refresh pull request `Update zone rules to <release>`
on the branch `data-refresh/zone-rules`. It never pushes to `main`. The pull
request merges by itself once every required check passes, with the trailer
`Data-Only: true`; the ordinary deploy of `main` then publishes
`zone-rules/version.json` and `zone-rules/<release>.json`, and running apps find
them at their next check and offer a Reload.

- **Needs review:** when the guard finds a loss (a zone identifier or zone
  coordinates missing), the pull request carries the label `needs-review`, lists
  the reasons and does not merge by itself.
- **Switch:** every step is conditioned on the repository variable
  `DATA_REFRESH_ENABLED` being `true`; while it is not, a run says "data
  refresh is off" and changes nothing.
- **Failure issue:** a failed run opens the issue "Data refresh failed: zone
  rules" naming the step; later failures comment on it, and the next successful
  run closes it.

- **Dispatch by hand:** Actions → "Zone rules publication" → Run workflow on
  `main`. It runs the same steps as a scheduled run.
- **A schedule GitHub disabled:** GitHub stops scheduled workflows of a
  repository without activity for 60 days. Open the same Actions page and
  enable the workflow again (`gh workflow enable "Zone rules publication"`);
  dispatch it once to confirm. GitHub shows the banner "This scheduled workflow
  is disabled because there hasn't been activity in this repository for at least
  60 days" on the workflow's Actions page. Every daily run re-enables the
  scheduled data refresh workflows.
- **A failed run:** nothing was proposed or deployed. Read the log of the step
  that failed (download or signature, compile, check, test). The app keeps
  serving its current release.

A run can still fail on release content. The compiler and the check are
regression checks over what IANA changed, so a release that changes one of the
pinned facts below fails the run, and fixing it is then a human change:

- the `zdump` fixtures `src/test/zoneRules/fixtures/zdump/` (America/New_York,
  Asia/Almaty, Europe/Dublin, captured from `2026f` with
  `zdump -v -c 2000,2041`), which the unit BDD scenario "The committed release
  passes" compares with the committed release in `pnpm test`;
- the release-content assertions of
  `src/test/features/zone_rules/steps/zone_rules_release.steps.ts`: New York's
  cutoff type, last listed change and future rule; Almaty's last listed change
  and future rule; Dublin's empty change list, cutoff type and future rule;
- the abbreviation pairs of
  `src/test/features/zone_abbreviations/zone_abbreviations_unit.feature` with
  the designations listed in
  `src/test/zoneRules/fixtures/zone-abbreviations.changes.json`.
