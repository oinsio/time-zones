# Specs review: add-locations-via-search

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 51/51 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 3 |

## Freshness

- ✅ Nothing of the change is implemented yet: the branch diff against the base commit touches only `openspec/changes/add-locations-via-search/` and `.gnomish-task/`; `grep -rn "REPLACE_LOCATIONS\|reduceLocations\|LocationRepository" packages/client/src` finds nothing; no archived change under `openspec/changes/archive/2026/09/` delivers locations or search.
- ✅ design.md:7 — `packages/client/src/model/index.ts` and `presenter/index.ts` both contain only `export {};`.
- ✅ design.md:8 — `src/ports/` holds only `storageAvailability.ts`; `src/adapters/` holds `localStorageAvailability.ts`, `inMemoryStorageAvailability.ts`, `storageAvailability.contract.ts`.
- ✅ design.md:9 — `src/controller/` holds exactly `useContainerWidth`, `useDocumentLanguage`, `useOnlineStatus`, `usePwaUpdateStatus`, `useStorageAvailability`; `useStorageAvailability(storageAvailability = localStorageAvailability)`.
- ✅ design.md:10 — `views/cards/CardsView.tsx` renders only `t("views.cardsEmptyState")`; `src/views/shared/` and `src/components/` do not exist; `package.json` has only `@radix-ui/react-slot` from Radix; `components.json` maps `ui` to `@/components/ui`.
- ✅ design.md:11 — `constants/storage.ts` exports only `STORAGE_AVAILABILITY_PROBE_KEY`; `KeyboardKey` has only `ESCAPE`; `i18n.ts:12` defines `LANGUAGE_STORAGE_KEY` and the detector is configured with `caches: ["localStorage"]` (i18n.ts:33), so it already writes on first launch.
- ✅ design.md:12 — `tsconfig.app.json` has `"lib": ["ES2020", "DOM", "DOM.Iterable"]`; `tsconfig.test.json` extends it.
- ✅ design.md:13 — `scripts/check-bundle-size.mjs` counts the entry script plus `modulepreload` links, budget `INITIAL_JS_BUDGET_KB = 150`, requires a `CardsView-` chunk; `vite.config.ts` has `globPatterns: ["**/*.{js,mjs,css,html,ico,png,svg,json,woff2}"]` and `registerType: "prompt"` with no `clientsClaim`/`skipWaiting`; `main_page_e2e.fixtures.ts:33-44` holds and aborts `CardsView-` via `page.route`.
- ✅ design.md:14 — `views/createRetryableLazyView.ts` says "Browsers also remember a failed dynamic import of the same URL, so when the retried load fails again the page is reloaded".
- ✅ design.md:15 — `.github/workflows/ci.yml` runs `pnpm test`, `pnpm build`, `check:bundle-size`, then `git diff --exit-code`.
- ✅ design.md:16 — `vitest.config.ts` registers only `react()`; `stryker.config.mjs` sets `configFile: "vitest.config.ts"`; `tsconfig.node.json` includes `vite.config.ts` and `scripts`; root `.gitignore` has `**/*.d.ts` and `!**/vite-env.d.ts`.
- ✅ design.md:17 — `styles/tokens.css` and `tailwind.config.ts` define only background, foreground, muted-foreground, accent (+foreground), notice (+foreground) and four `day-*`; `themeTokens.ts` reads `#[0-9a-fA-F]{6}` tokens; `tailwind.config.ts` defines no `screens`.
- ✅ design.md:18 — `app/ViewHost.tsx` renders a bare `<div ref={containerRef} className="w-full">` with no view id; the registry holds only `cards` with `CARDS_AUTO_MIN_WIDTH = 0`; `playwright.bdd.config.ts` has `outputDir: ".features-gen"`, projects `chromium` and `mobile-chrome`, no screenshot options; `tsconfig.node.json` has `lib: ["ES2023"]`, no `jsx`, no `paths`; `package.json` is `"type": "module"`; no `@view-contract` tag exists in `src/`.
- ✅ design.md:72, 89 — `adapters/localStorageAvailability.ts:25` "Probes the browser's `localStorage`; the access itself may throw" and `PROBE_VALUE = "1"` (line 4).
- ✅ design.md:55 — `app/AppShell.tsx` calls `useStorageAvailability()` in its body and renders `{!isStorageAvailable && <StorageWarning />}`.
- ✅ design.md:31, 33 — `docs/architecture/domain-model.md:53-57` lists `ADD_LOCATION`/`REMOVE_LOCATION` with `DUPLICATE_LOCATION`, `UNKNOWN_TIME_ZONE`, `LOCATION_NOT_FOUND`; no `REPLACE_LOCATIONS` row exists yet; invariant 2 (line 45) is "No two locations share the same canonical `timeZoneId` and `label`".
- ✅ design.md:94, tasks.md:8 — npm: `cldr-bcp47` and `cldr-dates-full` are at 48.2.0; `cldr-dates-modern` latest is 45.0.0.
- ✅ design.md:97-101 — CLDR 48 data (checked in the published packages): `utc` has no `_iana` and aliases `Etc/UTC Etc/UCT Etc/Universal Etc/Zulu UCT UTC Universal Zulu`; `inccu` has `_iana: Asia/Kolkata`; `uaiev` aliases include `Europe/Zaporozhye`; `usnyc` aliases include `EST5EDT`; `est5edt` carries only `_deprecated`/`_preferred`; English `timeZoneNames` has no exemplar city for `Asia/Almaty`; Russian has `Asia/Calcutta` → "Калькутта"; comparing each key's first two letters against its `_description`, the only non-`Etc` keys whose country is wrong are `jeruslm`, `gazastrp`, `hebron`, `gpmsb`, `gpsbh` — the five overrides of D6.
- ✅ design.md:193 — the proposed token values meet the stated contrasts: danger 6.13:1 / 6.57:1 (light, background/surface) and 7.83:1 / 7.01:1 (dark); border 3.42:1 (light) and 3.71:1 (dark) against surface.
- ✅ tasks.md:65 — `app/AppShell.pageNotices.test.tsx:99` is "should warn when writing to storage fails and keep the view"; `views/cards/CardsView.test.tsx:19-22` is "should offer no action while there is nothing to act on" with `queryByRole("button")`; the files rendering the Cards view outside `AppShell` are exactly `CardsView.test.tsx`, `app/MainPage.test.tsx` and `main_page_view_host_unit.steps.tsx`.
- ✅ design.md:201 — `locales/locales.test.ts:63` "should have identical key sets in every locale file"; `views.cardsEmptyState` exists in `en.json`.
- ✅ proposal.md:137, 141 — `docs/design/README.md:38` has "## Not covered yet"; `docs/ia/` does not exist.
- ✅ proposal.md:17, 156 — archived `add-main-page-scaffold/proposal.md:122-123` holds Q1 (the "Add location" action waits for search) and Q2 (Storybook).
- ✅ specs/main-page/spec.md:5-11 — the MODIFIED "Empty state" restates the stable `openspec/specs/main-page/spec.md` requirement and its "First launch" scenario, adding only the action.
- ❌ design.md:109 / tasks.md:9 — the plan declares `virtual:time-zone-aliases`, `virtual:zone-cities-url` and `virtual:zone-cities` only in `src/vite-env.d.ts`, on the assumption that every TypeScript project sees that file. `tsconfig.test.json` has `"include": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**/*"]`, which does not match `src/vite-env.d.ts`, and nothing imports that file. That is why `tsconfig.test.json` repeats `vite/client` and `vite-plugin-pwa/client` in its own `types`. A repro with TypeScript 5.7 and this include pattern fails with TS2307 "Cannot find module 'virtual:zone-cities'" (see R1).

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ location-search "Query normalization" | ✅ 4.2, 4.7 |
| FR2 | ✅ | ✅ "Search by city" | ✅ 4.3, 4.7 |
| FR3 | ✅ | ✅ "Search by country" | ✅ 4.6, 4.7 |
| FR4 | ✅ | ✅ "Search by abbreviation" | ✅ 4.4, 4.7 |
| FR5 | ✅ | ✅ "Result order and content" | ✅ 4.6, 4.7, 5.1, 8.3 |
| FR6 | ✅ | ✅ "Suggestions before typing" | ✅ 4.6, 4.7, 6.2, 8.4 |
| FR7 | ✅ | ✅ "No matches" | ✅ 4.7, 8.3, 8.8 |
| FR8 | ✅ | ✅ "Location identity", "Add a location", "Adding from the search" | ✅ 2.2, 2.5, 8.4, 8.8, 9.2 |
| FR9 | ✅ | ✅ "Location identity", "List is kept on the device" | ✅ 2.1, 2.3, 3.3, 6.3 |
| FR10 | ✅ | ✅ "Remove a location", "List in the Cards view" | ✅ 2.2, 2.5, 8.2, 9.2 |
| FR11 | ✅ | ✅ "List is kept on the device" | ✅ 3.2, 3.3, 6.1, 6.3 |
| FR12 | ✅ | ✅ "Unreadable stored list" | ✅ 3.3, 6.1, 6.3, 8.8 |
| FR13 | ✅ | ✅ "Working without storage" | ✅ 3.3, 6.1, 8.6, 8.8 |
| FR14 | ✅ | ✅ "Sync between open tabs" | ✅ 3.2, 6.3, 9.6 (handling of non-LOADED external results unspecified, R2) |
| FR15 | ✅ | ✅ "Search data states" | ✅ 4.9, 6.2, 8.4, 9.3 |
| FR16 | ✅ | ✅ "Search data states" (Offline search), "List is kept on the device" (Offline reopen) | ✅ 9.6 |
| FR17 | ✅ | ✅ main-page MODIFIED "Empty state", locations "List in the Cards view" | ✅ 8.6, 8.7 |
| FR18 | ✅ | ✅ "Location strings are localized" | ✅ 7.1, 8.8 |
| NFR-P1 | ✅ | ✅ "Search is fast and lazy" (Query timing) | ✅ 4.7 |
| NFR-P2 | ✅ | ✅ "Search is fast and lazy" | ✅ 4.9, 8.4, 9.3 |
| NFR-A1 | ✅ | ✅ "Accessible and responsive list/search" | ✅ 9.2 |
| NFR-A2 | ✅ | ✅ "Keyboard-operable search" | ✅ 8.6, 9.2 |
| NFR-A3 | ✅ | ✅ "List in the Cards view", "Result order and content" | ✅ 9.2, 9.4 |
| NFR-R1 | ✅ | ✅ "Accessible and responsive list/search" | ✅ 9.5 (unreadable-list state not measured, R3) |
| NFR-R2 | ✅ | ✅ Screenshots scenarios | ✅ 9.1, 9.5 |
| UX1 | ✅ | ✅ "Suggestions before typing", "No matches", "Search data states" | ✅ 8.3, 8.8, 9.3 |
| UX2 | ✅ | ✅ "Adding from the search" (Results follow typing) | ✅ 8.3, 8.8 |
| UX3 | ✅ | ✅ "Result order and content", Ambiguous abbreviation | ✅ 5.1, 8.3, 8.8 |
| UX4 | ✅ | ✅ "Add a location", "List is kept on the device" | ✅ 2.5, 6.3, 8.8 |
| UX5 | ✅ | ✅ "List in the Cards view", "Accessible and responsive list/search" | ✅ 1.5, 8.1, 9.2 |
| M1 | ✅ | n/a | ✅ 10.1 |
| M2 | ✅ | n/a | ✅ 2.7, 3.4, 4.8, 4.9 (plus 5.2, 6.4, 8.9 beyond its scope) |
| M3 | ✅ | n/a | ✅ 9.2 |
| M4 | ✅ | ✅ abbreviation, city, country scenarios | ✅ 4.7 |
| M5 | ✅ | ✅ identity and load scenarios | ✅ 2.1, 2.3, 3.3 |
| M6 | ✅ | ✅ Query timing | ✅ 4.7 |
| M7 | ✅ | ✅ "Search is fast and lazy" | ✅ 4.9, 9.3 |
| G1 | ✅ | n/a — met by NFR-A2, FR6, FR8 | n/a — met by NFR-A2 (9.2) |
| G2 | ✅ | n/a — met by FR11, FR12 | n/a — met by FR11, FR12 (6.3, 8.8, 9.6) |
| G3 | ✅ | n/a — met by FR9, M5 | n/a — met by FR9, M5 (2.1, 2.3, 3.3) |
| NG1 | ✅ | n/a | n/a — no artifact shows time, offset or day track |
| NG2 | ✅ | n/a | n/a — no home, Here entry or "here" mark is built |
| NG3 | ✅ | n/a | n/a — no reorder or rename |
| NG4 | ✅ | n/a | n/a — only CLDR exemplar cities (D6) |
| NG5 | ✅ | n/a | n/a — offsets not matched (D7, "Offsets are not a search input") |
| NG6 | ✅ | n/a | n/a — no Storybook task; screenshots in 9.5 |
| NG7 | ✅ | n/a | n/a — only Cards composes the shared blocks |
| Q1 | ✅ | n/a | n/a — answered in the proposal itself and design.md Risks/Alternatives (labels keep their language) |
| Q2 | ✅ | n/a | n/a — stays open, deferred to a tooling change |
| Q3 | ✅ | n/a | n/a — answered in design.md D7 (table and popular list, first version) |
| Q4 | ✅ | n/a | n/a — mechanism decided in design.md D12; ADR wording stays open |

