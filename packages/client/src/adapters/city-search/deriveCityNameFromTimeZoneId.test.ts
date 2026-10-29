// @show-here-entry-for-device-time @FR8: the name derived from a zone ID.
import { describe, expect, it } from "vitest";
import { deriveCityNameFromTimeZoneId } from "./deriveCityNameFromTimeZoneId";

describe("deriveCityNameFromTimeZoneId", () => {
  it.each([
    ["Asia/Almaty", "Almaty"],
    ["America/New_York", "New York"],
    ["America/Argentina/Buenos_Aires", "Buenos Aires"],
    ["UTC", "UTC"],
  ])("should name %s as %s", (timeZoneId, expectedName) => {
    expect(deriveCityNameFromTimeZoneId(timeZoneId)).toBe(expectedName);
  });
});
