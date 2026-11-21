## Purpose

The share dialog: where the user decides which locations, which language and which zone parts the meeting share text has, reads the text and sends it.

The scenarios use the sample of `meeting-range`: the current time is `2026-03-08T07:30:00Z`, the device time zone is `Asia/Almaty`, Almaty is the home location, the list is Almaty, Moscow, Kolkata, New York, and the sample meeting is 09:00–11:00 in Almaty. Unless a scenario says otherwise, the interface language is Russian, the hour format is 24-hour and nothing is stored in the preferences.

## ADDED Requirements

### Requirement: Share dialog opens and closes
While a meeting range is set, Share meeting SHALL open the share dialog: a modal dialog titled with the meeting bar's title («Встреча · 2 ч») and, under it, the full date of the start in the reference zone with the name of the reference location. The dialog MUST close on its close button «Закрыть», on Esc and on a share whose outcome is shared, copied or failed; closing changes neither the meeting range nor the location list. With no meeting range the dialog cannot be opened. Inputs: the meeting range, the location list, the preferences. Output: the open dialog with its defaults. <!-- implements FR1, FR9 of add-meeting-share-dialog -->

#### Scenario: The dialog opens with its defaults
- **WHEN** the user chooses «Поделиться встречей»
- **THEN** the share dialog is open with the title «Встреча · 2 ч» and the line «воскресенье, 8 марта 2026 г. · по времени Алматы»
- **AND** every location is ticked, the share language is Русский, no share language is pinned, and the share zone label shows the zone abbreviation and the UTC offset

#### Scenario: Closing keeps the meeting
- **GIVEN** the share dialog is open
- **WHEN** the user closes it with `<way>`
- **THEN** the dialog is closed, the meeting range is 09:00–11:00 in Almaty and nothing was shared or copied

| way |
|---|
| the close button |
| Esc |

### Requirement: Locations in the share dialog
The share dialog SHALL list every location of the list, in list order. A row has a checkbox, the city label, the zone abbreviation and the UTC offset of the location at the start of the meeting range joined by a middle dot, as the meeting share text writes them with both parts on (so a `UTC` location, whose city label already reads `UTC`, shows no zone part), the local span of the meeting and the local date of its start, with the day shift mark when the date differs from the reference zone's. Every checkbox MUST be ticked each time the dialog opens, whatever was unticked before. Unticking a location leaves it out of the meeting invitation; ticking it puts it back. The rows are written in the interface language, not in the share language. <!-- implements FR2, FR3, NG3 of add-meeting-share-dialog -->

#### Scenario: Rows of the sample meeting
- **WHEN** the share dialog is open
- **THEN** its rows are, in order:

| city | zone parts | span | date |
|---|---|---|---|
| Алматы | UTC+5 | 09:00–11:00 | вс, 8 мар. |
| Москва | МСК · UTC+3 | 07:00–09:00 | вс, 8 мар. |
| Калькутта | IST · UTC+5:30 | 09:30–11:30 | вс, 8 мар. |
| Нью-Йорк | EST · UTC−5 | 23:00–01:00 | днём раньше сб, 7 мар. |

#### Scenario: Unticked locations are not remembered
- **GIVEN** the user unticked Kolkata and New York and closed the share dialog
- **WHEN** the user opens the share dialog again
- **THEN** every location is ticked

#### Scenario: No location ticked
- **WHEN** the user unticks every location
- **THEN** the preview shows the hint «Отметьте хотя бы одно место» and no text
- **AND** «Поделиться» is inactive and cannot be activated by pointer or keyboard

### Requirement: Share language choice
The share dialog SHALL show the share language as a button with the flag and the native name of the language, as the language group of the settings page shows the interface language. Activating it opens the list of the languages of the locale registry; choosing one sets the share language of this dialog and closes the list. The share language MUST change only the meeting share text: the interface language, every text of the dialog and the settings stay as they were. <!-- implements FR4 of add-meeting-share-dialog -->

