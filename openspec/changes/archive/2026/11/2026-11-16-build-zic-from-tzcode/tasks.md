# Tasks

Paths are relative to `packages/client/` unless they start with `docs/`, `openspec/` or `.gnomish/`. Run tests strictly one command at a time and never in the background (`CLAUDE.md`). Every new or touched production file gets a JSDoc line `Implements <ids> of build-zic-from-tzcode (D<n>).`, every touched test file a `// Verifies <ids> of build-zic-from-tzcode.` comment, and every new or changed Gherkin scenario the tags `@build-zic-from-tzcode @<id>` (steps: the comment `// @build-zic-from-tzcode @<id>` before `f.Scenario`). Use the glossary terms: zone rules release, zone rules compiler, zone rules check, zone tools, local time type. Keep every file under 200 lines. Tests of `scripts/zoneRules/` live under `src/test/zoneRules/`. Scripts run under Node's type stripping: no `enum` or `namespace` in `scripts/`. Each implementation task is RED (failing test shown) then GREEN. Unit tests never run a real `make`, `zic`, `zdump`, `gpg` or the network: they use the fakes of `src/test/zoneRules/compileFakes.ts`.

## 1. Glossary (FR8; design D2)

- [x] 1.1 `docs/glossary/zone-rules.md`: add **Zone tools** (the `zic` and `zdump` built from the signed code archive `tzcode<release>.tar.gz` of one IANA release; never those of the operating system; *Code:* `buildZoneTools`, `ZoneTools`; *Never:* system zic); extend **Zone rules compiler** (compiles with the zone tools of the release) and **Zone rules check** (compares with the `zdump` of the zone tools). Verify: `grep -n "Zone tools" docs/glossary/zone-rules.md` matches; `wc -l docs/glossary/zone-rules.md` is under 200.

## 2. Code archive download (FR1; design D2)

- [x] 2.1 `scripts/zoneRules/downloadRelease.ts`: the archive kind (`tzdata` or `tzcode`) as a constant object, not an `enum`; `getArchiveFileName(release, kind)`; `downloadRelease` takes the kind. Update the callers and `src/test/zoneRules/downloadRelease.test.ts`: `tzcode2026f.tar.gz` and `tzcode2026f.tar.gz.asc` at the release address, no `-latest`. Verify: `npx vitest run src/test/zoneRules/downloadRelease.test.ts`.

## 3. Zone tools (FR1, FR2, FR3, FR5; design D2, D3, D4)

- [x] 3.1 `src/test/zoneRules/compileFakes.ts`: the fake process runner plays `make` (records its arguments; optional failure with exit code and stderr), unpacks the code archive in the `tar` fake (its own `version`, default the requested release), and fails the signature of the code archive on request. The fake `zic` and `zdump` answer to the paths `buildZoneTools` returns. Keep the file under 200 lines (split a `toolFakes.ts` if needed). Verify: the existing `npx vitest run src/test/zoneRules/compile.valid.test.ts` stays green.
- [x] 3.2 `scripts/zoneRules/buildZoneTools.ts` with `src/test/zoneRules/buildZoneTools.test.ts`: downloads and verifies the code archive, unpacks it into `<work>/tools`, stops on a `version` that is not the release (names both), unpacks the data archive into the same directory, runs `make -C <work>/tools zic zdump`, stops on a failed `make` naming its exit code and stderr, returns `{ zicPath, zdumpPath }` inside `<work>/tools`. Cases: success (paths and the `make` arguments), bad code signature, code signature by another key, code version `2026e`, `make` exit 2. Verify: `npx vitest run src/test/zoneRules/buildZoneTools.test.ts`.

## 4. Compiler and check use the zone tools (FR3, FR4; design D2)

- [x] 4.1 `scripts/zoneRules/compileWithZic.ts` (`compileArchive` takes the `zicPath`) and `scripts/zoneRules/compile.ts` (builds the zone tools first, writes nothing on any stop). Extend `src/test/zoneRules/compile.valid.test.ts` (the `zic` call is the built path; no call named `zic` or `zdump`) and `src/test/zoneRules/compile.stops.test.ts` (bad code signature, code version mismatch, failed `make`: nothing written). Verify: `npx vitest run src/test/zoneRules/compile.valid.test.ts`, then `npx vitest run src/test/zoneRules/compile.stops.test.ts`.
- [x] 4.2 `scripts/zoneRules/check.ts`: builds the zone tools of the committed release, compiles with their `zic` and runs their `zdump`; with `--compiled <dir>` it still builds them for `zdump`. Extend `src/test/zoneRules/check.test.ts` and `src/test/zoneRules/check.default.test.ts`: the `zdump` call is the built path in both modes; no call named `zic` or `zdump`; a failed `make` fails the check with its message. Verify: `npx vitest run src/test/zoneRules/check.test.ts`, then `npx vitest run src/test/zoneRules/check.default.test.ts`.
- [x] 4.3 Unit BDD (done: the four new compiler scenarios live in `zone_rules_compile_tools.feature` with `steps/zone_rules_compile_tools.steps.ts`, because `steps/zone_rules_compile.steps.ts` is at the 200-line cap): `src/test/features/zone_rules/zone_rules_compile.feature` gains "A bad code signature stops the compiler", "A code version mismatch stops the compiler", "The release's own zic compiles" and "A failed build of the zone tools stops the compiler", and its existing "A valid archive compiles" and "The archive comes from the release address" match the delta spec; steps in `steps/zone_rules_compile.steps.ts`. A new `zone_rules_check.feature` with `steps/zone_rules_check.steps.ts` holds "The release's own zdump checks" (both modes) (FR1–FR5). Verify: `npx vitest run src/test/features/zone_rules/steps/zone_rules_compile.steps.ts`, then `npx vitest run src/test/features/zone_rules/steps/zone_rules_check.steps.ts`.
- [x] 4.4 M3: from `packages/client/`, `grep -rnE "runProcess\\(\\s*\"(zic|zdump)\"|\"zic\",|\"zdump\"," scripts/zoneRules` prints nothing.

