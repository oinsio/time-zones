# Add the settings page and the device time location

Builds on the archived `add-main-page-scaffold`, `add-locations-via-search`, `set-home-location-and-show-differences`, `show-here-entry-for-device-time`, `add-wall-time-input-with-hint`, `select-date-with-calendar-and-now` and `keep-now-button-visible-when-live`, which are all on `main`. The only other active change, `add-pr-preview-deploy`, touches CI and preview hosting, not the client, so nothing blocks this one.

## Why

The interface still differs from the approved screens (`docs/design/screens/`) and behaves awkwardly in several places:

- The header has no settings button and no Add location button. "Add location" sits below the list, and there is no settings page at all, so the user cannot choose the theme or the hour format.
- The device time is a derived Here entry ([ADR-0007](../../../docs/adr/0007-reference-zone-and-device-time.md)). It cannot be removed, moved or made home, it has no menu and no drag handle, and it cannot be added back from the search. Users read it as a broken card.
- "No locations added yet." is shown under the Here entry, although the screen clearly shows a time zone.
- A user who removes everything gets the Here entry back on every launch: the screen never matches the list they kept.
- Below 768 px the date bar pushes the day arrows to the left edge and Now to the right edge, and at 768 px it jumps into a centred group. Resizing the window makes the controls jump.

Audience: every user of the app, on phones and wide screens, in both themes.

## What Changes

- ADDED capability `settings`: a settings page opened from a settings button in the top right corner of the header. It offers the **theme preference** (Light, Dark, System, with the lucide icons Sun, Moon and Monitor) and the **hour format** (12-hour, 24-hour). Both apply at once to the whole app, are stored on the device, are restored on the next launch, also offline, and are shared between open tabs. Every time label follows the hour format, and the wall-time input also accepts 12-hour text.
- MODIFIED `main-page` "Main page regions" and "Empty state", ADDED "Header actions": the header holds the title, the Add location button and the settings button, laid out as in the design screens. Below 768 px the Add location button is an icon-only "+". From 768 px it shows "+ Add". The content region no longer has its own Add location button. The empty-state explanation is shown only when the location list is empty.
- MODIFIED `app-shell` "Theme follows the system and uses design tokens": the theme follows the theme preference. System, the default, still follows the system color-scheme preference.
- REMOVED `locations` "Here entry …" (14 requirements). ADDED **Device time location** requirements. The device time becomes a location kind of the list. It shows and follows the device time zone. It has the same controls as every card: drag handle, keyboard reorder, and a location menu with Make home / Clear home and Remove. It is stored as a list entry without a zone, so the device time zone itself is still never stored. MODIFIED "Location identity", "List in the Cards view", "List is kept on the device" (schema version 3, the first-launch list, migration) and "Unreadable stored list" (Reset shows the first-launch list).
- ADDED `home-location` "Device time location as home".
- ADDED `location-search` "Device time in the search": the search offers "Device time" while the list has no device time location.
- MODIFIED `date-selection` "Date bar layout": the arrows, the date and Now form one centred group at every width, so nothing jumps or sticks to the screen edges.
- MODIFIED `date-selection` "Wall-clock resolution on the new date" and `time-selection` "Wall-time input is never stored": their text names the device time location instead of the Here entry. Behaviour and scenarios are unchanged.
- MODIFIED `time-selection` "Local hour labels", "Accepted wall-time text", "Wall-time input on every row", and `locations` "Local time and date on location rows": time texts follow the hour format. MODIFIED `time-selection` "A wall-time input pins the reference moment" and "Wall-time hint lifetime", and `location-search` "Search is fast and lazy" and "Open the search with the slash key": the device time location takes the place of the Here entry, and the slash key belongs to the header button.
- **BREAKING (stored data):** the locations document moves from schema version 2 to 3. Older documents are migrated on load: the device time location is put first, and the order and home are kept.

Glossary and documents. The implement stage writes only under `packages/`, so these are delivered as handoff patches:

- H1 `docs/adr/0009-device-time-location.md` (new) partly supersedes ADR-0007: its "Here marker" section (derived Here entry) and its "First launch" section. The reference zone rule, the Here mark and "the device time zone is never stored" stay. ADR-0007's status line and `CLAUDE.md`'s ADR list are updated in the same patch.
- H2 glossary and architecture documents:
  - NEW **Device time location** (RU «Время устройства»), **First-launch list**, **Settings page** (RU «Настройки»), **Settings button**, **Preferences**, **Theme preference** (RU «Тема»: «Светлая», «Тёмная», «Системная»), **Hour format** (RU «Формат времени»: «12 часов», «24 часа»), in `docs/glossary/locations.md` and a new context file `docs/glossary/settings.md`;
  - REMOVED **Here entry**, replaced by the device time location;
  - CHANGED **Location** (two kinds: a city location and the device time location), **Location list** (schema version 3, the first-launch list), **Port**, **Repository** and **Tab sync** (preferences too), **Shell** (header actions);
  - `docs/architecture/views.md`, `domain-model.md` and `overview.md` are aligned with these terms.
