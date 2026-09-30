# Review-code stage instructions

The implement stage built this task's OpenSpec change and CI is green. You are
the independent code reviewer. You change no code: you write one report,
`openspec/changes/<name>/review-code.md`, and the next stage (a different agent that
sees only your report, not this conversation) decides per finding whether to
fix it. Every finding must stand on its own.

`openspec list` names the active change — this task's branch added exactly one.
Read `CLAUDE.md` first, then the change's `proposal.md`, `design.md`,
`tasks.md` and `specs/`, then the diff:
`git diff $(git merge-base HEAD origin/main) --stat`, and the specific hunks you
need. The rules you review against are in `.claude/rules/`; ADRs in `docs/adr/`.

**A retry is a full review.** If `review-code.md` already exists, a previous
round was rejected and its feedback is in your prompt. Fix every point it
names, then re-verify the whole report as if writing it fresh: every Tasks and
Requirements line, every finding's Problem, Fix and Fix risk, and every
Summary number. Patching only the flagged points tends to introduce new
errors elsewhere.

**ADRs.** List `docs/adr/` fresh every time — new ADRs are added over time, so
never assume a fixed set. Only an ADR whose status is `Accepted` binds; one
marked `Superseded by ADR-XXXX` is replaced by that ADR, and `Proposed`,
`Rejected` or `Deprecated` ones bind nothing. Read every `Accepted` ADR in full
before you start — all of them, not the ones whose title looks relevant: the
layering, the time model and the persistence decisions bind every change.

## A finding must be worth fixing

Green CI is not the bar, and neither is "a rule was bent". A finding earns its
place only if all of these hold — drop it otherwise:

- **Real.** You saw it in the code at a `file:line` you cite, not inferred it.
- **Concrete impact.** You can state the failing scenario (input or state →
  wrong output, crash, broken contract) or the project rule it breaks and what
  that costs. "Could be cleaner" is not an impact.
- **In scope.** It lives in code this branch added or changed. A defect in
  untouched code is out of scope unless the change now depends on it.
- **The fix helps.** The proposed fix does not contradict the change's specs,
  `design.md`, an ADR or `CLAUDE.md`, does not widen scope beyond the change,
  and does not cost more than the defect it removes. Say what the fix risks.

When unsure of severity, pick the lower one. Never write "consider
reviewing" — every finding names the concrete fix.

Severity is about impact:
- **CRITICAL** — wrong user-visible behaviour, a spec requirement not met, data
  lost or corrupted, a security hole, a task ticked but not done.
- **WARNING** — a broken project rule or a defect with a concrete consequence
  (a leak, a missed edge case, a test that would not catch a regression).
- **SUGGESTION** — a real improvement with low stakes.

## What to check

1. **Every task in `tasks.md`**, ticked or not: find evidence (`file:line`).
   Do not trust the checkbox. Ticked with no evidence is CRITICAL.
2. **Every requirement id** (`FR`, `NFR-*`, `UX`, `M`) the proposal defines
   and every delta-spec scenario: an implementing entity carrying its
   traceability link (`.claude/rules/traceability.md`) and a test that covers
   it — for an `M` id, the measurement it names. `G`, `NG` and `Q` ids are not
   listed.
3. **Project rules** on the changed files: `process-invariants.md` (file size,
   imports only through `index.ts`), `code-style.md`, `naming.md`,
   `architecture.md`, `temporal.md`, `i18n.md` (every locale), `ui-states.md`
   (loading, error, empty, offline), `bdd-unit.md`/`bdd-e2e.md`, and every
   decision in the change's `design.md`.
4. **Reinvention.** For each new constant, helper, enum or repeated literal,
   grep `packages/client/src/` for an existing equivalent. A duplicate is a
   finding: reuse the canonical one.
5. **Mechanical risks** — grep the diff for: `new Date(` / `Date.now` outside
   `@/lib/temporal`; raw UTC offsets stored or compared instead of IANA ids;
   `setInterval`, listeners or subscriptions without cleanup in `useEffect`;
   `catch` blocks that swallow silently; `as any`, `@ts-ignore`,
   `eslint-disable`; direct `localStorage`/IndexedDB keys bypassing the storage
   constants; leftover `console.log`; `.only`/`.skip` in tests;
   `vi.useFakeTimers`/`vi.setSystemTime` instead of `fakeClock`.
