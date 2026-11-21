# Design: Add the meeting share dialog

## Context

Driven by FR1–FR8, NFR-A1–NFR-A3, NFR-R1 and UX1–UX2 of `proposal.md`. Today (checked in `packages/client/src/`):

- `ports/textSharing.ts`: `TextSharing.shareText(text)` returns a `ShareOutcome` (`SHARED`, `CANCELLED`, `COPIED`, `FAILED`); the share falls back to copying inside the adapter (`adapters/browserTextSharing.ts`, `createBrowserTextSharing(navigatorLike)`; stand-in `adapters/inMemoryTextSharing.ts`; contract `adapters/textSharing.contract.ts`, run by `adapters/textSharing.test.ts`).
- `controller/useMeetingShare.ts` builds the text with `presentMeetingShareText` and `formatMeetingDuration`, calls the port and keeps a `MeetingShareNotice` (`COPIED`, `FAILED`) that the notices region shows (`app/MeetingShareNotice.tsx`, `app/AppShellNotices.tsx`, `app/LazyAppShellNotices.tsx`, `app/hasShownNotice.ts` with `isShareNoticeDue`).
- `views/shared/MeetingBar.tsx` renders Share meeting as a plain button calling `onShare`; `app/AppShell.tsx` wires `useMeetingShare(textSharing)` into it.
- `components/ui/dialog.tsx` (`Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogClose`, Radix) is the one modal primitive, with the `z-dialog` layer; `views/shared/CalendarDialog.tsx` shows the pattern (title and Close at the top, `iconButtonClassName`, `aria-describedby={undefined}`, `onOpenAutoFocus`).
- No Storybook is set up (no `.storybook/`, no `*.stories.tsx`), so UI states are covered by Vitest component tests, BDD and Playwright screenshots, as in earlier changes.

Glossary owners touched: **Share meeting** (`useMeetingShare`, `TextSharing`), **Meeting share text** (`presentMeetingShareText`, unchanged), **Meeting bar** (`MeetingBar`), **Meeting copied notice** / **Share failed notice** (`MeetingShareNotice`, removed). No second owner is introduced.

## Decisions

### D1. The port separates Copy and Send

`TextSharing` becomes three methods:

```ts
interface TextSharing {
  canShareText(): boolean;                 // reads the browser on every call
  shareText(text: string): Promise<ShareOutcome>; // SHARED | CANCELLED | FAILED
  copyText(text: string): Promise<ShareOutcome>;  // COPIED | FAILED
}
```

`ShareOutcome` keeps its four members. `createBrowserTextSharing` drops the fallback from share to copy: a missing `navigator.share` or a non-abort rejection is `FAILED`; `copyText` is today's private `copyText` made public. `canShareText()` is `navigatorLike.share !== undefined`. `browserTextSharing` keeps reading `navigator` on each call. `createInMemoryTextSharing` keeps its options (`canShare`, `isCancelled`, `isShareFailing`, `canCopy`) and records `sharedTexts` (also for a cancelled or failed share, which still received the text) and `copiedTexts`. The contract suite is rewritten to the `meeting-range` "Copy and send the meeting text" scenarios, with `SharingBehaviour` members for each row.

Driven by FR3, FR5 (no fallback: Copy is beside Send).

### D2. The controller owns the text, the actions and the status

`useMeetingShare(textSharing = browserTextSharing)` stays the one owner and returns:

- `meetingShareText: string | undefined` — built from the state exactly as today (the loop over `rows` and `meeting.rowRanges`, `presentMeetingShareText`), memoized on its inputs; `undefined` without a meeting range;
- `canSendMeetingText: boolean` — `textSharing.canShareText()` read on each render;
- `copyMeetingText(): Promise<ShareOutcome>` and `sendMeetingText(): Promise<ShareOutcome>` — clear the status, call the port, set the status, return the outcome;
- `shareStatus: MeetingShareStatus | undefined` and `clearShareStatus()`.

`MeetingShareStatus` (`COPIED`, `COPY_FAILED`, `SEND_FAILED`) replaces `MeetingShareNotice` in `controller/useMeetingShare.ts`; mapping: copy `COPIED` → `COPIED`, copy `FAILED` → `COPY_FAILED`, send `FAILED` → `SEND_FAILED`, `SHARED`/`CANCELLED` → none. The effect that clears the status on a changed or cleared meeting range stays. If the file grows past 200 lines, the text building moves to `controller/meetingShareRows.ts` (internal, not exported from `controller/index.ts`).

Driven by FR2–FR6. Alternative: status as view state in the dialog — rejected, the outcome is the result of a side effect and the controller already owns it; the view keeps only open/closed and focus.

### D3. `MeetingShareDialog` in `views/shared/`, triggered by the meeting bar

