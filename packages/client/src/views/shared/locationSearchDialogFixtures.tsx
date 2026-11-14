import { render } from "@testing-library/react";
import { CitySearchStatus } from "@/controller";
import type { PresentedSearchResult } from "@/presenter";
import { LocationSearchDialog } from "./LocationSearchDialog";

export const moscow: PresentedSearchResult = {
  id: "Europe/Moscow",
  timeZoneId: "Europe/Moscow",
  cityName: "Moscow",
  countryCode: "RU",
  countryName: "Russia",
  isAdded: false,
};
export const kolkata: PresentedSearchResult = {
  id: "Asia/Kolkata",
  timeZoneId: "Asia/Kolkata",
  cityName: "Kolkata",
  countryCode: "IN",
  countryName: "India",
  abbreviationPair: [{ text: "IST", isMatched: true }],
  isAdded: false,
};
export const newYork: PresentedSearchResult = {
  id: "America/New_York",
  timeZoneId: "America/New_York",
  cityName: "New York",
  countryCode: "US",
  countryName: "United States",
  abbreviationPair: [
    { text: "EST", isMatched: false },
    { text: "EDT", isMatched: true },
  ],
  isAdded: false,
};
export const berlin: PresentedSearchResult = {
  id: "Europe/Berlin",
  timeZoneId: "Europe/Berlin",
  cityName: "Berlin",
  countryCode: "DE",
  countryName: "Germany",
  isAdded: false,
};
export const addedTokyo: PresentedSearchResult = {
  id: "Asia/Tokyo",
  timeZoneId: "Asia/Tokyo",
  cityName: "Tokyo",
  countryCode: "JP",
  countryName: "Japan",
  isAdded: true,
};

/** Results with regions: three namesakes of one name (FR7 of add-geonames-city-source). */
const springfield = (
  id: string,
  timeZoneId: string,
  regionName: string,
): PresentedSearchResult => ({
  id,
  timeZoneId,
  cityName: "Springfield",
  countryCode: "US",
  countryName: "United States",
  regionName,
  isAdded: false,
});
export const springfieldIllinois = springfield(
  "4250542",
  "America/Chicago",
  "Illinois",
);
export const springfieldMissouri = springfield(
  "4409896",
  "America/Chicago",
  "Missouri",
);
export const springfieldMassachusetts = springfield(
  "4951788",
  "America/New_York",
  "Massachusetts",
);
export const resultsWithRegions = [
  springfieldIllinois,
  springfieldMissouri,
  springfieldMassachusetts,
];

type Overrides = Partial<Parameters<typeof LocationSearchDialog>[0]>;

const callbacks = () => ({
  onQueryChange: vi.fn(),
  onChoose: vi.fn(),
  onRetry: vi.fn(),
  onClose: vi.fn(),
});

export const renderDialog = (overrides: Overrides = {}) => {
  const handlers = callbacks();
  render(
    <LocationSearchDialog
      isOpen
      status={CitySearchStatus.READY}
      presentedResults={[moscow, kolkata]}
      query=""
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
};
