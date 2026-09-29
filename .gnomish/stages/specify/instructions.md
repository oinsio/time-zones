# Specify stage instructions

You turn the task into an OpenSpec change proposal for the Time Zones PWA. This
stage produces specification documents only — no production code, no tests, no
build or config files. The next stage implements what you write, and it sees
your documents, not this conversation: everything the implementer needs must
end up in the files.

## How to do it

Invoke the repository's own skill and follow it end to end:

    Skill(skill="openspec-propose", args="<the task, in your own words>")

That skill is the same text a human on this project runs as `/opsx:propose`, so
the stage and hand work follow one procedure and cannot drift apart. It walks
the four artifacts in order — `proposal` → `specs` → `design` → `tasks` —
through the OpenSpec CLI (`openspec new change`, `openspec instructions
<artifact> --change <name>`, `openspec status`, `openspec validate`). Do what it
says; the notes below only fill in what it cannot know.

This project already has an OpenSpec root (`openspec/`, schema `spec-driven`,
context and rules in `openspec/config.yaml`), and no store is involved: the
skill's setup and store branches do not apply — skip them rather than asking
about them.

**Nobody is going to answer you.** The skill is written for a session with a
human in it and pauses to ask or to present its work; this round has no such
person, and a question is a wasted attempt. Where it would ask, decide yourself
using the rules below and write the decision into the artifacts — an
unresolvable ambiguity belongs in the proposal's Open Questions as `Q1`, `Q2`,
not in a message to no one. Where it would stop and wait for the user to start
implementation, just stop: that is exactly this stage's boundary, and the next
stage picks it up from the files.

## What the skill cannot know

Read `CLAUDE.md` first — it is the project's own contract and it wins over both
the skill and these instructions where they disagree. The rules it points at
that matter here: `.claude/rules/proposal-format.md` (required proposal
sections), `.claude/rules/traceability.md` (requirement ids),
`.claude/rules/delta-specs.md` (ADDED/MODIFIED/REMOVED spec format),
`.claude/rules/test-planning.md` (tasks must name automated tests, never manual
checks), `.claude/rules/gherkin.md`, `.claude/rules/process-invariants.md`.

Before writing anything, read the existing specs under `openspec/specs/` and the
most recent archived change under `openspec/changes/archive/` to match the house
style.

Rules this stage adds on top of the skill:

- Everything you write lives under `openspec/changes/<name>/`. Do not touch
  `packages/`, `docs/`, `package.json`, the lockfile, `.github/` or `.gnomish/`.
  Archived changes are immutable — never edit under `openspec/changes/archive/`.
- Create exactly one change, named `kebab-case-descriptive` — never a generic
  name like `update` or `wip`. The next stage has to find it unambiguously.
- Every requirement carries an id — `FR1`, `NFR-P1`, `NFR-A1`, `NFR-R1`, `UX1`,
  `M1`, `G1`, `NG1`, `Q1` — and success metrics are concrete numbers, never
  "the feature works".
- Specs describe observable behaviour — inputs, outputs, error conditions — not
  implementation steps. The "how" belongs in `design.md`, and only for decisions
  local to this change; a global architectural decision is an ADR under
  `docs/adr/` and, if the task needs one, `design.md` says so rather than
  writing the ADR itself.
- Domain constraints the specs must respect: IANA identifiers are the source of
  truth for zones (never raw UTC offsets), all date/time math is Temporal API,
  timestamps are ISO 8601 with `Z`, date-only values are ISO dates, and the app
  is client-only and offline-first.
- A feature with lists, data loading or complex state needs the UI States
  Matrix in the proposal — loading, error, empty and offline are part of the
  requirement, not polish.
- `tasks.md` is the hand-off. Each task must be small, ordered and
  independently verifiable, and must name the automated test that proves it —
  the Vitest spec, the `.feature` file and its step definitions, the axe-core
  or visual-regression assertion — under `packages/client/src/`. Never write a
  task that says "check manually".
- Scope the change to what the task asks and nothing more. If the task is a
  pure refactor, tooling or docs change with no behavioural delta, set
  `skip_specs: true` in the change's `.openspec.yaml` instead of inventing a
  requirement to satisfy validation.
- Do not implement anything. Commit as you go, and often — small commits on the
  task branch are what makes an attempt readable afterwards. Never push: the
  factory owns the remote and pushes the branch itself.

## Two things about this working copy

You are in a git worktree, not the project clone, so `node_modules` is absent
and nothing that needs it will run. You need none of it: the OpenSpec CLI is
installed globally, and this stage writes only markdown.

The repository's `PostToolUse` hooks know this: the client test suite runs only
for files under `packages/client/`, and it stays silent where `node_modules` is
absent. So the markdown this stage writes triggers nothing. If a hook does
speak up, read it as feedback on the file you just wrote — not as something to
fix by installing dependencies or editing `package.json` or
`.claude/settings.json`, both of which are outside this stage's scope.

Keep your output small. There is no hard ceiling — the factory drains the
round's stdout while it runs — but every printed byte is context and money. So:
pipe long command output through `tail -30`, read the specific lines you need
rather than whole files, and keep your closing summary to a few sentences.
