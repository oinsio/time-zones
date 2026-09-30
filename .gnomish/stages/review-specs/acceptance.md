# Acceptance criteria for the review-specs stage

The active change under `openspec/changes/` holds a `review-specs.md` — a check
before you has already confirmed its sections, the shape of every finding,
that the Coverage table lists every id `proposal.md` defines, and that every
Summary number matches its section. Do not recount them.
Judge its substance. Be adversarial toward the findings: a wrong or harmful
finding costs more than a missing one, because the next stage will revise the
change on its strength.

- Freshness: every claim the Freshness section marks ✅ really holds in the
  code and in `openspec/specs/`, and every stale claim it reports really is
  stale.
- Coverage: its ✅/❌/`n/a` marks match the artifacts, and `n/a` is used only
  where `stages/review-specs/instructions.md` allows it for the id's kind.
- Every finding is real: the cited location exists and shows what the Problem
  describes.
- Every finding is worth fixing: the Impact names what concretely goes wrong if
  the change is implemented as written. A finding that is speculative, a matter
  of wording taste, or asks the change to do more than the task asked fails
  this criterion — it should have been dropped.
- Every proposed Fix helps: it keeps the change faithful to the task, does not
  contradict a stable spec in `openspec/specs/`, an ADR under `docs/adr/`,
  `CLAUDE.md` or `.claude/rules/` (including where a test belongs — jsdom unit
  vs E2E — and which layer may touch storage), does not contradict what the
  existing code already does, and its Fix risk is stated honestly.
- Severity matches impact: CRITICAL only when the change as written builds the
  wrong thing, misses the task, breaks existing behaviour undeclared, or breaks
  a domain rule or an ADR. Inflated severities fail this criterion.
- Nothing material is missed: no requirement without a scenario or a task,
  no task without an automated test, no missing required proposal section, no
  contradiction between artifacts or with the existing code, no design that
  breaks `.claude/rules/architecture.md` or an ADR, no stored raw UTC offset
  or non-Temporal date math in the specs, no named file or module that does
  not exist — without a finding. Fail this criterion only for a missed issue
  that would itself be CRITICAL or WARNING; a missed SUGGESTION-level polish
  is not a failure.
- The Verdict is consistent with the findings.

Judge by reading `review-specs.md`, the task in `.gnomish-task/task.json`, the
change's artifacts, `openspec/specs/`, `docs/adr/` and the source only. Do not
run the build, the tests or the OpenSpec CLI.
