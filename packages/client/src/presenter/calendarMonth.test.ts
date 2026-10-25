// Verifies FR3, FR9 of select-date-with-calendar-and-now (D4).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { presentCalendarMonth } from "./calendarMonth";

const present = (
  language: "en" | "ru",
  focusedDate = "2026-03-08",
  selectedDate = "2026-03-08",
  today = "2026-03-08",
) =>
  presentCalendarMonth({
    focusedDate: Temporal.PlainDate.from(focusedDate),
    selectedDate: Temporal.PlainDate.from(selectedDate),
    today: Temporal.PlainDate.from(today),
    language,
  });

const findCell = (month: ReturnType<typeof present>, isoDate: string) =>
  month.weeks.flat().find((cell) => cell?.isoDate === isoDate);

describe("presentCalendarMonth", () => {
  it("should present March 2026 in English from Sunday", () => {
    const month = present("en");

    expect(month.heading).toBe("March 2026");
    expect(month.weekdays[0]?.shortLabel).toBe("Sun");
    expect(month.weekdays[0]?.fullLabel).toBe("Sunday");
    expect(month.weeks).toHaveLength(5);
  });

  it("should mark the focused, selected and today cell", () => {
    expect(findCell(present("en"), "2026-03-08")).toEqual({
      isoDate: "2026-03-08",
      dayNumber: 8,
      fullLabel: "Sunday, March 8, 2026",
      isToday: true,
      isSelected: true,
      isFocused: true,
    });
  });

  it("should present March 2026 in Russian from Monday", () => {
    const month = present("ru");

    expect(month.heading).toBe(
      Temporal.PlainDate.from("2026-03-01").toLocaleString("ru", {
        month: "long",
        year: "numeric",
      }),
    );
    expect(month.weekdays[0]?.shortLabel).toBe("пн");
    expect(month.weeks).toHaveLength(6);
  });

  it("should leave cells outside the month empty", () => {
    expect(present("ru").weeks[0]?.slice(0, 6)).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
  });

  it("should not mark today outside its month and mark the selected day", () => {
    const month = present("en", "2026-07-01", "2026-07-15");

    expect(month.weeks.flat().some((cell) => cell?.isToday)).toBe(false);
    expect(findCell(month, "2026-07-15")?.isSelected).toBe(true);
    expect(findCell(month, "2026-07-01")?.isFocused).toBe(true);
    expect(findCell(month, "2026-07-02")?.isFocused).toBe(false);
  });
});
