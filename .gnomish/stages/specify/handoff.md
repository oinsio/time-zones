# Handoff: what the factory cannot do itself

The implement stage runs in a sandbox with no human. It writes under
`packages/` and under `docs/` other than `docs/adr/`: the glossary, the
architecture docs and the design notes change in the same branch as the code
they describe, and the human reviews them in the same pull request. It touches
`packages/client/package.json` and the lockfile only when a task names the
dependency (`pnpm add`) or the script it adds. It never writes `.github/`,
`.claude/`, `docs/adr/`, `CLAUDE.md`, `.gnomish/`, or anything under
`openspec/` other than the checkboxes of `tasks.md`; its only other place is
the task's `temporary-docs/gnomish/<task>/handoff/` folder. It cannot push,
open or watch a pull request, read CI, or ask anyone anything. Every `- [ ]`
task must fit inside these limits, because the implement stage cannot finish
while a box is unticked.

`<task>` is the branch name without its `gnomish/` prefix. This file is shared
by the specify, review-specs, fix-specs, implement, fix-code and deliver
stages.

## Automate first

Before planning any step for a human, try to replace it, in this order:

1. **Do it inside the limits.** Put the code under `packages/`, the glossary
   entry or the architecture note under `docs/`, or name the `package.json`
   script in the task. A glossary or architecture doc change is never a
   handoff item.
2. **Turn the human check into a command the implement stage runs.** For
   example:
   - "ask the user for a full mutation run" becomes Stryker scoped to the
     changed files, at most 5 per run, with the score target from
     `.claude/rules/tdd-workflow.md`;
   - "confirm CI is green" becomes running the CI commands one at a time;
   - "check visually" becomes a visual-regression or axe-core assertion;
   - "check the docs mention X" becomes a grep in the task's verification.
3. **Leave it to a later factory stage.** The deliver stage pushes the branch
   and opens the pull request, and its checks verify the result. So "push and
   open a PR" is never a human step.

Only what is left after these three steps becomes a handoff item.

## Handoff items

A handoff item is a change the task needs that the factory may not make
itself, such as a CI job, a rule, an ADR, or a `CLAUDE.md` line. It can also be
a step only a human can take, on GitHub or on a physical device. Each item has
an id (`H1`, `H2`, …) and lives in three places, one after another.

**In `tasks.md`, the specify stage plans it.**
- The implement work for it is an ordinary checkbox task: "Handoff H1: write
  `H1-<slug>.patch` and its README section in the task's handoff folder".
  That task's verification includes `git apply --check` on the patch.
- A final `## Human follow-up` section lists every item as a plain bullet
  (`- `, never a checkbox), so the implement and archive checks skip it:

      - H1 (FR7): apply `H1-ci-benchmark-job.patch` — adds the non-blocking
        `benchmark` job to `.github/workflows/ci.yml`.
        Why manual: the factory may not edit `.github/`.
        Automated part: the budget script and its tests run in `pnpm test`.

  `Why manual:` names the concrete limit that stops automation: a forbidden
  path, no GitHub access in the sandbox, a physical device, or a judgement
  only a human can make. "Simpler by hand" is not a reason. `Automated part:`
  says what around the item is still tested automatically, or `none`. A step
  with no file change, such as a device check, spells out its steps in the
  bullet itself, so the archived `tasks.md` keeps them.
- No checkbox task depends on a handoff item. A test or a traceability grep
  that would read a file only the human writes goes into that item's patch,
  not into the checkbox tasks.

**In `temporary-docs/gnomish/<task>/handoff/`, the implement stage writes it.**
- `H<n>-<slug>.patch`: a unified diff from the repository root that the human
  applies with `git apply`. To make it, edit the target files in the working
  copy, then run `git diff -- <paths> > temporary-docs/gnomish/<task>/handoff/H<n>-<slug>.patch`
  (add `--binary` for new files after `git add -N`). Then restore them with
  `git checkout -- <paths>` and remove new ones. The patch must apply to the
  branch as committed, and the target files themselves stay untouched.
- `README.md`: one `## H<n>: <title>` section per item, in this order:
  - **Serves:** the requirement ids;
  - **Files:** the paths the patch changes, or `none`;
  - **Verify:** the commands that prove the item works once applied;
  - **Why manual:** and **Automated part:**, copied from `tasks.md`.
- An item with no file change has a README section and no patch.

**In the pull request, the deliver stage hands it over.** The cleanup stage
removes `temporary-docs/gnomish/<task>/` with the rest of the reports, so no
patch stays in the repository or in the archived change. The deliver stage
reads the folder from the commit before that removal and puts every item in
the pull request's "Human follow-up" section: the patch itself in a
collapsed `diff` block to review, and one command that applies it to the
checked-out pull request branch. The human applies the patches on the branch
before merging, so the change and its handoff land in `main` together and
nothing waits to be applied afterwards.