## Consistency

None.

## Findings

### R1 — WARNING — Virtual-module declarations are invisible to the test TypeScript project
- Location: `openspec/changes/add-locations-via-search/design.md:109`, `openspec/changes/add-locations-via-search/tasks.md:9`
- Rule: `CLAUDE.md` (Post-Edit Workflow: "Run `pnpm run build` to verify build"; the client's `build` script is `tsc -b && vite build`)
- Problem: D6 and task 1.3 declare the three virtual modules (`virtual:time-zone-aliases`, `virtual:zone-cities-url`, `virtual:zone-cities`) only in `src/vite-env.d.ts`. `pnpm typecheck` is `tsc -b --noEmit` over `tsconfig.json`'s three references. `packages/client/tsconfig.test.json` has `"include": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**/*"]`, which does not match `src/vite-env.d.ts`, and no file imports it. So the test project never sees those `declare module` blocks. Every test file that imports a virtual module (task 1.3's `zoneCities.test.ts`, 4.6–4.9, `test/stubZoneCitiesFetch.ts`) fails there. So does every test that transitively reaches `model/timeZoneId.ts` (D2 imports `virtual:time-zone-aliases`), such as `CardsView.test.tsx` through `useLocations` → model. A TypeScript 5.7 repro with the same include pattern fails with `TS2307: Cannot find module 'virtual:zone-cities'`.
- Impact: task 1.3's own verification steps (`typecheck`, then `pnpm build`, whose `tsc -b` builds the same three references) fail as written. From task 2.1 on, CI's `pnpm typecheck` and `pnpm build` fail, and with them the E2E web server (`pnpm build && pnpm preview`). The implementer has to find a workaround the plan does not name.
- Fix: in design.md D6 (line 109), after "declared in `src/vite-env.d.ts`", add: "and `tsconfig.test.json` gets `src/vite-env.d.ts` in its `include`, because its include pattern does not cover it". In tasks.md 1.3, add "add `"src/vite-env.d.ts"` to `include` in `tsconfig.test.json`" to the list of edits. Keep the declarations in `vite-env.d.ts`: `.gitignore` ignores every other `.d.ts`.
- Fix risk: the test project then also loads the file's `/// <reference types="vite/client" />` and `vite-plugin-pwa/client`, which its `types` already lists, so no new globals appear. It is a config edit, so no TDD cycle is needed (`tdd-workflow.md`, "When NOT to apply TDD").
- Status: fixed
- Resolution: design.md D6 now says `tsconfig.test.json` gets `"src/vite-env.d.ts"` in its `include` (its test-only pattern misses the file); task 1.3 adds that edit to its list, before its typecheck and build verification.

