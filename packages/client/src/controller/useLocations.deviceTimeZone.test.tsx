// Verifies FR1, FR2, FR3, FR4 of mark-device-time-zone-in-location-list (D3).
import { act } from "@testing-library/react";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { type Clock, fakeClock } from "@/lib/temporal";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { renderLocations } from "@/test/renderLocations";

const INSTANT = "2026-07-15T12:00:00Z";
const BADGE_RU = "здесь";

const cityOf = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] });

const renderWith = (cities: string[], clock: Clock) =>
  renderLocations(
    createInMemoryLocationRepository({
      initialDocument: {
        status: LocationsLoadStatus.LOADED,
        locations: cities.map(cityOf),
        homeLocationId: null,
      },
    }),
    undefined,
    clock,
  );

const MOSCOW_INPUT = { ...KNOWN_CITIES.Moscow, label: "Moscow" };

const badgesOf = (rows: { mark?: { caption: string } }[]) =>
  rows.map((row) => row.mark?.caption ?? "");

describe("useLocations device time zone", () => {
  it.each([
    ["match", "Asia/Almaty", ["Almaty", "Moscow"], [BADGE_RU, ""]],
    ["no match", "Asia/Tokyo", ["Almaty", "Moscow"], ["", ""]],
    [
      "multiple matches",
      "Europe/Moscow",
      ["Moscow", "Saint Petersburg"],
      [BADGE_RU, BADGE_RU],
    ],
  ])("should label rows on %s", (_case, zone, cities, expected) => {
    const { result } = renderWith(cities, fakeClock(INSTANT, zone));
    expect(badgesOf(result.current.rows)).toEqual(expected);
  });

  it("should read the device zone once across list changes", () => {
    const timeZoneId = vi.fn(() => "Asia/Almaty");
    const countingClock: Clock = { ...fakeClock(INSTANT), timeZoneId };
    const { result } = renderWith(["Almaty"], countingClock);
    act(() => result.current.addLocation(MOSCOW_INPUT));
    act(() => result.current.removeLocation(cityOf("Moscow").id));
    act(() => result.current.resetLocations());
    expect(timeZoneId).toHaveBeenCalledTimes(1);
  });

  it("should keep the badge after an add", () => {
    const { result } = renderWith(
      ["Almaty"],
      fakeClock(INSTANT, "Asia/Almaty"),
    );
    act(() => result.current.addLocation(MOSCOW_INPUT));
    expect(badgesOf(result.current.rows)).toEqual([BADGE_RU, ""]);
  });

  it("should not store the device zone", () => {
    const backend = createInMemoryLocationBackend();
    const repository = createInMemoryLocationRepository({ backend });
    const { result } = renderLocations(
      repository,
      undefined,
      fakeClock(INSTANT, "Asia/Almaty"),
    );
    act(() =>
      result.current.addLocation({ ...KNOWN_CITIES.Almaty, label: "Almaty" }),
    );
    expect(Object.keys(backend.document).sort()).toEqual([
      "homeLocationId",
      "locations",
      "status",
    ]);
  });
});
