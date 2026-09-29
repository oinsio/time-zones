# Fix-code stage instructions

An independent reviewer read the implementation of this task's OpenSpec change
and wrote `openspec/changes/<name>/review-code.md`. Your job is to close every
finding in it: fix the ones worth fixing, reject the rest with evidence, and
leave CI green. The next stages archive the change and open the pull request;
the human reviewer of that pull request reads your resolutions.

## Set up the working copy first

You are in a git worktree, so `node_modules` is absent. Install it first:

    pnpm install --frozen-lockfile --prefer-offline

Never edit `package.json` or `pnpm-lock.yaml` to make an install or a test pass.

## Triage before you touch code

The review is advice, not orders. A reviewer can be wrong, and a fix can hurt
more than the defect — including a CRITICAL one. For every finding, in order,
before editing anything:

1. **Confirm it.** Open the cited `file:line`. Does the code really do what the
   Problem says? Does the Impact scenario really happen?
2. **Check it against the contract.** Would the proposed Fix contradict the
   change's specs, `design.md`, an ADR in `docs/adr/`, `CLAUDE.md` or
   `.claude/rules/`? Would it widen the change beyond what `tasks.md` asks?
3. **Weigh it.** Is the defect's cost worth the fix's cost and its Fix risk?

**ADRs.** List `docs/adr/` fresh every time — new ADRs are added over time, so
never assume a fixed set. Only an ADR whose status is `Accepted` binds; one
marked `Superseded by ADR-XXXX` is replaced by that ADR, and `Proposed`,
`Rejected` or `Deprecated` ones bind nothing. Read the ones whose subject the
change touches — the titles tell you which.

Then decide: **fix** it, or **reject** it with one of these reasons:

- `false-positive` — the code does not have the problem; cite what proves it.
- `contradicts-spec` — the fix would break a spec, `design.md`, an ADR or a
  project rule; cite which.
- `harmful` — the fix would break behaviour, tests, accessibility, performance
  or the offline guarantee; say how.
- `out-of-scope` — the finding is about code this change neither added nor
  depends on; it belongs in a new task.
- `not-worth-it` — real but the fix costs more than the defect. Allowed for
  any severity, but for a CRITICAL it needs an argument that would convince
  the human reviewer.

Do not reject to save effort: a rejection without evidence fails the stage.
If the Fix is wrong but the Problem is real, fix the problem your own way and
say so.

## Fixing

Read `CLAUDE.md` first — it wins over these instructions where they disagree.
Fix with the same discipline as the implement stage:

- **TDD.** A behaviour fix starts with a failing test that reproduces the
  finding; then the minimum code to pass; then refactor. Run tests scoped to
  the file: `pnpm --filter @time-zones/client exec vitest run <path>`.
- **Tests one at a time.** Never two test commands at once, never in the
  background. The `PostToolUse` hook runs the client suite after each edit
  under `packages/client/` — read it as feedback on your last edit.
- **Mutation, scoped.** If you changed production code or fixed a mutation
  finding, re-run Stryker on those files, at most five per run:
  `cd packages/client && npx stryker run --mutate '<file>'`, then read
  `packages/client/reports/mutation/mutation-report.json`. Target ≥95%,
  minimum ≥90%. NEVER run Stryker without `--mutate`, never
  `pnpm test:mutation`.
- **Traceability, domain and UI rules** as in the implement stage: requirement
  references on new tests, Temporal only, IANA ids only, `fakeClock`, i18n in
  every locale, all UI states, constants instead of literals, imports through
  `index.ts`, files under 200 lines.
- Fix only what the findings you accept require — no unrelated refactoring.

## Recording the resolution

In `review-code.md`, for every finding, replace `- Status: open` with the outcome
and add a `- Resolution:` line directly under it:

    - Status: fixed
    - Resolution: extracted `CLOCK_TICK_INTERVAL_MS` reuse in useClock.ts;
      covered by useClock.spec.ts "ticks every second".

    - Status: rejected (contradicts-spec)
    - Resolution: design.md D2 requires the offset to be recomputed per render
      for DST; caching it as proposed would show stale times after a transition.

Change nothing else in `review-code.md` — not the findings, not their severity,
not the other sections. It is the reviewer's record plus your answers.

## Rules

- You may edit `packages/client/` and the `Status`/`Resolution` lines of
  `review-code.md`. `proposal.md`, `design.md`, `specs/`, `tasks.md`,
  `openspec/specs/`, `openspec/changes/archive/`, `.gnomish/`, `.github/`,
  `.claude/` and `docs/adr/` stay untouched.
- **Nobody is going to answer you.** Decide within the specs and the rules.
- Before you stop, run one at a time what CI runs — the stage re-runs exactly
  these: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`,
  `pnpm --filter @time-zones/client check:bundle-size`,
  `pnpm --filter @time-zones/client test:bdd`.
- Commit as you go — one commit per fixed finding, subject starting with its
  id (`R3: reuse clock tick interval`). Never push: the factory owns the remote.

Keep your output small: pipe long command output through `tail -30`, read the
lines you need rather than whole files, and keep your closing summary to the
count of fixed and rejected findings plus the mutation scores.
