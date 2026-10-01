import { vi } from "vitest";
import { STORAGE_KEYS } from "@/constants";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";

const LABEL_SEPARATOR = ", ";

export const idOf = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] }).id;

/** Feature steps name several cities in one string: "Moscow, Almaty". */
export const splitLabels = (labels: string) => labels.split(LABEL_SEPARATOR);

/** Spies on `setItem`; optionally makes writes of the locations document throw. */
export const spyOnStorageWrites = (throwsForLocations: boolean) => {
  const originalSetItem = localStorage.setItem.bind(localStorage);
  return vi.spyOn(localStorage, "setItem").mockImplementation((key, value) => {
    if (throwsForLocations && key === STORAGE_KEYS.LOCATIONS) {
      throw new Error("storage is full");
    }
    originalSetItem(key, value);
  });
};
