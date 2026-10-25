// Verifies FR3, FR9 of select-date-with-calendar-and-now (D5).
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { CalendarMove } from "@/model";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationsProvider } from "./LocationsProvider";
import { useCalendarMonth } from "./useCalendarMonth";
import { useReferenceMoment } from "./useReferenceMoment";

function setup(focusedIsoDate: string) {
  const clock = createSwitchableClock("2026-03-08T07:30:00Z", "Asia/Almaty");
  return renderHook(
    () => ({
      reference: useReferenceMoment(),
      calendar: useCalendarMonth(focusedIsoDate),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocationsProvider
          repository={createInMemoryLocationRepository()}
          writeScheduler={immediateWriteScheduler}
          clock={clock}
          tickScheduler={createManualTickScheduler()}
        >
          {children}
        </LocationsProvider>
      ),
    },
  );
}

const selectedIsoDateOf = (month: {
  weeks: ({ isoDate: string; isSelected: boolean } | null)[][];
}) => month.weeks.flat().find((cell) => cell?.isSelected)?.isoDate;

describe("useCalendarMonth", () => {
  afterEach(() => i18n.changeLanguage("ru"));

  it("should present March 2026 in English with the next week as focus target", async () => {
    await i18n.changeLanguage("en");

    const { result } = setup("2026-03-08");

    expect(result.current.calendar.month.heading).toBe("March 2026");
    expect(result.current.calendar.month.weeks).toHaveLength(5);
    expect(result.current.calendar.getFocusTarget(CalendarMove.NEXT_WEEK)).toBe(
      "2026-03-15",
    );
  });

  it("should start weeks on Monday in Russian", async () => {
    await i18n.changeLanguage("ru");

    const { result } = setup("2026-03-08");

    expect(result.current.calendar.month.weeks).toHaveLength(6);
    expect(
      result.current.calendar.getFocusTarget(CalendarMove.WEEK_START),
    ).toBe("2026-03-02");
  });

  it("should throw outside a LocationsProvider", () => {
    expect(() => renderHook(() => useCalendarMonth("2026-03-08"))).toThrow(
      "useCalendarMonth must be used inside a LocationsProvider",
    );
  });

  it("should select the pinned date", () => {
    const { result } = setup("2026-03-08");
    expect(selectedIsoDateOf(result.current.calendar.month)).toBe("2026-03-08");

    act(() => result.current.reference.selectDate("2026-03-20"));

    expect(selectedIsoDateOf(result.current.calendar.month)).toBe("2026-03-20");
  });
});
