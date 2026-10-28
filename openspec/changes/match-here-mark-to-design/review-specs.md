# Specs review: match-here-mark-to-design

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 29/29 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 3 |

## Freshness

- ✅ The current mark is a filled pill after the city: `packages/client/src/views/shared/LocationRow.tsx:107-115` renders `<span id={badgeId} className="inline-flex items-center gap-1 rounded-full bg-accent px-2 text-xs font-medium text-accent-foreground">` with `<Navigation aria-hidden="true" size={BADGE_ICON_SIZE_PX} />` and `row.deviceTimeZoneLabel` (proposal Why, design Context).
- ✅ `BADGE_ICON_SIZE_PX = 12` exists, local to `LocationRow.tsx:14` (design D3).
- ✅ The `<li>` is named `aria-labelledby={hasDeviceTimeZoneBadge ? \`${cityId} ${badgeId}\` : cityId}` (`LocationRow.tsx:88-90`).
- ✅ `LocationRow.tsx` is 150 lines, so the "stays under 200 lines" claim of D3 is plausible.
- ✅ `presenter/presentLocationRows.ts:22-23,62,80-85`: `deviceTimeZoneLabel: string` is filled from one `translate("locations.deviceTimeZoneBadge")` call made before `locations.map` (design D2).
- ✅ `model/deviceTimeZone.ts` exports `isLocationInDeviceTimeZone(location, deviceTimeZoneId): boolean` with strict equality, re-exported at `model/index.ts:39` (design D1).
- ✅ `presenter/index.ts:4` re-exports `DayPeriod` from `@/model`, the precedent D2 cites for re-exporting `LocationMarkKind`.
- ✅ `constants/locations.ts` exists and `constants/index.ts:23-31` re-exports from `./locations` (task 1.1).
- ✅ `locales/en.json:31` `"deviceTimeZoneBadge": "Your time zone"` and `locales/ru.json:31` `"Ваш часовой пояс"`; `src/locales/locales.test.ts` checks key parity (design D4).
- ✅ `lucide-react` (`^0.577.0`) is a dependency and `Navigation` is already imported in `LocationRow.tsx:3` (proposal Impact).
- ✅ The 10 test files that name `deviceTimeZoneLabel` are exactly those listed in task 3.2 / design Consequences (`grep -rln deviceTimeZoneLabel src`: 3 controller tests, `presentLocationRows.test.ts`, `locations_reorder_unit.steps.ts`, 5 `views/shared` tests).
- ✅ The files reading the old text or key (`deviceTimeZoneWorld.tsx:28-31`, `locations_clock_tick.steps.tsx`, `locations_device_time_zone_e2e.steps.ts:9`, `useLocations.deviceTimeZone.test.tsx:13` and `useLocations.tick.test.tsx:11` `BADGE_RU`, `LocationRow.test.tsx:124-125`) are all covered by tasks 3.2, 4.2, 5.1 and 6.1.
- ✅ `presentLocationRows.test.ts:125` has `describe("present the device time zone badge")` and `LocationRow.test.tsx:124` has the `"device time zone badge"` block that tasks 3.2 / 4.2 rewrite.
- ✅ The unit features `locations_device_time_zone_unit.feature` and `locations_clock_tick.feature` use the steps "shows the badge" / "shows no badge" / "no row shows the badge" (task 5.1); `locations_device_time_zone_e2e.feature` and `locations_local_time_e2e.feature:54` expect "Almaty Your time zone" (task 6.1).
- ✅ E2E device zone is `Asia/Almaty` (`playwright.bdd.config.ts:39,80`), and `locationsStates.ts:28` `LIST_CITY_NAMES = ["Almaty", "Moscow"]` seeds the list, pinned, calendar and time-selected states (design D5).
- ✅ 32 baselines: the outline at `locations_ui_e2e.feature:114` has 4 examples each for list, pinned, calendar and time-selected, and `src/test/features/__screenshots__/{chromium,mobile-chrome}/` hold one PNG per example (56 PNGs for 7 states); suggestions / IST results / empty do not seed rows.
- ✅ Package scripts used by the tasks exist: `@time-zones/client` has `typecheck`, `test`, `test:bdd`, `lint`, `build` (`packages/client/package.json`); `tsconfig.app.json:41` includes `src`.
- ✅ `grep -rn "deviceTimeZone\|LocationMark" src/adapters src/ports` prints nothing today, so task 7.3 can pass.
- ✅ Contrast in D3: tokens are `--color-accent #2f5bd3` / `--color-surface #ffffff` and dark `#5ec2e8` / `#16213a` (`src/styles/tokens.css:10,18,29,37`); recomputed ≈ 5.9:1 and ≈ 7.9:1.
- ✅ The design screens: `phone-no-home.html:111-122` and `phone-travel.html:225-236` show an 18 px filled arrow (`aria-label="Вы здесь"`) before the city and a bold accent `здесь` after it; `phone-travel.html:110-121` shows an outline house (`aria-label="Домашняя локация"`, `fill: none`) in the same slot with no caption, which matches the optional `captionKey` and `isFilled: false` of D2/D3.
- ✅ `docs/architecture/views.md:79` ("Row header": home icon, "here" icon (location arrow) or difference) and `docs/design/README.md:29-30` name the screens as described.
- ✅ The archived change `openspec/changes/archive/2026/10/2026-10-25-mark-device-time-zone-in-location-list/proposal.md:122` (Q1) chose "Your time zone" and left alignment with the design open.
- ✅ The three RENAMED requirements and the MODIFIED "Local time and date are fast and accessible" exist in `openspec/specs/locations/spec.md:467,542,557,717`; the delta keeps every stable scenario title of each (stable `470-537`, `545-551`, `560-584`, `720-735`).

