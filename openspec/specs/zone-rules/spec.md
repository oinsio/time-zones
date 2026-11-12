# zone-rules Specification

## Purpose
The app's own time zone rules, compiled from one IANA release: what they hold, how an instant's local time type is found from them on every engine, how the future rule is evaluated, which zones are known, and how a release is compiled and checked.

## Requirements

### Requirement: Zone rules are the only source of offsets
On every supported engine, every UTC offset, local date and local time the app computes or shows SHALL come from the zone rules of the built release. For a zone the release knows, the engine's own zone data MUST NOT decide any of them. <!-- implements FR1, UX1 of add-zone-rules-from-iana -->

#### Scenario: A stale engine shows the current rules
- **GIVEN** the engine's own data places `Asia/Almaty` at UTC+6 on `2026-07-15T08:00:00Z`
- **AND** the list contains Almaty
- **WHEN** the rows are presented at that instant
- **THEN** the Almaty row shows `13:00` and `UTC+5`

#### Scenario: Temporal and the presenter agree
- **GIVEN** the engine's own data places `Asia/Almaty` at UTC+6
- **WHEN** the local time, the hour labels, the wall-time hint and the date bar of Almaty are presented at `2026-07-15T08:00:00Z`
- **THEN** every one of them shows the 13:00 local time of UTC+5

#### Scenario: Wall-clock resolution uses the rules
- **GIVEN** the engine's own data places `Asia/Almaty` at UTC+6
- **WHEN** the wall-clock time `2026-07-15T13:00` in `Asia/Almaty` is resolved
- **THEN** it resolves to `2026-07-15T08:00:00Z` with the status `UNIQUE`

### Requirement: Content of a zone rules release
The zone rules of a release SHALL hold, for every zone id of the IANA release including links, the local time type in force at the cutoff `2000-01-01T00:00:00Z`, every explicitly listed clock change after the cutoff with the type after it, and the zone's future rule or none when its TZif footer is empty. When the zone's listed clock changes end before the cutoff, the type in force at the cutoff MUST be the one its future rule gives at the cutoff. The release MUST carry its IANA release name. <!-- implements FR2 of add-zone-rules-from-iana -->

#### Scenario: A local time type
- **WHEN** a local time type of a release is read
- **THEN** it holds a UTC offset in seconds, a tzdb designation and a daylight saving flag

#### Scenario: A zone with a future rule
- **WHEN** the zone rules of `America/New_York` are read from a release
- **THEN** its cutoff type is UTC−5 `EST`
- **AND** its listed clock changes end in 2007
- **AND** its future rule is `EST5EDT,M3.2.0,M11.1.0`

#### Scenario: A zone whose last type holds forever
- **WHEN** the zone rules of `Asia/Almaty` are read from the release `2026f`
- **THEN** its listed clock changes end with `2024-02-29T18:00:00Z` to UTC+5 `+05`
- **AND** it has a standard-only future rule `<+05>-5`

#### Scenario: A zone whose listed changes end before the cutoff
- **WHEN** the zone rules of `Europe/Dublin` are read from the release `2026f`
- **THEN** it lists no clock change after the cutoff
- **AND** its cutoff type is UTC+0 `GMT` with the daylight saving flag set, as its future rule `IST-1GMT0,M10.5.0,M3.5.0/1` gives at `2000-01-01T00:00:00Z`

#### Scenario: A link resolves to its target's rules
- **WHEN** the zone rules of `Asia/Calcutta` are read
- **THEN** they equal the zone rules of `Asia/Kolkata`

#### Scenario: The release carries its name
- **WHEN** a release compiled from `tzdata2026f.tar.gz` is read
- **THEN** its release name is `2026f`

### Requirement: Future rule evaluation
The future rule SHALL be interpreted as RFC 9636 §3.3 defines the POSIX TZ string and its extensions, with POSIX offsets (positive west) converted to the app's offsets (positive east). <!-- implements FR3 of add-zone-rules-from-iana -->

#### Scenario: Future rule forms
- **WHEN** the future rule `<rule>` is evaluated at `<instant>`
- **THEN** the offset is `<offset>` and the designation is `<designation>`

