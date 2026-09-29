# Acceptance criteria for the specify stage

Under `openspec/changes/` there is exactly one non-archived change directory,
holding the artifacts the `spec-driven` schema requires: `proposal.md`, spec
deltas under `specs/`, `design.md` and `tasks.md`. A change with no behavioural
delta may set `skip_specs: true` in its `.openspec.yaml` instead of shipping a
spec delta — but only when the task genuinely changes no behaviour.

- The proposal states why the change is needed and what changes, and its
  Capabilities section matches the spec files actually written.
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
- `tasks.md` covers everything the proposal promises, in an order one
  implementer can follow, each task independently verifiable and naming the
  automated test that proves it under `packages/client/src/`. A task whose
  verification is a manual check fails this criterion.
- The change is scoped to the task and nothing beyond it.
- This stage wrote specifications only: the diff touches `openspec/changes/`
  and nothing else — no `packages/`, no `docs/`, no build or CI files, and
  nothing under `openspec/specs/` or `openspec/changes/archive/` (archived
  changes are immutable).

Judge by reading the change directory and the diff only. Do not run the build,
the tests, or the OpenSpec CLI: `openspec validate --changes --strict` has
already been run as a separate check before you, and a passing validation is a
precondition of your review, not part of it.