## Coverage

| Requirement id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ "Here mark on location rows" | ✅ 2.1, 3.2, 4.2, 5.1, 5.2, 6.1 |
| FR2 | ✅ | ✅ "Here mark on location rows", "Here mark text" | ✅ 4.2, 5.2, 6.2 |
| FR3 | ✅ | ✅ "Here mark text" | ✅ 1.2, 3.1, 5.1, 6.2 |
| FR4 | ✅ | ✅ ADDED "One leading mark per row" | ✅ 2.1, 3.1, 4.1, 5.2 |
| FR5 | ✅ | ✅ "Here mark on location rows" (list-change and re-read scenarios) | ✅ 5.1 tags, 7.3 |
| NFR-P1 | ✅ | ✅ "Here mark is accessible and fits every screen" | ✅ 5.1 ("50 rows within the budget") |
| NFR-A1 | ✅ | ✅ "Here mark is accessible…", "Local time and date are fast and accessible" | ✅ 4.2, 6.1 |
| NFR-A2 | ✅ | ✅ "Here mark is accessible…" | ✅ 6.1 (axe outline) |
| NFR-R1 | ✅ | ✅ "Here mark is accessible…" | ✅ 6.1 (320 / 2560 px outline) |
| NFR-R2 | ✅ | ✅ "Here mark is accessible…" | ✅ 6.1, 6.3 |
| UX1 | ✅ | ✅ "Here mark text" (filled accent arrow), "Icon before the city" scenario | ✅ 1.1, 4.1, 5.2 |
| UX2 | ✅ | ✅ "Here mark text" | ✅ 4.2 |
| UX3 | ✅ | ✅ "Here mark on location rows" | ✅ 4.2, 5.2 |
| G1 | ✅ | n/a — met by FR1, FR2 | n/a — met by FR1, FR2 |
| G2 | ✅ | n/a — met by FR4 | n/a — met by FR4, M3 |
| NG1 | ✅ | n/a | n/a — no artifact adds home; only the enum-keyed slot |
| NG2 | ✅ | n/a | n/a — no artifact builds the derived Here entry |
| NG3 | ✅ | n/a | n/a — no artifact adds differences |
| NG4 | ✅ | n/a | n/a — only the mark's own classes change |
| NG5 | ✅ | n/a | n/a — the match rule and read moments are restated unchanged |
| NG6 | ✅ | n/a | n/a — search results are not touched |
| M1 | ✅ | n/a | ✅ 7.1 |
| M2 | ✅ | n/a | ✅ 5.2 ("The former pill is gone"); see R3 |
| M3 | ✅ | n/a | ✅ 3.1, 4.1, 5.2 |
| M4 | ✅ | n/a | ✅ 6.1 |
| M5 | ✅ | n/a | ✅ 6.3 |
| M6 | ✅ | n/a | ✅ 7.2 |
| Q1 | ✅ | n/a | n/a — deliberately left open to the home change (proposal Q1, design D1) |
| Q2 | ✅ | n/a | n/a — deliberately left open to the differences change |

## Consistency

None.

## Findings

