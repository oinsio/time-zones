# Specs review: add-meeting-share-dialog

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 47/48 |
| Contradictions | 1 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 2 |

## Freshness

- ✅ `useMeetingShare(textSharing = browserTextSharing)` collects `row.cityLabel`, `rowRange.spanLabel`, `dateBar.fullDateLabel` and returns `{ shareMeeting, notice, dismissNotice }` (design.md:7, D6) — `packages/client/src/controller/useMeetingShare.ts:31-66`.
- ✅ `presentMeetingShareText` with `MeetingShareRow` and the label-based input, joined by `meeting.shareHeading` / `shareLine` / `shareLineShifted` (design.md:7, D2) — `presenter/meetingShareText.ts:4-48`; `useMeetingShare` is its only production caller.
- ✅ Russian heading is `Встреча {{date}}, {{duration}}` (proposal.md:10) — `locales/ru.json:130`.
- ✅ `formatUtcOffset` lives in `presenter/utcOffset.ts` and is exported through `presenter/index.ts` (design.md:20) — `presenter/index.ts:90`.
- ✅ `presentZoneLine`, `ZoneLinePart`, `ZoneLinePartKind.PLACE` and the rule "the zone abbreviation yields to a UTC offset that reads the same" (D2) — `presenter/zoneLine.ts`.
- ✅ `ZONE_LINE_SEPARATOR` is `·` in `constants/locations.ts` and `views/shared/ZoneLine.tsx` puts it between parts (D2) — `constants/locations.ts:35`, `views/shared/ZoneLine.tsx:81`.
- ✅ `getZoneAbbreviation`, `formatZoneAbbreviation`, `getLocationMeetingRange`, `presentLocationMeetingRange`, `getDayShift`, `presentMeetingBar`, `formatMeetingDuration`, `getMeetingSpan` exist (design.md:19-24) — `model/zoneAbbreviation.ts`, `presenter/zoneAbbreviation.ts`, `model/locationMeetingRange.ts`, `presenter/locationMeetingRange.ts`, `model/dayShift.ts`, `presenter/meetingBar.ts`, `model/meetingRange.ts`.
- ✅ `PREFERENCES_SCHEMA_VERSION` is 7 (design.md:25, D4) — `constants/preferences.ts:11`; `createPreferencesMigrations` has steps `1:`–`6:`, so `7:` is the next one — `adapters/preferencesDocument.ts:29-57`.
- ✅ `parseStoredPreferences` checks `interfaceLanguage` with a null-or-non-empty-string test and does not consult the registry (D4) — `preferences/parseStoredPreferences.ts:59`.
- ✅ `ZoneLabelPart` (with `COUNTRY`) is the enum of `preferences/preferences.ts` (D4).
- ✅ `findRegisteredLocale`, `localeRegistry` (`locales/localeRegistry.ts:11-26`) and `resolveCityNameLanguage` (`locales/languageFallbacks.ts:44`) exist (design.md:22-23); the registry holds only `ru.json` and `en.json` today (NG7).
- ✅ `useCityLabels(locations, load)` calls `CitySearch.getCityLabel(timeZoneId, storedLabel, cityNameLanguage)` with `useActiveInterfaceLanguage().cityNameLanguage` (D6) — `controller/useCityLabels.ts:19-50`.
- ✅ `useCitySearch` uses `i18n.getFixedT` for English (D6) — `controller/useCitySearch.ts:95`.
- ✅ `startWorkCount` is exported from `src/test/workCounters.ts` and used by the meeting budget steps (design.md:26, D8) — `test/workCounters.ts:33`, `test/features/grid_view/steps/grid_view_meeting_budget.steps.ts`.
- ✅ `locales.test.ts` has "should have identical key sets in every locale file" and `en.json` repeats `durationHours_few` / `_many` (D3) — `locales/locales.test.ts:64`, `locales/en.json:65-66`.
- ✅ `InterfaceLanguageList` (no test file of its own) and `SettingsToggleGroup` + `SettingsToggleGroup.test.tsx` are in `app/settings/`; `settings_zone_label_unit.steps.tsx` imports `SettingsToggleGroup` from `@/app/settings`; no other file imports either (D7, task 7.1) — `test/features/settings/steps/settings_zone_label_unit.steps.tsx:9`.
- ✅ No file under `views/` imports from `@/app` (D7) — grep `from "@/app"` in `src/views` is empty.
- ✅ `LazyCalendarMonthGrid.tsx` is `lazy` + `Suspense fallback={null}` and `AppShell.noticesChunk.test.tsx` `vi.mock`s `./AppShellNotices` (D7, D8, task 7.6) — `views/shared/LazyCalendarMonthGrid.tsx:1-17`, `app/AppShell.noticesChunk.test.tsx:11`.
- ✅ `AppShell.tsx` has 194 lines and `AppShell.meeting.test.tsx` injects `createInMemoryTextSharing({ canShare: false, canCopy: true })` through the `textSharing` prop (D5, D7, task 7.5) — `app/AppShell.meeting.test.tsx:28-32`.
- ✅ `DialogContent` fills the screen below `sm` and is centred with `sm:max-w-lg` (512 px) from 640 px (NFR-R1, UX1) — `components/ui/dialog.tsx:28`.
- ✅ The suites task 6.3 lists are exactly what `grep -rln "shareMeeting\|Share meeting" src` finds besides production files: `AppShell.meeting.test.tsx`, `useMeetingShare.test.tsx`, `meeting_range_share.*`, `grid_view_meeting_share_unit.*`, `grid_view_meeting_share_e2e.*`, `grid_view_meeting_contract_e2e.feature`, `grid_view_meeting_lock_e2e.*` (focus only), `MeetingBar.test.tsx` (prop only).
- ✅ `MIN_TOUCH_TARGET_PX = 44` is checked in `time_selection_wall_time_input_e2e.steps.ts` (task 8.1) — line 27.
- ✅ `README.md` and `README.ru.md` already link `openspec/specs/meeting-share-dialog/spec.md` in the "Grid view and meeting ranges" group (task 1.3) — `README.md:33`, `README.ru.md:33`.
- ✅ The `bench`, `check:bundle-size`, `typecheck` and `lint` scripts exist with the flags tasks 4.5 and 9.2 use — `packages/client/package.json:11,24,29,31`.
- ✅ MODIFIED `meeting-range` → "Share meeting text" and `grid-view` → "Share meeting from the meeting bar" exist in `openspec/specs/` as restated, and `meeting-range` → "Share meeting outcome" is unchanged — `openspec/specs/meeting-range/spec.md:176,198`, `openspec/specs/grid-view/spec.md:544`; `openspec/specs/meeting-share-dialog/` does not exist yet (ADDED capability).
- ✅ Nothing is implemented yet: no `MeetingInvitation`, `ShareDestination`, `shareLanguage` or `MeetingShareDialog` in `src`, and no archived change builds it; the sibling active change `move-meeting-range-and-extend-past-midnight` touches none of these requirements (its NG8: "The meeting share text does not change").

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ grid-view "Share meeting opens the share dialog"; dialog "opens and closes" | ✅ 6.3, 7.5, 7.7 |
| FR2 | ✅ | ✅ "Locations in the share dialog" | ✅ 6.2, 7.3, 7.7 |
| FR3 | ✅ | ✅ meeting-range "Only included locations get a line"; "No location ticked" | ✅ 3.1, 4.3, 6.4, 8.1 |
| FR4 | ✅ | ✅ "Share language choice"; meeting-range "share language differs" | ✅ 4.3, 6.1, 7.7 |
| FR5 | ✅ | ✅ "Share language pin"; settings requirement | ✅ 2.1–2.5, 7.7 |
| FR6 | ✅ | ✅ "Share zone label toggles"; meeting-range zone parts | ✅ 2.1–2.3, 4.3, 7.7 |
| FR7 | ✅ | ✅ "Russian heading by weekday" | ✅ 4.1–4.3, 6.4 |
| FR8 | ✅ | ✅ "Preview of the meeting share text" | ✅ 6.2, 7.7 |
| FR9 | ✅ | ✅ "Share from the share dialog"; grid-view scenarios | ✅ 6.2, 7.5, 7.7 |
| FR10 | ✅ | ✅ "Share dialog follows the model" | ✅ 3.1, 6.2, 7.7 |
| FR11 | ✅ | ✅ "Share from the share dialog" | ✅ 5.1–5.3, 7.4 |
| FR12 | ✅ | ✅ "Share dialog strings are localized" | ✅ 7.2, 7.7 |
| NFR-P1 | ✅ | ✅ "Share dialog is fast" (two work-bound scenarios) | ✅ 4.5, 7.7 |
| NFR-P2 | ✅ | ✅ "Share dialog is fast" (requirement text) | ✅ 7.6, 9.2 |
| NFR-A1 | ✅ | ✅ "Accessible share dialog" focus scenarios | ✅ 8.1 |
| NFR-A2 | ✅ | ✅ "Controls announce their names and states", axe-core | ✅ 8.1 |
| NFR-A3 | ✅ | ✅ "Controls announce …" (preview not live) | ✅ 8.1 |
| NFR-R1 | ✅ | ✅ "Narrow phone", "Wide screen" | ✅ 8.1, 8.2 |
| NFR-R2 | ✅ | ✅ "A long list keeps Share in view" | ✅ 8.1 |
| UX1 | ✅ | ✅ "Share dialog layout", screenshots | ✅ 7.1, 8.2 |
| UX2 | ✅ | ✅ "Share dialog layout", screenshots | ✅ 7.3, 8.2 |
| UX3 | ✅ | ✅ "Share dialog layout", screenshots | ✅ 7.3, 8.2 |
| UX4 | ✅ | ✅ "Share dialog layout", screenshots | ✅ 7.3, 8.2 |
| UX5 | ✅ | ❌ tagged on "Share dialog layout" but no sentence or scenario states it (R6) | ✅ 9.3 traceability grep |
| M1 | ✅ | n/a | ✅ 4.3, 6.4 |
| M2 | ✅ | n/a | ✅ 4.3 cites M2 |
| M3 | ✅ | n/a | ✅ 2.5, 7.7 |
| M4 | ✅ | n/a | ✅ 4.3, 6.4 |
| M5 | ✅ | n/a | ✅ 8.1 |
| M6 | ✅ | n/a | ✅ 9.1 (misses `model/weekday.ts`, R4) |
| M7 | ✅ | n/a | ✅ 7.5 (Share meeting, then Share copies) |
| M8 | ✅ | n/a | ✅ 9.2 |
| G1 | ✅ | n/a met by FR2, FR3 | n/a |
| G2 | ✅ | n/a met by FR4, FR5, M3 | n/a |
| G3 | ✅ | n/a met by FR6 | n/a |
| G4 | ✅ | n/a met by FR7, M4 | n/a |
| G5 | ✅ | n/a met by FR8 | n/a |
| G6 | ✅ | n/a met by FR11 (D5 registry, tasks 5.1–5.3) | n/a |
| NG1 | ✅ | n/a nothing builds another destination | n/a |
| NG2 | ✅ | n/a no Copy button planned | n/a |
| NG3 | ✅ | n/a excluded ids reset on opening (D6) | n/a |
| NG4 | ✅ | n/a hour format follows the setting | n/a |
| NG5 | ✅ | n/a no country part in share zone label | n/a |
| NG6 | ✅ | n/a dialog dispatches only share preferences | n/a |
| NG7 | ✅ | n/a list comes from the locale registry | n/a |
| NG8 | ✅ | n/a Cards untouched | n/a |
| Q1 | ✅ | n/a answered in proposal FR9 and design Consequences | n/a |
| Q2 | ✅ | n/a answered in design D5 (no ADR now) | n/a |

