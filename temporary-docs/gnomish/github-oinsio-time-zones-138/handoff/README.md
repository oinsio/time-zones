# Handoff of apply-data-updates-silently

## H1: CI gives the build its history

- **Serves:** FR1, FR2
- **Files:** `.github/workflows/ci.yml`
- **What:** two edits in the `check` job, both needed. The checkout gets `fetch-depth: 0`. The step "Check data-only paths" runs `git fetch --no-tags origin main` without `--depth=1`: that fetch runs before `pnpm build`, and with `--depth=1` it records the fetched commit as a shallow boundary; on a push to `main` that commit is `HEAD`, so the build would see one commit again and a data-only `HEAD` would get the unique `unreadable-<instant>` revision and a notice. Without `--depth` the fetch adds nothing to a full clone, and `check-paths` diffs `origin/main..HEAD` (two dots), which needs no merge base.
- **Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-138/handoff/H1-ci-fetch-history.patch`; applied to a copy of `ci.yml`, `grep -c "fetch-depth: 0"` prints 1 and `grep -c -- "--depth=1"` prints 0. After the next deploy whose newest commit is data-only, `app-revision.json` of the site names the newest commit without the trailer.
- **Why manual:** the factory may not edit `.github/`.
- **Automated part:** `resolveAppRevision` is unit-tested on fixture histories (task 2.1); without the patch a data-only build counts as an app change (a notice, as today), never the reverse.

## H2: ADR "Silent data updates and the app revision"

- **Serves:** FR1, FR3, FR8, FR9
- **Files:** `docs/adr/0018-silent-data-updates-and-the-app-revision.md` (new), `docs/adr/0014-zone-rules-from-iana.md` (a "Refined by" sentence in its status), `CLAUDE.md` (the ADR list)
- **What:** a new ADR on data-only commits, the app revision, the published file, the waiting worker left to the browser and the watched zones; alternatives: a custom service worker, a path list, skip-waiting without a reload. It refines ADR-0014 point 5 ("offers a reload").
- **Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-138/handoff/H2-adr-silent-data-updates.patch`; `grep -c "0018" CLAUDE.md` prints 1 after it.
- **Why manual:** the factory may not write `docs/adr/` or `CLAUDE.md`.
- **Automated part:** every decision is covered by the tests of groups 2–7.
