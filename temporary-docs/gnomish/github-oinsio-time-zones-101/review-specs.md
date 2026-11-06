# Specs review: polish-settings-and-remove-offline-update-notice

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 27/27 |
| Contradictions | 1 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 4 |

## Freshness

- ✅ `ZoneLabelGroup` draws its toggles from `Object.values(ZoneLabelPart)` — `packages/client/src/app/settings/ZoneLabelGroup.tsx:29`; the enum order is `UTC_OFFSET`, `ZONE_ABBREVIATION` — `src/preferences/preferences.ts:21-23`.
- ✅ `presentZoneLine` writes the order place, zone abbreviation, UTC offset by hand — `src/presenter/zoneLine.ts:48-59`.
- ✅ The stored `zoneLabelParts` order follows the enum: `parseStoredPreferences.ts:52` and `preferencesCommands.ts:35` filter `Object.values(ZoneLabelPart)`.
- ✅ `ZONE_LABEL_EXAMPLE = { timeZoneId: "Asia/Kolkata", countryCode: "IN" }` in `src/constants/preferences.ts:10-13`, read only by `presentZoneLabelExample` (`src/presenter/zoneLine.ts:80`).
- ✅ `MSK` is written «МСК» in Russian through `locations.zoneAbbreviationMsk` — `src/constants/zoneAbbreviations.ts:8`, `src/presenter/zoneAbbreviation.test.ts:8`; `getZoneAbbreviation("Europe/Moscow", …)` is `MSK` (`src/model/zoneAbbreviation.test.ts:57`).
- ✅ `constants/` may import `@/preferences` without a cycle: `src/constants/localDateTime.ts:1` already does, and nothing under `src/preferences/` imports `@/constants`.
- ✅ The note comes from `isUpdateCheckFailed` of `usePwaUpdateStatus`; the start-up check and `useUpdateRecheckOnReturn` (third argument `onCheckFailed`) set it, `useOnlineStatus` clears it — `src/controller/usePwaUpdateStatus.ts:36-50`, `useUpdateRecheckOnReturn.ts:17-47`.
- ✅ `AppShell` renders `UpdateCheckFailedNote`, exported from `src/app/index.ts:7` — `src/app/AppShell.tsx:21,94`.
- ✅ `useOnlineStatus` has no production consumer besides `usePwaUpdateStatus` — only `src/controller/index.ts:19` re-exports it.
- ✅ Every reader of `mainPage.updateCheckFailed` / the failure text that tasks 5.1–5.4 name exists: `AppShell.pageNotices.test.tsx:15`, `UpdateCheckFailedNote.test.tsx`, `main_page_unit.steps.ts:105,128`, `app_shell_update_recheck.steps.ts:55`, `mainPageE2eHelpers.ts:10`, `englishTexts.ts:18`, `main_page_recovery_e2e.steps.ts:82-88`; no story or other file outside `src/` uses it except `docs/glossary/app-shell.md:11`.
- ✅ The test names task 5.1 replaces exist: `usePwaUpdateStatus.test.ts:103-154`, `useUpdateRecheckOnReturn.test.tsx:97-112`, `usePwaUpdateStatus.recheck.test.ts:64`.
- ✅ `failUpdateChecksOnNextLoad` exists — `src/test/features/main_page/steps/main_page_e2e.fixtures.ts:75`.
- ✅ `main_page_unit.feature` has "Header keeps its position" with "the update check has failed and storage is unavailable", "Update cannot be fetched", "Offline without a pending check", "Connection restored" (lines 19-43); `main_page_e2e.feature` "Header keeps its position" holds the two update-check lines; `app_shell_update_recheck.feature:25-29` holds "A check on return fails offline".
- ✅ Nothing in the app knows its build time: `vite.config.ts` has no `define`; `vitest.config.ts` is a separate config not loading `vite.config.ts`; Stryker runs `vitest.config.ts` (`stryker.config.mjs:3-6`).
- ✅ The E2E web server runs `pnpm build` (`playwright.bdd.config.ts:100`), and CI uploads the Pages artifact (and the preview build) from that `dist` after E2E (`.github/workflows/ci.yml:62-87`).
- ✅ Scripts may import `../../src/lib/temporal.ts` at config time: `scripts/zoneData/extractZoneAbbreviations.ts:6` does; `src/lib/temporal.ts` imports only `temporal-polyfill`; tests already import `../../../scripts/...` (`src/test/legacyBoot/addMainChunkPreloads.test.ts:4`); `tsconfig.node.json` includes `scripts` and `app.config.ts`; `tsconfig.test.json` includes `src/vite-env.d.ts`.
- ✅ Dates are formatted through `getDateTimeFormatter` with `DateTimeLabelKind` `LOCAL_TIME`, `LOCAL_DATE`, `HOUR`, `DAY_AND_MONTH`; the date kinds are hourless; none has a year — `src/presenter/dateTimeFormatters.ts:13-34`; `formatLocalTime` exists — `src/presenter/localDateTime.ts:16`.
- ✅ `startWorkCount` exists — `src/test/workCounters.ts:33`.
- ✅ `useZoneLabelExample` reads the `LocationsContext` store with a missing-provider error — `src/controller/useZoneLabelExample.ts:9-20`; the state has `deviceTimeZoneId` (`src/model/locations.ts:53`); `useHourFormat` and `useActiveInterfaceLanguage` exist.
- ✅ Settings page icons use `text-accent` — `SettingsPage.tsx:74`, `SettingsOptionGroup.tsx:61,64`; `InterfaceLanguageGroup` is the last child of `<main>` (`SettingsPage.tsx:129-133`), so "directly after the language group" is also "last element of `<main>`".
- ✅ The settings and language screenshots both go through the step "the locations screen matches the approved screenshot" — `locations_layout_e2e.steps.ts:62-70`, used by `settings_e2e.feature:93` and `settings_language_e2e.feature:125`; Playwright `^1.61.1` supports the `style` option of `toHaveScreenshot`.
- ✅ The E2E group name patterns task 2.4 changes exist — `settingsE2eHelpers.ts:91-92`, `settings_e2e.steps.ts:216`.
- ✅ The stable requirements restated as MODIFIED/REMOVED exist under these names: `settings` "Zone label" (`openspec/specs/settings/spec.md:545`), "Accessible zone label" (586), "Settings strings are localized" (230), "Settings page layout" (287); `app-shell` "New version notice" (65) and "Update check failure note" (179); `main-page` "Main page regions" (8) and "Update check failed note" (115). No part is already implemented, and no archived change did it.
- ✅ Glossary and architecture texts tasks 1.1 rewrites exist: `docs/glossary/settings.md:10`, `docs/glossary/time.md:21`, `docs/glossary/app-shell.md:9,11,14`, `docs/architecture/views.md:132`; no glossary term for a deploy time exists yet.
- ❌ The proposal lists only `settings`, `app-shell` and `main-page` under "Modified Capabilities" (`proposal.md:36-40`). A fourth stable spec also names the note that the change removes: `openspec/specs/date-selection/spec.md:232`, requirement "Date bar on every page state", says "The notices (offline-ready, update, update-check-failed, storage warning) MUST stay visible above the bar and MUST NOT cover it." The change has no `specs/date-selection/` delta. Apart from that line, the only stable requirements that name the note are the ones the change already modifies or removes (`grep -rniE "update.check.failed|failure note|could not be fetched" openspec/specs`). See R1.
- ✅ The only other active change, `add-pr-preview-deploy`, has only `specs/app-delivery`.

