## MODIFIED Requirements

### Requirement: Share dialog opens and closes
While a meeting range is set, Share meeting SHALL open the share dialog: a modal dialog titled with the meeting bar's title («Встреча · 2 ч») and, under it, the reference line: the full date of the start in the reference zone and the city of the reference zone, in the interface language. That city is the city label of the home location when home is set; with no home it is the exemplar city of the device time zone, the label the device time location shows (while the city data loads, the city name derived from the zone id, «Almaty» for `Asia/Almaty`). The dialog MUST close on its close button «Закрыть», on Esc and on a share whose outcome is shared, copied or failed. Closing with the close button, with Esc or after the outcome copied or failed changes neither the meeting range nor the location list. A share whose outcome is shared also clears the meeting range, as "A shared meeting clears the meeting range" says; it never changes the location list. With no meeting range the dialog cannot be opened. Inputs: the meeting range, the location list, the preferences. Output: the open dialog with its defaults. <!-- implements FR1, FR9 of add-meeting-share-dialog; FR5, FR7 of keep-location-menu-in-view-and-clear-range-after-share -->

#### Scenario: The dialog opens with its defaults
- **WHEN** the user chooses «Поделиться встречей»
- **THEN** the share dialog is open with the title «Встреча · 2 ч» and the line «воскресенье, 8 марта 2026 г. · по времени Алматы»
- **AND** every location is ticked, the share language is Русский, no share language is pinned, and the share zone label shows the zone abbreviation and the UTC offset

#### Scenario: The reference line without a home location
- **GIVEN** no home location is set and the list is Moscow, Kolkata and New York, so the reference zone is the device time zone `Asia/Almaty`
- **WHEN** the user chooses «Поделиться встречей»
- **THEN** the line under the title is «воскресенье, 8 марта 2026 г. · по времени Алматы»
- **AND** it stays in Russian when the user chooses English as the share language

#### Scenario: Closing keeps the meeting
- **GIVEN** the share dialog is open
- **WHEN** the user closes it with `<way>`
- **THEN** the dialog is closed, the meeting range is 09:00–11:00 in Almaty and nothing was shared or copied

| way |
|---|
| the close button |
| Esc |

### Requirement: Share from the share dialog
The share dialog SHALL offer one button per share destination that is available on the device; today that is one button, «Поделиться» ("Share"), with the Lucide `Share2` icon. Activating it hands the previewed text to that destination. The outcomes shared, copied and failed MUST close the dialog. The outcomes copied and failed MUST keep the meeting range and return the focus to Share meeting. The outcome shared MUST clear the meeting range and put the focus on Add location, as "A shared meeting clears the meeting range" says. The outcome cancelled MUST keep the dialog open with its ticks, its share language and its share zone label unchanged. The notices follow `grid-view` → "Share meeting from the meeting bar". Sharing needs no network. Errors: none beyond the outcomes. <!-- implements FR9, FR11, UX5 of add-meeting-share-dialog; FR5, FR6, FR7 of keep-location-menu-in-view-and-clear-range-after-share -->

#### Scenario: Outcomes of a share from the dialog
- **GIVEN** the share dialog is open for the meeting range 09:00–11:00 in Almaty with Kolkata unticked
- **WHEN** the user chooses «Поделиться» and the browser `<behaves>`
- **THEN** the dialog is `<dialog>`, the notice is `<notice>`, the meeting range is `<range>` and no confirmation dialog is open

| behaves | dialog | notice | range |
|---|---|---|---|
| shares the text | closed | none | none |
| reports that the user closed the sheet | open, Kolkata still unticked | none | 09:00–11:00 |
| has no system share | closed | «Текст встречи скопирован» | 09:00–11:00 |
| has neither share nor clipboard | closed | «Не удалось поделиться встречей» | 09:00–11:00 |

### Requirement: Accessible share dialog
The share dialog SHALL be a modal dialog with the accessible name «Поделиться встречей». On opening the focus MUST move into the dialog; Tab and Shift+Tab stay inside it; on closing the focus returns to Share meeting, except after the outcome shared, which removes Share meeting with the meeting bar and puts the focus on Add location. The focus is never left on the document body. Esc while the list of share languages is open closes only the list and returns the focus to the language button. Each checkbox MUST be named by its city label and announce its state. The pin MUST be a toggle button that announces pressed or not pressed. The share zone label toggles MUST form a group named by their caption. The preview MUST be a region named by its caption that is not announced on every change. The inactive Share button MUST be announced as unavailable. Every pointer target MUST be at least 44 × 44 px, and text and control contrast MUST meet WCAG AA in the light and the dark theme. axe-core MUST report no violation. <!-- implements NFR-A1, NFR-A2, NFR-A3 of add-meeting-share-dialog; FR6, NFR-A3 of keep-location-menu-in-view-and-clear-range-after-share -->

