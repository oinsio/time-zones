# Design: Polish the settings page and remove the offline update note

## Context

Driven by FR1–FR8, NFR-A1, NFR-A2, NFR-R1, NFR-R2 and UX1–UX3 from `proposal.md` (see its Why). The facts below were checked in the code as it is:

- The zone label group (`src/app/settings/ZoneLabelGroup.tsx`) draws its toggles from `Object.values(ZoneLabelPart)`, the enum order `UTC_OFFSET`, `ZONE_ABBREVIATION` (`src/preferences/preferences.ts`). `presentZoneLine` (`src/presenter/zoneLine.ts`) builds the zone line as place, zone abbreviation, UTC offset, with the order written out by hand. The enum order also decides the order of the stored `zoneLabelParts` array (`SET_ZONE_LABEL_PART` "keeps enum order", `parseStoredPreferences`).
- The example zone is `ZONE_LABEL_EXAMPLE = { timeZoneId: "Asia/Kolkata", countryCode: "IN" }` in `src/constants/preferences.ts`, read only by `presentZoneLabelExample`. The Russian interface writes `MSK` as «МСК» through `locations.zoneAbbreviationMsk` (`src/constants/zoneAbbreviations.ts`).
- The note comes from `isUpdateCheckFailed` of `usePwaUpdateStatus` (`src/controller/usePwaUpdateStatus.ts`). The start-up check and `useUpdateRecheckOnReturn` (its third argument `onCheckFailed`) set the flag, and `useOnlineStatus` clears it. `AppShell` renders `UpdateCheckFailedNote` (`src/app/UpdateCheckFailedNote.tsx`, exported from `src/app/index.ts`). `useOnlineStatus` has no other production consumer.
- Nothing in the app knows when it was built. `vite.config.ts` has no `define`. `vitest.config.ts` is a separate config that does not load `vite.config.ts`. The E2E web server (`playwright.bdd.config.ts`) runs `pnpm build`, and in CI the GitHub Pages artifact is uploaded from that `dist` after E2E (`.github/workflows/ci.yml`, "Upload GitHub Pages artifact"). So the build that is deployed is the one the E2E run made.
- Dates and times are formatted only through `getDateTimeFormatter` (`src/presenter/dateTimeFormatters.ts`, one cached `Intl.DateTimeFormat` per language, zone, `DateTimeLabelKind` and hour format) and `formatLocalTime` (`src/presenter/localDateTime.ts`). No existing kind has a year.
- The settings page icons (back chevron, theme icons, check icons) use the `text-accent` token (`SettingsPage.tsx`, `SettingsOptionGroup.tsx`, `SettingsToggleGroup.tsx`).

Bound by ADR-0002 (layers), ADR-0003 (Temporal instants, IANA IDs), ADR-0007 (device time zone only as state from the clock), ADR-0009 (Safari 12 build level, no BigInt) and `.claude/rules/architecture.md`, `temporal.md`, `code-style.md`, `i18n.md`. No global decision is made here, so no ADR is needed.

## Goals / Non-Goals

Design-level only: the zone label's code names and stored document stay (proposal NG2); the deploy time needs no network and no storage.

## Decisions

### D1. The build instant is a Vite `define` constant (FR6)

`scripts/deployInstant/resolveDeployInstant.ts` exports `resolveDeployInstant(clock: Clock = systemClock): string`. It returns `clock.instant().toString({ smallestUnit: "millisecond" })`, an ISO 8601 instant with `Z` (`2026-11-06T10:30:00.000Z`). It imports `Temporal` and `systemClock` from `../../src/lib/temporal.ts`, as `scripts/zoneData/extractZoneAbbreviations.ts` does. `vite.config.ts` calls it once per build and adds `define: { [DEPLOY_INSTANT_DEFINE]: JSON.stringify(resolveDeployInstant()) }`. `app.config.ts` holds `DEPLOY_INSTANT_DEFINE = "__APP_DEPLOY_INSTANT__"` and `TEST_DEPLOY_INSTANT = "2026-03-08T07:30:00.000Z"`. `vitest.config.ts` defines the same name as `JSON.stringify(TEST_DEPLOY_INSTANT)`, so unit tests, BDD steps and Stryker (which runs `vitest.config.ts`) see a fixed instant. `src/vite-env.d.ts` declares `declare const __APP_DEPLOY_INSTANT__: string;` (also part of `tsconfig.test.json`). `src/constants/deploy.ts` exports `APP_DEPLOY_INSTANT = __APP_DEPLOY_INSTANT__`, re-exported from `src/constants/index.ts`.

The build instant stands for the deploy time: CI deploys the build of the same run (Context), minutes after it is made.

Alternatives: a `VITE_*` environment variable set by CI. It is empty in local builds, and CI would need a `.github/` change. A JSON file fetched at run time needs the network or a precache entry. A git commit time is not the deploy, and `git` is not part of the build. Fixing the instant for E2E through the web server's `env` is rejected: the Pages artifact is that very build, so production would show the test instant.

### D2. Formatting has one owner in the presenter (FR5)

