# Acceptance criteria for the fix-specs stage

The active change's `review-specs.md` lists the reviewer's findings, each now
closed with a `Status` (`fixed` or `rejected (<reason>)`) and a `Resolution` —
checks before you have confirmed that shape, that only the change directory
changed, and that the change validates. You arbitrate between the reviewer and
the fixer: neither is right by default.

- Every `fixed` finding is really fixed: the change's artifacts now close the
  gap the finding describes, and the Resolution says where.
- No revision did harm: the change is still faithful to the task in
  `.gnomish-task/task.json` — not less, not more — and does not contradict a
  stable spec in `openspec/specs/`, an ADR under `docs/adr/`, `CLAUDE.md` or
  `.claude/rules/`. A revision that follows the review into harm fails this
  criterion — it should have been rejected.
- The artifacts are still coherent with one another after the revisions:
  every requirement id is defined in `proposal.md`, has a scenario in the spec
  deltas and a task naming its automated test; `design.md` and `tasks.md` do
  not contradict the revised proposal or specs.
- Every rejection is justified by evidence you can confirm: a
  `false-positive` shows the artifacts do not have the problem; a
  `contradicts-spec` names the task clause, spec, ADR or rule the edit would
  break, and it really would; `harmful` names the concrete harm;
  `out-of-scope` shows the finding asks for more than the task; `not-worth-it`
  weighs the gap against the edit. A rejection that dodges a real, cheap-to-close
  gap fails this criterion — most of all for a CRITICAL finding.
- The findings text, their severities and the other sections of
  `review-specs.md` are as the reviewer wrote them.

Judge by reading `review-specs.md`, the task, the change's artifacts,
`openspec/specs/`, `docs/adr/` and the diff only. Do not run the build, the
tests or the OpenSpec CLI.
