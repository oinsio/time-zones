import { createLocalStorageLocationRepository } from "@/adapters";
import { STORAGE_KEYS } from "@/constants";
import { buildLocation } from "@/test/factories/buildLocation";

export const moscow = buildLocation();
export const useBrowserStorage = () => localStorage;

export const storeDocument = (document: unknown) =>
  localStorage.setItem(
    STORAGE_KEYS.LOCATIONS,
    typeof document === "string" ? document : JSON.stringify(document),
  );

export const createRepository = () =>
  createLocalStorageLocationRepository({
    getStorage: useBrowserStorage,
    createChannel: () => undefined,
  });
