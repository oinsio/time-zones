# Handoff: add-zone-rules-from-iana

Apply each patch on the pull request branch with `git apply <patch>` before merging.

## H1: CI step "Check zone rules"

- **Serves:** FR8
- **Files:** `.github/workflows/ci.yml`
- **Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-119/handoff/H1-ci-zone-rules-check.patch`; after applying, `grep -n "zone-rules:check" .github/workflows/ci.yml` prints the step; `pnpm --filter @time-zones/client zone-rules:check` reports 0 differences.
- **Why manual:** the factory may not edit `.github/`.
- **Automated part:** the check script and its tests run in `pnpm test`.

## H2: Zone rules line and integer arithmetic exception in the Temporal rule

- **Serves:** FR1, FR6
- **Files:** `.claude/rules/temporal.md`
- **Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-119/handoff/H2-temporal-rule-zone-rules.patch`; after applying, `grep -c "getKnownZoneIds" .claude/rules/temporal.md` prints 1.
- **Why manual:** the factory may not edit `.claude/`.
- **Automated part:** none.

## H3: Status note on ADR-0006

- **Serves:** FR9
- **Files:** `docs/adr/0006-city-data-sources.md`
- **Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-119/handoff/H3-adr-0006-zone-list-note.patch`; after applying, `grep -c "ADR-0014" docs/adr/0006-city-data-sources.md` prints 1.
- **Why manual:** the factory may not edit `docs/adr/`.
- **Automated part:** none.
