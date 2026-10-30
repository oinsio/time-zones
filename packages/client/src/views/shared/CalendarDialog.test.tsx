// Verifies FR3 of select-date-with-calendar-and-now (D6).
// Verifies FR1, FR2, FR3, FR4 of keep-now-button-visible-when-live (D1, D2).
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider } from "@/controller";
import { fakeClock } from "@/lib/temporal";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { DateBar } from "./DateBar";

function renderBar() {
  return render(
    <LocationsProvider
      repository={createInMemoryLocationRepository()}
      writeScheduler={immediateWriteScheduler}
      clock={fakeClock("2026-03-08T07:30:00Z", "Asia/Almaty")}
      tickScheduler={createManualTickScheduler()}
    >
      <DateBar />
    </LocationsProvider>,
  );
}

const shownIsoDate = (container: HTMLElement) =>
  container.querySelector("time")?.getAttribute("datetime");

const openCalendar = () =>
  userEvent.click(screen.getByRole("button", { name: /^Choose date/ }));

const clickButton = (name: string) =>
  userEvent.click(screen.getByRole("button", { name }));

describe("CalendarDialog", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should open on the month of the shown date with its week rows", async () => {
    renderBar();

    await openCalendar();

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "March 2026" }),
    ).toBeInTheDocument();
    expect(within(dialog).getAllByRole("row")).toHaveLength(6);
  });

  it("should pick a date in a later month and close", async () => {
    const { container } = renderBar();
    await openCalendar();

    for (let month = 0; month < 4; month++) await clickButton("Next month");
    expect(
      screen.getByRole("heading", { name: "July 2026" }),
    ).toBeInTheDocument();
    await clickButton("Wednesday, July 15, 2026");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(shownIsoDate(container)).toBe("2026-07-15");
  });

  it("should keep a live moment live when the shown date is picked", async () => {
    renderBar();
    await openCalendar();

    await clickButton("Sunday, March 8, 2026");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Now" })).toBeDisabled();
  });

  it("should change nothing when the calendar is closed without a pick", async () => {
    const { container } = renderBar();
    await openCalendar();

    await clickButton("Previous month");
    await clickButton("Close");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(shownIsoDate(container)).toBe("2026-03-08");
    expect(screen.getByRole("button", { name: "Now" })).toBeDisabled();
  });

  it("should give days of neighbouring months no button", async () => {
    renderBar();
    await openCalendar();

    const dialog = screen.getByRole("dialog");
    const dayButtons = within(dialog).getAllByRole("button", {
      name: /\d{4}$/,
    });
    expect(dayButtons).toHaveLength(31);
  });
});