## Consistency

- The unreadable pinned share language differs: `specs/settings/spec.md:4` makes a document unreadable when "its pinned share language is not a string or none" (so `""` is readable), while `design.md:86` makes `parseStoredPreferences` reject "a `shareLanguage` that is neither `null` nor a non-empty string" (so `""` is unreadable).

## Findings

### R1 — WARNING — The device time location has no city label in the share language
- Location: `openspec/changes/add-meeting-share-dialog/design.md:113`
- Rule: `.claude/rules/glossary.md` (one owner per concept)
- Problem: FR4 (`proposal.md:75`) and the meeting-range delta (`specs/meeting-range/spec.md:6`) require every city label of the text in the share language. D2 takes `getCityLabel(location)` and D6 says it comes from `useCityLabels(..., cityNameLanguage)`. But `useCityLabels` only labels `LocationKind.CITY` locations (`controller/useCityLabels.ts:7-8,40`). The device time location gets its label from `useExemplarCity(timeZoneId, load)`, which always uses the interface language (`controller/useExemplarCity.ts:15-19`, `controller/useLocations.ts:65`, `presenter/presentLocationRows.ts:70-71`). No decision or task says where the device time location's label comes from in the share language.
- Impact: the device time location is in the first-launch list (ADR-0010), so most users have it. Built as written, its line either falls back to `location.label` / the zone id, or keeps the interface language. A Russian user who shares in English gets a Cyrillic city in an English text, and the scenario "no line contains a Cyrillic letter" does not catch it because its sample list has no device time location.
- Fix: in D6 add that `useExemplarCity` gets the same optional `CityNameLanguage` argument as `useCityLabels` (default: the interface one), and that the `getCityLabel` callback uses it for the `DEVICE_TIME` location. Extend task 6.1 to both hooks (`useExemplarCity.test.tsx` included), and add a case to 4.3 and 6.2: with a device time location in the list, its line uses the share language's exemplar city.
- Fix risk: low. `useLocations.ts:65` is the only other caller of `useExemplarCity` and keeps the default argument. The second call needs the loaded city data and falls back to the stored label while it loads, as D6's Consequences already accept for city labels.
- Status: fixed
- Resolution: added to D6 (design.md) that useExemplarCity gains the optional CityNameLanguage argument and the session's getCityLabel uses it for the DEVICE_TIME location; spec meeting-share-dialog "Share language choice" now states it, with the scenario "The device time location in another share language"; tasks 6.1 (useExemplarCity.test.tsx), 4.3, 6.2 and 7.7 cover it.