## Coverage

| Requirement id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ settings "Zone label", "Accessible zone label", "Settings strings are localized" | ✅ 2.1, 2.2, 2.4 |
| FR2 | ✅ | ✅ settings "Zone label", "Settings strings are localized" | ✅ 2.1, 2.2, 2.4 |
| FR3 | ✅ | ✅ settings "Zone label" | ✅ 2.1–2.4 |
| FR4 | ✅ | ✅ settings "Zone label" ("The example follows the toggles") | ✅ 2.1–2.3 |
| FR5 | ✅ | ✅ settings "Deploy time" | ✅ 4.1–4.5 |
| FR6 | ✅ | ✅ settings "Deploy time" ("The deploy time is fixed into the build") | ✅ 3.1, 3.2, 4.5 |
| FR7 | ✅ | ✅ app-shell "New version notice", main-page "Offline without notes" | ✅ 5.1–5.4 |
| FR8 | ✅ | ✅ app-shell / main-page REMOVED, main-page "Offline without notes" | ✅ 5.2, 5.4 |
| NFR-A1 | ✅ | ✅ settings "Deploy time" ("The deploy time in the icon colour") | ✅ 4.3, 4.6 |
| NFR-A2 | ✅ | ✅ settings "Accessible zone label" ("Tab order follows the zone line") | ✅ 2.4 |
| NFR-R1 | ✅ | ✅ settings "Deploy time" text and stable "Zone label layout"; no deploy-time layout scenario (R3) | ✅ 4.6, 6.3 |
| NFR-R2 | ✅ | ✅ settings "Settings page layout" | ✅ 6.1 |
| UX1 | ✅ | ✅ settings "Zone label" | ✅ 2.3 |
| UX2 | ✅ | ✅ settings "Deploy time" | ✅ 4.3 |
| UX3 | ✅ | ✅ main-page "Offline without notes" | ✅ 5.3, 5.4 |
| M1 | ✅ | n/a | ✅ 2.3 |
| M2 | ✅ | n/a | ✅ 2.4 |
| M3 | ✅ | n/a | ✅ 4.1, 4.5 |
| M4 | ✅ | n/a | ✅ 4.6 |
| M5 | ✅ | n/a | ✅ 5.4 |
| G1 | ✅ | n/a — met by FR1–FR4 | n/a — met by FR1–FR4, M1, M2 |
| G2 | ✅ | n/a — met by FR5, FR6 | n/a — met by FR5, FR6, M3, M4 |
| G3 | ✅ | n/a — met by FR7 | n/a — met by FR7, M5 |
| NG1 | ✅ | n/a | n/a — no artifact adds a version number |
| NG2 | ✅ | n/a | n/a — the enum, `zoneLabelParts`, the stored order and `settings.zoneLabelLabel` stay (design D5) |
| NG3 | ✅ | n/a | n/a — `presentZoneLine` keeps the same output order; update, offline-ready notices and storage warning unchanged |
| NG4 | ✅ | n/a | n/a — the check and recheck rules stay; only the failure handler becomes a no-op (D6) |

