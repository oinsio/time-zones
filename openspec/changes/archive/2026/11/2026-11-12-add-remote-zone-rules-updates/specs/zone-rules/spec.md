# Spec Delta

## MODIFIED Requirements

### Requirement: Content of a zone rules release
The zone rules of a release SHALL hold, for every zone id of the IANA release including links, the local time type in force at the cutoff `2000-01-01T00:00:00Z`, every explicitly listed clock change after the cutoff with the type after it, and the zone's future rule or none when its TZif footer is empty. When the zone's listed clock changes end before the cutoff, the type in force at the cutoff MUST be the one its future rule gives at the cutoff. The release MUST carry its IANA release name. Statements about the committed release MUST hold for whichever release is committed, not for one release name. <!-- implements FR2 of add-zone-rules-from-iana; FR1 of add-remote-zone-rules-updates -->

#### Scenario: A local time type
- **WHEN** a local time type of a release is read
- **THEN** it holds a UTC offset in seconds, a tzdb designation and a daylight saving flag

#### Scenario: A zone with a future rule
- **WHEN** the zone rules of `America/New_York` are read from a release
- **THEN** its cutoff type is UTC−5 `EST`
- **AND** its listed clock changes end in 2007
- **AND** its future rule is `EST5EDT,M3.2.0,M11.1.0`

#### Scenario: A zone whose last type holds forever
- **WHEN** the zone rules of `Asia/Almaty` are read from the committed release
- **THEN** its listed clock changes end with `2024-02-29T18:00:00Z` to UTC+5 `+05`
- **AND** it has a standard-only future rule `<+05>-5`

#### Scenario: A zone whose listed changes end before the cutoff
- **WHEN** the zone rules of `Europe/Dublin` are read from the committed release
- **THEN** it lists no clock change after the cutoff
- **AND** its cutoff type is UTC+0 `GMT` with the daylight saving flag set, as its future rule `IST-1GMT0,M10.5.0,M3.5.0/1` gives at `2000-01-01T00:00:00Z`

#### Scenario: A link resolves to its target's rules
- **WHEN** the zone rules of `Asia/Calcutta` are read
- **THEN** they equal the zone rules of `Asia/Kolkata`

#### Scenario: The release carries its name
- **WHEN** the committed release is read
- **THEN** its release name is a valid name by the release order
- **AND** it is the name of the IANA archive the release was compiled from

### Requirement: Zone rules check against zdump
A check SHALL compare the app's lookup over the committed release with `zdump -v` of the same release compiled by `zic`, for every zone, at every clock change in 2000–2040 and one second before it, and MUST fail on one difference in offset or designation. CI MUST run it on every pull request, and the committed release MUST pass it. <!-- implements FR8, G4 of add-zone-rules-from-iana; FR1 of add-remote-zone-rules-updates -->

#### Scenario: The committed release passes
- **WHEN** the zone rules check runs on the committed release
- **THEN** it reports 0 differences

#### Scenario: A wrong rule fails the check
- **GIVEN** a release in which the future rule of `America/New_York` ends daylight time on the first Sunday of October
- **WHEN** the zone rules check runs
- **THEN** it fails and names `America/New_York` and the first differing instant

### Requirement: Rules load before the app
The zone rules SHALL load before the app on every engine from one asset the service worker precaches, so the app works offline after the first visit, or from the stored release when it is newer than that asset or the asset cannot be loaded (zone-rules-updates "Active release at start"). If neither the asset nor a valid stored release can be loaded, the app MUST still start, with the engine's data, and MUST log the failure. <!-- implements FR10, NFR-P2 of add-zone-rules-from-iana; FR6 of add-remote-zone-rules-updates -->

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
- **AND** no valid stored release is kept
- **WHEN** the app starts
- **THEN** the main page is shown with the engine's data
- **AND** the failure is logged