### R2 — WARNING — The reference line names a "reference location" that has no owner and no rule without a home
- Location: `openspec/changes/add-meeting-share-dialog/specs/meeting-share-dialog/spec.md:10`
- Rule: `.claude/rules/glossary.md`; ADR-0007 (reference zone = home ?? device zone)
- Problem: the dialog shows under its title "the full date of the start in the reference zone with the name of the reference location" (`«{date} · по времени {city}»`, spec line 191, key `meeting.shareDialogReference` in task 7.2). ADR-0007 makes home optional: with no home the reference zone is the device zone and no location is "the reference location". The glossary has **Reference zone** (`docs/glossary/time.md:15`) but no reference location. D6 lists every output of the session and D7 lists every row text, but neither says who builds this line, or which city it names when no home is set. The only scenario uses the sample, where Almaty is home.
- Impact: the implementer has to invent the no-home case: the device time exemplar city, the first location, the zone id, or no city. They also have to choose a layer, and the dialog may end up formatting text itself, which D7 forbids ("the dialog formats nothing itself"). The unit BDD only proves the home case.
- Fix: in the spec requirement "Share dialog opens and closes", state that `{city}` is the home location's city label or, with no home, the exemplar city of the device time zone (the label the device time location shows), and add a scenario with no home. In D6 add "the reference line" to the session's outputs, built in the presenter from `dateBar.fullDateLabel` and `meeting.shareDialogReference`. Add that case to task 6.2.
- Fix risk: the device exemplar city needs the city data and shows the zone id until it loads, as `presentLocationRows.ts:71` already does. The new scenario must use the interface language, not the share language, as the other dialog captions do.
- Status: fixed
- Resolution: spec "Share dialog opens and closes" now defines the reference line city (home city label, otherwise the exemplar city of the device time zone, in the interface language) with the scenario "The reference line without a home location"; D6 adds the reference line to the session outputs, owned by presentMeetingShareReference (presenter/meetingShareReference.ts); new task 4.6 and cases in 6.2, 7.7 and Stryker run 3. No new glossary term: it is the home city label or the exemplar city.

