# Handoff

Items the factory may not apply itself. Apply the patches on the pull request branch before merging, from the repository root.

## H1: ADR-0015 cached copies of published data

- **Serves:** FR6, FR9 of add-remote-zone-rules-updates.
- **Files:** `docs/adr/0015-cached-copies-of-published-data.md` (new), `.claude/rules/architecture.md`, `CLAUDE.md`. `docs/adr/0004-local-persistence-strategy.md` stays unchanged.
- **Verify:** `git apply --check temporary-docs/gnomish/<task>/handoff/H1-adr-0015-cached-published-data.patch` before applying, `git apply` to apply; then `grep -c "ADR-0015" .claude/rules/architecture.md` prints 1, `grep -c "0015" CLAUDE.md` prints at least 1, and `git diff --quiet -- docs/adr/0004-local-persistence-strategy.md` succeeds. Set the date in the ADR's Status to the merge date.
- **Why manual:** the factory may not write `docs/adr/`, `.claude/` or `CLAUDE.md`, and accepting a global ADR is a judgement only a human can make.
- **Automated part:** the stored release contract tests and the active release tests (tasks 3.1, 4.1–4.3) prove the behaviour ADR-0015 describes; `git apply --check` proves the patch applies.

## H2: zone rules publication workflow

- **Serves:** FR1 of add-remote-zone-rules-updates.
- **Files:** `.github/workflows/zone-rules-publication.yml` (new), `.github/workflows/deploy.yml` (adds `workflow_call` with input `ref`, passed to `ci.yml`), `.github/workflows/ci.yml` (adds input `ref`, used by the checkout of the `check` job; empty means the triggering commit).
- **Verify:** `git apply --check temporary-docs/gnomish/<task>/handoff/H2-zone-rules-publication-workflow.patch`; after applying, `actionlint .github/workflows/zone-rules-publication.yml .github/workflows/deploy.yml .github/workflows/ci.yml`.
- **Why manual:** the factory may not edit `.github/`.
- **Automated part:** the release decision (`findReleaseToPublish`), the compiler, the zone rules check and the served files are tested in `pnpm test` (tasks 2.2, 8.1–8.4), and `pnpm test` holds for any committed release name (task 8.3); `git apply --check` proves the patch applies.

## H3: first run of the publication

- **Serves:** FR1, M7 of add-remote-zone-rules-updates.
- **Files:** none.
- **Verify:** after merge, open Actions → "Zone rules publication" → Run workflow on `main`. The run ends with "already current", or with a commit "Update zone rules to <release>" followed by a successful deploy whose site serves `zone-rules/version.json` naming that release. If GitHub later disables the schedule, re-enable it from the same page.
- **Why manual:** the sandbox has no GitHub access, and the workflow runs only on `main` after merge.
- **Automated part:** the scripts the workflow runs are tested in `pnpm test`; `actionlint` in H2's Verify checks the workflow files.
