# Handoff items

## H1: ADR-0009 device time location

- **Serves:** FR8, FR9, FR12.
- **Files:** `docs/adr/0009-device-time-location.md` (new), `docs/adr/0007-reference-zone-and-device-time.md`, `CLAUDE.md`.
- **Apply:** from the repository root, `git apply openspec/changes/add-settings-page-and-device-time-location/handoff/H1-adr-device-time-location.patch`; relative to this README, `H1-adr-device-time-location.patch`.
- **Verify:** `git apply --check` before applying; afterwards `grep -n "0009" CLAUDE.md docs/adr/0007-reference-zone-and-device-time.md` prints both files.
- **Why manual:** the implement stage may not write `docs/adr/` or `CLAUDE.md`, and accepting an ADR that supersedes an Accepted one is a human decision.
- **Automated part:** `git apply --check` in task 9.1. The behaviour the ADR records is covered by the tests of groups 1, 4, 7 and 8.

## H2: glossary and architecture docs

- **Serves:** FR4, FR5, FR8, FR11, FR16.
- **Files:** `docs/glossary/{locations,search,settings,architecture,app-shell,README}.md`, `docs/architecture/{views,domain-model,overview}.md`.
- **Apply:** from the repository root, `git apply openspec/changes/add-settings-page-and-device-time-location/handoff/H2-glossary-and-architecture-docs.patch`; relative to this README, `H2-glossary-and-architecture-docs.patch`.
- **Verify:** `git apply --check` before applying; afterwards `grep -rn "Here entry" docs/glossary` prints no definition of the term.
- **Why manual:** the implement stage writes only under `packages/` and the change's `handoff/` folder, and these documents live in `docs/`.
- **Automated part:** `git apply --check` in task 9.2, and the glossary grep of task 10.2 over the code.
