# Acceptance criteria for the specify stage

Under `openspec/changes/` there is exactly one non-archived change directory,
holding the artifacts the `spec-driven` schema requires: `proposal.md`, spec
deltas under `specs/`, `design.md` and `tasks.md`. A change with no behavioural
delta may set `skip_specs: true` in its `.openspec.yaml` instead of shipping a
spec delta — but only when the task genuinely changes no behaviour.

- The proposal states why the change is needed and what changes, and its
  Capabilities section matches the spec files actually written.
- The change answers every constraint the task names — when the task points
  at the ADRs or the architecture, the change visibly builds on them.
- Every requirement, goal, non-goal, UX criterion and success metric carries an
  id (`FR1`, `NFR-P1`, `UX1`, `M1`, `G1`, `NG1`), and the success metrics are
  concrete numbers rather than "the feature works". A proposal for a feature
  with lists, data loading or complex state also carries a UI States Matrix
  covering loading, error, empty and offline.
- The specs describe observable behaviour, not implementation steps, and use
  the ADDED/MODIFIED/REMOVED delta format.
- The specs respect the project's domain rules: IANA identifiers as the source
  of truth for zones (no stored raw UTC offsets), Temporal-based date/time
  semantics, ISO 8601 timestamps with `Z`, client-only and offline-first
  behaviour.
- `design.md` holds only decisions local to this change; a global architectural
  decision is referred to `docs/adr/` rather than settled here.
- Nothing contradicts an `Accepted` ADR under `docs/adr/` or
  `.claude/rules/architecture.md`: every new module, hook or component sits in
  the layer the rules allow, and storage, the clock and the network are
  reached only through the ports the rules name. Tasks put each test where
  `.claude/rules/bdd-unit.md` and `bdd-e2e.md` say it belongs (keyboard,
  layout, real-browser behaviour in E2E, not in jsdom).
- Every claim the artifacts make about the existing code — a file, script,
  constant, test helper or behaviour that exists, or one that does not — holds
  in the repository. Open the files it names to check.
- `tasks.md` covers everything the proposal promises, in an order one
  implementer can follow, each task independently verifiable and naming the
  automated test that proves it under `packages/client/src/`. A task whose
  verification is a manual check fails this criterion.
- The change is scoped to the task and nothing beyond it.

Check every criterion above before you give a verdict, and report every
violation you find — not the first few. A rejected change goes back for one
more round, and a violation you saw but did not report costs a whole attempt
later. When a finding cites a rule, an ADR or the code, quote what the source
actually says, so the fix is made against the source and not a paraphrase.
Judge by reading the change directory, `docs/adr/`, `.claude/rules/`,
`openspec/specs/` and the source. You have no git: judge the files as they are now; what changed and what did not is already enforced by the command checks before you. Do not run the build,
the tests, or the OpenSpec CLI: `openspec validate --changes --strict` has
already been run as a separate check before you, and a passing validation is a
precondition of your review, not part of it.
