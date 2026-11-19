# Handoff

## H1: Compare the re-approved screenshots with the design screens

Serves: UX1, NFR-R2
Files: none

Why manual: whether a re-taken screenshot looks like the drawn design screen is a visual judgement; the factory can only check that the screenshots are stable from run to run.

Automated part: every approved screenshot is compared pixel by pixel on each run (`pnpm --filter @time-zones/client test:bdd`), so the re-taken PNGs cannot drift unnoticed.

Verify: open each PNG under `packages/client/src/test/features/__screenshots__/chromium/` that was re-taken next to the screen of the same width, theme and palette in `docs/design/screens/` (Cards phone 375 ↔ `cards-phone-*`, Cards 1024 ↔ `cards-tablet-*` / `cards-desktop-*`, Grid 1440 / 1180 / 390 ↔ `grid-desktop-*` / `grid-tablet-light` / `grid-phone-portrait-*`, settings 375 ↔ `settings-phone-*`) and confirm they match except where `docs/architecture/views.md` differs from a screen; report any mismatch as a new task.
