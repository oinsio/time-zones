# Spec Delta

## MODIFIED Requirements

### Requirement: Wall-time input in a renamed zone
On an engine that rejects a canonical zone ID which the zone rules release knows (see the `zone-rules` capability), a wall-time input in that zone SHALL pin the same instant, with the same wall-clock status, as on a modern engine, because the offsets come from the zone rules and not from the engine. The zone MUST stay stored and compared by its canonical ID. Resolving a wall-time input MUST NOT use BigInt at run time. <!-- implements FR13 of add-wall-time-input-with-hint; FR1, FR5 of add-zone-rules-from-iana -->

#### Scenario: A renamed zone on outdated zone data
- **GIVEN** the engine rejects `Europe/Kyiv` and accepts `Europe/Kiev`
- **AND** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Kyiv (`Europe/Kyiv`)
- **WHEN** the user types `10:00` in Kyiv
- **THEN** the moment is pinned to `2026-03-08T08:00:00Z` with the status `UNIQUE`
- **AND** the stored zone of Kyiv is still `Europe/Kyiv`
