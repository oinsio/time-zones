# Apply data updates silently

Three other changes are active in `openspec/changes/`: `add-city-coordinates-to-locations`, `bind-day-periods-to-sun` and `refresh-data-through-scheduled-pull-requests`. Only the last one is related: it produces the data-only commits this change recognises, and it must not go live before this change (see "Open Questions", Q1). None of them modifies the requirements this change modifies.

## Why

Every deploy looks like a new version to a running installation: the update notice «Доступна новая версия.» appears whether the app gained a feature or a bot refreshed a data file. Development is slowing down while the data keeps moving — zone rules are checked daily, city data monthly, zone city names twice a year — so a user who watches three or four cities would see a notice every month although nothing changed for them. The zone rules update notice has the same fault: it appears for every IANA release, and most releases change no rule of a zone the user has.

Notices are for things the user can act on or look at. A new feature is one; a refreshed data file is not. Audience: every user of an installed or open app.

## What Changes

- MODIFIED `app-shell`, the update notice: it is shown only when the waiting build differs from the running one in the app itself. A waiting build that differs in data only is applied silently: no notice, and it is the running version at the next start.
- MODIFIED `app-shell` and `zone-rules-updates`, the zone rules update notice: it is shown only when the stored release changes the rules of a watched zone — a zone of a location in the list or the device time zone. Otherwise the stored release is applied silently at the next start, as it already is after a dismissal.
- ADDED `app-delivery`: every build carries an app revision and the site serves it in a small file. The app revision is the identifier of the newest commit that is not a data-only commit, so builds made from data-only commits share the revision of the last app change. There are no version numbers and no release process; a human-set value can later take the place of the commit identifier without changing the app.
- MODIFIED `settings`, the city data attribution: it names the date of the city data in use, next to the zone rules release line that already names the release.
- Unchanged: when and how often the app checks, the silence of failed checks, the offline-ready notice, the rule that the app never reloads by itself, the texts of both notices.
- Glossary (`docs/glossary/app-shell.md`), new terms:
  - **App revision** — the value that identifies the app itself in a build, apart from its data: the identifier of the newest commit that is not a data-only commit. Two builds with one app revision differ in data only. *Never:* version, version number, build number.
  - **Waiting build** — a newer build the browser has downloaded and holds until the app's windows are closed or the user reloads into it.
  - **Silent update** — a waiting build with the running build's app revision, or a stored release that changes no watched zone: used from the next start, with no notice. *RU:* тихое обновление. *Never:* auto-update, background update.
- Glossary (`docs/glossary/zone-rules.md`), new term: **Watched zone** — a zone whose rules the user sees: the zone of every location in the list and the device time zone.
- Glossary, changed terms: **Update notice** (shown only when the app revision of the waiting build differs), **Zone rules update notice** (shown only when a watched zone changes), **Zone rules update** (may be silent), **City data attribution** (names the date of the city data; *RU:* «Данные о городах: GeoNames (14 ноября 2026 г.), CC BY 4.0»).
- The term **data-only commit** and its `Data-Only: true` trailer are defined by `refresh-data-through-scheduled-pull-requests`; this change only reads the trailer.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: MODIFIED "New version notice", "Zone rules update notice".
- `zone-rules-updates`: MODIFIED "Zone rules update check", "Stored release document"; ADDED "Watched zones", "Releases that change a watched zone", "Watched zones are compared when they can change".
- `app-delivery`: ADDED "App revision of a build", "App revision file".
- `settings`: MODIFIED "City data attribution".

## Goals

- G1: 0 update notices for a deploy that changed data only.
- G2: 1 update notice for a deploy that changed the app, as today.
- G3: 0 zone rules update notices for a release that changes no watched zone; 1 for a release that does.
- G4: A user can read the versions of both kinds of data in use on the settings page: the zone rules release and the date of the city data.

## Non-Goals

