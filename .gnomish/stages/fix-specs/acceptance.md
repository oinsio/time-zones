# Acceptance criteria for the fix-specs stage

The active change's `review-specs.md` lists the reviewer's findings, each now
closed with a `Status` (`fixed` or `rejected (<reason>)`) and a `Resolution` —
checks before you have confirmed that shape, that only the change directory
changed, that nothing in `review-specs.md` but those lines changed, and that
the change validates. You arbitrate between the reviewer and
the fixer: neither is right by default.

- Every `fixed` finding is really fixed: the change's artifacts now close the
  gap the finding describes, and the Resolution says where.
- No revision did harm: the change is still faithful to the task in
  `.gnomish-task/task.json` — not less, not more — and does not contradict a
  stable spec in `openspec/specs/`, an ADR under `docs/adr/`, `CLAUDE.md` or
  `.claude/rules/`. A revision that follows the review into harm fails this
  criterion — it should have been rejected.
- The artifacts are still coherent with one another after the revisions:
  every id is defined in `proposal.md`; every `FR`, `NFR-*` and `UX` id has a
  scenario in the spec deltas and a task naming its automated test, every `M`
  id a task (`G`, `NG` and `Q` ids need neither, as in the review's Coverage
  rules); `design.md` and `tasks.md` do not contradict the revised proposal
  or specs, `.claude/rules/architecture.md` or an ADR.
- Every rejection is justified by evidence you can confirm: a
  `false-positive` shows the artifacts do not have the problem; a
  `contradicts-spec` names the task clause, spec, ADR or rule the edit would
  break, and it really would; `harmful` names the concrete harm;
  `out-of-scope` shows the finding asks for more than the task; `not-worth-it`
  weighs the gap against the edit. A rejection that dodges a real, cheap-to-close
  gap fails this criterion — most of all for a CRITICAL finding.

Judge by reading `review-specs.md`, the task, the change's artifacts,
`openspec/specs/`, `docs/adr/`, `.claude/rules/` and the source only. You have no git: judge the files as they are now; what changed and what did not is already enforced by the command checks before you. Do not run the build, the
tests or the OpenSpec CLI.

Start from `review-specs.md`: each finding's Resolution names where the
change was edited. Do not walk the whole tree.

Your turns are limited and each one counts, however many tools it calls. Read
several files in one turn with parallel `Read` calls, check a pattern across
the tree with one `Grep` instead of opening files one by one, and keep a few
turns in reserve: a round that ends without the verdict JSON is lost,
whatever you found.

Check every criterion above before you give a verdict, and report every
violation you find — not the first few. A rejected round goes back for one
more attempt, and a violation you saw but did not report costs a whole attempt
later. When a finding cites a rule, an ADR or the code, quote what the source
actually says, so the fix is made against the source and not a paraphrase.