The proposal defines no `Q` ids ("Open Questions: None.").

## Consistency

- The change removes the note: it REMOVES `app-shell` "Update check failure note" (`specs/app-shell/spec.md:54`) and `main-page` "Update check failed note" (`specs/main-page/spec.md:39`), and its MODIFIED `main-page` "Main page regions" no longer names it (`specs/main-page/spec.md:20`). The stable `openspec/specs/date-selection/spec.md:232` ("Date bar on every page state") still lists "update-check-failed" among the notices that must stay above the date bar, and the change does not touch it. After archive, the stable specs contradict each other (R1).

## Findings

### R1 — WARNING — The date-selection spec still names the removed update-check-failed note
- Location: `openspec/specs/date-selection/spec.md:232`; `openspec/changes/polish-settings-and-remove-offline-update-notice/proposal.md:36-40`
- Rule: `.claude/rules/delta-specs.md`
- Problem: The stable requirement "Date bar on every page state" in `date-selection` says "The notices (offline-ready, update, update-check-failed, storage warning) MUST stay visible above the bar and MUST NOT cover it." The change removes that note everywhere else: it REMOVES `app-shell` "Update check failure note" and `main-page` "Update check failed note", and its MODIFIED `main-page` "Main page regions" leaves the note out. It has no `specs/date-selection/spec.md` delta, and the proposal's "Modified Capabilities" lists only `settings`, `app-shell` and `main-page`.
- Impact: Once the change is archived, `date-selection` still requires an "update-check-failed" notice that `app-shell` and `main-page` say no longer exists. The stable specs then contradict each other. A later change that reads `date-selection` may treat the note as required and build it again.
- Fix: Add `openspec/changes/polish-settings-and-remove-offline-update-notice/specs/date-selection/spec.md` with `## MODIFIED Requirements` → `### Requirement: Date bar on every page state`. Restate the full stable requirement (`openspec/specs/date-selection/spec.md:231-250`), with its scenarios "Bar in each state" and "Notice above the bar" unchanged. Change only the list to "The notices (offline-ready, update, storage warning)", and append `FR7 of polish-settings-and-remove-offline-update-notice` to its `implements` comment. In `proposal.md` "Modified Capabilities", add "- `date-selection`: the notices above the date bar no longer include the update check failure note."
- Fix risk: Low. No task or test change is needed. Neither scenario of the requirement names the note, and no date-selection test uses it: `grep -rl "failUpdateChecks\|updateCheckFailed" packages/client/src/test` finds only main-page and app-shell files. The delta must copy the rest of the requirement word for word. Otherwise, archiving the change would silently alter other rules.
- Status: fixed
- Resolution: added specs/date-selection/spec.md, which MODIFIES "Date bar on every page state". It copies the stable requirement and its scenarios "Bar in each state" and "Notice above the bar" word for word, except that the notices list reads "(offline-ready, update, storage warning)" and the implements comment adds FR7 of this change. proposal.md now lists `date-selection` under Modified Capabilities and in What Changes, and its opening line names it too.