#### Scenario: Another share language
- **WHEN** the user chooses English as the share language
- **THEN** the preview is the English text of the sample meeting
- **AND** the dialog's captions and rows are still in Russian and the interface language is Russian

### Requirement: Share language pin
Next to the share language the dialog SHALL have the pin: a toggle button with the accessible name «Запомнить язык приглашения» ("Remember the share language"). While the pin is off, every opening of the dialog MUST start in the interface language. Turning the pin on keeps the current share language in the preferences; while it is on, every opening starts in the pinned language, and choosing another language keeps the new one. Turning the pin off removes the pinned language and leaves the share language of this opening as it is. A pinned language that the locale registry no longer has is treated as no pin. Inputs: the pinned share language, the interface language. Output: the share language the dialog opens with. <!-- implements FR5 of add-meeting-share-dialog -->

#### Scenario: Without the pin the dialog returns to the interface language
- **GIVEN** the user chose English as the share language and closed the dialog without pinning
- **WHEN** the user opens the share dialog again
- **THEN** the share language is Русский

#### Scenario: A pinned language opens every time
- **GIVEN** the user chose English as the share language and turned the pin on
- **WHEN** the app is opened again, a meeting range is set and the share dialog is opened
- **THEN** the share language is English and English is the pinned share language
- **AND** the interface language is Russian

#### Scenario: Changing the language while pinned
- **GIVEN** the share language English is pinned
- **WHEN** the user chooses Русский as the share language
- **THEN** the pinned share language is Russian

#### Scenario: Turning the pin off
- **GIVEN** the share language English is pinned and the dialog is open
- **WHEN** the user turns the pin off
- **THEN** no share language is pinned and the share language of this dialog is still English

### Requirement: Share zone label toggles
The share dialog SHALL have a toggle group captioned «Обозначение часового пояса» ("Timezone label") with the toggles «Аббревиатура» ("Abbreviation") and «Смещение UTC» ("UTC offset"), in that order, both on by default. It is the toggle group of the zone label setting without the country. A change applies to the preview at once and is kept in the preferences; the zone label setting MUST NOT change. <!-- implements FR6 of add-meeting-share-dialog -->

#### Scenario: Turning the UTC offset off
- **WHEN** the user turns «Смещение UTC» off
- **THEN** the Moscow line of the preview is «Москва (МСК): 07:00–09:00» and the Almaty line is «Алматы: 09:00–11:00»
- **AND** the rows of the Grid view still show their zone lines with the UTC offset

#### Scenario: The choice is used the next time
- **GIVEN** the user turned «Аббревиатура» off and closed the dialog
- **WHEN** the user opens the share dialog again
- **THEN** «Аббревиатура» is off and «Смещение UTC» is on

### Requirement: Preview of the meeting share text
The share dialog SHALL show, under the caption «Текст приглашения» ("Text of the invitation"), exactly the meeting share text that Share will send, line by line, with the heading set apart in bold. The preview MUST follow every change of the ticked locations, the share language and the share zone label without another action of the user. <!-- implements FR8 of add-meeting-share-dialog -->

#### Scenario: The preview is the text that is shared
- **GIVEN** a browser with a system share
- **WHEN** the user unticks Moscow, chooses English as the share language and chooses «Поделиться»
- **THEN** the system share receives exactly the lines the preview showed

#### Scenario: The preview follows the ticks
- **WHEN** the user unticks Kolkata
- **THEN** the preview has the heading and the lines of Almaty, Moscow and New York, in that order

### Requirement: Share from the share dialog
The share dialog SHALL offer one button per share destination that is available on the device; today that is one button, «Поделиться» ("Share"), with the Lucide `Share2` icon. Activating it hands the previewed text to that destination. The outcomes shared, copied and failed MUST close the dialog and return the focus to Share meeting; the outcome cancelled MUST keep the dialog open with its ticks, its share language and its share zone label unchanged. The notices follow `grid-view` → "Share meeting from the meeting bar". Sharing needs no network. Errors: none beyond the outcomes. <!-- implements FR9, FR11, UX5 of add-meeting-share-dialog -->

