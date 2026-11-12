# Spec Delta

## Purpose

How a newer IANA release of the zone rules reaches a running installation without an app release: the check, the download, the stored release, the release order with its no-downgrade rule, the active release at start, and the silence of failures.

## ADDED Requirements

### Requirement: Release order
Zone rules releases SHALL be ordered by year, then by their letter sequence, where a longer sequence follows every shorter one of the same year. A name that is not four digits followed by one or more lowercase letters MUST be invalid. <!-- implements FR5 of add-remote-zone-rules-updates -->

#### Scenario: Ordered pairs
- **WHEN** `<earlier>` and `<later>` are compared
- **THEN** `<earlier>` is older than `<later>`

| earlier | later |
|---|---|
| 2026a | 2026b |
| 2026b | 2026z |
| 2026z | 2026aa |
| 2026aa | 2026ab |
| 2025z | 2026a |
| 2024a | 2026a |

#### Scenario: Invalid names
- **WHEN** `<name>` is parsed as a release name
- **THEN** it is invalid

| name |
|---|
| 2026 |
| 2026A |
| 26a |
| latest |

### Requirement: Zone rules update check
The app SHALL check for a zone rules update at start and on every update recheck, only while online, by reading the zone rules version file with a request that bypasses the HTTP cache. When the named release is newer than the active release and not yet stored, the app MUST download the release file, store it as the stored release and show the zone rules update notice. Otherwise nothing changes. <!-- implements FR3, NFR-P1 of add-remote-zone-rules-updates -->

#### Scenario: A newer release is published
- **GIVEN** the active release is `2026c` and the version file names `2026d`
- **WHEN** the app checks for a zone rules update
- **THEN** the release file of `2026d` is requested once and parsed as a zone rules release
- **AND** `2026d` becomes the stored release
- **AND** the zone rules update notice names `2026d`

#### Scenario: The published release is not newer
- **GIVEN** the active release is `2026c` and the version file names `<release>`
- **WHEN** the app checks for a zone rules update
- **THEN** no release file is requested and no notice is shown

| release |
|---|
| 2026c |
| 2026b |

#### Scenario: The newer release is already stored
- **GIVEN** the active release is `2026c`, `2026d` is the stored release and the version file names `2026d`
- **WHEN** the app checks for a zone rules update
- **THEN** no release file is requested and nothing is stored again

#### Scenario: Checks follow the update recheck rule
- **GIVEN** the app last checked 16 minutes ago
- **WHEN** the page becomes visible
- **THEN** the version file is requested once
- **AND** a return 5 minutes after a check requests nothing

#### Scenario: One request per check
- **WHEN** the app checks and the version file names the active release
- **THEN** exactly one request was made

### Requirement: Failed checks are silent
A check that fails because the device is offline, the request fails or returns a non-2xx status, or the version file or the release file cannot be parsed, SHALL show nothing and change nothing. The stored release MUST NOT be replaced by an unparsable download. The next check runs by the same rule. <!-- implements FR4 of add-remote-zone-rules-updates -->

#### Scenario: Offline
- **GIVEN** the device is offline
- **WHEN** a check is due
- **THEN** no request is made and no notice is shown

#### Scenario: Failures change nothing
- **GIVEN** the active release is `2026c` and `<failure>`
- **WHEN** the app checks for a zone rules update
- **THEN** no notice is shown and the stored release is unchanged

| failure |
|---|
| the version file request fails |
| the version file returns status 404 |
| the version file is not JSON |
| the version file names an invalid release name |
| the release file of `2026d` is not a valid zone rules release |

### Requirement: Active release at start
At start, before the zone rules are installed, the app SHALL make active the stored release when it is readable, valid and newer than the bundled release, otherwise the bundled release. An unreadable or invalid stored release MUST be discarded silently. A stored release older than or equal to the bundled one MUST be removed. The choice MUST make no network request. <!-- implements FR6, NFR-P2 of add-remote-zone-rules-updates -->

#### Scenario: Stored release is newer
- **GIVEN** the bundled release is `2026a` and the stored release is `2026c`
- **WHEN** the app starts
- **THEN** the active release is `2026c`
- **AND** Almaty's offset comes from the stored release

#### Scenario: Stored release is older or equal
- **GIVEN** the bundled release is `2026d` and the stored release is `<stored>`
- **WHEN** the app starts
- **THEN** the active release is `2026d`
- **AND** the stored release is removed

| stored |
|---|
| 2026c |
| 2026d |

#### Scenario: Stored release is unreadable
- **GIVEN** the stored release document is not valid JSON or has a newer schema version
- **WHEN** the app starts
- **THEN** the active release is the bundled one
- **AND** the stored document is removed
- **AND** no error is shown

#### Scenario: No stored release
- **GIVEN** nothing is stored
- **WHEN** the app starts
- **THEN** the active release is the bundled one and storage is read once

### Requirement: Stored release document
The stored release SHALL be kept under its own storage key as an envelope `{ schemaVersion: 1, payload }` whose payload is the zone rules release document. The locations and preferences documents MUST be unchanged. When storage is unavailable, a downloaded newer release MUST still show the notice and MUST NOT be stored. <!-- implements FR9 of add-remote-zone-rules-updates -->

#### Scenario: Envelope
- **WHEN** `2026d` is stored
- **THEN** the document under the zone rules key has `schemaVersion` 1 and a payload whose release is `2026d`
- **AND** the locations and preferences documents are unchanged

#### Scenario: Storage unavailable
- **GIVEN** storage is unavailable and the version file names a newer release
- **WHEN** the app checks for a zone rules update
- **THEN** the zone rules update notice is shown
- **AND** nothing is written

### Requirement: Dismissed notice stays dismissed
Once the user dismisses the zone rules update notice for a release, the notice MUST stay hidden until a newer release is stored. <!-- implements FR7 of add-remote-zone-rules-updates -->

#### Scenario: Dismiss then recheck
- **GIVEN** the notice for `2026d` was dismissed
- **WHEN** the next check finds `2026d` still published
- **THEN** no notice is shown

#### Scenario: A newer release after dismissal
- **GIVEN** the notice for `2026d` was dismissed
- **WHEN** a check stores `2026e`
- **THEN** the notice names `2026e`
