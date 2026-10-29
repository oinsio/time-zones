# Design: Set home location and show differences

## Context

Driven by FR1–FR14, NFR-P1, NFR-P2, NFR-A1–NFR-A3, NFR-R1, NFR-R2 and UX1–UX3 of `proposal.md` (see proposal.md — Why). It builds on the archived `support-legacy-ios-12-safari`. Current state, checked in `packages/client/` on main:

- `src/model/locations.ts` (161 lines) defines `WorldClockState = { locations, deviceTimeZoneId, reference }` and the commands `ADD_LOCATION`, `REMOVE_LOCATION`, `REPLACE_LOCATIONS(locations)`, `MOVE_LOCATION`, `SET_DEVICE_TIME_ZONE`, `SET_DATE`, `SHIFT_DATE`, `RESET_TO_NOW` and `SELECT_INSTANT`. There is no home. Ids are `buildLocationId(timeZoneId, label)`, the zone and the label joined by `ID_SEPARATOR` (`|`). Its test file `model/locations.test.ts` already has 237 lines.
- `model/referenceMoment.ts`: `getReferenceZone(state)` returns `deviceTimeZoneId`. Every place that reads the reference zone already calls it: `model/dayTrack.ts`, `model/reduceReferenceMoment.ts`, `model/reduceSelectInstant.ts`, `controller/useReferenceMoment.ts` and `controller/useCalendarMonth.ts`.
- `model/locationMark.ts` has `LocationMarkKind { HERE }` and `getLocationMarkKind(location, deviceTimeZoneId)`, which calls `isLocationInDeviceTimeZone`. `presenter/locationMark.ts` has `LOCATION_MARK_TEXT_KEYS`, an exhaustive `Record<LocationMarkKind, …>`.
- `model/utcOffset.ts`: `getUtcOffsetMinutes(timeZoneId, instant)` reads `offsetNanoseconds` from `instant.toZonedDateTimeISO(timeZoneId)`. `presenter/utcOffset.ts`: `formatUtcOffset(offsetMinutes, utcPrefix)` holds the sign, hours and `:MM` logic, using the `UTC_OFFSET_*` constants.
- `presenter/presentLocationRows.ts` (103 lines) takes `LocationRowsContext { language, instant, translate, deviceTimeZoneId, referenceDay }` and builds `LocationRow`. `controller/useLocations.ts` passes `deviceTimeZoneId` and `getReferenceDay(state, now)`.
- Storage: `adapters/locationsDocument.ts` writes `{ schemaVersion, payload: { locations } }` with `LOCATIONS_SCHEMA_VERSION = 1` (`constants/locations.ts`), and `LOCATION_MIGRATIONS` is `{}`. `model/parseStoredLocations.ts` canonicalizes each zone and rebuilds each id. `ports/locationRepository.ts` has `load()` (where `LOADED` carries `locations`), `save(locations)`, `clear()` and `subscribe`. `controller/LocationsProvider.tsx` (195 lines) writes through `dispatchAndSchedule` (debounced). It turns external changes and the reset into `REPLACE_LOCATIONS`.
- Views: `views/shared/LocationRow.tsx` ends with a remove button (lucide `X`, `aria-label` from `locations.removeLocation`, "Remove {{city}}"). The `<li>` is named by `aria-labelledby` = city [+ mark]. `LocationList.tsx` keeps `removeButtons` refs to move focus after a removal. It uses `PointerSensor`, or `TouchSensor` when `IS_POINTER_EVENTS_SUPPORTED` is false, and the sensors start a drag only from `DragHandle`'s activator. `CardsView.tsx` owns one polite announcement region (`addedAnnouncement`, `removedAnnouncement`). `components/ui/` has only `dialog`. There is no menu component, and `@radix-ui/react-dropdown-menu` is not a dependency. The installed `lucide-react` is 0.577.0, which ships `House`. `LocationRow.test.tsx` has 224 lines and `LocationList.test.tsx` 196.
- Legacy support (from the archived change): `src/lib/legacy/pointerEvents.ts` exports `IS_POINTER_EVENTS_SUPPORTED`, read once at module load and re-exported from `src/lib/legacy/index.ts`. `src/test/setup.ts` installs `FakePointerEvent` (`src/test/fakePointerEvent.ts`) when jsdom has none. A legacy unit test removes it with `vi.stubGlobal("PointerEvent", undefined)`, calls `vi.resetModules()` and imports the module again (`views/shared/DayTrack.legacy.test.tsx`). In E2E, `emulateEngineWithoutPointerEvents(page)` (`src/test/e2e/withoutPointerEvents.ts`) deletes `PointerEvent` and stops pointer events. `startTouch` and `dispatchTouch` (`locations/steps/locationsReorderE2eHelpers.ts`) drive taps. `src/test/noBigIntInSources.test.ts` fails on BigInt or `epochNanoseconds` in production sources. The zone shim is covered by `src/lib/legacy/zoneShim.temporal.test.ts`.
- Build checks: `scripts/check-bundle-size.mjs` (`check:bundle-size`, `INITIAL_JS_BUDGET_KB = 150`) and `scripts/check-legacy-build.mjs` (`check:legacy-build`) run after `pnpm build`. `build` itself (`tsc -b && vite build`) runs neither.

