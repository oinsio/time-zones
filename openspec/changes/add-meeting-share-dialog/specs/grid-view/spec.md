## REMOVED Requirements

### Requirement: Share meeting from the meeting bar
**Reason**: «Поделиться встречей» no longer shares or copies at once and no longer leaves the copied notice or the share failed notice in the notices region (FR1, FR8 of add-meeting-share-dialog).
**Migration**: Replaced by "Share meeting opens the meeting share dialog", "Meeting share dialog" and "Meeting share status" below; the outcomes are `meeting-range` → "Copy and send the meeting text".

## MODIFIED Requirements

### Requirement: Meeting scenarios of the view contract
The Grid view SHALL pass the meeting scenarios of the view contract in a real browser: set a meeting range (tap, drag, Enter), resize it (handle drag and handle keys), share it (Copy in the meeting share dialog) and clear it (Clear meeting and Now). A view that does not show the meeting range (Cards, NG4) is not held to these scenarios. <!-- implements FR17 of add-grid-meeting-range-and-share; FR3 of add-meeting-share-dialog -->

#### Scenario: Set, resize, share and clear
- **GIVEN** the Grid view with Almaty and Moscow at `2026-03-08T07:30:00Z` in a browser without a system share
- **WHEN** the user taps column 9 of Almaty, presses Page Up on «Конец встречи», shares the meeting, copies its text in the meeting share dialog, closes the dialog and clears the meeting
- **THEN** the meeting was 09:00–10:00, then 09:00–11:00, the clipboard held its text, and after Clear the hour frame is back


### Requirement: Accessible meeting state
With a meeting range set, axe-core SHALL report no violations on the Grid view in the light and the dark theme, with a meeting range input open and with its error shown. The Tab order MUST be: «Поделиться встречей», «Сбросить выбор встречи», then for each row its span button and its hour strip, then the meeting handles «Начало встречи», «Конец встречи»; no location menu button MUST be a Tab stop, and the grab area is never one. While a row's meeting range input is open, its fields «Время начала — {city}» and «Время окончания — {city}» MUST take the place of that row's span button in the Tab order, start before end, followed by that row's hour strip and so before the meeting handles. After Clear meeting the location menu buttons MUST be Tab stops again. The fields of the meeting range input MUST have accessible names, and a field with an error MUST be `aria-invalid` and described by its error. <!-- implements NFR-A1, NFR-A2 of add-grid-meeting-range-and-share; NFR-A1, NFR-A2 of fix-grid-meeting-range-lock-and-layering; FR15, NFR-A3 of redesign-cards-grid-and-day-palettes; FR8 of add-meeting-share-dialog -->

#### Scenario: No accessibility violations in the meeting state
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York and the sample meeting in the `<theme>` theme
- **WHEN** axe-core checks the page
- **THEN** it reports no violations

| theme |
|---|
| light |
| dark |

#### Scenario: No accessibility violations with the meeting range input
- **GIVEN** the sample meeting in the `<theme>` theme and Moscow's meeting range input open
- **WHEN** axe-core checks the page, before and after the text error appears
- **THEN** it reports no violations

| theme |
|---|
| light |
| dark |

#### Scenario: Tab order skips the locked controls
- **GIVEN** the Grid view with Almaty and Moscow and the sample meeting
- **WHEN** the user presses Tab from the page start through the panel
- **THEN** the focus visits «Поделиться встречей», «Сбросить выбор встречи», Almaty's span, Almaty's hour strip, Moscow's span, Moscow's hour strip, the meeting handles «Начало встречи» and «Конец встречи» in this order
- **WHEN** the user clears the meeting range and presses Tab through the panel
- **THEN** each row's location menu button is a Tab stop again

#### Scenario: The open input's fields sit in place of the span in the Tab order
- **GIVEN** the Grid view with Almaty and Moscow, the sample meeting and Almaty's meeting range input open with the focus in «Время начала — Almaty»
- **WHEN** the user presses Tab three times without changing a text
- **THEN** the focus visits «Время окончания — Almaty», Almaty's hour strip and Moscow's span in this order
- **AND** Almaty's input is closed and the meeting range is still 09:00–11:00

