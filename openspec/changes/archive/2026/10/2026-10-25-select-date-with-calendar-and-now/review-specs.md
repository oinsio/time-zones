# Specs review: select-date-with-calendar-and-now

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 37/39 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 5 |
| SUGGESTION | 3 |

## Freshness

- ✅ `model/locations.ts` has 134 lines, `LocationsState = { locations, deviceTimeZoneId }`, the five `LocationCommandType` values and four `LocationErrorCode` values named in design.md:7; no reference moment, `getEffectiveInstant` or `getReferenceZone` exists (`packages/client/src/model/locations.ts:21-45`, `model/index.ts`).
- ✅ `REPLACE_LOCATIONS` and `SET_DEVICE_TIME_ZONE` spread `state` (`model/locations.ts:121,129`), so a new `reference` field survives cross-tab replaces and `resetLocations` (which dispatches `REPLACE_LOCATIONS`, `controller/LocationsProvider.tsx:135-144`).
- ✅ `createStore` notifies only when the reducer returns a new state object (`model/store.ts:31-34`).
- ✅ `LocationsProvider` writes only through `dispatchAndSchedule`; the tick and the cross-tab subscription call `store.dispatch` directly; the context carries `store`, `clock`, `minuteTick` (`controller/LocationsProvider.tsx:110-117,148-188`).
- ✅ `useLocations` presents rows with `instant: clock.instant()` in a `useMemo` keyed on `[locations, deviceTimeZoneId, language, t, clock, minuteTick]` (`controller/useLocations.ts:35-44`).
- ✅ `presentLocationRows` takes `{ language, instant, translate, deviceTimeZoneId }` (`presenter/presentLocationRows.ts:31-47`).
- ✅ `MainPage` has the header, `<main>` with `ViewHost`, an empty bottom `<div>`, a `fixed bottom-0` `role="status"` notices region and `pb-32` (`app/MainPage.tsx:19-34`); `AppShellContent` passes `notices` (`app/AppShell.tsx:42-54`).
- ✅ `components/ui/dialog.tsx` exports `Dialog`, `DialogTrigger`, `DialogClose`, `DialogTitle`, `DialogContent` (full screen below `sm`, centred `sm:max-w-lg` from `sm`) (`components/ui/dialog.tsx:5-29`).
- ✅ `KeyboardKey` has only `ESCAPE`, `ARROW_DOWN`, `ARROW_UP`, `ENTER`, `SLASH` (`constants/keyboard.ts`).
- ✅ `Clock` has `instant()`, `plainDateISO()`, `timeZoneId()`; `fakeClock(isoTimestamp, timeZone)` exists (`lib/temporal.ts:9-37`); `temporal-polyfill` 0.3.2 in `pnpm-lock.yaml:3612`; `tsconfig.app.json` `lib` is `ES2020, ES2022.Intl, DOM, DOM.Iterable`.
- ✅ E2E config: device zone `Asia/Almaty`, `chromium` / `mobile-chrome` with `grepInvert: /@view-contract/`, one `view-contract-<id>` project per registered view (`playwright.bdd.config.ts`); step "the current time is {string}" uses `page.clock.setFixedTime` (`locations/steps/locations_local_time_e2e.steps.ts:43-48`).
- ✅ Reused E2E steps exist: "the screen is {int} px wide for the locations" (`locations_layout_e2e.steps.ts:15`), "the user opens the locations app" (`locations_ui_e2e.steps.ts:22`), "the locations screen uses the (light|dark) theme" with `emulateMedia` (`locations_view_a11y_e2e.steps.ts:18-20`), "the view under contract is shown" (`view_contract/steps/view_contract_e2e.steps.ts:8`); `test` of `locations_ui_e2e.fixtures.ts:117` extends the contract test.
- ✅ Test helpers named in tasks exist: `createManualTickScheduler` (`test/tickSchedulers.ts:4`), `createManualWriteScheduler` with `lastDelayMs()` (`test/writeSchedulers.ts:12-30`), `registryOverride` (`test/registryOverride.ts:4`), `buildTestView` / `failingThenLoading` (`test/viewFixtures.tsx:9,30`), `NOT_JSON` (`locations/steps/locationsPersistenceWorld.ts:15`), the local `setBrowserConnection` and the `QuotaExceededError` spy (`main_page/steps/main_page_unit.steps.ts:34,93-94`), `test/setup.ts` loading `localStorageMock`.
- ❌ Task 4.2 (`tasks.md:25`) says `renderLocations(repository, writeScheduler, clock, tickScheduler)` can be used "with a store pinned through `useReferenceMoment` actions"; the helper renders only `useLocations()` inside its own `LocationsProvider` (`test/renderLocations.tsx:23-39`), so no `useReferenceMoment` action can reach that store.
- ✅ `model/locations.test.ts` asserts `INITIAL_LOCATIONS_STATE` with `toEqual` at line 187.
- ✅ 32 existing screenshot baselines (16 "list" / "empty" / "suggestions" / "IST results" × 2 projects) under `test/features/__screenshots__/`, taken at the fixed time `2026-03-08T07:30:00Z` (`locations/locations_ui_e2e.feature:111-112`).
- ✅ `main_page_e2e.feature` has "Header keeps its position" (line 55); `main_page_unit.feature` has "User opens the app" and "Notices stay available" tagged `@add-main-page-scaffold` (lines 5-12).
- ✅ `LocationSearchDialog.tsx` uses `DialogClose` named by `t("locations.close")` (lines 91-96); `getLocalDateTime` catches only `RangeError` (`model/localDateTime.ts:15`); `LOCAL_TIME_FORMAT_OPTIONS` is `HH:mm` h23 (`constants/localDateTime.ts:2-6`).
- ✅ Tokens `--color-accent`, `--color-accent-foreground`, `--color-foreground`, `--color-muted-foreground` exist in both themes (`styles/tokens.css:8-30`).
- ✅ The three `MODIFIED` `locations` requirements and the `main-page` "Main page regions" requirement exist in `openspec/specs/` and are restated verbatim apart from the declared changes (diffed against `openspec/specs/locations/spec.md:189-242,586-655` and `openspec/specs/main-page/spec.md:8-22`).
- ✅ Nothing is implemented yet: no `SET_DATE`, `DateBar` or `select-date` in `packages/client/src/` or `openspec/changes/archive/`.
- ✅ README MVP feature 6 "Date selection" (`README.md:47`), `docs/architecture/views.md:84,86` ("Now control … visible only when the moment is pinned", "Date control"), `docs/architecture/open-questions.md:17` (Q5), the bottom `<footer>` bar in `docs/design/screens/phone-light.html:561` and `tablet-light.html` (centred), and Q2 of the archived `show-local-time-and-date-on-location-cards` (`proposal.md:135`) all say what the artifacts cite.
- ✅ `domain-model.md` defines `SET_DATE(date)`, `SHIFT_DATE(days)`, `RESET_TO_NOW()`, `getEffectiveInstant(state, now)`, `getReferenceZone(state)` and invariant 4 ("`reference.instant` is present if and only if `reference.mode` is `PINNED`") (lines 47, 63-65, 87-88).
- ✅ Date facts in scenarios hold: US DST 2026 starts 8 March and ends 1 November; Almaty is UTC+5; 2026-03-08 is a Sunday, 2026-07-15 a Wednesday, 2027-03-08 a Monday; March 2026 has 5 Sunday-first and 6 Monday-first week rows; February 2026 has 4.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ "Reference moment" | ✅ 2.2, 4.1, 6.1 |
| FR2 | ✅ | ✅ "Previous and next day" | ✅ 2.2, 4.1, 5.2, 6.1, 7.2 |
| FR3 | ✅ | ✅ "Choose a date in the calendar", "Calendar month layout" | ✅ 2.3, 3.2, 4.3, 5.4, 6.2, 7.2 |
| FR4 | ✅ | ✅ "Wall-clock resolution on the new date" | ❌ the "AMBIGUOUS shows no note" clause has no test (R5) |
| FR5 | ✅ | ✅ `locations` MODIFIED requirements | ✅ 4.2, 6.1 |
| FR6 | ✅ | ✅ "Return to now", `locations` "follow the clock" | ✅ 4.1, 4.2, 5.2, 6.1, 7.2 |
| FR7 | ✅ | ✅ "Date bar" | ✅ 3.1, 4.1, 6.3, 7.1 |
| FR8 | ✅ | ✅ "Date bar on every page state", `main-page` | ✅ 5.5, 6.3, 6.4, 7.3 |
| FR9 | ✅ | ✅ "Date bar", "Calendar month layout" | ✅ 3.1, 3.2, 5.1, 6.2, 6.3 |
| FR10 | ✅ | ✅ "Previous and next day", "Wall-clock resolution…", "Choose a date…" | ✅ 2.2, 6.1, 6.2 |
| NFR-P1 | ✅ | ✅ "Date changes are fast" | ✅ 6.1 |
| NFR-A1 | ✅ | ✅ "Accessible date selection" | ✅ 7.1 |
| NFR-A2 | ✅ | ✅ "Keyboard-operable date selection" | ✅ 7.1 |
| NFR-A3 | ✅ | ✅ "Accessible date selection" | ✅ 7.1 |
| NFR-R1 | ✅ | ✅ "Date bar layout" | ✅ 7.1 |
| NFR-R2 | ✅ | ✅ "Date bar layout" | ✅ 7.1 |
| NFR-R3 | ✅ | ✅ "Date bar layout" | ✅ 7.4 |
| UX1 | ✅ | ✅ "Date bar layout" ("Touch targets") | ✅ 7.1 |
| UX2 | ✅ | ✅ "Date bar layout" ("Bar controls look as approved") | ✅ 7.1 |
| UX3 | ✅ | ✅ "Date bar layout" ("The date is the most prominent text") | ✅ 7.1 |
| G1 | ✅ | n/a — met by FR2, FR3 | n/a — met by FR2, FR3 |
| G2 | ✅ | n/a — met by FR5, NFR-P1 | n/a — met by FR5, NFR-P1 |
| G3 | ✅ | n/a — met by FR6 | n/a — met by FR6 |
| NG1 | ✅ | n/a | n/a — no artifact builds time selection |
| NG2 | ✅ | n/a | n/a — only the bar's GAP note is built, as NG2 allows |
| NG3 | ✅ | n/a | n/a — no home or Here entry is built |
| NG4 | ✅ | n/a | n/a — no differences or day-shift hints are built |
| NG5 | ✅ | n/a | n/a — no day strip is built |
| NG6 | ✅ | n/a | n/a — nothing is stored or put in a URL |
| NG7 | ✅ | n/a | n/a — no extra date limits are built |
| M1 | ✅ | n/a | ✅ 8.1 |
| M2 | ✅ | n/a | ✅ 2.2, 4.2, 6.1 |
| M3 | ✅ | n/a | ❌ the "1 of 3" note count has no AMBIGUOUS check (R5) |
| M4 | ✅ | n/a | ✅ 2.3, 3.1, 3.2, 6.2, 6.3 |
| M5 | ✅ | n/a | ✅ 4.1, 6.1 |
| M6 | ✅ | n/a | ✅ 2.4, 3.3, 4.4, 5.6 |
| M7 | ✅ | n/a | ✅ 7.1, 7.4 |
| Q1 | ✅ | n/a | n/a — answered in proposal Q1 / NG2; design D4 "No gap note" alternative |
| Q2 | ✅ | n/a | n/a — answered in proposal Q2; design D4 ("follow `Intl` conventions (proposal Q2)") |