### R2 — SUGGESTION — The E2E "Update cannot be fetched" can pass before the update check has failed
- Location: `openspec/changes/polish-settings-and-remove-offline-update-notice/tasks.md:41`
- Rule: `.claude/rules/test-planning.md`
- Problem: Task 5.4 asks the new E2E scenario to make the check fail with `failUpdateChecksOnNextLoad`, reload offline, and then assert that the notices region has no text. `rejectServiceWorkerUpdates` (`packages/client/src/test/features/main_page/steps/main_page_e2e.fixtures.ts:7-12`) only replaces `ServiceWorkerRegistration.prototype.update` and leaves no trace that it ran. So the step cannot wait for the failed check, and an "is empty" assertion made right after the reload holds whether or not the check has run yet.
- Impact: The scenario that measures M5 ("0 notes after a failed update check offline") would also pass with the old code if it asserts before the rejection is handled. The E2E run would then show no regression in the real browser. FR7 stays covered by the jsdom tests of tasks 5.1/5.3, which control the rejected promise.
- Fix: In task 5.4, add: "`rejectServiceWorkerUpdates` counts its calls on `window` (e.g. `window.__rejectedUpdateChecks`); the step waits with `expect.poll` until the count is at least 1, and only then asserts that the notices region has no text."
- Fix risk: Low. The helper is shared with `main_page_recovery_e2e.steps.ts`, and adding a counter does not change how the update rejects there. It is test code only.
- Status: fixed
- Resolution: task 5.4 now has `rejectServiceWorkerUpdates` in steps/main_page_e2e.fixtures.ts count its calls on `window` under a named key, with the rejection itself unchanged. The step waits with `expect.poll` until the count is at least 1, and only then asserts that the notices region has no text.

