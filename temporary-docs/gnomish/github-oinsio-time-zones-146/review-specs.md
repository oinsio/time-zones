# Specs review: refresh-readme-to-current-state

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 14/30 |
| Contradictions | 3 |
| CRITICAL | 0 |
| WARNING | 3 |
| SUGGESTION | 2 |

## Freshness

- ✅ "`README.md` / `README.ru.md` are 292 lines": `wc -l` gives 292 each.
- ✅ "MVP Features" / «Возможности MVP» headings with 7 items: `README.md:15,40`, `README.ru.md:15,40`.
- ✅ "`openspec/specs/` holds 18 capabilities, README links none": `ls openspec/specs` lists exactly the 18 names in design D3; no `openspec/specs/` link in either README.
- ✅ Banned words in the READMEs: "Here entry" at `README.md:44`, «строкой «Здесь»» at `README.ru.md:44`, "night / morning / working hours / evening" at `README.md:45` (and `рабочие часы / вечер` at `README.ru.md:45`). The glossary bans them: `docs/glossary/locations.md:18` (*Never:* … Here entry), `docs/glossary/locations.md:6` (*Never:* … «локация» in the interface), `docs/glossary/time-selection.md:14` (*Never:* work, working hours …).
- ✅ Six workflows (`ci.yml`, `deploy.yml`, `zone-rules-publication.yml`, `city-data-refresh.yml`, `cldr-update.yml`, `cla.yml`) in `.github/workflows/`; README links only `ci.yml` and `deploy.yml` (`README.md:91-92`).
- ✅ `ci.yml` has jobs `check` (line 20), `benchmark` with `continue-on-error: true` (lines 110, 115) and `preview` (line 141); the step named "Smoke E2E" runs the full `pnpm --filter @time-zones/client test:bdd` (`ci.yml:80-81`), and `playwright.bdd.config.ts` filters by no smoke tag (no `@smoke` tag exists under `src`).
- ✅ `DATA_REFRESH_ENABLED` appears in the three data refresh workflows (`city-data-refresh.yml`, `cldr-update.yml`, `zone-rules-publication.yml`).
- ✅ "nine stages" is stale: `.gnomish/pipeline.yaml` lists 10 stages (`README.md:120`).
- ✅ Attempt limits: `.gnomish/config.yaml:14` sets `attemptLimit: 4`; overrides `specify` 8, `review-specs` 6, `implement` 12, `cleanup` 4, `usage-report` 4 — so design D5's "8, 6, 4, 12, 4, 4, 4, 4, 4, 4" holds; the README's "(2)" (`README.md:137`) is stale.
- ✅ Models: executors `specify`/`fix-specs`/`review-specs`/`review-code` `opus`, `implement`/`fix-code`/`archive`/`deliver` `sonnet`, `cleanup`/`usage-report` `claude-haiku-5-5`; judges `opus` everywhere except `archive` (`sonnet`, `archive/stage.yaml:90`); no judge in `deliver`, `cleanup`, `usage-report` — matches D5. README claims a judge for `deliver` (`README.md:132`).
- ❌ "every stage check now diffs against the parent of the branch's `gnomish: task started` commit" (`proposal.md:12`): only 5 of 10 stage files compute that base (`specify`, `fix-specs`, `implement`, `fix-code`, `archive`), and each falls back to `git merge-base HEAD origin/main` when no such commit exists (`fix-specs/stage.yaml:67`, `archive/stage.yaml:57`, `fix-code/stage.yaml:75`). The quoted comment "the box has no origin, so never origin/main" exists (`archive/stage.yaml:55`, `fix-specs/stage.yaml:65`). See R5.
- ✅ No README mention of handoff items or CONTRIBUTING/CLA, and no "Safari"/supported browsers section (grep over both READMEs).
- ✅ D1: the implement path check refuses only `^(openspec/|temporary-docs/|\.gnomish/|\.github/|\.claude/|docs/adr/|CLAUDE\.md$)` (`implement/stage.yaml:91`), and `implement/instructions.md:119-121` forbids the same set; root `README*.md` and `docs/gnomish-factory/` pass. (`handoff.md:3-4` also says the stage "writes under `packages/` and under `docs/`"; no check enforces that sentence.)
- ✅ D2: `vitest.config.ts:32` includes `src/**/*.{test,steps}.{ts,tsx}`, `:42` excludes `src/test/` from coverage; `tsconfig.test.json` includes `src/test/**/*`; `src/test/ciWorkflow.ts:2,5` and `src/test/dataRefresh/workflowFiles.ts:2,5-6` use `readFileSync` and `join(import.meta.dirname, …)`; no YAML package in either `package.json`.
- ✅ D2 precedent: archived `2026-10-30-fix-stale-now-button-checks-in-drag-tests/design.md` D3 "No spec delta and no mutation run"; `skip_specs: true` is allowed for a change with no behavioural delta (`.gnomish/stages/specify/acceptance.md:8-10`).
- ✅ FR4: `resolveInterfaceLanguage.ts` resolves "the chosen one when registered, else the first browser language that matches a registered locale, else English"; `_meta` and `baseLanguage` exist in `src/locales/localeMetadata.ts`.
- ✅ FR6 facts: `.nvmrc` is `26`, root `engines` `node >=26.0.0`, `pnpm >=9.0.0`, `packageManager` `pnpm@10.33.0`; current Development commands (`install`, `dev`, `build`, `--filter … preview`, `preflight`) are all scripts or built-ins.
- ✅ D6 Tech Stack packages: all 14 `TECH_STACK_PACKAGES` are dependencies of the root or client `package.json`.
- ✅ FR9: `GNOMISH_VERSION=0.1.0` in `.gnomish/factory/gnomish.env`; root devDependency `@fission-ai/openspec` is `1.13.2`; `.gnomish/factory/` tracks `.gitignore` plus seven entries (`build-sandbox`, `gnomish`, `gnomish-up`, `gnomish.env`, `project.yaml.example.container`, `project.yaml.example.host`, `sandbox`).
- ✅ D3 screenshots: `phone-light.png`, `phone-dark.png`, `tablet-light.png`, `grid-desktop-light.png`, `grid-desktop-meeting-dark.png` exist in `docs/design/screens/`.
- ✅ All 17 ADRs in `docs/adr/` (0001–0011, 0013–0018) are `Accepted`; ADR-0009, 0014, 0015, 0016, 0017, 0018 exist under the names design Context cites.

