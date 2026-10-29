// Verifies FR3, FR11, NFR-A2 of set-home-location-and-show-differences (D8): home in the cards view.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider } from "@/controller";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { removeLocationThroughMenu } from "@/test/removeLocationThroughMenu";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import CardsView from "./CardsView";

const city = (cityName: string) =>
  buildLocation({ label: cityName, ...KNOWN_CITIES[cityName] });

function renderCards(homeLocationId: string | null = null) {
  render(
    <LocationsProvider
      repository={createInMemoryLocationRepository({
        initialDocument: {
          status: LocationsLoadStatus.LOADED,
          locations: [city("Almaty"), city("Moscow")],
          homeLocationId,
        },
      })}
      writeScheduler={immediateWriteScheduler}
    >
      <CardsView />
    </LocationsProvider>,
  );
}

const menuButton = (cityName: string) =>
  screen.getByRole("button", { name: `Actions for ${cityName}` });

describe("CardsView home location", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    stubZoneCitiesFetch();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should announce a new home politely and keep focus on the row", async () => {
    renderCards();
    await userEvent.click(menuButton("Almaty"));

    await userEvent.click(screen.getByRole("menuitem", { name: "Make home" }));

    expect(screen.getByText("Almaty is now home")).toHaveAttribute(
      "aria-live",
      "polite",
    );
    expect(menuButton("Almaty")).toHaveFocus();
  });

  it("should announce a cleared home politely", async () => {
    renderCards(city("Almaty").id);
    await userEvent.click(menuButton("Almaty"));

    await userEvent.click(screen.getByRole("menuitem", { name: "Clear home" }));

    expect(screen.getByText("Home cleared")).toHaveAttribute(
      "aria-live",
      "polite",
    );
    expect(screen.queryByRole("img", { name: "Home location" })).toBeNull();
  });

  it("should show the home mark on the home row", async () => {
    renderCards(city("Almaty").id);

    expect(
      screen.getByRole("img", { name: "Home location" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("should move focus to the next row's menu button after a removal", async () => {
    renderCards();

    await removeLocationThroughMenu("Almaty");

    expect(menuButton("Moscow")).toHaveFocus();
  });
});
