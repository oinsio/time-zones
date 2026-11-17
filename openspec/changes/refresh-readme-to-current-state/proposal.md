# Refresh the README to the current state of the project

## Why

`README.md` and `README.ru.md` still describe the MVP. Since then the project has added the Grid view with meeting ranges, settings, home and device time locations, its own IANA zone rules with silent updates, GeoNames city data, sun-based day periods, legacy iOS Safari support, data refresh pull requests and PR preview deploys. Its Gnomish Factory pipeline has changed too. A reader of the README today gets a wrong picture of what the app does and how to work on it.

Stale facts found in both files at the base commit (`e7e6823`):

- The section is titled "MVP Features" / «Возможности MVP» and lists 7 items. The Grid view, meeting range, Share meeting, settings (theme, hour format, zone label, day colouring, working hours, view mode, interface language), the device time location, the clock change note, zone abbreviations and zone rules updates are missing. `openspec/specs/` holds 18 capabilities, and the README links none of them.
- It uses words the glossary bans: "Here entry" / строка «Здесь» for the device time location (`docs/glossary/locations.md`: *Never:* "Here entry"). It also lists the day periods as "night / morning / working hours / evening", but `docs/glossary/time-selection.md` says *Day period* is night, morning, day, evening, decided by the sun, with *Never:* "working hours".
- "Deployment" mentions only `ci.yml` and `deploy.yml` and "the smoke E2E". `.github/workflows/` holds six workflows: `ci.yml` (check, the non-blocking `benchmark` job, `preview`), `deploy.yml`, `zone-rules-publication.yml`, `city-data-refresh.yml`, `cldr-update.yml` and `cla.yml`. CI runs the full `test:bdd` suite.
- Gnomish Factory: the README says "nine stages", but `.gnomish/pipeline.yaml` lists 10. It says "`autonomy.attemptLimit` (2)", but `.gnomish/config.yaml` sets 4, and `specify` (8), `review-specs` (6), `implement` (12), `cleanup` (4) and `usage-report` (4) override it. It says "the stages that write run on Sonnet", but `specify` and `fix-specs` run on `opus`, `cleanup` on `claude-haiku-5-5`, and the `archive` judge on `sonnet`. It claims a judge for `deliver`, which has none. It says "the checks compare the branch against `origin/main`", but every stage check now diffs against the parent of the branch's `gnomish: task started` commit (`.gnomish/stages/*/stage.yaml`: "the box has no origin, so never origin/main"). It never mentions handoff items (`.gnomish/stages/specify/handoff.md`) or how a stage asks a human (`$GNOMISH_DECISION_FILE`, `gnomish:needs-human`).
- Nothing links `CONTRIBUTING.md` or `CLA.md`, and nothing says which browsers are supported (ADR-0009).

Audience: new contributors, operators of the factory, and visitors of the repository. Urgency: medium. Every new contributor gets this wrong picture today.

## What Changes

- Rewrite the sections of `README.md` and `README.ru.md` with current facts: Features (no "MVP"), Screenshots (Cards and Grid), Localization, Supported browsers, Tech Stack, Development, Continuous integration and deployment (with data refresh), Gnomish Factory, Contributing and License. Remove the stale text listed under Why.
- Move the per-machine factory guide (install, unpack, register, tokens, check, run, Docker, switching bindings) out of the READMEs into `docs/gnomish-factory/README.md` and `docs/gnomish-factory/README.ru.md`, updated to the current `.gnomish/` tree. The READMEs keep the factory overview and the stage table, and link the guide. Reason: the files are 292 lines today, the hard cap is 300, and the new content would push them over it.
- Add a Vitest guard under `packages/client/src/test/readme/`. It runs in `pnpm test` and checks the README facts against the repository, so that the READMEs fail CI the next time they fall behind.
- No production code, spec requirement, stored data or user-visible behaviour changes. The change declares `skip_specs: true`.
- Glossary: no new or changed terms. The READMEs name features with the existing terms (location, device time location, Here mark, home location, Cards view, Grid view, meeting range, Share meeting, day period, day colouring, working hours, zone label, view mode, interface language, dialect, zone rules update notice, silent update, data refresh, preview deploy, Gnomish Factory).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. Documentation only; no requirement in `openspec/specs/` changes.

## Goals

- G1: Every capability in `openspec/specs/` and every workflow in `.github/workflows/` is described in and linked from both READMEs.
- G2: Every Gnomish Factory fact in the READMEs matches `.gnomish/`: stage order, models, judges, attempt limits, factory and OpenSpec versions.
- G3: A README that falls behind on the facts in G1 and G2 fails `pnpm test`.

## Non-Goals

- NG1: Changing app behaviour, specs, `.gnomish/`, `.github/`, `CLAUDE.md` or `.claude/`.
- NG2: New screenshots. The README uses the PNGs that already exist in `docs/design/screens/`.
- NG3: Rewriting `CONTRIBUTING.md`, `CLA.md` or `docs/design/README.md`.
- NG4: Documenting the factory itself beyond this repository's setup. The upstream operator guides stay the reference and are linked.

## Users & Scenarios

- U1: A visitor reads the README and learns what the app does today: both views, meeting planning, settings, offline work and the supported browsers.
- U2: A contributor follows Development and runs only commands that exist.
- U3: An operator reads the Gnomish Factory section, sees the 10 stages with their models and attempt limits, and follows the linked guide to set up a machine.
- U4: A later change adds a capability or a stage without touching the README. `pnpm test` fails and names the missing link or row.

