# Add tools and the first tool: the Unix time converter

The decisions were taken with the owner on 23 November 2026 in a discussion on the branch `add-unix-time-converter`. Reference sites studied: savvytime.com/unix-timestamp, epochconverter.com, unixtimestamp.com, time.is/Unix_time_converter.

## Why

1. **A Unix time from a log says nothing to a person.** A developer who reads `1700000000` or `1700000000123` in a log has to leave the app, convert it on another site and then come back to see what time that was for the colleagues whose zones the app already holds.
2. **Other converters show two zones.** They print UTC and the device's zone. The user of this app keeps a location list, and wants the exact time in every one of those locations at once.
3. **Few users need it.** A converter in the header of every user would be noise. The app has no place for a capability that only some users turn on.
4. **More such capabilities are coming** (folders of locations is the next one), so the place has to be a mechanism, not a one-off switch.

Audience: developers, testers and support engineers who read logs and already use the app for their zones. No urgency from a defect; the owner asked for it as the next feature.

## What Changes

- **ADDED** the **tool**: an optional capability of the app, off by default, described by one entry of the **tool registry**.
- **ADDED** the **tools group** of the settings page: one icon toggle per registered tool, each on or off by itself, with no visible caption per toggle.
- **ADDED** the **tool button**: a header button between Add location and the settings button for every enabled tool that has a page.
- **ADDED** the **tool page**: the page of a tool, a third kind of page of the shell beside the main page and the settings page.
- **ADDED** the **Unix time converter**, the first tool: a tool page that turns a Unix time or an ISO 8601 text into the exact local time of every location of the list, and back.
- **ADDED** the **converter moment**: the converter's own moment, live or pinned, separate from the reference moment and never stored.
- **ADDED** the **exact instant**: an instant known to the nanosecond, held without BigInt.
- **ADDED** **Show on main page**: the one link from the converter to the main page; it pins the reference moment to the converter moment with the seconds dropped.
- **MODIFIED** the **header**: it shows the tool buttons between its two buttons.
- **MODIFIED** the **toggle group**: an option may be shown by an icon alone.
- **MODIFIED** the **preferences**: they gain the enabled tools.
- New glossary terms: tool, tool registry, tools group, enabled tools, tool button, tool page, tool session, Unix time, Unix time unit, unit detection, unit choice, exact instant, converter moment, Unix time converter, converter input, converter row, exact wall-time input, moment notation, relative time, second tick, text copying, converter view, converter view registry. Changed terms: instant (its *Never:* list), live, pinned, toggle group, preferences, settings page, view registry.

No breaking change for stored data: the preferences document is migrated.

## Capabilities

### New Capabilities

- `tools`: the tool registry, the tools group, the enabled tools kept on the device, the tool buttons, opening and leaving a tool page.
- `unix-time-converter`: the converter page — the converter input, unit detection, the converter rows, the exact wall-time input, the moment notations, relative time, live and Now, Show on main page, states, accessibility and layout.

### Modified Capabilities

- `main-page`: "Header actions" (the tool buttons between Add location and the settings button).
- `settings`: "Toggle group" (icon options) and "Settings page layout" (the tools group and its place).

## Goals

- **G1** A user turns a tool on or off in the settings with one action per tool, and a user who never does sees no trace of any tool outside the settings.
- **G2** A user pastes a Unix time from a log and reads the exact local time in every location of the list, to the precision of the pasted value.
- **G3** A user enters a local date and time of any precision in any location and copies its Unix time.
- **G4** Precision to the nanosecond on every supported engine, iOS Safari 12.5 included, with one code path.
- **G5** A new tool is one registry entry and its folder; a new design of the converter page is one view registry entry and its folder.
- **G6** The initial JavaScript of the main page does not grow by the converter.

## Non-Goals

- **NG1** No folders tool and no other tool; only the mechanism and the converter.
- **NG2** No visible caption under a tool toggle, and no page that describes the app's features (a later change).
- **NG3** No Discord timestamp tag, no RFC 2822 or RFC 3339 rows, no code snippets, no start and end of the day, month or year.
- **NG4** No link that carries the converter moment; the app has no URL state.
- **NG5** A number typed into the location search is not recognised as a Unix time.
- **NG6** No link from the main page into the converter: the converter never reads the reference moment.
- **NG7** No setting that chooses a converter view while one view is registered.
- **NG8** The converter moment and the converter input are not stored across reloads.
- **NG9** No menu that collects tool buttons when many tools are enabled; decided when a third tool page exists.
- **NG10** No leap-second handling beyond Unix time's own rule (a leap second is not counted).

