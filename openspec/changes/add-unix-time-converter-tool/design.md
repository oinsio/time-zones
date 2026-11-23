# Design: add-unix-time-converter-tool

## Context

Motivation: proposal.md → Why. Behaviour: the spec deltas `tools`, `unix-time-converter` (new), `main-page`, `settings`.

Today the shell has two pages, held as state and not as URLs (`AppPage.MAIN | SETTINGS` in `app/appPage.ts`; the state, the Esc handler and the returned focus live in `AppShell.tsx`, 198 lines). The header gets its buttons from `AppShell` (`LocationSearch`, `SettingsButton`). Views are swappable through `viewRegistry` and `resolveActiveView` (ADR-0005). The model keeps instants as `Temporal.Instant` and compares them in milliseconds; production sources hold no BigInt and never read `epochNanoseconds` (ADR-0009, `noBigIntInSources.test.ts`). The clock ticks once a minute (`useMinuteTick`, `TickScheduler`).

ADRs that bind this change: 0002 (layers), 0003 (instants, wall-clock rules), 0004 (preferences document and migrations), 0005 (view registry), 0008 (work bounds), 0009 (no BigInt, legacy engine).

Three decisions reach beyond this change and belong in ADRs: **ADR-0020** tools and the tool registry (D1, D2), **ADR-0021** exact instants without BigInt (D4), **ADR-0022** view registries of tool pages (D9). The implement stage may not write `docs/adr/` or `CLAUDE.md` (`.gnomish/stages/specify/handoff.md`), so it drafts them as the handoff patch H1 (`tasks.md` → Human follow-up), and no checkbox task depends on them. This file records them in short and holds the local decisions.

Owners of the concepts this change touches (`docs/glossary/`), each extended, none duplicated:
- **Preferences**: `Preferences`, `reducePreferences`, `parseStoredPreferences`, `createPreferencesMigrations`, `PREFERENCES_SCHEMA_VERSION` (today 8).
- **Toggle group**: `SettingsToggleGroup` (`views/shared/`).
- **View registry**: `viewRegistry`, `resolveActiveView`, `createRetryableLazyView`, `ViewErrorBoundary`, `ViewSkeleton`.
- **Live / Pinned**: `ReferenceMode`. **Time selection**: `SELECT_INSTANT` (clears the meeting range).
- **Wall-clock time** and **status**: `resolveWallClock`, `WallClockStatus`; its hint `presentWallTimeHint`, `WallTimeHint`; its typed text `parseWallTimeInput`, `formatTypedWallTimeText`.
- **Zone line**, **city label**, **UTC offset**, **zone abbreviation**, local date: `presentZoneLine`, `getUtcOffsetMinutes`, `formatUtcOffset`, `formatZoneAbbreviation`, `useCityLabels`, `useExemplarCity`, `getLocalDateTime`, `getDateTimeFormatter` / `DateTimeLabelKind`. `presentZoneMoment` is not reused: it also builds the day track, the offset difference and the row notes of the reference day.
- **Calendar**: `CalendarDialog`, `useCalendarMonth`. **Now button**: the look of the one in `DateBar`.
- **Minute tick**: `useMinuteTick`, `TickScheduler`, `getMillisecondsUntilNextMinute`.
- **Text sharing**: `TextSharing`, `browserTextSharing` (holds the only clipboard code).
- **Location list**: `WorldClockState.locations`, `homeLocationId`, `deviceTimeZoneId` through `LocationsContext`.

## Goals / Non-Goals

**Goals:** one registry entry per tool and per converter view (G5); nanosecond precision with number arithmetic only (G4); the converter outside the initial JavaScript (G6); every converter rule in the model, every text in the presenter.

**Non-Goals:** a generic plug-in API for third parties; URL routing; a preference for the converter view; tool-specific settings.

## Decisions

### D1. Tools are a registry; the preferences store ids as texts (FR1–FR3)

A new module `src/tools/` holds `ToolId` (`UNIX_TIME_CONVERTER = "unixTimeConverter"`), `ToolDefinition { id, titleKey, icon, page? }` and `toolRegistry`, in the shape of `viewRegistry`. `page` is a lazy component made with `createRetryableLazyView`.

