import { render } from "@testing-library/react";
import { createInMemoryLocationRepository } from "@/adapters";
import { ADD_LOCATION_BUTTON_ID } from "@/constants";
import { LocationsProvider } from "@/controller";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationRowVariant } from "@/views/shared/locationRowVariant";
import { ViewLocationList } from "@/views/shared/ViewLocationList";

type RepositoryOptions = Parameters<typeof createInMemoryLocationRepository>[0];

export const renderCards = (
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

export const savedLocations = (...labels: string[]) => ({
  initialDocument: {
    status: LocationsLoadStatus.LOADED as const,
    locations: labels.map((label) =>
      buildLocation({ label, timeZoneId: `Test/${label}`, countryCode: "RU" }),
    ),
    homeLocationId: null,
  },
});
