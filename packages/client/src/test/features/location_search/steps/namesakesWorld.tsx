// Implements FR7, FR8 of add-geonames-city-source (D7, D9): the search dialog over the full city data.
import zoneCities from "virtual:zone-cities";
import { render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createCompositeCitySearch,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsProvider, useLocations } from "@/controller";
import type { Location } from "@/model";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { fullCityData } from "@/test/fullCityData";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationSearch } from "@/views/shared";

const ADD_LOCATION_BUTTON_KEY = "locations.addLocation";

function LocationsProbe() {
  const { locations } = useLocations();
  return <p data-testid="locations">{JSON.stringify(locations)}</p>;
}

export const readStoredLocations = (): {
  timeZoneId: string;
  label: string;
  countryCode: string;
}[] => JSON.parse(screen.getByTestId("locations").textContent ?? "[]");

export async function openSearchWith(locations: readonly Location[] = []) {
  render(
    <LocationsProvider
      repository={createInMemoryLocationRepository({
        initialDocument: {
          status: LocationsLoadStatus.LOADED,
          locations,
          homeLocationId: null,
        },
      })}
      writeScheduler={immediateWriteScheduler}
    >
      <LocationSearch
        loadCitySearch={async () =>
          createCompositeCitySearch(zoneCities, fullCityData)
        }
      />
      <LocationsProbe />
    </LocationsProvider>,
  );
  await userEvent.click(
    screen.getByRole("button", { name: i18n.t(ADD_LOCATION_BUTTON_KEY) }),
  );
  await screen.findByRole("combobox");
}

export async function typeQuery(query: string) {
  await userEvent.type(screen.getByRole("combobox"), query);
  await screen.findAllByRole("option");
}

export const optionsNamed = (cityName: string) =>
  screen
    .getAllByRole("option")
    .filter((option) => option.textContent?.startsWith(cityName));

/** The text of an option after its city name: the secondary line, then the "Added" mark. */
export const secondaryLineOf = (option: HTMLElement, cityName: string) =>
  (option.textContent ?? "").slice(cityName.length);

export const buildChicagoSpringfield = () =>
  buildLocation({
    timeZoneId: "America/Chicago",
    label: "Springfield",
    countryCode: "US",
  });
export const buildMoscow = () => buildLocation();
