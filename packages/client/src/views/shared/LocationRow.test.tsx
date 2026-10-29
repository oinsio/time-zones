// Verifies FR1, FR6, UX1 of show-utc-offset-on-location-rows (D5).
// Verifies FR2, FR6, UX1, NFR-A2 of show-local-time-and-date-on-location-cards (D5).
// Verifies FR1 of reorder-locations-by-drag-and-drop.
// Verifies FR1 of add-time-sliders-to-location-cards (D8).
// Verifies FR1, FR2, UX1, UX2 of mark-device-time-zone-in-location-list (D5).
// Verifies FR1, FR2, FR4, UX1, UX2, UX3, NFR-A1 of match-here-mark-to-design.
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import {
  DayPeriod,
  LocationMarkKind,
  type LocationRow as LocationRowModel,
} from "@/presenter";
import { LocationRow } from "./LocationRow";

const row: LocationRowModel = {
  id: "kolkata",
  cityLabel: "Kolkata",
  countryName: "India",
  utcOffsetLabel: "UTC+5:30",
  offsetDifferenceLabel: "",
  offsetDifferenceAccessibleLabel: "",
  localTimeLabel: "",
  localDateLabel: "",
  localIsoDate: "",
};

const renderRow = (
  overrides: Partial<LocationRowModel> = {},
  isReorderable = true,
) =>
  render(
    <DndContext>
      <SortableContext items={[row.id]}>
        <ul>
          <LocationRow
            row={{ ...row, ...overrides }}
            onRemove={vi.fn()}
            onSetHome={() => undefined}
            onSelectTrackFraction={vi.fn()}
            onMoveTrack={vi.fn()}
            isReorderable={isReorderable}
            prefersReducedMotion={false}
          />
        </ul>
      </SortableContext>
    </DndContext>,
  );

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

  describe("here mark", () => {
    const hereMark = {
      kind: LocationMarkKind.HERE,
      accessibleLabel: "You are here",
      caption: "here",
    };

    it("should put the mark image before the city on the city line", () => {
      renderRow({ mark: hereMark });
      const cityLine = screen.getByText("Kolkata").parentElement;
      expect(cityLine?.firstElementChild).toBe(
        screen.getByRole("img", { name: "You are here" }),
      );
      expect(cityLine?.firstElementChild?.nextElementSibling).toBe(
        screen.getByText("Kolkata"),
      );
    });

    it("should put the caption right after the city", () => {
      renderRow({ mark: hereMark });
      expect(screen.getByText("Kolkata").nextElementSibling).toBe(
        screen.getByText("here"),
      );
    });

    it("should hide the caption from assistive technology", () => {
      renderRow({ mark: hereMark });
      expect(screen.getByText("here")).toHaveAttribute("aria-hidden", "true");
    });

    it("should draw the caption as bold accent text", () => {
      renderRow({ mark: hereMark });
      expect(screen.getByText("here")).toHaveClass("text-accent", "font-bold");
    });

    it.each(["bg-accent", "rounded-full", "border"])(
      "should not draw the caption as a pill with the %s class",
      (pillClassName) => {
        renderRow({ mark: hereMark });
        expect(screen.getByText("here")).not.toHaveClass(pillClassName);
      },
    );

    it("should name the row by the city and the mark", () => {
      renderRow({ mark: hereMark });
      expect(
        screen.getByRole("listitem", { name: "Kolkata You are here" }),
      ).toBeInTheDocument();
    });

    it("should name the row by the city alone without a mark", () => {
      renderRow();
      expect(
        screen.getByRole("listitem", { name: "Kolkata" }),
      ).toBeInTheDocument();
    });

    it("should start the city line with the city and render nothing else on it without a mark", () => {
      renderRow();
      expect(screen.getByText("Kolkata").parentElement?.children).toHaveLength(
        1,
      );
    });

    it("should not show the former pill text", () => {
      renderRow({ mark: hereMark });
      expect(screen.queryByText("Your time zone")).toBeNull();
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
