# Design: Refresh the README to the current state of the project

## Context

Driven by FR1–FR13 and NFR-A1 of `proposal.md`. Only documents change, plus one test-only guard. No runtime module, port, stored document or layer is touched, so `.claude/rules/architecture.md` and ADR-0002…0018 constrain only what the text may say about them. The READMEs must describe the decisions of those ADRs as they are: ADR-0009 (supported engines), ADR-0014 (zone rules from IANA), ADR-0015 (city data from GeoNames), ADR-0016 (day periods follow the sun), ADR-0017 (data refresh through pull requests) and ADR-0018 (silent data updates). The READMEs restate no ADR decision. They link the ADR instead.

## Decision

### D1: The implement stage edits the root READMEs directly; no handoff items

`.gnomish/stages/specify/handoff.md` says the implement stage "never writes `.github/`, `.claude/`, `docs/adr/`, `CLAUDE.md`, `.gnomish/`, or anything under `openspec/` other than the checkboxes of `tasks.md`". The implement stage's path check in `.gnomish/stages/implement/stage.yaml` refuses only `^(openspec/|temporary-docs/|\.gnomish/|\.github/|\.claude/|docs/adr/|CLAUDE\.md$)`. `README.md` and `README.ru.md` match neither list, and `docs/gnomish-factory/` is `docs/` outside `docs/adr/`. So every task here is a checkbox task, and `## Human follow-up` has no items. The READMEs only *describe* `.gnomish/` and `.github/`; neither is edited (NG1).

### D2: The guard is one plain Vitest file that reads the repository

- Files: `packages/client/src/test/readme/readmeFiles.ts` (readers and parsers) and `packages/client/src/test/readme/readmeFacts.test.ts` (assertions). They follow the shape of `src/test/ciWorkflow.ts` and `src/test/dataRefresh/workflowFiles.ts`: `readFileSync`/`readdirSync` from `node:fs`, paths built with `join(import.meta.dirname, …)` up to the repository root, and regular expressions instead of a YAML parser (neither `package.json` declares a YAML package).
- `vitest.config.ts` already includes `src/**/*.{test,steps}.{ts,tsx}`, and `tsconfig.test.json` includes `src/test/**/*`, so `pnpm test`, `pnpm typecheck` and `pnpm lint` cover the files with no config change.
- Not Gherkin: the guard checks documents, not a business rule (`.claude/rules/bdd-unit.md` scopes vitest-cucumber to "business logic"). Not E2E: no browser is involved (`.claude/rules/bdd-e2e.md`).
- No Stryker run: the change adds no production module. The guard lives under `src/test/`, which `vitest.config.ts` already excludes from coverage. This is the same reasoning as the archived `fix-stale-now-button-checks-in-drag-tests` (its D3).
- Names follow `.claude/rules/naming.md`. Paths, phrase lists and patterns are named constants in `readmeFiles.ts` (`.claude/rules/code-style.md`).
- Every file starts with `// Implements FR… of refresh-readme-to-current-state.`, and every `it` names the requirement it checks in a `// FRn:` comment (`.claude/rules/traceability.md`).

### D3: The four documents and their outline

| Document | Sections (`##`), in order |
|---|---|
| `README.md` | Contents, Features, Screenshots, Localization, Supported browsers, Tech Stack, Development, Continuous integration and deployment, Gnomish Factory, Contributing, License |
| `README.ru.md` | Содержание, Возможности, Скриншоты, Локализация, Поддерживаемые браузеры, Технологии, Разработка, CI и деплой, Гномская фабрика, Участие в разработке, Лицензия |
| `docs/gnomish-factory/README.md` | Setting up the factory on your machine, Running, Running in Docker, Switching between host and Docker |
| `docs/gnomish-factory/README.ru.md` | the same four, in Russian, taken from the current Russian README text |

