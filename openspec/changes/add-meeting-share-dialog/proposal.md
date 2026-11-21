# Share a meeting through a dialog: pick the locations, the language and the zone label

The decisions were taken with the owner on 20–21 November 2026 and are recorded in `docs/design/proposals/meeting-range/share-window.md` (commit `9184822`). This change builds them. The sibling change `move-meeting-range-and-extend-past-midnight` touches other requirements of the same capabilities and can be built before or after this one.

## Why

1. **The text names every location.** Share meeting writes one line per location of the list (`presentMeetingShareText`). A user who watches five zones and plans a meeting for people in three of them has to delete lines by hand, or confuses the readers.
2. **The text is always in the interface language.** The words come from labels already made for the screen (`useMeetingShare` passes `row.cityLabel`, `rowRange.spanLabel`, `dateBar.fullDateLabel`). A user who reads the app in Russian and plans meetings with English-speaking colleagues cannot get an English text without switching the whole interface.
3. **A line names no zone.** `Moscow: 07:00–09:00` leaves the reader to guess the zone. Settled teams speak in zone abbreviations (MSK, IST, CET), mixed teams need the UTC offset.
4. **The Russian heading is a calque.** `Встреча {{date}}, {{duration}}` gives «Встреча воскресенье, 8 марта 2026 г., 2 ч»: the weekday comes from the browser in the nominative case.
5. **Only one way out.** The `TextSharing` port takes a ready string, so a calendar event, an email or a web page cannot be added without rewriting the share path.

Audience: everyone who plans a meeting in the Grid view and sends it to other people. No urgency from a defect; the owner asked for it as the next step of meeting planning.

## What Changes

- **ADDED** the **share dialog**: Share meeting opens it instead of sharing at once. It lists the locations with checkboxes, the share language with its pin, the share zone label, a preview of the meeting share text and the Share button.
- **ADDED** the **share language**: the language of the meeting share text, chosen in the share dialog. It follows the interface language unless it is pinned.
- **ADDED** the **share zone label**: which zone parts a line of the meeting share text shows — the zone abbreviation and the UTC offset, both on by default.
- **ADDED** the **meeting invitation**: the language-free data of a share — the meeting range and the locations included in it.
- **ADDED** the **share destination** and its registry: a way the meeting invitation leaves the app. One destination exists: the system share with the clipboard fallback.
- **MODIFIED** the **meeting share text**: one line per *included* location, the zone parts after the city label, every word in the share language, the heading with the weekday in the right grammatical form.
- **MODIFIED** Share meeting on the meeting bar: it opens the share dialog.
- **MODIFIED** the **preferences**: they gain the pinned share language and the share zone label.
- New glossary terms: share dialog, share language, share zone label, meeting invitation, share destination. Changed terms: Share meeting, meeting share text, preferences, text sharing.

No breaking change for stored data: the preferences document is migrated.

## Capabilities

### New Capabilities

- `meeting-share-dialog`: the share dialog — its locations, share language and pin, share zone label, preview, Share button, states, accessibility and layout.

### Modified Capabilities

- `meeting-range`: "Share meeting text" (included locations, zone parts, share language, heading by weekday).
- `grid-view`: "Share meeting from the meeting bar" (opens the share dialog; the notices follow a share made in the dialog).
- `settings`: a new requirement — the share language and the share zone label are kept on the device.

## Goals

- **G1** A user sends a meeting share text that names only the locations they ticked.
- **G2** A user sends the text in another language than the interface, and can keep that language for the next meetings.
- **G3** Every line names its zone the way the readers speak about it: abbreviation, UTC offset, both or neither.
- **G4** The Russian text reads as Russian: «Встреча в воскресенье, …».
- **G5** The user sees the exact text before it leaves the app.
- **G6** A later share destination (calendar event, email, web page) is added without changing the share dialog or the text rules.

## Non-Goals

- **NG1** No destination besides the system share with the clipboard fallback. No calendar event, email or web page.
- **NG2** No separate Copy button: the system share sheet has one.
- **NG3** Unticked locations are not remembered between openings.
- **NG4** The hour format is not chosen in the share dialog; it follows the hour format setting.
- **NG5** No country name in a line; never "GMT".
- **NG6** The share dialog does not change the meeting range, the location list or the interface language.
- **NG7** No language outside the locale registry (today Russian and English).
- **NG8** Nothing changes in the Cards view, which shows no meeting range.

