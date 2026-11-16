## H1: ADR-0016 Day periods follow the sun

- **Serves:** FR1, FR3
- **Files:** `docs/adr/0016-day-periods-follow-the-sun.md`, `CLAUDE.md`
- **Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-136/handoff/H1-adr-day-periods-follow-the-sun.patch`, then after applying `grep -c 0016 CLAUDE.md`
- **Why manual:** the implementing stage may not write `docs/adr/` or `CLAUDE.md`.
- **Automated part:** the patch is checked with `git apply --check`; the decision it records is tested by the sun, day-period and presenter tests and closed in `docs/architecture/open-questions.md`.
