// Verifies FR4 of fix-grid-meeting-range-lock-and-layering.
import { act } from "@testing-library/react";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MeetingRangeInputOutcome } from "@/controller";
import { almaty, cityRow, setup } from "./useMeetingRangeSetup";

describe("useMeetingRange confirmMeetingRangeInput", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  const DATE = "2026-03-08";
  const confirm = (
    result: ReturnType<typeof setup>["result"],
    locationId: string,
    startText: string,
    endText: string,
  ) =>
    act(() =>
      result.current.confirmMeetingRangeInput(
        locationId,
        startText,
        endText,
        DATE,
      ),
    );

  it("should set the range typed in another location's time and close", () => {
    const { result, span } = setup();
    const moscowId = cityRow("Moscow").id;
    let outcome: MeetingRangeInputOutcome | undefined;

    act(() => {
      outcome = result.current.confirmMeetingRangeInput(
        moscowId,
        "8",
        "10:30",
        DATE,
      );
    });

    expect(outcome).toBe(MeetingRangeInputOutcome.CLOSED);
    expect(span()).toEqual([600, 750]);
  });

  it.each([
    ["abc", "11", MeetingRangeInputOutcome.INVALID_START_TEXT],
    ["9", "xyz", MeetingRangeInputOutcome.INVALID_END_TEXT],
    ["9:10", "11", MeetingRangeInputOutcome.INVALID_RANGE],
  ])(
    "should answer %s / %s with %s and keep the range",
    (startText, endText, expected) => {
      const { result, span } = setup();
      act(() => result.current.selectCells(9, 10));
      let outcome: MeetingRangeInputOutcome | undefined;

      act(() => {
        outcome = result.current.confirmMeetingRangeInput(
          almaty.id,
          startText,
          endText,
          DATE,
        );
      });

      expect(outcome).toBe(expected);
      expect(span()).toEqual([540, 660]);
    },
  );

  it("should read 12-hour texts of the English interface", () => {
    const { result, span } = setup();

    confirm(result, almaty.id, "10 am", "12:30 pm");

    expect(span()).toEqual([600, 750]);
  });

  it("should close and change nothing for an unknown location", () => {
    const { result, span } = setup();
    let outcome: MeetingRangeInputOutcome | undefined;

    act(() => {
      outcome = result.current.confirmMeetingRangeInput(
        "missing",
        "9",
        "11",
        DATE,
      );
    });

    expect(outcome).toBe(MeetingRangeInputOutcome.CLOSED);
    expect(span()).toBeUndefined();
  });

  it("should record no save", () => {
    const { result, save } = setup();

    confirm(result, almaty.id, "9", "11");

    expect(save).not.toHaveBeenCalled();
  });
});
