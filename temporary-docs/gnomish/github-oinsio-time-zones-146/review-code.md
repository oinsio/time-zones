# Review: refresh-readme-to-current-state

## Summary

| Item | Value |
|---|---|
| Tasks verified | 9/10 |
| Requirements traced | 19/22 |
| CRITICAL | 1 |
| WARNING | 3 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 — `packages/client/src/test/readme/readmeFiles.ts:1-300` exports the document paths (`:11-20`), `STALE_README_PHRASES` (`:67-72`), `MAX_DOCUMENT_LINES` (`:6`), the readers of `pipeline.yaml`/`config.yaml`/`stage.yaml` (`:181-206`), `package.json` (`:148-171`), workflows (`:138-140`), factory entries (`:142-146`), stable and active-delta capabilities with `archive` excluded (`:123-136`), and the link/heading/fence/stage-row parsers (`:208-300`). `pnpm typecheck` exits 0 (run in this review).
- ✅ 1.2 — `packages/client/src/test/readme/readmeFacts.test.ts:55-285` has 17 `it`/`it.each` blocks (37 tests), one per D4–D6 check, each with a `// FRn:`/`// UXn:`/`// NFR-A1:` comment. Red recorded in commit `d45ff52` ("32 of 37 tests fail", names listed).
- ✅ 2.1 — `docs/gnomish-factory/README.md` holds the four D3 sections (`:20`, `:115`, `:140`, `:153`), the `factory/` table with `sandbox/` (`:5-17`), the `gnomish: task started` base (`:132`), `VERSION=0.1.0` (`:48`, equals `.gnomish/factory/gnomish.env`), `@fission-ai/openspec@1.13.2` (`:31`, equals root `package.json`), `../../` links, and the RU link under the title (`:3`). One carried-over fact is still stale, the container egress host list — see R2.
- ✅ 2.2 — `docs/gnomish-factory/README.ru.md` mirrors 2.1 (167 lines each, `wc -l`); same headings and link set (guard test "mirror each other" passes). Same stale egress list as R2.
- ✅ 3.1 — `README.md` `##` sections in D3 order (`:12-141`), opening paragraph names Cards view and Grid view (`:8`), 18 spec links (`:29-36`), five screenshots with alt text (`:42-53`), Localization (`:55-62`), Supported browsers (`:64-66`), Tech Stack (`:68-76`), Development (`:78-99`), six workflows linked (`:101-108`), stage table and factory text (`:110-135`), Contributing (`:137-139`), License (`:141-145`). `grep -c MVP README.md` = 0; 145 lines.
- ✅ 4.1 — `README.ru.md` mirrors 3.1 with the D3 Russian headings; opening paragraph names «Карточки» and «Сетка» (`:8`); RU glossary names used (место, «Время устройства», домашнее место, «Вид», «Раскраска»); factory guide link points to `docs/gnomish-factory/README.ru.md`. `grep -c "MVP\|локаци" README.ru.md` = 0; 145 lines.
- ✅ 5.1 — `pnpm --filter @time-zones/client exec vitest run src/test/readme` run in this review: 37 passed.
- ❌ 5.2 — ticked, but no commit on the branch records the two sanity failures the task asks for (`git log` from the task start: `e0ad6ba`, `f7298f8`, `a6bf90f`, `4055f6b`, `c293aa4` carry no such text) — see R1.
- ✅ 5.3 — `grep -l "refresh-readme-to-current-state" packages/client/src/test/readme/*.ts | wc -l` prints 2 (run in this review).
- ✅ 5.4 — `pnpm lint` (no error; 8 warnings, none in the new files: `biome check packages/client/src/test/readme` is clean) and `pnpm typecheck` exit 0 in this review; `pnpm test`/`pnpm build` are the CI steps that are green for this stage.

## Requirements

