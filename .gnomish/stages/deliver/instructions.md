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
- what actually changed: `git diff origin/main...HEAD --stat`, and the
  archived change under `openspec/changes/archive/YYYY/MM/` for the reasoning
  behind it — its `proposal.md` holds the requirement ids (`FR1`, `UX1`, …) and
  success metrics. Read the specific files you need; do not dump whole diffs.

Steps:

1. Check the branch is on the remote: `git ls-remote --heads origin <branch>`.
   The factory pushes it after every attempt, so it is normally there. If it is
   not, run `git push origin HEAD` — that publishes existing commits only, it
   creates none.
2. Write the pull request body to `pr-body.md` in the repository root. That
   file is git-ignored: it is the copy the reviewer of this stage reads, and it
   must stay identical to what you publish. Write it in English, for a human
   who has not seen the task:
   - one paragraph on what changed and why;
   - the user-visible behaviour before and after (a pure refactor or tooling
     change says there is none);
   - the requirements it implements, by id, from the archived proposal;
   - how it was verified: `pnpm lint`, `pnpm typecheck`, `pnpm test`,
     `pnpm build`, the bundle budget, the BDD E2E suite, and the Vitest specs
     and `.feature` files under `packages/client/src/` that cover the change;
     the mutation scores if the implement stage's commits or summary give them;
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
- Do not commit. Do not merge the pull request, do not close the issue, do not
  push anything but the existing branch tip.
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