## Requirements

### Functional

- FR1: Both READMEs have a features section, "Features" / «Возможности», with no "MVP" in any heading. Its items describe the current user-facing behaviour, and each item links the stable spec(s) it summarizes. Taken together, the README links `openspec/specs/<capability>/spec.md` for all 18 capability directories, and for every capability that an active change's delta specs add, so a capability-adding change updates the README before it is archived.
- FR2: README and factory-guide text uses the glossary terms for the concepts it names. None of the stale or banned phrases listed in design D4 appears in any of the four documents.
- FR3: Screenshots show both the Cards view and the Grid view, using images that exist under `docs/design/screens/`.
- FR4: Localization says how the interface language is chosen (the settings page, otherwise the browser language, then English). It also covers how locale files are discovered (`_meta`), and how dialects fall back to their base language, then English.
- FR5: A Supported browsers section names the latest evergreen engines and iOS Safari 12.5 (ADR-0009). Tech Stack lists the current main libraries and data sources: React 18, Vite, TypeScript, Tailwind CSS, Radix UI, dnd-kit, `temporal-polyfill` with the app's own compiled IANA zone rules (ADR-0014), GeoNames city data (ADR-0015), Workbox via `vite-plugin-pwa`, Biome, and the test tools.
- FR6: Development lists only commands that exist. Every `pnpm <script>` and `pnpm --filter @time-zones/client <script>` in a code block names a script of the root or the client `package.json`. The Node.js and pnpm requirements match `engines`, `packageManager` and `.nvmrc`.
- FR7: The CI and deployment section describes every workflow under `.github/workflows/` and links each file. It covers the `check` job steps of `ci.yml`, the non-blocking `benchmark` job, the PR preview deploy, the deploy to GitHub Pages, the three data refresh workflows with their `DATA_REFRESH_ENABLED` switch and silent data updates (ADR-0017, ADR-0018), and the CLA check.
- FR8: The Gnomish Factory section of both READMEs has one stage table row per stage of `.gnomish/pipeline.yaml`, in the same order. Each row gives the executor model from the stage's `stage.yaml`, whether the stage has an LLM judge and which model it runs on, and the stage's attempt limit (its own `autonomy.attemptLimit`, else the default from `.gnomish/config.yaml`). The section states the stage count and the default attempt limit as written in those files. It describes where a task branch starts and what the checks diff against (the parent of `gnomish: task started`, never `origin/main`). It also describes the change record, handoff items in the pull request's Human follow-up section, and how a stage asks a human (`gnomish:needs-human`).
- FR9: The factory guide (`docs/gnomish-factory/README.md`, `README.ru.md`) carries the machine setup, running and Docker instructions. The factory release version in its unpack step equals `GNOMISH_VERSION` in `.gnomish/factory/gnomish.env`, and the OpenSpec CLI version equals the root `package.json` devDependency `@fission-ai/openspec`. Its `.gnomish/factory/` table lists every tracked entry of that directory.
- FR10: A Contributing section links `CONTRIBUTING.md` and `CLA.md`. License keeps the Apache 2.0 and GeoNames attribution lines.
- FR11: The English and Russian versions of each document mirror each other. They have the same number of `##` and `###` headings and the same set of relative link targets, and each document links its counterpart.
- FR12: Every relative link and image target in the four documents resolves to an existing path. Each document stays at most 300 lines (`.claude/rules/process-invariants.md`).
- FR13: A Vitest guard under `packages/client/src/test/readme/` checks FR1–FR12 and NFR-A1 against the repository files (for FR3–FR5 the anchors D6 names), and runs in `pnpm test`.

### Non-Functional

#### Performance

None. No runtime code changes.

#### Accessibility

- NFR-A1: Every `<img>` and Markdown image in the READMEs has non-empty alt text that names the view, the device and the theme.

#### Responsive

None.

## UX Acceptance Criteria

- UX1: A first-time reader learns what the app does from the opening paragraph and Features alone, without opening any linked file.
- UX2: Each README section answers one question: what the app does, how to build it, how it ships, or how the factory works. Nothing is repeated across sections, apart from links.

## Behavior

No Gherkin: no behaviour changes. The guard is a plain Vitest file (design D2).

## Affected IA

No changes.

## Success Metrics

- M1: Capability specs linked from each README: 18 of 18 (today 0).
- M2: Workflow files linked from each README: 6 of 6 (today 2).
- M3: Stage table rows that match `pipeline.yaml` order, executor model, judge and attempt limit: 10 of 10 in each README (today 0 rows carry a model or a limit).
- M4: Occurrences of the D4 stale or banned phrases across the four documents: 0 (today 9 or more, among them "MVP" in both headings, "Here entry", "nine stages" / «девять стадий», "(2)" after `autonomy.attemptLimit`, and `origin/main`).
- M5: `pnpm --filter @time-zones/client exec vitest run src/test/readme` exits 0 with at least 10 passing tests. Run against the base READMEs, at least 5 of them fail.
- M6: `wc -l` of each of the four documents is at most 300.

## Open Questions

- Q1: The exact way a human answers an escalated task (where the answer is written, so that it reaches the stages as a Decision) belongs to the factory, not to this repository. The README describes only what `.gnomish/` shows (the decision file, the `gnomish:needs-human` label) and links the upstream operator guide for the rest.
