# Specs review: add-main-page-scaffold

## Summary

| Item | Value |
|---|---|
| Stale claims about the code | 3 (ResizeObserver stub, `pnpm test:e2e` script, bundle check unaware of existing script) |
| Requirement ids in proposal.md | 33: FR1–FR10 (10), NFR-P1, NFR-A1, NFR-A2, NFR-R1 (4), UX1–UX3 (3), G1–G3 (3), M1–M5 (5), NG1–NG5 (5), Q1–Q3 (3) |
| Requirements fully covered (proposal → spec → task) | 21/24 verifiable ids: FR1–FR10 (10), NFR-P1, NFR-A1, NFR-R1 (3), UX1 (1), G1, G2 (2), M1–M5 (5). Partial (3): NFR-A2, UX2, UX3. Not verifiable by nature, checked for consistency only (9): G3, NG1–NG5, Q1–Q3 — all consistent |
| Contradictions | 3 |
| Findings | CRITICAL 0 · WARNING 7 · SUGGESTION 3 |

## Freshness

- ✅ "The app shell shows only a title and renders no view, because the view registry is empty" — `packages/client/src/app/AppShell.tsx:19-30`, `packages/client/src/views/index.ts:10`.
- ✅ "`ViewId` is an empty enum" — `packages/client/src/views/viewDefinition.ts:4`.
- ✅ `ViewDefinition` has `titleKey`, `icon`, lazy `component`, `autoMinWidth` — `packages/client/src/views/viewDefinition.ts:10-18`.
- ✅ "`model` and `presenter` are empty" — `packages/client/src/model/index.ts:3`, `packages/client/src/presenter/index.ts:3`.
- ✅ "`controller` holds `useDocumentLanguage` and `usePwaUpdateStatus`" — `packages/client/src/controller/index.ts:1-3`.
- ✅ Global `AppErrorBoundary` exists — `packages/client/src/app/AppErrorBoundary.tsx`.
- ✅ Existing offline-ready and update notices in a polite region — `packages/client/src/app/AppShell.tsx:32-42`.
- ✅ Locale key-set parity test exists — `packages/client/src/locales/locales.test.ts:63-72`.
- ✅ Feature scenario "Shell with no registered views" exists — `packages/client/src/test/features/app_shell/app_shell_notices.feature:20`.
- ✅ MODIFIED requirement "Layered modules and empty view registry" exists in the stable spec under that exact name — `openspec/specs/app-shell/spec.md:85`.
- ✅ Nothing of this change is implemented yet: no `ViewHost`, `MainPage`, `resolveActiveView`, `useOnlineStatus`, `useStorageAvailability`, `useContainerWidth` in `packages/client/src`; the only archived change is `openspec/changes/archive/2026/09/2026-09-29-setup-app-shell-and-pages-deploy`.
- ❌ design.md D2 "jsdom has no `ResizeObserver`, so tests inject a stub in `test/setup.ts`" / tasks.md 2.1 "stub added to `test/setup.ts`" — a no-op global stub already exists at `packages/client/src/test/setup.ts:34-39` (→ R6).
- ❌ tasks.md 6.1 `pnpm test:e2e` — no such script; the E2E script is `test:bdd` in `packages/client/package.json`, run in CI at `.github/workflows/ci.yml:57` (→ R2).
- ❌ tasks.md 6.2 treats the 150 KB budget as new — `packages/client/scripts/check-bundle-size.mjs` already enforces it, run in CI after build at `.github/workflows/ci.yml:48` (→ R1).
- ❌ design.md D4 "the registry component is wrapped in a small factory that drops a failed promise on retry" — `ViewDefinition.component` is a `LazyExoticComponent<ComponentType>` (`packages/client/src/views/viewDefinition.ts:15`), matching ADR-0005's contract (`docs/adr/0005-view-registry.md:35`, "component — lazy React component"); a registry entry holds no loader that a factory could call again (→ R7).
- ❌ design.md D5 "constant key from `constants/storage.ts`" — the file does not exist (`packages/client/src/constants/` holds only `dom.ts`, `keyboard.ts`, `index.ts`); it is clearly meant to be created and `.claude/rules/code-style.md` places storage keys there, so no finding.

## Coverage