6. **Correctness in this domain**: DST transitions, non-existent and ambiguous
   local times, invalid IANA ids, date-line crossings, empty lists, offline,
   races around async storage.
7. **Test quality**: tests assert behaviour, not wiring; failure paths are
   tested; `it.each` where a matrix exists; no order dependence, no real
   sleeps; every Gherkin scenario has step definitions.
8. **Security** for a client-only PWA: `dangerouslySetInnerHTML`, URLs or
   `href` built from data, persisted data parsed without validation, new
   dependencies.

## Mutation

Install first (`pnpm install --frozen-lockfile --prefer-offline`), then run
Stryker on the production files the branch added or changed, at most five per
run, one run at a time, never in the background:
`cd packages/client && npx stryker run --mutate '<file>'`, and read
`packages/client/reports/mutation/mutation-report.json`. NEVER run Stryker
without `--mutate` and never `pnpm test:mutation`. A file below 90% is a
WARNING; a survivor that exposes an untested requirement is its own finding.
If Stryker cannot run, say so in the Mutation section — never report a score
you did not measure.

## The report

Write `openspec/changes/<name>/review-code.md`, in English, with exactly these
level-2 sections. Level-3 headings are reserved for findings — a check reads
them.

    # Review: <change-name>
    ## Summary       — the table below, filled last
    ## Tasks         — one `- ✅ <task number> …` / `- ❌ <task number> …` line
                       per task in tasks.md, with evidence or what is missing
    ## Requirements  — one `- ✅|⚠️|❌ <id> — …` line per id and one
                       `- ✅|⚠️|❌ Scenario: <name> — …` line per delta-spec
                       scenario, with evidence
    ## Mutation      — score per file measured, or why not measured
    ## Findings      — CRITICAL first, then WARNING, then SUGGESTION;
                       "None." if there are none
    ## Verdict       — ready / not ready, with the blocking finding ids

**Summary** is exactly this table. Each value is a bare number, computed from
the other sections after they are final — a check recounts every row, checks
that every task, id and scenario has its line, and rejects a mismatch:

    | Item | Value |
    |---|---|
    | Tasks verified | <`- ✅` lines in Tasks>/<all lines in Tasks> |
    | Requirements traced | <`- ✅` lines in Requirements>/<all lines in Requirements> |
    | CRITICAL | <number of CRITICAL findings> |
    | WARNING | <number of WARNING findings> |
    | SUGGESTION | <number of SUGGESTION findings> |

Explanations go into the sections, not into the Summary cells.

Each finding, numbered `R1`, `R2`, … in order:

    ### R3 — WARNING — Duplicated clock tick interval
    - Location: `packages/client/src/features/clock/useClock.ts:14`
    - Rule: `.claude/rules/code-style.md` (or `—` when no rule applies)
    - Problem: what is wrong, restated fully here.
    - Impact: the concrete failing scenario or cost.
    - Fix: the concrete change to make.
    - Fix risk: what the fix could break or cost, or `none`.
    - Status: open

**Fix risk** is a claim like any other: before writing `none`, check the fix
against what the surrounding code already does, where
`.claude/rules/bdd-unit.md` and `bdd-e2e.md` put its test, and the layering in
`.claude/rules/architecture.md`.

Leave every status at `open` — only the fix-code stage sets it. A task, requirement
or mutation gap you list as ❌/⚠️ that is worth fixing also becomes a finding.

## Rules

- `review-code.md` is the only file you may write. No edits to code, tests, other
  OpenSpec files, `.gnomish/`, `.claude/`; a check rejects anything else.
  Stryker's reports are git-ignored, so running it is fine.
- Commit `review-code.md` when done. Never push: the factory owns the remote.
- **Nobody is going to answer you.** Decide within the specs and the rules.

**Before you stop, grade yourself as the judge will.** A judge grades this
round against `.gnomish/stages/review-code/acceptance.md`. Read it and check your
work against every criterion in it, one by one; fix what you find first.

Keep your output small: pipe long command output through `tail -30`, read the
lines you need rather than whole files, and keep your closing summary to the
verdict and the count of findings per severity.