Binding decisions followed: ADR-0002 (layers, commands as data, view contract "set the home location"), ADR-0003 (reference instant, differences with minutes when needed), ADR-0004 (versioned documents, migrations with fixtures, repositories behind ports, last write wins), ADR-0005 (shared blocks, contract per view), ADR-0007 (optional home set only by the user, reference zone = home ?? device), ADR-0008 (work bounds, timing only in benchmarks). No new global decision is needed. The ADR-0004 note on load normalization (D6) refines the ADR without changing its decision, and it ships as the handoff patch H2.

## Goals / Non-Goals

**Goals:** one owner per concept. "Home ?? device" exists only in `getReferenceZone`. Mark priority exists only in `getLocationMarkKind`. Offsets are computed only by `getUtcOffsetMinutes`. Signed hours and minutes are formatted in one function. The location id format has one owner. The location menu works the same on every supported engine.

**Non-Goals:** a generic menu component for other features, the Here entry, a general preferences document.

## Decision

### D1. Model: home in the world clock state (FR1–FR3, FR10)

- `WorldClockState.homeLocationId: string | null`, `null` in `INITIAL_WORLD_CLOCK_STATE`.
- `SET_HOME_LOCATION { id: string | null }`, reduced in new `model/reduceHomeLocation.ts` (as `reduceSelectInstant.ts` is), so `locations.ts` stays under 200 lines. A `string` must name a location of the list whose zone `canonicalizeTimeZoneId` accepts. Otherwise the result is `LOCATION_NOT_FOUND`. An equal value returns the same state object, so the store does not notify and nothing is written.
- `REMOVE_LOCATION` sets `homeLocationId` to `null` when it removes home. `MOVE_LOCATION` and `ADD_LOCATION` do not touch it.
- `REPLACE_LOCATIONS { locations, homeLocationId }`: the initial load, a change from another tab and the reset (`null`) all pass home. The reducer keeps invariant 1 of `docs/architecture/domain-model.md` itself: a home id that is not in `locations` becomes `null`.
- `canonicalizeLocationId(id)` joins `buildLocationId` in `model/locations.ts`. It splits at the first `ID_SEPARATOR` (zone ids contain no `|`), canonicalizes the zone and rebuilds the id, or returns `undefined`. It stays the one owner of the id format, and the parser (D6) uses it.

### D2. Reference zone: decided only in `getReferenceZone`, followed by the gap note (FR4)

`getReferenceZone(state)` returns the home location's `timeZoneId` when `homeLocationId` is set, otherwise `deviceTimeZoneId`. It stays the one place that decides the reference zone, and no caller changes. The reference day, date changes, the calendar and the date bar's date follow home automatically.

The gap note does not. `buildDateBar` (`controller/useReferenceMoment.ts`) shows it from `reference.wallClockStatus` and `reference.requestedWallTime`, which `reduceReferenceMoment` resolved in the previous zone, and `SET_DEVICE_TIME_ZONE` already keeps `state.reference` today. So new `model/followReferenceZone.ts` exports `followReferenceZone(previous, next): WorldClockState`. `reduceLocations` calls it on the state of every successful command:

