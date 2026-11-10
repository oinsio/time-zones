// Verifies FR8, FR9 of add-grid-meeting-range-and-share (D6, D8).
// Verifies FR7, UX1 of add-main-page-scaffold: the empty state of Cards, and
// FR10, FR12, FR17, NFR-A2, NFR-A3 of add-locations-via-search, and FR1 of
// reorder-locations-by-drag-and-drop.
// Verifies FR1, FR7, FR8, FR10 of add-grid-hour-cells-and-hour-frame (D5).
// Verifies FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4): the shared
// view location list serves the Cards view and the Grid view.
import { render, screen, within } from "@testing-library/react";
import i18n from "i18next";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider } from "@/controller";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { renderCards, savedLocations } from "@/test/renderViewLocationList";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationRowVariant } from "./locationRowVariant";
import { ViewLocationList } from "./ViewLocationList";

const ALMATY_ZONE_ID = "Asia/Almaty";
const savedAlmatyAndMoscow = () => ({
  initialDocument: {
    status: LocationsLoadStatus.LOADED as const,
    locations: [
      buildLocation({
        label: "Almaty",
        timeZoneId: ALMATY_ZONE_ID,
        countryCode: "KZ",
      }),
      buildLocation({
        label: "Moscow",
        timeZoneId: "Europe/Moscow",
        countryCode: "RU",
      }),
    ],
    homeLocationId: null,
  },
});

describe("ViewLocationList with grid rows", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    stubZoneCitiesFetch();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should mark the list as grid rows", () => {
    renderCards(savedAlmatyAndMoscow(), LocationRowVariant.GRID_ROW);
    expect(screen.getByRole("list")).toHaveAttribute(
      "data-row-variant",
      "grid-row",
    );
  });

  it("should mark the list as cards for card rows", () => {
    renderCards(savedAlmatyAndMoscow());
    expect(screen.getByRole("list")).toHaveAttribute(
      "data-row-variant",
      "card",
    );
  });

  it("should draw the rows in one panel with dividers", () => {
    renderCards(savedAlmatyAndMoscow(), LocationRowVariant.GRID_ROW);
    const panel = screen.getByRole("list");
    expect(panel).toHaveClass("border", "border-border");
    expect(panel).not.toHaveClass("divide-y");
    for (const row of screen.getAllByRole("listitem")) {
      expect(row).toHaveClass("border-t", "border-border", "first:border-t-0");
    }
  });

  it("should keep the surface on every row and give it no border of its own", () => {
    renderCards(savedAlmatyAndMoscow(), LocationRowVariant.GRID_ROW);
    for (const row of screen.getAllByRole("listitem")) {
      expect(row).toHaveClass("bg-surface");
      expect(row).not.toHaveClass("border");
      expect(row).toHaveClass("first:rounded-t-md", "last:rounded-b-md");
    }
  });

  it("should show no day track", () => {
    renderCards(savedAlmatyAndMoscow(), LocationRowVariant.GRID_ROW);
    expect(document.querySelector("[data-day-track]")).toBeNull();
  });

  it("should keep the header above the frame while a menu holds focus", () => {
    renderCards(savedAlmatyAndMoscow(), LocationRowVariant.GRID_ROW);
    const headerBox = screen
      .getByRole("button", { name: "Actions for Almaty" })
      .closest("div.sticky");
    expect(headerBox).toHaveClass(
      "z-grid-box",
      "focus-within:z-grid-box-focused",
    );
  });

  it("should keep the location menu and the wall-time button on every row", () => {
    renderCards(savedAlmatyAndMoscow(), LocationRowVariant.GRID_ROW);
    for (const city of ["Almaty", "Moscow"]) {
      expect(
        screen.getByRole("button", { name: `Actions for ${city}` }),
      ).toBeInTheDocument();
    }
    expect(screen.getAllByRole("button", { name: /^Enter time/ })).toHaveLength(
      2,
    );
  });

  it("should read the date before the time button in every row", () => {
    renderCards(savedAlmatyAndMoscow(), LocationRowVariant.GRID_ROW);
    for (const row of screen.getAllByRole("listitem")) {
      const dateElement = row.querySelector("time") as HTMLElement;
      const timeButton = within(row).getByRole("button", {
        name: /^Enter time/,
      });
      expect(
        dateElement.compareDocumentPosition(timeButton) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it("should render each strip after the location menu and the frame last", () => {
    render(
      <LocationsProvider
        repository={createInMemoryLocationRepository(savedAlmatyAndMoscow())}
        writeScheduler={immediateWriteScheduler}
      >
        <ViewLocationList
          rowVariant={LocationRowVariant.GRID_ROW}
          hourGrid={{
            renderHourStrip: (row) => <p data-strip={row.cityLabel} />,
            frame: <li data-frame />,
            panelRef: () => undefined,
            panelStyle: {},
            areRowControlsLocked: false,
          }}
        />
      </LocationsProvider>,
    );
    const rows = screen
      .getAllByRole("listitem")
      .filter((row) => !row.hasAttribute("data-frame"));
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      const menuButton = within(row).getByRole("button", {
        name: /^Actions for/,
      });
      const strip = row.querySelector("[data-strip]") as HTMLElement;
      expect(
        menuButton.compareDocumentPosition(strip) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(screen.getByRole("list").lastElementChild).toHaveAttribute(
      "data-frame",
    );
  });

  it("should show each row's meeting span from meetingRangeOf in place of its time", () => {
    render(
      <LocationsProvider
        repository={createInMemoryLocationRepository(savedAlmatyAndMoscow())}
        writeScheduler={immediateWriteScheduler}
      >
        <ViewLocationList
          rowVariant={LocationRowVariant.GRID_ROW}
          hourGrid={{
            renderHourStrip: () => null,
            frame: null,
            meetingRangeOf: (row) => ({
              startTimeLabel: "start",
              endTimeLabel: "end",
              spanLabel: `span of ${row.cityLabel}`,
            }),
            panelRef: () => undefined,
            panelStyle: {},
            areRowControlsLocked: false,
          }}
        />
      </LocationsProvider>,
    );
    expect(screen.getByText("span of Almaty")).toBeInTheDocument();
    expect(screen.getByText("span of Moscow")).toBeInTheDocument();
  });

  it("should show the empty state", () => {
    renderCards(savedLocations(), LocationRowVariant.GRID_ROW);
    expect(screen.getByText("No locations added yet.")).toBeInTheDocument();
  });

  it("should show the load error for an unreadable list", () => {
    renderCards(
      { initialDocument: { status: LocationsLoadStatus.UNREADABLE } },
      LocationRowVariant.GRID_ROW,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