## Coverage

The change sets `skip_specs: true` (`.openspec.yaml`), which `.gnomish/stages/specify/acceptance.md:8-10` allows for a documentation-only change. So no FR/NFR/UX row has a delta spec, and the spec column reads ❌. That gap is intentional and not worth fixing: there is no capability to put a README requirement in. The checks of design D4–D6 take the role of scenarios. Only the task gaps of UX1/UX2 become a finding (R3).

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ❌ no delta (skip_specs); D6 check | ✅ 1.2, 3.1, 4.1 |
| FR2 | ✅ | ❌ no delta (skip_specs); D4 check | ✅ 1.2, 3.1, 4.1 |
| FR3 | ✅ | ❌ no delta (skip_specs); D6 check | ✅ 1.2, 3.1 |
| FR4 | ✅ | ❌ no delta (skip_specs); D6 anchors | ✅ 1.2, 3.1 |
| FR5 | ✅ | ❌ no delta (skip_specs); D6 anchors | ✅ 1.2, 3.1 |
| FR6 | ✅ | ❌ no delta (skip_specs); D6 check | ✅ 1.2, 3.1 |
| FR7 | ✅ | ❌ no delta (skip_specs); D6 check | ✅ 1.2, 3.1 |
| FR8 | ✅ | ❌ no delta (skip_specs); D5 check | ✅ 1.2, 3.1, 4.1 |
| FR9 | ✅ | ❌ no delta (skip_specs); D6 check | ✅ 1.2, 2.1, 2.2 (see R4) |
| FR10 | ✅ | ❌ no delta (skip_specs); D6 check | ✅ 1.2, 3.1 |
| FR11 | ✅ | ❌ no delta (skip_specs); D6 check | ✅ 1.2, 2.2, 4.1 (see R2) |
| FR12 | ✅ | ❌ no delta (skip_specs); D6 check | ✅ 1.2, 2.2, 3.1 |
| FR13 | ✅ | ❌ no delta (skip_specs); D2 | ✅ 1.1, 1.2, 5.1 |
| NFR-A1 | ✅ | ❌ no delta (skip_specs); D6 images | ✅ 1.2, 3.1 |
| UX1 | ✅ | ❌ no delta (skip_specs) | ❌ no task or check names UX1 (R3) |
| UX2 | ✅ | ❌ no delta (skip_specs) | ❌ no task or check names UX2 (R3) |
| M1 | ✅ | n/a | ✅ 1.2, 5.1 |
| M2 | ✅ | n/a | ✅ 1.2, 5.1 |
| M3 | ✅ | n/a | ✅ 1.2, 5.1, 5.2 |
| M4 | ✅ | n/a | ✅ 1.2, 3.1, 4.1 |
| M5 | ✅ | n/a | ✅ 1.2, 5.1 |
| M6 | ✅ | n/a | ✅ 2.2, 3.1, 4.1 |
| G1 | ✅ | n/a — met by FR1, FR7, M1, M2 | n/a — via FR1, FR7 tasks |
| G2 | ✅ | n/a — met by FR8, FR9, M3 | n/a — via FR8, FR9 tasks |
| G3 | ✅ | n/a — met by FR13, M5 | n/a — via 1.2, 5.4 |
| NG1 | ✅ | n/a | n/a — no task edits app code, specs, `.gnomish/`, `.github/`, `CLAUDE.md`, `.claude/` |
| NG2 | ✅ | n/a | n/a — 3.1 reuses existing PNGs only |
| NG3 | ✅ | n/a | n/a — no task rewrites CONTRIBUTING/CLA/design README |
| NG4 | ✅ | n/a | n/a — guide covers this repository's setup only |
| Q1 | ✅ | n/a | n/a — answered in the proposal itself and design D3 (link the operator guide) |