`src/presenter/deployTime.ts` exports `formatDeployTime({ deployInstant, deviceTimeZoneId, language, hourFormat, translate })`. It turns the instant into a `ZonedDateTime` in the device time zone. It formats the date with a new `DateTimeLabelKind.DEPLOY_DATE` of `getDateTimeFormatter`, with `DEPLOY_DATE_FORMAT_OPTIONS = { day: "numeric", month: "long", year: "numeric" }` in `src/constants/localDateTime.ts`, which is hourless like `LOCAL_DATE`. The time comes from `formatLocalTime`. It returns `translate("settings.deployTime", { date, time })`. The new keys are `"Deployed {{date}} at {{time}}"` (en) and `"Развёрнуто {{date}} в {{time}}"` (ru). The results for `TEST_DEPLOY_INSTANT` are the spec table: `March 8, 2026`, `8 марта 2026 г.`, `07:30`, `7:30 AM` (ICU writes U+202F before `AM`, so tests compare after replacing U+202F and U+00A0 with a space, as `dateTimeFormatters.test.ts` does), and `13:00` in `Asia/Kolkata`.

Alternative: `toLocaleString` with options. Rejected: it builds a formatter on every call (ADR-0008) and bypasses the language fallback order of `getDateTimeFormatter`.

### D3. The controller hook reads the device time zone from state (FR5, ADR-0007)

`src/controller/useDeployTime.ts` exports `useDeployTime(): string`. It reads `deviceTimeZoneId` from the `LocationsContext` store snapshot (as `useZoneLabelExample` does, with the same missing-provider error), plus `useActiveInterfaceLanguage`, `useHourFormat` and `useTranslation`. It passes `DEPLOY_INSTANT = Temporal.Instant.from(APP_DEPLOY_INSTANT)`, parsed once at module scope, to `formatDeployTime`. It never calls `clock.timeZoneId()` itself.

### D4. The view is one plain paragraph in the icon colour (FR5, NFR-A1, NFR-R2, UX2)

`src/app/settings/DeployTime.tsx` renders `<p data-deploy-time className="text-center text-sm text-accent">{useDeployTime()}</p>`. `SettingsPage` places it directly after `InterfaceLanguageGroup` inside `<main>`. The screenshot step "the locations screen matches the approved screenshot" (`src/test/features/locations/steps/locations_layout_e2e.steps.ts`) passes `style: "[data-deploy-time] { visibility: hidden; }"` (a named constant in that file) to `toHaveScreenshot`. The line keeps its box, so the layout stays covered, but its text is hidden. Other screenshots have no such element and do not change.

Alternative: `mask`. Rejected: the mask box follows the text width, which changes with the date.

### D5. One order for the zone parts (FR3, UX1)

`src/constants/preferences.ts` gets `ZONE_LABEL_PART_ORDER: readonly ZoneLabelPart[] = [ZONE_ABBREVIATION, UTC_OFFSET]`. `presentZoneLine` emits the zone parts in this order after the place, instead of the hand-written order. `ZoneLabelGroup` maps this constant instead of `Object.values(ZoneLabelPart)`. The enum and the stored array order stay, so no migration is needed (NG2); the enum's JSDoc then says that its declaration order is the stored order and that the display order is `ZONE_LABEL_PART_ORDER`. `ZONE_LABEL_EXAMPLE` becomes `{ timeZoneId: "Europe/Moscow", countryCode: "RU" }` (FR4). Moscow has had one offset since 2014, so `UTC+3` and `MSK` hold at any effective instant.

Alternative: reorder the enum. Rejected: it changes the stored order and the tests of `SET_ZONE_LABEL_PART`, for no visible gain.

### D6. The failure path is deleted, not hidden (FR7, FR8)

`PwaUpdateStatus` loses `isUpdateCheckFailed`. The start-up check and `useUpdateRecheckOnReturn` still catch a rejected `registration.update()`, so no unhandled rejection appears, but with a named no-op (`ignoreFailedUpdateCheck`), and `useUpdateRecheckOnReturn` loses its `onCheckFailed` parameter. `UpdateCheckFailedNote` (with its test), its export and its use in `AppShell` are deleted. So are `useOnlineStatus` with its test and export, because nothing else reads it, and the `mainPage.updateCheckFailed` key in both locale files.

Alternative: keep the flag and stop rendering it. Rejected: dead state that a later change could show again.

## Consequences

Positive:
- One owner each: the build instant (D1), its text (D2), the zone part order (D5); nothing is recomputed in a view.
- The deploy time works offline and needs no CI change, no storage and no network.
- The offline path of the app shell gets simpler: one flag, one hook, one component and one locale key fewer.

Negative:
- Two configs define the same constant (`vite.config.ts`, `vitest.config.ts`); `app.config.ts` keeps its name in one place.
- The deploy time is the build instant, a few minutes before the actual deploy.

## Alternatives Considered

Listed per decision above (D1, D2, D4, D5, D6).

## Risks / Trade-offs

- [The longer Russian caption «Обозначение часового пояса» pushes the toggles out of the one row at 640 px] → the existing E2E outline "One row on wide screens" at 640 px in Russian runs in task 6.3. If it fails, the caption may wrap inside its own cell (`min-w-0`, no `whitespace-nowrap`), but the toggles stay in one row. The spec does not change.
- [Local builds show the local build instant, not a deploy] → expected. Only CI builds are deployed.
- [A build with a wrong system clock shows a wrong deploy time] → accepted. The CI runner clock is synchronised.

## Migration Plan

None: no stored data changes. Rollback is a revert.
