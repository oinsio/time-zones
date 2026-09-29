# Implement stage instructions

The previous stage left one OpenSpec change under `openspec/changes/`. Your job
is to build exactly what it specifies in the Time Zones PWA
(`packages/client`), test-first, and leave CI green. The next stages archive the
change and open the pull request; they see your commits, not this conversation.

## Set up the working copy first

You are in a git worktree, not the project clone, so `node_modules` is absent.
Install it before anything else — nothing below runs without it:

    pnpm install --frozen-lockfile --prefer-offline

Never edit `package.json` or `pnpm-lock.yaml` to make an install or a test pass.
If the change genuinely needs a new dependency, `tasks.md` says so; otherwise
say in your closing summary what was missing instead of adding it.

## How to do it

Invoke the repository's own skill and follow it end to end:

    Skill(skill="openspec-apply-change", args="<change name>")

That is the same text a human on this project runs as `/opsx:apply`, so the
stage and hand work follow one procedure. `openspec list` names the active
changes; this task's branch added exactly one — that one is yours. If more than
one shows up, find yours with
`git diff --name-only $(git merge-base HEAD origin/main)...HEAD -- openspec/changes`.
Read its `proposal.md`, the spec deltas under `specs/`, `design.md` and
`tasks.md`. `tasks.md` is your work order — work through it in order.

**Nobody is going to answer you.** Where the skill would ask or pause for a
human, decide yourself within the spec. If a task turns out to be wrong or
impossible, do not quietly change the scope: finish what you can and explain
the blocker in your closing summary.

## What the skill cannot know

Read `CLAUDE.md` first — it is the project's own contract and wins over the
skill and these instructions where they disagree. The rules that matter most
here: `.claude/rules/tdd-workflow.md`, `.claude/rules/architecture.md`,
`.claude/rules/temporal.md`, `.claude/rules/code-style.md`,
`.claude/rules/naming.md`, `.claude/rules/i18n.md`,
`.claude/rules/ui-states.md`, `.claude/rules/bdd-unit.md`,
`.claude/rules/bdd-e2e.md`, `.claude/rules/traceability.md`,
`.claude/rules/process-invariants.md`. Match the patterns of the code already in
`packages/client/src/` before writing new code.

- **TDD.** For every behaviour: write the failing test, run it and see it fail,
  write the minimum code to pass, refactor. Run tests scoped to the file you
  are working on (`pnpm --filter @time-zones/client exec vitest run <path>`).
- **Tests one at a time.** Never run two test commands at once, never in the
  background, never relaunch before the previous run has finished. The
  `PostToolUse` hook already runs the client suite after each edit under
  `packages/client/` — read its output as feedback on your last edit.
- **Mutation testing, scoped.** When the production code of a task is done, run
  Stryker on the production files you added or changed, at most five at a time:
  `cd packages/client && npx stryker run --mutate '<file>'`, then read
  `packages/client/reports/mutation/mutation-report.json`. Kill survivors with
  better tests: target ≥95%, minimum ≥90%. NEVER run Stryker without `--mutate`
  and never `pnpm test:mutation` — the full suite freezes the machine. State
  the score per file in your closing summary.
- **Traceability.** New code and tests reference the requirement they
  implement: `Implements FR-X of <change-name>` in JSDoc, `@<change-name> @FRx`
  tags on Gherkin scenarios, `// Verifies NFR-Ax of <change-name>` on a11y
  tests.
- **Domain rules.** IANA identifiers are the source of truth for zones, never
  raw offsets; all date/time math via Temporal (`@/lib/temporal`), never
  `Date`; mock time with `fakeClock`, never `vi.useFakeTimers()`.
- **UI.** Every UI state — loading, error, empty, offline — not only the happy
  path; user-facing strings through i18n in both locales; accessible markup.
- **Files and modules.** Keep each file under 200 lines (300 is the hard cap);
  import only through a module's `index.ts`; no hardcoded values — constants
  and enums.
- **Scope.** Implement what the specs describe and nothing beyond it.

Tick each task in `tasks.md` (`- [ ]` → `- [x]`) as you finish it. That file is
the only thing under `openspec/` you may edit: the proposal, the specs and the
design are the contract you implement, not yours to rewrite. Do not touch
`.gnomish/`, `.github/`, `.claude/`, `docs/adr/` or anything under
`openspec/specs/` or `openspec/changes/archive/`.

## Before you stop

Run, one at a time, what CI runs — the stage re-runs exactly these as checks:
`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`,
`pnpm --filter @time-zones/client check:bundle-size`,
`pnpm --filter @time-zones/client test:bdd`. All must pass.

Commit as you go, and often — one commit per finished task is a good rhythm;
small commits on the task branch are what makes an attempt readable
afterwards. Never push: the factory owns the remote and pushes the branch
itself.

Keep your output small. There is no hard ceiling — the factory drains the
round's stdout while it runs — but every printed byte is context and money. So:
pipe long command output through `tail -30`, never `git show`/`git log -p` a
whole commit, read the specific lines you need rather than whole files, and
keep your closing summary to a few sentences plus the mutation scores.