`Preferences.enabledTools: readonly string[]` (default `[]`), command `TOGGLE_TOOL { toolId, isEnabled }`, schema version 9 with a migration that adds `[]`. The stored value is unreadable unless it is a list of non-empty texts; duplicates are dropped. `resolveEnabledTools(registry, enabledTools)` returns the registered enabled tools in registry order and ignores the rest, so a tool removed from the registry needs no migration and a tool stored by a newer build survives an older one. `useEnabledTools()` in `controller/` wraps it.

- **A boolean field per tool** — rejected: every tool would change the preferences type, the parser and a migration.
- **`ToolId` in the preferences type** — rejected: `preferences/` would import `tools/`; `viewMode` already stores a text for the same reason.

### D2. A tool page is one more page of the shell (FR4, FR5, NFR-P1)

`AppPage` gains `TOOL`; the page state becomes `{ page, toolId? }` and moves, with the Esc handler and the returned focus, from `AppShell.tsx` into `app/useAppPage.ts` (the file is at its size limit). The focus returns to the button that opened the page: the settings button or the tool button.

- `app/ToolButtons.tsx` renders one `ToolButton` per `resolveEnabledTools(...)` entry with a `page`, between `LocationSearch` and `SettingsButton`. It reuses the button body of `SettingsButton` (extracted as `HeaderIconButton`), so the three look alike (UX3).
- `tools/ToolPageFrame.tsx` is the heading, the back button and the notices slot, taken from the layout of `SettingsPage`.
- `app/ToolHost.tsx` renders the tool's lazy page inside `ViewErrorBoundary` with `ViewSkeleton`, as `ViewHost` does for a view. When the tool leaves `resolveEnabledTools`, `useAppPage` returns to the main page.
- Esc: the document handler of `useAppPage`; a field that restores on Esc stops the event first, as the working hours fields do.

- Title sizes: `MainPage` learns whether tool buttons are shown and switches the title's size classes: a new token `--text-header-title-compact` (20 px) up to 337 px, the narrow token up to 367 px, the full one from 368 px; the breakpoints are named constants. Measured in the browser: the Russian title needs 172 px at 23 px, and 154 px are left at 320 px beside three 44 px buttons; at 20 px it needs 150 px.

- **A dialog instead of a page** — rejected by the owner: the converter is a tool of its own with a list of rows.
- **URL routes** — rejected: the settings page is shell state by D10 of `add-settings-page-and-device-time-location`; a second mechanism for one page is not justified.

### D3. The tools group is the toggle group with icon options (FR2, UX2)

`SettingsToggleOption` gains an optional `icon`. With an icon the toggle renders it alone, puts the label into `aria-label` and `title`, and shows the on state by the accent colour instead of the check icon slot. `app/settings/ToolsGroup.tsx` maps `toolRegistry` to options and dispatches `TOGGLE_TOOL`; it renders nothing for an empty registry.

- **A new `ToolsGroup` control** — rejected: independent on/off toggles already have one owner.
- **The option group** — rejected: its options are mutually exclusive.

### D4. An exact instant is two safe integers (FR8, NFR-P3, G4)

```ts
type ExactInstant = { unixSeconds: number; nanoseconds: number }; // 0 ≤ nanoseconds ≤ 999_999_999
```

`unixSeconds` is the floor of the Unix time in seconds, at most 8.64e12 in size; both fields stay far inside `Number.MAX_SAFE_INTEGER`. No value of the converter is ever one number of nanoseconds. The field is not named `epoch…`: "epoch" is a *Never:* word of **Instant** in `docs/glossary/time.md`, and the count since 1970 is the new glossary term **Unix time**.

- **Separators**: before reading, spaces (the no-break and narrow ones included) and underscores are removed from the whole part, and commas when the whole part matches groups of three digits; the fraction takes no separator. Detection counts the digits that remain.
- **Reading digits**: for a unit with `k` fraction digits (0, 3, 6, 9) the last `k` digits are the fraction, the rest the seconds. A negative value with a non-zero fraction `f` becomes `seconds − 1` and `10^k − f`, which is the floor ("towards the past").
- **Writing digits**: `String(unixSeconds)` joined with the zero-padded leading digits of `nanoseconds`; for a negative instant the same rule in reverse.
- **To a `Temporal.Instant`**: `Temporal.Instant.fromEpochMilliseconds(unixSeconds * 1000 + Math.floor(nanoseconds / 1e6))`. Zone math uses it; the digits below the millisecond never change a local time and are appended as text.
- **ISO 8601**: a pattern splits the fraction digits off; `Temporal.Instant.from` reads the rest to the whole second; the fraction becomes `nanoseconds`.
- **Range**: |`unixSeconds`| ≤ 8.64e12, the range of `Temporal.Instant`.