### R3 — WARNING — D7 reuses only the language list, not the language button and its keyboard handling
- Location: `openspec/changes/add-meeting-share-dialog/design.md:120`
- Rule: `.claude/rules/antipatterns.md` ("Creating new UI components instead of reusing existing ones"); `.claude/rules/glossary.md`
- Problem: UX1 (`proposal.md:105`) and the spec (`specs/meeting-share-dialog/spec.md:52`: "a button with the flag and the native name … as the language group of the settings page shows the interface language. Activating it opens the list") reuse the settings language control. D7 and task 7.1 move only `InterfaceLanguageList`, the expanded list (78 lines). The button with the flag and the native name, the expand/collapse state, the arrow-key focus moves, Escape collapsing the list, the search threshold and the caption group all live in `InterfaceLanguageGroup` (`app/settings/InterfaceLanguageGroup.tsx:31-124`), which stays in `app/settings/`. D7 itself notes that no view imports from `app/`.
- Impact: as written, `MeetingShareDialog` has to rebuild the button, `aria-expanded` / `aria-controls`, the arrow-key navigation and the Escape handling: a second copy of the settings language control that can drift from it. The Escape case also matters in the modal: `InterfaceLanguageGroup` stops Escape only when the list is expanded, so a copy that drops this closes the whole dialog on the Esc that should only collapse the list.
- Fix: in D7 and task 7.1, move the whole group: the button, the list and the keyboard handling become `LanguageGroup` in `views/shared/` (caption text, button label, `activeCode`, `onChoose` as props). `InterfaceLanguageGroup` becomes a thin settings wrapper that passes `settings.languageLabel` / `settings.languageButton`, and the dialog passes `meeting.shareDialogLanguage`. Keep `InterfaceLanguageList` as the group's internal list. Task 7.1's verify command stays as it is (the `InterfaceLanguageGroup*.test.tsx` suites must pass unchanged). Add to 8.1 that Esc with the list open collapses the list and keeps the dialog open.
- Fix risk: moderate. The settings suites and `settings_language_unit.steps.tsx` must stay green after the move. The dialog's button needs an accessible name of its own (a new two-level `meeting.*` key, so 7.2's count of 9 `"shareDialog` keys goes up by one).
- Status: fixed
- Resolution: D7 and task 7.1 now move the whole InterfaceLanguageGroup body to views/shared/LanguageGroup.tsx (caption, button label, activeCode, onChoose, besideButton slot for the pin) with LanguageList as its internal list; InterfaceLanguageGroup stays a thin settings wrapper; new key meeting.shareDialogLanguageButton (7.2 count 10); spec adds the button name, Esc-collapses-list rule and the scenario "Esc in the open language list", run in task 8.1; glossary task 1.1 names LanguageGroup.

