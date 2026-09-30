# Deliver stage instructions

The change is specified, implemented, green and archived. Your job is the
hand-off to a human: open the pull request for this task's branch and write the
description a reviewer needs.

The facts you need are in the working copy — read them, do not guess:

- the branch: `git branch --show-current` (it is `gnomish/<task>`);
- the repository: `tracker.github.repo` in `.gnomish/config.yaml`. That is the
  value for `--repo`. Do not rely on `origin`;
- the task's issue number: `taskId` in `.gnomish-task/task.json`, e.g.
  `github:owner/repo#29` → issue `29`. Read that file, never write to it;
- what actually changed: `gh api repos/<repo>/compare/main...<branch> --jq '.files[].filename'`
  lists the changed files — the checkout may have no `origin` remote and no
  `main`, so `git diff origin/main...HEAD` can fail. The archived change under
  `openspec/changes/archive/YYYY/MM/` holds the reasoning behind it: its
  `proposal.md` has the requirement ids (`FR1`, `UX1`, …) and success metrics.
  Read the specific files you need; do not dump whole diffs.

Steps:

1. The factory pushes the branch after every attempt, so it is on GitHub
   already. Do not push. If `gh pr create` reports that the head branch does
   not exist, stop and say so in your closing summary — that is an operator
   problem.
2. Write the pull request body to `pr-body.md` in the repository root. That
   file is git-ignored: it is the copy this stage's checks read, and it must
   stay identical to what you publish. The checks verify that the archive path,
   the requirement ids and the test files it names exist, and that every
   rejected review finding is named — so name them exactly. Write it in
   English, for a human who has not seen the task:
   - one paragraph on what changed and why;
   - the user-visible behaviour before and after (a pure refactor or tooling
     change says there is none);
   - the requirements it implements, by id, from the archived proposal;
   - how it was verified: `pnpm lint`, `pnpm typecheck`, `pnpm test`,
     `pnpm build`, the bundle budget, the BDD E2E suite, and the Vitest specs
     and `.feature` files under `packages/client/src/` that cover the change;
     the mutation scores if the implement stage's commits or summary give them;
   - the outcome of both reviews, from `review-specs.md` and `review-code.md`
     in the archived change: for each, how many findings per severity were
     fixed and rejected, and every rejected finding by id with its reason in
     one line — the human decides whether they agree;
   - a pointer to the archived OpenSpec change;
   - a final `Refs #<issue>` line. Use `Refs`, not `Closes` — this project
     closes its issues itself.
3. Look for an existing open pull request first — a retry of this stage must
   not open a second one:
   `gh pr list --repo <repo> --head <branch> --state open --json number`
   - none: `gh pr create --repo <repo> --base main --head <branch> --title "<title>" --body-file pr-body.md`
   - one already there: `gh pr edit <number> --repo <repo> --title "<title>" --body-file pr-body.md`
4. Print the pull request URL in your closing summary.

The title is a short imperative sentence describing the change, like a good
commit subject — not `gnomish: ...`, not the raw task title if that title was
a complaint rather than a description.

Rules:

- `pr-body.md` is the only file you may write. Everything else —
  `packages/`, `openspec/`, `docs/`, `package.json`, the lockfile, `.github/`,
  `.claude/`, `.gnomish/`, `.gnomish-task/` — is finished work; leave it
  exactly as you found it.
- Do not commit, do not push. Do not merge the pull request, do not close the
  issue.
- Keep the `gh` command lines simple and literal: substitute the branch, repo
  and issue number as plain text you have already read, and pass the body with
  `--body-file`. Command substitutions inside the arguments and here-documents
  are the kind of shell the permission gate stops.
- If `gh` reports that authentication is missing or the token cannot write to
  the repository, stop and say so in your closing summary — that is an
  operator problem, not something to work around.

Keep your output small. There is no hard ceiling — the factory drains the
round's stdout while it runs — but every printed byte is context and money. So:
pipe long command output through `tail -30`, read the specific lines you need
rather than whole files, and keep your closing summary to a few sentences.
