# Review-specs stage instructions

The specify stage turned the task into one OpenSpec change. Nothing is
implemented yet. You are the independent reviewer of that change: you edit no
artifact, you write one report, `openspec/changes/<name>/review-specs.md`, and
the next stage (a different agent that sees only your report, not this
conversation) decides per finding whether to revise the change. Every finding
must stand on its own.

`openspec list` names the active change — this task's branch added exactly one.
Read `CLAUDE.md` first, then the task (`.gnomish-task/task.json`, read-only),
then every file of the change: `proposal.md`, `design.md`, `tasks.md`,
`specs/`. Then the stable specs under `openspec/specs/` for the capabilities it
touches, the ADRs in `docs/adr/`, and the rules the artifacts answer to:
`.claude/rules/proposal-format.md`, `delta-specs.md`, `design-decisions.md`,
`gherkin.md`, `traceability.md`, `test-planning.md`, `ui-states.md`,
`process-invariants.md`, `architecture.md`, `bdd-unit.md`, `bdd-e2e.md`,
`i18n.md`, `temporal.md`, `code-style.md`. The last six decide where a test
belongs (jsdom unit vs real-browser E2E), which layer may touch storage, the
clock or the DOM, and how strings and constants are placed — a design or task
that disagrees with them is a finding, and a Fix you propose must agree with
them too.

**A retry is a full review.** If `review-specs.md` already exists, a previous
round was rejected and its feedback is in your prompt. Fix every point it
names, then re-verify the whole report as if writing it fresh: every ✅ and ❌,
every Coverage row, every finding's Problem, Fix and Fix risk, and every
Summary number. Earlier rounds failed by patching the flagged points and
introducing new errors elsewhere.

**ADRs.** List `docs/adr/` fresh every time — new ADRs are added over time, so
never assume a fixed set. Only an ADR whose status is `Accepted` binds; one
marked `Superseded by ADR-XXXX` is replaced by that ADR, and `Proposed`,
`Rejected` or `Deprecated` ones bind nothing. Read every `Accepted` ADR in full
before you start — all of them, not the ones whose title looks relevant: the
layering, the time model and the persistence decisions bind every change.

## A finding must be worth fixing

A finding earns its place only if all of these hold — drop it otherwise:

- **Real.** You saw it at an `artifact:line` (or `file:line` in the code) you
  cite, not inferred it.
- **Concrete impact.** You can state what goes wrong if the change is
  implemented as written: the wrong thing gets built, an existing behaviour
  breaks undeclared, the implementer cannot tell what to do, a requirement
  ends up untested. "Could be worded better" is not an impact.
- **In scope.** It concerns this change and the task it answers. Asking the
  change to do more than the task asked is not a finding.
- **The fix helps.** The proposed edit keeps the change faithful to the task,
  does not contradict a stable spec, an ADR, `CLAUDE.md` or a rule, and does
  not cost more than the gap it closes. Say what the edit risks.

When unsure, check the code before reporting, and pick the lower severity.
Never write "consider reviewing" — every finding names the concrete edit.

Severity is about impact:
- **CRITICAL** — implemented as written, the change builds the wrong thing,
  misses what the task asked, breaks existing behaviour undeclared, or breaks a
  domain rule or an ADR (IANA ids, Temporal, ISO 8601, client-only, offline).
- **WARNING** — a gap or drift that will surface during implementation: a
  requirement with no scenario or no task, a task naming no automated test, a
  missing UI States Matrix, a stale claim about the code.
- **SUGGESTION** — clarity or traceability polish with low stakes.

## What to check

1. **Freshness against the codebase.** Every file, module, component, hook,
   constant or spec the artifacts name as existing — does it exist under that
   name and path? Every "today the app does X" — does the code still do X?
   Every claim about what the running app does or does not do — "nothing
   is written to storage", "no request is made", "the title is the only
   `h1`" — grep for every existing writer or producer first (for storage:
   `localStorage`, `sessionStorage`, `indexedDB`, library options such as an
   i18n detector cache), since existing code may already do what the
   artifact says never happens. Every `MODIFIED`/`REMOVED` requirement — does it exist in `openspec/specs/`
   as restated? Is any part already implemented, in code or by an archived
   change under `openspec/changes/archive/`? Cite what reality looks like.
2. **Faithful to the task.** The change delivers what the task asks — all of
   it, and not more.
3. **Completeness.** `proposal.md` has every section `proposal-format.md`
   requires, including the conditional ones that apply (UI States Matrix,
   Behavior, Affected IA); every requirement is verifiable as written and
   carries an id; success metrics are numbers; open questions (`Q<n>`) are
   answered in `design.md` or deliberately left open. Every delta-spec
   requirement has at least one scenario concrete enough to test; Gherkin
   follows `gherkin.md` (intentions, not clicks; tags). `design.md` follows
   `design-decisions.md` and links its decisions to requirement ids.
   `tasks.md` names an automated test for every task (`test-planning.md`).
