# Handoff items of support-legacy-ios-12-safari

Run the commands from the repository root. After the archive stage moves this folder, use the same patch file names under the folder's new path.

## H1: CI step "Check legacy build"

- **Serves:** FR12, FR13, M2.
- **Files:** `.github/workflows/ci.yml`.
- **Apply:** `git apply openspec/changes/support-legacy-ios-12-safari/handoff/H1-ci-legacy-build-step.patch` (relative to this README: `H1-ci-legacy-build-step.patch`).
- **Verify:** `git diff -- .github` shows the new step after "Check initial JS budget"; after `pnpm build`, `pnpm --filter @time-zones/client check:legacy-build` exits 0; the CI job passes.
- **Why manual:** the factory may not edit `.github/`.
- **Automated part:** `check:legacy-build`, its rule tests in `src/test/legacyBuild/` and the BigInt source scan run in `pnpm test` and in task 12.1.

## H2: ADR-0009 Supported browser engines

- **Serves:** FR1, FR2, FR3, FR4.
- **Files:** `docs/adr/0009-supported-browser-engines.md` (new), `CLAUDE.md`, `docs/architecture/overview.md`.
- **Apply:** `git apply openspec/changes/support-legacy-ios-12-safari/handoff/H2-adr-supported-browser-engines.patch` (relative to this README: `H2-adr-supported-browser-engines.patch`).
- **Verify:** `grep -c 0009 CLAUDE.md docs/architecture/overview.md` prints 1 for each file; the ADR follows `.claude/rules/adr.md`.
- **Why manual:** the factory may not write `docs/adr/` or `CLAUDE.md`, and the implement stage writes only under `packages/`.
- **Automated part:** the behaviour the ADR records is covered by the unit and E2E features of sections 3–10.

## H3: Glossary context browser-compatibility

- **Serves:** FR4, FR10.
- **Files:** `docs/glossary/browser-compatibility.md` (new), `docs/glossary/app-shell.md`, `docs/glossary/time.md`, `docs/glossary/README.md`.
- **Apply:** `git apply openspec/changes/support-legacy-ios-12-safari/handoff/H3-glossary-browser-compatibility.patch` (relative to this README: `H3-glossary-browser-compatibility.patch`).
- **Verify:** `grep -rn "getLegacyZoneNames\|Update recheck\|Legacy engine" docs/glossary` lists the three entries; the README context table lists the new file.
- **Why manual:** the implement stage writes only under `packages/`, and the glossary lives in `docs/glossary/`.
- **Automated part:** none; `git apply --check` in task 11.3 proves the patch applies.

## H4: Device acceptance on iOS 12.5.7

- **Serves:** FR1, M7.
- **Files:** none (no patch).
- **Apply:** on the owner's iOS 12.5.7 device:
  1. Deploy the branch.
  2. Open the deployed app in Safari on iOS 12.5.7.
  3. Add it to the home screen and open the installed app online once.
  4. U1: the cards are shown, Kyiv included.
  5. U2: tapping a day track selects a time.
  6. U3: reordering cards by finger works without the page scrolling.
  7. U5: search for Kyiv and add it.
  8. After a later deploy, U4: the update notice appears on return to the app.
- **Verify:** the Safari Web Inspector console shows 0 errors during steps 2–8. Record any tuning of `REORDER_TOUCH_ACTIVATION_DELAY_MS` on the PR.
- **Why manual:** no automated runner provides iOS Safari 12 (NG9), and the check needs the owner's physical device.
- **Automated part:** every fallback is tested with the API removed in jsdom, and the touch paths run in Chromium with Pointer Events suppressed (tasks 6.5, 6.6, 10.2).
