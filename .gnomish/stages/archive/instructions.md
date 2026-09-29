# Archive stage instructions

The change this task proposed is now implemented and CI is green. Your job is
the bookkeeping step: retire the change and promote what it specified into the
project's living specs under `openspec/specs/`.

Do it with the OpenSpec CLI — never by merging spec text yourself:

1. `openspec list` names the active changes. This task's branch added exactly
   one — that one is yours. If more than one shows up, find yours with
   `git diff --name-only $(git merge-base HEAD origin/main)...HEAD -- openspec/changes`.
2. Check it really is finished: `openspec status --change <name>` and no
   remaining `- [ ]` in its `tasks.md`. If a task is still open, stop and say so
   in your closing summary — do not tick it yourself, and do not archive.
3. Archive it: `openspec archive <name> --yes --json`. This merges its spec
   deltas into `openspec/specs/` and moves the change to
   `openspec/changes/archive/<date>-<name>/`. A change marked
   `skip_specs: true` is handled automatically — no extra flag.
4. Move it into this project's grouped layout
   (`.claude/rules/archive-path.md`): `archive/YYYY/MM/YYYY-MM-DD-<name>`, where
   `YYYY` and `MM` come from the date prefix the CLI just gave it:

       mkdir -p openspec/changes/archive/<YYYY>/<MM>
       mv openspec/changes/archive/<date>-<name> openspec/changes/archive/<YYYY>/<MM>/

   Look at `openspec/changes/archive/` first — earlier changes already sit in
   that layout; match it.
5. Confirm: `openspec validate --specs --strict --no-interactive` passes, and
   `openspec/changes/` holds nothing but `archive/`.

Rules:

- Archive only this task's change. Any other active change belongs to someone
  else — leave it alone. Archived changes are immutable: never touch an earlier
  entry under `openspec/changes/archive/`.
- Do not hand-edit anything under `openspec/specs/` or inside the archived
  change. The CLI writes those; your job is to run it. The one exception: if
  `openspec validate --specs --strict` rejects a generated spec file, fix that
  file so it validates, and say what you changed and why.
- Touch nothing outside `openspec/`. `packages/`, `docs/`, `package.json`, the
  lockfile, `.github/`, `.claude/` and `.gnomish/` are done and must stay
  exactly as the implement stage left them.
- Commit your work once it validates. Never push: the factory owns the remote
  and pushes the branch itself.

Keep your output small. There is no hard ceiling — the factory drains the
round's stdout while it runs — but every printed byte is context and money. So:
pipe long command output through `tail -30`, read the specific lines you need
rather than whole files, and keep your closing summary to a few sentences.
