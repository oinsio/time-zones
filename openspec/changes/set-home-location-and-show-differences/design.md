# Design: Set home location and show differences

## Context

Driven by FR1–FR14, NFR-P1, NFR-P2, NFR-A1–NFR-A3, NFR-R1, NFR-R2 and UX1–UX3 of `proposal.md` (see proposal.md — Why). This change starts after `support-legacy-ios-12-safari` is archived, and the context below assumes its result: iOS Safari 12.5 is a supported engine, `src/lib/legacy/` exports `IS_POINTER_EVENTS_SUPPORTED`, and the legacy zone shim wraps `Intl.DateTimeFormat` before `temporal-polyfill` loads.

Current state, checked in `packages/client/src/`:

- `model/locations.ts` (161 lines): `WorldClockState = { locations, deviceTimeZoneId, reference }`; commands `ADD_LOCATION`, `REMOVE_LOCATION`, `REPLACE_LOCATIONS(locations)`, `MOVE_LOCATION`, `SET_DEVICE_TIME_ZONE`, `SET_DATE`, `SHIFT_DATE`, `RESET_TO_NOW`, `SELECT_INSTANT`. There is no home.
- `model/referenceMoment.ts`: `getReferenceZone(state)` returns `deviceTimeZoneId`. Every reference-zone reader already calls it: `model/dayTrack.ts` (reference day), `model/reduceReferenceMoment.ts` (date changes and the gap), `model/reduceSelectInstant.ts`, `controller/useReferenceMoment.ts` (date bar), `controller/useCalendarMonth.ts`.
- `model/locationMark.ts`: `LocationMarkKind { HERE }` and `getLocationMarkKind(location, deviceTimeZoneId)`, the only place that decides a row's mark. `presenter/locationMark.ts`: `LOCATION_MARK_TEXT_KEYS`, an exhaustive `Record<LocationMarkKind, …>`.
- `model/utcOffset.ts`: `getUtcOffsetMinutes(timeZoneId, instant)`, the owner of the UTC offset. `presenter/utcOffset.ts`: `formatUtcOffset(offsetMinutes, utcPrefix)` holds the sign, hours and `:MM` logic.
- `presenter/presentLocationRows.ts` (103 lines) builds `LocationRow` (`cityLabel`, `countryName`, `utcOffsetLabel`, `mark`, local time and date, `dayTrack`). `controller/useLocations.ts` presents rows with the device zone and the reference day.
- Storage: `adapters/locationsDocument.ts` serializes `{ schemaVersion: 1, payload: { locations } }`, and `LOCATION_MIGRATIONS` is empty. `model/parseStoredLocations.ts` validates the payload. `ports/locationRepository.ts`: `load(): LocationsLoadResult` (`LOADED` carries `locations`), `save(locations)`, `clear()`, `subscribe`. `controller/LocationsProvider.tsx` writes through `dispatchAndSchedule` (debounced) and turns external changes into `REPLACE_LOCATIONS`.
- Views: `views/shared/LocationRow.tsx` ends with a remove button (`X` icon). `LocationList.tsx` keeps `removeButtons` refs to move focus after a removal. `CardsView.tsx` owns the polite announcement region. dnd-kit sensors are attached to `DragHandle` only. `components/ui/` has only `dialog`. There is no menu component and no `@radix-ui/react-dropdown-menu`.
- `scripts/check-bundle-size.mjs` fails the build above 150 KB gzipped initial JavaScript.

Binding decisions: ADR-0002 (layers, commands as data, view contract), ADR-0003 (reference instant), ADR-0004 (versioned documents, migrations, repositories only write), ADR-0005 (shared blocks), ADR-0007 (home and reference zone), ADR-0008 (work bounds). No global decision is needed. ADR-0004 gets a note about load normalization (D6), which refines it without changing it.

## Goals / Non-Goals

**Goals:** one owner per concept. "Home ?? device" exists only in `getReferenceZone`. Mark priority exists only in `getLocationMarkKind`. Offsets are computed only by `getUtcOffsetMinutes`. Signed hours and minutes are formatted in one function. The location menu works the same on every supported engine.

**Non-Goals:** a generic menu component for other features, the Here entry, a general preferences document.

## Decisions

### D1. Model: home in the world clock state (FR1–FR3, FR10)

- `WorldClockState.homeLocationId: string | null`, `null` in `INITIAL_WORLD_CLOCK_STATE`.
- `SET_HOME_LOCATION { id: string | null }`. A `string` must name a location of the list whose zone is known (`canonicalizeTimeZoneId` accepts it), else `LOCATION_NOT_FOUND`. An equal value returns the same state object, so the store does not notify and nothing is written.
- `REMOVE_LOCATION` sets `homeLocationId` to `null` when it removes home. `MOVE_LOCATION` and `ADD_LOCATION` do not touch it.
- `REPLACE_LOCATIONS { locations, homeLocationId }`: the initial load, a change from another tab and the reset all pass home. The reducer keeps the invariant itself: a home id that is not in `locations` becomes `null` (domain-model invariant 1).

