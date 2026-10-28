## ADDED Requirements

### Requirement: Here entry when no location matches
The Cards view SHALL show a Here entry for the device time zone before the first location whenever no location in the location list has a canonical time zone ID equal to the device time zone. When at least one location matches, it MUST show no Here entry. Inputs: the locations' time zone IDs and the device time zone. Output: whether the Here entry is shown. Errors: none. <!-- implements FR1 of show-here-entry-for-device-time -->

#### Scenario: No location matches
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is Moscow, Kolkata, New York
- **WHEN** the user opens the app
- **THEN** the first row is the Here entry for `Asia/Almaty`
- **AND** Moscow, Kolkata and New York follow in list order

#### Scenario: A location matches
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is Almaty (`Asia/Almaty`), Moscow
- **WHEN** the user opens the app
- **THEN** no Here entry is shown
- **AND** Almaty shows the Here mark

#### Scenario: Matching is by time zone ID, not by offset
- **GIVEN** the device time zone is `Europe/Minsk`
- **AND** the list is Moscow (`Europe/Moscow`)
- **WHEN** the user opens the app
- **THEN** the Here entry for `Europe/Minsk` is shown before Moscow

### Requirement: Here entry content
The Here entry SHALL show the Here mark with its "here" caption, the city of the device time zone, the meta line "Device time · {UTC offset}" in place of the country and UTC offset, the local time and date at the effective instant, and a day track on the shared reference day. The UTC offset MUST be the device time zone's offset at the effective instant. <!-- implements FR2, UX1 of show-here-entry-for-device-time -->

#### Scenario: Here entry on the design sample
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is Moscow, Kolkata, New York
- **WHEN** the user opens the app
- **THEN** the Here entry shows `Алматы`, the caption `здесь`, the meta line `Время устройства · UTC+5`, the time `12:30` and the date `вс, 8 мар.`
- **AND** its handle stands at the same position as on every card

#### Scenario: English meta line
- **GIVEN** the device time zone is `Asia/Kolkata`
- **AND** the interface language is English
- **AND** the list is empty
- **WHEN** the user opens the app
- **THEN** the Here entry's meta line is `Device time · UTC+5:30`

### Requirement: Offset difference on the Here entry
The Here entry SHALL show an offset difference by the same rule as a location row. Without a home location it is the reference zone and MUST show no offset difference. With a home location it MUST show the offset difference from home, `0 h` when the UTC offsets are equal. <!-- implements FR3 of show-here-entry-for-device-time -->

#### Scenario: No home
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** no home location is set
- **AND** the interface language is Russian
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is Moscow, Kolkata, New York
- **WHEN** the user opens the app
- **THEN** the Here entry shows no offset difference
- **AND** Moscow shows `−2 ч`, Kolkata `+0:30` and New York `−9 ч`

#### Scenario: Travelling with home set
- **GIVEN** the home location is Almaty
- **AND** the device time zone is `Europe/Moscow`
- **AND** the interface language is Russian
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is Almaty, Kolkata, New York
- **WHEN** the user opens the app
- **THEN** the first row is the Here entry `Москва` with `−2 ч` and `Время устройства · UTC+3`
- **AND** the reference day is `2026-03-07T19:00:00Z`–`2026-03-08T19:00:00Z`

### Requirement: Here entry is not a location
The Here entry SHALL NOT be stored and SHALL NOT be counted as a location. It MUST offer no remove action, no drag handle and no Location menu, so it cannot be removed, reordered or made home. A reorder MUST move locations only among themselves, the Here entry MUST stay first, and reorder announcements MUST count positions among locations only. <!-- implements FR4 of show-here-entry-for-device-time -->

#### Scenario: Nothing to remove or move
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is Moscow, New York
- **WHEN** the user opens the app
- **THEN** the Here entry has no remove action, no drag handle and no Location menu

#### Scenario: Reorder keeps the Here entry first
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is Moscow, New York
- **WHEN** the user moves New York to the top of the list
- **THEN** the rows are the Here entry, New York, Moscow
- **AND** the announcement says New York is at position 1 of 2

