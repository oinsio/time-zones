# Tasks

Source paths are relative to the repository root. "Dn" refers to `design.md`.

- **Running tests:** one command at a time, never in the background. Wait for each run to finish before starting the next.
- **No Stryker run:** no production module changes; the guard lives in `packages/client/src/test/` (D2).
- **Traceability:** each guard file starts with `// Implements FR… of refresh-readme-to-current-state.`, and every `it` carries a `// FRn:` comment (D2).
- **Glossary:** the documents use the glossary terms listed under "What Changes" in `proposal.md`. None of the D4 phrases may appear. The change adds no glossary entry.
- **Facts are read, not remembered:** every number, model, script, version and file name written into a document is copied from the file named in D3–D6 at the time of writing.

## 1. README guard, red first (FR13)

- [ ] 1.1 Write `packages/client/src/test/readme/readmeFiles.ts` (D2, D4–D6). It exports the document paths, `STALE_README_PHRASES`, `MAX_DOCUMENT_LINES`, the readers of `.gnomish/pipeline.yaml`, `.gnomish/config.yaml`, `.gnomish/stages/<name>/stage.yaml`, `.gnomish/factory/gnomish.env`, both `package.json` files, `.github/workflows/`, and the capability directories under `openspec/specs/` and under active changes' `openspec/changes/<name>/specs/` (`archive/` excluded), and the parsers for links, headings, fenced `pnpm` commands and stage table rows. Verify: `pnpm typecheck` exits 0.
- [ ] 1.2 Write `packages/client/src/test/readme/readmeFacts.test.ts`, with at least 10 `it`s, one per check of D4–D6: spec links for `openspec/specs/` plus active-change delta capabilities, where a delta capability's link counts as resolved (FR1, D6), stale phrases (FR2), workflow links (FR7), stage table rows (FR8), stage count and default attempt limit (FR8), scripts (FR6), versions (FR9), factory table (FR9), `CONTRIBUTING.md` and `CLA.md` links (FR10), EN/RU heading and link parity, with `<path>.ru.md` normalized to `<path>.md` before the link sets are compared (FR11, D6), links resolve and line cap (FR12), image alt text and Cards plus Grid screenshots (FR3, NFR-A1), Localization and Tech Stack anchors (FR4, FR5). Each check runs over the documents D3 lists and fails when a document is missing. Verify (red, M5): `pnpm --filter @time-zones/client exec vitest run src/test/readme` fails at least 5 tests against the unchanged READMEs. Record the failing test names in the commit message.

## 2. Factory guide moves to docs (FR9, FR11, FR12)

- [ ] 2.1 Create `docs/gnomish-factory/README.md` from the English README sections "Setting up the factory on your machine", "Running", "Running in Docker" and "Switching between host and Docker" (D3). Add the `.gnomish/factory/` table, updated to every tracked entry of that directory, including `sandbox/` (D6). Bring the text up to date with the current `.gnomish/`: describe the task branch base as the parent of the `gnomish: task started` commit, without `origin/main` (D4), and keep the `VERSION=` and `@fission-ai/openspec@` values equal to `gnomish.env` and the root `package.json`. Fix relative links for the new directory depth. Link `README.ru.md` under the title.
- [ ] 2.2 Create `docs/gnomish-factory/README.ru.md` as the Russian mirror of 2.1, from the current Russian README text, with the same headings and link targets. Verify 2.1–2.2: `wc -l docs/gnomish-factory/README.md docs/gnomish-factory/README.ru.md` prints at most 300 for each (M6).

## 3. English README (FR1–FR8, FR10–FR12, NFR-A1)

- [ ] 3.1 Rewrite `README.md` to the D3 outline. Features (FR1, FR2): grouped items in glossary terms, with the 18 spec links. Screenshots (FR3, NFR-A1): Cards and Grid images with view/device/theme alt text. Localization (FR4). Supported browsers and Tech Stack (FR5): versions from `packages/client/package.json`. Development (FR6): only existing scripts, Node.js and pnpm from `engines`, `packageManager` and `.nvmrc`. Continuous integration and deployment (FR7): all six workflows linked. Gnomish Factory (FR8): the stage table of D5, the change record, handoff items, escalation and the guide link. Contributing (FR10). License, unchanged. Remove the factory sections moved in 2.1. Verify: `grep -c "MVP" README.md` prints 0, and `wc -l README.md` prints at most 300 (M4, M6).

## 4. Russian README (FR1–FR8, FR10–FR12, NFR-A1)

- [ ] 4.1 Rewrite `README.ru.md` as the mirror of 3.1, following D3's Russian section names and using the *RU:* names of the glossary terms (место, время устройства, домашнее место, «Вид», «Раскраска», «Рабочие часы» for the user's range only). Keep the same link targets, except that the factory guide link points to `docs/gnomish-factory/README.ru.md` (D3), and the same stage-table cells (D5). Verify: `grep -c "MVP\|локаци" README.ru.md` prints 0, and `wc -l README.ru.md` prints at most 300.

## 5. Verification (G1–G3, M1–M6)

- [ ] 5.1 Green: `pnpm --filter @time-zones/client exec vitest run src/test/readme` exits 0 with at least 10 passing tests (M1–M5).
- [ ] 5.2 Mutation sanity of the guard, no Stryker: delete one row from the stage table of `README.md`, run 5.1 and see it fail, then restore the file with `git checkout -- README.md` if it was committed, or undo the edit. Do the same with one spec link. Record both failures in the commit message.
- [ ] 5.3 Traceability: `grep -l "refresh-readme-to-current-state" packages/client/src/test/readme/*.ts | wc -l` prints 2.
- [ ] 5.4 Run the CI steps, one at a time, from the repository root: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Each exits 0 (G3).

## Human follow-up

None. Every edit is inside the implement stage's limits (design D1).