- NG1: No version numbers, no release process, no changelog and no "what's new" page.
- NG2: The app never reloads by itself, also for a silent update; a silent update waits for the next start.
- NG3: No scheduling, workflow or pull request of the data refresh itself, and no definition of the data-only commit (`refresh-data-through-scheduled-pull-requests`).
- NG4: The texts and the look of the two notices do not change; the zone rules update notice does not name the affected locations.
- NG5: No new check, timer or request while no build is waiting.
- NG6: No notice or setting that tells the user a silent update happened.

## Users & Scenarios

- U1: A user has Moscow, Almaty and Lisbon. The monthly city data refresh is deployed. They open the app: no notice. The next time they start the app, the settings page names the new date of the city data.
- U2: A new view is merged and deployed. The same user returns to the app and sees the update notice, reloads, and has the new view.
- U3: IANA publishes a release that corrects the past of a zone in South America. The user sees no notice; the release is in use at the next start and the settings page names it.
- U4: IANA publishes a release that moves the next clock change of Lisbon. The user sees the zone rules update notice and reloads.
- U5: The user dismissed nothing and adds Cairo while a stored release that changes Cairo is waiting for the next start: the zone rules update notice appears.
- U6: The device is offline or the request fails while a build is waiting: no notice, no error; the app asks again on the next update recheck.

## Requirements

### Functional

- FR1: Every build SHALL carry an app revision fixed at build time: the identifier of the newest commit of the built history that does not carry the trailer `Data-Only: true`. A value given to the build explicitly SHALL replace it. When the history cannot be read, the build SHALL take a value unique to that build, so that it counts as an app change.
- FR2: The site SHALL serve, under the app's base path, an app revision file that names the app revision of the published build. It SHALL NOT be in the service worker's precache.
- FR3: The update notice SHALL be shown only when a build is waiting and the app revision file names a revision other than the running build's.
- FR4: A waiting build with the running build's app revision SHALL show no notice. It SHALL be the running version at the next start, once every window of the app was closed. The app SHALL NOT reload by itself and SHALL NOT switch builds while it is open.
- FR5: The app SHALL read the app revision file when a build becomes waiting, and again at each update recheck while a build is waiting, with a request that revalidates the HTTP cache. While no build is waiting it SHALL NOT request the file.
- FR6: A failed read — offline, a failed request, a non-2xx status, a file that cannot be parsed or names no revision — SHALL show nothing and change nothing; the next update recheck reads it again. A shown update notice SHALL stay shown.
- FR7: Dismissing the update notice SHALL hide it until the app revision file names yet another revision.
- FR8: The zone rules update notice SHALL be shown only when the stored release is newer than the active one and changes the rules of a watched zone. A release changes the rules of a zone when, between the active and the stored release, the zone differs in the UTC offset, the abbreviation or the daylight-saving flag in force at the instant of the comparison, in any clock change after that instant, or in the rule for the years after the listed changes; a zone that only one of the two releases holds counts as changed. Differences before that instant do not count.
- FR9: The watched zones SHALL be the zone of every location in the list and the device time zone, whether or not the device time location is listed.
- FR10: A stored release that changes no watched zone SHALL show no notice and SHALL be the active release at the next start, by the existing rule. While it waits, a change of the list or of the device time zone SHALL be compared again, and the notice SHALL appear when a watched zone is now changed.
- FR11: The Reload of the zone rules update notice SHALL apply a waiting build whether or not the update notice is shown.
- FR12: The city data attribution SHALL name the date of the city data in use: the dump date recorded in the committed city data, fixed into the build, written with the day, the month name and the year in the interface language. A build whose city data records no valid date SHALL fail.
- FR13: The changed attribution text SHALL exist in every locale file; `GeoNames` and `CC BY 4.0` stay untranslated.

### Non-Functional

#### Performance

- NFR-P1: Reading the app revision SHALL cost one request of a file of at most 1 KB per update recheck while a build is waiting, and none otherwise. The file SHALL NOT count as initial JavaScript, which stays at most 150 KB gzipped.
- NFR-P2: Deciding whether a stored release changes a watched zone SHALL compare each watched zone at most once per stored release and per change of the watched zones. A minute tick and a render SHALL compare nothing.
- NFR-P3: The attribution SHALL build no date formatter of its own per render: at most one per interface language, none on a minute tick.

