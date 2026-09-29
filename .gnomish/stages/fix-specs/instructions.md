# Fix-specs stage instructions

An independent reviewer read this task's OpenSpec change before any code was
written and wrote `openspec/changes/<name>/review-specs.md`. Your job is to
close every finding in it: revise the change's artifacts for the findings worth
fixing, reject the rest with evidence, and leave the change valid. The
implement stage builds from the artifacts you leave; the human reviewer of the
final pull request reads your resolutions.

## Triage before you touch an artifact

The review is advice, not orders. A reviewer can be wrong, and an edit can hurt
more than the gap — including for a CRITICAL finding. For every finding, in
order, before editing anything:

1. **Confirm it.** Open the cited location — the artifact line, or the code it
   claims about. Is the gap really there? Would the Impact really happen?
2. **Check it against the task and the contract.** Read the task
   (`.gnomish-task/task.json`, read-only). Would the proposed edit take the
   change away from what the task asked, or beyond it? Would it contradict a
   stable spec in `openspec/specs/`, an ADR in `docs/adr/`, `CLAUDE.md` or
   `.claude/rules/`?
3. **Weigh it.** Is the gap's cost worth the edit's cost and its Fix risk?

**ADRs.** List `docs/adr/` fresh every time — new ADRs are added over time, so
never assume a fixed set. Only an ADR whose status is `Accepted` binds; one
marked `Superseded by ADR-XXXX` is replaced by that ADR, and `Proposed`,
`Rejected` or `Deprecated` ones bind nothing. Read the ones whose subject the
change touches — the titles tell you which.

Then decide: **fix** it, or **reject** it with one of these reasons:

- `false-positive` — the artifacts do not have the problem; cite what proves it.
- `contradicts-spec` — the edit would break the task, a stable spec, an ADR or
  a project rule; cite which.
- `harmful` — the edit would make the change worse to implement or test, or
  break existing behaviour; say how.
- `out-of-scope` — the finding asks for more than the task; it belongs in a new
  task.
- `not-worth-it` — real but the edit costs more than the gap. Allowed for any
  severity, but for a CRITICAL it needs an argument that would convince the
  human reviewer.

Do not reject to save effort: a rejection without evidence fails the stage.
If the Fix is wrong but the Problem is real, close the gap your own way and
say so.

## Revising the change

Read `CLAUDE.md` first — it wins over these instructions where they disagree.
Revise with the repository's own skill, so the artifacts stay coherent with
one another:

    Skill(skill="openspec-update-change", args="<change name>: <the accepted findings, in your own words>")

That is the same text a human on this project runs as `/opsx:update`. Where
the skill would ask or pause for a human, decide yourself within the task and
the rules — **nobody is going to answer you**. The rules the artifacts answer
to: `.claude/rules/proposal-format.md`, `delta-specs.md`,
`design-decisions.md`, `gherkin.md`, `traceability.md`, `test-planning.md`,
`ui-states.md`, `process-invariants.md`.

- A requirement you add or change keeps an id; a new requirement gets the next
  free id and a scenario and a task that names its automated test.
- Keep every artifact consistent after the edit: proposal → specs → design →
  tasks. A fix in one that leaves another contradicting it is not a fix.
- `openspec validate --changes --strict --no-interactive` must pass when you
  stop — the stage re-runs it.

## Recording the resolution

In `review-specs.md`, for every finding, replace `- Status: open` with the
outcome and add a `- Resolution:` line directly under it:

    - Status: fixed
    - Resolution: added scenario "Converting across a DST gap" to
      specs/time-conversion/spec.md and task 2.3 naming its .feature file.

    - Status: rejected (out-of-scope)
    - Resolution: the task asks only for the converter; a meeting planner
      view is a separate task.

Change nothing else in `review-specs.md` — not the findings, not their
severity, not the other sections.

## Rules

- You may edit only files under `openspec/changes/<name>/`: its artifacts and
  the `Status`/`Resolution` lines of `review-specs.md`. `packages/`, `docs/`,
  `openspec/specs/`, `openspec/changes/archive/`, `.gnomish/`, `.github/` and
  `.claude/` stay untouched; a check rejects anything else.
- Do not implement anything.
- Commit as you go — one commit per fixed finding, subject starting with its
  id (`R2: add DST gap scenario`). Never push: the factory owns the remote.

This stage writes only markdown, and the worktree has no `node_modules`; you
need none. If a `PostToolUse` hook speaks up, read it as feedback on the file
you just wrote, not as something to fix by installing dependencies.

Keep your output small: pipe long command output through `tail -30`, read the
lines you need rather than whole files, and keep your closing summary to the
count of fixed and rejected findings.
