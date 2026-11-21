# Handoff of move-meeting-range-and-extend-past-midnight

## H1: ADR-0019 meeting range past the reference day

**Serves:** FR1, FR6, FR14 (D12)

**Files:**
- `docs/adr/0019-meeting-range-past-the-reference-day-and-moved-whole.md` (new)
- `docs/adr/0011-meeting-range-in-grid-view.md` (the "Refined by ADR-0019" line)
- `CLAUDE.md` (the ADR list)

**Verify:**
- `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-155/handoff/H1-adr-0019-meeting-range-past-the-reference-day.patch` exits 0;
- after `git apply`, `grep -c "ADR-0019" docs/adr/0011-meeting-range-in-grid-view.md` prints 1 and `grep -c "0019 meeting range past the reference day" CLAUDE.md` prints 1.

**Why manual:** the implement stage may not write `docs/adr/` or `CLAUDE.md`, and accepting a global decision is the owner's judgement.

**Automated part:** the behaviour the ADR records is covered by the unit, BDD and E2E tasks of groups 2–9; task 1.2 adds the ADR to the table of `docs/architecture/overview.md`.