#### Scenario: Outcomes of a share from the dialog
- **GIVEN** the share dialog is open with Kolkata unticked
- **WHEN** the user chooses «Поделиться» and the browser `<behaves>`
- **THEN** the dialog is `<dialog>`, the notice is `<notice>` and no confirmation dialog is open

| behaves | dialog | notice |
|---|---|---|
| shares the text | closed | none |
| reports that the user closed the sheet | open, Kolkata still unticked | none |
| has no system share | closed | «Текст встречи скопирован» |
| has neither share nor clipboard | closed | «Не удалось поделиться встречей» |

### Requirement: Share dialog follows the model
While the share dialog is open, it SHALL follow the location list and the meeting range. A location added to the list (in another tab) MUST appear in its place, ticked; a removed location MUST disappear from the rows and the preview; the ticks of the other locations stay. When the meeting range is removed — by a change of the reference zone in another tab — the dialog MUST close and nothing is shared. <!-- implements FR10 of add-meeting-share-dialog -->

#### Scenario: A location is removed in another tab
- **GIVEN** the share dialog is open with Moscow unticked
- **WHEN** Kolkata is removed from the list in another tab
- **THEN** the dialog shows Almaty, Moscow and New York, Moscow is still unticked and the preview has no Kolkata line

#### Scenario: The meeting range is removed in another tab
- **GIVEN** the share dialog is open
- **WHEN** another tab makes Moscow the home location
- **THEN** the share dialog is closed and no meeting range is set

### Requirement: Accessible share dialog
The share dialog SHALL be a modal dialog with the accessible name «Поделиться встречей». On opening the focus MUST move into the dialog; Tab and Shift+Tab stay inside it; on closing the focus returns to Share meeting. Each checkbox MUST be named by its city label and announce its state. The pin MUST be a toggle button that announces pressed or not pressed. The share zone label toggles MUST form a group named by their caption. The preview MUST be a region named by its caption that is not announced on every change. The inactive Share button MUST be announced as unavailable. Every pointer target MUST be at least 44 × 44 px, and text and control contrast MUST meet WCAG AA in the light and the dark theme. axe-core MUST report no violation. <!-- implements NFR-A1, NFR-A2, NFR-A3 of add-meeting-share-dialog -->

#### Scenario: Focus enters and returns
- **WHEN** the user opens the share dialog with the keyboard and then presses Esc
- **THEN** the focus was inside the dialog while it was open
- **AND** after closing the focus is on «Поделиться встречей»

#### Scenario: Focus returns after a share
- **GIVEN** a browser without a system share and the share dialog open
- **WHEN** the user chooses «Поделиться»
- **THEN** the share dialog is closed and the focus is on «Поделиться встречей»

#### Scenario: Controls announce their names and states
- **WHEN** the share dialog is open
- **THEN** it is a modal dialog named «Поделиться встречей»
- **AND** each checkbox is named by its city label and is checked, the pin is a toggle button named «Запомнить язык приглашения» that is not pressed, «Аббревиатура» and «Смещение UTC» are in a group named «Обозначение часового пояса», and the preview is a region named «Текст приглашения» that is not a live region
- **WHEN** the user unticks every location
- **THEN** «Поделиться» is announced as unavailable

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

