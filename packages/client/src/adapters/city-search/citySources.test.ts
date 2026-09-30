// Verifies FR2–FR4 of add-locations-via-search: one contract, every source.
import zoneCities from "virtual:zone-cities";
import { createAbbreviationSource } from "./abbreviationSource";
import { describeCitySourceContract } from "./citySource.contract";
import { createZoneCitiesSource } from "./zoneCitiesSource";

const createZoneSource = () => createZoneCitiesSource(zoneCities);

describeCitySourceContract("zone cities", {
  createSource: createZoneSource,
  queries: ["mos", "москва", "kazakhstan", "york"],
});

describeCitySourceContract("abbreviations", {
  createSource: () => createAbbreviationSource(createZoneSource().records),
  queries: ["ist", "est", "msk"],
});