#### Scenario: Nothing is stored for the Here entry
- **GIVEN** no location list is stored
- **AND** the device time zone is `Asia/Almaty`
- **WHEN** the user opens the app and selects a time on the Here entry's day track
- **THEN** no location list is stored

### Requirement: Select a time on the Here entry
The Here entry's day track SHALL select a time exactly as a card's day track does, by pointer and by keys. A time selection on it MUST pin the reference moment and update every card in the same render. <!-- implements FR5 of show-here-entry-for-device-time -->

#### Scenario: Time selection from the Here entry
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is Moscow
- **WHEN** the user moves the Here entry's day track one hour forward
- **THEN** the Here entry shows `13:30`
- **AND** Moscow shows `11:30`
- **AND** the Now button is shown

### Requirement: Here entry follows the device time zone
The Here entry SHALL appear, change or disappear in the same render as the Here mark: when the device time zone is read (at start, at every minute tick, when the page becomes visible), and when locations are added, removed or reordered, changed in another tab or reset. An unknown device time zone MUST be shown as `UTC`. Errors: none. <!-- implements FR6 of show-here-entry-for-device-time -->

#### Scenario: Adding the device's city hides the Here entry
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is Moscow
- **WHEN** the user adds Almaty
- **THEN** no Here entry is shown
- **AND** exactly 1 row shows the Here mark: Almaty

#### Scenario: Removing the device's city shows the Here entry
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is Almaty, Moscow
- **WHEN** the user removes Almaty
- **THEN** the first row is the Here entry for `Asia/Almaty`

#### Scenario: The device moves to another zone
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is Moscow
- **WHEN** the device time zone becomes `Europe/Moscow` and the minute tick reads it
- **THEN** no Here entry is shown
- **AND** Moscow shows the Here mark

#### Scenario: Unknown device time zone
- **GIVEN** the device reports the time zone `Mars/Olympus_Mons`
- **AND** the interface language is English
- **AND** the list is Moscow
- **WHEN** the user opens the app
- **THEN** the Here entry shows `UTC`, the caption `here` and the meta line `Device time · UTC`

### Requirement: Exemplar city of the Here entry
The Here entry SHALL name the device time zone by its exemplar city in the interface language. The zone cities data MUST be loaded in the background only while the Here entry is shown, and showing the Here entry MUST NOT wait for it. Until the data is loaded, or when loading fails, the city MUST be derived from the time zone ID, with no error shown. <!-- implements FR8, NFR-P2, UX3 of show-here-entry-for-device-time -->

#### Scenario: Derived city first, exemplar city after loading
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the zone cities data has not been loaded
- **WHEN** the user opens the app
- **THEN** the Here entry shows `Almaty`
- **WHEN** the zone cities data finishes loading
- **THEN** the Here entry shows `Алматы`

#### Scenario: Loading fails
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** loading the zone cities data fails
- **WHEN** the user opens the app
- **THEN** the Here entry shows `Almaty`
- **AND** no error is shown

#### Scenario: No load without a Here entry
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is Almaty
- **WHEN** the user opens the app and does not open the search
- **THEN** the zone cities data is not requested

### Requirement: Here entry in other page states
The load error of an unreadable stored list SHALL show no Here entry. The view skeleton MUST stay unchanged, and the Here entry MUST appear together with the location rows. With storage unavailable, the Here entry MUST be shown as usual. <!-- implements FR9 of show-here-entry-for-device-time -->

#### Scenario: Unreadable stored list
- **GIVEN** the stored location list is unreadable
- **WHEN** the user opens the app
- **THEN** the load error with Reset is shown
- **AND** no Here entry is shown

#### Scenario: Storage unavailable
- **GIVEN** storage is unavailable
- **AND** the device time zone is `Asia/Almaty`
- **WHEN** the user opens the app
- **THEN** the storage warning is shown
- **AND** the Here entry for `Asia/Almaty` is shown

### Requirement: Here entry on outdated zone data
On an engine that rejects the canonical device time zone but accepts a legacy name of it, the Here entry SHALL show its time, date, UTC offset and day track through the legacy name, exactly like a location row in that zone. Its exemplar city MUST be looked up by the canonical time zone ID. On an engine without Pointer Events, its day track MUST select a time by tap like a card's day track. <!-- implements FR12 of show-here-entry-for-device-time -->