- Used as they are: location, location list, Here mark, Home mark, home location, reference zone, device time zone, reorder, drag handle, location menu, date bar, Now button, wall-time input, wall-time hint, gap note, notice, storage unavailable, offline, view contract.

## Capabilities

### New Capabilities

- `settings`: the settings page, the theme preference and the hour format, how they are stored and shared, and how the hour format shapes every time text.

### Modified Capabilities

- `main-page`: MODIFIED "Main page regions" and "Empty state"; ADDED "Header actions".
- `app-shell`: MODIFIED "Theme follows the system and uses design tokens".
- `locations`: MODIFIED "Location identity", "List in the Cards view", "List is kept on the device", "Unreadable stored list" and "Local time and date on location rows"; REMOVED the 14 "Here entry" requirements; ADDED the device time location requirements.
- `home-location`: ADDED "Device time location as home".
- `location-search`: MODIFIED "Search is fast and lazy" and "Open the search with the slash key" (the header button, the device time location instead of the Here entry); ADDED "Device time in the search".
- `date-selection`: MODIFIED "Date bar layout" and "Wall-clock resolution on the new date" (the device time location instead of the Here entry).
- `time-selection`: MODIFIED "Local hour labels", "Accepted wall-time text", "Wall-time input on every row", "A wall-time input pins the reference moment", "Wall-time hint lifetime" and "Wall-time input is never stored" (hour format, and the device time location instead of the Here entry).

## Goals

- G1: The main page header matches the approved phone and tablet screens: Add location and Settings in the header, at the design positions.
- G2: A user can choose the theme and the hour format in at most 3 interactions from the main page, and the choice survives a reload.
- G3: The device time card offers exactly the controls of every other card: drag handle, location menu, Make home / Clear home, Remove.
- G4: The screen always shows the list the user kept. The device time location is added automatically only on the first launch.
- G5: Resizing the window from 320 px to 2560 px never moves a date bar control to a screen edge or makes it jump.

## Non-Goals

- NG1: Choosing the interface language or the view mode in settings (planned in `docs/architecture/views.md`; they come with a later change).
- NG2: An hour format that follows the language (`HourFormat.LOCALE` in `domain-model.md`). This change offers only 12-hour and 24-hour, with 24-hour as the default.
- NG3: URL routing. The settings page is a page of the shell, not an address.
- NG4: Changing the reference zone rule, the Here mark rule or how the device time zone is read (ADR-0007 keeps these).
- NG5: Redrawing the approved design screens. They show no settings page, and its look is built from the existing design tokens.
- NG6: Touching the active change `add-pr-preview-deploy` or CI.

## Users & Scenarios

- U1: A new user opens the app. The list holds the device time location "Almaty — Device time". They add Moscow from the header "+" and later remove the device time location. On the next launch they see Moscow only.
- U2: A user who removed everything reopens the app and sees "No locations added yet." with the header's Add location button. They open the search and choose "Device time" to get it back.
- U3: A traveller makes the device time location home, so the reference day and differences follow wherever the device is. They drag it below Moscow.
- U4: A user opens Settings from the top right corner, picks Dark and 12-hour, and goes back. Every card shows `3:30 AM`-style times in the dark theme, also after a reload and in their other tab.
- U5: A user narrows the browser window. The date bar stays one centred group and never jumps.

## Requirements

### Functional

