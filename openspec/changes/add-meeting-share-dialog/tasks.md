# Tasks

Paths are relative to `packages/client/` unless they start with `docs/` or `openspec/`.

Run tests strictly one command at a time (`CLAUDE.md`). Traceability marks:
- every new or touched production file gets a JSDoc line `Implements <ids> of add-meeting-share-dialog (D<n>).`;
- every new or touched test file gets the comment `// Verifies <ids> of add-meeting-share-dialog.`;
- every new or changed Gherkin scenario gets the tags `@add-meeting-share-dialog @<id>`.

Sample data (the sample of `meeting-range`): current time `2026-03-08T07:30:00Z`, device time zone `Asia/Almaty`, home Almaty; locations Almaty, Moscow, Kolkata, New York; the sample meeting is 09:00–11:00 Almaty (`2026-03-08T04:00:00Z`–`06:00:00Z`).

Files stay under 200 lines where possible, 300 at most. Each task is at most two hours.

## 1. Glossary and architecture docs (FR1–FR11)

- [ ] 1.1 Glossary. In `docs/glossary/time-selection.md`: add **Share dialog** (*RU:* «Поделиться встречей»; *Code:* `MeetingShareDialog`, `useMeetingShare`), **Meeting invitation** (*Code:* `MeetingInvitation`, `getMeetingInvitation`), **Share destination** (*Code:* `ShareDestination`, `shareDestinations`, `ShareDestinationId`); change **Share meeting** ("opens the share dialog") and **Meeting share text** ("one line per included location, with its zone parts, in the share language"). In `docs/glossary/settings.md`: add **Share language** (*RU:* «Язык приглашения»; *Code:* `Preferences.shareLanguage`, `SET_SHARE_LANGUAGE`, `resolveShareLanguage`) with its pin («Запомнить язык приглашения»), **Share zone label** (*Code:* `Preferences.shareZoneLabelParts`, `TOGGLE_SHARE_ZONE_LABEL_PART`); extend **Preferences** with both. In `docs/glossary/architecture.md`: **Text sharing** gains "backs the text share destination". Verify: `grep -n "Share dialog\|Meeting invitation\|Share destination" docs/glossary/time-selection.md` prints 3 lines; `grep -n "Share language\|Share zone label" docs/glossary/settings.md` prints 2 lines; `wc -l docs/glossary/*.md` shows every file under 200.
- [ ] 1.2 Architecture docs. `docs/architecture/domain-model.md`: add the meeting invitation and the two preferences fields with their commands. `docs/architecture/views.md` → Grid: "Share meeting opens the share dialog" and a short "Share dialog" subsection (blocks, sizes from UX1–UX4). `docs/design/README.md` → Proposals: mark part 1 as "in change `add-meeting-share-dialog`". Verify: `grep -n "share dialog" -i docs/architecture/views.md docs/architecture/domain-model.md` prints at least 2 lines.

## 2. Preferences (FR5, FR6; D4)

- [ ] 2.1 RED: in `src/preferences/preferences.share.test.ts` (`it.each`) — defaults (`shareLanguage: null`, both parts); `SET_SHARE_LANGUAGE` with a code and with `null`; `TOGGLE_SHARE_ZONE_LABEL_PART` for both parts, including turning both off; toggling `COUNTRY` is ignored. Verify: `npx vitest run src/preferences/preferences.share.test.ts` fails on the new cases.
- [ ] 2.2 GREEN: add the fields and commands to `src/preferences/preferences.ts` and `preferencesCommands.ts`; constants in `src/constants/preferences.ts`. Verify: the same command passes.
- [ ] 2.3 RED then GREEN, storage: `src/preferences/parseStoredPreferences` and the repository migration — `PREFERENCES_SCHEMA_VERSION` 8; a version 7 document gets the defaults and keeps every other choice; the country or an unknown part in `shareZoneLabelParts` and a non-string `shareLanguage` are unreadable; an unregistered tag becomes `null`. Tests beside the existing migration tests of `localStoragePreferencesRepository`. Verify: `npx vitest run src/preferences src/adapters/localStoragePreferencesRepository` passes (one command).
- [ ] 2.4 RED then GREEN: `src/locales/resolveShareLanguage.ts` with `resolveShareLanguage.test.ts` — pinned and registered → pinned; `null` → interface language; unregistered → interface language. Export through `src/locales/index.ts`. Verify: `npx vitest run src/locales/resolveShareLanguage.test.ts` passes.
- [ ] 2.5 Unit BDD: `src/test/features/settings/settings_share_preferences_unit.feature` with its steps — every scenario of `settings` → "Share language and share zone label are kept on the device" (`@FR5 @FR6`). Verify: `npx vitest run src/test/features/settings/steps/settings_share_preferences_unit.steps.ts` passes.