## Users & Scenarios

- **U1** Pavel reads `1795432987123` in a server log. He opens the converter, pastes it and reads the exact time in Almaty, Moscow and New York, the locations of his list: «14:23:07.123» in Moscow.
- **U2** A log line holds `2026-11-23T14:23:07.123456+03:00`. Pavel pastes it into the same field and copies its Unix time in microseconds for a database query.
- **U3** Aigerim needs the Unix time of 09:00:00 tomorrow in New York. She types the time into the New York row, picks the date in the calendar and copies the seconds.
- **U4** Pavel wants to see what part of the day that log moment was for everyone. He chooses Show on main page and sees the day tracks at 14:23.
- **U5** Marat never reads logs. He never opens the tools group, and his header stays the title, "+" and the gear.

## Requirements

### Functional

- **FR1** The app has a tool registry. A tool has an id, a name, an icon and, when it is a page, its page. Tools are listed in registry order everywhere.
- **FR2** The settings page shows the tools group «Инструменты»: one toggle per registered tool, shown by the tool's icon alone. Each toggle is independent. Every tool is off by default.
- **FR3** The enabled tools are kept in the preferences on the device and shared between open tabs. A stored tool that is not registered is ignored and kept.
- **FR4** The header shows one tool button for every enabled tool that has a page, in registry order, between the Add location button and the settings button. A tool button opens its tool page.
- **FR5** A tool page has the tool's name as its only heading and a back button. The back button and Esc return to the main page with its locations and reference moment unchanged. The date bar is not shown; the notices keep working. Turning a tool off in another tab while its page is shown returns to the main page.
- **FR6** The converter input accepts a Unix time as a whole number with an optional minus sign, a Unix time in seconds with a decimal fraction of up to 9 digits, or an ISO 8601 date and time with `Z` or a UTC offset. Spaces, underscores and commas that group the digits by three are ignored in a number. A valid text sets the converter moment as it is typed, and the input keeps the text as typed.
- **FR7** The Unix time unit of a whole number is detected by its digit count: up to 11 digits seconds, 12–14 milliseconds, 15–17 microseconds, 18 and more nanoseconds. The unit in force is shown beside the input, and the user can fix any of the four units instead of detection.
- **FR8** The converter moment keeps every digit the user gave, down to the nanosecond, on every supported engine. Its precision is the unit of the value it came from.
- **FR9** The page lists one converter row per location of the list, in list order: the city label, the zone line, the local date and the local time with seconds and the fraction of the moment's precision, in the hour format of the settings. With an empty list it shows one row for the device time zone.
- **FR10** The local time of a converter row is editable: typing a time with optional seconds and a fraction of up to 9 digits sets the converter moment to that wall-clock time in that location's zone. The date of a row is chosen in the calendar. A time in a DST gap or a DST overlap follows the rules and the hint of the wall-time input.
- **FR11** Every field shows the same converter moment: a change in the converter input, in any row or in the calendar updates all the others.
- **FR12** The page shows the moment notations of the converter moment — seconds, milliseconds, microseconds, nanoseconds and ISO 8601 with `Z` — each with a copy action. A coarser unit drops the finer digits towards the past.
- **FR13** The page shows the relative time between the converter moment and the current time in the largest fitting unit («3 дня назад», «через 2 часа», «сейчас»).
- **FR14** The converter moment is live when the page first opens: the input shows the current Unix time in seconds and follows the clock every second. Typing, editing a row or choosing a date pins it. Now returns it to live. While the app stays open, leaving and reopening the page keeps the moment, its mode and the input text.
- **FR15** An input that cannot be read, or a moment outside the range the app's time library supports, shows a message under the field it was typed in; the converter moment and every other field stay as they were.
- **FR16** Show on main page pins the reference moment to the converter moment with the seconds and the fraction dropped, and shows the main page. Nothing else flows between the two pages except the location list and its order.
- **FR17** The converter's views are listed in a converter view registry; the page shows the first registered view. Every view shows the same presented data and sends the same commands.
- **FR18** Every text of the tools group, the tool button and the converter is localized in Russian and English, and uses the settings' hour format, zone label and interface language.

