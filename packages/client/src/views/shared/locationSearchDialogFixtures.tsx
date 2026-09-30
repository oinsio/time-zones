import { render } from "@testing-library/react";
import { CitySearchStatus } from "@/controller";
import type { PresentedSearchResult } from "@/presenter";
import { LocationSearchDialog } from "./LocationSearchDialog";

export const moscow: PresentedSearchResult = {
  timeZoneId: "Europe/Moscow",
  cityName: "Moscow",
  countryCode: "RU",
  countryName: "Russia",
  isAdded: false,
};
export const kolkata: PresentedSearchResult = {
  timeZoneId: "Asia/Kolkata",
  cityName: "Kolkata",
  countryCode: "IN",
  countryName: "India",
  matchedAbbreviation: "IST",
  isAdded: false,
};
export const berlin: PresentedSearchResult = {
  timeZoneId: "Europe/Berlin",
  cityName: "Berlin",
  countryCode: "DE",
  countryName: "Germany",
  isAdded: false,
};
export const addedTokyo: PresentedSearchResult = {
  timeZoneId: "Asia/Tokyo",
  cityName: "Tokyo",
  countryCode: "JP",
  countryName: "Japan",
  isAdded: true,
};

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
