# Handoff

## H1: Glossary entry for the track end

- **Serves:** FR1, FR2, FR3
- **Files:** `docs/glossary/time-selection.md`
- **Apply:** from the repository root, `git apply openspec/changes/fix-day-track-handle-overlap-and-end-of-day/handoff/H1-glossary-track-end.patch` (relative to this README: `git apply H1-glossary-track-end.patch`).
- **Verify:** `grep -c "Track end" docs/glossary/time-selection.md` prints at least 1, and `grep -rn "getLastTrackStepMinutes" docs packages/client/src` prints nothing.
- **Why manual:** the implement stage writes only under `packages/` and the change's `handoff/` folder, and the glossary lives in `docs/glossary/`.
- **Automated part:** `git apply --check` of the patch; the owner it names, `getTrackEndMinutes`, is covered by the tests of sections 2–5.
