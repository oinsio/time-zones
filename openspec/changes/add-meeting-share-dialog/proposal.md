# Add the meeting share dialog

## Why

Share meeting in the Grid view acts at once: «Поделиться встречей» hands the meeting share text to the system share, or, where the browser has none, copies it to the clipboard and tells so in a notice (`useMeetingShare`, `browserTextSharing`, `MeetingShareNotice` in `packages/client/src/`). Planners of a meeting across zones are affected in three ways:

- The user never sees what is sent. On a desktop the text lands in the clipboard unseen, so a wrong date or a missing city shows only after it was pasted to other people.
- Where the clipboard fails (iOS Safari 12.5, a supported engine without `navigator.clipboard`, ADR-0009, or a denied permission), the user gets «Не удалось поделиться встречей» and nothing to work with: the text is gone.
- On a phone with a system share, the user cannot copy the text instead, for example to paste it into a calendar note.

A meeting share dialog fixes all three: it shows the text, lets the user choose Copy or Send, keeps the text selectable when copying fails, and tells the outcome where the user looks.

## What Changes

- «Поделиться встречей» in the meeting bar opens the **meeting share dialog** instead of sharing at once. The dialog shows the meeting share text (unchanged content, `presentMeetingShareText`), a Copy action, a Send action only where the browser has a system share, and Close.
- The outcome of Copy or Send is shown inside the dialog as the **meeting share status**; the copied notice and the share failed notice of the notices region are removed.
- Send no longer falls back to copying: Copy is always next to it.
- When copying fails, the text in the dialog is selected for the user to copy by hand.
- REMOVED `meeting-range` "Share meeting outcome", ADDED "Copy and send the meeting text" (two actions, Copy and Send, each with its own outcomes, no fallback).
- REMOVED `grid-view` "Share meeting from the meeting bar" (instant share, notices); ADDED "Share meeting opens the meeting share dialog". MODIFIED `grid-view`: "Meeting scenarios of the view contract" (share through the dialog), "Accessible meeting state" (axe with the dialog instead of the notice), "Grid layers stay under the page bars and dialogs" and "Approved screenshots with dialogs over the grid" (the meeting share dialog is one of the dialogs). ADDED `grid-view`: "Meeting share dialog", "Meeting share status", "Accessible meeting share dialog", "Meeting share dialog fits the screen".
- Glossary (`docs/glossary/`): new terms **Meeting share dialog**, **Meeting share status**, **Copy meeting text**, **Send meeting text** (time selection); changed **Share meeting** (opens the dialog; owners); removed **Meeting copied notice** and **Share failed notice** (app shell). `docs/architecture/views.md` (Meeting bar) follows.

### Capabilities

#### New Capabilities

_None._

#### Modified Capabilities

- `meeting-range`: "Share meeting outcome" removed, "Copy and send the meeting text" added.
- `grid-view`: "Share meeting from the meeting bar" removed and replaced by "Share meeting opens the meeting share dialog"; modified "Meeting scenarios of the view contract", "Accessible meeting state", "Grid layers stay under the page bars and dialogs", "Approved screenshots with dialogs over the grid"; added dialog, status, accessibility and layout requirements.

## Goals

- G1: The user sees the full meeting share text before it leaves the app, in 100% of shares.
- G2: The user can copy the text on every supported engine: by Copy, or by hand from the selected text when the clipboard fails.
- G3: Every outcome of Copy and Send is told inside the dialog, never in a notice behind the dialog's backdrop.

## Non-Goals

- NG1: No change of the meeting share text itself: content, order, wording, hour format and "no link" (Q8 of `docs/architecture/open-questions.md`) stay.
- NG2: No editing of the text in the dialog; it is read-only.
- NG3: No new sharing channel (link, calendar file, e-mail, `document.execCommand("copy")` fallback).
- NG4: No meeting share dialog in Cards: Cards show no meeting range (ADR-0011).
- NG5: No change of the meeting bar's layout, its Clear meeting button or the other notices.

## Users & Scenarios

- U1: A desktop user planning a call with Moscow and New York opens the dialog, reads the lines, presses Copy and pastes the text into a chat.
- U2: A phone user opens the dialog and presses Send to pass the text to a messenger through the system share sheet.
- U3: An iPhone 6 user on iOS Safari 12.5 presses Copy, the copy fails, and the selected text in the dialog is copied with the system's own Copy.

## Requirements

### Functional

