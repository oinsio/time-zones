// FR11 of add-settings-page-and-device-time-location: both labels of the Device time option.
import type i18next from "i18next";
import { describe, expect, it } from "vitest";
import { presentDeviceTimeOptionLabels } from "./presentDeviceTimeOptionLabels";

describe("presentDeviceTimeOptionLabels", () => {
  it("should return the English and the Russian label", () => {
    const labels = presentDeviceTimeOptionLabels({
      english: ((key: string) => `en:${key}`) as typeof i18next.t,
      russian: ((key: string) => `ru:${key}`) as typeof i18next.t,
    });
    expect(labels).toEqual([
      "en:search.deviceTimeOption",
      "ru:search.deviceTimeOption",
    ]);
  });
});
