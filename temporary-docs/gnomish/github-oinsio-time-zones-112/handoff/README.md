## H1: Compare the dialog and re-approved Grid screenshots with the design

**Serves:** NFR-R2, UX3

**Files:** none

**Verify:** open the new baselines `packages/client/src/test/features/__screenshots__/chromium/Approved-screenshots-with-a-dialog-open-*` and `packages/client/src/test/features/__screenshots__/mobile-chrome/Approved-screenshots-with-a-dialog-open-*` (2 per project: 390 × 844 with the search, 1440 × 900 with the calendar). Check that each dialog covers the grid with no city, time, frame or handle showing through. No existing Grid or meeting baseline needed re-writing: all of them still match, so none is listed as re-written under `__screenshots__/chromium/` or `__screenshots__/mobile-chrome/`. Compare the frame borders in them with `docs/design/screens/grid-*-light.png` and `grid-*-meeting-light.png`.

**Why manual:** deciding that a rendered page looks right against a design picture is a visual judgement only a human can make; the baselines are written from the implement stage's own render, so comparing them with themselves proves nothing about the design.

**Automated part:** the E2E scenarios of 5.2 assert the layers (topmost elements under dialogs and the date bar) and the frame coverage by `elementsFromPoint`, and the baselines are compared on every run.