### R4 — WARNING — The new model file `weekday.ts` is in no scoped Stryker run
- Location: `openspec/changes/add-meeting-share-dialog/tasks.md:72`
- Rule: `.claude/rules/tdd-workflow.md` (Step 5 — mutate the changed files); M6 (`proposal.md:151`)
- Problem: task 4.1 adds the `Weekday` enum and its mapping from `Temporal.PlainDate.dayOfWeek` in `src/model/` (test `src/model/weekday.test.ts`). M6 requires ≥ 95 % (minimum 90 %) on "the new and changed model, presenter and preferences files". Task 9.1's three runs list ten files but not `src/model/weekday.ts`, and run 3 holds only two files.
- Impact: the mapping that picks the Russian heading form (FR7) is never mutation-tested. A mutant that swaps two weekdays survives unless the seven-heading test happens to kill it, and M6 is reported as met without measuring this file.
- Fix: add `src/model/weekday.ts` to run 3 of task 9.1 (three files, under the five-file limit).
- Fix risk: none.
- Status: fixed
- Resolution: added src/model/weekday.ts to run 3 of task 9.1 (now four files with presenter/meetingShareReference.ts from R2, under the five-file limit).

### R5 — SUGGESTION — Spec and design disagree on an empty pinned share language
- Location: `openspec/changes/add-meeting-share-dialog/specs/settings/spec.md:4`
- Rule: —
- Problem: the spec makes a document unreadable when "its pinned share language is not a string or none". `design.md:86` and task 2.3 reject "a `shareLanguage` that is neither `null` nor a non-empty string". So the two disagree on `""`.
- Impact: low. The implementation follows D4, which matches the existing `interfaceLanguage` check, but the archived spec would then describe a rule the parser does not apply.
- Fix: in the settings requirement write "whose pinned share language is neither a non-empty string nor none".
- Fix risk: none. It matches `isNullOrNonEmptyString` in `preferences/parseStoredPreferences.ts:59`.
- Status: fixed
- Resolution: specs/settings/spec.md now reads "neither a non-empty string nor none", matching D4 and task 2.3, and the "Unreadable share choices" table gains the row "pinned share language | an empty string".

### R6 — SUGGESTION — UX5 is claimed by a requirement that does not state it
- Location: `openspec/changes/add-meeting-share-dialog/specs/meeting-share-dialog/spec.md:172`
- Rule: `.claude/rules/traceability.md`
- Problem: the comment of "Share dialog layout" names UX5 ("No red delete crosses and no modal confirmation after a share", `proposal.md:109`), but neither its text nor any scenario says it. Task 9.3 still requires an `@UX5` tag in some test or feature file.
- Impact: the implementer tags a scenario with `@UX5` that checks nothing of it, so the criterion is traced but unverified.
- Fix: add to "Share dialog layout": "A row offers its checkbox and no remove control; a share opens no confirmation". Tag "Outcomes of a share from the dialog" (whose dialog column already proves the dialog just closes) and "The dialog matches its approved screenshots" with `@UX5`.
- Fix risk: none.
- Status: fixed
- Resolution: "Share dialog layout" now states that a row offers its checkbox and no remove control and that a share opens no confirmation dialog; "Share from the share dialog" and "Approved screenshots of the share dialog" now implement UX5, the outcomes scenario asserts no confirmation dialog is open; tasks 7.3 (row has no remove button), 7.7 (@UX5 on the outcomes scenario) and 8.2 (@UX5 on screenshots).

## Verdict

Needs revision. There are no blocking (CRITICAL) findings. Fix-specs should resolve WARNINGs R1–R4 before implementation: R1 and R2 leave the implementer to invent behaviour, R3 invites a duplicate language control, and R4 leaves a new model file without mutation testing. R5 and R6 are polish.
