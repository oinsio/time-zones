# Handoff

**Apply order.** `set-home-location-and-show-differences` left two patches that `main` does not carry yet (`handoff/H1-glossary-home-location.patch`, `handoff/H2-architecture-docs-home-location.patch`, archived). H1 and H2 below are made against `main` as committed: on `main` they apply with plain `git apply`. After the two predecessor patches, apply them with `git apply -C0`, because the changes sit on adjacent lines. `--3way` does not help.

## H1: Glossary entries for the Here entry

**Serves:** FR1, FR2, FR8, FR11.
**Files:** `docs/glossary/locations.md`, `docs/glossary/search.md`, `docs/glossary/views.md`.
**Apply:** `git apply openspec/changes/show-here-entry-for-device-time/handoff/H1-glossary-here-entry.patch openspec/changes/show-here-entry-for-device-time/handoff/H1-glossary-location-row.patch` (`-C0` after the predecessors). Two files, because the predecessor inserts the Home mark and Location menu entries between the Location row and the Here entry, so one patch with both edits cannot apply after it.
**Verify:** `git status --short docs` lists the three files; `grep -c "useHereEntry" docs/glossary/locations.md` prints at least 1.
**Why manual:** the implement stage writes only under `packages/`, and the glossary lives in `docs/glossary/`.
**Automated part:** the code names are checked by `typecheck` and by the greps in task 10.3.

## H2: Architecture docs for the Here entry

**Serves:** FR3, FR4, FR7.
**Files:** `docs/architecture/views.md`, `docs/architecture/domain-model.md`.
**Apply:** `git apply openspec/changes/show-here-entry-for-device-time/handoff/H2-architecture-here-entry.patch` (`-C0` after the predecessors).
**Verify:** `git status --short docs` lists the two files; `grep -c "getHereEntry" docs/architecture/domain-model.md` prints 1.
**Why manual:** the implement stage writes only under `packages/`, and the architecture docs live in `docs/`.
**Automated part:** the behaviour is covered by the unit and E2E features of the change.