#### Scenario: Renamed device time zone
- **GIVEN** the engine rejects `Europe/Kyiv` and accepts `Europe/Kiev`
- **AND** the device reports the time zone `Europe/Kiev`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is Moscow
- **WHEN** the user opens the app
- **THEN** the Here entry shows `Kyiv`, the time `09:30` and the meta line `Device time · UTC+2`
- **AND** the device time zone is kept as `Europe/Kyiv`

#### Scenario: Tap on the Here entry's day track without Pointer Events
- **GIVEN** the engine has no Pointer Events
- **AND** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is Moscow
- **WHEN** the user taps three quarters of the Here entry's day track
- **THEN** the Here entry shows `18:00`
- **AND** Moscow shows `16:00`

### Requirement: Here entry strings are localized
Every string of the Here entry SHALL exist in English and Russian: the meta line "Device time" («Время устройства») and its accessible name. <!-- implements FR10 of show-here-entry-for-device-time -->

#### Scenario: Both languages
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is empty
- **WHEN** the interface language is switched between English and Russian
- **THEN** the meta line reads `Device time · UTC+5` and `Время устройства · UTC+5`

### Requirement: Here entry in every view
Seeing the device time without a home location is part of the view contract (ADR-0002). For every registered view, with no home location and no location in the device time zone, the device time MUST be shown first, apart from the locations. <!-- implements FR11 of show-here-entry-for-device-time -->

#### Scenario: See the Here entry without home
- **GIVEN** the view under contract is shown
- **AND** the device time zone is `Asia/Almaty`
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the stored locations are Moscow
- **WHEN** the user opens the app
- **THEN** the first row is the Here entry showing `12:30`
- **AND** Moscow shows `10:30`

### Requirement: Here entry is fast
The Here entry SHALL cost no more work than one location row: presenting 50 location rows and the Here entry again MUST build no formatter, and the Here entry MUST use no more time zone transition lookups than one location row. <!-- implements NFR-P1 of show-here-entry-for-device-time -->

#### Scenario: Presenting again builds no formatter
- **GIVEN** 50 locations, none in the device time zone, have been presented with the Here entry
- **WHEN** the same rows and the Here entry are presented again for the next minute tick
- **THEN** no formatter is built

### Requirement: Accessible Here entry
The Here entry SHALL be outside the numbered location list, so assistive technology does not count it as a location. Its accessible name MUST include the city, the Here mark label and "Device time". Its day track MUST be one Tab stop named like a card's. axe-core MUST report no violations with the Here entry shown. <!-- implements NFR-A1, NFR-A2 of show-here-entry-for-device-time -->

#### Scenario: Name and list size
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the list is Moscow, New York
- **WHEN** the user opens the app
- **THEN** the Here entry is named `Алматы, Вы здесь, Время устройства`
- **AND** the location list has 2 items
- **AND** the Here entry's slider is named `Время — Алматы`

#### Scenario: No violations
- **GIVEN** the Here entry is shown above a list, in the empty state, or while travelling with home set
- **WHEN** axe-core checks the page in the light and dark themes
- **THEN** it reports no violations

### Requirement: Here entry layout
The Here entry SHALL use the card layout: text above the day track below 768 px, the day track right of the time with hour labels from 768 px. The page MUST NOT scroll horizontally at 320 px and 2560 px with the Here entry shown. Replacing the derived city with the exemplar city MUST NOT change the Here entry's height. <!-- implements NFR-R1, NFR-R2, UX1, UX3 of show-here-entry-for-device-time -->

#### Scenario: Narrow and wide screens
- **GIVEN** the Here entry is shown above Moscow
- **WHEN** the viewport is 320 px and then 2560 px wide
- **THEN** the page does not scroll horizontally
- **AND** the Here entry's layout matches the Moscow card's layout

#### Scenario: Approved screenshots
- **GIVEN** the states "here-entry", "here-entry-empty" and "here-entry-travel"
- **WHEN** they are rendered at 375 px and 1024 px in the light and dark themes
- **THEN** they match the approved screenshots
