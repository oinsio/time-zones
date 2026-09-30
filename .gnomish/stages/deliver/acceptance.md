# Acceptance criteria for the deliver stage

`pr-body.md` in the repository root holds the pull request body exactly as it
was published — a check before you has already confirmed that an open pull
request for this branch exists, targets `main`, carries a real title, and that
its body and this file are the same text. Judge the quality of that text
against the change it describes.

- The body explains what changed and why in prose a reviewer who has not seen
  the task can follow: not a list of file names, not a restatement of the task
  title.
- What it claims matches the branch: the behaviour it describes is the
  behaviour the code implements, and it does not promise work that is absent or
  omit a user-visible change that is present.
- It names the requirement ids the change implements, and they exist in the
  archived change's `proposal.md`.
- It says how the change was verified and names the Vitest specs and `.feature`
  files that cover it, and those files exist under `packages/client/src/`.
- It summarises both reviews from the archived change's `review-specs.md` and
  `review-code.md`: fixed and rejected counts, and every rejected finding with
  its reason, as those files record them.
- It points at the archived OpenSpec change under
  `openspec/changes/archive/YYYY/MM/`, and that directory exists.
- It references the task's issue with `Refs #<issue>`, not `Closes`/`Fixes` —
  this project closes its own issues.

Judge by reading `pr-body.md`, the source and the archived change only. A
check before you has already confirmed that this stage wrote and committed
nothing else. You have no git: judge the files as they are now; what changed and what did not is already enforced by the command checks before you. Do
not run the build, the tests or `gh`: the deterministic checks have already run
before you, and their green result is a precondition of your review, not part
of it.

Start from `pr-body.md`: the ids, test files and archive path it names are
what you need to check.

Your turns are limited and each one counts, however many tools it calls. Read
several files in one turn with parallel `Read` calls, check a pattern across
the tree with one `Grep` instead of opening files one by one, and keep a few
turns in reserve: a round that ends without the verdict JSON is lost,
whatever you found.