- ✅ FR1 — "Features" heading with no MVP (`README.md:25`, `README.ru.md:25`), each item links its specs, all 18 capabilities linked (`README.md:29-36`); guard `readmeFacts.test.ts:56-72` checks stable plus active-delta capabilities.
- ⚠️ FR2 — the D4 phrases are absent from all four documents (guard `readmeFacts.test.ts:74-81`, passing), but `README.md:35` names the app revision concept "app version", a glossary *Never:* word — see R5.
- ✅ FR3 — Cards (`phone-light.png`, `phone-dark.png`, `tablet-light.png`) and Grid (`grid-desktop-light.png`, `grid-desktop-meeting-dark.png`) screenshots, `README.md:42-53`; guard `readmeFacts.test.ts:226-237`.
- ✅ FR4 — settings page, then browser language, then English (`README.md:62`); `_meta` discovery (`:59`); dialect fallback via `baseLanguage` then English (`:61`); guard anchors `readmeFacts.test.ts:239-248`.
- ✅ FR5 — Supported browsers names evergreen engines and iOS Safari 12.5 with ADR-0009 (`README.md:66`); Tech Stack lists the FR5 libraries, ADR-0014 and ADR-0015 (`:70-76`); guard `readmeFacts.test.ts:239-266`.
- ✅ FR6 — fenced commands `pnpm install/dev/build/preflight` and client `preview`/`test:bdd` all exist (`README.md:84-91`); Node.js `>=26.0.0`, pnpm `>=9.0.0`, `.nvmrc` (`:80`) match `package.json` `engines`; guard `readmeFacts.test.ts:121-151`.
- ✅ FR7 — six workflows linked and described, including `check` steps, non-blocking `benchmark`, `preview`, GitHub Pages deploy, `DATA_REFRESH_ENABLED`, ADR-0017/0018 and the CLA check (`README.md:101-108`, matches `.github/workflows/ci.yml:20-198`); guard `readmeFacts.test.ts:83-92`.
- ✅ FR8 — stage table rows equal `pipeline.yaml` order, executor model, judge model and attempt limit (`README.md:116-127`; verified against `.gnomish/stages/*/stage.yaml` and `config.yaml:14`); "10 stages" and `` `autonomy.attemptLimit` (4) `` (`:114`); task branch base, change record, handoff items and `gnomish:needs-human` (`:129-135`); guard `readmeFacts.test.ts:94-119`.
- ⚠️ FR9 — setup/running/Docker instructions, versions and the factory table are in the guides and guarded (`readmeFacts.test.ts:153-183`), but the guide still states the container egress guard allows only three hosts while `.gnomish/factory/project.yaml.example.container:28-36` allows six — see R2.
- ✅ FR10 — `README.md:139` links `CONTRIBUTING.md` and `CLA.md`; License keeps Apache 2.0 and GeoNames lines (`:143-145`); guard `readmeFacts.test.ts:185-193`.
- ⚠️ FR11 — headings and link sets mirror (guard `readmeFacts.test.ts:195-211`, passing), and every document links its counterpart today, but the guard asserts the counterpart link only for the English documents; a Russian README that drops its link to `README.md` still passes — see R3.
- ✅ FR12 — all relative targets resolve and each document is ≤300 lines (145/145/167/167); guard `readmeFacts.test.ts:213-224`.
- ✅ FR13 — guard under `packages/client/src/test/readme/`, picked up by `vitest.config.ts` and run by `pnpm test`; 37 tests pass.
- ✅ NFR-A1 — every `<img>` has alt text naming view, device and theme (`README.md:44-53`, `README.ru.md:44-53`); guard `readmeFacts.test.ts:233-235`.
- ✅ UX1 — opening paragraphs name both views (`README.md:8`, `README.ru.md:8`); guard `readmeFacts.test.ts:276-284`.
- ✅ UX2 — `##` sections in D3 order, no section repeats another's content; guard `readmeFacts.test.ts:268-274`.
- ✅ M1 — 18 of 18 capability specs linked from each README (FR1 guard, passing).
- ✅ M2 — 6 of 6 workflow files linked from each README (FR7 guard, passing).
- ✅ M3 — 10 of 10 stage rows match in each README (FR8 guard, passing).
- ✅ M4 — 0 D4 phrases across the four documents (FR2 guard, passing).
- ✅ M5 — 37 passing tests now (≥10); 32 of 37 failed against the base READMEs (commit `d45ff52`).
- ✅ M6 — `wc -l`: 145, 145, 167, 167 (≤300).

## Mutation

Not measured. The branch changes no production module: the only TypeScript files are `packages/client/src/test/readme/readmeFiles.ts` and `readmeFacts.test.ts`, and `packages/client/stryker.config.mjs:8-18` excludes `src/test/**` from `mutate`, so Stryker has nothing to mutate here (design D2, tasks "No Stryker run"). By code inspection the guard's two sanity cases from task 5.2 would fail as intended — `toEqual(readStageFacts())` at `readmeFacts.test.ts:98-100` on a removed row, `missingLinks` at `:67-70` on a removed spec link — but that run was not recorded (R1).