| Requirement id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ Main page regions | ✅ 5.4 |
| FR2 | ✅ | ✅ View host resolves the active view | ✅ 1.2, 5.2 |
| FR3 | ✅ | ✅ Cards view is registered and lazy | ✅ 4.2, 3.1 |
| FR4 | ✅ | ✅ Scenario: Container is resized | ✅ 2.1, 5.2 |
| FR5 | ✅ | ✅ Loading state | ✅ 5.2 |
| FR6 | ✅ | ✅ Error state with retry | ✅ 5.2 |
| FR7 | ✅ | ✅ Empty state | ✅ 4.1 |
| FR8 | ✅ | ✅ Offline note | ✅ 2.2, 5.3 |
| FR9 | ✅ | ✅ Storage unavailable warning | ✅ 2.3, 5.3 |
| FR10 | ✅ | ✅ Page strings are localized | ✅ 3.1 |
| NFR-P1 | ✅ | ✅ Cards view is registered and lazy | ✅ 6.2 (see R1) |
| NFR-A1 | ✅ | ✅ Accessible and responsive main page | ✅ 6.1 |
| NFR-A2 | ✅ | ✅ Offline note / Error state (no keyboard-retry scenario) | ❌ retry keyboard and error announcement not tested (R4) |
| NFR-R1 | ✅ | ✅ Accessible and responsive main page | ✅ 6.1 |
| UX1 | ✅ | ✅ Loading / Error / Empty | ✅ 4.1 |
| UX2 | ✅ | ✅ Accessible and responsive main page | ❌ no task references UX2 (R9) |
| UX3 | ✅ | ❌ cited on Main page regions, no scenario checks it | ❌ 5.4 cites it, but a jsdom test cannot observe a layout shift (R5) |
| G1 | ✅ | ✅ Scenario: Second view needs no page change | ✅ 5.2 |
| G2 | ✅ | ✅ state requirements | ✅ 5.2, 5.3, 6.1 |
| G3 | ✅ | — (process goal) | — (not testable by design) |
| M1 | ✅ | — | ✅ all TDD tasks |
| M2 | ✅ | ✅ Accessibility check | ✅ 6.1 |
| M3 | ✅ | — | ✅ 1.3, 6.3 |
| M4 | ✅ | ✅ Second view needs no page change | ✅ 5.2 |
| M5 | ✅ | — | ✅ 6.2 |
| NG1 | ✅ | — (non-goal) | — (non-goal); consistent: no task builds model, clock or locations (D6 renders empty-state text only) |
| NG2 | ✅ | — (non-goal) | — (non-goal); consistent: D7 keeps header and bottom bar as empty slots |
| NG3 | ✅ | — (non-goal) | — (non-goal); consistent: task 1.1 adds `ViewMode` as a host input defaulting to `AUTO`, nothing persisted |
| NG4 | ✅ | — (non-goal) | — (non-goal); consistent: only `ViewId.CARDS` is added (task 1.1) |
| NG5 | ✅ | — (non-goal) | — (non-goal); consistent: no Storybook or visual-regression task; deferral recorded in Q2 |
| Q1 | ✅ | ✅ Empty state "MUST NOT show an action that does nothing" | ✅ 4.1; answered in design D6 |
| Q2 | ✅ | — (deliberately open) | — (deferred to the first real view content, see NG5) |
| Q3 | ✅ | ✅ Empty state shows only the explanation | ✅ 4.1; answered in design D6 |

## Consistency

- Empty-state scenario "nothing is written to storage" (`specs/main-page/spec.md:78`) vs design D5 "probes `localStorage` with a write/remove of a constant key … once on mount" (`design.md:22`) — the probe runs on every launch, including first launch (R3).
- Modified app-shell scenario "the shell renders the app title and an error-free empty content region" (`specs/app-shell/spec.md:10-12`) vs UX1 "The user never sees a blank content area: every state shows text" (`proposal.md:85`) (R8).
- Design D4 "a rejected lazy import is re-imported … the registry component is wrapped in a small factory that drops a failed promise on retry" (`design.md:19`) vs the `ViewDefinition` contract `component: LazyExoticComponent<ComponentType>` (`packages/client/src/views/viewDefinition.ts:15`, ADR-0005 `docs/adr/0005-view-registry.md:35`) — the registry exposes an already-built lazy component, not a loader, and `React.lazy` keeps the rejection, so the retry the scenario "User retries" (`specs/main-page/spec.md:67-70`) requires is not implementable without an undeclared contract change (R7).