## Consistency

- `tasks.md:18` (3.1) and `tasks.md:24` (4.1) assert the translated `Choose date, …` label and the gap note text from `en.json` / `ru.json`, but those keys are only added by the later task 5.1 (`tasks.md:31`); presenter tests use the real locale resources (`presenter/presentLocationRows.test.ts:29`, `test/setup.ts:5`), so 3.1 and 4.1 depend on a later task (R3).
- `tasks.md:41` (6.2) drives `useReferenceMoment` / `useCalendarMonth` with `renderHook`, while the scenarios it must implement assert "the calendar is closed" and the New York row text (`specs/date-selection/spec.md:101-103,108`) and act by "closes the calendar without picking" (`spec.md:113`) — none of which exists without a rendered dialog and rows (R4).

## Findings

### R1 — WARNING — `aria-selected` on the day `<button>` fails axe-core
- Location: `openspec/changes/select-date-with-calendar-and-now/design.md:97`
- Rule: `docs/adr/0002-model-presenter-swappable-views.md` (View contract: "pass axe-core checks")
- Problem: D6 renders "one `<button>` per day (`aria-label` full date, `aria-selected` on the selected one, `aria-current="date"` on today …)". `aria-selected` is not a global ARIA attribute and is not supported on the `button` role (it belongs to `gridcell`, `option`, `row`, `tab` …). The existing axe scans run `new AxeBuilder({ page }).analyze()` with every default rule (`locations/steps/locations_view_a11y_e2e.steps.ts:36-39`), which includes `aria-allowed-attr`.
- Impact: Implemented as written, the "No accessibility violations" outline "with the calendar open" (NFR-A1, M7, task 7.1) reports an `aria-allowed-attr` violation in both themes, and the "calendar" screenshot state cannot pass its a11y gate. The implementer finds out only at task 7.1.
- Fix: In design D6, put `aria-selected="true"` on the `<td>` of the selected day. Inside `<table role="grid">` a `<td>` is a `gridcell`, which supports `aria-selected`. Keep the full-date `aria-label`, `aria-current="date"` (a global attribute) and the roving `tabIndex` on the `<button>`. In `specs/date-selection/spec.md:250`, say "the cell of the selected day carries `aria-selected="true"`". In task 7.1 "Names and marks", read `aria-selected` from the gridcell that contains the button named "Sunday, March 8, 2026".
- Fix risk: The E2E step must find the enclosing gridcell (`getByRole("gridcell").filter({ has: … })`). Nothing else changes, and no jsdom test asserts the attribute (D8).
- Status: fixed
- Resolution: design.md D6 now puts `aria-selected="true"` on the selected day's `<td>` gridcell and keeps `aria-label`, `aria-current="date"` and the roving `tabIndex` on the `<button>`; specs/date-selection/spec.md "Accessible date selection" and "Names and marks" mark the selected grid cell; task 7.1 reads `aria-selected` from `getByRole("gridcell").filter({ has: dayButton })`.

