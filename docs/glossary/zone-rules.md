# Zone rules

The app's own time zone data and the tools that build it. Decided by ADR-0014 and `add-zone-rules-from-iana`.

- **Zone rules** — the app's compiled time zone data of one IANA release. Every zone fact (offset, designation, clock changes, which zones exist) comes from it, never from the engine. *Code:* `src/lib/zoneRules/`, `ZoneRules` (one zone), `ZoneRulesRelease` (every zone of a release). *RU:* правила часовых поясов. *Not:* the engine's zone data, the IANA source text.
- **Zone rules release** — one IANA release of the zone rules, named like `2026f`. *Code:* `ZoneRulesRelease.release`, `zone-rules/release.json`. *RU:* релиз правил.
- **Cutoff** — the instant `2000-01-01T00:00:00Z`; the zone rules list no clock change before it, and the *local time type* in force at it holds until the first listed change. *Code:* `ZONE_RULES_CUTOFF_EPOCH_SECONDS`.
- **Local time type** — the offset from UTC, the designation and the daylight saving flag in force in a zone during one period. *Code:* `LocalTimeType`, `getLocalTimeType`.
- **Future rule** — the zone's rule in force after the last listed clock change, written as the POSIX TZ string of its TZif footer (RFC 9636 §3.3); it is evaluated for the instant, never expanded into a list. *Code:* `FutureRule`, `parseFutureRule`, `resolveFutureRule`. *RU:* правило продолжения. *Never:* footer rule, DST rule.
- **Zone rules wrapper** — the `Intl.DateTimeFormat` installed at boot on every engine, which answers zone questions from the zone rules. *Code:* `createZoneRulesDateTimeFormat`, `installZoneRulesDateTimeFormat`.
- **Zone rules compiler** — the script that turns a signed IANA release into the zone rules release file. *Code:* `scripts/zoneRules/compile.ts`.
- **Zone rules check** — the script that compares the committed zone rules release with `zdump` over the same IANA release. *Code:* `scripts/zoneRules/check.ts`.
- **Offset-only zone** — a zone of the `Etc` area such as `Etc/GMT+5`, whose name carries a POSIX-signed offset (`Etc/GMT+5` is UTC−5); it is never offered by search. *Code:* `ETC_ZONE_AREA`.
- **Zone rules update** — a newer zone rules release reaching a running installation without an app release: the check, the download, the stored release and the notice. *Code:* `useZoneRulesUpdate`, `ZoneRulesVersionSource`. *RU:* обновление правил часовых поясов. *Never:* auto-update.
- **Zone rules version file** — the small file the site serves that names the newest published zone rules release; the check reads it with a revalidating request. *Code:* `ZONE_RULES_VERSION_PATH`. *RU:* файл версии правил.
- **Zone rules publication** — the daily or manual workflow that compiles a newer IANA release, checks it, commits it and deploys it. *Code:* `.github/workflows/zone-rules-publication.yml`, `scripts/zoneRules/latestRelease.ts`. *RU:* публикация правил.
- **Active release** — the zone rules release installed at start, the stored release when it is newer than the bundled one, otherwise the bundled one. *Code:* `chooseActiveRelease`, `getInstalledRelease`. *RU:* действующий релиз.
- **Stored release** — the downloaded zone rules release kept on the device, as a cached copy of published data; an unreadable copy is removed silently. *Code:* `StoredReleaseRepository`, `STORAGE_KEYS.ZONE_RULES`. *RU:* сохранённый релиз.
- **Release order** — the order of release names: year, then the length of the letters, then alphabetical (`2026z` precedes `2026aa`). *Code:* `compareReleaseNames`, `parseReleaseName`. *RU:* порядок релизов.
