# Spec Delta

## Purpose

Lets the user mark one location of the list as the home location, so that the reference zone, the reference day and every offset difference are counted from it instead of the device time zone.

## ADDED Requirements

### Requirement: Make a location home
The user SHALL be able to make any location of the list whose zone is known the home location. At most one location MUST be home; making another location home moves home to it. Making the current home home again MUST change nothing. Inputs: the location. Effects: the home location is that location. Errors: location not found (no longer in the list). <!-- implements FR1 of set-home-location-and-show-differences -->

#### Scenario: Make Almaty home
- **GIVEN** the list is Almaty, Moscow, Kolkata and no location is home
- **WHEN** the user makes Almaty home
- **THEN** Almaty is the home location

#### Scenario: Home moves to another location
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user makes Moscow home
- **THEN** Moscow is the home location
- **AND** Almaty is not the home location

#### Scenario: Location already gone
- **GIVEN** Moscow was removed in another tab
- **WHEN** a request to make Moscow home arrives
- **THEN** it is reported as location not found
- **AND** the home location is unchanged

### Requirement: Clear the home location
The user SHALL be able to clear the home location. After clearing, no location is home and the reference zone is the device time zone. Clearing when no location is home MUST change nothing. Inputs: none. Effects: no home location. Errors: none. <!-- implements FR2 of set-home-location-and-show-differences -->

#### Scenario: Clear home
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user clears home
- **THEN** no location is home

### Requirement: Home follows list changes
Removing the home location SHALL clear home. Resetting an unreadable list MUST leave no home. Adding a location MUST NOT set home, also when it is the first location. Reordering MUST keep the home location and MUST NOT move it to another position. <!-- implements FR3 of set-home-location-and-show-differences -->

#### Scenario: Removing home clears it
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user removes Almaty
- **THEN** no location is home

#### Scenario: The first added location is not home
- **GIVEN** the list is empty
- **WHEN** the user adds Almaty
- **THEN** no location is home

#### Scenario: Reorder keeps home in place
- **GIVEN** the list is Almaty, Moscow, Kolkata and Moscow is home
- **WHEN** the user moves Kolkata to the first position
- **THEN** the list is Kolkata, Almaty, Moscow
- **AND** Moscow is still home

### Requirement: Reference zone follows home
The reference zone SHALL be the home location's canonical time zone ID when home is set, and the device time zone otherwise. Changing it MUST keep the reference moment: live stays live, pinned keeps its instant. The reference day, the date bar's date and the gap note MUST follow the new zone in the same render: a gap note about a wall-clock time in the previous reference zone MUST NOT be shown after the change (see "Wall-clock resolution on the new date" in the `date-selection` capability). <!-- implements FR4 of set-home-location-and-show-differences -->

#### Scenario: The day follows home while travelling
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** every card shows a track for the day from `2026-03-07T19:00:00Z` to `2026-03-08T19:00:00Z`

#### Scenario: Clearing home returns to the device day
- **GIVEN** the situation of "The day follows home while travelling"
- **WHEN** the user clears home
- **THEN** every card shows a track for the day from `2026-03-07T21:00:00Z` to `2026-03-08T21:00:00Z`
- **AND** the moment is still live

#### Scenario: A pinned moment keeps its instant
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the moment is pinned to `2026-03-08T20:30:00Z`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user makes Almaty home
- **THEN** the moment is still pinned to `2026-03-08T20:30:00Z`
- **AND** the date bar shows the date `2026-03-09`

#### Scenario: A home change drops the gap note
- **GIVEN** the device time zone is `America/New_York`
- **AND** the interface language is English
- **AND** the list contains New York and Almaty
- **AND** the current instant is `2026-03-07T07:30:00Z`
- **AND** the user moved to the next day, so the moment is pinned to `2026-03-08T07:30:00Z` and the bar shows `02:30 does not exist on this day because of a clock change; showing 03:30.`
- **WHEN** the user makes Almaty home
- **THEN** the moment is still pinned to `2026-03-08T07:30:00Z`
- **AND** the bar shows no note

### Requirement: Home mark
The home location's row SHALL show the home mark in the leading mark slot: a house icon outlined in the accent colour, the size of the Here mark icon, with the accessible label "Home location" («Домашнее место») and no caption. No other row MAY show it. <!-- implements FR7, UX2 of set-home-location-and-show-differences -->

#### Scenario: Only the home row shows the home mark
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the Almaty row shows the home mark
- **AND** the Moscow row shows no home mark

### Requirement: Home mark takes precedence over the Here mark
A row that is home and whose zone is the device time zone SHALL show the home mark only, without the Here mark and without the "here" caption. A row in the device time zone that is not home MUST show the Here mark and the "here" caption. <!-- implements FR7 of set-home-location-and-show-differences -->

#### Scenario: Home in the device time zone
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the Almaty row has exactly 1 leading mark, of the kind "home"
- **AND** the Almaty row shows no "here" caption