### R2 — SUGGESTION — What the provider does with EMPTY or UNREADABLE from another tab is unspecified
- Location: `openspec/changes/add-locations-via-search/design.md:82`, `openspec/changes/add-locations-via-search/design.md:87`
- Rule: `.claude/rules/architecture.md` ("Invalid stored data leads to a recoverable error state, never a crash")
- Problem: D4 says that after another instance saves or clears, "other instances call their subscribers with a fresh `load()`", which can return `LOADED`, `EMPTY` or `UNREADABLE`. D5 maps load results only in the provider's state initializer. D1 says only that `REPLACE_LOCATIONS` applies "another tab". Nothing says what an open tab does when the external result is `EMPTY` or `UNREADABLE`, or whether `loadStatus` changes. Task 6.1 tests only "no write … on a change from another instance".
- Impact: two tabs both show the unreadable-list error; the user resets in one; the other tab receives `EMPTY`, but the plan does not say it must leave `UNREADABLE`. A plausible implementation keeps the error on screen until reload, which breaks FR14 ("appears in every other open tab … without a reload") for this path. The reverse case also has no defined behaviour: another tab writes a document this tab cannot read, for example a newer app version after an update.
- Fix: add to D5 (after line 87): "A change from another instance is applied by its status: `LOADED` → `REPLACE_LOCATIONS` and `loadStatus = READY`; `EMPTY` → `REPLACE_LOCATIONS` with an empty list and `READY`; `UNREADABLE` → `loadStatus = UNREADABLE`; none of them schedules a write." Add those three cases to task 6.1's list.
- Fix risk: small. It adds one branch to the provider and three cases to `useLocations.test.tsx`. Switching to the error on an external `UNREADABLE` hides this tab's list, but that matches what a reload would show (FR12).
- Status: fixed
- Resolution: design.md D5 now maps a load delivered from another instance by status (LOADED → REPLACE_LOCATIONS + READY, EMPTY → empty list + READY, UNREADABLE → UNREADABLE, no write); task 6.1 lists the three cases for `useLocations.test.tsx`.