**Alternative:** a separate preferences store for home. Rejected: home must be removed together with its location in one reducer step, and it syncs exactly like the list.

### D2. Reference zone: only the body of `getReferenceZone` changes (FR4)

`getReferenceZone(state)` returns the home location's `timeZoneId` when `homeLocationId` is set, otherwise `deviceTimeZoneId`. No caller changes: the reference day, date changes, the gap note, the calendar and the date bar follow home automatically. A home change does not touch `state.reference`, so a live moment stays live and a pinned instant is kept.

### D3. Marks: a second kind in the one owner (FR7)

`LocationMarkKind.HOME = "home"`. `getLocationMarkKind(location, deviceTimeZoneId, homeLocationId)` returns `HOME` first, then `HERE`, then `undefined`. `LOCATION_MARK_TEXT_KEYS[HOME] = { accessibleLabelKey: "locations.homeMarkLabel" }` with no caption key. The exhaustive `Record` fails to compile until the texts exist. `views/shared/LocationMarkIcon.tsx` maps `HOME` to lucide `House`, outlined, in the accent colour, at `LOCATION_MARK_ICON_SIZE_PX`.

### D4. Offset difference: on top of `getUtcOffsetMinutes` (FR5, NFR-P1)

New `model/offsetDifference.ts`:

```
getReferenceOffsetMinutes(state, instant): number | undefined
    // getUtcOffsetMinutes(getReferenceZone(state), instant) — once per presentation
getOffsetDifferenceMinutes(location, rowOffsetMinutes, referenceOffsetMinutes, state): number | undefined
    // undefined when the row is home, or when no home is set and the row has the Here mark
    //   (isLocationInDeviceTimeZone), or when either offset is undefined
    // otherwise rowOffsetMinutes − referenceOffsetMinutes
```

`presentLocationRows` already computes each row's offset for the UTC label and passes the same number in, so a row needs no second offset lookup, and the reference offset is computed once (NFR-P1). The "no difference on the reference row" rule lives in the model. The view only renders what it gets.

**Legacy note (`support-legacy-ios-12-safari`):** offsets come only from `getUtcOffsetMinutes`, which reads `offsetNanoseconds` (a number) through `toZonedDateTimeISO`, the path the legacy zone shim covers. The new code uses no BigInt (`epochNanoseconds`) and calls no `toZonedDateTime` on a canonical ID directly, so a renamed home zone such as `Europe/Kyiv` works on outdated zone data.

**Alternative:** subtract offsets in the presenter. Rejected: it would split the rule "which rows have a difference" between model and presenter.

### D5. Presenter: one signed-offset formatter (FR6, NFR-A3)

`presenter/utcOffset.ts` extracts `formatSignedHoursMinutes(offsetMinutes)` → `{ sign, hours, minutes }` text parts with the typographic minus and `:MM` only when minutes are not zero. Both `formatUtcOffset` and the new `presenter/offsetDifference.ts` (`formatOffsetDifference(minutes, translate)`) call it.

- Visible text: whole hours → `t("locations.offsetDifferenceHours", { value: "−2" })` (`"{{value}} h"` / `"{{value}} ч"`). Hours with minutes → `"+0:30"` without a key. Zero → the hours key with `"0"`.
- Accessible text: `locations.offsetDifferenceAhead` / `offsetDifferenceBehind` with `{{duration}}`, and `offsetDifferenceSame`. The duration joins `locations.durationHours` and `locations.durationMinutes`, both with plural forms (`_one`, `_few`, `_many`, `_other`).
- `LocationRow` gets `offsetDifferenceLabel` and `offsetDifferenceAccessibleLabel`, both empty when there is no difference. `presentLocationRows` receives `homeLocationId` and the reference offset in `LocationRowsContext`.

Translation is resolved once per presentation for the fixed keys, so the formatter count of the existing work bound is unchanged.

### D6. Storage: schema version 2 with a migration (FR8, FR9)

- Payload v2: `{ locations: [...], homeLocationId: string | null }`. `LOCATIONS_SCHEMA_VERSION = 2`. `LOCATION_MIGRATIONS[1] = (payload) => ({ ...payload, homeLocationId: null })`, a pure function tested with a v1 fixture.
- `parseStoredLocations` rejects a `homeLocationId` that is neither a string nor `null` (unreadable). A string is canonicalized like the location ids. If it is not among the parsed ids, it becomes `null` (FR9). This is a load normalization: nothing is written on load.
- Port: `LocationsLoadResult.LOADED` carries `{ locations, homeLocationId }`. `save(snapshot: StoredLocations)` takes `{ locations, homeLocationId }`. The shared contract tests run against both adapters.
- `LocationsProvider` writes with `dispatchAndSchedule` for `SET_HOME_LOCATION`, so a home change is debounced and synced like any list change. External changes dispatch `REPLACE_LOCATIONS` with home.
- `docs/adr/0004` gets a note under "Versioned schema": a dangling reference inside a valid document is normalized on load, like a legacy zone name, instead of making the document unreadable.