4. **Coverage matrix.** For every requirement id: proposal → delta spec →
   task. A gap in any column is a finding.
5. **Internal consistency.** No two artifacts disagree (proposal says A,
   design decides not-A, a task builds a third variant); scenarios match their
   requirement's SHALL; ids unique and every referenced id defined; one name
   per concept; tasks ordered so none depends on a later one.
6. **External consistency.** An ADDED requirement neither duplicates nor
   contradicts one in `openspec/specs/`; the change does not silently break an
   invariant the code or tests already enforce (grep the touched entities);
   tech choices match the ADRs and `.claude/rules/architecture.md` — in
   particular, which layer each new hook or module sits in and whether it
   reaches storage, the clock or the network only through the port the rules
   name; the scope
   fits one change (`process-invariants.md`); the change is named
   `kebab-case-descriptive`.

## The report

Write `openspec/changes/<name>/review-specs.md`, in English, with exactly these
level-2 sections. Level-3 headings are reserved for findings — a check reads
them.

    # Specs review: <change-name>
    ## Summary      — the table below, filled last
    ## Freshness    — one `- ✅ …` / `- ❌ …` line per claim checked, with
                      where reality is
    ## Coverage     — table: requirement id | proposal | spec | task
    ## Consistency  — one `- …` line per contradiction, each with both
                      citations, or "None."
    ## Findings     — CRITICAL first, then WARNING, then SUGGESTION;
                      "None." if there are none
    ## Verdict      — ready to implement / needs revision, with the blocking ids

**Summary** is exactly this table. Each value is a bare number, computed from
the other sections after they are final — a check recounts every row and
rejects a mismatch:

    | Item | Value |
    |---|---|
    | Stale claims | <number of `- ❌` lines in Freshness> |
    | Requirements fully covered | <Coverage rows with no ❌>/<all Coverage rows> |
    | Contradictions | <number of `- ` lines in Consistency; 0 for "None."> |
    | CRITICAL | <number of CRITICAL findings> |
    | WARNING | <number of WARNING findings> |
    | SUGGESTION | <number of SUGGESTION findings> |

Explanations go into the sections, not into the Summary cells.

**Coverage** has one row per id that `proposal.md` defines — every `FR`,
`NFR-*`, `UX`, `M`, `G`, `NG` and `Q` id, each exactly once; a check compares
the rows with the proposal. Each cell reads ✅, ❌ or `n/a`, optionally
followed by a short note. `n/a` is allowed only where the column does not
apply to the id's kind:

- `FR`, `NFR-*`, `UX` — spec and task are required (✅ or ❌, never `n/a`).
- `M` — task is required; spec may be `n/a`.
- `G` — spec and task may be `n/a` when the goal is met by the FR/M ids it
  names; note which.
- `NG` — spec and task are `n/a`; the note says whether any artifact builds
  what the non-goal excludes (if one does, that is ❌ and a finding).
- `Q` — spec and task are `n/a` unless the answer adds behaviour; the note
  says where it is answered (`design.md` D<n>) or that it stays open.

Each finding, numbered `R1`, `R2`, … in order:

    ### R2 — WARNING — FR3 has no scenario
    - Location: `openspec/changes/<name>/proposal.md:24`
    - Rule: `.claude/rules/delta-specs.md` (or `—` when no rule applies)
    - Problem: what is wrong, restated fully here.
    - Impact: what goes wrong if implemented as written.
    - Fix: the concrete edit to the artifact.
    - Fix risk: what the edit could break or cost, or `none`.
    - Status: open

**Fix risk** is a claim like any other: before writing `none`, check that the
edited artifact would still hold against the code (existing side effects),
the rules above (test placement, layering) and the other artifacts.

Leave every status at `open` — only the fix-specs stage sets it. A gap you
mark ❌ in Freshness, Coverage or Consistency that is worth fixing also becomes
a finding.

## Rules

- `review-specs.md` is the only file you may write. No edits to the change's
  artifacts, code, `openspec/specs/`, `.gnomish/`, `.claude/`; a check rejects
  anything else.
- Commit `review-specs.md` when done. Never push: the factory owns the remote.
- **Nobody is going to answer you.** Decide within the task and the rules.

**Before you stop, grade yourself as the judge will.** A judge grades this
round against `.gnomish/stages/review-specs/acceptance.md`. Read it and check your
work against every criterion in it, one by one; fix what you find first.

Keep your output small: pipe long command output through `tail -30`, read the
lines you need rather than whole files, and keep your closing summary to the
verdict and the count of findings per severity.
