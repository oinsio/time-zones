# ADR-0010: Device time location — a removable kind of location

## Status
Accepted (2026-10-30)

Partly supersedes [ADR-0007](0007-reference-zone-and-device-time.md): the derived Here entry and First launch sections.

## Context

ADR-0007 showed the device time as a derived **Here entry**: not stored, not removable, not reorderable, never home. Users could not remove it, move it or pick it as home, and the empty list never appeared. A new user also had a list that was empty in storage but not on screen.

## Decision

- The device time is a **location kind** of the list (`LocationKind.DEVICE_TIME`). It is stored as a kind without a zone, so the device time zone is never stored.
- It is removable, reorderable, can be home and is offered in the search while it is not listed (`ADD_DEVICE_TIME_LOCATION`, `isDeviceTimeOptionShown`).
- The first-launch list holds it (`buildFirstLaunchLocations`). After that the stored list is the truth: removing everything leaves an empty list across reloads.
- The document schema version is 3; a version 2 document is migrated.
- Kept from ADR-0007: the reference zone rule, the Here mark and "the device time zone is never stored".

## Consequences
Positive:
- One row kind with the same controls as every other card.
- The list on screen equals the stored list.

Negative:
- The migration lists the device time location first in every version 2 document, also in an empty one, so an existing user who had emptied the list sees the device time location once more.
