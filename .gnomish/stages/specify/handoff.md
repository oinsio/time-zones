# Handoff: what the factory cannot do itself

The implement stage runs in a sandbox with no human. It writes only under
`packages/`, and it touches `packages/client/package.json` and the lockfile
only when a task names the dependency (`pnpm add`) or the script it adds. It
never writes `.github/`, `.claude/`, `docs/adr/`, `CLAUDE.md`, `.gnomish/`, or
anything under `openspec/` other than the checkboxes of `tasks.md` and the
change's `handoff/` folder. It cannot push, open or watch a pull request, read
CI, or ask anyone anything. Every `- [ ]` task must fit inside these limits,
because the implement stage cannot finish while a box is unticked.

This file is shared by the specify, review-specs, fix-specs, implement and
deliver stages.

## Automate first

Before planning any step for a human, try to replace it, in this order:

1. **Do it inside the limits.** Put the code under `packages/`, or name the
   `package.json` script in the task.
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
a step only a human can take on GitHub. Each item has an id (`H1`, `H2`, …)
and lives in two places.

**In `tasks.md`, the specify stage plans it.**
- The implement work for it is an ordinary checkbox task: "Handoff H1: write
  `handoff/H1-<slug>.patch` and its README section". That task's
  verification includes `git apply --check` on the patch.
- A final `## Human follow-up` section lists every item as a plain bullet
  (`- `, never a checkbox), so the implement and archive checks skip it:

      - H1 (FR7): apply `handoff/H1-ci-benchmark-job.patch` — adds the
        non-blocking `benchmark` job to `.github/workflows/ci.yml`.
        Why manual: the factory may not edit `.github/`.
        Automated part: the budget script and its tests run in `pnpm test`.

  `Why manual:` names the concrete limit that stops automation: a forbidden
  path, no GitHub access in the sandbox, or a judgement only a human can
  make. "Simpler by hand" is not a reason. `Automated part:` says what around
  the item is still tested automatically, or `none`.
- No checkbox task depends on a handoff item. A test or a traceability grep
  that would read a file only the human writes goes into that item's patch,
  not into the checkbox tasks.

**In `openspec/changes/<name>/handoff/`, the implement stage writes it.**
- `H<n>-<slug>.patch`: a unified diff from the repository root that the human
  applies with `git apply`. To make it, edit the target files in the working
  copy, then run `git diff -- <paths> > <change>/handoff/H<n>-<slug>.patch`
  (add `--binary` for new files after `git add -N`). Then restore them with
  `git checkout -- <paths>` and remove new ones. The patch must apply to the
  branch as committed, and the target files themselves stay untouched.
- `README.md`: one `## H<n>: <title>` section per item, in this order:
  - **Serves:** the requirement ids;
  - **Files:** the paths the patch changes;
  - **Apply:** the exact command, run from the repository root, for example
    `git apply openspec/changes/<name>/handoff/H1-ci-benchmark-job.patch`.
    The archive stage moves the folder, so give the path as relative to this
    README as well;
  - **Verify:** the commands that prove the item works once applied;
  - **Why manual:** and **Automated part:**, copied from `tasks.md`.
- An item with no file change, such as a step on GitHub, has a README section
  and no patch.

The folder is archived together with the change, and the deliver stage lists
each item in the pull request. The human reviews the patches there, then
applies them.
