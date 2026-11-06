# Polish the settings page and remove the offline update note

No other active change touches the capabilities this change modifies: the only one, `add-pr-preview-deploy`, changes `app-delivery`, not `settings`, `app-shell` or `main-page`.

## Why

The owner reviewed the settings page and the main page and asked for six interface fixes:

- The zone label group's caption «Подпись пояса» / "Zone label" does not say what is labelled. It should read «Обозначение часового пояса» / "Timezone label" (the request's "Timezone lable" with the typo fixed).
- The toggle «Сокращение» should read «Аббревиатура».
- The toggles come in the order "UTC offset", "Abbreviation", but the zone line under them shows the abbreviation first. The toggles should follow the order of the line.
- The live example is India (`IST`, `UTC+5:30`). `IST` is written the same in every interface language, so the example does not show how the label changes with the language. Russia (`MSK` / «МСК», `UTC+3`) shows it.
- The settings page does not say which build of the app is running. Until the app has version numbers, it should show the date and time of the deploy, in the colour of the page's icons.
- In airplane mode or without a connection, the main page shows «Не удалось получить последнюю версию. Приложение продолжает работать.» The app is offline-first and must work offline anyway, so the note tells the user nothing useful and covers part of the page. It must go entirely.

Audience: every user of the settings page, Russian-speaking users in particular, and every user who opens the app without a network.

## What Changes

- MODIFIED `settings`: the zone label group's caption becomes "Timezone label" («Обозначение часового пояса»). The abbreviation toggle becomes «Аббревиатура» in Russian ("Abbreviation" in English stays). The toggles come in the order of the zone line: "Abbreviation" first, then "UTC offset". The live example becomes Russia (`Europe/Moscow`): `Russia, MSK, UTC+3` / `Россия, МСК, UTC+3`. The approved settings screenshots are re-approved.
- ADDED `settings` → **Deploy time**: a line directly after the language group, "Deployed <date> at <time>" («Развёрнуто <date> в <time>»), in the interface language, the hour format and the device time zone, in the accent colour that the settings page icons use, in both themes.
- MODIFIED `app-shell`: a failed update check, offline or otherwise, shows nothing. The update check, the update recheck, the update notice and the offline-ready notice stay as they are.
- REMOVED `app-shell` → "Update check failure note" and `main-page` → "Update check failed note"; MODIFIED `main-page` → "Main page regions" (the notices region no longer holds that note). ADDED `main-page` → "Offline without notes".
- Glossary (new or changed terms):
  - **Zone label** (`docs/glossary/settings.md`) changes its interface names: *RU:* «Обозначение часового пояса»: «Аббревиатура», «Смещение UTC»; English interface "Timezone label". The term and its code names (`zoneLabelParts`, `ZoneLabelPart`, `ZoneLabelGroup`, `settings.zoneLabelLabel`) stay, so the stored preferences document does not change.
  - **Zone abbreviation** (`docs/glossary/time.md`): *RU:* аббревиатура пояса (interface: «Аббревиатура»).
  - new **Deploy time** (`docs/glossary/settings.md`); **Settings page** lists it.
  - **Update check failure note** (`docs/glossary/app-shell.md`) is removed; **Update check** and **Offline** say that a failed check is silent.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `settings`: the zone label group's names, order and example; the deploy time line; the re-approved screenshots.
- `app-shell`: a failed update check is silent; the update check failure note is removed.
- `main-page`: the notices region no longer holds the update check failure note; offline shows no note.

## Goals

- G1: Every text and the example of the zone label group show how the label reads in the interface language, in the order of the zone line.
- G2: A user or a tester can tell from the settings page which build is running.
- G3: Without a network, the main page shows no note at all.

## Non-Goals

- NG1: No version number. The deploy time is replaced by a version number in a later change, once the app is versioned.
- NG2: No rename of the zone label's code names, no stored preferences change and no migration.
- NG3: No change of the zone line on location cards, the update notice, the offline-ready notice or the storage warning.
- NG4: No change of how often or when the app checks for a new version.

## Users & Scenarios

- U1: A Russian-speaking user opens the settings and reads «Обозначение часового пояса» with the toggles «Аббревиатура» and «Смещение UTC» and the example «Россия, МСК, UTC+3».
- U2: An English-speaking user sees "Timezone label", "Abbreviation", "UTC offset" and "Russia, MSK, UTC+3".
- U3: A tester reports a bug and reads the deploy time from the bottom of the settings page.
- U4: A traveller opens the app in airplane mode and sees the locations with no note over them.

## Requirements

### Functional

