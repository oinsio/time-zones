# Design: add-meeting-share-dialog

## Context

The motivation is in proposal.md → Why. The behaviour is in the spec deltas: `meeting-share-dialog` (new), `meeting-range`, `grid-view`, `settings`.

Today `useMeetingShare` (`controller/useMeetingShare.ts`) collects labels that were made for the screen — `row.cityLabel`, `rowRange.spanLabel`, `dateBar.fullDateLabel` — and `presentMeetingShareText` joins them with `meeting.shareHeading` / `meeting.shareLine`. The text is therefore tied to the interface language (FR4), to every row (FR3) and to the screen's formats. `TextSharing.shareText(text)` takes the ready string.

ADRs that bind this change:
- ADR-0002: model, presenter, controller, views. Text is formatted in the presenter only.
- ADR-0004: preferences are a versioned document written by `PreferencesRepository` only; the meeting range is never stored.
- ADR-0005: the view registry — the shape followed by the destination registry (D5).
- ADR-0008: work bounds, never timings, in tests (NFR-P1).

Owners of the concepts this change touches (`docs/glossary/`):
- **Meeting share text**: `presentMeetingShareText` (`presenter/meetingShareText.ts`).
- **Share meeting**: `useMeetingShare`.
- **Text sharing**: `TextSharing`, `ShareOutcome`, `browserTextSharing`, `createInMemoryTextSharing`.
- **Meeting range**: `MeetingRange`, `getMeetingSpan`, `getLocationMeetingRange`.
- **Zone abbreviation**: `getZoneAbbreviation`, `formatZoneAbbreviation`. **Zone line**: `presentZoneLine` (`presenter/zoneLine.ts`). **UTC offset** text: `formatUtcOffset` (`presenter/utcOffset.ts`, already exported through `presenter/index.ts`).
- **Zone label**: `ZoneLabelPart`, `Preferences.zoneLabelParts`, `SettingsToggleGroup`.
- **Interface language** and the locale registry: `Preferences.interfaceLanguage`, `localeRegistry`, `findRegisteredLocale`, `InterfaceLanguageList`.
- **City label**: `CitySearch.getCityLabel(timeZoneId, storedLabel, cityNameLanguage)`, `useCityLabels`, `resolveCityNameLanguage` (`locales/languageFallbacks.ts`).
- **Day shift**: `getDayShift`. **Meeting bar** title and duration: `presentMeetingBar`, `formatMeetingDuration`.
- **Preferences**: `Preferences`, `reducePreferences`, `parseStoredPreferences` (`preferences/`), the stored document and its migrations `createPreferencesMigrations` (`adapters/preferencesDocument.ts`), `PREFERENCES_SCHEMA_VERSION` (`constants/preferences.ts`, today 7).
- **Work bounds**: `startWorkCount` (`src/test/workCounters.ts`, ADR-0008), as `grid_view_meeting_budget.feature` already uses it.

Every decision below extends one of these owners or adds an owner for a new glossary term. None adds a second owner.

## Goals / Non-Goals

**Goals:** one owner per new term; the text is a pure function of data, language and choices; the dialog holds no rule of the text; a second destination needs no change to the dialog.

**Non-Goals:** building any destination besides text sharing; changing `ShareOutcome`; changing how the Grid view presents rows.

## Decision

### D1. The meeting invitation is model data (FR3, FR10, G6)

New `model/meetingInvitation.ts`:

```
MeetingInvitation = { range: MeetingRange; locations: readonly InvitedLocation[] }
InvitedLocation   = { id; timeZoneId; label }          // the stored location fields the text needs
getMeetingInvitation(state, excludedLocationIds): MeetingInvitation | undefined
```

It keeps list order, drops excluded ids, ignores ids that are no longer in the list, and returns `undefined` when no meeting range is set. It holds no language and no text. The dialog keeps the **excluded** ids, not the included ones, so that a location added while the dialog is open is included by default (FR10).

### D2. `presentMeetingShareText` formats from data (FR3, FR4, FR6, FR7)

The owner stays `presentMeetingShareText`; its input becomes:

```
{ invitation, referenceZone, hourFormat, shareZoneLabelParts, language,
  translate,          // i18n.getFixedT(language)
  getCityLabel }      // (location) => label in `language`
```

It computes per location, through the existing owners: the local span via `getLocationMeetingRange` + `presentLocationMeetingRange`'s formatter, the day shift via `getDayShift`, the zone abbreviation via `getZoneAbbreviation` + `formatZoneAbbreviation` with `translate`, the UTC offset text via the existing `formatUtcOffset` (`presenter/utcOffset.ts`). The zone parts and their order come from `presentZoneLine` called with an empty place and the share zone label as its `zoneLabelParts`, so its rule "the zone abbreviation yields to a UTC offset that reads the same" is reused, not copied. The share line then drops a part whose text equals the city label (the `UTC` location, whose city label is `UTC`) and wraps what is left in brackets joined by `, `. This zone-parts step is one exported function, `presentMeetingShareZoneParts`, which the share dialog rows reuse (D7). The file is split when it nears 200 lines: `meetingShareText.ts` (assembly) and `meetingShareLine.ts` (one line and its zone parts).