### R3 — SUGGESTION — The deploy time layout rule has no spec scenario, but task 4.6 builds two
- Location: `openspec/changes/polish-settings-and-remove-offline-update-notice/specs/settings/spec.md:4`
- Rule: `.claude/rules/delta-specs.md`
- Problem: The "Deploy time" requirement says the line "MUST fit one line from 375 px; at 320 px it MAY wrap … but MUST NOT make the page scroll horizontally" (NFR-R1). None of its four scenarios (lines 6-38) covers this. Task 4.6 still adds the E2E outlines "The deploy time fits one line at <width> px" (375, 1024) and "The deploy time at 320 px", so the feature file gets scenarios that the spec does not have.
- Impact: After archive, the stable `settings` spec has no scenario for the deploy time layout, and the two E2E outlines can be traced only to the requirement text. A later change that edits the requirement has no scenario to keep in step with those outlines.
- Fix: Add to the "Deploy time" requirement in the delta spec the outline "The deploy time fits the screen": WHEN the settings page is `<width>` px wide in `<language>`, THEN the deploy time takes one line (375 and 1024 px, English and Russian), plus the scenario "The deploy time at 320 px": THEN the settings page does not scroll horizontally. Use the same names in task 4.6.
- Fix risk: none. This only edits the spec; task 4.6 already plans these tests in E2E, where layout checks belong (`bdd-e2e.md`).
- Status: fixed
- Resolution: the "Deploy time" requirement in specs/settings/spec.md gains the outline "The deploy time fits one line" (375 and 1024 px, English 12-hour and Russian) and the scenario "The deploy time at 320 px" (no horizontal scrolling). Task 4.6 uses these two names.

### R4 — SUGGESTION — The order check sits in a scenario the spec does not have
- Location: `openspec/changes/polish-settings-and-remove-offline-update-notice/tasks.md:19`
- Rule: `.claude/rules/gherkin.md`
- Problem: The delta spec puts the order into "Both parts by default": "THEN the "Abbreviation" and "UTC offset" toggles are both on, in this order" (`specs/settings/spec.md:49`). Task 2.3 only re-tags that scenario and swaps its example. It checks the order in a new unit scenario, "The toggles follow the zone line", which appears in no delta spec.
- Impact: The unit feature's "Both parts by default" step keeps checking "both on" without the order, so it no longer says what the spec scenario says. The feature also gains a scenario that the archived spec lacks.
- Fix: In task 2.3, change the Then step of "Both parts by default" to "the "Abbreviation" and "UTC offset" toggles are both on, in this order" (the step checks DOM order) and tag it `@FR3 @UX1` as well. Drop the extra scenario "The toggles follow the zone line".
- Fix risk: Low. Changing the step text means updating the matching step in `steps/settings_zone_label_unit.steps.tsx`. Any other scenario that uses the old step text must keep a step that matches it.
- Status: fixed
- Resolution: in task 2.3, the Then of "Both parts by default" becomes the spec step `the "Abbreviation" and "UTC offset" toggles are both on, in this order`, which checks the pressed state and the DOM order. The scenario gains `@FR3 @UX1`. The extra scenario "The toggles follow the zone line" is dropped. "Existing users get both parts" keeps the old step text, so that step stays. The task header now names UX1.

### R5 — SUGGESTION — The enum comment "declaration order is display order" becomes false
- Location: `openspec/changes/polish-settings-and-remove-offline-update-notice/design.md:48`
- Rule: `.claude/rules/glossary.md`
- Problem: D5 keeps the enum order `UTC_OFFSET`, `ZONE_ABBREVIATION` and moves the display order to `ZONE_LABEL_PART_ORDER`. The JSDoc on the enum, `packages/client/src/preferences/preferences.ts:20`, still says "A part of the zone line the zone label can show; declaration order is display order." No task updates it.
- Impact: Once the change ships, the comment states the opposite of the code. The next developer who trusts it may reorder the enum to change the display. That would change the stored `zoneLabelParts` order, which NG2 explicitly excludes.
- Fix: In task 2.2, add: "update the JSDoc of `ZoneLabelPart` in `src/preferences/preferences.ts` to "declaration order is the stored order; the display order is `ZONE_LABEL_PART_ORDER`"".
- Fix risk: none. It edits a comment only.
- Status: fixed
- Resolution: task 2.2 now rewrites the JSDoc of `ZoneLabelPart` in src/preferences/preferences.ts to "declaration order is the stored order; the display order is `ZONE_LABEL_PART_ORDER`", and design.md D5 says the same.

## Verdict

Needs revision. Blocking: R1 (WARNING). Without a `date-selection` delta, the stable specs contradict each other after archive. R2–R5 are SUGGESTIONs that the fix-specs stage can fold in.