- FR1: The zone label group's caption is "Timezone label" in English and «Обозначение часового пояса» in Russian.
- FR2: The zone abbreviation toggle is «Аббревиатура» in Russian; English stays "Abbreviation", and the UTC offset toggle stays "UTC offset" / «Смещение UTC».
- FR3: The zone label toggles come in the order of the zone line: the abbreviation toggle first, then the UTC offset toggle, in every interface language.
- FR4: The live example shows the zone line of Russia, `Europe/Moscow`, at the effective instant: `Russia, MSK, UTC+3` in English and `Россия, МСК, UTC+3` in Russian with both toggles on, and it follows the toggles as before.
- FR5: The settings page shows the deploy time directly after the language group: "Deployed <date> at <time>" («Развёрнуто <date> в <time>»), where the date has the day, the month name and the year, and the time follows the hour format, both in the interface language and in the device time zone.
- FR6: The deploy time is the instant the running build was made, fixed into that build, the same online and offline and after a reload. It changes only with a new build.
- FR7: A failed update check, because the network is unreachable or for any other reason, shows no note and no error, on the main page and on the settings page. Going offline or coming back online shows nothing either. The update notice and the offline-ready notice keep working.
- FR8: The text «Не удалось получить последнюю версию…» / "The latest version could not be fetched…" no longer exists in the app, and the locale files keep identical key sets.

### Non-Functional

#### Performance

None: the change adds one line to the settings page and removes a note.

#### Accessibility

- NFR-A1: The deploy time is plain text: not a link, not a Tab stop, not a live region. Its colour is the computed colour of the settings page icons (the back button's chevron) in the light and the dark theme, and axe-core reports no violations on the settings page in both themes.
- NFR-A2: The zone label group is named by the new caption, and the Tab order of its toggles is the visual order: "Abbreviation", then "UTC offset".

#### Responsive

- NFR-R1: The longer Russian texts keep the zone label layout: caption and both toggles in one row from 640 px, both toggles in one row below it, and no horizontal scrolling of the settings page at 320 px and 2560 px in English and Russian. The deploy time fits one line from 320 px.
- NFR-R2: The approved settings screenshots at 375 px and 1024 px in both themes are re-approved once for this change; the deploy time text is hidden in them, because it changes with every build.

## UX Acceptance Criteria

- UX1: The zone label group reads in the same order as the example under it: abbreviation, then offset.
- UX2: The deploy time is a quiet line at the end of the settings content, centred, small, in the accent colour of the icons.
- UX3: Offline, the main page looks the same as online with nothing waiting: no note covers the locations or the date bar.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| online | update check succeeds, no new version | no note |
| online | new version waiting | update notice, unchanged |
| offline (airplane mode) | update check fails | no note; locations and date bar fully visible (FR7) |
| offline → online | — | nothing appears or disappears (FR7) |
| any | settings page shown | deploy time from the build, same online and offline (FR6) |
| any | storage unavailable | storage warning, unchanged |

The deploy time has no loading, error or empty state: it is part of the build and always present.

## Behavior

- `packages/client/src/test/features/settings/settings_zone_label_unit.feature`, `settings_zone_label_e2e.feature`, `settings_e2e.feature` (`@polish-settings-and-remove-offline-update-notice`).
- New `packages/client/src/test/features/settings/settings_deploy_time_unit.feature` and `settings_deploy_time_e2e.feature`.
- `packages/client/src/test/features/main_page/main_page_unit.feature`, `main_page_e2e.feature`, `app_shell/app_shell_update_recheck.feature`.

## Visual Reference

No Figma. The accent colour comes from the design tokens (`text-accent`), the colour the settings page icons already use.

## Affected IA

No changes.

## Success Metrics

- M1: All 5 rows of the scenario "The example follows the toggles" pass with the Russia example (4 English, 1 Russian).
- M2: 2 of 2 interface languages show the new caption and the toggle order "Abbreviation", "UTC offset" in the E2E scenario "Both languages".
- M3: The deploy time matches the expected text in 4 of 4 unit cases (English 24-hour, English 12-hour, Russian, another device time zone).
- M4: axe-core reports 0 violations on the settings page in 2 of 2 themes, and the deploy time's colour equals the icon colour in 2 of 2 themes.
- M5: After a failed update check offline, the notices region of the main page holds 0 notes in the E2E run, and `grep -rn "updateCheckFailed" packages/client/src` prints 0 lines.

## Open Questions

None.

## Impact

- `packages/client/src/locales/en.json`, `ru.json`; `src/constants/preferences.ts`; `src/app/settings/` (zone label group, settings page, new deploy time line); `src/presenter/` (deploy time formatting); `src/controller/` (deploy time hook; the update status loses its failure flag); `src/app/` (the failure note and its export are removed); `vite.config.ts`, `vitest.config.ts`, `app.config.ts`, `src/vite-env.d.ts`, a small build script under `scripts/`.
- Tests and approved screenshots of the settings and main page features.
- `docs/glossary/settings.md`, `time.md`, `app-shell.md`, `docs/architecture/views.md`.
- No new dependency, no stored data change.