### Non-Functional

#### Performance

- **NFR-P1** The converter page, its model and its presenter are not in the initial JavaScript of the main page; `pnpm check:bundle-size` passes without raising a budget.
- **NFR-P2** A second tick of the live converter builds no new `Intl` formatter (a work bound, ADR-0008).
- **NFR-P3** Production sources hold no BigInt; the source scan of ADR-0009 keeps passing.

#### Accessibility

- **NFR-A1** Every tool toggle and tool button has the tool's name as its accessible name and pointer hint, a pressed state on the toggle, and a target of at least 44 × 44 px.
- **NFR-A2** Opening the converter moves the focus to the converter input with its text selected on a device with a fine pointer that can hover, and to the page heading on a touch device; leaving moves the focus to the tool button. Every field, unit option and copy action is reachable and operable by keyboard, in visual order.
- **NFR-A3** Messages under a field are tied to the field and announced politely; a copy is announced politely; the live second tick is not announced.
- **NFR-A4** axe-core reports no violation of the settings page with the tools group, of the header with a tool button and of the converter page, in the light and the dark theme.

#### Responsive

- **NFR-R1** From 320 px to 2560 px wide the header with one tool button and the converter page never scroll horizontally; the title stays on one line (with a tool button it is 20 px up to 337 px wide, 23 px up to 367 px, then 27 px); the converter uses the content column of the main page.
- **NFR-R2** A nanosecond time in the 12-hour format and a 22-digit Unix time fit at 320 px without clipping: they wrap or shrink, never overflow.

## UX Acceptance Criteria

- **UX1** The converter looks like the rest of the app: design tokens only, rows as surface cards with the card border, the row header parts of the main page (city label, zone line), the Manrope font with tabular digits for every number.
- **UX2** A tool toggle shows no text. On: the accent colour for its icon and border. Off: the muted foreground and the control border. Toggling moves nothing.
- **UX3** A tool button looks like its two neighbours: a 27 px Lucide icon in the accent colour, no text.
- **UX4** With a mouse the main scenario takes two actions from the main page: the tool button, then paste; on a touch device three: the tool button, the field, paste. No Convert button exists.
- **UX5** A copy action confirms in place (the icon turns into a check for a short time); no dialog and no page-wide notice.
- **UX6** The converter input is the largest element of the page; the converter rows follow it directly, before the moment notations.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | tool off | no tool button; the settings toggle is off |
| any | tool on, page first opened | live: the input ticks the current Unix time in seconds, rows show the current time, relative time «сейчас», Now inactive |
| any | valid Unix time typed | pinned: unit shown, rows and notations at the moment's precision, Now active |
| any | valid ISO 8601 text typed | the same; the input keeps the typed text |
| any | unreadable text | message under the input; rows and notations keep the last moment |
| any | value outside the supported range | message under the input; the rest unchanged |
| any | empty input | hint in place of a message; rows and notations keep the last moment |
| any | row time in a DST gap or overlap | the moment is set by the wall-time rules; the wall-time hint under that row |
| any | location list empty | one row for the device time zone |
| any | location list loading | the row skeleton of the main page; the input already works |
| any | location list unreadable | one row for the device time zone; the load error stays on the main page |
| any | tool on, 320 px wide | the title is 20 px and on one line beside three buttons |
| any | page chunk fails to load | the view error fallback with Retry, as for a view |
| any | copy refused by the browser | message beside the copy action; the value stays selectable |
| any | storage unavailable | the tool can be turned on for this session; the storage warning as today |
| offline | any | the same as online: the converter needs no network |

## Behavior

