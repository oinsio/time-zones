## H1: ADR-0016 Day periods follow the sun

- **Serves:** FR1, FR3
- **Files:** `docs/adr/0016-day-periods-follow-the-sun.md`, `CLAUDE.md`
- **Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-136/handoff/H1-adr-day-periods-follow-the-sun.patch`, then after applying `grep -c 0016 CLAUDE.md`
- **Why manual:** the implementing stage may not write `docs/adr/` or `CLAUDE.md`.
- **Automated part:** the patch is checked with `git apply --check`; the decision it records is tested by the sun, day-period and presenter tests and closed in `docs/architecture/open-questions.md`.

## H2: design.md records the lazy sun support (D1, D4, risk)

- **Serves:** FR3, FR7, NFR-P2
- **Files:** `openspec/changes/bind-day-periods-to-sun/design.md`
- **Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-136/handoff/H2-design-sun-support-chunk.patch`
- **Why manual:** the implementing stage may not write under `openspec/`.
- **Automated part:** the patch is checked with `git apply --check`; the behaviour is tested by `sunRegistry.test.ts` and `mountApp.test.tsx`.