| rule | instant | offset | designation |
|---|---|---|---|
| `EST5EDT,M3.2.0,M11.1.0` | 2040-07-15T12:00:00Z | −04:00 | EDT |
| `EST5EDT,M3.2.0,M11.1.0` | 2040-01-15T12:00:00Z | −05:00 | EST |
| `IST-1GMT0,M10.5.0,M3.5.0/1` | 2038-07-01T12:00:00Z | +01:00 | IST |
| `IST-1GMT0,M10.5.0,M3.5.0/1` | 2038-01-15T12:00:00Z | +00:00 | GMT |
| `<-02>2<-01>,M3.5.0/-1,M10.5.0/0` | 2040-07-15T12:00:00Z | −01:00 | -01 |
| `<-02>2<-01>,M3.5.0/-1,M10.5.0/0` | 2040-01-15T12:00:00Z | −02:00 | -02 |
| `EST5EDT,0/0,J365/25` | 2040-01-15T12:00:00Z | −04:00 | EDT |
| `EST5EDT,0/0,J365/25` | 2040-07-15T12:00:00Z | −04:00 | EDT |
| `<+05>-5` | 2040-07-15T12:00:00Z | +05:00 | +05 |
| `<+0530>-5:30` | 2040-07-15T12:00:00Z | +05:30 | +0530 |
| `NZST-12NZDT,M9.5.0,M4.1.0/3` | 2040-01-15T12:00:00Z | +13:00 | NZDT |
| `AEST-10AEDT,M10.1.0,M4.1.0/3` | 2040-03-31T15:30:00Z | +11:00 | AEDT |
| `AEST-10AEDT,M10.1.0,M4.1.0/3` | 2040-03-31T16:30:00Z | +10:00 | AEST |

#### Scenario: Transitions are read in the local time in force
- **GIVEN** the future rule `EST5EDT,M3.2.0,M11.1.0`
- **WHEN** it is evaluated one second before and at `2040-03-11T07:00:00Z` (02:00 EST)
- **THEN** the offsets are −05:00 and then −04:00

#### Scenario: Julian day forms
- **WHEN** the future rule `<rule>` is evaluated at `<instant>`
- **THEN** the offset is `<offset>`

| rule | instant | offset |
|---|---|---|
| `STD3DST,J60/2,J61/2` | 2040-02-29T12:00:00Z | −03:00 |
| `STD3DST,J60/2,J61/2` | 2040-03-01T12:00:00Z | −02:00 |
| `STD3DST,59/2,60/2` | 2040-02-29T12:00:00Z | −02:00 |

### Requirement: Local time type lookup
The local time type at an instant SHALL be: before the cutoff, the cutoff's type; between the cutoff and the last listed clock change, the type after the latest listed clock change at or before the instant; after the last listed clock change, the type the future rule gives. The lookup MUST NOT predict from the listed clock changes. <!-- implements FR4 of add-zone-rules-from-iana -->

#### Scenario: Lookup across the three ranges
- **WHEN** the local time type of `<zone>` at `<instant>` is read
- **THEN** the offset is `<offset>` and the designation is `<designation>`

| zone | instant | offset | designation |
|---|---|---|---|
| America/New_York | 1999-07-15T12:00:00Z | −05:00 | EST |
| America/New_York | 2006-07-15T12:00:00Z | −04:00 | EDT |
| America/New_York | 2026-03-08T06:59:59Z | −05:00 | EST |
| America/New_York | 2026-03-08T07:00:00Z | −04:00 | EDT |
| America/New_York | 2040-07-15T12:00:00Z | −04:00 | EDT |
| Asia/Almaty | 2024-02-29T17:59:59Z | +06:00 | +06 |
| Asia/Almaty | 2024-02-29T18:00:00Z | +05:00 | +05 |
| Asia/Almaty | 2040-07-15T12:00:00Z | +05:00 | +05 |
| Europe/Dublin | 2040-07-15T12:00:00Z | +01:00 | IST |
| America/Ciudad_Juarez | 2026-07-15T12:00:00Z | −06:00 | MDT |
| UTC | 2026-07-15T12:00:00Z | +00:00 | UTC |

#### Scenario: Before the cutoff the cutoff type holds
- **WHEN** the local time type of `Europe/Moscow` at `1995-07-15T12:00:00Z` is read
- **THEN** it is the type in force at `2000-01-01T00:00:00Z`, UTC+3 `MSK`

### Requirement: Known zones come from the release
A zone id in the release SHALL be a known zone on every engine, including an id the engine rejects. A legacy zone name SHALL be canonicalized as before. A name in neither the release nor the alias map MUST be an unknown zone. <!-- implements FR5 of add-zone-rules-from-iana -->

#### Scenario: A zone the engine rejects is known
- **GIVEN** the engine rejects `America/Ciudad_Juarez`
- **WHEN** the user adds Ciudad Juárez with that zone
- **THEN** the location is added with the zone `America/Ciudad_Juarez`
- **AND** at `2026-07-15T08:00:00Z` its row shows `02:00` and `UTC−6`

