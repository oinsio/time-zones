# Handoff

## H1: Glossary entries for the home location

**Serves:** FR5, FR7, FR11.
**Files:** `docs/glossary/time.md`, `docs/glossary/locations.md`, `docs/glossary/views.md`.
**Apply:** `git apply openspec/changes/set-home-location-and-show-differences/handoff/H1-glossary-home-location.patch` (from this README: `H1-glossary-home-location.patch`).
**Verify:** `git status --short docs` lists the three files; `grep -rn "planned" docs/glossary/time.md` no longer shows Home location or Offset difference.
**Why manual:** the implement stage writes only under `packages/`, and the glossary lives in `docs/glossary/`.
**Automated part:** the code names are checked by `typecheck` and by the greps in task 10.3.

## H2: Architecture docs and the ADR-0004 note

**Serves:** FR4, FR7, FR9, FR11.
**Files:** `docs/architecture/views.md`, `docs/architecture/domain-model.md`, `docs/adr/0004-local-persistence-strategy.md`.
**Apply:** `git apply openspec/changes/set-home-location-and-show-differences/handoff/H2-architecture-docs-home-location.patch` (from this README: `H2-architecture-docs-home-location.patch`).
**Verify:** `git status --short docs` lists the three files.
**Why manual:** the factory may not write `docs/adr/`, and the implement stage writes only under `packages/`.
**Automated part:** the behaviour is covered by the unit and E2E features of the change.

## H3: Device acceptance on iOS 12.5.7

**Serves:** FR14.
**Files:** none.
**Apply:** no patch. On the owner's iOS 12.5.7 device, open the app and:
1. tap a location's «⋯» button: the menu opens;
2. tap "Make home": the row gets the house icon and the other rows show their difference;
3. open the menu of the home row and tap "Clear home": the house icon goes;
4. tap "Remove" in a menu: the location goes;
5. open a menu and tap outside it: the menu closes and the list is unchanged.
**Verify:** all five steps work. `grep -c "^## H" openspec/changes/set-home-location-and-show-differences/handoff/README.md` prints 3.
**Why manual:** no automated runner provides iOS Safari 12 (NG9 of `support-legacy-ios-12-safari`), and the check needs the owner's physical device.
**Automated part:** the menu is tested with `PointerEvent` removed in jsdom and by tap in Chromium with Pointer Events suppressed.
