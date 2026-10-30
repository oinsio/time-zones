## H1: Documents describe the always-shown Now button

- **Serves:** FR1, FR2, FR4
- **Files:** `docs/glossary/date-selection.md`, `docs/architecture/views.md`, `docs/architecture/open-questions.md`
- **Apply:** from the repository root, `git apply openspec/changes/keep-now-button-visible-when-live/handoff/H1-docs-now-button-always-shown.patch` (relative to this README: `H1-docs-now-button-always-shown.patch`)
- **Verify:** `git diff --stat docs` lists the three files; `grep -rn "only when the moment is pinned\|shown only while" docs` prints nothing
- **Why manual:** the implement stage writes only under `packages/` and the change's `handoff/` folder, and these documents live in `docs/`.
- **Automated part:** `git apply --check` in task 5.2. The behaviour the entry describes is covered by the tests of sections 2–4.
