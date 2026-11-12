# Spec Delta

## Purpose

How a newer IANA release of the zone rules reaches a running installation without an app release: the release order, the check, the download, the stored release, the active release at start, the silence of failures and the dismissal of the notice.

## ADDED Requirements

### Requirement: Release order
Zone rules releases SHALL be ordered by year, then by the length of their letter sequence, then alphabetically, so a longer sequence follows every shorter one of the same year. A name that is not four digits followed by one or more lowercase letters MUST be invalid. The zone rules compiler MUST accept every valid name. Inputs: two release names. Output: older, equal or newer; or invalid. <!-- implements FR5 of add-remote-zone-rules-updates -->

#### Scenario: Ordered pairs
- **WHEN** `<earlier>` and `<later>` are compared
- **THEN** `<earlier>` is older than `<later>`, `<later>` is newer than `<earlier>`, and each equals itself

| earlier | later |
|---|---|
| 2026a | 2026b |
| 2026b | 2026z |
| 2026z | 2026aa |
| 2026aa | 2026ab |
| 2025z | 2026a |
| 2024a | 2026a |

#### Scenario: Invalid names
- **WHEN** `<name>` is read as a release name
- **THEN** it is invalid

| name |
|---|
| 2026 |
| 2026A |
| 26a |
| latest |

### Requirement: Zone rules update check
The app SHALL check for a zone rules update at start and on every update recheck (on return to the screen, at most once per 15 minutes), only while online and only when an active release is installed, by reading the zone rules version file with a request that revalidates the HTTP cache. When the named release is newer than the active release and is already the stored release, the app MUST show the zone rules update notice without a further request. When it is newer and not stored, the app MUST download its release file, accept it only when it is a valid zone rules release with the same name, store it as the stored release and show the notice. When it is equal or older, nothing changes. <!-- implements FR3, NFR-P1 of add-remote-zone-rules-updates -->

#### Scenario: A newer release is published
- **GIVEN** the active release is `2026f` and the version file names `2026g`
- **WHEN** the app checks for a zone rules update
- **THEN** the release file of `2026g` is requested once
- **AND** `2026g` becomes the stored release
- **AND** the zone rules update notice names `2026g`

#### Scenario: The published release is not newer
- **GIVEN** the active release is `2026f` and the version file names `<release>`
- **WHEN** the app checks for a zone rules update
- **THEN** exactly one request was made and no notice is shown

| release |
|---|
| 2026f |
| 2026e |

#### Scenario: The newer release is already stored
- **GIVEN** the active release is `2026f`, `2026g` is the stored release and the version file names `2026g`
- **WHEN** the app checks for a zone rules update
- **THEN** no release file is requested and nothing is written
- **AND** the zone rules update notice names `2026g`

#### Scenario: Checks follow the update recheck rule
- **GIVEN** the app last checked 16 minutes ago
- **WHEN** the page becomes visible
- **THEN** the version file is requested once
- **AND** a return 5 minutes after that check requests nothing

#### Scenario: No active release
- **GIVEN** the zone rules failed to load at start
- **WHEN** a check is due
- **THEN** no request is made

### Requirement: Failed checks are silent
A check that fails because the device is offline, the request fails or returns a non-2xx status, the version file cannot be parsed or names an invalid release, or the release file is not a valid zone rules release or carries another name, SHALL show nothing and change nothing. The stored release MUST NOT be replaced by a rejected download. The next check runs by the same rule. <!-- implements FR4 of add-remote-zone-rules-updates -->

#### Scenario: Offline
- **GIVEN** the device is offline
- **WHEN** a check is due
- **THEN** no request is made and no notice is shown

#### Scenario: Failures change nothing
- **GIVEN** the active release is `2026f` and `<failure>`
- **WHEN** the app checks for a zone rules update
- **THEN** no notice is shown and nothing is written

