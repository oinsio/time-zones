// Implements FR8 of add-settings-page-and-device-time-location (D4): the city data loader of the device time features.
import zoneCities from "virtual:zone-cities";
import { createCompositeCitySearch } from "@/adapters";
import type { LoadCitySearch } from "@/ports";

export enum DataMode {
  LOADED = "LOADED",
  HELD = "HELD",
  FAILING = "FAILING",
}

/** Counts the requests and answers them as the scenario says. */
export const createDataLoaderState = () => {
  let mode = DataMode.LOADED;
  let requestCount = 0;
  let releaseData: () => void = () => undefined;

  return {
    setMode: (newMode: DataMode) => {
      mode = newMode;
    },
    reset: () => {
      mode = DataMode.LOADED;
      requestCount = 0;
    },
    getRequestCount: () => requestCount,
    release: () => releaseData(),
    /** A new loader per opened app: the city data cache is keyed by loader. */
    createLoader: (): LoadCitySearch => () => {
      requestCount += 1;
      if (mode === DataMode.FAILING)
        return Promise.reject(new Error("offline"));
      const search = createCompositeCitySearch(zoneCities);
      if (mode === DataMode.LOADED) return Promise.resolve(search);
      return new Promise((resolve) => {
        releaseData = () => resolve(search);
      });
    },
  };
};