### Requirement: Share dialog layout
The share dialog SHALL use the dialog frame of the Add location dialog: below 640 px wide it fills the screen, from 640 px it is centred and at most 512 px wide; padding 16 px; the title 18 px in weight 600; the close button 44 × 44 px at the top right. The captions use the settings caption style (14 px, weight 600, muted foreground). The language button and the share zone label toggles keep the sizes of the settings page. The pin MUST be a square 44 × 44 px button showing only the Lucide `Pin` icon: outlined in the muted foreground with the control border while off, filled in the accent colour with an accent border while on. A ticked row shows its span in the meeting text colour; an unticked row shows its city label and span in the muted foreground. The preview MUST have the page background, the card border and the card radius. A row MUST offer its checkbox and no remove control (no red delete cross), and a share MUST open no confirmation dialog: an outcome only closes the dialog or keeps it, as "Share from the share dialog" says. From 320 px to 2560 px wide the dialog MUST NOT scroll horizontally. When the content is taller than the dialog, the content MUST scroll inside it while the Share button stays visible. <!-- implements UX1, UX2, UX3, UX4, UX5, NFR-R1, NFR-R2 of add-meeting-share-dialog -->

#### Scenario: Narrow phone
- **GIVEN** a viewport 320 px wide
- **WHEN** the share dialog is open
- **THEN** the dialog fills the screen and nothing scrolls horizontally
- **AND** the pointer target of every checkbox, the language button, the pin, both toggles, the close button and «Поделиться» is at least 44 px wide and at least 44 px high

#### Scenario: Wide screen
- **GIVEN** a viewport 1280 px wide
- **WHEN** the share dialog is open
- **THEN** the dialog is centred and 512 px wide

#### Scenario: A long list keeps Share in view
- **GIVEN** a viewport 390 × 844 px and a list of 20 locations
- **WHEN** the share dialog is open and its content is scrolled to any position
- **THEN** «Поделиться» is fully visible

### Requirement: Share dialog strings are localized
Every text of the share dialog SHALL come from the locale files and exist in Russian and English: the accessible name, the captions «Кому отправляем» ("Send to"), «Язык приглашения» ("Language of the invitation"), «Обозначение часового пояса» ("Timezone label") and «Текст приглашения» ("Text of the invitation"), the reference line «{date} · по времени {city}» ("{date} · {city} time"), the pin's name, the hint «Отметьте хотя бы одно место» ("Tick at least one location") and the button «Поделиться» ("Share"). <!-- implements FR12 of add-meeting-share-dialog -->

#### Scenario: English interface
- **GIVEN** the interface language is English
- **WHEN** the share dialog is open
- **THEN** its captions are "Send to", "Language of the invitation", "Timezone label" and "Text of the invitation", and its button is "Share"

### Requirement: Share dialog is fast
Building the preview again after a change of a tick, of the share language or of the share zone label SHALL build no new `Intl` formatter for a language that was already used since the dialog opened. The share dialog MUST NOT be part of the initial bundle of the main page. <!-- implements NFR-P1, NFR-P2 of add-meeting-share-dialog -->

#### Scenario: A tick builds no formatter
- **GIVEN** the share dialog is open with 20 locations
- **WHEN** the user unticks one location and ticks it again
- **THEN** no `Intl` formatter was built by these two changes

#### Scenario: Returning to a used language builds no formatter
- **GIVEN** the user chose English and then Русский as the share language
- **WHEN** the user chooses English again
- **THEN** no `Intl` formatter was built by this change

### Requirement: Approved screenshots of the share dialog
The share dialog SHALL have approved screenshots that the browser suite compares on every run: the defaults on a phone in the light theme; three of the locations ticked with English pinned on a phone in the dark theme; no location ticked; and the centred dialog at 1280 px. No screenshot shows a remove control on a row. <!-- implements UX1, UX2, UX3, UX4, UX5, NFR-R1 of add-meeting-share-dialog -->

#### Scenario: The dialog matches its approved screenshots
- **GIVEN** the state `<state>` at `<viewport>` in the `<theme>` theme
- **WHEN** the share dialog is compared with its approved screenshot
- **THEN** they match

| state | viewport | theme |
|---|---|---|
| defaults | 390 × 844 | light |
| Kolkata unticked, English pinned | 390 × 844 | dark |
| no location ticked | 390 × 844 | light |
| defaults | 1280 × 800 | light |