## 5. Recompile 2026f (FR6; design D6)

- [x] 5.1 Before recompiling: `pnpm --filter @time-zones/client zone-rules:check` on the host (network, `gpg`, `cc`, `make`) reports `America/Ojinaga differs at 2022-10-30T08:00:00Z`, which shows the check now sees the error.
- [x] 5.2 (done: 17 zones changed, not one. A lookup of the old and the new release every hour of 2000–2045 and at every change found only `America/Ojinaga` different; 14 zones differ only in how the last listed change before the future rule is encoded. `Asia/Gaza` and `Asia/Hebron` also differ from 2073 on, where the new release is right: the tzcode `zdump` and ICU give EET +2 at `2073-09-01T23:00:00Z`, the old release gave EEST +3. `0 differences` on macOS and in `ubuntu:24.04`.) `pnpm --filter @time-zones/client zone-rules:compile 2026f`; review `git diff packages/client/zone-rules/`: in `release.json` only `America/Ojinaga` changes (investigate and stop on any other zone); `zone-coordinates.json` is unchanged. Then `pnpm --filter @time-zones/client zone-rules:check` reports `0 differences`. Verify the same in a container: `docker run` of `ubuntu:24.04` with `gcc make libc6-dev gpg ca-certificates libatomic1` and the Node of `.nvmrc`, running `node scripts/zoneRules/check.ts` from `packages/client`, prints `0 differences`.
- [x] 5.3 Unit BDD: `src/test/features/zone_rules/zone_rules_lookup.feature` gains "Ojinaga in November 2022" (`2022-10-30T08:00:00Z`, `2022-11-03T12:00:00Z` → UTC−6 `CST`, standard time) over the committed release, with its steps (FR6, M2, UX1). Verify: `npx vitest run src/test/features/zone_rules/steps/zone_rules_lookup.steps.ts`.
- [x] 5.4 The tests that read the committed release stay green: `npx vitest run src/test/zoneRules/`, then `npx vitest run src/test/features/zone_rules/`. Then `pnpm --filter @time-zones/client check:bundle-size` (the zone rules asset budget).

## 6. Sandbox and docs (FR7, FR8; design D5)

- [x] 6.1 `.gnomish/factory/sandbox/Dockerfile`: `gcc make libc6-dev` in the apt step of the final stage, with the reason ("the zone tools are built from tzcode: zone-rules:compile, zone-rules:check") in its comment. Verify: `grep -n "libc6-dev" .gnomish/factory/sandbox/Dockerfile` matches; the human rebuild is listed under "Human follow-up".
- [x] 6.2 `zone-rules/README.md` "Commands": the commands need `cc`, `make` and `gpg` and download `tzdata<release>` and `tzcode<release>`; they build the zone tools and never use the system `zic` or `zdump`. Verify: `grep -n "tzcode" zone-rules/README.md` matches; `grep -n "Both need .zic." zone-rules/README.md` prints nothing.
- [x] 6.3 `docs/adr/0014-zone-rules-from-iana.md`: a status note "The zone tools (`zic`, `zdump`) are built from the signed `tzcode<release>.tar.gz` of the same release, never taken from the operating system (`build-zic-from-tzcode`)." Verify: `grep -n "build-zic-from-tzcode" docs/adr/0014-zone-rules-from-iana.md` matches.

## 7. Verification (M1–M4, NFR-P1)

- [x] 7.1 Scoped mutation testing, at most five files per run, each run finished before the next (`cd packages/client && npx stryker run --mutate '<files>'`, then read `reports/mutation/mutation-report.json`, kill survivors, re-run): `scripts/zoneRules/buildZoneTools.ts,scripts/zoneRules/downloadRelease.ts,scripts/zoneRules/compileWithZic.ts,scripts/zoneRules/compile.ts,scripts/zoneRules/check.ts`. Target ≥ 95 %, minimum 90 % (M4).
- [x] 7.2 `pnpm --filter @time-zones/client lint` and `pnpm --filter @time-zones/client typecheck` pass; `pnpm run build` passes.
- [x] 7.3 Traceability: `grep -rn "build-zic-from-tzcode" packages/client/src packages/client/scripts | grep -oE "FR[0-9]+" | sort -u` lists FR1–FR6; FR7 and FR8 are traced in the Dockerfile comment, the glossary, the README and ADR-0014.
- [x] 7.4 (done: CI run of `f0278ba1`, job "Lint, test, build, E2E" succeeded; "Check zone rules" succeeded in 14 s, against 62 s of the failing run of `66c0d559` with the system tools.) After push: the CI step "Check zone rules" of the pull request reports `0 differences` (M1) and its duration is noted against NFR-P1 (at most 60 s more than before).

## Human follow-up

- Rebuild the gnome sandbox image with `.gnomish/factory/build-sandbox` (FR7). Why manual: the gnome cannot rebuild its own image. Automated part: the Dockerfile change (task 6.1).
- Optional (NG1): report the glibc `zic` miscompilation of `America/Ojinaga` (2026f, `-6:00 - CST 2022 Nov 30 0:00` after `-7:00 US M%sT 2022 Oct 30 2:00`) upstream.

## Workflow follow-up

- Archive the change after the pull request is merged (`/opsx:archive`).