- FR1: The header shows a settings button in its top right corner on every width. It shows the settings (sliders) icon, its accessible name is "Settings" («Настройки»), and it opens the settings page.
- FR2: The header shows the Add location button, which opens the location search. Below 768 px it is an icon-only "+" before the title, as on the phone screen. From 768 px it is "+" with the visible label "Add" («Добавить»), right of the title and before the settings button, as on the tablet screen. Its accessible name is "Add location" («Добавить место») on every width. The slash shortcut still opens the search. The content region shows no other Add location button.
- FR3: The settings page has the heading "Settings" and a back button "Back" («Назад»). The back button and Esc return to the main page. It uses the app's background, surface, accent tokens and typography. It shows no date bar, and notices are still shown. Opening it moves the focus to its heading, and leaving it moves the focus back to the settings button.
- FR4: The settings page offers the theme preference as three options with icons and labels: Light (Sun, «Светлая»), Dark (Moon, «Тёмная») and System (Monitor, «Системная»). System is the default. A choice applies to the whole app at once. While System is chosen, the theme follows the system color-scheme preference, also when that changes while the app is open. A stored Light or Dark choice is applied before the main page is first shown.
- FR5: The settings page offers the hour format as two options: 12-hour («12 часов») and 24-hour («24 часа»). 24-hour is the default. A choice applies at once to every time text: the local time of every card, the day track hour labels, the wall-time input's initial text, the wall-time hint and the date bar's gap note.
- FR6: The wall-time input accepts, in both hour formats, the 24-hour texts it accepts today and 12-hour texts with an AM/PM marker (`9 PM`, `9:30pm`, `09:30 AM`), case-insensitive and with any whitespace before the marker. `12 AM` is `00:00` and `12 PM` is `12:00`. Any text the app shows as a local time in either format is accepted unchanged.
- FR7: The preferences are kept on the device as a versioned document and restored on the next launch, also offline. Nothing is written until the user changes a setting. An unreadable stored document leaves the defaults in force, and the settings page then shows a note with a Reset action that clears it. With storage unavailable, choices apply for the session, and the settings page says they will not be saved. A change in one tab is applied in the other open tabs.
- FR8: The device time location is a location of the list that shows the device time zone and follows it whenever the device time zone is read (at start, at every minute tick, when the page becomes visible). It is named by the exemplar city of the device time zone in the interface language. Until the zone cities data is loaded, or when loading fails, the name is derived from the time zone ID. Its meta line "Device time · UTC+5" («Время устройства · UTC+5») stands in place of the country and UTC offset. It shows the Here mark, or the Home mark while it is home. The list holds at most one device time location. An unknown device time zone is shown as `UTC`.
- FR9: The device time location has the same controls as every other card: a drag handle and keyboard reorder, and a location menu with Make home / Clear home and Remove. It is an item of the numbered location list and counts in reorder positions and announcements. Removing it takes it out of the list like any location.
- FR10: The device time location can be the home location. Then the reference zone is the device time zone, and it follows the device time zone when it changes.
- FR11: While the list has no device time location, the search shows a "Device time" option first. It is shown when the query is empty, and when a word of "Device time" or «Время устройства» starts with the query. It is shown whatever the search data state is: loading, failed or ready. Choosing it adds the device time location to the end of the list, closes the search and announces the addition politely. While the list has a device time location, the option is not shown.
- FR12: On the first launch, when no locations document is stored, the location list is the first-launch list: only the device time location. Nothing is written until the user changes the list or the home location. Reset of an unreadable stored list also shows the first-launch list.
- FR13: The user can remove every location, the device time location included. The empty list is stored and restored on the next launch without the device time location. The empty-state explanation "No locations added yet." is shown only while the list is empty, and never while it holds any location, including only the device time location.
- FR14: A stored locations document of version 1 or 2 is migrated on load. The device time location is put first, and the other locations keep their order and the home location. The migrated list is not written until the user changes it.
- FR15: The date bar's day arrows, date and Now form one group centred in the bar at every width from 320 px to 2560 px. They keep the same gaps across widths and never touch the screen edges, so nothing jumps while the window is resized.
- FR16: Every new string exists in English and Russian. This covers the settings button, the settings page with its heading, back button and options, the Add label, the "Device time" search option and the preference notes. Russian uses the glossary names.
- FR17: Opening settings, switching the theme and the hour format, and removing, reordering and making home the device time location are part of the view contract. They hold for every registered view.

### Non-Functional

#### Performance

- NFR-P1: Presenting 50 location rows again with unchanged preferences builds no formatter. After an hour format switch, presenting builds at most one formatter per time zone and label kind in use. The device time location costs no more time zone transition lookups than a city location row. This is checked as work bounds (ADR-0008).
- NFR-P2: The zone cities data is requested only while the device time location is in the list or the search is open, at most once per page while no load fails. Showing the device time location never waits for it.

#### Accessibility

- NFR-A1: axe-core reports no violations on the main page (narrow and wide header), on the settings page, and with the device time location shown, in the light and the dark theme.
- NFR-A2: The theme options and the hour format options are each a radio group named "Theme" («Тема») and "Hour format" («Формат времени»). They are operable with Tab and the arrow keys, and the checked option is exposed. Tab reaches the header buttons in reading order. Esc and the back button leave settings, and the focus lands on the settings button.
- NFR-A3: The header buttons and every settings option are at least 44 × 44 px. The checked option is marked by more than colour (a check icon), and its text is at least 4.5:1 against its background in both themes.

#### Responsive

- NFR-R1: The main page and the settings page do not scroll horizontally at 320 px and 2560 px. Below 768 px the header shows "+", the centred title and the settings button. From 768 px it shows the title at the left and "+ Add" and the settings button at the right.
- NFR-R2: At 320, 375, 767, 768, 1024 and 2560 px, the date bar group is centred within 1 px, and the gap between the next-day button and Now is the same within 1 px. The group keeps at least 8 px from each side of the viewport.
- NFR-R3: The approved screenshots of the main page states are re-approved with the new header. New screenshots of the settings page are approved at 375 px and 1024 px in both themes.

