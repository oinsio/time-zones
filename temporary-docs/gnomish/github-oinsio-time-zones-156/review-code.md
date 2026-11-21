# Review: add-meeting-share-dialog

## Summary

| Item | Value |
|---|---|
| Tasks verified | 36/36 |
| Requirements traced | 85/86 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 3 |

## Tasks

Paths are relative to `packages/client/src/` unless they start with `docs/`, `openspec/` or `README`.

- ✅ 1.1 Glossary: `docs/glossary/time-selection.md:32` (Share dialog, with `useMeetingShareDialog`/`useMeetingShareSession` as the session owners), Meeting invitation and Share destination entries (the task's grep prints 3 lines); Share language and Share zone label in `docs/glossary/settings.md` (2 lines); Weekday in `docs/glossary/time.md` (1 line); every glossary file is under 200 lines (largest 42).
- ✅ 1.2 `docs/architecture/views.md:12,43,48-50` (Share meeting opens the share dialog; "Share dialog" subsection with blocks and sizes); `docs/architecture/domain-model.md:50-51` (both preferences fields with their commands, `getMeetingInvitation`); `docs/design/README.md:64` marks part 1 as in this change.
- ✅ 1.3 `README.md:33` (and `README.ru.md`) extend the "Grid view and meeting ranges" sentence with the dialog and link `meeting-share-dialog`.
- ✅ 2.1 `preferences/preferences.share.test.ts:42-83` — defaults, `SET_SHARE_LANGUAGE` with a code and `null` (`it.each`), toggling both parts, country ignored.
- ✅ 2.2 `preferences/preferences.ts` (`SHARE_ZONE_LABEL_PARTS`, `shareLanguage`, `shareZoneLabelParts`, defaults) and `preferences/preferencesCommands.ts` (`SET_SHARE_LANGUAGE`, `TOGGLE_SHARE_ZONE_LABEL_PART`, `reduceShareZoneLabelPart`).
- ✅ 2.3 `constants/preferences.ts:11` (`PREFERENCES_SCHEMA_VERSION = 8`); migration step `7:` in `adapters/preferencesDocument.ts:60-64`; parser checks in `preferences/parseStoredPreferences.ts` (`isShareZoneLabelParts`, `isNullOrNonEmptyString(shareLanguage)`); tests `adapters/preferencesDocument.share.test.ts:35,54,68,75` (v7 migration, round-trip, unregistered `de` readable, unreadable cases) and `preferences/preferences.share.test.ts:95-118`.
- ✅ 2.4 `locales/resolveShareLanguage.ts` (uses `findRegisteredLocale`, returns `{ language, isPinned }`), test `locales/resolveShareLanguage.test.ts:6` (`it.each`), exported through `locales/index.ts`.
- ✅ 2.5 `test/features/settings/settings_share_preferences_unit.feature` holds all 7 scenarios of the settings delta, with `steps/settings_share_preferences_unit.steps.tsx`.
- ✅ 3.1 `model/meetingInvitation.ts:28` `getMeetingInvitation`; `model/meetingInvitation.test.ts:35-64` covers order, exclusion, unknown id, all excluded, no range; exported via `model/index.ts`.
- ✅ 4.1 `DateTimeLabelKind.WEEKDAY` / `DATE_WITHOUT_WEEKDAY` in `presenter/dateTimeFormatters.ts` with options `DATE_WITHOUT_WEEKDAY_FORMAT_OPTIONS`, `WEEKDAY_FORMAT_OPTIONS` in `constants/date.ts`; `model/weekday.ts:29` `getWeekday`; tests `presenter/dateTimeFormatters.test.ts`, `model/weekday.test.ts:7`.
- ✅ 4.2 `locales/ru.json` / `locales/en.json`: `shareHeading` with `weekday`/`date`/`duration`, the seven `shareHeading_<weekday>` keys in both files, `shareLine`/`shareLineShifted` with `{{zone}}`, plus `shareZone` " ({{parts}})".
- ✅ 4.3 `presenter/meetingShareText.test.ts` (rewritten, 233 lines): sample texts, included locations, zone label combinations, UTC, CET/CEST, seven Russian headings, 12-hour, share language, device time label, `presentMeetingShareZoneParts`.
- ✅ 4.4 `presenter/meetingShareText.ts:40-87` and `presenter/meetingShareLine.ts:31` (`presentMeetingShareZoneParts` on `presentZoneLine` + `formatUtcOffset`, filters the part equal to the city label at :57) and `:74` (`presentMeetingShareLine`); `MeetingShareRow` no longer exists in `src`.
- ✅ 4.5 `test/benchmarks/meetingShareText.bench.ts` exists (20 locations, first and again, no assertion).
- ✅ 4.6 `presenter/meetingShareReference.ts`, test `presenter/meetingShareReference.test.ts:7` (`it.each` over both languages); `meeting.shareDialogReference` in both locale files.
- ✅ 5.1 `ports/shareDestination.ts` (`ShareDestinationId`, `MeetingShare`, `ShareDestination`), exported via `ports/index.ts`; contract `adapters/shareDestination.contract.ts`.
- ✅ 5.2 `adapters/textShareDestination.ts`, `adapters/shareDestinations.ts`, exported via `adapters/index.ts`; `adapters/shareDestination.test.ts:67,90` runs the contract and checks the registry order and the injected sharing.
- ✅ 5.3 `presenter/shareDestinationLabel.ts` (Record keyed by id) with `presenter/shareDestinationLabel.test.ts:8,18`; `views/shared/shareDestinationIcons.ts` (`TEXT` → `Share2`) with `views/shared/shareDestinationIcons.test.ts:8,15`.
- ✅ 6.1 Optional `cityNameLanguage` argument in `controller/useCityLabels.ts` and `controller/useExemplarCity.ts`; tests `controller/useCityLabels.test.tsx:178,185`, `controller/useExemplarCity.test.tsx:138,145`.
- ✅ 6.2 `controller/useMeetingShare.test.tsx:27-224` and `controller/useMeetingShareSending.test.tsx:19-98` (through `useMeetingShare.harness.tsx`) cover destinations, opening, reference line, rows, pin, outcomes, closing on range removal, device time line in English. (A re-tick after an untick is not asserted — R1.)
- ✅ 6.3 Implemented, split as `controller/useMeetingShare.ts` (open flag and notice) plus `useMeetingShareDialog.ts` / `useMeetingShareSession.ts` / `useMeetingShareCommands.ts` / `useMeetingShareDialogRows.ts` / `useMeetingShareText.ts`; `shareMeeting` is gone; `app/AppShell.tsx` passes the session to `AppShellMeeting`, which wires `onShare={share.openShareDialog}` (`app/AppShellMeeting.tsx:26-28`).
- ✅ 6.4 `test/features/meeting_range/meeting_range_share.feature` holds all nine delta scenarios with the new tags; `steps/meeting_range_share.steps.ts` (299 lines) builds the text through `getMeetingInvitation`/`presentMeetingShareText` (`steps/meetingShareTextWorld.ts`).
- ✅ 7.1 `views/shared/LanguageGroup.tsx` (143 lines), `views/shared/LanguageList.tsx` (not exported), `views/shared/SettingsToggleGroup.tsx` + test moved; `app/settings/InterfaceLanguageGroup.tsx` is a 32-line wrapper; `app/settings/InterfaceLanguageList.tsx` and `app/settings/SettingsToggleGroup.tsx` no longer exist; `views/shared/index.ts` exports `LanguageGroup` and `SettingsToggleGroup`.
- ✅ 7.2 Ten `shareDialog*` keys in each of `en.json` and `ru.json` (`grep -c` prints 10 for both); no `meeting.shareDialog.` three-level key.
- ✅ 7.3 `views/shared/MeetingShareLocationRow.tsx` (checkbox named via `aria-labelledby` :34, `ZoneLine` :53, muted classes :23), `ShareLanguagePin.tsx` (`aria-pressed`), `MeetingSharePreview.tsx`; tests in `views/shared/MeetingShareParts.test.tsx`.
- ✅ 7.4 `views/shared/MeetingShareDialog.tsx` on `DialogContent`, `LanguageGroup` with the pin in `besideButton` (:109-123), one button per destination with `SHARE_DESTINATION_ICONS` (:136-150), `disabled={!hasText}` (:142); `views/shared/LazyMeetingShareDialog.tsx`; only the loader is exported; `views/shared/MeetingShareDialog.test.tsx:150,168`.
- ✅ 7.5 `app/AppShellMeeting.tsx` renders the lazy `AppShellShareDialog` while open with `shareButtonRef` (:32-43); `app/AppShell.meeting.test.tsx:95,109,121,132` (opens the dialog and copies nothing, Share closes and copies, copied notice, Escape dismisses).
- ✅ 7.6 `app/AppShell.shareDialogChunk.test.tsx:15-53` mocks `@/views/shared/MeetingShareDialog` with a hoisted `shareDialogChunkLoads` spy, checks it is not called before Share meeting and is called after.
- ✅ 7.7 `test/features/meeting_share_dialog/meeting_share_dialog_unit.feature`, `_language_unit.feature`, `_preview_unit.feature`, `_budget_unit.feature` with their steps hold every listed scenario; `test/features/grid_view/grid_view_meeting_share_unit.feature` holds the six grid-view scenarios.
- ✅ 8.1 `test/features/meeting_share_dialog/meeting_share_dialog_e2e.feature` with `steps/meeting_share_dialog_e2e.steps.ts` and `steps/meeting_share_dialog_checks_e2e.steps.ts`: every listed scenario, including the three axe combinations and the 44 px width-and-height check.
- ✅ 8.2 `test/features/meeting_share_dialog/meeting_share_dialog_screenshots_e2e.feature` (four states, tags `@UX1 @UX2 @UX3 @UX4 @UX5 @NFR-R1`) and eight approved PNGs (four states × two engines) in the diff. Not re-run in this review.
- ✅ 8.3 `test/features/grid_view/grid_view_meeting_share_e2e.feature:12-40` and `grid_view_meeting_contract_e2e.feature` share through the dialog ("the user chooses Share in the dialog").
- ✅ 9.1 Scoped Stryker re-run in this review on every listed file: all at or above 90 % (see Mutation).
- ✅ 9.2 CI is green for this branch (build, bundle size, typecheck, lint); not re-run in this review.
- ✅ 9.3 For every id FR1–FR12, NFR-P1, NFR-P2, NFR-A1–NFR-A3, NFR-R1, NFR-R2, UX1–UX5 the task's grep prints at least one line (smallest counts: NFR-R2 3, UX2 3, UX4 3, NFR-A3 4).
- ✅ 9.4 `grep -rniE "toast|snackbar|popup|datepicker|time picker" src/views/shared/MeetingShare* src/presenter/meetingShare*` prints nothing.

## Requirements

- ✅ FR1 — `app/AppShellMeeting.tsx:26-43` (Share meeting opens, lazy dialog), `controller/useMeetingShare.ts:42-45`; tests `app/AppShell.meeting.test.tsx:95`, grid-view unit "Share meeting opens the share dialog", e2e "Closing keeps the meeting".
- ✅ FR2 — rows from `controller/useMeetingShareDialogRows.ts` rendered by `views/shared/MeetingShareLocationRow.tsx`; ticks reset on every opening (`controller/useMeetingShareSession.ts:21`); unit scenarios "Rows of the sample meeting", "Unticked locations are not remembered".
- ✅ FR3 — `model/meetingInvitation.ts:28`, `presenter/meetingShareText.ts:65`; no text and inactive Share with nothing ticked (`controller/useMeetingShareText.ts:37`, `views/shared/MeetingShareDialog.tsx:142`); "Only included locations get a line", "No location ticked".
- ✅ FR4 — share language through `i18n.getFixedT(shareLanguage)` and `useCityLabels`/`useExemplarCity` in the share language (`controller/useMeetingShareDialog.ts:85-100`); "Another share language", "The device time location in another share language", "The share language differs from the interface language".
- ✅ FR5 — `locales/resolveShareLanguage.ts`, `controller/useMeetingShareCommands.ts:24-36`; the four pin scenarios of `meeting_share_dialog_language_unit.feature` and the settings scenarios.
- ✅ FR6 — `presenter/meetingShareLine.ts:31-57`, `TOGGLE_SHARE_ZONE_LABEL_PART`; "Zone parts follow the share zone label", "A UTC location does not repeat UTC", "Zone parts are those at the start of the meeting", "Turning the UTC offset off".
- ✅ FR7 — `model/weekday.ts:29`, `presenter/meetingShareText.ts:57-64` with `shareHeading_<weekday>` context keys; "Russian heading by weekday" (7 rows).
- ✅ FR8 — `views/shared/MeetingSharePreview.tsx` renders `session.text`, the same string `share` sends (`controller/useMeetingShareDialog.ts:153-160`); "The preview is the text that is shared", "The preview follows the ticks".
- ✅ FR9 — `controller/useMeetingShare.ts:48-52` (`finishShare`, cancelled keeps the dialog); "Outcomes of a share from the dialog", `controller/useMeetingShareSending.test.tsx:19-59`.
- ✅ FR10 — excluded-id session (`useMeetingShareSession.ts`) and the close on a removed range (`useMeetingShare.ts:38-40`); "A location is removed in another tab", "The meeting range is removed in another tab", `useMeetingShareSending.test.tsx:89`.
- ✅ FR11 — `adapters/shareDestinations.ts`, `presenter/shareDestinationLabel.ts`, `views/shared/shareDestinationIcons.ts`, buttons at `views/shared/MeetingShareDialog.tsx:136-150`; `MeetingShareDialog.test.tsx:150`.
- ✅ FR12 — ten `meeting.shareDialog*` keys in `en.json` and `ru.json`; unit scenario "English interface".
- ✅ NFR-P1 — formatters through the cached `getDateTimeFormatter`; `meeting_share_dialog_budget_unit.feature` with `startWorkCount()` steps; benchmark `test/benchmarks/meetingShareText.bench.ts`.
- ✅ NFR-P2 — double lazy load (`app/AppShellMeeting.tsx:7`, `views/shared/LazyMeetingShareDialog.tsx:5`); `app/AppShell.shareDialogChunk.test.tsx`; bundle size check green in CI.
- ✅ NFR-A1 — Radix modal, Escape inside an open language list kept from closing the dialog (`views/shared/MeetingShareDialog.tsx:69-71`), focus returned to Share meeting (:72-75); e2e "Focus enters and returns", "Focus returns after a share", "Esc in the open language list".
- ✅ NFR-A2 — checkbox named by city label, pin `aria-pressed`/`aria-label`, named toggle group; e2e "Controls announce their names and states", "Narrow phone" (44 × 44 px), axe outline.
- ✅ NFR-A3 — preview `section aria-labelledby` without `aria-live` (`views/shared/MeetingSharePreview.tsx:22`); e2e "Controls announce their names and states".
- ✅ NFR-R1 — e2e "Narrow phone", "Wide screen", screenshots at 390 and 1280 px.
- ✅ NFR-R2 — scrolling content area (`views/shared/MeetingShareDialog.tsx:94`) with the buttons outside it (:135); e2e "A long list keeps Share in view".
- ✅ UX1 — `DialogContent` frame, `LanguageGroup`, `SettingsToggleGroup` reused; e2e "Wide screen", screenshots.
- ✅ UX2 — `views/shared/ShareLanguagePin.tsx` (size-11, Lucide `Pin`, accent/muted classes); screenshot "Kolkata unticked, English pinned".
- ✅ UX3 — span in `text-meeting-text`, muted when unticked (`views/shared/MeetingShareLocationRow.tsx:23,61-63`); `MeetingShareParts.test.tsx`, screenshots.
- ✅ UX4 — preview `bg-background border-card-border rounded-lg`, heading `font-bold` (`views/shared/MeetingSharePreview.tsx:29,36`); screenshots.
- ✅ UX5 — a row has only its checkbox; screenshots step "no row of the share dialog has a remove control"; outcomes scenario checks no confirmation dialog.
- ✅ M1 — "English text of the sample meeting" and "Russian text of the sample meeting" in `meeting_range_share.feature`, character for character.
- ✅ M2 — "Only included locations get a line" in `meeting_range_share.feature` (4 lines with 3 of 6 ticked).
- ✅ M3 — "A pinned language opens every time" (reload) and "Without the pin the dialog returns to the interface language" in `meeting_share_dialog_language_unit.feature`.
- ✅ M4 — "Russian heading by weekday" outline with 7 rows; `model/weekday.test.ts:7`.
- ⚠️ M5 — axe runs in 3 theme × width pairs (light 320, dark 390, light 1280) per the spec table; the metric says "in both themes at 320, 390 and 1280 px", so dark 320, light 390 and dark 1280 are not measured (R4).
- ✅ M6 — measured in this review: every new or changed model, presenter and preferences file is at or above 95 % (lowest `presenter/meetingShareLine.ts` 96.67 %).
- ✅ M7 — `grid_view_meeting_share_e2e.feature:12-25`: Share meeting, then Share in the dialog, and the text is shared.
- ✅ M8 — `pnpm check:bundle-size` is a CI step that is green; no budget raised in the diff.
- ✅ Scenario: Share meeting opens the share dialog — `grid_view_meeting_share_unit.feature`.
- ✅ Scenario: Share where the browser can share — `grid_view_meeting_share_unit.feature`, `grid_view_meeting_share_e2e.feature:13`.
- ✅ Scenario: Closing the share sheet — `grid_view_meeting_share_unit.feature`, `grid_view_meeting_share_e2e.feature:29`.
- ✅ Scenario: Copy where the browser cannot share — `grid_view_meeting_share_unit.feature`, `grid_view_meeting_share_e2e.feature`.
- ✅ Scenario: Neither share nor clipboard — `grid_view_meeting_share_unit.feature`, `grid_view_meeting_share_e2e.feature`.
- ✅ Scenario: Opening the dialog again removes the notice — `grid_view_meeting_share_unit.feature`; `app/AppShell.meeting.test.tsx`.
- ✅ Scenario: English text of the sample meeting — `meeting_range/meeting_range_share.feature`.
- ✅ Scenario: Russian text of the sample meeting — `meeting_range/meeting_range_share.feature`.
- ✅ Scenario: The text follows the hour format — `meeting_range/meeting_range_share.feature`.
- ✅ Scenario: Only included locations get a line — `meeting_range/meeting_range_share.feature`.
- ✅ Scenario: The share language differs from the interface language — `meeting_range/meeting_range_share.feature`.
- ✅ Scenario: Zone parts follow the share zone label — `meeting_range/meeting_range_share.feature`.
- ✅ Scenario: A UTC location does not repeat UTC — `meeting_range/meeting_range_share.feature`.
- ✅ Scenario: Zone parts are those at the start of the meeting — `meeting_range/meeting_range_share.feature`.
- ✅ Scenario: Russian heading by weekday — `meeting_range/meeting_range_share.feature`.
- ✅ Scenario: The dialog opens with its defaults — `meeting_share_dialog_unit.feature`.
- ✅ Scenario: The reference line without a home location — `meeting_share_dialog_unit.feature`; `controller/useMeetingShare.test.tsx:65,79`.
- ✅ Scenario: Closing keeps the meeting — `meeting_share_dialog_e2e.feature:14` (close button and Esc).
- ✅ Scenario: Rows of the sample meeting — `meeting_share_dialog_unit.feature:23`.
- ✅ Scenario: Unticked locations are not remembered — `meeting_share_dialog_unit.feature:33`.
- ✅ Scenario: No location ticked — `meeting_share_dialog_e2e.feature:27` (hint, inactive by pointer and keyboard).
- ✅ Scenario: Another share language — `meeting_share_dialog_language_unit.feature`.
- ✅ Scenario: The device time location in another share language — `meeting_share_dialog_language_unit.feature`; `controller/useMeetingShare.test.tsx:182`.
- ✅ Scenario: Without the pin the dialog returns to the interface language — `meeting_share_dialog_language_unit.feature`.
- ✅ Scenario: A pinned language opens every time — `meeting_share_dialog_language_unit.feature`.
- ✅ Scenario: Changing the language while pinned — `meeting_share_dialog_language_unit.feature`.
- ✅ Scenario: Turning the pin off — `meeting_share_dialog_language_unit.feature`.
- ✅ Scenario: Turning the UTC offset off — `meeting_share_dialog_preview_unit.feature`.
- ✅ Scenario: The choice is used the next time — `meeting_share_dialog_preview_unit.feature`.
- ✅ Scenario: The preview is the text that is shared — `meeting_share_dialog_preview_unit.feature`.
- ✅ Scenario: The preview follows the ticks — `meeting_share_dialog_preview_unit.feature`.
- ✅ Scenario: Outcomes of a share from the dialog — `meeting_share_dialog_unit.feature:39` (four rows).
- ✅ Scenario: A location is removed in another tab — `meeting_share_dialog_unit.feature`.
- ✅ Scenario: The meeting range is removed in another tab — `meeting_share_dialog_unit.feature`.
- ✅ Scenario: Focus enters and returns — `meeting_share_dialog_e2e.feature:35`.
- ✅ Scenario: Focus returns after a share — `meeting_share_dialog_e2e.feature:43`.
- ✅ Scenario: Controls announce their names and states — `meeting_share_dialog_e2e.feature:51`.
- ✅ Scenario: Esc in the open language list — `meeting_share_dialog_e2e.feature:62`.
- ✅ Scenario: Keyboard only — `meeting_share_dialog_e2e.feature:71`.
- ✅ Scenario: No accessibility violations — `meeting_share_dialog_e2e.feature` outline with light 320, dark 390, light 1280.
- ✅ Scenario: Narrow phone — `meeting_share_dialog_e2e.feature` (fills screen, no horizontal scroll, 44 × 44 px targets).
- ✅ Scenario: Wide screen — `meeting_share_dialog_e2e.feature` (centred, 512 px).
- ✅ Scenario: A long list keeps Share in view — `meeting_share_dialog_e2e.feature` (20 locations, scrolled to end and start).
- ✅ Scenario: English interface — `meeting_share_dialog_unit.feature`.
- ✅ Scenario: A tick builds no formatter — `meeting_share_dialog_budget_unit.feature:10`.
- ✅ Scenario: Returning to a used language builds no formatter — `meeting_share_dialog_budget_unit.feature`.
- ✅ Scenario: The dialog matches its approved screenshots — `meeting_share_dialog_screenshots_e2e.feature` (four states) with approved PNGs.
- ✅ Scenario: The pinned share language survives a reload — `settings/settings_share_preferences_unit.feature`.
- ✅ Scenario: The share zone label survives a reload — `settings/settings_share_preferences_unit.feature`.
- ✅ Scenario: Existing users get the defaults — `settings/settings_share_preferences_unit.feature`.
- ✅ Scenario: Unreadable share choices — `settings/settings_share_preferences_unit.feature`.
- ✅ Scenario: A pinned language that the app no longer has — `settings/settings_share_preferences_unit.feature`.
- ✅ Scenario: Another tab changes the share choices — `settings/settings_share_preferences_unit.feature`.
- ✅ Scenario: Nothing is written before a change — `settings/settings_share_preferences_unit.feature`.

## Mutation

Measured in this review with `cd packages/client && npx stryker run --mutate '<files>'`, four runs of at most five files, one at a time:

| File | Score |
|---|---|
| `src/model/meetingInvitation.ts` | 100.00 % |
| `src/presenter/meetingShareText.ts` | 100.00 % |
| `src/presenter/meetingShareLine.ts` | 96.67 % (1 no coverage: the empty abbreviation fallback when `getZoneAbbreviation` returns nothing for a valid local time) |
| `src/locales/resolveShareLanguage.ts` | 100.00 % |
| `src/adapters/textShareDestination.ts` | 100.00 % |
| `src/preferences/preferences.ts` | 100.00 % |
| `src/preferences/preferencesCommands.ts` | 100.00 % |
| `src/preferences/parseStoredPreferences.ts` | 100.00 % |
| `src/adapters/preferencesDocument.ts` | 97.56 % (1 survivor in the load function at :94, code this branch did not change) |
| `src/presenter/dateTimeFormatters.ts` | 100.00 % |
| `src/presenter/shareDestinationLabel.ts` | 100.00 % |
| `src/adapters/shareDestinations.ts` | 100.00 % |
| `src/presenter/meetingShareReference.ts` | 100.00 % |
| `src/model/weekday.ts` | 100.00 % |
| `src/controller/useMeetingShare.ts` | 100.00 % |
| `src/controller/useMeetingShareCommands.ts` | 100.00 % |
| `src/controller/useMeetingShareText.ts` | 100.00 % |
| `src/controller/useMeetingShareDialog.ts` | 95.00 % (3 survivors: the `""` title fallback, the provider error message, the `NO_LOCATIONS` constant) |
| `src/controller/useMeetingShareDialogRows.ts` | 91.67 % (1 survivor: `return []` without a meeting; 1 no coverage) |
| `src/controller/useMeetingShareSession.ts` | **88.10 %** (5 survivors, all in the re-tick branch of `toggleLocation` at :37-38 — R1) |

## Findings

### R1 — WARNING — Ticking a location back is never tested; the session file scores 88 %
- Location: `packages/client/src/controller/useMeetingShareSession.ts:37`
- Rule: `.claude/rules/tdd-workflow.md` ("Target mutation score: >=95%. Minimum acceptable: >=90%.")
- Problem: `toggleLocation` removes an id from `excludedLocationIds` when the location is ticked again (`current.excludedLocationIds.filter((excludedId) => excludedId !== locationId)`, lines 37-38). No test asserts the result of a re-tick: Stryker keeps alive the mutants that drop the `filter` (the id stays excluded), that make the predicate `true` or `false`, and that flip `!==` to `===`. The only re-tick in the suites is the budget scenario "A tick builds no formatter", which counts formatters and does not look at the text or the rows. The file scores 88.10 %, below the 90 % minimum.
- Impact: The delta spec requires "Unticking a location leaves it out of the meeting invitation; ticking it puts it back" (`meeting-share-dialog` → "Locations in the share dialog", FR2/FR3), and user scenario U4 is exactly that: fix a wrong tick, then share. A regression where a re-ticked location stays excluded, or where re-ticking one location re-ticks every other one, would pass the whole suite and send a text without the location the user just ticked.
- Fix: In `controller/useMeetingShare.test.tsx` (it already drives `toggleLocation` through `useMeetingShare.harness.tsx`), add a case that unticks Moscow and Kolkata, then ticks Moscow again, and asserts that the text's lines are Almaty, Moscow and New York, that the Moscow row has `isIncluded: true` and that the Kolkata row still has `isIncluded: false`. Re-run `npx stryker run --mutate 'src/controller/useMeetingShareSession.ts'` and check the score is at least 90 %.
- Fix risk: none — a test-only addition in the existing controller unit suite; no production code changes.
- Status: open

### R2 — SUGGESTION — Preview lines are keyed by their text, which two locations can share
- Location: `packages/client/src/views/shared/MeetingSharePreview.tsx:38`
- Rule: —
- Problem: The preview renders each line as `<p key={line}>{line}</p>`. Two lines of the meeting share text can be equal: the locations spec allows a city location and the device time location in the same zone ("A city location and the device time location are never duplicates of each other, also when they are in the same zone", `openspec/specs/locations/spec.md:9`). With the device time location in `Asia/Almaty` and the city Almaty both in the list, both lines read «Алматы (UTC+5): 09:00–11:00», so two siblings get the same key.
- Impact: React logs "Encountered two children with the same key" for this list, and its documentation warns that siblings with duplicate keys may be duplicated or omitted when the list updates (a tick, a language change). The two elements hold the same text, so a wrong match usually still renders the same DOM. That limits the visible risk, but the preview still breaks React's key contract for a list the spec allows.
- Fix: Key the lines by the invited location they belong to. In `controller/useMeetingShareDialog.ts`, return `previewLines: { locationId, text }[]` next to `text`, built by pairing `invitation.locations` with `text.split(MEETING_SHARE_LINE_SEPARATOR).slice(1)` (`presentMeetingShareText` writes the heading, then one line per invited location in order). Have `MeetingSharePreview` take the heading and these lines and use `key={locationId}`. Add a case to `views/shared/MeetingShareParts.test.tsx` that renders two equal lines and expects both.
- Fix risk: It changes the props of `MeetingSharePreview` and its tests in `MeetingShareParts.test.tsx` and `MeetingShareDialog.test.tsx`. The pairing depends on the one-line-per-location order of `presentMeetingShareText`, a documented rule that its tests already pin. `text` must stay the string `share` sends (FR8). A `key={index}` would be shorter, but Biome's `noArrayIndexKey` flags it.
- Status: open

### R3 — SUGGESTION — The share dialog repeats the zone label toggle keys and their order
- Location: `packages/client/src/views/shared/MeetingShareDialog.tsx:26`
- Rule: `.claude/rules/code-style.md` ("Is any value repeated in 2+ places? → Must be a constant")
- Problem: `SHARE_ZONE_LABEL_TOGGLES` hardcodes the label keys `settings.zoneLabelAbbreviation` and `settings.zoneLabelUtcOffset` and their order (abbreviation, then UTC offset). The same part → key mapping already exists as `ZONE_LABEL_PART_LABEL_KEYS` in `app/settings/ZoneLabelGroup.tsx:11-15`, and the display order already exists as `ZONE_LABEL_PART_ORDER` in `constants/preferences.ts:29-33` (country, abbreviation, UTC offset). The parts the dialog may show are already `SHARE_ZONE_LABEL_PARTS` (`preferences/preferences.ts`).
- Impact: The dialog is meant to be "the toggle group of the zone label setting without the country" (spec, "Share zone label toggles"). Renaming a toggle key or reordering the parts in the settings now needs a second, separate edit in the dialog, and nothing fails if it is missed.
- Fix: Move `ZONE_LABEL_PART_LABEL_KEYS` from `ZoneLabelGroup.tsx` into `views/shared/` (for example a `zoneLabelPartLabelKeys.ts` exported through `views/shared/index.ts`) and import it in both places. In the dialog, build the options as `ZONE_LABEL_PART_ORDER.filter((part) => SHARE_ZONE_LABEL_PARTS.includes(part)).map((part) => ({ value: part, label: t(ZONE_LABEL_PART_LABEL_KEYS[part]) }))`.
- Fix risk: Low. `ZoneLabelGroup` changes its import only. The toggle order in the dialog stays abbreviation, then UTC offset, which the e2e scenario "Controls announce their names and states" and the approved screenshots already check.
- Status: open

### R4 — SUGGESTION — M5 measures axe in three of the six theme × width pairs it names
- Location: `packages/client/src/test/features/meeting_share_dialog/meeting_share_dialog_e2e.feature:79`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it")
- Problem: Success metric M5 reads "axe-core reports 0 violations of the share dialog in both themes at 320, 390 and 1280 px". The outline "No accessibility violations" runs only light 320, dark 390 and light 1280, as in the spec table. Dark 320, light 390 and dark 1280 are never checked.
- Impact: A contrast violation that shows only in one theme at a width the outline skips would pass CI (for example a dark-theme token on the full-screen phone frame at 320 px). M5 cannot be reported as met as written.
- Fix: Add the rows `| dark | 320 |`, `| light | 390 |` and `| dark | 1280 |` to the Examples of the outline. The steps already take the theme and the width as parameters.
- Fix risk: Three more axe runs in the browser suite (a few seconds each). The spec table lists three pairs, but the requirement says "axe-core MUST report no violation" with no limit, so extra rows do not contradict it.
- Status: open

## Verdict

Not ready — blocking: R1 (the session file is below the 90 % mutation minimum and re-ticking, a spec rule, has no test). R2, R3 and R4 are suggestions and do not block.