### R3 — SUGGESTION — Unreadable-list state is never checked for horizontal scrolling
- Location: `openspec/changes/add-locations-via-search/tasks.md:78`, `openspec/changes/add-locations-via-search/specs/locations/spec.md:182`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it")
- Problem: NFR-R1 (proposal.md:102) requires "No horizontal scrolling from 320 px to 2560 px in any state". The locations spec requirement "Accessible and responsive list" lists the unreadable state (spec.md:176). But its scenario "Narrow and wide screens" (spec.md:182-184) and task 9.5 measure only "the list with 5 locations and each search state". The empty and storage-unavailable states are already measured by the existing `main_page_e2e.feature:27-43` outline. The new `LocationsLoadError` block (message plus Reset) is measured nowhere.
- Impact: an overflow in the error state (for example a long Russian message next to the Reset button at 320 px) passes every automated check, although NFR-R1 names that state.
- Fix: change the scenario at specs/locations/spec.md:183 to "each list state (with 5 locations, unreadable stored list) is shown at 320 px and 2560 px". In task 9.5 "Narrow and wide screens", add "and the unreadable-stored-list state (a non-JSON document seeded with `page.addInitScript`)".
- Fix risk: two more E2E cases per Playwright project. The check stays in `locations_ui_e2e.feature`, where layout checks belong (`bdd-unit.md`: responsive layout → E2E).
- Status: fixed
- Resolution: specs/locations/spec.md "Narrow and wide screens" now covers each list state (5 locations, unreadable stored list); task 9.5 adds the unreadable state seeded with a non-JSON document via `page.addInitScript`.

