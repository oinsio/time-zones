// Verifies FR1, FR6, UX1 of show-utc-offset-on-location-rows (D5).
// Verifies FR2, FR6, UX1, NFR-A2 of show-local-time-and-date-on-location-cards (D5).
// Verifies FR1 of reorder-locations-by-drag-and-drop.
// Verifies FR1 of add-time-sliders-to-location-cards (D8).
import { screen } from "@testing-library/react";
import i18n from "i18next";
import { DayPeriod } from "@/presenter";
import { renderKolkataRow as renderRow } from "./locationRowFixture";

describe("LocationRow", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should show the offset after the country on the muted secondary line", () => {
    renderRow();
    const secondaryLine = screen.getByText("India").parentElement;
    expect(secondaryLine).toHaveTextContent("IndiaUTC+5:30");
    expect(secondaryLine).toHaveClass("text-muted-foreground");
    expect(secondaryLine).toContainElement(screen.getByText("UTC+5:30"));
  });

  it("should still show the offset when the country name is empty", () => {
    renderRow({ countryName: "" });
    expect(screen.getByText("UTC+5:30")).toBeInTheDocument();
  });

  it("should show no offset element and keep the remove action when the offset label is empty", () => {
    renderRow({ utcOffsetLabel: "" });
    expect(screen.queryByText(/UTC/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Actions for Kolkata" }),
    ).toBeInTheDocument();
  });

  it("should show no secondary line when both country and offset are empty", () => {
    renderRow({ countryName: "", utcOffsetLabel: "" });
    expect(screen.getByRole("listitem")).toHaveTextContent(/^Kolkata⋯$/);
  });

  it("should show the move handle when reorderable", () => {
    renderRow();
    expect(
      screen.getByRole("button", { name: "Move Kolkata" }),
    ).toBeInTheDocument();
  });

  it("should show no move handle when not reorderable", () => {
    renderRow({}, false);
    expect(screen.queryByRole("button", { name: /^Move / })).toBeNull();
  });

  describe("local time and date", () => {
    const withTime = {
      localTimeLabel: "12:30",
      localDateLabel: "Sun, Mar 8",
      localIsoDate: "2026-03-08",
    };

    it("should read city, country and offset, time, date in that order", () => {
      renderRow(withTime);
      expect(screen.getByRole("listitem")).toHaveTextContent(
        "KolkataIndiaUTC+5:3012:30Sun, Mar 8",
      );
    });

    it("should show the time bolder than the semibold city", () => {
      renderRow(withTime);
      expect(screen.getByText("12:30")).toHaveClass("font-bold");
      expect(screen.getByText("Kolkata")).toHaveClass("font-semibold");
    });

    it("should keep the row name as the city", () => {
      renderRow(withTime);
      expect(
        screen.getByRole("listitem", { name: "Kolkata" }),
      ).toBeInTheDocument();
    });

    it("should keep the remove action for a row without time", () => {
      renderRow();
      expect(screen.queryByText("12:30")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Actions for Kolkata" }),
      ).toBeInTheDocument();
    });
  });
});

describe("LocationRow day track", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  const dayTrack = {
    fraction: 0.5,
    valueMinutes: 720,
    maxMinutes: 1425,
    valueText: "12:00, Sun, Mar 8",
    stops: [{ fraction: 0.3, period: DayPeriod.NIGHT }],
    hourLabels: [],
  };

  it("should render one track for a row with a day track", () => {
    const { container } = renderRow({ dayTrack });

    expect(container.querySelectorAll("[data-day-track]")).toHaveLength(1);
  });

  it("should render no track for a row without one", () => {
    const { container } = renderRow();

    expect(container.querySelectorAll("[data-day-track]")).toHaveLength(0);
  });
});