### R2 — WARNING — The bottom bar sits outside every landmark
- Location: `openspec/changes/select-date-with-calendar-and-now/design.md:104`
- Rule: `docs/adr/0002-model-presenter-swappable-views.md` (View contract: "pass axe-core checks")
- Problem: D7 turns the empty bottom `<div>` into "a `sticky bottom-0` bar" and D6 (`design.md:95`) gives the `DateBar` a `role="group"`. Neither a `div` nor `group` is a landmark, and the bar is outside `<header>` and `<main>` (`app/MainPage.tsx:20-27`). Today every visible page content outside `<main>` is either in the `<header>` banner or in the `aria-live` notices region, which axe treats as a region. The axe scans run with the default rule set (`locations_view_a11y_e2e.steps.ts:36-39`), which includes the best-practice `region` rule ("All page content should be contained by landmarks").
- Impact: Once the bar renders on every page state, the existing axe outlines start reporting `region` violations, undeclared: `main_page_e2e.feature:7` "Main page is accessible in the <state> state" and the locations axe scenarios. The new NFR-A1 outline fails as well.
- Fix: In design D7 (and `tasks.md:35`, task 5.5), render the bottom bar as a `<footer>` element, as the approved HTML screens do (`docs/design/screens/phone-light.html:561`). It is not inside `article`, `aside`, `main`, `nav` or `section`, so it maps to the `contentinfo` landmark. Keep the `DateBar` `role="group"` inside it.
- Fix risk: The page gains one `contentinfo` landmark (none exists today, so `landmark-no-duplicate-contentinfo` holds). The notices region moves inside the footer per D7 and stays a polite live region, and `AppShell.notices.test.tsx:56` ("outside main") still holds.
- Status: fixed
- Resolution: design.md D7 renders the bottom bar as a `<footer>` (the page's only `contentinfo` landmark, as in `phone-light.html`), keeping the `DateBar` `role="group"` inside it; specs/main-page/spec.md "Main page regions" says the bottom bar is the page's footer landmark; task 5.4 builds the `<footer>` and asserts `bottomBar` is inside a `<footer>` after `<main>`; task 7.3 keeps the existing axe outlines (default rules, `region` included) green.

### R3 — WARNING — Locale keys are added after the tasks that assert their text
- Location: `openspec/changes/select-date-with-calendar-and-now/tasks.md:31`
- Rule: `.claude/rules/tdd-workflow.md` (Step 3: run after each function and show green)
- Problem: Task 3.1 (`tasks.md:18`) expects `chooseDateLabel` `Choose date, Sunday, March 8, 2026` and the English and Russian gap notes. Task 4.1 (`tasks.md:24`) expects the English gap note of M3. All of these come from `translate("date.chooseDate")` / `translate("date.gapNote")` (design D4), and presenter tests translate with the real locale resources (`presenter/presentLocationRows.test.ts:29` `i18n.getFixedT(language)`, `test/setup.ts:5` `localeResources`). The `date.*` keys are only created in task 5.1, two sections later.
- Impact: Following the task order, 3.1 and 4.1 cannot go green: `t` returns the raw key. The implementer either breaks the order or adds keys out of plan.
- Fix: Move task 5.1 (both locale files with the `date` keys of D6, verified by `npx vitest run src/locales/locales.test.ts`) into section 1 as task 1.2, before the presenter tasks. Renumber section 5.
- Fix risk: none. `locales.test.ts` only checks that both files have the same keys, and no other task depends on 5.1 running later.
- Status: fixed
- Resolution: the locale-keys task is now task 1.2 in section 1 (before presenter 3.1 and controller 4.1, with the reason stated); section 5 is renamed "Views" and renumbered 5.1–5.5. No other artifact cites the old numbers.

### R4 — WARNING — Calendar BDD steps cannot run their scenarios with `renderHook`
- Location: `openspec/changes/select-date-with-calendar-and-now/tasks.md:41`
- Rule: `.claude/rules/test-planning.md` ("If a scenario is in Gherkin — it must have step definitions")
- Problem: Task 6.2 says the steps "drive `useReferenceMoment` and `useCalendarMonth` with `renderHook` inside `LocationsProvider`". The scenarios it lists need more than those hooks. "Pick a date in a later month" asserts "the calendar is closed" and "the New York row shows `03:30` and `Wed, Jul 15`" (`specs/date-selection/spec.md:101-103`). "Picking the shown date changes nothing" asserts "the calendar is closed" (`spec.md:108`). "Closing the calendar changes nothing" acts by closing the calendar without picking (`spec.md:113`). No dialog and no rows exist in a hook-only render: the open/closed state is view state of `CalendarDialog` (design D6), and rows come from `useLocations`.
- Impact: The implementer either cannot write these steps or writes no-op steps. A vacuous "closed" step then hides a broken pick-and-close flow behind green FR3 scenarios.
- Fix: In task 6.2, render `AppShell` (in-memory repository, `fakeClock`, manual tick and write schedulers, as 6.1 does). Act with `userEvent` on controls found by role and name, which D8 allows for acting. Assert that the calendar is closed with `queryByRole("dialog")` being `null`, and assert the bar's `<time dateTime>` and the rows' text. Keep `renderHook` on `useCalendarMonth` only for "March 2026 in English and Russian" and for the `isSelected` / `isToday` flags of "The calendar opens on the pinned date", seeded through a pinned store.
- Fix risk: Rendering `AppShell` makes these steps slower and couples them to `CardsView`. The asserted facts (dialog presence, `dateTime`, row text) are on D8's list of what jsdom may assert, so no rule is crossed.
- Status: fixed
- Resolution: task 6.2 now renders `AppShell` (in-memory repository, `fakeClock`, manual tick and write schedulers) for "Pick a date in a later month", "Picking the shown date changes nothing" and "Closing the calendar changes nothing", acts with `userEvent` by role and name, and asserts `queryByRole("dialog")`, the heading, the bar's `<time dateTime>` and the New York row text; `renderHook` stays only for "March 2026 in English and Russian" and "The calendar opens on the pinned date", with both hooks in one provider. Its first THEN in specs/date-selection/spec.md now reads only "it shows March 2026" (the heading text 6.2 asserts); the selected and today marks stay covered by "The calendar opens on the pinned date" (`isSelected` / `isToday` via `renderHook`) and by E2E "Names and marks" (task 7.1).

### R5 — WARNING — "AMBIGUOUS shows no note" is never tested
- Location: `openspec/changes/select-date-with-calendar-and-now/specs/date-selection/spec.md:74`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it")
- Problem: FR4 (`proposal.md:67`) and the spec (`spec.md:63`) require "`UNIQUE` and `AMBIGUOUS` show no note", and M3 (`proposal.md:139`) counts "only the `GAP` case shows the note (1 of 3)". The "Wall-clock outcomes" scenario (`spec.md:74-83`) checks only the pinned instant and the status. "A gap is told in the bar" checks GAP then UNIQUE. Tasks 3.1, 4.1 and 5.2 check GAP and the no-gap path, but never the AMBIGUOUS one. D4 makes the controller pass `gap` "only when the pinned moment's `wallClockStatus` is `GAP`", and nothing pins that rule for AMBIGUOUS.
- Impact: The controller could build the note for every non-`UNIQUE` status (`!== UNIQUE`), showing a false "does not exist" note for 01:30 on 1 November. Every listed test and the M3 metric would still pass, so M3's "1 of 3" stays unverified.
- Fix: Add a `note` column to the "Wall-clock outcomes" table (`UNIQUE` → none, `GAP` → `02:30 does not exist on this day because of a clock change; showing 03:30.`, `AMBIGUOUS` → none) with a step "And the bar shows `<note>`" asserted in 6.1, which renders `AppShell`. Also add to task 4.1: with `fakeClock("2026-10-31T05:30:00Z", "America/New_York")`, `showNextDay` leaves `dateBar.gapNote` `undefined`.
- Fix risk: none. The bar text is a jsdom-safe assertion (D8), and the scenario keeps its `@FR4 @M3` tags.
- Status: fixed
- Resolution: specs/date-selection/spec.md "Wall-clock outcomes" gains a `note` column (`UNIQUE` → no note, `GAP` → the M3 note text, `AMBIGUOUS` → no note) and a step "the bar shows `<note>`", asserted in task 6.1, which renders `AppShell`; task 4.1 adds `fakeClock("2026-10-31T05:30:00Z", "America/New_York")` `showNextDay` → `isoDate` `2026-11-01` with `gapNote` `undefined`.

### R6 — SUGGESTION — The date-change live region must not take `role="status"`
- Location: `openspec/changes/select-date-with-calendar-and-now/design.md:95`
- Rule: —
- Problem: D6 adds "a polite `sr-only` live region" to `DateBar` without saying how it is marked up. `DateBar` renders in `AppShell`, and many existing tests find the notices region with `screen.getByRole("status")`: `app/AppShell.notices.test.tsx:37-67`, `app/AppShell.pageNotices.test.tsx:61-108`, `app/AppShell.test.tsx:74`, `app_shell/steps/app_shell_notices.steps.ts:67`, `main_page/steps/main_page_unit.steps.ts:33`, plus the E2E selector `'[role="status"] > div'` (`main_page/steps/main_page_e2e.steps.ts:18`).
- Impact: A region written as `role="status"` makes every one of those `getByRole("status")` calls throw "multiple elements found". It breaks existing tests that design.md:139 promises stay green.
- Fix: In D6, state the markup the codebase already uses for its other live regions: `<p aria-live="polite" aria-atomic="true" className="sr-only">` without a role, as `views/cards/CardsView.tsx:65` and `views/shared/LocationSearchDialog.tsx:140` do.
- Fix risk: none. The E2E check "Date change is announced" can read the region by its `aria-live` attribute.
- Status: fixed
- Resolution: design.md D6 specifies the date-change live region as `<p aria-live="polite" aria-atomic="true" className="sr-only">` with no `role`, as `CardsView.tsx:65` and `LocationSearchDialog.tsx:140` do, so the existing `getByRole("status")` lookups stay unique; task 7.1 "Date change is announced" reads the bar's `[aria-live="polite"]` element.

### R7 — SUGGESTION — 44 px calendar days do not fit a 320 px full-screen dialog
- Location: `openspec/changes/select-date-with-calendar-and-now/proposal.md:95`
- Rule: —
- Problem: UX1 requires every calendar day to be at least 44 × 44 px, and D6 takes the calendar layout from the existing `DialogContent`, which is `fixed inset-0 … border … p-4` below 640 px (`components/ui/dialog.tsx:26`). At 320 px the content box is 320 − 2 × 16 − 2 × 1 = 286 px wide, but 7 × 44 = 308 px. NFR-R1 checks only the page's `scrollWidth` (task 7.1), and "Touch targets" runs only at 375 px (`spec.md:331-333`).
- Impact: At 320 px either the day buttons shrink below 44 px, breaking UX1, or the grid overflows and the calendar scrolls sideways inside the dialog. No planned test notices either outcome.
- Fix: In D6, give the calendar's `DialogContent` a narrower horizontal padding below `sm` (for example `px-1 sm:p-4` through its `className`), with table cells without padding, so 7 × 44 px fits 320 px. Extend the "No horizontal scrolling" scenario (`spec.md:335-342`, task 7.1) so that at 320 px with the calendar open the dialog's `scrollWidth` ≤ `clientWidth` too.
- Fix risk: The narrow calendar's padding differs from the search dialog's. The new "calendar" baselines are taken at 375 px anyway, so no existing baseline changes.
- Status: fixed
- Resolution: design.md D6 gives the calendar's `DialogContent` `className="px-1 sm:p-4"` with unpadded cells, so 7 × 44 px fits 320 px (286 px with the default `p-4`); new scenario "Calendar days fit the narrowest screen" in specs/date-selection/spec.md and its check in task 7.1 (`@NFR-R1 @UX1`: day boxes ≥ 44 × 44 and the dialog's `scrollWidth` ≤ `clientWidth` at 320 px).