### R1 — SUGGESTION — Stable requirement keeps a reference to the renamed badge requirement
- Location: `openspec/specs/locations/spec.md:641`
- Rule: `.claude/rules/delta-specs.md`
- Problem: The delta renames "Device time zone badge on location rows" to "Here mark on location rows" (`specs/locations/spec.md:3-4`), but the stable requirement "Local time and date follow the clock" (`openspec/specs/locations/spec.md:640-641`) says the visible page "MUST also … read the device time zone again (see "UTC offset on location rows" and "Device time zone badge on location rows")". The delta does not modify that requirement, so after archive it points at a requirement name that no longer exists. (`openspec/specs/date-selection/spec.md:207` also lists "device time zone badge" among the re-presented labels, but only as a descriptive noun, not a cross-reference; not worth a delta.)
- Impact: After `/opsx:archive` the stable `locations` spec carries a dangling cross-reference; a reader following it finds no such requirement. No code is affected.
- Fix: In `specs/locations/spec.md`, under `## MODIFIED Requirements`, add `### Requirement: Local time and date follow the clock`, copying the stable text and all 7 scenarios (`openspec/specs/locations/spec.md:640-687`) verbatim, with only "Device time zone badge on location rows" replaced by "Here mark on location rows", and append `FR5 of match-here-mark-to-design` to its implements comment. Add the requirement's name to the "Modified Capabilities" line of `proposal.md:26`.
- Fix risk: The MODIFIED block replaces the whole requirement on archive, so any scenario or sentence not copied verbatim is silently lost; the copy must be checked line by line against `openspec/specs/locations/spec.md:640-687`.
- Status: fixed
- Resolution: added `### Requirement: Local time and date follow the clock` under `## MODIFIED Requirements` in `specs/locations/spec.md`, a verbatim copy of stable lines 640-686 with its 6 scenarios (diffed: only the cross-reference now reads "Here mark on location rows" and the comment gains `FR5 of match-here-mark-to-design`); named in proposal.md "Modified Capabilities".

### R2 — SUGGESTION — Scenario "Every mark kind is fully defined" asserts an icon that task 5.2 does not check
- Location: `openspec/changes/match-here-mark-to-design/tasks.md:194`
- Rule: `.claude/rules/test-planning.md`
- Problem: The delta scenario (`specs/locations/spec.md:189-193`) says "THEN each kind has an icon and a non-empty accessible label". Task 5.2 defines that scenario's step as checking only `presentLocationMarks` texts in `en` and `ru`; nothing in the BDD step checks the icon. The icon per kind is only checked by the Vitest `it.each` of task 4.1.
- Impact: The implementer either writes a step whose text promises an icon check it does not make, or rewords the scenario away from the spec; the executable Gherkin then does not verify the icon half of the THEN.
- Fix: In task 5.2, extend "Every mark kind is fully defined" so that, for each `Object.values(LocationMarkKind)`, the step also renders `<LocationMarkIcon mark={presentLocationMarks(translate)[kind]} id="mark" />` and asserts it contains an `svg`; in task 4.1, add "export `LocationMarkIcon` from `views/shared/index.ts`" so the step imports it from `@/views/shared`, as `deviceTimeZoneWorld.tsx:17` already does for `LocationList`.
- Fix risk: One more public export from `views/shared/index.ts`; no layer rule is affected (steps already import `@/views/shared`). The step checks DOM presence only, no accessible name, so it stays within `.claude/rules/bdd-unit.md`.
- Status: open

### R3 — SUGGESTION — M2's icon count is not asserted
- Location: `openspec/changes/match-here-mark-to-design/tasks.md:192`
- Rule: `.claude/rules/traceability.md`
- Problem: M2 (`proposal.md:119`) says "exactly 2 rows show the arrow icon and the 'here' caption". Task 5.2's "The former pill is gone" checks "Exactly 2 rows show the here mark", and design D5 (`design.md:86`) defines "shows the here mark" in unit BDD as only the caption text being present. No step counts the icons for M2.
- Impact: If the icon were dropped from Moscow / Saint Petersburg rows while the caption stayed, the M2 test would still pass, so the metric is not measured as written.
- Fix: In task 5.2, "The former pill is gone" also asserts that exactly 2 rows have an `svg` before their city span on the city line (the same DOM count used by "A marked row has exactly one leading mark").
- Fix risk: none — a DOM count in jsdom, no accessible-name assertion.
- Status: open

## Verdict

Ready to implement. No blocking findings; R1–R3 are SUGGESTION-level polish.