- **Features** groups items by what the user does: locations and search, reading times (Here mark, home location, offset difference, zone line, clock change note), choosing a time and a date, the Grid view and meeting ranges (Share meeting), settings, offline work and updates, and data and engines (zone rules, city data, day periods, browsers). Each item ends with links to its spec(s). The 18 links are `openspec/specs/{app-delivery,app-shell,browser-compatibility,city-data,date-selection,day-colouring,day-periods,grid-view,home-location,location-search,locations,main-page,meeting-range,settings,time-selection,zone-abbreviations,zone-rules,zone-rules-updates}/spec.md`.
- **Screenshots** uses `docs/design/screens/phone-light.png`, `phone-dark.png`, `tablet-light.png` (Cards), `grid-desktop-light.png` and `grid-desktop-meeting-dark.png` (Grid). Each has alt text naming the view, the device and the theme (NFR-A1).
- The **Gnomish Factory** section keeps the overview, the `.gnomish/` table, the stage table (D5), the change record, the handoff items, escalation (`$GNOMISH_DECISION_FILE`, `gnomish:needs-human`, Decisions, with the operator guide linked for answering, Q1), the task branch base (D5) and a link to the guide in its own language: `README.md` links `docs/gnomish-factory/README.md`, `README.ru.md` links `docs/gnomish-factory/README.ru.md`. The `factory/` file table moves to the guide (FR9).
- Each document links its counterpart in the other language (FR11): the existing language badges in the READMEs, and a line under the title in the guides.

### D4: Stale and banned phrases

`readmeFiles.ts` exports `STALE_README_PHRASES`, which no document may contain (case-sensitive substring):

- English: `MVP`, `Here entry`, `smoke E2E`, `origin/main`, `nine stages`, `working hours / evening`, `` `autonomy.attemptLimit` (2) ``.
- Russian: `MVP`, `строкой «Здесь»`, `smoke E2E`, `origin/main`, `девять стадий`, `рабочие часы / вечер`, `локаци`.

Each phrase comes from the base READMEs (proposal, Why) or from a glossary *Never:* entry (`docs/glossary/locations.md`: "Here entry", «локация»; `docs/glossary/time-selection.md`: "working hours" for a day period). The task-branch base is described as "the parent of the `gnomish: task started` commit".

### D5: The stage table and how it is checked

Both READMEs use this column order: `| # | Stage | Model | Judge | Attempts | What the gnome does | Accepted when |`. The Russian table translates only the header and the two prose columns. The first five cells are machine-checked and identical in both languages:

- `#`: 1-based position in `.gnomish/pipeline.yaml` (`stages:` list, lines `  - <name>`).
- `Stage`: `` `<name>` ``.
- `Model`: `` `<model>` ``, the first `^  model: (\S+)` in `.gnomish/stages/<name>/stage.yaml` (the executor's).
- `Judge`: `` `<model>` `` from the `^    model: (\S+)` line after `- type: judge` when the file has a judge, else `—`. Today: `deliver`, `cleanup` and `usage-report` have none, and `archive`'s judge is `sonnet`.
- `Attempts`: the `attemptLimit` under the stage's top-level `autonomy:` block, else the `attemptLimit` of `.gnomish/config.yaml`. Today: 8, 6, 4, 12, 4, 4, 4, 4, 4, 4.

Row pattern: ``^\| (\d+) \| `([a-z-]+)` \| `([^`]+)` \| (`[^`]+`|—) \| (\d+) \|``. The guard asserts that the rows, in order, equal the values above (FR8, M3). The section must also contain `` `autonomy.attemptLimit` (<config value>) ``, and `<count> stages` (English) or `<count> стади` (Russian), where `<count>` is the number of pipeline stages.

### D6: Link, script, version and size checks

- **Links:** Markdown targets `](<target>)` and HTML `src="<target>"`, without `http(s):`, `mailto:` or a leading `#`, with any `#anchor` stripped, resolved against the document's directory, must exist (FR12). A link to `openspec/specs/<cap>/spec.md` also counts as resolved when an active change holds `openspec/changes/<name>/specs/<cap>/spec.md` (any `<name>` except `archive`). The guard asserts, for each document:
  - FR1: each README links `openspec/specs/<cap>/spec.md` for every capability directory under `openspec/specs/` (18 today) and for every `<cap>` that an active change's delta specs add under `openspec/changes/<name>/specs/<cap>/` (`archive/` excluded);
  - FR7: each README links all six files of `readdirSync('.github/workflows')`;
  - FR10: each README links `CONTRIBUTING.md` and `CLA.md`;
  - FR11: the English and Russian versions of each pair have equal `##` and `###` heading counts and equal sets of resolved relative link targets, compared after each language pair is normalized to one key (`<path>.ru.md` → `<path>.md`), so a link to the counterpart and a link to the own-language file of another pair match.