### R4 — SUGGESTION — The viewport helper's parameter type is unspecified, and the natural one fails the node typecheck
- Location: `openspec/changes/add-locations-via-search/design.md:210`, `openspec/changes/add-locations-via-search/tasks.md:75`
- Rule: `.claude/rules/process-invariants.md` ("Import only through `index.ts` of a module")
- Problem: D12 has `playwright.bdd.config.ts` statically import `src/test/viewContractViewport.ts` (`getContractViewportWidth(view, registry)`), but does not say what type `view` and `registry` have. `tsconfig.node.json` type-checks the config and every file it imports. It has no `paths` (so `@/views` does not resolve) and no `jsx`. The only import the module-boundary rule allows for `ViewDefinition` is `@/views`, whose `index.ts` also contains `import("./cards/CardsView")`. D12 itself works around this for the registry (the `string`-annotated `VIEW_REGISTRY_MODULE_PATH`), but not for this helper.
- Impact: an implementer who types the parameters as `ViewDefinition` from `@/views` gets TS2307 in the node project. Task 9.2's verify commands do not run typecheck, so this only appears at task 10.2 or in CI.
- Fix: in D12 (line 210) and task 9.2, say that `viewContractViewport.ts` declares its own structural parameter type (`{ id: string; autoMinWidth: number }`) and imports nothing from `src/`. It should also say that `view_contract_e2e.fixtures.ts`, which the config imports type-only, imports nothing through `@/`.
- Fix risk: none. `ViewDefinition` values stay assignable to the structural type, so the config can pass `viewRegistry` unchanged.
- Status: fixed
- Resolution: design.md D12 and task 9.2 now say `viewContractViewport.ts` types its parameters structurally (`{ id: string; autoMinWidth: number }`) and imports nothing from `src/`, and the view-contract fixtures import nothing through `@/`; task 9.2 verification adds `pnpm --filter @time-zones/client typecheck`.

## Verdict

Needs revision. Blocking: R1. As written, task 1.3's typecheck step and CI's `pnpm typecheck` fail. R2–R4 are low-cost clarifications that can be folded into the same revision.