#### Scenario: The keyboard alone sets the meeting
- **GIVEN** the Grid view with Almaty and Moscow, Russian interface, and the sample meeting
- **WHEN** the user tabs to Moscow's span, presses Enter, types `8`, presses Tab, types `10:30` and presses Enter
- **THEN** the title is «Встреча · 2 ч 30 мин» and the focus is on Moscow's span

#### Scenario: The open input fits on a phone
- **GIVEN** the sample meeting at `<width>` by `<height>` px
- **WHEN** the user opens Moscow's meeting range input
- **THEN** both fields are fully inside the viewport and the page does not scroll horizontally

| width | height |
|---|---|
| 320 | 640 |
| 390 | 844 |

### Requirement: Grid layers stay under the page bars and dialogs
Everything of the grid panel — the row header texts, the hour strips, the row notes, the hour frame, the meeting frame and the meeting handles — SHALL lie below the date bar, the notices region above it, and every dialog of the main page (the search, opened from Add location without a meeting range, the calendar, in any state, and the meeting share dialog, opened from Share meeting) with its backdrop, in every state of the Grid view and at every scroll position of the page and of the strips. An open location menu MUST still lie above the date bar and the grid panel. <!-- implements FR6, FR7 of fix-grid-meeting-range-lock-and-layering; FR1 of add-meeting-share-dialog -->

#### Scenario: Dialogs cover the grid
- **GIVEN** the Grid view at 390 by 844 px with Almaty, Moscow, Kolkata and New York and `<state>`
- **WHEN** the user opens `<dialog>`
- **THEN** at the centre of every row header text, hour cell and meeting handle under the dialog's backdrop, the topmost element belongs to the dialog or its backdrop

| state | dialog |
|---|---|
| the hour frame | the search |
| the hour frame | the calendar |
| the meeting range 09:00–11:00 | the calendar |
| the meeting range 09:00–11:00 | the meeting share dialog |

#### Scenario: Rows scroll under the date bar
- **GIVEN** the Grid view at 390 by 844 px with 12 locations and the meeting range 09:00–11:00
- **WHEN** the page is scrolled so that rows pass under the date bar
- **THEN** the topmost element at the centre of the calendar button and of the Now button is that button
- **AND** no point of the date bar has a grid element on top

#### Scenario: An open location menu lies above the date bar
- **GIVEN** the Grid view at 390 by 844 px with 12 locations and no meeting range
- **AND** the page is scrolled so that a row's location menu button lies just above the date bar
- **WHEN** the user opens that row's location menu
- **THEN** at the centre of every menu item that lies over the date bar, the topmost element is that menu item

### Requirement: Approved screenshots with dialogs over the grid
Screenshots of the Grid view with the design's sample data (8 March 2026, home Almaty, Almaty, Moscow, Kolkata, New York, Russian interface, light theme) SHALL match their approved baselines on every run: with the hour frame and the search dialog open at 390 × 844, with the meeting range 09:00–11:00 in Almaty and the calendar dialog open at 1440 × 900, and with the same meeting range and the meeting share dialog open at 390 × 844 and at 1440 × 900. <!-- implements NFR-R2 of fix-grid-meeting-range-lock-and-layering; NFR-R2 of add-meeting-share-dialog -->

#### Scenario: Approved screenshots with a dialog open
- **GIVEN** the sample data with `<state>`
- **WHEN** the main page is `<width>` by `<height>` px and `<dialog>` is open
- **THEN** the page matches the approved screenshot

| width | height | state | dialog |
|---|---|---|---|
| 390 | 844 | the hour frame | the search |
| 1440 | 900 | the meeting range 09:00–11:00 | the calendar |
| 390 | 844 | the meeting range 09:00–11:00 | the meeting share dialog |
| 1440 | 900 | the meeting range 09:00–11:00 | the meeting share dialog |


## ADDED Requirements

### Requirement: Share meeting opens the meeting share dialog
«Поделиться встречей» SHALL open the meeting share dialog ("Meeting share dialog") and MUST NOT share or copy anything by itself. Share meeting MUST leave no notice in the notices region: the outcomes of Copy and Send are told by the meeting share status inside the dialog ("Meeting share status"). <!-- implements FR15, NFR-A2 of add-grid-meeting-range-and-share; FR1, FR8 of add-meeting-share-dialog -->