Owners in `src/model/unixTime/`: `UnixTimeUnit`, `UNIX_TIME_UNIT_FRACTION_DIGITS`, `detectUnixTimeUnit`, `parseUnixTimeText`, `parseIsoInstantText`, `formatUnixTime`, `formatExactIsoInstant`, `toInstant`, `isExactInstantInRange`, `getRelativeTime` (D7). `formatUnixTime` and `formatExactIsoInstant` return digits and an ISO 8601 text — machine notations of the same kind as `Temporal.Instant#toString`, not localized text — so they stay in the model.

- **BigInt behind feature detection, lower precision on iOS 12** — rejected: two code paths and two test sets, different results per device, a BigInt literal is a syntax error on the legacy engine, and the source scan would need an exception.
- **`Temporal.Instant` as the holder** — rejected: reading nanoseconds back needs `epochNanoseconds`, a BigInt.
- **A decimal library** — rejected: a dependency for string slicing.

### D5. The converter is a pure reducer of its own (FR6, FR7, FR10–FR15)

`src/model/unixTime/converter.ts`: `ConverterState { mode: ReferenceMode; moment: ExactInstant; precision: UnixTimeUnit; unitChoice: UnixTimeUnitChoice; inputText: string; isInputTyped: boolean; inputError?: ConverterInputError; rowNote?: { locationId, status: WallClockStatus } }` and `reduceConverter(state, command)`. Commands (`ConverterCommandType`): `TYPE_INPUT`, `CHOOSE_UNIT`, `SET_ROW_WALL_TIME`, `SET_ROW_DATE`, `RETURN_TO_NOW`, `TICK`; each carries the clock's instant where it needs one, so the reducer stays pure.

`isInputTyped` carries the rule of the spec: a fixed unit *re-reads* a text the user typed and *converts* a text the app wrote. `inputError` is an enum (`UNREADABLE`, `OUT_OF_RANGE`); texts are the presenter's.

`ReferenceMode` is reused for live and pinned; the glossary entries widen to "the reference moment or the converter moment".

- **Reusing `WorldClockState` and its reducer** — rejected: the owner decided the two moments are separate (NG6); the reference moment is a whole-millisecond instant on track steps and carries a meeting range.

### D6. A row time goes through the wall-clock owner (FR10)

`parseExactWallTimeInput(text, dayPeriodMarkers)` in `presenter/` splits off `:SS` and `.fraction` and hands the hour-and-minute part to `parseWallTimeInput`; it returns the canonical `HH:MM`, the seconds and the fraction digits. `SET_ROW_WALL_TIME` builds the `PlainDateTime` on the row's local date and calls `resolveWallClock`; the status goes to `rowNote` and the hint is `presentWallTimeHint` in `WallTimeHint`. `SET_ROW_DATE` does the same with the row's wall time on the new date. `formatTypedWallTimeText` gains the second separator.

`CalendarDialog` takes a `PresentedDateBar` today. Its props narrow to what it reads (the selected ISO date and its labels), so the date bar and a converter row both open it.

- **A second parser for the whole text** — rejected: a second owner of the 12-hour and compact forms.

### D7. One presenter, built on the row presenters of the main page (FR9, FR12, FR13, FR18, NFR-P2)

`presenter/unixTime/presentConverter.ts` returns `PresentedConverter`: the input (text, name, message, hint), the unit options with the unit in force, the rows, the notations, the relative time, Now and Show on main page with their active flags.

