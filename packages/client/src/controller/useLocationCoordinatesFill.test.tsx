// Verifies FR8, NFR-P2, NFR-P3 of add-city-coordinates-to-locations (D7): stored locations gain their coordinates.
import { renderHook, waitFor } from "@testing-library/react";
import { buildDeviceTimeLocation, type Coordinates } from "@/model";
import type { CitySearch, LoadCitySearch } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { useLocationCoordinatesFill } from "./useLocationCoordinatesFill";

const MOSCOW_COORDINATES: Coordinates = { latitude: 55.8, longitude: 37.6 };
const KAZAN_COORDINATES: Coordinates = { latitude: 55.8, longitude: 49.1 };
const moscow = buildLocation();
const kazan = buildLocation({ label: "Kazan" });
const almaty = buildLocation({
  timeZoneId: "Asia/Almaty",
  label: "Almaty",
  countryCode: "KZ",
});
const utc = buildLocation({ timeZoneId: "UTC", label: "UTC", countryCode: "" });

const coordinatesByLabel: Record<string, Coordinates | undefined> = {
  Moscow: MOSCOW_COORDINATES,
  Kazan: KAZAN_COORDINATES,
};

function createLoader() {
  const getCoordinates = vi.fn(
    (_timeZoneId: string, storedLabel: string) =>
      coordinatesByLabel[storedLabel],
  );
  const load: LoadCitySearch = vi.fn(
    async () => ({ getCoordinates }) as unknown as CitySearch,
  );
  return { load, getCoordinates };
}

describe("useLocationCoordinatesFill", () => {
  it("should look up one location without coordinates per city and dispatch once", async () => {
    const { load, getCoordinates } = createLoader();
    const fill = vi.fn();
    const withCoordinates = { ...moscow, coordinates: MOSCOW_COORDINATES };

    renderHook(() =>
      useLocationCoordinatesFill([withCoordinates, kazan, almaty], load, fill),
    );

    await waitFor(() => expect(fill).toHaveBeenCalledTimes(1));
    expect(getCoordinates).toHaveBeenCalledTimes(2);
    expect(fill).toHaveBeenCalledWith({ [kazan.id]: KAZAN_COORDINATES });
  });

  it("should fill every location that gains coordinates in one command", async () => {
    const { load } = createLoader();
    const fill = vi.fn();

    renderHook(() => useLocationCoordinatesFill([moscow, kazan], load, fill));

    await waitFor(() => expect(fill).toHaveBeenCalledTimes(1));
    expect(fill).toHaveBeenCalledWith({
      [moscow.id]: MOSCOW_COORDINATES,
      [kazan.id]: KAZAN_COORDINATES,
    });
  });

  it("should neither load nor look up when every city location has coordinates", () => {
    const { load, getCoordinates } = createLoader();
    const fill = vi.fn();
    const locations = [
      { ...moscow, coordinates: MOSCOW_COORDINATES },
      buildDeviceTimeLocation("Europe/Moscow"),
    ];

    renderHook(() => useLocationCoordinatesFill(locations, load, fill));

    expect(load).not.toHaveBeenCalled();
    expect(getCoordinates).not.toHaveBeenCalled();
    expect(fill).not.toHaveBeenCalled();
  });

  it("should not look up the device time location", async () => {
    const { load, getCoordinates } = createLoader();

    renderHook(() =>
      useLocationCoordinatesFill(
        [buildDeviceTimeLocation("Europe/Moscow")],
        load,
        vi.fn(),
      ),
    );

    expect(load).not.toHaveBeenCalled();
    expect(getCoordinates).not.toHaveBeenCalled();
  });

  it("should dispatch nothing when no lookup finds coordinates", async () => {
    const { load, getCoordinates } = createLoader();
    const fill = vi.fn();

    renderHook(() => useLocationCoordinatesFill([utc], load, fill));

    await waitFor(() => expect(getCoordinates).toHaveBeenCalledTimes(1));
    expect(fill).not.toHaveBeenCalled();
  });

  it("should stay silent when the city data fails to load", async () => {
    const load: LoadCitySearch = vi.fn(async () => {
      throw new Error("offline");
    });
    const fill = vi.fn();

    renderHook(() => useLocationCoordinatesFill([moscow], load, fill));

    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    expect(fill).not.toHaveBeenCalled();
  });

  it("should look up nothing again when the list is presented again", async () => {
    const { load, getCoordinates } = createLoader();
    const fill = vi.fn();
    const locations = [kazan, utc];
    const { rerender } = renderHook(() =>
      useLocationCoordinatesFill(locations, load, fill),
    );
    await waitFor(() => expect(fill).toHaveBeenCalledTimes(1));
    const lookupCount = getCoordinates.mock.calls.length;

    rerender();
    rerender();

    expect(getCoordinates).toHaveBeenCalledTimes(lookupCount);
    expect(fill).toHaveBeenCalledTimes(1);
  });

  it("should not look UTC up a second time after the others gained coordinates", async () => {
    const { load, getCoordinates } = createLoader();
    let locations = [kazan, utc];
    const fill = vi.fn(() => {
      locations = [{ ...kazan, coordinates: KAZAN_COORDINATES }, utc];
    });
    const { rerender } = renderHook(() =>
      useLocationCoordinatesFill(locations, load, fill),
    );
    await waitFor(() => expect(fill).toHaveBeenCalledTimes(1));

    rerender();

    expect(getCoordinates).toHaveBeenCalledTimes(2);
  });
});
