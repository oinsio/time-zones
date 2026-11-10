// Verifies FR7 of fix-grid-meeting-range-lock-and-layering (D5): the header box that holds an open menu.
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { renderCards } from "@/test/renderViewLocationList";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { LocationRowVariant } from "./locationRowVariant";

const savedAlmatyAndMoscow = () => ({
  initialDocument: {
    status: LocationsLoadStatus.LOADED as const,
    locations: [
      buildLocation({
        label: "Almaty",
        timeZoneId: "Asia/Almaty",
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
const almatyMenuButton = () =>
  screen.getByRole("button", { name: "Actions for Almaty" });

describe("ViewLocationList header box layer", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    stubZoneCitiesFetch();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should lift the header box of an open menu to the menu layer", async () => {
    renderCards(savedAlmatyAndMoscow(), LocationRowVariant.GRID_ROW);

    await userEvent.click(almatyMenuButton());

    const headerBox = almatyMenuButton().closest("div.sticky");
    expect(headerBox).toHaveClass("z-location-menu");
    expect(headerBox).not.toHaveClass("focus-within:z-grid-box-focused");
  });

  it("should give the header box back its focus layer after Escape", async () => {
    renderCards(savedAlmatyAndMoscow(), LocationRowVariant.GRID_ROW);
    await userEvent.click(almatyMenuButton());

    await userEvent.keyboard("{Escape}");

    const headerBox = almatyMenuButton().closest("div.sticky");
    expect(headerBox).toHaveClass("focus-within:z-grid-box-focused");
    expect(headerBox).not.toHaveClass("z-location-menu");
  });

  it("should render no header box in Cards", async () => {
    renderCards(savedAlmatyAndMoscow());

    await userEvent.click(almatyMenuButton());

    expect(almatyMenuButton().closest("div.sticky")).toBeNull();
  });
});