#### Scenario: Share meeting opens the dialog
- **GIVEN** a browser with a system share and the Grid view with the sample meeting
- **WHEN** the user chooses «Поделиться встречей»
- **THEN** the meeting share dialog is open
- **AND** the system share received nothing, the clipboard holds nothing and no notice is shown


### Requirement: Meeting share dialog
The meeting share dialog SHALL be a modal dialog titled «Поделиться встречей» ("Share meeting"). It MUST show the meeting share text of the current meeting range (`meeting-range` → "Share meeting text") in a read-only, selectable text field named «Текст встречи» ("Meeting text"), with the text's line breaks and without inner scrolling for up to 10 locations. Below the field it MUST offer «Скопировать» ("Copy") on every engine and «Отправить» ("Send") only where the browser can share text (`meeting-range` → "Copy and send the meeting text"), then «Закрыть» ("Close") at the top as in the calendar dialog. Copy MUST copy the text and keep the dialog open. Send MUST hand the text to the system share; the outcome "shared" MUST close the dialog and return the focus to «Поделиться встречей», the outcome "cancelled" changes nothing, the outcome "failed" keeps the dialog open. «Закрыть», Esc and a press on the backdrop MUST close the dialog and return the focus to «Поделиться встречей». While it is open, the dialog MUST follow the state: when the meeting bar goes away (the meeting range is removed or the Grid view shows no rows), the dialog MUST close with it. Inputs: the presented meeting share text and whether the browser can share. Output: the dialog. Errors: none; the outcomes "failed" are told by the meeting share status. <!-- implements FR1, FR2, FR3, FR5, FR7 of add-meeting-share-dialog -->

#### Scenario: The dialog shows the text to be sent
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York, English interface, and the sample meeting
- **WHEN** the user opens the meeting share dialog
- **THEN** the field "Meeting text" holds exactly these lines and is read-only:

| line |
|---|
| Meeting on Sunday, March 8, 2026, 2 h |
| Almaty: 09:00–11:00 |
| Moscow: 07:00–09:00 |
| Kolkata: 09:30–11:30 |
| New York: 23:00–01:00 (a day earlier, Sat, Mar 7) |

#### Scenario: Actions offered by the browser
- **GIVEN** a browser `<has>` a system share and the sample meeting
- **WHEN** the user opens the meeting share dialog
- **THEN** it offers `<actions>`

| has | actions |
|---|---|
| with | «Скопировать», «Отправить» and «Закрыть» |
| without | «Скопировать» and «Закрыть» |

#### Scenario: Copy keeps the dialog open
- **GIVEN** a browser with a clipboard and the meeting share dialog open
- **WHEN** the user chooses «Скопировать»
- **THEN** the clipboard holds the meeting share text and the dialog is still open

#### Scenario: Send closes the dialog when shared
- **GIVEN** a browser with a system share and the meeting share dialog open
- **WHEN** the user chooses «Отправить» and the system share takes the text
- **THEN** the system share received the meeting share text, the dialog is closed and the clipboard holds nothing

#### Scenario: Closing the share sheet keeps the dialog
- **GIVEN** a browser whose system share reports that the user closed the sheet, and the meeting share dialog open
- **WHEN** the user chooses «Отправить»
- **THEN** the dialog is still open and shows no meeting share status

#### Scenario: The dialog closes with the meeting bar
- **GIVEN** the meeting share dialog open over the sample meeting
- **WHEN** every location of the list is removed in another tab
- **THEN** the dialog is closed, the meeting bar is gone and the empty state is shown

### Requirement: Meeting share status
The meeting share dialog SHALL tell the outcome of its last Copy or Send in one meeting share status line under its actions: «Текст встречи скопирован» ("Meeting text copied") after a copy; «Не удалось скопировать. Текст выделен — скопируйте его вручную» ("Could not copy. The text is selected — copy it by hand") after a failed copy, and then the whole text of the field MUST be selected with the focus on the field; «Не удалось поделиться встречей» ("Could not share the meeting") after a failed send. The outcomes "shared" and "cancelled" show no status. The status MUST be replaced by the next Copy or Send and MUST be gone when the dialog is opened again. Both languages MUST have every status. <!-- implements FR3, FR4, FR5, FR6 of add-meeting-share-dialog -->

