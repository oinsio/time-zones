Change: add-zone-rules-from-iana
Verdict: no-blocking-dependencies

## Notes

- Applied the tracker decision (option 2, narrowed): the signing key is pinned by a human in `packages/client/scripts/zoneRules/tz-coordinator-key.asc` (fingerprint `7E3792A9D8ACF7D633BC1588ED97E90E62AA7E34`, expires 2031-07-24); task 3.1 no longer fetches it. Every `gpg` call uses a temporary `GNUPGHOME`. Release `2026f` is used for the spike and the committed release. Only `data.iana.org` and `www.iana.org` are reachable.
- `add-remote-zone-rules-updates` builds on this change, not the other way round.