## 3. Model: the meeting invitation (FR3, FR10; D1)

- [ ] 3.1 RED then GREEN: `src/model/meetingInvitation.ts` with `meetingInvitation.test.ts` — list order kept; excluded ids dropped; an excluded id that is not in the list is ignored; every id excluded gives no locations; no meeting range gives `undefined`. Export through `src/model/index.ts`. Verify: `npx vitest run src/model/meetingInvitation.test.ts` passes.

## 4. Presenter: the meeting share text (FR3, FR4, FR6, FR7, M1, M2, M4; D2, D3)

- [ ] 4.1 Export the UTC offset text formatter from `src/presenter/zoneLine.ts` (no copy) and add to `src/presenter/dateTimeFormatters.ts` the label kinds "date without weekday" and "weekday"; add the `Weekday` enum and its mapping from `Temporal.PlainDate.dayOfWeek` in `src/model/` or `src/constants/`. Tests for the new kinds in `dateTimeFormatters.test.ts`. Verify: `npx vitest run src/presenter/dateTimeFormatters.test.ts src/presenter/zoneLine.test.ts` passes.
- [ ] 4.2 Locale files: `meeting.shareHeading` takes `weekday`, `date`, `duration`; `ru.json` gains `shareHeading_monday` … `shareHeading_sunday`; `meeting.shareLine` / `shareLineShifted` take `zone` (the bracketed parts, may be empty). Verify: `npx vitest run src/locales/locales.test.ts` passes.
- [ ] 4.3 RED: rewrite `src/presenter/meetingShareText.test.ts` for the new input — the English and Russian sample texts character for character (M1), included locations only (M2), the four share zone label combinations, a `UTC` location, CET/CEST at the start of the meeting, the seven Russian headings (M4), 12-hour spans, a share language different from the interface language. Verify: `npx vitest run src/presenter/meetingShareText.test.ts` fails.
- [ ] 4.4 GREEN: implement D2 in `src/presenter/meetingShareText.ts` and `meetingShareLine.ts`; remove `MeetingShareRow` and the label-based input. Verify: the same command passes and `grep -rn "MeetingShareRow" src` prints nothing.
- [ ] 4.5 Unit BDD: update `src/test/features/meeting_range/meeting_range_share.feature` and `steps/meeting_range_share.steps.ts` to the modified requirement "Share meeting text" (all nine scenarios), keeping the old tags and adding `@add-meeting-share-dialog @FR3 @FR4 @FR6 @FR7`. Verify: `npx vitest run src/test/features/meeting_range/steps/meeting_range_share.steps.ts` passes.

## 5. Ports and adapters: share destinations (FR9, FR11; D5)

- [ ] 5.1 `src/ports/shareDestination.ts` (`ShareDestinationId`, `MeetingShare`, `ShareDestination`) exported through `src/ports/index.ts`; contract suite `src/adapters/shareDestination.contract.ts` — `share` returns each `ShareOutcome` of the wrapped text sharing and passes `meetingShare.text` unchanged; `isAvailable` is true. Verify: the contract file compiles (`pnpm typecheck`).
- [ ] 5.2 RED then GREEN: `src/adapters/textShareDestination.ts` and the registry `src/adapters/shareDestinations.ts`; run the contract against the in-memory and the browser text sharing in `shareDestination.test.ts`. Verify: `npx vitest run src/adapters/shareDestination.test.ts` passes.

## 6. Controller (FR1, FR8–FR10, NFR-P1; D6)

- [ ] 6.1 `useCityLabels` takes the language (default: the interface language); test that the share language gets its own labels and that the stored label is the fallback. Verify: `npx vitest run src/controller/useCityLabels.test.tsx` passes.
- [ ] 6.2 RED: rewrite `src/controller/useMeetingShare.test.tsx` — opening resets the excluded ids and resolves the language (pinned or interface); toggling a location, the language and a part rebuilds the text; pin on/off dispatches `SET_SHARE_LANGUAGE`; `share` maps outcomes (shared, copied, failed close; cancelled keeps the session); the dialog closes when the meeting range is removed; a location added while open is included. Verify: the file fails.
- [ ] 6.3 GREEN: implement D6 (split into `useMeetingShareSession.ts` if the hook passes 200 lines). Verify: `npx vitest run src/controller/useMeetingShare.test.tsx` passes.

