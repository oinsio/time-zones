## MODIFIED Requirements

### Requirement: Share meeting from the meeting bar
«Поделиться встречей» SHALL open the share dialog (`meeting-share-dialog`) and MUST NOT share or copy anything by itself. A share made in the dialog follows `meeting-range` → "Share meeting text" and "Share meeting outcome". The outcome "copied" MUST show the copied notice «Текст встречи скопирован» ("Meeting text copied") and the outcome "failed" the share failed notice «Не удалось поделиться встречей» ("Could not share the meeting") in the notices region, announced politely and never taking the focus; the outcomes "shared" and "cancelled" show nothing. A notice MUST disappear on its Dismiss button, on Esc, on the next opening of the share dialog, on a change of the meeting range and when the range is cleared. <!-- implements FR15, NFR-A2 of add-grid-meeting-range-and-share; FR1, FR9 of add-meeting-share-dialog -->

#### Scenario: Share meeting opens the share dialog
- **GIVEN** the Grid view with the sample meeting
- **WHEN** the user chooses «Поделиться встречей»
- **THEN** the share dialog is open
- **AND** the system share has received nothing and the clipboard is unchanged

#### Scenario: Share where the browser can share
- **GIVEN** a browser with a system share and the share dialog open for the sample meeting
- **WHEN** the user chooses «Поделиться» in the dialog
- **THEN** the system share receives the meeting share text and no notice is shown

#### Scenario: Closing the share sheet
- **GIVEN** a browser whose system share reports that the user closed the sheet and the share dialog open for the sample meeting
- **WHEN** the user chooses «Поделиться» in the dialog
- **THEN** the share dialog stays open and no notice is shown

#### Scenario: Copy where the browser cannot share
- **GIVEN** a browser without a system share and the share dialog open for the sample meeting
- **WHEN** the user chooses «Поделиться» in the dialog
- **THEN** the clipboard holds the meeting share text
- **AND** the share dialog is closed and the notice «Текст встречи скопирован» is shown

#### Scenario: Neither share nor clipboard
- **GIVEN** a browser without a system share and without clipboard access and the share dialog open for the sample meeting
- **WHEN** the user chooses «Поделиться» in the dialog
- **THEN** the share dialog is closed and the notice «Не удалось поделиться встречей» is shown

#### Scenario: Opening the dialog again removes the notice
- **GIVEN** the notice «Текст встречи скопирован» is shown
- **WHEN** the user chooses «Поделиться встречей»
- **THEN** the notice is gone and the share dialog is open