## Consistency

- Design D3 (`design.md:34`) gives each guide "a line under the title" that links its counterpart, and has the Gnomish Factory section of each README link the guide. But design D6 (`design.md:63`) and FR11 (`proposal.md:69`) require "equal sets of resolved relative link targets" for each EN/RU pair. `docs/gnomish-factory/README.md` would link `README.ru.md` and the Russian guide would link `README.md`. A Russian README that links the Russian guide differs from the English one in the same way. See R2.
- Design D6 (`design.md:66`) requires every `readdirSync('.gnomish/factory')` entry as `` `<entry>` ``, so the guide must contain `` `sandbox` ``. Task 2.1 (`tasks.md:18`) says "including `sandbox/`", and the existing table writes `` `sandbox/` `` (`README.md:115`). `` `sandbox` `` is not a substring of `` `sandbox/` ``. See R4.
- FR8 (`proposal.md:66`) says the section describes the checks' base as "the parent of `gnomish: task started`, never `origin/main`". Design D4 (`design.md:40-41`) bans the substring `origin/main` in all four documents, and the stage files fall back to `merge-base HEAD origin/main` (`fix-specs/stage.yaml:67`). See R5.

## Findings

### R1 — WARNING — The FR1 guard turns every later capability-adding change red after archive, where no stage may fix the README
- Location: `openspec/changes/refresh-readme-to-current-state/design.md:60` (FR1 check) and `design.md:59` (link resolution); `proposal.md:53` (U4)
- Rule: `.claude/rules/test-planning.md` (a guard must be satisfiable inside the workflow it runs in)
- Problem: D6 derives the required spec links from the directories under `openspec/specs/`, and every link must resolve to an existing path. In this repository's pipeline, a new capability directory appears only in the `archive` stage, when the delta is folded into `openspec/specs/`. That stage "changes nothing outside openspec/" (`.gnomish/stages/archive/stage.yaml:78-86`) and runs no tests. In the earlier `implement` and `fix-code` stages, the new capability has no `openspec/specs/<cap>/spec.md` yet. So the guard does not ask for the link, and a link added early would fail the "links resolve" check. The `check` job of `ci.yml:57` runs `pnpm test` on the delivered PR.
- Impact: Every later factory change that adds a capability opens a PR whose CI fails on FR1. No stage of the pipeline is allowed to fix that, so a human must edit the README by hand each time. Capabilities have been added often: the specs went from the MVP set to 18. U4 expects the failure to name the missing link. It actually shows up after the only stage that could react to it.
- Fix: In design D6 (and tasks 1.1/1.2), build the required capability set from `openspec/specs/*` **plus** the capability directories of active changes' delta specs (`openspec/changes/<name>/specs/<cap>/`, excluding `archive/`). Treat a link to `openspec/specs/<cap>/spec.md` as resolved when either that file or an active change's `specs/<cap>/spec.md` exists. Then the implement stage of a capability-adding change sees the guard fail on its own delta and adds the README link (root `README*.md` is inside its path check, `implement/stage.yaml:91`). The link stays valid after archive. Add one Consequences line that says so.
- Fix risk: a change left active on `main` without being implemented would force a README link to an unbuilt capability. The link check becomes slightly more lenient for `openspec/specs/` paths. One more reader (`openspec/changes/`) in `readmeFiles.ts`.
- Status: open

