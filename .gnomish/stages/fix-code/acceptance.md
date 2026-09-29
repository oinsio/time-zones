# Acceptance criteria for the fix-code stage

The active change's `review-code.md` lists the reviewer's findings, each now closed
with a `Status` (`fixed` or `rejected (<reason>)`) and a `Resolution` — a check
before you has confirmed that shape. You arbitrate between the reviewer and
the fixer: neither is right by default.

- Every `fixed` finding is really fixed: the diff of this stage removes the
  problem at the cited location (or wherever the problem actually lived), and
  a behaviour fix comes with a test that would have failed before it.
- No fix did harm: it does not contradict the change's specs, `design.md`, an
  ADR under `docs/adr/`, `CLAUDE.md` or `.claude/rules/`, does not break an
  existing behaviour or test, and does not widen the change beyond its
  `tasks.md`. A fix that follows the review into harm fails this criterion —
  it should have been rejected.
- Every rejection is justified by evidence you can confirm: a
  `false-positive` shows the code does not have the problem; a
  `contradicts-spec` names the spec, decision, ADR or rule it would break, and
  it really would; `harmful` names the concrete breakage; `out-of-scope` points
  at code this change neither added nor depends on; `not-worth-it` weighs the
  defect against the fix. A rejection that dodges a real, cheap-to-fix defect
  fails this criterion — most of all for a CRITICAL finding.
- The fixes follow the project's rules: TDD evidence, Temporal and IANA ids,
  `fakeClock` in tests, constants instead of literals, descriptive names,
  imports only through a module's `index.ts`, i18n in every locale, every UI
  state handled, requirement references on new tests.
- Only the fixes changed: no unrelated refactoring. The findings text, their
  severities and the other sections of `review-code.md` are as the reviewer wrote
  them; `proposal.md`, `design.md`, `specs/` and `tasks.md` are unchanged;
  nothing under `openspec/specs/`, `openspec/changes/archive/`, `.gnomish/`,
  `.github/`, `.claude/` or `docs/adr/` changed.

Judge by reading `review-code.md`, the source, the OpenSpec change and the diff
only. Do not run the build or the tests: lint, typecheck, unit tests, build,
the bundle budget and the BDD E2E suite have already run as separate checks
before you, and their green result is a precondition of your review.