- `packages/client/src/test/features/tools/tools_preferences_unit.feature` — enabled tools kept on the device (`@add-unix-time-converter-tool @FR3`).
- `packages/client/src/test/features/tools/tools_unit.feature` — registry, tools group, tool buttons, loading a tool page, strings (`@FR1 @FR2 @FR4 @FR18 @NFR-P1`).
- `packages/client/src/test/features/tools/tools_e2e.feature` — pressed toggles, opening and leaving a tool page (focus, Esc, notices, other tabs), loading on demand and offline, axe-core, layout (`@FR2 @FR3 @FR5 @NFR-P1 @NFR-A1 @NFR-A4 @NFR-R1`).
- `packages/client/src/test/features/main_page/main_page_header_e2e.feature` — the header with a tool button (`@FR4 @NFR-R1`).
- `packages/client/src/test/features/unix_time_converter/unix_time_reading_unit.feature` — reading a text, unit detection, precision with and without BigInt, range (`@FR6 @FR7 @FR8 @FR15`).
- `packages/client/src/test/features/unix_time_converter/unix_time_converter_unit.feature` — rows, linked fields, notations, relative time, live, Show on main page (`@FR9`–`@FR14 @FR16 @FR17`).
- `packages/client/src/test/features/unix_time_converter/unix_time_converter_budget.feature` — work bounds (`@NFR-P2`).
- `packages/client/src/test/features/unix_time_converter/unix_time_converter_e2e.feature` — the converter view contract: focus, keyboard, announcements, copy, the moment kept across pages, Show on main page, axe-core, layout, screenshots (`@FR12 @FR14 @FR16 @NFR-A2`–`@NFR-A4 @NFR-R1 @NFR-R2`).

## Visual Reference

No Figma file. The page is built in the current style from the tokens of `docs/architecture/views.md`; the approved screenshots of this change are produced by its screenshot tests and linked from `docs/design/README.md`.

## Affected IA

No changes: the project has no `docs/ia/` documents.

## Success Metrics

- **M1** With no tool enabled the header shows exactly 2 buttons and the initial JavaScript is within today's budget.
- **M2** `1795432987123` shows «14:23:07.123» for Moscow and `1795432987123456789` shows «14:23:07.123456789», in 3 of 3 checks: the unit scenarios, the unit scenario with `BigInt` removed (the iOS Safari 12.5 case) and the Chromium end-to-end scenario; `pnpm check:legacy-build` passes with the converter chunk.
- **M3** 100 % of the detection cases of the delta spec pass (digit counts 1, 11, 12, 14, 15, 17, 18, 22; negative values; decimal fraction).
- **M4** A round trip — a row time typed with 9 fraction digits, then the nanoseconds notation typed back into the converter input — gives the same row text in 100 % of the scenario's examples.
- **M5** From the main page the main scenario takes 2 actions with a mouse and 3 on a touch device.
- **M6** axe-core reports 0 violations of the converter page in both themes at 320, 390 and 1280 px.
- **M7** Mutation score of the new model, presenter and preferences files is at least 95 % (minimum 90 %).
- **M8** A second converter view added in a test needs 0 changes outside the converter view registry and its own folder.

## Open Questions

- **Q1** How do tool buttons fit the header at 320 px once three or more tool pages exist (NG9)?
- **Q2** Should the features page of a later change replace the pointer hint as the only explanation of a tool toggle on touch screens, where no hint appears?

## Impact

- Model: Unix time reading and units, the exact instant, the converter moment and its commands.
- Preferences: one new field and a schema migration (version 9).
- Presenter: converter rows, moment notations, relative time, messages; a time-with-seconds label kind.
- Ports and adapters: a text copying port; the clipboard code of the text sharing adapter moves behind it.
- Controller: the converter hook, the second tick, the enabled tools hook.
- New module `src/tools/`: the tool registry, the tool page frame, the converter page. New module `src/views/unixTimeConverter/`: the converter view registry and the first converter view.
- App shell: page state gains the tool page; the header gains the tool buttons.
- Settings: the tools group; the toggle group takes icon options.
- Translations: `ru.json`, `en.json`.
- Docs: glossary, `docs/architecture/`, `docs/design/README.md`. Three ADRs (tools and the tool registry; exact instants without BigInt; view registries of tool pages), their line in `CLAUDE.md` and the end of the "in development" mark of both READMEs come as handoff patches for the owner to apply (`tasks.md` → Human follow-up); both READMEs already link the two new capabilities.
- No new dependency.