## 7. Views: the share dialog (FR1, FR2, FR8, FR11, FR12, UX1–UX5, NFR-A1–NFR-A3, NFR-P2; D7)

- [ ] 7.1 Move `InterfaceLanguageList` to `src/views/shared/LanguageList.tsx` and, if needed, `SettingsToggleGroup` to `src/views/shared/`, with their tests; the settings keep using them. Verify: `npx vitest run src/app/settings` passes.
- [ ] 7.2 Locale files: every string of "Share dialog strings are localized" in `ru.json` and `en.json`. Verify: `npx vitest run src/locales/locales.test.ts` passes.
- [ ] 7.3 RED then GREEN: `src/views/shared/MeetingShareLocationRow.tsx`, `ShareLanguagePin.tsx`, `MeetingSharePreview.tsx` with component tests — row texts and muted state; pin `aria-pressed` and its name; preview lines, bold heading, the hint. Verify: `npx vitest run src/views/shared/MeetingShare` passes.
- [ ] 7.4 RED then GREEN: `src/views/shared/MeetingShareDialog.tsx` (lazy) on `DialogContent`; one button per available destination; inactive Share with no ticked location; the meeting bar's Share button opens the dialog. Tests: `MeetingShareDialog.test.tsx`, updated `MeetingBar` tests. Verify: `npx vitest run src/views/shared/MeetingShareDialog.test.tsx src/views/shared/MeetingBar.test.tsx` passes.
- [ ] 7.5 Unit BDD: `src/test/features/meeting_share_dialog/meeting_share_dialog_unit.feature` with steps — the scenarios of `meeting-share-dialog` that need no real browser (opens and closes, rows, language, pin, toggles, preview, outcomes, follows the model, English interface, work bounds), and the changed scenarios of `grid-view` → "Share meeting from the meeting bar" in `src/test/features/grid_view/grid_view_meeting_share_unit.feature`. Verify: `npx vitest run src/test/features/meeting_share_dialog/steps/meeting_share_dialog_unit.steps.ts` passes.

## 8. E2E in a real browser (NFR-A1–NFR-A3, NFR-R1, NFR-R2, UX1–UX4)

- [ ] 8.1 `src/test/features/meeting_share_dialog/meeting_share_dialog_e2e.feature` with steps: focus enters and returns; keyboard-only share; axe-core in the three theme and width combinations (M5); 320 px without horizontal scroll and 44 px targets; 1280 px centred at 512 px; 20 locations keep Share visible. Verify: `npx playwright test -c playwright.bdd.config.ts --grep "@add-meeting-share-dialog"` passes.
- [ ] 8.2 Approved screenshots: the four states of "Approved screenshots of the share dialog", stored with the existing meeting screenshots. Verify: `npx playwright test -c playwright.bdd.config.ts --grep "Approved screenshots of the share dialog"` passes twice in a row.
- [ ] 8.3 Update `src/test/features/grid_view/grid_view_meeting_share_e2e.feature` and the share scenario of `grid_view_meeting_contract_e2e.feature`: they share through the dialog. Verify: `npx playwright test -c playwright.bdd.config.ts --grep "@view-contract"` passes.

## 9. Verification (all)

- [ ] 9.1 Scoped Stryker, at most 5 files per run, one run at a time, target ≥ 95 % (minimum 90 %, M6). From `packages/client`: run 1 — `src/model/meetingInvitation.ts`, `src/presenter/meetingShareText.ts`, `src/presenter/meetingShareLine.ts`, `src/locales/resolveShareLanguage.ts`, `src/adapters/textShareDestination.ts`; run 2 — the changed preferences files. Verify: each score in `reports/mutation/mutation-report.json` is at least 90 %.
- [ ] 9.2 `pnpm run build`, then `pnpm check:bundle-size` (M8), then `pnpm typecheck`, then `pnpm lint`, each as a separate command. Verify: all four exit 0.
- [ ] 9.3 Traceability: `grep -rn "add-meeting-share-dialog" src | wc -l` is non-zero, and every ID FR1–FR12, NFR-P1, NFR-P2, NFR-A1–NFR-A3, NFR-R1, NFR-R2, UX1–UX5 appears in at least one test or feature file (`grep -rn "@FR<n>\|FR<n> of add-meeting-share-dialog" src`).
- [ ] 9.4 Glossary review checklist of `.claude/rules/glossary.md`: no *Never:* word introduced; every new type, constant and i18n key names a glossary term. Verify: `grep -rniE "toast|snackbar|popup|datepicker|time picker" src/views/shared/MeetingShare* src/presenter/meetingShare*` prints nothing.