#### Scenario: Focus enters and returns
- **WHEN** the user opens the share dialog with the keyboard and then presses Esc
- **THEN** the focus was inside the dialog while it was open
- **AND** after closing the focus is on «Поделиться встречей»

#### Scenario: Focus returns after a share
- **GIVEN** a browser without a system share and the share dialog open
- **WHEN** the user chooses «Поделиться»
- **THEN** the share dialog is closed and the focus is on «Поделиться встречей»

#### Scenario: Focus after a shared meeting
- **GIVEN** a browser with a system share and the share dialog open
- **WHEN** the user chooses «Поделиться» and the system share takes the text
- **THEN** the share dialog is closed, no meeting range is set and the focus is on «Добавить место»

#### Scenario: Controls announce their names and states
- **WHEN** the share dialog is open
- **THEN** it is a modal dialog named «Поделиться встречей»
- **AND** each checkbox is named by its city label and is checked, the pin is a toggle button named «Запомнить язык приглашения» that is not pressed, «Аббревиатура» and «Смещение UTC» are in a group named «Обозначение часового пояса», and the preview is a region named «Текст приглашения» that is not a live region
- **WHEN** the user unticks every location
- **THEN** «Поделиться» is announced as unavailable

#### Scenario: Esc in the open language list
- **GIVEN** the share dialog is open and the list of share languages is open
- **WHEN** the user presses Esc
- **THEN** the list is closed, the share dialog is still open and the focus is on the language button

#### Scenario: Keyboard only
- **WHEN** the user opens the share dialog, unticks Moscow with Space, moves to «Поделиться» with Tab and presses Enter
- **THEN** the shared text has no Moscow line

#### Scenario: No accessibility violations
- **GIVEN** the `<theme>` theme and a viewport `<width>` px wide
- **WHEN** the share dialog is open
- **THEN** axe-core reports no violation

| theme | width |
|---|---|
| light | 320 |
| dark | 390 |
| light | 1280 |


## ADDED Requirements

### Requirement: A shared meeting clears the meeting range
When a share from the share dialog ends with the outcome shared — the system share took the text, after the user picked where to send it — the app SHALL close the share dialog and clear the meeting range exactly as Clear meeting «Сбросить выбор встречи» does (`meeting-range` → "Set and clear a meeting range"). No meeting range is set, and the reference moment stays pinned at the former start. The meeting bar gives way to the normal header, the hour frame stands at the former start, and the grab area, the location menu and the wall-time input of every row work again. No notice is shown. The focus MUST then be on Add location «Добавить место», as after Clear meeting. The outcomes cancelled, copied and failed, the close button «Закрыть» and Esc MUST keep the meeting range unchanged. The location list, the preferences and the stored documents MUST NOT change. Inputs: the share outcome. Effects: the meeting range is cleared on the outcome shared only. Errors: none. <!-- implements FR5, FR6, FR7, NFR-A3, UX3 of keep-location-menu-in-view-and-clear-range-after-share -->

#### Scenario: The ways out of the share dialog
- **GIVEN** the Grid view with the meeting range 09:00–11:00 in Almaty and the share dialog open
- **WHEN** the user leaves the dialog by `<way>`
- **THEN** the share dialog is `<dialog>` and the meeting range is `<range>`
- **AND** the reference moment is pinned at 09:00 in Almaty

| way | dialog | range |
|---|---|---|
| «Поделиться» with the outcome shared | closed | none |
| the close button «Закрыть» | closed | 09:00–11:00 |
| Esc | closed | 09:00–11:00 |
| «Поделиться» with the outcome cancelled | open | 09:00–11:00 |
| «Поделиться» with the outcome copied | closed | 09:00–11:00 |
| «Поделиться» with the outcome failed | closed | 09:00–11:00 |

#### Scenario: After a shared meeting the Grid view is back to normal
- **GIVEN** a browser with a system share, the Grid view with the meeting range 09:00–11:00 in Almaty and the share dialog open
- **WHEN** the user chooses «Поделиться» and the system share takes the text
- **THEN** the header shows the app title, Add location and Settings, and no meeting bar
- **AND** no meeting frame is shown and the hour frame is on the 09:00 cell of Almaty
- **AND** every location menu button is enabled
- **AND** the focus is on «Добавить место» and no share notice is shown

#### Scenario: A shared meeting stores nothing
- **GIVEN** the meeting range 09:00–11:00 in Almaty and the share dialog open
- **WHEN** the share ends with the outcome shared
- **THEN** the location list and the preferences are unchanged
