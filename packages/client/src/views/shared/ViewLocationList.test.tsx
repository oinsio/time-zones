// Verifies FR7, UX1 of add-main-page-scaffold: the empty state of Cards, and
// FR10, FR12, FR17, NFR-A2, NFR-A3 of add-locations-via-search, and FR1 of
// reorder-locations-by-drag-and-drop.
// Verifies FR1, FR7, FR8, FR10 of add-grid-hour-cells-and-hour-frame (D5).
// Verifies FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4): the shared
// view location list serves the Cards view and the Grid view.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createInMemoryLocationRepository } from "@/adapters";
import { ADD_LOCATION_BUTTON_ID } from "@/constants";
import { LocationsProvider } from "@/controller";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { removeLocationThroughMenu } from "@/test/removeLocationThroughMenu";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationRowVariant } from "./locationRowVariant";
import { ViewLocationList } from "./ViewLocationList";

type RepositoryOptions = Parameters<typeof createInMemoryLocationRepository>[0];

const renderCards = (
  options: RepositoryOptions = {},
  rowVariant = LocationRowVariant.CARD,
) =>
  render(
    <LocationsProvider
      repository={createInMemoryLocationRepository(options)}
      writeScheduler={immediateWriteScheduler}
    >
      <button type="button" id={ADD_LOCATION_BUTTON_ID}>
        Add location
      </button>
      <ViewLocationList rowVariant={rowVariant} />
    </LocationsProvider>,
  );

const savedLocations = (...labels: string[]) => ({
  initialDocument: {
    status: LocationsLoadStatus.LOADED as const,
    locations: labels.map((label) =>
      buildLocation({ label, timeZoneId: `Test/${label}`, countryCode: "RU" }),
    ),
    homeLocationId: null,
  },
});

describe("ViewLocationList with card rows", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    stubZoneCitiesFetch();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    { language: "en", explanation: "No locations added yet." },
    { language: "ru", explanation: "Места пока не добавлены." },
  ])(
    "should explain in $language that no locations are added",
    async ({ language, explanation }) => {
      await i18n.changeLanguage(language);
      renderCards(savedLocations());
      expect(screen.getByText(explanation)).toBeInTheDocument();
    },
  );

  it("should list the saved locations without the empty state", () => {
    renderCards(savedLocations("Alpha", "Beta"));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(
      screen.queryByText("No locations added yet."),
    ).not.toBeInTheDocument();
  });

  it("should show only the load error with Reset for an unreadable list", () => {
    renderCards({
      initialDocument: { status: LocationsLoadStatus.UNREADABLE },
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.queryByText("No locations added yet."),
    ).not.toBeInTheDocument();
  });

  it("should show the first-launch list, not the empty state, after Reset", async () => {
    renderCards({
      initialDocument: { status: LocationsLoadStatus.UNREADABLE },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Reset the list" }),
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.queryByText("No locations added yet."),
    ).not.toBeInTheDocument();
  });

  it("should announce a removed location politely", async () => {
    renderCards(savedLocations("Alpha", "Beta"));
    await removeLocationThroughMenu("Alpha");
    expect(screen.getByText("Alpha removed")).toHaveAttribute(
      "aria-live",
      "polite",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("should focus Add location after the last location is removed", async () => {
    renderCards(savedLocations("Alpha"));
    await removeLocationThroughMenu("Alpha");
    expect(screen.getByRole("button", { name: "Add location" })).toHaveFocus();
  });

  it("should render move handles when two locations are stored", () => {
    renderCards(savedLocations("Moscow", "Almaty"));
    expect(
      screen.getByRole("button", { name: "Move Moscow" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Move Almaty" }),
    ).toBeInTheDocument();
  });
});

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
    expect(headerBox).toHaveClass("z-[2]", "focus-within:z-[3]");
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