## Findings

### R1 — WARNING — Bundle check planned as a Vitest spec that breaks CI and duplicates the existing script
- Location: `openspec/changes/add-main-page-scaffold/tasks.md:37`
- Rule: `.claude/rules/test-planning.md`
- Problem: Task 6.2 plans "a Vitest spec asserting the build output has a separate Cards chunk and initial JS ≤ 150 KB gzipped", verified by "`pnpm run build` then the spec". Vitest includes every `src/**/*.{test,steps}.{ts,tsx}` (`packages/client/vitest.config.ts`), and CI runs `pnpm test` (`.github/workflows/ci.yml:43`) before `pnpm build` (`ci.yml:45`), so `dist/` does not exist when the spec runs. The 150 KB initial-JS budget is already enforced by `packages/client/scripts/check-bundle-size.mjs`, run in CI after the build (`ci.yml:48`).
- Impact: The new spec fails in CI and in any local `pnpm test` without a fresh build, or gets skipped around; the budget check exists twice with two separate definitions of "initial JS".
- Fix: Rewrite task 6.2 as: "Extend `scripts/check-bundle-size.mjs` to also fail when no emitted JS chunk other than the initial scripts contains the Cards view (Cards is a separate lazy chunk); the 150 KB budget stays enforced by the existing check (NFR-P1, M5); verify `pnpm run build && pnpm --filter @time-zones/client check:bundle-size`." Update the NFR-P1 and M5 rows accordingly; no proposal change is needed.
- Fix risk: Finding the Cards chunk by name depends on Vite chunk naming; the script must match on the lazy import's output rather than a hard-coded hash. Low.
- Status: open

