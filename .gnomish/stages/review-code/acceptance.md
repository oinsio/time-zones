# Acceptance criteria for the review-code stage

The active change under `openspec/changes/` holds a `review-code.md` — a check
before you has already confirmed its sections and the shape of every finding.
Judge its substance. Be adversarial toward the findings: a wrong or harmful
finding costs more than a missing one, because the next stage will act on it.

- Coverage: the Tasks section accounts for every task in `tasks.md` and the
  Requirements section for every requirement id in `proposal.md` and every
  scenario in the spec deltas, each with evidence you can confirm in the code.
  A task marked ✅ that the code does not implement fails this criterion.
- Every finding is real: the cited `file:line` exists and shows what the
  Problem describes, in code this branch added or changed (a defect in
  untouched code is in scope only if the change depends on it).
- Every finding is worth fixing: the Impact names a concrete failing scenario
  or a concrete project rule and its cost, not a matter of taste. A finding
  that is speculative, stylistic without a rule behind it, or whose impact is
  negligible fails this criterion — it should have been dropped.
- Every proposed Fix helps: it does not contradict the change's specs,
  `design.md`, an ADR under `docs/adr/`, `CLAUDE.md` or `.claude/rules/`, does
  not widen the change's scope, and its Fix risk is stated honestly. A fix
  that would do more harm than the defect fails this criterion.
- Severity matches impact: CRITICAL only for wrong user-visible behaviour, an
  unmet requirement, data loss, a security hole or a ticked-but-undone task.
  Inflated severities fail this criterion.
- Nothing obvious is missed: no requirement left unimplemented or untested, no
  use of `Date` instead of Temporal, no raw UTC offsets, no uncleaned timer or
  subscription, no hardcoded value where a constant exists, no import from a
  sibling module's internals — in the changed code — without a finding.
- The Mutation section reports only scores that were actually measured, or
  says why none were.
- The Verdict is consistent with the findings.

Judge by reading `review-code.md`, the change's OpenSpec artifacts, the source and
the diff only. Do not run the build, the tests or Stryker.