## Findings

### R1 — CRITICAL — Task 5.2 ticked but its guard sanity check is not recorded
- Location: `openspec/changes/refresh-readme-to-current-state/tasks.md:31`
- Rule: `.gnomish/stages/review-code/instructions.md` ("Do not trust the checkbox. Ticked with no evidence is CRITICAL")
- Problem: Task 5.2 is ticked `[x]`. It requires deleting one stage table row and one spec link from `README.md`, seeing the guard fail each time, restoring the file, and "Record both failures in the commit message". No commit on the branch since `gnomish: task started` mentions either failure (`e0ad6ba`, `f7298f8`, `c293aa4`, `a6bf90f`, `4055f6b` carry only a subject line), and the implement traces hold no tool content showing the run.
- Impact: a ticked task with no evidence it was done; the mutation-style proof that the FR1 and FR8 guards catch a regression — the substitute the change chose for a Stryker run (design D2) — is missing from the history.
- Fix: in the fix-code stage, delete one `| n | \`stage\` | …` row from `README.md`, run `pnpm --filter @time-zones/client exec vitest run src/test/readme` and note the failing test ("README.md has one stage table row per pipeline stage"); restore with `git checkout -- README.md`; repeat with one `openspec/specs/<cap>/spec.md` link ("README.md links the spec of every capability"); then commit with both failing test names in the commit message.
- Fix risk: forgetting the restore leaves `README.md` broken, which the same guard then reports; otherwise none — no code or document changes remain.
- Status: fixed
- Resolution: ran the guard twice and recorded both failures in an empty commit: deleting stage row 1 fails "README.md has one stage table row per pipeline stage"; repointing one spec link fails "README.md links the spec of every capability". README.md restored after each run.

### R2 — WARNING — Factory guide lists a stale three-host egress allowlist
- Location: `docs/gnomish-factory/README.md:62`
- Rule: — (requirement FR9 and task 2.1 of the change: "Bring the text up to date with the current `.gnomish/`")
- Problem: the guide says the container binding's network is "limited to three hosts" (`docs/gnomish-factory/README.md:62`) and that the egress guard "lets through only `api.anthropic.com`, `registry.npmjs.org` and `api.github.com`" (`:142`); the Russian guide says the same («ограничена тремя хостами», `README.ru.md:62`; the three-host list, `README.ru.md:142`). `.gnomish/factory/project.yaml.example.container:28-36` allows six hosts: those three plus `data.iana.org`, `www.iana.org` and `download.geonames.org`. The text was carried over unchanged from the base README.
- Impact: an operator choosing the container binding gets a wrong picture of what a box may reach (that `zone-rules:compile` and `city-data:compile` downloads are blocked), the exact kind of stale fact this change exists to remove; the guard does not check it.
- Fix: in `docs/gnomish-factory/README.md:62` write "network limited to the hosts of its egress allowlist", and at `:142` list all six hosts from the template; mirror both edits in `docs/gnomish-factory/README.ru.md:62` and `:142`.
- Fix risk: none — no heading, link or stage table cell changes, so the FR11 and FR12 guard checks are unaffected; the six host names must be copied from the template, not retyped from memory.
- Status: fixed
- Resolution: both factory guides now say the network is limited to the egress allowlist and list all six hosts copied from project.yaml.example.container (EN and RU, lines 62 and 142).

