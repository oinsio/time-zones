// Verifies FR5, FR6, FR7 of add-day-colouring-setting.
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInMemoryPreferencesRepository } from "@/adapters";
import { HourFormat } from "@/preferences";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { PreferencesProvider } from "./PreferencesProvider";
import { usePreferences } from "./usePreferences";
import {
  useWorkingHoursInput,
  WorkingHoursInputOutcome,
} from "./useWorkingHoursInput";

function renderInput() {
  return renderHook(
    () => ({ input: useWorkingHoursInput(), preferences: usePreferences() }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <PreferencesProvider
          repository={createInMemoryPreferencesRepository()}
          writeScheduler={createManualWriteScheduler()}
        >
          {children}
        </PreferencesProvider>
      ),
    },
  );
}

describe("useWorkingHoursInput", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  const confirm = (
    result: ReturnType<typeof renderInput>["result"],
    startText: string,
    endText: string,
  ) => {
    let outcome: WorkingHoursInputOutcome | undefined;
    act(() => {
      outcome = result.current.input.confirmWorkingHoursInput(
        startText,
        endText,
      );
    });
    return outcome;
  };

  it("should show the stored hours in the 24-hour format", () => {
    const { result } = renderInput();
    expect([
      result.current.input.startText,
      result.current.input.endText,
    ]).toEqual(["10:00", "18:00"]);
  });

  it("should store a minute-exact start without rounding", () => {
    const { result } = renderInput();
    expect(confirm(result, "907", "18:00")).toBe(
      WorkingHoursInputOutcome.SAVED,
    );
    expect(result.current.preferences.preferences.workingHours).toEqual({
      start: "09:07",
      end: "18:00",
    });
  });

  it("should accept the 12-hour texts in the 12-hour format", () => {
    const { result } = renderInput();
    act(() => result.current.preferences.setHourFormat(HourFormat.H12));
    expect(confirm(result, "9:00 am", "5:30 pm")).toBe(
      WorkingHoursInputOutcome.SAVED,
    );
    expect(result.current.input.endText).toBe("5:30 PM");
  });

  it("should write the texts in the chosen hour format", () => {
    const { result } = renderInput();
    act(() => result.current.preferences.setHourFormat(HourFormat.H12));
    expect(result.current.input.startText).toBe("10:00 AM");
  });

  it.each([
    ["25:00", "18:00", WorkingHoursInputOutcome.INVALID_START_TEXT],
    ["10:00", "abc", WorkingHoursInputOutcome.INVALID_END_TEXT],
    ["18:00", "10:00", WorkingHoursInputOutcome.START_NOT_BEFORE_END],
    ["12:00", "12:00", WorkingHoursInputOutcome.START_NOT_BEFORE_END],
  ])(
    "should refuse %s to %s as %s and keep the stored hours",
    (startText, endText, outcome) => {
      const { result } = renderInput();
      expect(confirm(result, startText, endText)).toBe(outcome);
      expect(result.current.preferences.preferences.workingHours).toEqual({
        start: "10:00",
        end: "18:00",
      });
    },
  );

  it("should keep the last valid hours after a refused range", () => {
    const { result } = renderInput();
    confirm(result, "09:00", "17:00");
    confirm(result, "18:00", "10:00");
    expect(result.current.preferences.preferences.workingHours).toEqual({
      start: "09:00",
      end: "17:00",
    });
  });
});
