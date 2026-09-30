# Acceptance criteria for the fix-code stage

The active change's `review-code.md` lists the reviewer's findings, each now closed
with a `Status` (`fixed` or `rejected (<reason>)`) and a `Resolution` — checks
before you have confirmed that shape, that nothing in `review-code.md` but
those lines changed, and that this stage edited nothing outside
`packages/client/`. You arbitrate between the reviewer and
the fixer: neither is right by default.

- Every `fixed` finding is really fixed: the code at the cited location (or
  wherever the problem actually lived) no longer has the problem, and a
  behaviour fix comes with a test that exercises the finding's failing
  scenario — the Resolution names it.
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
- The fixes stay within the findings: no unrelated refactoring in the code the
  Resolutions point at.

Judge by reading `review-code.md`, the source and the OpenSpec change only.
You have no git: judge the files as they are now; what changed and what did not is already enforced by the command checks before you. Do not run the build or the tests: lint, typecheck, unit tests, build,
the bundle budget and the BDD E2E suite have already run as separate checks
before you, and their green result is a precondition of your review.

Start from `review-code.md`: each finding's Location and Resolution name
the files you need to open. Do not walk the whole tree.

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