### R3 — WARNING — FR11 guard does not check the Russian README links its English counterpart
- Location: `packages/client/src/test/readme/readmeFacts.test.ts:209`
- Rule: `.claude/rules/tdd-workflow.md` / review-code "Test quality" — a test that would not catch a regression of FR11 ("each document links its counterpart")
- Problem: the mirror test asserts the counterpart link only for the English document (`toContain(COUNTERPART_FILE_NAME)` with `"README.ru.md"`). For the Russian side it relies on link-set equality after `toPairKey` normalization, but `README.ru.md` links itself (`README.ru.md:6`), which normalizes to the same key `README.md` as the counterpart link (`README.ru.md:5`).
- Impact: removing the English badge `[![en](…)](README.md)` from `README.ru.md` leaves the Russian README without a link to its counterpart, and every guard test still passes — FR11 regresses silently.
- Fix: add a constant `ENGLISH_COUNTERPART_FILE_NAME = "README.md"` beside `COUNTERPART_FILE_NAME` (`readmeFacts.test.ts:40`) and, after line 209, `expect(parseLinkTargets(russianText)).toContain(ENGLISH_COUNTERPART_FILE_NAME);` — the counterpart of both Russian documents is `README.md` in the same directory.
- Fix risk: none — both Russian documents already link `README.md` (`README.ru.md:5`, `docs/gnomish-factory/README.ru.md:3`), the test stays a plain Vitest file as design D2 requires, and the file grows by two lines (285 → 287).
- Status: fixed
- Resolution: added ENGLISH_COUNTERPART_FILE_NAME and an assertion that the Russian text links README.md in readmeFacts.test.ts; removing the en badge from README.ru.md now fails the mirror test (checked, restored).

### R4 — WARNING — `readmeFiles.ts` sits at the 300-line hard cap
- Location: `packages/client/src/test/readme/readmeFiles.ts:1`
- Rule: `CLAUDE.md` ("Files must stay under 200 lines for AI context quality"), `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity")
- Problem: `readmeFiles.ts` is exactly 300 lines and mixes two separable things — constants plus repository readers (`:1-206`) and Markdown parsers (`:208-300`) — so splitting would not hurt clarity.
- Impact: the file is at the hard cap that the implement stage's check enforces; the next edit the design already anticipates ("A later redesign of that table must update the guard with it", design Consequences) pushes it over 300 and fails that check, and the file is 100 lines past the 200-line target today.
- Fix: move the Markdown parsers (`STAGE_ROW_PATTERN`, `parseStageRows`, `parseHeadings`, `withoutFences`, `parseLinkTargets`, `resolveLinkTarget`, `isLinkResolved`, `toPairKey`, `resolvedPairKeys`, `parseFencedPnpmCommands`, `readImageAlts`, `readOpeningParagraph`) into a new `packages/client/src/test/readme/readmeMarkdown.ts` with the same `// Implements FR13 of refresh-readme-to-current-state` header, importing `REPOSITORY_ROOT`, `StageFacts` and `readActiveDeltaCapabilities` from `./readmeFiles`; update the imports of `readmeFacts.test.ts`.
- Fix risk: low — a pure move with the guard as its own regression test (`vitest run src/test/readme` must stay 37/37 green); it departs from the two-file list of design D2 ("`readmeFiles.ts` (readers and parsers)"), so the fix-code commit should name the reason; `vitest.config.ts` and `tsconfig.test.json` already include `src/test/**`, so no config change.
- Status: fixed
- Resolution: moved the Markdown parsers into readmeMarkdown.ts (104 lines); readmeFiles.ts is now 206 lines, the guard stays 37/37 green. Departs from design D2 two-file list, reason named in the commit.

### R5 — SUGGESTION — English README calls the app revision an "app version"
- Location: `README.md:35`
- Rule: `.claude/rules/glossary.md` ("Words listed under *Never:* must not appear for that concept"); `docs/glossary/app-shell.md:17` (App revision — *Never:* version, version number, build number)
- Problem: "a new app version shows an update notice" names the concept of a build whose app revision differs from the running one with the banned word "version"; the glossary's own definition of the update notice says "a new build is waiting … only when the app revision of the site differs".
- Impact: FR2 asks that README text use the glossary terms; the synonym contradicts ADR-0018's distinction between an app revision change (notice) and a data-only build (silent update) that the same sentence describes.
- Fix: change `README.md:35` to "a build with a new app revision shows an update notice with Reload …". Leave `README.ru.md:35` («новая версия приложения») as is, since the glossary has no RU name for app revision and the interface text of the update notice is «Доступна новая версия».
- Fix risk: none — no stale phrase, link or heading changes, so no guard check is affected.
- Status: rejected (out-of-scope)
- Resolution: the root README.md lies outside what the fix-code stage may edit (only packages/client/ and docs/ outside docs/adr/); the earlier edit was reverted. The wording change belongs in a follow-up task.

## Verdict

Not ready. Blocking: R1 (task 5.2 ticked without its recorded evidence). R2–R4 are WARNINGs that should be fixed in the same round; R5 is optional.