`MeetingShareRow` and the label-based input are removed; `useMeetingShare` is their only caller.

### D3. The heading by weekday uses i18next context (FR7)

`meeting.shareHeading` gets the parameters `weekday` (the full weekday name from `Intl` in the share language), `date` (the date without the weekday), `duration`, and is called with `context: <weekday key>`, where the key comes from a new enum `Weekday` mapped from `Temporal.PlainDate.dayOfWeek`.

- `ru.json`: the base key plus `shareHeading_monday` … `shareHeading_sunday` («Встреча в понедельник, {{date}}, {{duration}}», «Встреча во вторник, …»); the weekday is written in the key's text.
- `en.json`: the base key and the same seven context keys, each `Meeting on {{weekday}}, {{date}}, {{duration}}`.

Every locale file carries the same eight keys, because `locales.test.ts` ("should have identical key sets in every locale file") requires identical key sets — `en.json` already repeats `durationHours_few` / `_many` for the same reason. A language without cases repeats its one heading in the seven context keys. `dateTimeFormatters.ts` gains a label kind for the date without a weekday and one for the weekday alone.

### D4. Share language and share zone label live in the preferences (FR5, FR6)

`Preferences` gains:

```
shareLanguage: string | null            // the pinned share language; null = follow the interface language
shareZoneLabelParts: readonly ZoneLabelPart[]   // subset of ZONE_ABBREVIATION, UTC_OFFSET
```

`ZoneLabelPart` is reused, so the parts have one enum; `COUNTRY` in `shareZoneLabelParts` is invalid. New commands `SET_SHARE_LANGUAGE` and `TOGGLE_SHARE_ZONE_LABEL_PART` in `reducePreferences`. `PREFERENCES_SCHEMA_VERSION` goes from 7 to 8 with a step `7:` in `createPreferencesMigrations` (`adapters/preferencesDocument.ts`) that adds `null` and both parts. `parseStoredPreferences` rejects a `shareLanguage` that is neither `null` nor a non-empty string (the check `interfaceLanguage` already has) and a `shareZoneLabelParts` that is not an array of `ZONE_ABBREVIATION` / `UTC_OFFSET`. It does not consult the locale registry, exactly as for `interfaceLanguage` today.

`resolveShareLanguage(shareLanguage, interfaceLanguage)` in `locales/` returns `{ language, isPinned }`: the pinned language with `isPinned: true` when `findRegisteredLocale` finds it, otherwise the interface language with `isPinned: false`. It is the one owner of "which language a new dialog opens with" and of "an unregistered pin counts as none" (ADR-0004 load normalization: a reference that no longer resolves is cleared, not unreadable).

The share language of an open dialog is controller state, not a preference: without the pin it must not survive the dialog (FR5).

### D5. Share destinations are a registry over the invitation (FR9, FR11, G6)

New port `ports/shareDestination.ts`:

```
ShareDestinationId (enum: TEXT)
MeetingShare      = { invitation: MeetingInvitation; text: string }
ShareDestination  = { id; isAvailable(): boolean; share(meetingShare): Promise<ShareOutcome> }
```

`adapters/textShareDestination.ts` wraps a `TextSharing` (`share` calls `shareText(meetingShare.text)`, `isAvailable` is always true because the clipboard is its fallback). `adapters/shareDestinations.ts` exports the ordered registry, like `viewRegistry`. `TextSharing`, `browserTextSharing` and `createInMemoryTextSharing` are unchanged.

A destination receives both the invitation and the text: a calendar needs the instants and may put the text in the description. The dialog renders one button per available destination and knows none by name; labels and icons come from a presenter map keyed by `ShareDestinationId`.

### D6. Controller: `useMeetingShare` owns the dialog session (FR1, FR8–FR10)

`useMeetingShare` becomes the owner of: whether the dialog is open, the excluded ids, the share language of this opening, the built text (memoised on invitation, language, parts, hour format), and `share(destinationId)`. Opening resets the excluded ids and resolves the language (D4). An effect closes the dialog when the meeting range becomes undefined (FR10). Outcomes map to today's `MeetingShareNotice`; cancelled keeps the session.

City labels in another language: `useCityLabels(locations, load)` already asks `CitySearch.getCityLabel` with the `cityNameLanguage` of `useActiveInterfaceLanguage`; it gains an optional `CityNameLanguage` argument (default: the interface one) so the same owner serves the share language, resolved by the existing `resolveCityNameLanguage(code)`. `translate` is `i18n.getFixedT(language)`, as `useCitySearch` already does for English.