- when `getReferenceZone(previous)` equals `getReferenceZone(next)`, or the moment is live, or the pinned status is not `WallClockStatus.GAP`, it returns `next` unchanged, with the same `reference` object;
- otherwise it keeps the pinned instant and sets `wallClockStatus` to `UNIQUE` and `requestedWallTime` to the instant's wall time in the new reference zone.

Keying on `getReferenceZone` covers `SET_HOME_LOCATION`, `REMOVE_LOCATION` of home, `REPLACE_LOCATIONS` (another tab, the reset) and `SET_DEVICE_TIME_ZONE` without home in one place, in the model (ADR-0002). A live moment stays live, and a pinned instant is kept. Because a non-`GAP` reference keeps its object, `model/referenceMomentPicking.test.ts` ("should keep the reference when the device zone changes", which pins with `UNIQUE`) stays green. The stable "Wall-clock resolution on the new date" gains "or a change of the reference zone" (the `date-selection` delta).

### D3. Marks: a second kind in the one owner (FR7)

`LocationMarkKind.HOME = "home"`. `getLocationMarkKind(location, deviceTimeZoneId, homeLocationId)` returns `HOME` first, then `HERE` (through `isLocationInDeviceTimeZone`), then `undefined`. `LOCATION_MARK_TEXT_KEYS[HOME] = { accessibleLabelKey: "locations.homeMarkLabel" }` with no caption key. Because the `Record` is exhaustive, the code does not compile until those texts exist. `views/shared/LocationMarkIcon.tsx` maps `HOME` to lucide `House`, outlined, in the accent colour, at `LOCATION_MARK_ICON_SIZE_PX`.

### D4. Offset difference: on top of `getUtcOffsetMinutes` (FR5, NFR-P1)

New `model/offsetDifference.ts`:

```
getReferenceOffsetMinutes(state, instant): number | undefined
    // getUtcOffsetMinutes(getReferenceZone(state), instant)
getOffsetDifferenceMinutes(location, rowOffsetMinutes, referenceOffsetMinutes,
                           { deviceTimeZoneId, homeLocationId }): number | undefined
    // undefined when the row is home, when no home is set and the row is in the
    //   device zone (isLocationInDeviceTimeZone), or when either offset is undefined;
    // otherwise rowOffsetMinutes − referenceOffsetMinutes
```

`useLocations` calls `getReferenceOffsetMinutes` once per presentation and passes the number, together with `homeLocationId`, in `LocationRowsContext`. `presentLocationRows` already computes each row's offset for the UTC label and passes the same number in. A row therefore needs no second lookup, and the presenter cannot compute the reference offset per row (NFR-P1). The rule "which rows have a difference" lives in the model. The view only renders what it gets.

The work-bound step checks this by counting. A test-scoped spy on `Temporal.Instant.prototype.toZonedDateTimeISO` (from `@/lib/temporal`, as `src/test/workCounters.ts` spies on Temporal prototypes) counts lookups per zone argument. Among the 50 rows, the home location is the only one in `Asia/Almaty` and exactly one other row is the only one in `Europe/Moscow`. The rest are in other zones. Both rows do the same per-row work: their own UTC offset, local time and day track, and the home row's difference returns `undefined` without a lookup. The step computes the reference day before counting. It then counts while it calls `getReferenceOffsetMinutes` once and `presentLocationRows`, as `useLocations` does. It asserts that the lookups in `Asia/Almaty` exceed those in `Europe/Moscow` by at most 1, and that the formatter bounds of `startWorkCount()` hold. A reference offset computed per row would add 50 lookups in `Asia/Almaty` and fail the step. (Comparing a presentation with home against one without would not: both compute a reference offset.)

**Legacy engines:** `getUtcOffsetMinutes` reaches `Intl.DateTimeFormat` through `temporal-polyfill`. The legacy zone shim wraps that constructor before the polyfill is evaluated, so a home in a renamed zone (`Europe/Kyiv`) gets its offset on outdated zone data. The new model code reads only the numeric `offsetNanoseconds` through `getUtcOffsetMinutes`. It uses no BigInt and no `epochNanoseconds`, which `noBigIntInSources.test.ts` enforces.

### D5. Presenter: one signed-offset formatter (FR6, NFR-A3)

