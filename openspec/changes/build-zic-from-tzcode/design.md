# Design: Build zic from tzcode

## Context

Driven by FR1–FR7 of the proposal (see proposal.md "Why" for the glibc `zic` error on `America/Ojinaga`).

Today `scripts/zoneRules/` runs every external program through the injected `RunProcess` port: `gpg` (`verifySignature.ts`), `tar` and `zic` (`compileWithZic.ts`, `compileArchive`), `zdump` (`check.ts`, `findFirstDifference`). Downloads go through the `FetchRelease` port (`downloadRelease.ts`). The unit tests play every program with the fakes of `src/test/zoneRules/compileFakes.ts`; no unit test runs a real program or the network. The compiler (`compile.ts`) and the check (`check.ts`) each create a temporary work directory and remove it at the end.

Facts checked while planning (release `2026f`):

- `tzcode2026f.tar.gz` and its `.asc` are on `data.iana.org`. The signature verifies against the pinned fingerprint `7E3792A9D8ACF7D633BC1588ED97E90E62AA7E34`, the same key as the data archive.
- The code archive holds `Makefile`, `version` (`2026f`) and the C sources of `zic` and `zdump`.
- `make zic zdump` fails when only the code archive is unpacked: the `version` target of the `Makefile` depends on the data files (`africa`, ...). With both archives unpacked into one directory (IANA's documented layout) it builds in about a second, on macOS (Apple clang) and on Ubuntu 24.04 (`gcc`, `make`, `libc6-dev`).
- The built `zic --version` and `zdump --version` print `(tzcode) 2026f`. That `zic` gives `America/Ojinaga` UTC−6 `CST` at `2022-10-30T08:00:00Z`.
- The built `zdump` prints the ends of time as failed conversions, the format the check already skips (commit "Skip the end of time lines of a newer zdump").
- The gnome sandbox image (`.gnomish/factory/sandbox/Dockerfile`, Ubuntu 24.04) has `zic`, `zdump` and `gnupg`, but no C compiler and no `make`. CI `ubuntu-latest` has `gcc` and `make`.

## Goals / Non-Goals

**Goals:**
- One owner builds the zone tools; the compiler and the check both call it.
- Every new step stays behind the existing ports, so it is unit-tested with fakes.

**Non-Goals:**
- No cache of the built tools between runs (proposal NG3).
- No change to `RunProcess`, `FetchRelease` or `verifySignature`.

## Decisions

### D1: The zone tools come from the code archive of the same release

The compiler and the check download `tzcode<release>.tar.gz` and its `.asc`, verify them with `verifySignature` (unchanged), and build `zic` and `zdump` with `make`.

Alternatives:
- **Require a minimum system `zic` version**: the bug is in glibc's copy of `zic`, not in an old tzcode version (macOS `zic` 2022g is right, glibc 2.39 is wrong), so no version number separates good from bad.
- **Pin one tzcode version for every release**: the code and data of one release are tested together by IANA. A pinned version would need its own bumps and could miss syntax a newer data release uses.
- **The combined `tzdb-<release>.tar.lz`**: needs `lzip`, which neither CI nor the sandbox has.
- **Keep glibc `zic`, check against ICU**: ICU lags IANA and differs per Node version; it stays a possible later oracle (proposal Q1).

### D2: One owner, `buildZoneTools`

A new `scripts/zoneRules/buildZoneTools.ts` owns the whole step:

1. download the code archive and its signature (`downloadRelease` gains the archive kind: `tzdata` or `tzcode`, so both names and URLs keep one owner);
2. verify the signature;
3. unpack the code archive into `<work>/tools`, read its `version` and stop on a mismatch (FR2);
4. unpack the data archive into the same directory (D3);
5. run `make -C <work>/tools zic zdump` and stop on a non-zero exit with its code and stderr (FR5);
6. return `{ zicPath, zdumpPath }` (absolute paths inside `<work>/tools`).

`compileArchive` takes the `zicPath` instead of calling `"zic"`. `findFirstDifference` in `check.ts` takes the `zdumpPath` instead of `"zdump"`. `runZoneRulesCompile` and `runZoneRulesCheck` call `buildZoneTools` first. With `--compiled <dir>` the check still builds the tools for `zdump` (FR4).

The glossary owner of the new concept **zone tools** is `buildZoneTools` and its `ZoneTools` type.

### D3: Version check before the data is unpacked

Both archives contain a `version` file. The code archive is unpacked alone first and its `version` read, so a code archive of another release is caught even if the data archive is right. Then the data archive is unpacked over it: the files do not overlap except `version`, which then carries the same name.

### D4: The fakes play `make`

`compileFakes.ts` gains a `make` call: it records the arguments, and on success writes nothing (the fake `zic` and `zdump` are matched by the paths `buildZoneTools` returns, not by name). New fake options: the code archive's `version`, a code signature that fails, a `make` failure. The fake `tar` already writes the data files; it learns the code archive.

### D5: The sandbox gets a compiler and make

`gcc`, `make` and `libc6-dev` join the one apt step of the final stage of `.gnomish/factory/sandbox/Dockerfile`, with the reason in its comment. The image is rebuilt by a human with `.gnomish/factory/build-sandbox`; the gnome cannot rebuild its own image. CI needs no change: `ubuntu-latest` has them.

### D6: Recompiling `2026f`

After the code change, `pnpm zone-rules:compile 2026f` runs on macOS with the built tools and rewrites `zone-rules/release.json` and `zone-rules/zone-coordinates.json`. The diff of `release.json` is reviewed: only `America/Ojinaga` (and the links to it, if any) may change. Any other zone that changes is investigated before the commit. The zone abbreviation fixtures are not affected: Ojinaga keeps `CST` and `CDT`.

## Consequences

Positive:
- The release no longer depends on which `zic` a machine has; macOS, CI and the sandbox compile the same bytes.
- The check compares against IANA's own tools, so a buggy distribution `zic` can no longer hide an error on both sides.

Negative:
- The compiler and the check need a C compiler and `make` instead of `zic` and `zdump`.
- Two more downloads and a short build on every run.

## Risks / Trade-offs

- [The release bump now compiles C code from the network] → the code archive is verified against the pinned key before `make` runs, the same trust as the data archive.
- [`make` prints compiler warnings, which look alarming in logs] → stderr is shown only when `make` fails.
- [A future tzcode needs a newer C compiler or new build tools] → `make` fails with its stderr (FR5); the fix is in the image or the runner, not in silent fallback to the system `zic`.
- [The sandbox image is rebuilt by hand] → until then the gnome cannot run the compiler or the check; this change runs them on the host and on CI.
- [The check downloads two more files on every CI run] → two small files from `data.iana.org`, which the check already reaches.

## Migration Plan

1. Code and tests (D1–D4); the zone rules check on macOS reports the Ojinaga difference against the old release.
2. Recompile `2026f` (D6); the check reports `0 differences` on macOS and in an `ubuntu:24.04` container.
3. Sandbox Dockerfile (D5); a human rebuilds the image.
4. CI runs the check on the pull request (M1).

Rollback: revert the commit; the old release and the system tools come back together.
