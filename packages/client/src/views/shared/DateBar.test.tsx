// Verifies FR2, FR4, FR6, FR7 of select-date-with-calendar-and-now (D6).
// Verifies FR1, FR2, FR3, FR4 of keep-now-button-visible-when-live (D1, D2).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider } from "@/controller";
import { fakeClock } from "@/lib/temporal";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { DateBar } from "./DateBar";

const GAP_NOTE =
  "02:30 does not exist on this day because of a clock change; showing 03:30.";

function renderBar(timestamp: string, zone: string) {
  return render(
    <LocationsProvider
      repository={createInMemoryLocationRepository()}
      writeScheduler={immediateWriteScheduler}
      clock={fakeClock(timestamp, zone)}
      tickScheduler={createManualTickScheduler()}
    >
      <DateBar />
    </LocationsProvider>,
  );
}

const shownIsoDate = (container: HTMLElement) =>
  container.querySelector("time")?.getAttribute("datetime");

const click = (name: string) =>
  userEvent.click(screen.getByRole("button", { name }));

describe("DateBar", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should show the date with an inactive Now while live", () => {
    const { container } = renderBar("2026-03-08T07:30:00Z", "Asia/Almaty");

    expect(shownIsoDate(container)).toBe("2026-03-08");
    expect(
      container.querySelector('[data-date-label="short"]'),
    ).toHaveTextContent("Sun, March 8");
    expect(
      container.querySelector('[data-date-label="long"]'),
    ).toHaveTextContent("Sunday, March 8");
    expect(screen.getByRole("button", { name: "Now" })).toBeDisabled();
  });

  it("should activate Now after the next day and deactivate it after Now", async () => {
    const { container } = renderBar("2026-03-08T07:30:00Z", "Asia/Almaty");

    await click("Next day");
    expect(shownIsoDate(container)).toBe("2026-03-09");
    expect(screen.getByRole("button", { name: "Now" })).toBeEnabled();

    await click("Now");
    expect(shownIsoDate(container)).toBe("2026-03-08");
    expect(screen.getByRole("button", { name: "Now" })).toBeDisabled();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /^Choose date/ }),
    );
  });

  it("should keep the moment live when the inactive Now is clicked", async () => {
    const { container } = renderBar("2026-03-08T07:30:00Z", "Asia/Almaty");

    await userEvent.click(screen.getByRole("button", { name: "Now" }));

    expect(shownIsoDate(container)).toBe("2026-03-08");
    expect(screen.getByRole("button", { name: "Now" })).toBeDisabled();
  });

  it.each(["live", "pinned"])(
    "should give Now the clock icon and the label in the %s mode",
    async (mode) => {
      renderBar("2026-03-08T07:30:00Z", "Asia/Almaty");
      if (mode === "pinned") await click("Next day");

      const nowButton = screen.getByRole("button", { name: "Now" });

      expect(nowButton.querySelectorAll("svg")).toHaveLength(1);
      expect(nowButton).toHaveTextContent("Now");
    },
  );

  it("should style the inactive Now with the muted tokens", () => {
    renderBar("2026-03-08T07:30:00Z", "Asia/Almaty");

    const { className } = screen.getByRole("button", { name: "Now" });

    expect(className).toContain("disabled:bg-muted");
    expect(className).toContain("disabled:text-muted-foreground");
    expect(className).toContain("bg-accent");
    expect(className).toContain("text-accent-foreground");
  });

  it("should show the previous day", async () => {
    const { container } = renderBar("2026-03-08T07:30:00Z", "Asia/Almaty");

    await click("Previous day");

    expect(shownIsoDate(container)).toBe("2026-03-07");
  });

  it("should tell a gap and clear the note on the next move", async () => {
    renderBar("2026-03-07T07:30:00Z", "America/New_York");

    await click("Next day");
    expect(screen.getByText(GAP_NOTE)).toBeInTheDocument();

    await click("Next day");
    expect(screen.queryByText(GAP_NOTE)).not.toBeInTheDocument();
  });
});