`presenter/utcOffset.ts` extracts `formatSignedHoursMinutes(offsetMinutes)` → `{ sign, hours, minutes }` text parts, with the typographic minus (`UTC_OFFSET_MINUS_SIGN`) and `:MM` only when the minutes are not zero. Both `formatUtcOffset` and the new `presenter/offsetDifference.ts` (`formatOffsetDifference(minutes, translate)`) call it.

- Visible text: whole hours → `t("locations.offsetDifferenceHours", { value: "−2" })` (`"{{value}} h"` / `"{{value}} ч"`). Hours with minutes → `"+0:30"`, with no key. Zero → the hours key with `"0"`.
- Accessible text: `locations.offsetDifferenceAhead` / `offsetDifferenceBehind` with `{{duration}}`, and `offsetDifferenceSame`. The duration joins `locations.durationHours` and `locations.durationMinutes` with `count`, with plural forms per `.claude/rules/i18n.md` (`_one`, `_few`, `_many` for Russian; `_one`, `_other` for English).
- `LocationRow` gets `offsetDifferenceLabel` and `offsetDifferenceAccessibleLabel`, both empty when there is no difference. `LocationRowsContext` gains `homeLocationId` and `referenceOffsetMinutes`.

The difference texts call `translate` only, so the formatter count of the existing work bound is unchanged.

### D6. Storage: schema version 2 with a migration (FR8, FR9)

- Payload v2: `{ locations: [...], homeLocationId: string | null }`. `LOCATIONS_SCHEMA_VERSION = 2`. `LOCATION_MIGRATIONS[1] = (payload) => ({ ...payload, homeLocationId: null })`, a pure function tested with a v1 fixture.
- `parseStoredLocations` returns `{ ok: true, locations, homeLocationId }`. It rejects a `homeLocationId` that is neither a string nor `null`, so the list is unreadable. A string is canonicalized with `canonicalizeLocationId`. If the result is not among the parsed ids, it becomes `null` (FR9). This is a load normalization: nothing is written on load.
- Port: `StoredLocations = { locations, homeLocationId }`. `LocationsLoadResult.LOADED` carries both fields, and `save(snapshot: StoredLocations)` takes them. The shared contract tests (`adapters/locationRepository.contract.ts`) run against both adapters.
- `LocationsProvider` writes `SET_HOME_LOCATION` through `dispatchAndSchedule`, so a home change is debounced and synced like any list change. External changes dispatch `REPLACE_LOCATIONS` with home. The provider is at 195 lines. Its action builders move to new `controller/createLocationsActions.ts`, so both files stay under 200.
- The ADR-0004 note (handoff H2) goes under "Versioned schema from day one". It says that a dangling reference inside an otherwise valid document is normalized on load, as a legacy zone name is, instead of making the document unreadable.

### D7. Location menu: own click-driven component, no Radix (FR11, FR14, NFR-A2, NFR-P2, UX3)

New `views/shared/LocationMenu.tsx`, a shared block, with the pure key mapping in `views/shared/locationMenuKeys.ts` (like `dayTrackKeys.ts`):

- The trigger is a `<button aria-haspopup="menu" aria-expanded aria-controls>` named by `locations.locationMenu` ("Actions for {{city}}"). It toggles on `click`, which every supported engine fires. iOS Safari 12.5 sends `click` after a tap, never after a scroll.
- The menu is `role="menu"` with `role="menuitem"` buttons. It is positioned absolutely under the trigger and aligned to the card's end, inside the card (no portal), so it scrolls with the card and stays within 320 px.
- Keys (WAI-ARIA menu button): Enter, Space and Arrow Down on the trigger open the menu on the first item, and Arrow Up opens it on the last item. The arrows move with wrap-around, Home and End jump, and Enter and Space activate. Esc and Tab close the menu, and Esc returns focus to the trigger.
- Outside dismissal: a document listener on `pointerdown` when `IS_POINTER_EVENTS_SUPPORTED` (imported from `@/lib/legacy`), otherwise on `touchstart` and `mousedown`. A `focusout` closes the menu only when its `relatedTarget` is an element outside the menu. A `focusout` with `relatedTarget === null` is ignored: WebKit (Safari, iOS 12.5 included) does not focus a `<button>` on a press or tap and blurs the focused item before `click`, so closing on it would unmount the menu and swallow the item's `click` (FR14). Taps outside are handled by the listeners above, and Tab closes the menu through the key mapping. The `role="menu"` container has `tabIndex={-1}`, so WebKit moves focus to the menu itself on a press inside it. A negative tabindex adds no Tab stop (NFR-A2).
- The trigger is not a dnd-kit activator, and only `DragHandle` is. So neither `PointerSensor` nor the legacy `TouchSensor` starts a reorder from the menu. The menu sits outside the day track, so it never moves the track's handle.
- `LocationRow` builds the items from the row: "Make home" or "Clear home" (none for an unknown zone), then "Remove" (`locations.remove`). The former key `locations.removeLocation` is deleted from both locales. `LocationList` keeps `menuButtons` refs instead of `removeButtons` for the focus after a removal, and after a home change it focuses the same row's trigger.

