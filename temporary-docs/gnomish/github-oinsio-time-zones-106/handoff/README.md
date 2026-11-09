## H1: ADR-0012, the view is always the user's choice

**Serves:** FR6 of add-view-mode-setting-and-grid-skeleton.

**Files:** `docs/adr/0012-user-chosen-view.md` (new), `docs/adr/0005-view-registry.md`, `docs/adr/0002-model-presenter-swappable-views.md`, `CLAUDE.md`.

**Verify:** `git apply --check temporary-docs/gnomish/<task>/handoff/H1-adr-0012-user-chosen-view.patch`; after applying, `grep -n "ADR-0012" docs/adr/0005-view-registry.md docs/adr/0002-model-presenter-swappable-views.md CLAUDE.md` prints a line for each file, and `ls docs/adr/0012-user-chosen-view.md` succeeds.

**Why manual:** the factory may not write `docs/adr/` or `CLAUDE.md`.

**Automated part:** the code and the architecture and glossary docs that follow the decision are changed and checked in tasks 1.4 and 7.3; the patch is checked with `git apply --check` in task 8.1.