### R2 — WARNING — E2E task names a script that does not exist
- Location: `openspec/changes/add-main-page-scaffold/tasks.md:36`
- Rule: `.claude/rules/bdd-e2e.md`
- Problem: Task 6.1 verifies with "`pnpm test:e2e` scoped to this feature". Neither the root `package.json` nor `packages/client/package.json` defines `test:e2e`; the playwright-bdd script is `test:bdd` (`bddgen -c playwright.bdd.config.ts && playwright test -c playwright.bdd.config.ts`), which CI runs at `.github/workflows/ci.yml:57`.
- Impact: The implementer cannot run the stated verification command and has to guess how to scope it, so the task's automated check is undefined.
- Fix: Replace the command in task 6.1 with "`pnpm build && pnpm --filter @time-zones/client test:bdd -- --grep @add-main-page-scaffold`" (E2E runs against `vite preview` of the production build, per the archived setup change's D3).
- Fix risk: none.
- Status: open

### R3 — WARNING — Empty-state scenario forbids the storage write that the storage probe makes
- Location: `openspec/changes/add-main-page-scaffold/specs/main-page/spec.md:78`
- Rule: —
- Problem: Scenario "First launch" says "AND nothing is written to storage". Design D5 (`design.md:22`) has `useStorageAvailability` write and remove a probe key in `localStorage` once on mount, which happens on every launch, including the first one.
- Impact: A step definition that checks the scenario literally (a `setItem` spy, or storage state during render) fails against the design as specified. Or the implementer drops the probe to make it pass, and FR9 then cannot detect private mode.
- Fix: Change the step to "AND no location or preference is left in storage" (assert that `localStorage` is empty after render), which keeps the intent from `docs/architecture/views.md` ("nothing is stored until the user acts") and allows the transient probe.
- Fix risk: none; the probe removes its key, so storage is empty after mount.
- Status: open

### R4 — WARNING — NFR-A2 keyboard retry and error announcement have no test
- Location: `openspec/changes/add-main-page-scaffold/tasks.md:29`
- Rule: `.claude/rules/test-planning.md`
- Problem: NFR-A2 (`proposal.md:77`) requires the error message to be announced (polite or alert) without taking focus, and "the retry action works with Tab and Enter". Task 5.3, the only task citing NFR-A2, covers only `OfflineNote` and `StorageWarning`. Task 5.2 (`ViewHost`, `ViewErrorFallback`) does not cite NFR-A2 and names no role or keyboard check. No spec scenario covers keyboard retry.
- Impact: The retry control can ship unreachable by keyboard, or the error can render without a live-region role, and no test fails. Half of NFR-A2 goes unverified, against M1.
- Fix: In task 5.2 add "error fallback has `role="alert"` and does not move focus; Retry is reached with Tab and activated with Enter (NFR-A2)" to the listed behaviours. Add to the "Error state with retry" requirement a scenario: "WHEN the view failed and the user uses only the keyboard THEN Retry is reachable with Tab and works with Enter".
- Fix risk: none.
- Status: open

### R5 — WARNING — Placement of the offline note and storage warning is undefined, and UX3 is untestable as planned
- Location: `openspec/changes/add-main-page-scaffold/design.md:16`
- Rule: `.claude/rules/test-planning.md`
- Problem: UX3 (`proposal.md:87`) requires that loading, empty, offline and storage messages do not shift the header. D3 lists `OfflineNote` and `StorageWarning` as components but does not say where they render: in the existing fixed bottom notices region (`AppShell.tsx:32-42`, which shows one notice at a time through a ternary), or as an in-flow "warning banner" (`proposal.md:97`) above or below the header. FR1 describes the notices region only as keeping the existing two notices. No scenario checks UX3. Task 5.4 cites UX3, but its jsdom test cannot measure layout.
- Impact: The implementer must choose a placement. An in-flow banner above the header shifts it (violating UX3). Putting the new notes into the existing ternary can hide the update notice while offline. No test catches either outcome.
- Fix: In D3, state that `OfflineNote` and `StorageWarning` render in the notices region, out of the document flow, stacked with (not replacing) the PWA notice. Update FR1 to list them. In task 6.1 add an E2E assertion that the `h1` bounding box is identical in the default, offline and storage-unavailable states (UX3). Remove UX3 from task 5.4.
- Fix risk: Stacking up to three notices at 320 px may cover content; the 320 px no-horizontal-scroll check in 6.1 still applies. Moderate.
- Status: open

### R6 — WARNING — ResizeObserver stub claimed missing, but a no-op stub already exists
- Location: `openspec/changes/add-main-page-scaffold/tasks.md:13`
- Rule: —
- Problem: D2 (`design.md:13`) and task 2.1 plan to add a `ResizeObserver` stub to `test/setup.ts`. That file already defines a global no-op stub (`packages/client/src/test/setup.ts:34-39`) whose `observe` never invokes the callback.
- Impact: The existing stub never reports a width, so it cannot drive the `useContainerWidth` and resize re-resolution tests (FR4, task 5.2). Adding a "new" stub to setup.ts either duplicates the global or silently changes it for every existing test.
- Fix: Change task 2.1 and D2 to "replace the no-op `ResizeObserver` stub in `test/setup.ts` with a controllable fake that records observers and lets a test trigger a resize with a given width; existing tests keep passing because nothing triggers it".
- Fix risk: Existing tests that render `AppShell` pick up the new fake; since it never fires on its own, their behaviour is unchanged. Low.
- Status: open

### R7 — WARNING — Retry after a failed lazy import needs a loader the ViewDefinition contract does not have
- Location: `openspec/changes/add-main-page-scaffold/design.md:19`
- Rule: `docs/adr/0005-view-registry.md` (ViewDefinition contract)
- Problem: D4 says retry re-imports a failed lazy view because "the registry component is wrapped in a small factory that drops a failed promise on retry". But a registry entry's `component` is already a `LazyExoticComponent<ComponentType>` (`packages/client/src/views/viewDefinition.ts:15`; ADR-0005 `docs/adr/0005-view-registry.md:35` "component — lazy React component"). `React.lazy` stores the rejected result on that lazy object, and the entry exposes no loader, so neither `ViewHost` nor a wrapper can import the chunk again from the registry entry. Bumping the boundary `key` only remounts the same rejected lazy component. Neither task 1.1 (which edits `viewDefinition.ts`) nor the MODIFIED app-shell requirement declares a change to `ViewDefinition`, and task 4.2 registers Cards with no mention of a loader.
- Impact: Implemented as written, scenario "User retries" (`specs/main-page/spec.md:67-70`) fails for a failed chunk load (the likely offline/deploy-skew case FR6 targets): Retry shows the same error again. Or the implementer silently changes the `ViewDefinition` contract from ADR-0005 during task 5.2 without it being planned, reviewed or tested.
- Fix: In D4, replace the factory sentence with an explicit contract extension: "`ViewDefinition` gains `loadComponent: () => Promise<{ default: ComponentType }>`; a helper `defineLazyView(loader)` in `views/` builds both `component: lazy(loader)` and `loadComponent: loader` from one loader, so they cannot diverge; on retry after a load failure `ViewHost` builds a fresh `lazy(definition.loadComponent)` and bumps the boundary key." Add the helper and field to task 1.1 (with a unit test that a rejected loader can be retried), use `defineLazyView` in task 4.2, and note in D4 that the field extends — does not replace — ADR-0005's `component`.
- Fix risk: Adds one field to ADR-0005's documented contract; `component` stays lazy, so ADR-0005's rules (lazy loading, registry as single source) still hold, but the ADR's field table becomes incomplete until it is amended. Low.
- Status: open

### R8 — SUGGESTION — Empty-registry scenario allows a blank content area, contradicting UX1
- Location: `openspec/changes/add-main-page-scaffold/specs/app-shell/spec.md:12`
- Rule: —
- Problem: The modified scenario expects "an error-free empty content region" when no view is registered. UX1 (`proposal.md:85`) says the user never sees a blank content area. `resolveActiveView` must handle an empty registry (task 1.2), so this state is reachable in tests.
- Impact: The implementer cannot tell whether `ViewHost` should render nothing or a fallback text for an empty registry, and the unit scenario and a UX1 check would assert opposite things.
- Fix: Scope UX1 to states with a registered view ("every state of a registered view shows text"), or change the scenario's THEN to "the app title and no error are shown", which leaves the content unasserted. The first is the smaller edit.
- Fix risk: none; the empty registry is a developer-only state after this change.
- Status: open

### R9 — SUGGESTION — UX2 has no task
- Location: `openspec/changes/add-main-page-scaffold/proposal.md:86`
- Rule: `.claude/rules/traceability.md`
- Problem: UX2 (design tokens only, follows the system theme) appears on the "Accessible and responsive main page" requirement, but no task in `tasks.md` references UX2.
- Impact: M1-style coverage greps find no implementing test for UX2, and the traceability chain breaks at the task level.
- Fix: Add UX2 to task 6.1's reference list, since its light/dark axe runs cover theme following, and state in task 5.4 that new components use only token-based Tailwind classes (no inline styles).
- Fix risk: none.
- Status: open

### R10 — SUGGESTION — design.md lacks the sections the design rule requires
- Location: `openspec/changes/add-main-page-scaffold/design.md:1`
- Rule: `.claude/rules/design-decisions.md`
- Problem: design.md has Context and Decisions D1–D7 but no "Consequences" and no "Alternatives Considered". D2, D5 and D7 name no requirement id (the rule says "Always reference the FR/NFR/UX … that drove the decision").
- Impact: Reviewers of later changes cannot see why, for example, container width was chosen over viewport width (D2) or why the error boundary is separate (D4) versus the rejected options. Low.
- Fix: Add a short "Consequences" (positive/negative) section and an "Alternatives Considered" section (e.g. viewport media query vs `ResizeObserver` for D2; reusing `AppErrorBoundary` for D4). Append "(FR4)" to D2, "(FR8, FR9)" to D5 and "(FR1)" to D7.
- Fix risk: none.
- Status: open

## Verdict

Needs revision. No CRITICAL findings, so the change targets the right thing: a main-page scaffold with a registry-driven view host, in line with ADR-0002, ADR-0004 and ADR-0005. The WARNINGs R1–R7 should be fixed first because they will surface during implementation: a CI-breaking bundle task, a missing script, a spec/design contradiction, an untested accessibility requirement, an undefined notice placement, a stale test-setup claim and a retry design that the `ViewDefinition` contract cannot support. R8–R10 are polish.
