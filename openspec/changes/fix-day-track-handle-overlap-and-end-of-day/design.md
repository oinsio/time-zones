# Design: Fix day track handle overlap and end of day

## Context

Driven by FR1–FR4, NFR-R2 and UX1 of `proposal.md` (motivation: proposal, Why). Every owner below was opened on `main` under `packages/client/src/`, and the glossary (`docs/glossary/time-selection.md`) names each one.

- **Track arithmetic**: `model/dayTrack.ts` (106 lines). `getLastTrackStepMinutes(day)` returns `day.lengthMinutes - TRACK_STEP_MINUTES`. The private `getInstantAtMinutes` clamps to `[0, getLastTrackStepMinutes(day)]`. `getInstantAtTrackFraction` rounds `fraction * lengthMinutes` to the nearest `TRACK_STEP_MINUTES` and calls it. `getInstantAfterTrackMove` uses `getLastTrackStepMinutes` for `TrackMove.DAY_END` and the same clamp for the other moves. `model/index.ts` exports `getLastTrackStepMinutes`.
- **Presenter**: `presentDayTrack` in `presenter/dayTrack.ts` sets `maxMinutes: getLastTrackStepMinutes(day)` (the JSDoc says "the last step of the reference day").
- **Constants**: `constants/timeSelection.ts` has `TRACK_STEP_MINUTES = 15`, `MIN_TRACK_FRACTION`, `MAX_TRACK_FRACTION` and `TRACK_VALUE_MIN_MINUTES`, re-exported by `constants/index.ts`.
- **View**: `views/shared/DayTrack.tsx` (174 lines). The `role="slider"` element is `relative h-11 w-full`. Inside it, the bar `[data-day-track-bar]` is `absolute inset-x-0`, and the handle `[data-day-track-handle]` (`h-11 w-11 -translate-x-1/2`, visible circle `h-7 w-7 md:h-8 md:w-8`) is placed with `left: formatPercent(track.fraction)`. `selectAt` measures `event.currentTarget.getBoundingClientRect()`, the whole slider. The hour-label row (`hidden md:block`) places labels by percent of its own full width.
- **Row layout**: `views/shared/ZoneRowContent.tsx` renders the place and time column, then the `DayTrack` wrapper (`md:flex-1`). `LocationRow` puts the `LocationMenu` button after it. The card's flex gap is `gap-x-3` (12 px). `HereEntryRow` uses the same `ZoneRowContent` and has nothing right of the track.
- **Tests that read the old end**: `model/dayTrack.test.ts` (1425, 1365, 1485, `18:45`), `presenter/dayTrack.test.ts` (`maxMinutes` 1425), `views/shared/dayTrackFixture.tsx` and `LocationRow.test.tsx` (`maxMinutes: 1425`). The step files `timeSelectionWorld.tsx` (`dayBoundsOf`) and `time_selection_day_track.steps.tsx` ("Days of 23 and 25 hours") work out the day length as `track.maxMinutes + TRACK_STEP_MINUTES`. The features `time_selection_select_time.feature` (`18:45` rows) and `time_selection_e2e.feature` (`End | 1425`, `0 to 1425`, Almaty `23:45`) also use it.
- **Tests that mock the slider's box**: `DayTrack.input.test.tsx`, `DayTrack.legacy.test.tsx`, `dayTrackFixture.tsx` and `time_selection_legacy_tap.steps.tsx` replace `slider.getBoundingClientRect`.
- **E2E helpers**: `timeSelectionE2eHelpers.ts` already measures the bar (`barOf`, `pointOnBar`) and the visible handle (`visibleHandleOf`); `timeTextOf` finds the time button, and `menuButton` (`locations/steps/locationsE2eHelpers.ts`) finds the location menu button.

