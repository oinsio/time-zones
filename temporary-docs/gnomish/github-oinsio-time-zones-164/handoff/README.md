# Handoff of add-unix-time-converter-tool

## H1: ADRs of tools, exact instants and view registries

**Serves:** FR1, FR8, FR17, G4, G5 (D1, D2, D4, D9)
**Files:** `docs/adr/0020-tools-and-the-tool-registry.md`, `docs/adr/0021-exact-instants-without-bigint.md`, `docs/adr/0022-view-registries-of-tool-pages.md`, `CLAUDE.md`
**Verify:** `git apply --check H1-adrs-tools-and-exact-instants.patch`; after applying, `ls docs/adr/002[0-2]-*` lists three files and `grep -c "0022 view registries" CLAUDE.md` prints 1.
**Why manual:** the implement stage may not write `docs/adr/` or `CLAUDE.md`, and accepting an ADR is the owner's judgement.
**Automated part:** task 1.4 checks the patch with `git apply --check` and counts the three ADR files; the decisions are covered by the unit, BDD and mutation tests and by `noBigIntInSources.test.ts`.

## H2: README marks of the released tools

**Serves:** FR18, G1
**Files:** `README.md`, `README.ru.md`
**Verify:** `git apply --check H2-readme-tools-released.patch`; after applying, `npx vitest run src/test/readme/readmeFacts.test.ts` passes in `packages/client`.
**Why manual:** the implement stage may write only under `packages/`, under `docs/` other than `docs/adr/`, and in the handoff folder; the root READMEs are outside those limits.
**Automated part:** task 1.5 checks the patch with `git apply --check`, greps it for the two removed marks, and runs `readmeFacts.test.ts`.