## Users & Scenarios

- **U1** Daria watches Almaty, Moscow, Minsk, UTC, Belgrade and Novi Sad, and plans a call for colleagues in Almaty, Moscow and Belgrade. She unticks the other three and shares four lines.
- **U2** Oleg reads the app in Russian and always writes to colleagues in English. He chooses English once, pins it, and every next share opens in English while the interface stays Russian.
- **U3** A Moscow team reads «МСК» and ignores offsets: the sender turns the UTC offset off. A mixed team needs both, the default.
- **U4** A sender checks the preview, sees a wrong location ticked, fixes it and only then shares.

## Requirements

### Functional

- **FR1** Share meeting on the meeting bar opens the share dialog. Nothing is shared or copied until the user chooses Share in the dialog.
- **FR2** The share dialog lists every location of the list, in list order, each with a checkbox, its city label, its zone abbreviation and UTC offset, its local span of the meeting and its local date with the day shift. Every checkbox is ticked each time the dialog opens.
- **FR3** The meeting share text has one line per ticked location, in list order. With no location ticked, Share is inactive and the preview shows a hint instead of a text.
- **FR4** The share language is chosen in the dialog from the languages of the locale registry. Every word of the meeting share text follows it: the heading, city labels, dates, the day shift words, the duration and localized zone abbreviations. The interface language does not change.
- **FR5** The share language pin keeps the share language in the preferences. Not pinned: every opening starts in the interface language. Pinned: every opening starts in the pinned language; choosing another language while pinned keeps the new one.
- **FR6** The share zone label has two independent toggles, Abbreviation and UTC offset, both on by default. A line shows the chosen parts in brackets after the city label; a zone with no abbreviation shows only its offset; with nothing to show the line has no brackets; a `UTC` location never repeats `UTC`. The parts are those in force at the start of the meeting range. The choice is kept in the preferences and does not depend on the zone label setting.
- **FR7** The heading names the weekday of the meeting start in the reference zone in the grammatical form the language needs (Russian: «в понедельник», «во вторник», «в среду», «в четверг», «в пятницу», «в субботу», «в воскресенье»). A language without such forms uses one heading.
- **FR8** The preview shows exactly the text that Share will send, and follows every change of the ticked locations, the share language and the share zone label at once.
- **FR9** Share in the dialog hands the previewed text to the share destination with the outcomes of "Share meeting outcome". Shared, copied and failed close the dialog and show today's notice (none, copied, failed). Cancelled keeps the dialog open with its choices.
- **FR10** The dialog follows the model while open: an added location appears ticked, a removed one disappears, and when the meeting range is removed the dialog closes.
- **FR11** The share dialog offers one button per share destination available on the device. Today there is one, named «Поделиться» ("Share").
- **FR12** Every text of the share dialog is localized in Russian and English.

### Non-Functional

#### Performance

- **NFR-P1** Building the preview again after a change builds no new `Intl` formatter for a language that was already used in this opening of the dialog (a work bound, ADR-0008).
- **NFR-P2** The share dialog is not in the initial bundle of the main page; the bundle size check keeps passing.

#### Accessibility

- **NFR-A1** The share dialog is a modal dialog with an accessible name; the focus moves into it on opening, stays inside, and returns to Share meeting on closing. Esc and the close button close it.
- **NFR-A2** Every control has an accessible name and state: each checkbox is named by its city label, the pin is a toggle button named «Запомнить язык приглашения» with a pressed state, the zone label toggles are a named group. Every target is at least 44 × 44 px. axe-core reports no violation in the light and the dark theme.
- **NFR-A3** The preview is a named region that is not announced on every change; the outcome notices are announced politely, as today.

#### Responsive

- **NFR-R1** From 320 px to 2560 px wide the dialog never scrolls horizontally. Below 640 px it fills the screen; from 640 px it is centred and at most 512 px wide.
- **NFR-R2** With more locations than fit, the content scrolls inside the dialog and the Share button stays visible.

## UX Acceptance Criteria