#### Accessibility

- NFR-A1: Both notices SHALL keep their roles, names, keyboard behaviour and polite announcement; axe-core SHALL report no violations with either notice shown, in both themes.
- NFR-A2: The attribution SHALL stay one link named exactly by its visible text, date included, at least 44 px high, with a visible focus outline and a contrast of at least 4.5:1 in both themes.

#### Responsive

- NFR-R1: From 320 px to 2560 px the attribution SHALL be shown in full in English and Russian, wrapping between words where needed, and the settings page SHALL NOT scroll horizontally. The approved settings screenshots are re-approved once.

## UX Acceptance Criteria

- UX1: A user who only receives data updates never sees a notice about them.
- UX2: An app change is announced exactly as today: the same notice, text, Reload and Dismiss.
- UX3: A zone rules update notice always concerns the user: one of their zones changes now or later.
- UX4: The date of the city data is quiet: part of the one attribution line at the end of the settings page, no new line and no new control.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| online | no build waiting | no notice; the app revision file is not requested |
| online | build waiting, app revision being read (loading) | no notice yet |
| online | build waiting, same app revision | no notice; the build is used from the next start |
| online | build waiting, another app revision | the update notice with Reload and Dismiss |
| online | build waiting, read failed or file unreadable (error) | no notice, no error; read again on the next update recheck |
| offline | build waiting | no request, no notice; a notice shown before stays |
| online | stored release changes no watched zone (empty) | no notice; active from the next start |
| online | stored release changes a watched zone | the zone rules update notice |
| any | storage unavailable | no zone rules update notice; the release arrives with its deploy, silently |
| any | settings page | the attribution with the date of the city data, also offline |

## Behavior

- `packages/client/src/test/features/app_shell/app_shell_notices.feature`, `app_shell_update_recheck.feature` and new `app_shell_silent_update_unit.feature`, `app_shell_silent_update_e2e.feature` — scenarios tagged `@apply-data-updates-silently`.
- `packages/client/src/test/features/app_shell/app_shell_zone_rules_notice_unit.feature`, `app_shell_zone_rules_notice_e2e.feature` and `packages/client/src/test/features/zone_rules_updates/` new `zone_rules_updates_watched_zones_unit.feature` — scenarios tagged `@apply-data-updates-silently`.
- `packages/client/src/test/features/settings/settings_city_data_attribution_e2e.feature` and new `settings_city_data_date_unit.feature` — scenarios tagged `@apply-data-updates-silently`.

## Visual Reference

No Figma frame. The two notices and the settings page as they are today are the reference; design tokens are the source of truth.

## Affected IA

No changes.

## Success Metrics

- M1: 0 update notices in the scenario "a data-only build is waiting"; 1 in the scenario "New version becomes available".
- M2: 100% of builds made from a history whose newest commits are data-only carry the app revision of the newest other commit (checked on a fixture history of 4 commits).
- M3: 0 zone rules update notices for a stored release that differs only in zones outside the watched zones or only before the comparison instant; 1 for each of the 5 kinds of difference of FR8.
- M4: 0 requests of the app revision file while no build is waiting; at most 1 per update recheck while one is waiting.
- M5: The settings page names the dump date of the committed city data in 2 languages; 0 axe-core violations in 2 themes; no horizontal scrolling at 320 px and 2560 px.
- M6: Mutation score ≥ 95% (minimum acceptable 90%) on the new and changed production files of `src/controller/`, `src/lib/zoneRules/`, `src/adapters/`, `src/app/` and `scripts/appRevision/`.

## Open Questions

None. Decided by the owner:

- This change goes live before the scheduled refresh of `refresh-data-through-scheduled-pull-requests` is switched on; until then the trailer is absent and every build counts as an app change, as today.
- An installed app that the system never closes keeps its data until it is closed; accepted (NG2).
- The date of the city data stands inside the attribution line.
- The text of the zone rules update notice stays as it is and names no city.