- **Rows**: at `toInstant(moment)` the mark comes from the location mark owner, the city label from `useCityLabels` / `useExemplarCity`, the zone line from `presentZoneLine` (with `formatUtcOffset` and `formatZoneAbbreviation`), the local date from the row date label kind of `getDateTimeFormatter`. The time is a new label kind `DateTimeLabelKind.TIME_WITH_SECONDS`; the fraction digits are inserted after the seconds part of `formatToParts`, before a day period marker.
- **Work bound**: formatters come from the cache of `getDateTimeFormatter`, so a tick builds none. Each tick presents every row again; no per-minute cache, because 20 rows a second is cheap and a cache would have to handle zones whose offset has odd seconds.
- **Relative time**: the time math is the model's (`.claude/rules/architecture.md`: "Selectors return Temporal values, enums and numbers — never human-readable strings"). `getRelativeTime(moment, now)` in `src/model/unixTime/relativeTime.ts` takes `Temporal.ZonedDateTime` in UTC, `since` with `largestUnit: "year"`, and returns `{ unit: RelativeTimeUnit; count: number; direction: RelativeTimeDirection }` for the first non-zero of years, months, days, hours, minutes, rounded towards zero, or `RelativeTimeUnit.NOW` under one minute. `presentRelativeTime` in `src/presenter/unixTime/presentRelativeTime.ts` only picks the text: texts are i18next plural keys (`unixTime.relativePastDays_one` …), as `durationHours_*` already are. `Intl.RelativeTimeFormat` is not used: the legacy engine lacks it.
- **Notations**: `formatUnixTime` for the four units, `formatExactIsoInstant` with the fraction digits of the precision.

### D8. Controller: one hook, a second tick, a session kept by the shell (FR14, FR16)

`controller/useUnixTimeConverter.ts` owns `useReducer(reduceConverter)`, presents with `presentConverter`, and returns the presented data and the commands.

- **Second tick**: `useSecondTick`, a sibling of `useMinuteTick` on the same `TickScheduler` with `getMillisecondsUntilNextSecond`; it runs only while the converter is live and the page is visible, and dispatches `TICK`.
- **Location list**: a light `useLocationList()` reads `locations`, `homeLocationId`, `deviceTimeZoneId` and the load status from `LocationsContext`. `useLocations` is not used: it presents the main page's rows for the reference moment.
- **Show on main page**: the existing `SELECT_INSTANT` with `toInstant(moment)` rounded down to the minute, then `onLeave`.
- **Tool session**: the shell keeps `Map<ToolId, unknown>` in a ref and hands a tool page `session: { read(), write(value) }`. The converter writes its `ConverterState` on every change and validates what it reads with a type guard; an invalid value starts live.

- **A module-level variable in the converter chunk** — rejected: hidden state between tests and under React strict mode.
- **Keeping the page mounted and hidden** — rejected: the second tick and the focus order would have to know about hidden pages.

### D9. Converter views have their own registry (FR17, G5)

Views stay in the views layer (`.claude/rules/architecture.md` → "Views (`src/views/`)"). `src/views/unixTimeConverter/index.ts` holds `ConverterViewId` (`LIST = "list"`), `ConverterViewDefinition { id, titleKey, icon, component }` and `converterViewRegistry`; the first view lives in `src/views/unixTimeConverter/list/`. `views/index.ts` does not re-export it (D11). A view receives `{ converter: PresentedConverter; commands: ConverterCommands }`, renders presenter output, emits commands and imports nothing from `model/`.

`src/tools/` is a shell module, beside `app/` ("shell, not a view", `docs/architecture/overview.md`): it composes and decides nothing about time. The page `src/tools/unixTimeConverter/UnixTimeConverterPage.tsx` is `ToolPageFrame` + `useUnixTimeConverter` + the resolved converter view, as `ViewHost` composes a view. `resolveActiveView` becomes generic over `{ id: string }` with the default id as an argument, so both registries share it.

The end-to-end feature of the converter addresses the page by accessible names only and is parameterised by `converterViewRegistry`, as the view contract is by `viewRegistry`.

- **Registering the converter in `viewRegistry`** — rejected: a view is an interface over the location model of the main page; the converter has other data and commands.
- **No registry until a second view exists** — rejected by the owner: adding and removing a view must be one entry from the start.

### D10. Text copying is its own port (FR12)

`ports/textCopying.ts`: `TextCopying { copyText(text): Promise<CopyOutcome> }` with `CopyOutcome.COPIED | FAILED`. `adapters/browserTextCopying.ts` takes the clipboard code out of `browserTextSharing`, which then calls it; `createInMemoryTextCopying` is the stand-in; one contract suite runs against both. It reaches the converter as a dependency of `AppShell`, like `textSharing`.

### D11. Chunking and module boundaries (NFR-P1)

