// Verifies FR8, FR12 of show-here-entry-for-device-time: exemplar city.
import zoneCities from "virtual:zone-cities";
import { describeCitySearchContract } from "./citySearch.contract";
import { createCompositeCitySearch } from "./createCompositeCitySearch";

describeCitySearchContract("createCompositeCitySearch", {
  createSearch: () => createCompositeCitySearch(zoneCities),
  namedZones: [
    { timeZoneId: "Asia/Almaty", language: "en", cityName: "Almaty" },
    { timeZoneId: "Asia/Almaty", language: "ru", cityName: "Алматы" },
    // The canonical ID of the renamed zone (CLDR 48)
    { timeZoneId: "Europe/Kyiv", language: "en", cityName: "Kyiv" },
  ],
  derivedZone: { timeZoneId: "Mars/Olympus_Mons", cityName: "Olympus Mons" },
});