New `views/shared/MeetingShareDialog.tsx`, exported from `views/shared/index.ts`. `MeetingBar` replaces its `onShare` prop by `share: MeetingShareDialogModel` (the return of `useMeetingShare` minus nothing view-irrelevant: `meetingShareText`, `canSendMeetingText`, `copyMeetingText`, `sendMeetingText`, `shareStatus`, `clearShareStatus`) and renders the Share meeting button as the `DialogTrigger asChild` of `MeetingShareDialog`, so Radix returns the focus to it on every close (FR7, NFR-A2). The open state is local `useState` of the dialog. Closing (`onOpenChange(false)`) calls `clearShareStatus()` (FR6). `sendMeetingText()` resolving to `SHARED` sets the dialog closed. When the meeting bar unmounts (no range or no rows), the dialog unmounts with it (FR7); no extra code.

DOM and Tab order (NFR-A2): header row with `DialogTitle` («Поделиться встречей», key `meeting.share`) and `DialogClose` (`locations.close`, the calendar's `iconButtonClassName`), then the text field, then the actions row Copy, Send, then the status. `onOpenAutoFocus` prevents the default and focuses Copy through a ref. `DialogContent` gets `aria-describedby={undefined}`.

Look (UX1): Copy has `text-meeting-text`, a 1 px `border-meeting` border, `font-semibold`, `min-h-11 px-4 rounded-md`; Send the same with `text-foreground border-control-border`. `text-meeting-text` on `bg-surface` (#008800 on the light surface, #5EDB5E on the dark) keeps AA contrast, while white on `meeting` (#00AA00) would not. Focus ring `focus-visible:outline-accent` as everywhere.

### D4. The text field is a read-only textbox that grows with its text

The field is a `div` with `role="textbox"`, `aria-readonly="true"`, `aria-multiline="true"`, `aria-label` from `meeting.shareTextLabel`, `tabIndex={0}`, classes `whitespace-pre-wrap sm:whitespace-pre break-words rounded-md border border-control-border p-3 font-sans select-text`. It holds the text as one text node, so its height follows the lines (no inner scrolling, no resize handle, no inline style) and the dialog's own `overflow-y-auto` handles extreme lists. On a copy that resolves to `FAILED`, the dialog focuses the field and selects its contents with `window.getSelection()?.selectAllChildren(field)` (FR4); the Selection API exists on every supported engine including iOS Safari 12.5.

Driven by FR2, FR4, UX2, NFR-R1. Alternative: `<textarea readOnly>` — rejected: its height needs `rows` plus a measured height for wrapped lines below 640 px (an inline style or `field-sizing`, which iOS 12 lacks).

### D5. The status line

Under the actions, a `<p role="status">` always present while the dialog is open (so the live region exists before it changes) and empty without a status; text from `meeting.copiedStatus`, `meeting.copyFailedStatus`, `meeting.sendFailedStatus` by a `Record<MeetingShareStatus, string>` of keys. `COPY_FAILED` and `SEND_FAILED` in `text-danger`, `COPIED` in `text-meeting-text`. It never receives focus (NFR-A3).

### D6. Notices and keys removed

`app/MeetingShareNotice.tsx` is deleted; `shareNotice` / `onDismissShareNotice` leave `AppShellNotices`, `LazyAppShellNotices`, `AppShell` and `NoticeConditions` / `DueNotices` (`isShareNoticeDue`) of `app/hasShownNotice.ts`. Locale keys `meeting.copiedNotice` and `meeting.shareFailedNotice` are replaced in both `locales/ru.json` and `locales/en.json` by:

| key | ru | en |
|---|---|---|
| `meeting.shareTextLabel` | Текст встречи | Meeting text |
| `meeting.copy` | Скопировать | Copy |
| `meeting.send` | Отправить | Send |
| `meeting.copiedStatus` | Текст встречи скопирован | Meeting text copied |
| `meeting.copyFailedStatus` | Не удалось скопировать. Текст выделен — скопируйте его вручную | Could not copy. The text is selected — copy it by hand |
| `meeting.sendFailedStatus` | Не удалось поделиться встречей | Could not share the meeting |

Driven by FR8.

### D7. Tests by runner

- jsdom (Vitest, unit BDD): port contract (D1), the hook (D2), the dialog component (open, actions, statuses, close on `SHARED`, status cleared on close, selection on a failed copy via `window.getSelection()`), the app wiring (`gridViewWorld.tsx`) and the cross-tab close.
- Real browser (`*_e2e.feature`): focus on open, Tab cycle, Esc and focus return, accessible names, `role="status"`, axe-core (NFR-A1–A3), layout and line count (NFR-R1, UX2), layers under the dialog and screenshots (NFR-R2), the real clipboard and the stubbed `navigator.share`.

## Consequences

Positive:
- The user sees and controls what leaves the app; a failed copy leaves the text ready for a manual copy.
- The notices region loses one kind of notice and its lazy-chunk condition.
- One owner per concept stays: the text in `presentMeetingShareText`, the browser access in the `TextSharing` adapter, the state in `useMeetingShare`.

Negative:
- One more activation to share (M4: two instead of one).
- Every existing share scenario and its steps change.

## Alternatives Considered

**Keep the instant share and add a "Preview" button**: two ways to share and a crowded meeting bar on 320 px.

**Show the outcome in the notices region behind the dialog**: the region lies under `z-dialog`, so the notice would be covered by the backdrop.

**Fall back from Send to Copy as before**: hides a failure behind a different action; Copy is one tap away in the dialog.
