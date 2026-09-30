# Acceptance criteria for the review-code stage

The active change under `openspec/changes/` holds a `review-code.md` — checks
before you have already confirmed its sections, the shape of every finding,
that the Tasks section has one line per task in `tasks.md`, that the
Requirements section lists every `FR`, `NFR-*`, `UX` and `M` id and one line
per delta-spec scenario, and that every Summary number matches its section.
Do not recount them.
Judge its substance. Be adversarial toward the findings: a wrong or harmful
finding costs more than a missing one, because the next stage will act on it.

- Coverage: each Tasks and Requirements line carries evidence you can
  confirm in the code. A task or requirement marked ✅ that the code does not
  implement fails this criterion. `G`, `NG` and `Q` ids are not listed.
- Every finding is real: the cited `file:line` exists and shows what the
  Problem describes, in code this branch added or changed (a defect in
  untouched code is in scope only if the change depends on it).
- Every finding is worth fixing: the Impact names a concrete failing scenario
  or a concrete project rule and its cost, not a matter of taste. A finding
  that is speculative, stylistic without a rule behind it, or whose impact is
  negligible fails this criterion — it should have been dropped.
- Every proposed Fix helps: it does not contradict the change's specs,
  `design.md`, an ADR under `docs/adr/`, `CLAUDE.md` or `.claude/rules/`, does
  not widen the change's scope, puts a test where `.claude/rules/bdd-unit.md`
  and `bdd-e2e.md` say it belongs, and its Fix risk is stated honestly —
  including what the existing code already does around it. A fix that would
  do more harm than the defect fails this criterion.
- Severity matches impact: CRITICAL only for wrong user-visible behaviour, an
  unmet requirement, data loss, a security hole or a ticked-but-undone task.
  Inflated severities fail this criterion.
- Nothing obvious is missed: no requirement left unimplemented or untested, no
  use of `Date` instead of Temporal, no raw UTC offsets, no uncleaned timer or
  subscription, no hardcoded value where a constant exists, no import from a
  sibling module's internals, no storage, clock or network access outside the
  ports `.claude/rules/architecture.md` names — in the changed code — without
  a finding. Fail this criterion only for a missed issue that would itself be
  CRITICAL or WARNING; a missed SUGGESTION-level polish is not a failure.
- The Mutation section reports only scores that were actually measured, or
  says why none were.
- The Verdict is consistent with the findings.

Judge by reading `review-code.md`, the change's OpenSpec artifacts and the
source only; each finding's Location tells you where to look. You have no git: judge the files as they are now; what changed and what did not is already enforced by the command checks before you. Do not run the build, the tests or Stryker.
