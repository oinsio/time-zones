# Fixtures of the zone rules compiler tests

- `America_New_York.tzif`: the TZif file of `America/New_York` of the IANA
  release `2026f`, compiled with `zic -b slim -d <out> africa antarctica asia
  australasia europe northamerica southamerica etcetera backward` (zic of
  Ubuntu 24.04, glibc 2.39). Used by `readTzif.test.ts`.
- `gpg-verify-valid.status.txt`: the `--status-fd 1` output of
  `GNUPGHOME=<temporary directory> gpg --batch --status-fd 1 --verify
  tzdata2026f.tar.gz.asc tzdata2026f.tar.gz` after `gpg --batch --import
  scripts/zoneRules/tz-coordinator-key.asc` (gpg of Ubuntu 24.04). Used by
  `compile.test.ts` and `verifySignature.test.ts`.
