// Verifies FR2, FR5, FR6, FR10, FR12, FR13 of add-grid-meeting-range-and-share.
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider, TrackMove } from "@/controller";
import { MeetingHandle } from "@/model";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { useMeetingRange } from "./useMeetingRange";

const cityRow = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] });
const almaty = cityRow("Almaty");

function setup(extraLocations: ReturnType<typeof cityRow>[] = []) {
  const clock = createSwitchableClock("2026-03-08T07:30:00Z", "Asia/Almaty");
  const repository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations: [
        almaty,
        cityRow("Moscow"),
        cityRow("New York"),
        ...extraLocations,
      ],
      homeLocationId: almaty.id,
    },
  });
  const save = vi.spyOn(repository, "save");
  const rendered = renderHook(() => useMeetingRange(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <LocationsProvider
        repository={repository}
        writeScheduler={createManualWriteScheduler()}
        clock={clock}
        tickScheduler={createManualTickScheduler()}
      >
        {children}
      </LocationsProvider>
    ),
  });
  const span = () => {
    const { meeting } = rendered.result.current;
    return meeting && [meeting.span.startMinutes, meeting.span.endMinutes];
  };
  return { ...rendered, save, span };
}

describe("useMeetingRange", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should have no meeting at first", () => {
    expect(setup().result.current.meeting).toBeUndefined();
  });

  it("should select the hour of a cell", () => {
    const { result, span } = setup();

    act(() => result.current.selectCells(9, 9));

    expect(span()).toEqual([540, 600]);
  });

  it("should select cells dragged to the left", () => {
    const { result, span } = setup();

    act(() => result.current.selectCells(10, 8));

    expect(span()).toEqual([480, 660]);
  });

  it("should select the hour of the live frame", () => {
    const { result, span } = setup();

    act(() => result.current.selectFramedHour());

    expect(span()).toEqual([720, 780]);
  });

  it("should move a handle by a track move", () => {
    const { result, span } = setup();
    act(() => result.current.selectCells(9, 10));

    act(() =>
      result.current.moveHandle(MeetingHandle.END, TrackMove.HOUR_FORWARD),
    );

    expect(span()).toEqual([540, 720]);
  });

  it("should move a handle to dragged minutes", () => {
    const { result, span } = setup();
    act(() => result.current.selectCells(9, 10));

    act(() => result.current.dragHandleTo(MeetingHandle.END, 700));

    expect(span()).toEqual([540, 705]);
  });

  it("should not touch the store when a drag stays on the same step", () => {
    const { result } = setup();
    act(() => result.current.selectCells(9, 10));
    const before = result.current.meeting;

    act(() => result.current.dragHandleTo(MeetingHandle.END, 661));

    expect(result.current.meeting).toBe(before);
  });

  it("should ignore handle moves without a meeting", () => {
    const { result } = setup();

    act(() =>
      result.current.moveHandle(MeetingHandle.END, TrackMove.NEXT_STEP),
    );
    act(() => result.current.dragHandleTo(MeetingHandle.END, 700));

    expect(result.current.meeting).toBeUndefined();
  });

  it("should clear the meeting", () => {
    const { result } = setup();
    act(() => result.current.selectCells(9, 10));

    act(() => result.current.clearMeetingRange());

    expect(result.current.meeting).toBeUndefined();
  });

  it("should present the bar and the local spans", () => {
    const { result } = setup();

    act(() => result.current.selectCells(9, 10));

    const { meeting } = result.current;
    expect(meeting?.bar.title).toBe("Meeting · 2 h");
    expect(meeting?.durationMinutes).toBe(120);
    expect(meeting?.rowRanges.get(almaty.id)?.spanLabel).toBe("09:00–11:00");
    expect(meeting?.rowRanges.get(cityRow("New York").id)?.dayShiftLabel).toBe(
      "a day earlier",
    );
  });

  it("should present the handles", () => {
    const { result } = setup();

    act(() => result.current.selectCells(9, 10));

    expect(result.current.meeting?.handles.end.valueMinutes).toBe(660);
  });

  it("should save nothing", () => {
    const { result, save } = setup();

    act(() => result.current.selectCells(9, 10));
    act(() =>
      result.current.moveHandle(MeetingHandle.START, TrackMove.NEXT_STEP),
    );
    act(() => result.current.clearMeetingRange());

    expect(save).not.toHaveBeenCalled();
  });
});

describe("useMeetingRange edge cases", () => {
  it("should refuse to run outside a LocationsProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useMeetingRange())).toThrow(
      "useMeetingRange must be used inside a LocationsProvider",
    );
    vi.restoreAllMocks();
  });

  it("should leave out the span of a location with an unknown zone", () => {
    const unknown = buildLocation({
      label: "Nowhere",
      timeZoneId: "Mars/Base",
      countryCode: "XX",
    });
    const { result } = setup([unknown]);
    act(() => result.current.selectCells(9, 10));

    const rowRanges = result.current.meeting?.rowRanges;
    expect(rowRanges?.has(unknown.id)).toBe(false);
    expect(rowRanges?.has(almaty.id)).toBe(true);
  });
});
