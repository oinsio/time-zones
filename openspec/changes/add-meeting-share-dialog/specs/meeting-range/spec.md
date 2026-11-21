## REMOVED Requirements

### Requirement: Share meeting outcome
**Reason**: Share meeting no longer shares at once with a fallback to the clipboard: Copy and Send are two separate actions of the meeting share dialog, and Send no longer falls back to copying (FR3, FR5 of add-meeting-share-dialog).
**Migration**: Replaced by "Copy and send the meeting text" below and by `grid-view` → "Meeting share dialog".

## ADDED Requirements

### Requirement: Copy and send the meeting text
Share meeting SHALL offer two actions on the meeting share text: Copy meeting text and, only where the browser can share text, Send meeting text. Copy MUST put exactly the text on the clipboard; the outcome is "copied", or "failed" when the clipboard is missing or refuses the text. Send MUST hand exactly the text to the system share; the outcome is "shared"; if the user closes the share sheet the outcome is "cancelled" and nothing more happens; if the system share fails for any other reason the outcome is "failed" and nothing is copied. Neither action falls back to the other. Whether the browser can share MUST be read from the browser each time it is asked, never stored. Sharing needs no network. <!-- implements FR3, FR4, FR5 of add-meeting-share-dialog -->

#### Scenario: Outcomes of Copy
- **GIVEN** the sample meeting
- **WHEN** the user copies the meeting text and the browser `<behaves>`
- **THEN** the outcome is `<outcome>`
- **AND** the clipboard holds `<clipboard>`

| behaves | outcome | clipboard |
|---|---|---|
| has a clipboard | copied | the meeting share text |
| has no clipboard | failed | nothing |
| refuses to write to the clipboard | failed | nothing |

#### Scenario: Outcomes of Send
- **GIVEN** the sample meeting
- **WHEN** the user sends the meeting text and the browser `<behaves>`
- **THEN** the outcome is `<outcome>`
- **AND** the system share received `<shared>` and the clipboard holds nothing

| behaves | outcome | shared |
|---|---|---|
| shares the text | shared | the meeting share text |
| reports that the user closed the sheet | cancelled | the meeting share text |
| fails to share for another reason | failed | the meeting share text |

#### Scenario: Send is offered only where the browser can share
- **GIVEN** a browser `<has>` a system share
- **WHEN** the app asks whether the meeting text can be sent
- **THEN** the answer is `<answer>`

| has | answer |
|---|---|
| with | yes |
| without | no |
