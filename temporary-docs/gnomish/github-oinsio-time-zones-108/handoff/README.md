# Handoff

## H1: Compare the meeting screenshots with the design

**Serves:** NFR-R2, UX1
**Files:** none
**Verify:** compare the 8 new baselines `packages/client/src/test/features/__screenshots__/chromium/Approved-screenshots-of-the-meeting-state-*` with the "Meeting" design screens: 1440 × 900 with `docs/design/screens/grid-desktop-meeting-light.png` / `grid-desktop-meeting-dark.png`, 1180 × 820 with `grid-tablet-meeting-light.png`, 844 × 390 with `grid-phone-landscape-meeting-light.png`, 390 × 844 with `grid-phone-portrait-meeting-light.png`. Check the green bar, the frame over columns 9–10, the dimmed cells, the green spans, «днём раньше» for New York and the two grips on Moscow and Kolkata.
**Why manual:** deciding that a rendered page looks like a design picture is a visual judgement only a human can make; the baselines are written from the implement stage's own render, so a pixel comparison with the design PNGs cannot pass or fail meaningfully.
**Automated part:** the E2E scenarios of tasks 8.1–8.3 assert the structure (frame columns, dimming, token colours, spans, day shift mark, handle rows and layers), and the baselines are compared on every run of both Playwright projects.

## H2: Share meeting on a real phone

**Serves:** FR15
**Files:** none
**Verify:** on an Android phone (Chrome) and an iPhone (Safari) open the pull request's preview deploy, pick Grid, set a meeting, choose «Поделиться встречей»: the system share sheet opens with the meeting share text and no link; close the sheet: nothing happens and no notice shows; share to a messenger and check the lines read as in M6.
**Why manual:** the system share sheet is a native dialog of a physical device that no browser in the sandbox can open or close.
**Automated part:** the `TextSharing` contract tests and the E2E share scenarios of task 8.3 cover every outcome with a stubbed `navigator.share` and the real clipboard.

## H3: Record capability-scoped contract scenarios in ADR-0012

**Serves:** FR17
**Files:** `docs/adr/0012-capability-scoped-view-contract-scenarios.md` (new), `docs/adr/0005-view-registry.md` (Status line only), `CLAUDE.md`
**Verify:** `git apply --check temporary-docs/gnomish/github-oinsio-time-zones-108/handoff/H3-adr-0012-capability-scoped-contract.patch`, then once applied `grep -n "Refines \[ADR-0005\]" docs/adr/0012-capability-scoped-view-contract-scenarios.md` and `grep -n "Refined by \[ADR-0012\]" docs/adr/0005-view-registry.md`.
**Why manual:** the factory may not write `docs/adr/`.
**Automated part:** the `--list` counts of task 8.4 (Grid lists "Set, resize, share and clear", Cards does not) and `main-page` → "Meeting scenarios run only for views that show the meeting range".