No dependency is added, so the initial JavaScript grows only by the component. `check:bundle-size` keeps the 150 KB budget, and `check:legacy-build` proves that the output stays parseable by Safari 12 (NFR-P2).

### D8. Row layout, name and announcements (FR11, NFR-A3, UX1)

- `LocationRow` renders the difference after the city span and before the "here" caption, as `text-sm font-semibold text-muted-foreground` with `aria-hidden`. A visually hidden span with its own id holds `offsetDifferenceAccessibleLabel`. The `<li>`'s `aria-labelledby` becomes `city [mark] [difference]`.
- `CardsView` reuses its polite announcement state for `locations.homeSetAnnouncement` ("{{city}} is now home") and `locations.homeClearedAnnouncement`.
- `controller/useLocations` exposes `setHomeLocation(id | null)` from `LocationsContext`.

## Consequences

Positive:
- Home changes one function body (`getReferenceZone`), and every reference-zone reader follows it. The one piece of state resolved in a zone, the gap note, is reset in one model helper (`followReferenceZone`) for every kind of zone change.
- One owner each for marks, offsets, signed-offset text and the id format, so no logic is duplicated.
- The menu works by tap without Pointer Events and adds no dependency.

Negative:
- An older app version open in another tab reads a v2 document as "newer" and shows the unreadable error. It never overwrites the stored value by itself (glossary "Unreadable stored list"), and the update notice reloads that tab into the new version. Accepted.
- Rolling this change back after users have stored v2 documents would show the error with Reset. Rollback plan: ship the rollback with `LOCATIONS_SCHEMA_VERSION = 2` and a parser that ignores `homeLocationId`, instead of reverting the version.
- Our own menu could miss an edge of the WAI-ARIA pattern. Mitigation: `locationMenuKeys.ts` is a pure key mapping with a unit test for every key, E2E checks the keyboard path, and axe-core checks the roles.
- On iOS 12, outside dismissal on `touchstart` closes the menu when a scroll starts outside it. That is expected menu behaviour.
- The menu could overflow a card on very narrow screens. Mitigation: it aligns to the card's end with `max-width: 100%`, and NFR-R1 checks 320 px with the menu open.
- Every screenshot baseline with rows changes. Re-approving them is a planned task, together with the new "home" and "travelling" states.

## Alternatives Considered

**A separate preferences store for home**: rejected. Home must be cleared together with its location in one reducer step, and it syncs exactly like the list.

**Subtracting offsets in the presenter**: rejected. It would split the rule "which rows have a difference" between the model and the presenter.

**shadcn `dropdown-menu` (`@radix-ui/react-dropdown-menu`)**: rejected. Its trigger opens on `pointerdown`, and its outside dismissal (`DismissableLayer`) listens to `pointerdown`. Neither fires on iOS 12.5, so the menu would open only by keyboard, and removing a location would become impossible there. Adapting it means a controlled `open`, an extra `onClick` and our own outside dismissal, which rewrites most of what we would take from it. It is also a new dependency in the initial JavaScript.

**A native `<select>` or `<details>`**: rejected. Neither is a menu button for assistive technology, and their styling and focus behaviour differ by engine.

**Keeping the `×` button next to a separate home toggle**: rejected by the proposal (Q1).

## Migration Plan

1. Deploy: the first load of the new version migrates a v1 document in memory. It is written as v2 only after the user's next change (FR8).
2. Old tabs: see Consequences. The update notice is the path to the new version.
3. Rollback: see Consequences. Keep version 2 readable.