- **Scripts (FR6):** in fenced code blocks, every `pnpm <word>` and `pnpm --filter @time-zones/client <word>` must be a key of the root or the client `scripts`, or a pnpm built-in (`install`, `add`, `exec`, `dlx`). `pnpm --filter @time-zones/client exec …` is allowed.
- **Versions (FR9):** in the guides, `VERSION=<x>` equals `GNOMISH_VERSION=<x>` of `.gnomish/factory/gnomish.env`, and `@fission-ai/openspec@<y>` equals the root `devDependencies["@fission-ai/openspec"]`.
- **Factory table (FR9):** every entry of `readdirSync('.gnomish/factory')` appears as `` `<entry>` `` in the English and Russian guides. Skipped are `.gitignore` and the local names that file ignores: directories `gnomish-*`, `*.tar.gz`, `*.zip`, `SHA256SUMS`, `gnomish.local.env`, `logs`. A fresh checkout has exactly the seven tracked entries.
- **Size (FR12):** each document has at most 300 lines (`MAX_DOCUMENT_LINES = 300`).
- **Images (FR3, NFR-A1):** each README references at least one `docs/design/screens/grid-*.png` and at least one Cards image (`phone-*.png` or `tablet-*.png`), and every `<img>` has a non-empty `alt="…"` and every `![…](…)` non-empty alt text.
- **Anchors of prose sections (FR4, FR5):** each README contains `_meta`, `baseLanguage` (FR4) and `iOS Safari 12.5` (FR5). `TECH_STACK_PACKAGES` = `react`, `vite`, `typescript`, `tailwindcss`, `@radix-ui/react-dialog`, `@dnd-kit/core`, `temporal-polyfill`, `vite-plugin-pwa`, `i18next`, `@biomejs/biome`, `vitest`, `playwright-bdd`, `@amiceli/vitest-cucumber`, `@stryker-mutator/core`: each must be a dependency of the root or the client `package.json`, and each README must name it, either as the package name or as the display name the constant pairs it with (`React`, `Vite`, `TypeScript`, `Tailwind CSS`, `Radix UI`, `dnd-kit`, `temporal-polyfill`, `vite-plugin-pwa`, `i18next`, `Biome`, `Vitest`, `playwright-bdd`, `vitest-cucumber`, `Stryker`).

## Consequences

Positive:

- The READMEs match the repository today, and the next stage, workflow or capability added without a README update fails `pnpm test`, naming what is missing.
- Each document stays under the 300-line cap.
- A later change that adds a capability fails the FR1 check in its own implement stage, while its delta is still under `openspec/changes/<name>/specs/`. So that stage adds the README link (root `README*.md` is inside its path check, D1). The link stays valid after the archive stage moves the delta into `openspec/specs/`, a stage that may not edit the README.

Negative:

- A change left active on `main` without being implemented still requires a README link to its capability, and the link check accepts a capability that exists only as an active delta.
- The guard ties the README's stage table to a fixed column format. A later redesign of that table must update the guard with it.
- Facts in prose (feature wording, tech stack) are not machine-checked. The review stages check them.

## Alternatives Considered

**Edit the READMEs without a guard**: rejected. It answers the task once, but the READMEs went stale once already, and `.claude/rules/test-planning.md` requires an automated test per requirement.

**Keep the full factory guide in the READMEs**: rejected. The files are 292 lines today, and the new Features, browsers and CI content would push them over the 300-line cap of `.claude/rules/process-invariants.md`.

**Check the README in a CI shell step**: rejected. It would mean an edit to `.github/`, which the factory may not make (D1), and a second test runner.
