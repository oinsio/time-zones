# Handoff

## H1: Add ADR-0013 (meeting range at any minute)

- **Serves:** FR1, FR4
- **Files:** `docs/adr/0013-meeting-range-at-any-minute.md` (new), `docs/adr/0011-meeting-range-in-grid-view.md` (Status line only), `CLAUDE.md`
- **Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-114/handoff/H1-adr-0013-meeting-range-any-minute.patch`, then once applied `grep -n "Refines \[ADR-0011\]" docs/adr/0013-meeting-range-at-any-minute.md` and `grep -n "Refined by \[ADR-0013\]" docs/adr/0011-meeting-range-in-grid-view.md`
- **Numbering:** the number is 0013, not 0012, because `docs/architecture/overview.md` and `views.md` already link an ADR-0012 and an archived change planned a second one. If those land under another number, renumber before applying.
- **Why manual:** the factory may not write `docs/adr/` or `CLAUDE.md`.
- **Automated part:** the invariants the ADR records are tested by tasks 2.1–2.5. The docs that cite ADR-0013 are written and grepped in task 1.2.

## H2: Review re-approved meeting screenshots

- **Serves:** NFR-R2, FR7
- **Files:** none
- **Verify:** none re-written — every approved screenshot baseline passed unchanged on both projects.
- **Why manual:** deciding that a rendered page looks right against a design picture is a visual judgement only a human can make.
- **Automated part:** task 5.1 asserts the handle positions and the topmost elements, and every run compares the baselines.