### D7. Location menu: own click-driven component, no Radix (FR11, FR14, NFR-A2, NFR-P2, UX3)

New `views/shared/LocationMenu.tsx` (with `locationMenuKeys.ts` for the key mapping), a shared block:

- The trigger is a `<button aria-haspopup="menu" aria-expanded aria-controls>` that toggles on `click`. `click` exists on every supported engine. iOS Safari 12.5 sends it after a tap, never after a scroll.
- The menu is `role="menu"` with `role="menuitem"` buttons, absolutely positioned under the trigger and aligned to the card's end, inside the card (no portal), so it scrolls with the card and stays within 320 px.
- Keys (WAI-ARIA menu button): Enter, Space and Arrow Down on the trigger open the menu on the first item, Arrow Up opens it on the last item. Arrows move with wrap-around, Home and End jump, Enter and Space activate, Esc and Tab close. Esc returns focus to the trigger.
- Outside dismissal: a document listener on `pointerdown` when `IS_POINTER_EVENTS_SUPPORTED`, otherwise on `touchstart` and `mousedown`. That flag is the one owner of Pointer Events detection in `src/lib/legacy/`. Leaving focus (`focusout` outside the menu) also closes the menu.
- The trigger is not a dnd-kit activator, so opening the menu never starts a reorder. The menu sits outside the day track, so it never moves the handle.
- Items are built by `LocationRow` from the row: "Make home" or "Clear home" (none for an unknown zone), then "Remove". `LocationList` keeps `menuButtons` refs instead of `removeButtons` for focus after a removal, and focuses the same row's trigger after a home change.

**Alternatives considered:**

- *shadcn `dropdown-menu` (`@radix-ui/react-dropdown-menu`):* the trigger opens on `pointerdown`, and outside dismissal (`DismissableLayer`) listens to `pointerdown`. Neither fires on iOS 12.5, so the menu could open only by keyboard. Removing a location would become impossible there. Adapting it means a controlled `open`, an extra `onClick` and our own outside dismissal, which rewrites most of what we would take from it, and it adds roughly 8–10 KB gzipped to the initial JavaScript. Rejected.
- *Native `<select>` or `<details>`:* not a menu button for assistive technology, and its styling and focus behaviour differ by engine. Rejected.
- *Keeping the `×` button next to a separate home toggle:* rejected by the proposal (Q1).

`components/ui/` has no menu, so `LocationMenu` duplicates no existing component. No dependency is added, so the initial JavaScript grows by the component only. `check-bundle-size.mjs` keeps checking the 150 KB budget (NFR-P2).

### D8. Row layout, name and announcements (FR11, NFR-A3, UX1)

- `LocationRow` renders the difference after the city span and before the "here" caption: `text-sm font-semibold text-muted-foreground`, `aria-hidden`. A visually hidden span holds `offsetDifferenceAccessibleLabel` with its own id. The `<li>`'s `aria-labelledby` becomes `city [mark] [difference]`.
- `CardsView` reuses its polite announcement state for `locations.homeSetAnnouncement` ("{{city}} is now home") and `locations.homeClearedAnnouncement`.
- `controller/useLocations` exposes `setHomeLocation(id | null)` from `LocationsContext`.

## Risks / Trade-offs

- [An older app version open in another tab reads a v2 document as "newer" and shows the unreadable error] → It never overwrites the stored value by itself (glossary "Unreadable stored list"), and the update notice reloads it into the new version. Accepted.
- [Rolling this change back after users stored v2 documents shows the error with Reset] → Rollback plan: ship the rollback with `LOCATIONS_SCHEMA_VERSION = 2` and a parser that ignores `homeLocationId`, instead of reverting the version.
- [The own menu misses an edge of the WAI-ARIA pattern] → `locationMenuKeys.ts` is a pure key mapping with unit tests for every key. E2E checks the keyboard path, and axe-core checks the roles.
- [`touchstart` outside dismissal on iOS 12 could close the menu when a scroll starts outside it] → Accepted: closing on scroll is expected menu behaviour.
- [The menu overflows a card on very narrow screens] → It aligns to the card's end, has `max-width: 100%`, and NFR-R1 checks 320 px with the menu open.
- [Every screenshot baseline with rows changes] → Re-approval is a planned task, with the new "home" and "travelling" states.

## Migration Plan

1. Deploy: the first load of the new version migrates a v1 document in memory. It is written as v2 only after the user's next change (FR8).
2. Old tabs: see Risks. The update notice is the path to the new version.
3. Rollback: see Risks. Keep version 2 readable.
