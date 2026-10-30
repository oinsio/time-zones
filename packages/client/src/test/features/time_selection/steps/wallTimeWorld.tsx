import { act } from "@testing-library/react/pure";
import { DEVICE_TIME_LOCATION_ID } from "@/constants";
import { type WallTimeInputOutcome, WallTimeTargetKind } from "@/controller";
import { WallClockNotePlacement, WallClockStatus } from "@/model";
import { buildLocation } from "@/test/factories/buildLocation";
import { cityEntry } from "../../locations/steps/locationsUiWorld";
import { createTimeSelectionWorld } from "./timeSelectionWorld";

/**
 * Per-scenario state of the wall-time input features: the time selection
 * world plus typing a time in a row or the device time location and reading the hints.
 * Implements FR1, FR3, FR7, FR9 of add-wall-time-input-with-hint (D5).
 */
export const createWallTimeWorld = () => {
  const base = createTimeSelectionWorld();
  let lastOutcome: WallTimeInputOutcome | undefined;

  const typeTime = (city: string, text: string) => {
    const row = base.rowOf(city);
    act(() => {
      lastOutcome = base
        .app()
        .wallTime.confirmWallTime(
          { kind: WallTimeTargetKind.LOCATION, locationId: row.id },
          text,
          row.localIsoDate,
        );
    });
  };
  const deviceTimeRow = () => {
    const row = base
      .rows()
      .find((candidate) => candidate.id === DEVICE_TIME_LOCATION_ID);
    if (row === undefined) throw new Error("there is no device time location");
    return row;
  };
  const typeInDeviceTime = (text: string) => {
    const row = deviceTimeRow();
    act(() => {
      lastOutcome = base
        .app()
        .wallTime.confirmWallTime(
          { kind: WallTimeTargetKind.LOCATION, locationId: row.id },
          text,
          row.localIsoDate,
        );
    });
  };
  let openedDate = "";
  const openField = (city: string) => {
    openedDate = base.rowOf(city).localIsoDate;
  };
  /** Types in a row that may be gone: the field opened while the row existed. */
  const typeInOpenedField = (city: string, text: string) => {
    act(() => {
      lastOutcome = base.app().wallTime.confirmWallTime(
        {
          kind: WallTimeTargetKind.LOCATION,
          locationId: buildLocation(cityEntry(city)).id,
        },
        text,
        openedDate,
      );
    });
  };
  const rowsContext = () => base.app().locations.rowsContext;
  const wallClockNote = () => rowsContext().wallClockNote;
  const hintLines = () => [...base.rows().map((row) => row.wallTimeHint)];

  return {
    ...base,
    typeTime,
    openField,
    typeInOpenedField,
    typeInDeviceTime,
    lastOutcome: () => lastOutcome,
    /** The instant every row shows, as the user sees it. */
    pinnedInstant: () => rowsContext().instant.toString(),
    /** `GAP` / `AMBIGUOUS` while a hint is shown, `UNIQUE` otherwise. */
    wallClockStatus: () => {
      const note = wallClockNote();
      return note?.placement === WallClockNotePlacement.ROW
        ? note.status
        : WallClockStatus.UNIQUE;
    },
    hintOfCity: (city: string) => base.rowOf(city).wallTimeHint,
    hintOfDeviceTime: () => deviceTimeRow().wallTimeHint,
    shownHints: () => hintLines().filter((hint) => hint !== undefined),
    hasDateBarNote: () => base.reference().dateBar.gapNote !== undefined,
    dateBarLabel: () => base.reference().dateBar.longLabel,
    hasWallTimeInput: (city: string) =>
      base.rowOf(city).wallTimeInputLabel !== "" &&
      base.rowOf(city).localTimeLabel !== "",
    inputLabelOf: (city: string) => base.rowOf(city).wallTimeInputLabel,
    removeCity: (city: string) =>
      act(() => {
        base.app().locations.removeLocation(base.rowOf(city).id);
      }),
    makeHome: (city: string) =>
      act(() => {
        base.app().locations.setHomeLocation(base.rowOf(city).id);
      }),
  };
};