### R8 — SUGGESTION — `renderLocations` cannot pin the store for task 4.2
- Location: `openspec/changes/select-date-with-calendar-and-now/tasks.md:25`
- Rule: —
- Problem: Task 4.2 uses `renderLocations(repository, writeScheduler, clock, tickScheduler)` "and a store pinned through `useReferenceMoment` actions". The helper is `renderHook(() => useLocations(), { wrapper: LocationsProvider … })` (`test/renderLocations.tsx:23-39`). It exposes no `useReferenceMoment` result, and a second `renderHook` would create a separate provider and store.
- Impact: The implementer cannot follow the task as written and has to invent a test harness while in the RED step.
- Fix: In task 4.2, render `renderHook(() => ({ locations: useLocations(), reference: useReferenceMoment() }), { wrapper })` with the same `LocationsProvider` props `renderLocations` passes. Alternatively, extend `renderLocations` with an optional hook argument whose default is `useLocations`.
- Fix risk: Extending the shared helper touches a file used by six `useLocations.*.test.tsx` suites. The default argument keeps them unchanged.
- Status: fixed
- Resolution: task 4.2 now uses `renderHook(() => ({ locations: useLocations(), reference: useReferenceMoment() }), { wrapper })` with the `LocationsProvider` props `renderLocations` passes, pinning through `result.current.reference`; the shared `renderLocations` helper is left untouched.

## Verdict

Needs revision: R1, R2, R3, R4 and R5 block. R1 and R2 make the planned and existing axe-core scans fail. R3 orders tasks so they cannot go green. R4 plans BDD steps that cannot run their scenarios. R5 leaves the AMBIGUOUS part of FR4 / M3 untested. R6–R8 are low-cost polish to fold in during the same revision.
