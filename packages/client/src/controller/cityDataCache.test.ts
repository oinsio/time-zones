// Verifies FR8, NFR-P2 of show-here-entry-for-device-time (D4): one cached load.
import zoneCities from "virtual:zone-cities";
import { createCompositeCitySearch } from "@/adapters";
import type { LoadCitySearch } from "@/ports";
import { loadCitySearchOnce, readLoadedCitySearch } from "./cityDataCache";

const search = createCompositeCitySearch(zoneCities);

describe("cityDataCache", () => {
  it("should call the loader once for two calls during one pending load", async () => {
    const loader: LoadCitySearch = vi.fn(async () => search);

    const first = loadCitySearchOnce(loader);
    const second = loadCitySearchOnce(loader);

    expect(first).toBe(second);
    await first;
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("should read a resolved search back synchronously", async () => {
    const loader: LoadCitySearch = async () => search;
    expect(readLoadedCitySearch(loader)).toBeUndefined();

    await loadCitySearchOnce(loader);

    expect(readLoadedCitySearch(loader)).toBe(search);
  });

  it("should load again after a rejection", async () => {
    const loader: LoadCitySearch = vi
      .fn<LoadCitySearch>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(search);

    await expect(loadCitySearchOnce(loader)).rejects.toThrow("offline");
    await expect(loadCitySearchOnce(loader)).resolves.toBe(search);
    expect(loader).toHaveBeenCalledTimes(2);
  });
});