- **UX1** The dialog reuses existing controls and their sizes: the dialog frame of Add location (padding 16 px, title 18 px / 600, close button 44 × 44 px), the toggle group of the zone label setting, the language button of the settings with its flag.
- **UX2** The pin is a square 44 × 44 px button with the Lucide `Pin` icon and no text; no caption explains it. Not pinned: an outlined pin in the muted foreground and the control border. Pinned: a filled pin in the accent colour and an accent border.
- **UX3** The location rows show the meeting span in the meeting text colour while ticked and in the muted foreground while unticked.
- **UX4** The preview looks like a quoted text: the page background, the card border and radius, the heading in bold.
- **UX5** No red delete crosses and no modal confirmation after a share.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | meeting range set, all locations ticked | list, share language, share zone label, preview with every line, active Share |
| any | some locations unticked | their rows muted, the preview without their lines |
| any | no location ticked | hint «Отметьте хотя бы одно место» in the preview, inactive Share |
| any | more locations than fit | the content scrolls, Share stays visible |
| any | a location is added or removed in another tab | the list follows; a new row is ticked |
| any | the meeting range is removed while open | the dialog closes |
| any | share outcome shared | the dialog closes, no notice |
| any | share outcome cancelled | the dialog stays open with its choices |
| any | share outcome copied | the dialog closes, the meeting copied notice |
| any | share outcome failed | the dialog closes, the share failed notice |
| offline | any | the same as online: sharing needs no network |

The dialog has no loading state: it opens only while a meeting range is set and its data is already in memory.

## Behavior

- `packages/client/src/test/features/meeting_range/meeting_share_text_unit.feature` — the text rules (`@add-meeting-share-dialog @FR3 @FR4 @FR6 @FR7`).
- `packages/client/src/test/features/meeting_share_dialog/meeting_share_dialog_unit.feature` — the dialog (`@FR1`–`@FR5`, `@FR8`–`@FR12`).
- `packages/client/src/test/features/meeting_share_dialog/meeting_share_dialog_e2e.feature` — focus, keyboard, axe-core, layout and screenshots (`@NFR-A1`–`@NFR-A3`, `@NFR-R1`, `@NFR-R2`).
- `packages/client/src/test/features/settings/settings_share_preferences_unit.feature` — the stored choices (`@FR5 @FR6`).

## Visual Reference

`docs/design/proposals/meeting-range/` — four hand-drawn screens of the dialog (`screens/share-window-*.png`) and the measured sizes in `share-window.md`. They are a reference, not approved screens: design tokens are the source of truth for colours, and the approved screens of this change are produced by its screenshot tests.

## Affected IA

No changes: the project has no `docs/ia/` documents.

## Success Metrics

- **M1** For the sample meeting the meeting share text equals the expected lines of the delta spec, character for character, in Russian and in English: 2 of 2 scenarios pass.
- **M2** With 3 of 6 locations ticked the text has exactly 4 lines.
- **M3** A pinned share language is in force on the first opening after a reload in 100 % of runs of its scenario; without the pin the dialog opens in the interface language.
- **M4** 7 of 7 Russian weekday headings match the expected forms.
- **M5** axe-core reports 0 violations of the share dialog in both themes at 320, 390 and 1280 px.
- **M6** Mutation score of the new and changed model, presenter and preferences files is at least 95 % (minimum 90 %).
- **M7** With the defaults a share takes 2 actions: Share meeting, then Share.
- **M8** `pnpm check:bundle-size` passes without raising a budget.

## Open Questions

- **Q1** Should the share failed outcome keep the dialog open instead of closing it? This change closes it (FR9) so that the notice is not hidden behind the dialog.
- **Q2** Does the destination registry deserve an ADR of its own once a second destination is planned? This change records it in `design.md` and follows ADR-0005 for the registry shape.

## Impact

- Model: a new meeting invitation owner; preferences gain two fields and a schema migration.
- Presenter: `presentMeetingShareText` takes the meeting invitation, the share language and the share zone label instead of ready labels.
- Ports and adapters: a share destination port and registry; `TextSharing` and its adapters stay and back the first destination.
- Controller: `useMeetingShare` opens the dialog and shares from it.
- Views: a new share dialog; the language list and the toggle group of the settings are reused.
- Translations: `ru.json`, `en.json` — dialog texts and the heading by weekday.
- Docs: glossary (`time-selection.md`, `settings.md`, `architecture.md`), `docs/architecture/views.md`, `docs/architecture/domain-model.md`.
- No new dependency.