#### Scenario: A legacy name stays canonical
- **GIVEN** the engine rejects `Europe/Kyiv`
- **WHEN** the user adds Kyiv with the zone `Europe/Kiev`
- **THEN** the location is stored with the zone `Europe/Kyiv`
- **AND** at `2026-03-08T07:30:00Z` its row shows `09:30` and `UTC+2`

#### Scenario: A name in neither is unknown
- **WHEN** a location with the zone `Mars/Olympus_Mons` is added
- **THEN** the location is rejected as an unknown time zone

### Requirement: Date and time formatting through the rules
`Intl.DateTimeFormat` with a `timeZone` the release knows SHALL format, and split into parts, every date and time field from the zone rules, using the native formatter for locale, calendar and numbering. Its resolved `timeZone` MUST be the requested id in the release's spelling, never the target of a link. A `timeZone` the release does not know MUST reach the native constructor unchanged. <!-- implements FR6 of add-zone-rules-from-iana -->

#### Scenario: Parts come from the rules
- **GIVEN** the engine's own data places `Asia/Almaty` at UTC+6
- **WHEN** `2026-07-15T08:00:00Z` is split into parts in `Asia/Almaty` with hour, minute, day, month and year
- **THEN** the hour part is `13`, the minute part `00`, the day `15`, the month `7` and the year `2026`

#### Scenario: Formatting in Russian keeps the locale
- **WHEN** `2026-07-15T08:00:00Z` is formatted in `Asia/Almaty` for the `ru` locale with the long date and the short time
- **THEN** the text reads `15 июля 2026 г. в 13:00`

#### Scenario: Zone names
- **WHEN** the `timeZoneName` of `<zone>` at `2026-07-15T12:00:00Z` is formatted
- **THEN** it is `<name>`: the tzdb designation when it is letters, otherwise `GMT±H` or `GMT±H:MM` from the offset

| zone | name |
|---|---|
| America/New_York | EDT |
| Asia/Almaty | GMT+5 |
| Asia/Kolkata | IST |
| Asia/Kathmandu | GMT+5:45 |

#### Scenario: Resolved options keep the requested id
- **WHEN** a formatter for `<requested>` is created
- **THEN** its resolved `timeZone` is `<resolved>`

| requested | resolved |
|---|---|
| Europe/Kyiv | Europe/Kyiv |
| europe/kyiv | Europe/Kyiv |
| Europe/Oslo | Europe/Oslo |
| Asia/Calcutta | Asia/Calcutta |

#### Scenario: Unknown zones fall through
- **WHEN** a formatter for a zone the release does not know is created
- **THEN** the native constructor receives that zone unchanged

#### Scenario: A formatter without a date formats the current instant
- **GIVEN** the current instant is `2026-07-15T08:00:00Z`
- **WHEN** a formatter for `Asia/Almaty` with hour and minute formats without a date
- **THEN** the text reads `13:00`

### Requirement: Compiling a release
A script SHALL compile a release by name: download `tzdata<release>.tar.gz` and its `.asc` from `https://data.iana.org/time-zones/releases/`, never a `-latest` link; verify the signature against the pinned fingerprint of the tz coordinator's key and stop on a mismatch; compile with the system `zic -b slim`; read the 64-bit block and the footer of every TZif file; truncate to the cutoff; write the release with its name. The name in the archive's `version` file MUST equal the requested name. <!-- implements FR7 of add-zone-rules-from-iana -->

#### Scenario: A valid archive compiles
- **GIVEN** a tzdata archive and a signature that verifies against the pinned fingerprint
- **WHEN** the release `2026f` is compiled
- **THEN** a release named `2026f` is written with the zone rules of every zone id of the archive

#### Scenario: The archive comes from the release address
- **WHEN** the release `2026f` is compiled
- **THEN** the compiler downloads `https://data.iana.org/time-zones/releases/tzdata2026f.tar.gz` and `https://data.iana.org/time-zones/releases/tzdata2026f.tar.gz.asc`
- **AND** no address it requests contains `-latest`

#### Scenario: A bad signature stops the compiler
- **GIVEN** an archive whose signature does not verify
- **WHEN** the release is compiled
- **THEN** the compiler stops without writing a release and names the failed check

#### Scenario: A signature by another key stops the compiler
- **GIVEN** an archive whose signature verifies, but by a key whose fingerprint is not the pinned one
- **WHEN** the release is compiled
- **THEN** the compiler stops without writing a release and names both fingerprints

