// Verifies FR9 of add-unix-time-converter-tool: one owner of the city label and the place text.
import i18n from "i18next";
import { DEVICE_TIME_LOCATION_ID, UTC_ZONE_ID } from "@/constants";
import { LocationKind, type Location } from "@/model";
import { presentRowHeader } from "./presentRowHeader";

const translate = i18n.t.bind(i18n);
const context = {
  language: "ru" as const,
  translate,
};
const makeLocation = (overrides: Partial<Location>): Location =>
  ({
    id: "almaty",
    kind: LocationKind.CITY,
    label: "Almaty",
    timeZoneId: "Asia/Almaty",
    countryCode: "KZ",
    ...overrides,
  }) as Location;

describe("presentRowHeader", () => {
  it("should name a city location by its stored label and the country", () => {
    const header = presentRowHeader(makeLocation({}), context);
    expect(header).toMatchObject({ cityLabel: "Almaty", isDeviceTime: false });
    expect(header.placeText).toBe(header.countryName);
    expect(header.countryName).not.toBe("");
  });

  it("should prefer the translated city label of the location", () => {
    const header = presentRowHeader(makeLocation({}), {
      ...context,
      cityLabels: new Map([["almaty", "Алматы"]]),
    });
    expect(header.cityLabel).toBe("Алматы");
  });

  it("should show the Universal Time label for a city in UTC without a country", () => {
    const header = presentRowHeader(
      makeLocation({ timeZoneId: UTC_ZONE_ID, countryCode: "" }),
      context,
    );
    expect(header.placeText).toBe(translate("locations.universalTime"));
  });

  it("should show the device time meta and the exemplar city for the device time location", () => {
    const header = presentRowHeader(
      makeLocation({
        id: DEVICE_TIME_LOCATION_ID,
        kind: LocationKind.DEVICE_TIME,
        timeZoneId: "Asia/Almaty",
      }),
      { ...context, deviceTimeCityLabel: "Almaty" },
    );
    expect(header).toMatchObject({ cityLabel: "Almaty", isDeviceTime: true });
    expect(header.placeText).toBe(translate("locations.deviceTimeMeta"));
  });

  it("should fall back to the zone id for the device time location without a city", () => {
    const header = presentRowHeader(
      makeLocation({
        id: DEVICE_TIME_LOCATION_ID,
        kind: LocationKind.DEVICE_TIME,
        timeZoneId: "Asia/Almaty",
      }),
      context,
    );
    expect(header.cityLabel).toBe("Asia/Almaty");
  });
});