#### Scenario: Status of each outcome
- **GIVEN** the meeting share dialog open over the sample meeting, Russian interface, in a browser that `<behaves>`
- **WHEN** the user chooses `<action>`
- **THEN** the meeting share status reads `<status>`

| behaves | action | status |
|---|---|---|
| has a clipboard | «Скопировать» | «Текст встречи скопирован» |
| has no clipboard | «Скопировать» | «Не удалось скопировать. Текст выделен — скопируйте его вручную» |
| refuses to write to the clipboard | «Скопировать» | «Не удалось скопировать. Текст выделен — скопируйте его вручную» |
| fails to share for another reason | «Отправить» | «Не удалось поделиться встречей» |

#### Scenario: A failed copy selects the text
- **GIVEN** a browser without a clipboard and the meeting share dialog open
- **WHEN** the user chooses «Скопировать»
- **THEN** the field «Текст встречи» has the focus and its whole text is selected

#### Scenario: A reopened dialog shows no status
- **GIVEN** a browser with a clipboard, the meeting share dialog open and the status «Текст встречи скопирован» shown
- **WHEN** the user closes the dialog and opens it again
- **THEN** the dialog shows no meeting share status

### Requirement: Accessible meeting share dialog
The meeting share dialog SHALL be a modal `dialog` whose accessible name is its title. On opening, the focus MUST be on «Скопировать». Tab and Shift+Tab MUST stay inside the dialog and visit, in this cyclic order: «Закрыть», «Текст встречи», «Скопировать», «Отправить» where it is offered, and back to «Закрыть». Every button MUST have a target of at least 44 × 44 px and a visible focus ring in the accent colour. The meeting share status MUST be a polite live region (`role="status"`) that never takes the focus. axe-core MUST report no violations with the dialog open in the light and the dark theme, before and after a meeting share status appears. <!-- implements NFR-A1, NFR-A2, NFR-A3 of add-meeting-share-dialog -->

#### Scenario: Focus and Tab order in the dialog
- **GIVEN** a browser with a system share and the Grid view with the sample meeting
- **WHEN** the user opens the meeting share dialog with the keyboard
- **THEN** the focus is on «Скопировать»
- **AND** pressing Tab from there visits «Отправить», «Закрыть», «Текст встречи» and «Скопировать» in this order

#### Scenario: Esc returns the focus to Share meeting
- **GIVEN** the meeting share dialog open
- **WHEN** the user presses Esc
- **THEN** the dialog is closed and the focus is on «Поделиться встречей»

#### Scenario: No accessibility violations with the dialog open
- **GIVEN** a browser without a system share, the sample meeting and the `<theme>` theme
- **WHEN** the user opens the meeting share dialog and axe-core checks the page, before and after copying the text
- **THEN** it reports no violations and the status «Текст встречи скопирован» is in a `status` region

| theme |
|---|
| light |
| dark |

### Requirement: Meeting share dialog fits the screen
With the sample meeting, the meeting share dialog SHALL lie fully inside the viewport, show every line of the text without inner scrolling, and neither the page nor the dialog MUST scroll horizontally. From 640 px wide each line of the sample text MUST take one visual line in the field; below that, a long line may wrap on screen while the text itself is unchanged. The field MUST show no resize handle. <!-- implements NFR-R1, UX2 of add-meeting-share-dialog -->

#### Scenario: The dialog fits
- **GIVEN** the sample meeting, Russian interface, at `<width>` by `<height>` px
- **WHEN** the user opens the meeting share dialog
- **THEN** the dialog and all its buttons are inside the viewport, the field shows all 5 lines without scrolling and nothing scrolls horizontally

| width | height |
|---|---|
| 320 | 640 |
| 390 | 844 |
| 1440 | 900 |

#### Scenario: One line per text line on a wide screen
- **GIVEN** the sample meeting, Russian interface, at 1440 by 900 px
- **WHEN** the user opens the meeting share dialog
- **THEN** the field's content height equals 5 line heights