### R2 — WARNING — FR11 link-set parity cannot hold for language-counterpart links the design itself requires
- Location: `openspec/changes/refresh-readme-to-current-state/design.md:34` and `design.md:63`; `proposal.md:69`
- Rule: —
- Problem: D6 asserts that the English and Russian documents of each pair have "equal sets of resolved relative link targets". D3 adds, under each guide's title, a line that links only the counterpart: the English guide links `README.ru.md`, the Russian guide links `README.md`. The resolved sets therefore differ. The same happens if `README.ru.md` links `docs/gnomish-factory/README.ru.md`, which a Russian reader needs, while `README.md` links `docs/gnomish-factory/README.md`. The root READMEs pass today only because both language badges link both files (`README.md:5-6`, `README.ru.md:5-6`).
- Impact: The guard written per D6 fails against documents written per D3. Then the implementer has two bad choices: point the Russian README at the English guide, or loosen the check ad hoc. Either way, the outcome is decided during implementation instead of in the design.
- Fix: In D6's FR11 bullet, compare link targets after normalizing each language pair to one key (`<path>.ru.md` → `<path>.md`). State in D3 that the Russian README links `docs/gnomish-factory/README.ru.md`. Mention the normalization in task 1.2's FR11 item.
- Fix risk: parity would no longer catch a Russian document that links the English file of a pair, or the reverse. That is a small loss, since FR12 still checks that every link resolves.
- Status: open

### R3 — WARNING — UX1 and UX2 have no task and no automated check
- Location: `openspec/changes/refresh-readme-to-current-state/proposal.md:89-90`; `tasks.md:13-34`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it"); `.claude/rules/traceability.md`
- Problem: No task names UX1 (the opening paragraph plus Features tell a first-time reader what the app does) or UX2 (one question per section, nothing repeated). Neither `readmeFacts.test.ts` item in task 1.2 nor any grep covers them. Task 3.1 rewrites "to the D3 outline", but the opening paragraph is not in that outline, and no check enforces the D3 section order.
- Impact: The opening paragraph (`README.md:8`) can stay as it is, without mentioning the Grid view, meeting ranges or settings. The sections can drift from the D3 outline. Nothing would flag either, and the verification step cannot show that UX1 or UX2 is met.
- Fix: In task 3.1/4.1, add "(UX1)": rewrite the opening paragraph so it names both views, meeting planning and offline work. Add "(UX2)": follow the D3 `##` list in order. In D6 and task 1.2, add one `it` (`// UX2:`) that asserts each README's `##` headings equal D3's list in order. Add one `it` (`// UX1:`) that asserts the text before the first `##` names the Cards view and the Grid view (in Russian, by their glossary *RU:* names).
- Fix risk: the heading-order check ties the guard to D3's outline. A later reordering must update the constant. The UX1 anchors must use the glossary RU names, which the implementer has to look up in `docs/glossary/`.
- Status: open

### R4 — SUGGESTION — Factory table check expects `` `sandbox` `` while task 2.1 writes `sandbox/`
- Location: `openspec/changes/refresh-readme-to-current-state/design.md:66`; `tasks.md:18`
- Rule: —
- Problem: D6 requires each `readdirSync('.gnomish/factory')` entry to appear as `` `<entry>` ``, which gives `` `sandbox` `` for the directory. Task 2.1 asks for the table to include `` `sandbox/` ``, the form the current table uses (`README.md:115`). `` `sandbox` `` is not a substring of `` `sandbox/` ``.
- Impact: Following task 2.1 literally makes the FR9 factory-table test fail on the `sandbox` entry. The implementer then has to pick one side.
- Fix: In D6, say that a directory entry may also appear as `` `<entry>/` `` (match `` `<entry>` `` or `` `<entry>/` ``).
- Fix risk: none.
- Status: open

### R5 — SUGGESTION — FR8's "never `origin/main`" is banned by D4 and overstates the stage checks
- Location: `openspec/changes/refresh-readme-to-current-state/proposal.md:12` and `proposal.md:66`; `design.md:40,43`
- Rule: —
- Problem: FR8 describes the base as "the parent of `gnomish: task started`, never `origin/main`". D4 bans the substring `origin/main` in all four documents. The proposal also claims that "every stage check" uses that base, but only `specify`, `fix-specs`, `implement`, `fix-code` and `archive` compute it, and they fall back to `git merge-base HEAD origin/main` when the commit is missing (`fix-specs/stage.yaml:67`, `archive/stage.yaml:57`, `fix-code/stage.yaml:75`).
- Impact: An implementer who copies FR8's wording into the README fails the FR2 phrase check. The README would also claim more than the stage files do.
- Fix: In FR8, replace "(the parent of `gnomish: task started`, never `origin/main`)" with "(the stages that diff the branch use the parent of the `gnomish: task started` commit)". In the Why bullet at `proposal.md:12`, replace "every stage check now diffs" with "the stages that diff the branch (`specify`, `fix-specs`, `implement`, `fix-code`, `archive`) now diff".
- Fix risk: none.
- Status: open

## Verdict

Needs revision. Blocking ids: R1, R2, R3 (WARNING). R4 and R5 are polish. Nothing contradicts an ADR, `CLAUDE.md` or the domain rules. The change is documentation plus a test-only guard under `packages/client/src/test/`, and it fits the implement stage's path limits.