Binding decisions: ADR-0002 (the model owns the arithmetic; the view renders presenter output and emits fractions), ADR-0003 and ADR-0007 (the reference day spans the reference zone's local midnight to the next one, of any length), ADR-0008 (work bounds, not timings). No global decision is needed, so no ADR.

## Goals / Non-Goals

**Goals:** fix both defects inside their current owners. The track end has one owner in the model. The layout fix stays inside the shared `DayTrack` block, so location cards and the Here entry both get it.

**Non-Goals:** a new component, new design tokens, or a change to `ZoneRowContent`, `LocationRow` or the card gap.

## Decision

### D1. The track end replaces the last step as the clamp (FR1, FR2, FR3)

Rename `getLastTrackStepMinutes` to `getTrackEndMinutes(day)` in `model/dayTrack.ts`, returning `day.lengthMinutes - TRACK_END_BEFORE_DAY_END_MINUTES`. The new constant `TRACK_END_BEFORE_DAY_END_MINUTES = 1` goes into `constants/timeSelection.ts` and is re-exported by `constants/index.ts`. `getInstantAtMinutes` clamps to `[0, getTrackEndMinutes(day)]`, and `TrackMove.DAY_END` targets `getTrackEndMinutes(day)`. The rounding stays as it is. A fraction that rounds to `lengthMinutes` is then clamped to the track end, and Next step or Page Up past it are clamped the same way. Previous step from 1439 computes `ceil(1439 / 15) * 15 - 15 = 1425`, so no new move rule is needed. `presentDayTrack` sets `maxMinutes: getTrackEndMinutes(day)`, and `model/index.ts` exports the new name only. The rename follows the glossary rule: a concept renamed means code renamed. H1 adds **Track end** with this owner.


### D2. Inset the track inside the slider's hit area from 768 px (FR4, UX1)

Inside the slider element, wrap the bar and the handle in one positioned box: `absolute inset-y-0 inset-x-0 md:inset-x-[22px]`. 22 px is half the handle's 44 px hit area (`h-11 w-11`). The bar stays `inset-x-0` inside that box, and the handle's `left: <fraction>%` is now relative to it. So the track's edges are still the start and the end of the day, and the handle's centre is still at the instant (the existing "Handle centre matches the instant" scenario measures against the bar). The slider element keeps its full width and 44 px height, so the hit area does not shrink. The hour-label row gets the same `md:mx-[22px]`, so its percentages line up with the bar.

Geometry from 768 px: at the start of the day the visible 32 px circle begins at 22 − 16 = 6 px inside the slider, so 12 + 6 = 18 px separate it from the time column. At the track end (fraction 1439/1440) the same holds against the location menu button. Below 768 px nothing changes (NG2).

`selectAt` measures the bar's box (a `ref` on `[data-day-track-bar]`) instead of `event.currentTarget`. A press in the inset area gives a fraction below 0 or above 1. The existing clamp to `MIN_TRACK_FRACTION`/`MAX_TRACK_FRACTION` turns it into the start or the track end. A bar with zero width still selects nothing.


### D3. Tests move with the owners

Unit tests change their mocks from the slider's box to the bar's box. Steps that derive the day length use `track.maxMinutes + TRACK_END_BEFORE_DAY_END_MINUTES`. The layout check is a new E2E scenario in `time_selection_layout_e2e.feature`, because it needs real boxes (`bdd-e2e.md`, `bdd-unit.md`: "Responsive layout … E2E"). Arithmetic and key moves stay in unit BDD.

## Consequences

Positive:

- One owner of the track end (`getTrackEndMinutes`) serves the pointer, the keys and the slider maximum, so they cannot disagree.
- The layout fix lives in the shared `DayTrack`, so location cards and the Here entry get it, and every future view that reuses the block does too.
- Hit areas and handle sizes stay as specified.

Negative (risks and their mitigation):


- [The 1024 px screenshots change: every track gets 44 px shorter] → re-approve the 1024 px baselines once with `--update-snapshots`, and check that no 375 px baseline changed (task 5.3).
- [The track end is not on the 15-minute grid, so one Next step from 23:45 moves 14 minutes] → intended (FR2). It is the only step that is shorter.
- [A DST transition at local midnight makes the track end show another local time than 23:59] → the spec defines the track end in absolute time (one minute before the day's end). No zone in the scenarios has such a transition.

## Alternatives Considered

**Keep `getLastTrackStepMinutes` and special-case the right end** (D1): keeps the old name, but leaves two notions of "end" in the model, and the slider maximum would disagree with the reachable value. Rejected.

**A 1-minute step near the end of the day** (D1): would change the track step, which NG1 keeps. Rejected.

**A bigger card gap (`md:gap-x-8`)** (D2): also clears the visible handle. But it widens every row, shifts the place column of the Here entry, and still lets the 44 px hit area overflow into the neighbours. Rejected.

**Map fractions to a narrower range in JS** (D2): would split the track geometry between CSS and the presenter, and the hour labels would need the same mapping. Rejected.

**Inset the whole slider element with a margin** (D2): simplest CSS, but the hit area at the ends would no longer contain the handle's 44 × 44 px hit area. Rejected.

## Migration Plan

None. No stored data changes, and the moment is not stored.