## UX Acceptance Criteria

- UX1: The header looks like the design screens: accent-coloured "+" and sliders icons, the phone layout below 768 px and the tablet layout from 768 px.
- UX2: The settings page reads as part of the app: the same background, surface cards with the theme border, Manrope, and the accent colour for the checked option.
- UX3: The device time card cannot be told apart from a city card by its controls. It differs only in its name, the Here mark and the "Device time" meta line.
- UX4: The date bar stays one centred group while the window is resized and never jumps between layouts.
- UX5: Switching the theme or the hour format changes the screen at once, without a reload and without a loading state.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| offline or online | first launch, nothing stored | the device time location only; no empty-state text; nothing stored |
| offline or online | list empty (user removed everything) | empty-state explanation; header Add location button; date bar |
| offline or online | list with the device time location and cities | one card per location, the device time location with full controls |
| offline or online | zone cities data loading or failed | device time location named from the time zone ID; no error shown |
| offline or online | stored locations unreadable | load error with Reset; Reset shows the first-launch list |
| offline or online | storage unavailable | storage warning; list and settings work for the session; settings page says choices are not saved |
| offline or online | stored preferences unreadable | defaults apply; settings page note with Reset |
| offline or online | settings page open | heading, back button, theme and hour format groups; no date bar; notices still shown |
| offline | search open | "Device time" option shown in every search data state; city results as before |

There is no loading state for the preferences: they are read synchronously at start.

## Behavior

Features live in `packages/client/src/test/features/` and are tagged `@add-settings-page-and-device-time-location`:

- `settings/settings_preferences_unit.feature`, `settings/settings_storage_unit.feature`, `settings/settings_hour_format_unit.feature`, `settings/settings_e2e.feature`, `settings/settings_view_contract_e2e.feature` (new);
- `locations/locations_device_time_unit.feature`, `locations/locations_device_time_storage_unit.feature`, `locations/locations_device_time_e2e.feature`, `home_location/home_location_device_time_unit.feature` (new); `locations/locations_migration_unit.feature`, `locations/locations_persistence.feature`, `locations/locations_view_contract_e2e.feature` and `locations/locations_ui_e2e.feature` (changed); the `locations_here_entry_*` features are deleted;
- `location_search/location_search_device_time.feature` (new);
- `main_page/main_page_header_e2e.feature` (new), `main_page/main_page_states_unit.feature` (changed);
- `date_selection/date_selection_layout_e2e.feature` (changed).

## Visual Reference

`docs/design/screens/phone-light.png`, `phone-dark.png` and `tablet-light.png` show the header with "+" or "+ Добавить" and the settings button. `phone-no-home.png` shows the device time card ("здесь", "Время устройства"). From this change it also has the drag handle and the "⋯" menu like every card. No screen shows the settings page. It is built from the design tokens, which stay the source of truth.

## Affected IA

No IA document exists (`docs/ia/` is absent). The page structure changes in `docs/architecture/views.md` through handoff H2.

## Success Metrics

- M1: In 4 of 4 header checks (375 px and 1024 px × light and dark), the settings button is the rightmost header control and the Add location button is at the design position: before the title at 375 px, between the title and the settings button at 1024 px.
- M2: From the main page, the theme or the hour format is changed in exactly 2 activations (the settings button, then the option). After a reload, 2 of 2 stored choices are in force.
- M3: The device time card's location menu offers the same 2 items as a city card (Make home or Clear home, and Remove). It has 1 drag handle, and in 2 of 2 reorders (pointer and keyboard) it moves like a city card.
- M4: 0 empty-state texts are shown in 3 of 3 non-empty states: first launch, the device time location only, and the device time location with Moscow. After removing all locations and reloading, the list has 0 items in 1 of 1 runs.
- M5: At 6 of 6 widths (320, 375, 767, 768, 1024, 2560 px), the date bar group is centred within 1 px and the next-day-to-Now gap differs by at most 1 px between widths.
- M6: axe-core reports 0 violations in 6 of 6 checks: main page, settings page and device time location × light and dark.
- M7: Unit BDD on 50 rows: presenting again with unchanged preferences builds 0 formatters. After an hour format switch it builds at most 1 formatter per zone and label kind.
- M8: Scoped Stryker runs on the new and changed model, preferences, presenter and adapter files score at least 95% each (minimum acceptable 90%).
- M9: The traceability loop of task 10.1 prints nothing: every FR, NFR and UX id of this proposal has a test tagged with this change.

## Open Questions

None. Decisions taken without a human are recorded in `design.md`: 24-hour as the default hour format, the settings page as shell state instead of a URL, the migration putting the device time location first, and the search option hidden while the device time location is listed.
