# Handoff

**Apply order.** `set-home-location-and-show-differences` and `show-here-entry-for-device-time` (both archived) left patches that `main` does not carry yet (`H2-architecture-docs-home-location.patch`, `H2-architecture-here-entry.patch`). H1 and H2 below are made against `main` as committed: on `main` they apply with plain `git apply`. After the predecessor patches, apply them with `git apply -C0` if plain `git apply` refuses, because the changes sit on adjacent lines.

## H1: Glossary entries for the wall-time input

**Serves:** FR1, FR3, FR7, FR11.
**Files:** `docs/glossary/time-selection.md`, `docs/glossary/date-selection.md`.
**Apply:** `git apply openspec/changes/add-wall-time-input-with-hint/handoff/H1-glossary-wall-time-input.patch` (relative to this README: `H1-glossary-wall-time-input.patch`).
**Verify:** `git status --short docs` lists the two files; `grep -c "Wall-time target" docs/glossary/time-selection.md` prints 1; `grep -c "Wall-time hint\*\* \*(planned)" docs/glossary/date-selection.md` prints 0.
**Why manual:** the implement stage writes only under `packages/`, and the glossary lives in `docs/glossary/`.
**Automated part:** the code names are checked by `typecheck` and by the greps in task 8.3.

## H2: Architecture docs for the wall-time input

**Serves:** FR3, FR7, FR9, FR10.
**Files:** `docs/architecture/views.md`, `docs/architecture/domain-model.md`, `docs/architecture/open-questions.md`.
**Apply:** `git apply openspec/changes/add-wall-time-input-with-hint/handoff/H2-architecture-wall-time-input.patch` (relative to this README: `H2-architecture-wall-time-input.patch`; `-C0` after the predecessors if needed).
**Verify:** `git status --short docs` lists the three files; `grep -c "GMT-4" docs/architecture/views.md` prints 0; `grep -c "SET_WALL_TIME(target, time, date)" docs/architecture/domain-model.md` prints 1.
**Why manual:** the implement stage writes only under `packages/`, and the architecture docs live in `docs/`.
**Automated part:** the behaviour is covered by the unit and E2E features of the change.