- FR1: «Поделиться встречей» opens the meeting share dialog, titled «Поделиться встречей» ("Share meeting"). It shares and copies nothing by itself.
- FR2: The dialog shows the meeting share text of the current meeting range, exactly as `meeting-range` → "Share meeting text" builds it, in a read-only, selectable text field named «Текст встречи» ("Meeting text"). It shows every line without inner scrolling for a list of up to 10 locations.
- FR3: The dialog offers «Скопировать» ("Copy") on every engine. Copy puts exactly the meeting share text on the clipboard, and the meeting share status reads «Текст встречи скопирован» ("Meeting text copied"). The dialog stays open.
- FR4: When Copy fails, the meeting share status reads «Не удалось скопировать. Текст выделен — скопируйте его вручную» ("Could not copy. The text is selected — copy it by hand"), and the whole text in the field is selected with the focus on the field.
- FR5: Where the browser has a system share, the dialog also offers «Отправить» ("Send"); otherwise Send is not shown. Send hands exactly the meeting share text to the system share. When it is shared, the dialog closes and the focus returns to «Поделиться встречей». When the user closes the share sheet, nothing changes and no status is shown. When the system share fails for another reason, the meeting share status reads «Не удалось поделиться встречей» ("Could not share the meeting"), the dialog stays open and nothing is copied.
- FR6: The meeting share status is cleared by the next Copy or Send and by closing the dialog; a dialog opened again shows no status.
- FR7: «Закрыть» ("Close"), Esc and a press on the backdrop close the dialog and return the focus to «Поделиться встречей». If the meeting bar goes away while the dialog is open (the meeting range is removed or the Grid view shows no rows, for example by a list change from another tab), the dialog closes with it.
- FR8: The copied notice and the share failed notice no longer exist in the notices region; Share meeting leaves no notice.
- FR9: The glossary and `docs/architecture/views.md` name the dialog, the status and the two actions with the terms of this change, and no longer name the removed notices.

### Non-Functional

#### Performance

- NFR-P1: The initial JavaScript stays within its gzipped budget: `pnpm check:bundle-size` passes after `pnpm run build`.

#### Accessibility

- NFR-A1: axe-core reports no violations with the dialog open in the light and the dark theme, before and after a meeting share status appears.
- NFR-A2: The dialog is a modal `dialog` named by its title. On opening, the focus is on Copy. Tab and Shift+Tab stay inside the dialog, in the cyclic order: Close (at the top), text field, Copy, Send (where shown). Every button has a target of at least 44 × 44 px and a visible focus ring in the accent colour.
- NFR-A3: The meeting share status is announced politely (`role="status"`) and never takes the focus itself (FR4 moves the focus to the field, not to the status).

#### Responsive

- NFR-R1: At 320 × 640, 390 × 844 and 1440 × 900 the dialog with the sample meeting is fully inside the viewport, every line of the text is visible, and neither the page nor the dialog scrolls horizontally.
- NFR-R2: Screenshots of the dialog over the Grid view with the design's sample data match their approved baselines at 390 × 844 and 1440 × 900 (light theme).

## UX Acceptance Criteria

- UX1: The dialog follows the look of the built dialogs (`DialogContent`: full screen below `sm`, centred from `sm`; title and Close at the top as in the calendar dialog). Copy is the primary action in the meeting colour, Send next to it.
- UX2: The text field uses the app's body font, keeps the line breaks exactly as they will be sent, shows each line of the sample meeting on one visual line from 640 px wide (below that a long line may wrap on screen, the text itself is unchanged), and shows no resize handle.
- UX3: A human confirms once that the dialog screenshots look right next to the meeting screens of `docs/design/screens/` (H1).

## UI States Matrix

The dialog loads nothing: the text is built synchronously from the state.

| Network | Data | UI |
|---|---|---|
| online or offline | meeting range set, rows shown | Share meeting opens the dialog with the text (FR1, FR2); offline changes nothing, sharing needs no network |
| online or offline | Copy succeeded | status «Текст встречи скопирован» (FR3) |
| online or offline | Copy failed (no clipboard, denied) | error status, text selected for manual copy (FR4) |
| online or offline | no system share | Send is not shown (FR5) |
| online or offline | system share failed | error status «Не удалось поделиться встречей», Copy still offered (FR5) |
| online or offline | no meeting range or no rows (empty list, load error, loading) | no meeting bar, so no Share meeting and no dialog; an open dialog closes (FR7) |

Loading: none, the dialog renders in the same frame. Empty: covered by the last row.

## Behavior

- `packages/client/src/test/features/grid_view/grid_view_meeting_share_unit.feature` and `grid_view_meeting_share_e2e.feature` (rewritten), `meeting_range/meeting_range_share.feature` (outcomes), `grid_view_meeting_contract_e2e.feature`, `grid_view_layers_e2e.feature`; scenarios tagged `@add-meeting-share-dialog`.

## Visual Reference

No design screen shows the dialog. It reuses `DialogContent` and the design tokens (`packages/client/src/styles/tokens.css`); the meeting screens of `docs/design/screens/grid-*-meeting-*.html` give the meeting colour.

## Affected IA

No changes.

## Success Metrics

- M1: In 100% of the unit and E2E share scenarios (English sample meeting, 5 lines), the dialog's field, the clipboard after Copy and the text handed to Send equal the meeting share text character for character.
- M2: 0 notices of the notices region appear in any share scenario; `grep -rn "copiedNotice\|shareFailedNotice\|MeetingShareNotice" packages/client/src` prints nothing.
- M3: 0 axe-core violations in the 4 dialog checks (light and dark, without and with a status).
- M4: Sharing the meeting takes exactly 2 activations: Share meeting, then Copy or Send.
- M5: Scoped Stryker on the changed production files scores ≥ 95% (minimum 90%).

## Open Questions

_None._ The decisions are in `design.md`.