#### Scenario: Travelling
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the Almaty row shows the home mark
- **AND** the Moscow row shows the Here mark and the caption "here"

### Requirement: Home is kept on the device
The home location SHALL be saved on the device together with the list and restored on the next open, also offline. Nothing MUST be written until the user changes the list or home. A list stored by the previous document version MUST open with the same locations, in the same order, without home. <!-- implements FR8 of set-home-location-and-show-differences -->

#### Scenario: Home survives a reload
- **GIVEN** the user added Almaty and Moscow and made Moscow home
- **WHEN** the app is opened again
- **THEN** Moscow is the home location

#### Scenario: A list from the previous version
- **GIVEN** the stored list is a version 1 document with Almaty, Moscow and Kolkata
- **WHEN** the app is opened
- **THEN** the list is Almaty, Moscow, Kolkata in that order
- **AND** no location is home
- **AND** nothing is written

### Requirement: A dangling stored home is cleared
When the stored home points to a location that is not in the stored list, the app SHALL open the list without home and without an error. It MUST NOT write on load; the corrected document is written with the user's next change. <!-- implements FR9 of set-home-location-and-show-differences -->

#### Scenario: Home points to a missing location
- **GIVEN** the stored list is Almaty and Moscow and its home points to Tokyo
- **WHEN** the app is opened
- **THEN** the list is Almaty and Moscow
- **AND** no location is home
- **AND** no error is shown and nothing is written

### Requirement: Home is shared between open tabs
A home change in one open tab SHALL appear in every other open tab without a reload. When two tabs write, the last write MUST win. <!-- implements FR10 of set-home-location-and-show-differences -->

#### Scenario: Home set in another tab
- **GIVEN** the app is open in two tabs with Almaty and Moscow
- **WHEN** the user makes Moscow home in the first tab
- **THEN** the second tab shows the home mark on Moscow without a reload

### Requirement: Home actions in the location menu
Each card's location menu SHALL offer "Make home" («Сделать домашним») on a row that is not home and "Clear home" («Убрать отметку дома») on the home row. A row whose zone is unknown MUST have no home item. Setting and clearing home MUST be announced politely without moving focus away from the card. <!-- implements FR11 of set-home-location-and-show-differences -->

#### Scenario: Menu of a row that is not home
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens Moscow's location menu
- **THEN** it offers "Make home" and "Remove"

#### Scenario: Menu of the home row
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens Almaty's location menu
- **THEN** it offers "Clear home" and "Remove"

#### Scenario: Setting home is announced
- **GIVEN** the interface language is English
- **WHEN** the user makes Almaty home from its location menu
- **THEN** "Almaty is now home" is announced politely
- **AND** the focus is on Almaty's location menu button

#### Scenario: No home item for an unknown zone
- **GIVEN** the list holds a location whose zone the browser does not know
- **WHEN** the user opens its location menu
- **THEN** it offers only "Remove"

### Requirement: Home strings are localized
Every string of the home location, the location menu and their announcements SHALL exist in English and Russian with identical key sets. <!-- implements FR12 of set-home-location-and-show-differences -->

#### Scenario: Russian interface
- **GIVEN** the interface language is Russian
- **AND** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens Moscow's location menu
- **THEN** the menu is named «Действия: Москва» and offers «Сделать домашним» and «Удалить»
- **AND** the home mark of Almaty is named «Домашнее место»

### Requirement: Set and clear home in every view
Setting and clearing the home location SHALL be part of the view contract: every registered view MUST let the user make a location home, see the home mark and clear it. <!-- implements FR13 of set-home-location-and-show-differences -->

#### Scenario: Set and clear home
- **GIVEN** the list is Almaty and Moscow
- **WHEN** the user makes Moscow home
- **THEN** Moscow shows the home mark and Almaty shows its offset difference from Moscow
- **WHEN** the user clears home
- **THEN** no row shows the home mark

### Requirement: Home is accessible and fits every screen
With and without home, in the travelling state and with a location menu open, the list SHALL have no axe-core violations in the light and dark themes and MUST NOT scroll horizontally at 320 px and 2560 px. The approved screenshots at 375 px and 1024 px in both themes MUST include the "home" and "travelling" states. <!-- implements NFR-A1, NFR-R1, NFR-R2 of set-home-location-and-show-differences -->

#### Scenario: No accessibility violations
- **WHEN** each home state is checked with axe-core in the light and the dark theme
- **THEN** no violations are reported

#### Scenario: Narrow and wide screens
- **GIVEN** home is Almaty and the list holds Almaty, Kathmandu and New York
- **WHEN** the list is shown at 320 px or 2560 px with a location menu open
- **THEN** the page does not scroll horizontally

#### Scenario: Screenshots
- **WHEN** the "home" and "travelling" states are shown at 375 px and 1024 px in each theme
- **THEN** they match the approved screenshots