`src/model/unixTime/`, `src/presenter/unixTime/`, `src/views/unixTimeConverter/` and `src/tools/unixTimeConverter/` are modules with their own `index.ts`; nothing in them is re-exported from `model/index.ts` or `presenter/index.ts`, and only the converter chunk imports them. `useUnixTimeConverter` and `useSecondTick` are exported from `controller/unixTime/index.ts` for the same reason. In the initial JavaScript stay: `tools/index.ts` (the registry with lazy pages and icons; the converter's icon is Lucide `Binary`, chosen by the owner), `ToolButtons`, `useEnabledTools`, `useAppPage`. A build test asserts that the entry chunk holds no converter symbol.

### D12. Focus, selection and paste belong to the view (NFR-A2)

On mount the page focuses the converter input and selects its text when `(hover: hover) and (pointer: fine)` matches (the query is a constant in `src/constants/`, read through one `usePrimaryPointer` hook in `controller/`, which reads `window.matchMedia` as `usePrefersReducedMotion` does), and the heading of `ToolPageFrame` otherwise, as `SettingsPage` does. The end-to-end scenarios check both: the fine-pointer one on the `chromium` project only (`@desktop-only`), the touch one in a context opened with the `Pixel 5` device options, as `app_shell_smoke_e2e.fixtures.ts` opens its own context. Autofocus is kept for the mouse case because the page is opened by the user's action and has one main field; on touch a keyboard would cover the rows. While `isInputTyped` is false, the view sends a pasted text as a whole `TYPE_INPUT`, so a tick that rewrote the text cannot leave a paste in the middle of it. Messages use `aria-describedby` and a polite live region; the ticking input is not a live region.

## Consequences

Positive:
- A later tool is one registry entry and its folder; a later converter view is one registry entry and its folder (G5, M8).
- One code path keeps every digit on every engine, and the no-BigInt source scan needs no exception (G4, NFR-P3).
- A user who never turns a tool on downloads nothing new and sees the same header (G1, G6).

Negative:
- A third kind of shell page and a second view registry to learn.
- `ExactInstant` is a second holder of instants beside `Temporal.Instant`, confined to `src/model/unixTime/`; zone math still goes through `Temporal.Instant` (`toInstant`).
- The header is tighter at 320 px: the title shrinks while a tool button is shown.

## Alternatives Considered

Each decision lists its rejected alternatives under it: D1 a boolean per tool and `ToolId` in the preferences; D2 a dialog and URL routes; D3 a new control and the option group; D4 BigInt behind detection, `Temporal.Instant` as the holder and a decimal library; D5 the reference moment's reducer; D6 a second whole-text parser; D8 a module-level variable and a hidden mounted page; D9 the main view registry and no registry.

## Risks / Trade-offs

- [Tool buttons crowd the header at 320 px with several tools] → one tool fits (scenario at 320 px); the menu is Q1 of the proposal.
- [A fixed unit coarser than the precision hides digits in the converter input] → the rows and the notations always show the full precision.
- [The header refactor (`useAppPage`, `HeaderIconButton`) touches tested shell code] → it is a first task with no behaviour change, verified by the existing `AppShell*.test.tsx` suites before anything is added.
- [`formatToParts` and plural forms on the legacy engine] → `formatToParts` is used by shipped code (`localTimeParts`). The project ships no stand-in for `Intl.PluralRules`, so the relative time picks its plural form there exactly as the shipped `durationHours_*` texts do; this change does not make it better or worse. `pnpm check:legacy-build` covers the converter chunk.
- [The browser tests run on Chromium only] → `playwright.bdd.config.ts` has the projects `chromium`, `mobile-chrome` and the view contract projects, no Firefox or WebKit, and adding a browser would need a CI change. "The same digits on every engine" is therefore checked by the no-BigInt source scan, by a unit scenario that runs the converter with `BigInt` removed (as "Zone checks work without BigInt" of `browser_compatibility_legacy_zones.feature` does), by `pnpm check:legacy-build` and by the Chromium scenarios.
- [The source scan of ADR-0009 matches text, comments included] → no file of this change writes a digit followed by `n`, `BigInt(` or the name of the nanosecond getter, also not in a comment.
- [Icon-only toggles are hard to guess on touch screens] → accepted by the owner (NG2); the features page is a later change (Q2).

## Migration Plan

The preferences document moves from schema version 8 to 9 by one migration step that adds `enabledTools: []`. By ADR-0004 a build that meets a document of a newer schema version treats it as unreadable: the app runs on default preferences and offers the reset. So a rollback to a version 8 build loses the user's preferences until the version 9 build returns; the draft of ADR-0020 (handoff H1) records this. Nothing else is migrated: the converter stores no data.