If the file passes 200 lines, the session state moves to `useMeetingShareSession.ts`.

### D7. Views: one lazy dialog built from existing blocks (UX1–UX5, NFR-P2)

`views/shared/MeetingShareDialog.tsx`, loaded with `lazy` like `CalendarMonthGrid`, on `DialogContent`. It reuses:
- `InterfaceLanguageList` for the language list. It moves from `app/settings/` to `views/shared/` with a neutral name (`LanguageList`) and takes the chosen code and a callback; `InterfaceLanguageGroup` keeps using it.
- `SettingsToggleGroup` for the share zone label, moved the same way if it is imported from outside `app/settings/`.
- the row texts: the city label and the local date from the `presentLocationRows` rows (`cityLabel`, `localDateLabel`), the span and the day shift from `meeting.rowRanges` (`spanLabel`, `dayShiftLabel`), and the zone parts from `presentMeetingShareZoneParts` (D2) with both parts in the interface language — not the row's zone line, which follows the zone label setting. The controller builds these texts; the dialog formats nothing itself.

New small components: `MeetingShareLocationRow`, `ShareLanguagePin`, `MeetingSharePreview`. The meeting bar's Share button calls `openShareDialog` instead of `shareMeeting`.

### D8. Where each test lives

- Unit (Vitest, TDD): `meetingInvitation`, `meetingShareText` / `meetingShareLine`, preferences reducer, parser and migration, `resolveShareLanguage`, `useMeetingShare`.
- Contract: `shareDestination.contract.ts` run against the text destination over the in-memory and the browser text sharing.
- Unit BDD: the scenarios of `meeting-range` → "Share meeting text", `settings` and the non-layout scenarios of `meeting-share-dialog`.
- BDD E2E: focus, keyboard, axe-core, layout, screenshots.
- Work bound (NFR-P1): a unit BDD that wraps the rebuild in `startWorkCount()` and asserts no formatter build, as `grid_view_meeting_budget.feature` does; the timing is a `src/test/benchmarks/meetingShareText.bench.ts` benchmark, never asserted (ADR-0008).
- Placement: a scenario that asserts focus, a key press, an inactive (`disabled`) state, an accessible name, an `aria-*` state or layout runs in `*_e2e.feature` only (`bdd-unit.md` puts "Keyboard accessibility", "aria-labels, focus management" and "Responsive layout" in E2E); the unit features check the rest through the controller output and the rendered text.

## Consequences

Positive:
- The meeting share text is a pure function of data, language and choices: testable without rendering a row (FR3, FR4, FR6, FR7).
- A calendar, email or web page destination is one adapter and one registry entry (G6).
- The dialog holds no text rule and no destination name; the settings controls are reused, not copied (UX1).
- A language without grammatical cases repeats one heading string in its eight heading keys (FR7).

Negative:
- City labels in a second language need the city data. `getCityLabel` already falls back to the stored label while the data is not loaded; the preview then shows the stored label and updates when the data arrives.
- The preferences schema goes from 7 to 8 on every device. Covered by migration tests on stored documents of the earlier versions; unreadable documents keep the existing Reset note.
- `InterfaceLanguageList` and `SettingsToggleGroup` move. Moves only, with their tests; the existing settings suites check that nothing changed.
- The dialog covers the notices region, so a notice appears only after the dialog closes (FR9; Q1 of the proposal records the alternative).
- The parameters of `meeting.shareHeading` and `meeting.shareLine` change in both locale files at once; `locales.test.ts` already fails on a key missing in one language.

## Migration Plan

Preferences schema 8 is additive; an older build that reads a version 8 document treats it as unreadable by the existing rule, which only matters for a rollback. Rollback: revert the change; devices that already wrote version 8 see the unreadable note once and reset.

## Alternatives Considered

**Keep building the rows of the text in the controller (D1)**: the rule "which locations, in which order" would stay smeared between a hook and a presenter, and a calendar destination could not reuse it.

**A second presenter beside `presentMeetingShareText` (D2)**: two owners of the meeting share text.

**Derive the Russian weekday form in code (D3)**: grammar in code, once per language. **«Встреча: воскресенье, …»**: one string, but rejected by the owner as dry. **A heading without the weekday**: loses the weekday.

**Store the share language of every opening (D4)**: contradicts FR5 — without the pin the language must return to the interface language.

**A separate enum for the share zone label parts (D4)**: a second owner of "zone part".

**Destinations that take only the text (D5)**: the limit this change removes. **Destinations that format their own text**: a second owner of the meeting share text.

**A second language list written for the dialog (D7)**: a copy of `InterfaceLanguageList`; the project rule is to reuse the existing component.

## Open Questions

- The exact English accessible name of the pin ("Remember the share language") may be reworded with the owner without changing the specs' structure.