#### Scenario: A version mismatch stops the compiler
- **GIVEN** an archive whose `version` file reads `2026e`
- **WHEN** the release `2026f` is compiled
- **THEN** the compiler stops without writing a release and names both versions

#### Scenario: Truncation keeps the cutoff type
- **GIVEN** a TZif file of `Europe/Moscow` with clock changes before and after `2000-01-01T00:00:00Z`
- **WHEN** it is truncated to the cutoff
- **THEN** the cutoff type is UTC+3 `MSK` and no clock change before the cutoff is kept

### Requirement: Zone rules check against zdump
A check SHALL compare the app's lookup over the committed release with `zdump -v` of the same release compiled by `zic`, for every zone, at every clock change in 2000–2040 and one second before it, and MUST fail on one difference in offset or designation. CI MUST run it on every pull request, and the committed release MUST pass it. <!-- implements FR8, G4 of add-zone-rules-from-iana -->

#### Scenario: The committed release passes
- **WHEN** the zone rules check runs on the committed release `2026f`
- **THEN** it reports 0 differences

#### Scenario: A wrong rule fails the check
- **GIVEN** a release in which the future rule of `America/New_York` ends daylight time on the first Sunday of October
- **WHEN** the zone rules check runs
- **THEN** it fails and names `America/New_York` and the first differing instant

### Requirement: Rules load before the app
The zone rules SHALL load before the app on every engine from one asset the service worker precaches, so the app works offline after the first visit. If the asset cannot be loaded or is invalid, the app MUST still start, with the engine's data, and MUST log the failure. <!-- implements FR10, NFR-P2 of add-zone-rules-from-iana -->

#### Scenario: Offline start with the rules
- **GIVEN** the app was opened online once
- **WHEN** it is opened without a network connection
- **THEN** the main page shows the stored locations with times from the rules
- **AND** the zone rules asset is served from the service worker's precache
- **AND** no zone rules load failure is logged

#### Scenario: The asset is requested with the app
- **WHEN** the app is opened online
- **THEN** the zone rules asset is requested once, in parallel with the app's first chunks

#### Scenario: A failed load still starts the app
- **GIVEN** the zone rules asset cannot be loaded
- **WHEN** the app starts
- **THEN** the main page is shown with the engine's data
- **AND** the failure is logged

### Requirement: Zone rules within their budgets
The zone rules asset MUST stay within its gzipped budget, counted apart from the initial JavaScript, which MUST stay within its 150 KB budget. Presenting 50 rows MUST build no more `Intl.DateTimeFormat` instances than before. A wrapper instance MUST build exactly one native formatter, and one `formatToParts` call on it with a date MUST make exactly one native `formatToParts` call; a call without a date MAY add one call on the one module-level native UTC formatter that reads the current instant. A local time type lookup MUST build no formatter and make no native call. <!-- implements NFR-P1, NFR-P3 of add-zone-rules-from-iana -->

#### Scenario: Asset budget
- **WHEN** the committed zone rules release is measured gzipped
- **THEN** it is at most the asset budget

#### Scenario: Work bound of a lookup
- **WHEN** the local time type of `Asia/Almaty` is read at 100 instants
- **THEN** no `Intl.DateTimeFormat` is built
- **AND** no native `formatToParts` call is made

#### Scenario: Work bound of the wrapper
- **WHEN** one formatter for `Asia/Almaty` is created and split into parts at 100 instants
- **THEN** exactly one native `Intl.DateTimeFormat` is built
- **AND** exactly 100 native `formatToParts` calls are made

#### Scenario: Work bound of presenting rows
- **WHEN** 50 rows are presented twice at two instants
- **THEN** the second presentation builds no `Intl.DateTimeFormat`

### Requirement: Nothing visible changes
The change SHALL add no visible element: the main page MUST show no new note, no new control and no new error screen, axe-core MUST report no violations on it, and the approved screenshot baselines in `chromium` and `mobile-chrome` MUST pass unchanged. <!-- implements NFR-A1, NFR-R1, UX2 of add-zone-rules-from-iana -->

#### Scenario: No accessibility violations on the main page
- **GIVEN** the app started with the zone rules
- **WHEN** the main page is checked with axe-core
- **THEN** no violation is reported

#### Scenario: The approved screens stay the same
- **GIVEN** the app started with the zone rules
- **WHEN** each approved screen is captured in `chromium` and `mobile-chrome`
- **THEN** it matches its approved baseline without an update
