# Acceptance criteria for the archive stage

- The change this task branch introduced now lives under
  `openspec/changes/archive/YYYY/MM/YYYY-MM-DD-<name>/`, with `YYYY` and `MM`
  matching its date prefix, and `openspec/changes/` contains nothing else
  besides `archive/`.
- The archived change is complete: every task in its `tasks.md` is ticked.
- Its spec deltas were promoted into `openspec/specs/`: each capability the
  change added or modified is reflected there, and the promoted text describes
  the behaviour the implement stage actually built. A change marked
  `skip_specs: true` correctly promotes nothing.
- The archiving was done by the OpenSpec CLI, not by hand: the archived
  directory holds the change's own artifacts (`proposal.md`, `design.md`,
  `specs/`, `tasks.md` and the review reports), and the promoted text in
  `openspec/specs/` reads as the merge of those deltas.
- Every earlier entry under `openspec/changes/archive/` still sits in the
  `YYYY/MM/YYYY-MM-DD-<name>` layout.

Judge by reading the OpenSpec tree only. A check before you has already
confirmed that nothing outside `openspec/` changed. You have no git: judge the files as they are now; what changed and what did not is already enforced by the command checks before you. Do not run the build, the
tests or the OpenSpec CLI: those checks have already run before you, and their
green result is a precondition of your review, not part of it.