| failure |
|---|
| the version file request fails |
| the version file returns status 404 |
| the version file is not JSON |
| the version file names the invalid release name `latest` |
| the release file of `2026g` is not a valid zone rules release |
| the release file of `2026g` names the release `2026h` |

### Requirement: Active release at start
At start, before the zone rules are installed, the app SHALL make active the stored release when it is readable, valid and newer than the bundled release, otherwise the bundled release; when the bundled release cannot be loaded, a valid stored release is made active. An unreadable or invalid stored release MUST be removed silently. A stored release older than or equal to the bundled one MUST be removed. The choice MUST read the storage key once and make no network request beyond the bundled release. <!-- implements FR6, NFR-P2 of add-remote-zone-rules-updates -->

#### Scenario: Stored release is newer
- **GIVEN** the bundled release is `2026f` and the stored release is `2026g`, whose rule for `Asia/Almaty` is UTC+4
- **WHEN** the app starts
- **THEN** the active release is `2026g`
- **AND** the offset of `Asia/Almaty` is UTC+4

#### Scenario: Stored release is older or equal
- **GIVEN** the bundled release is `2026f` and the stored release is `<stored>`
- **WHEN** the app starts
- **THEN** the active release is `2026f`
- **AND** the stored release is removed

| stored |
|---|
| 2026e |
| 2026f |

#### Scenario: Stored release is unreadable
- **GIVEN** the stored release document is `<document>`
- **WHEN** the app starts
- **THEN** the active release is the bundled one
- **AND** the stored document is removed
- **AND** no error is shown

| document |
|---|
| not valid JSON |
| an envelope with schema version 2 |
| an envelope whose payload is not a zone rules release |

#### Scenario: No stored release
- **GIVEN** nothing is stored
- **WHEN** the app starts
- **THEN** the active release is the bundled one, storage is read once and only the bundled release is requested

#### Scenario: The bundled release cannot be loaded
- **GIVEN** the request for the bundled release fails and the stored release `2026g` is valid
- **WHEN** the app starts
- **THEN** the active release is `2026g`

### Requirement: Stored release document
The stored release SHALL be kept under its own storage key as an envelope `{ schemaVersion: 1, payload }` whose payload is the zone rules release document. The locations and preferences documents MUST be unchanged. When storage is unavailable or the write fails, the downloaded release MUST NOT be stored, the zone rules update notice MUST NOT be shown (its Reload could not use the release), and that release file MUST NOT be downloaded again for the rest of the page's life; the release then arrives with the deploy that publishes it, through the update notice. <!-- implements FR9 of add-remote-zone-rules-updates -->

#### Scenario: Envelope
- **WHEN** `2026g` is stored
- **THEN** the document under the zone rules key has `schemaVersion` 1 and a payload whose release is `2026g`
- **AND** the locations and preferences documents are unchanged

#### Scenario: Storage unavailable
- **GIVEN** storage is unavailable and the version file names a newer release
- **WHEN** the app checks for a zone rules update
- **THEN** the zone rules update notice is not shown
- **AND** nothing is written

#### Scenario: An unstored release is not downloaded again
- **GIVEN** a save of the newer release `2026g` failed
- **WHEN** the app checks again for a zone rules update and the version file still names `2026g`
- **THEN** only the version file is requested
- **AND** the zone rules update notice is not shown

### Requirement: Dismissed notice stays dismissed
Once the user dismisses the zone rules update notice for a release, the notice MUST stay hidden for the page's life until a newer release is stored. <!-- implements FR7 of add-remote-zone-rules-updates -->

#### Scenario: Dismiss then recheck
- **GIVEN** the notice for `2026g` was dismissed
- **WHEN** the next check finds `2026g` still published
- **THEN** no notice is shown

#### Scenario: A newer release after dismissal
- **GIVEN** the notice for `2026g` was dismissed
- **WHEN** a check stores `2026h`
- **THEN** the notice names `2026h`
