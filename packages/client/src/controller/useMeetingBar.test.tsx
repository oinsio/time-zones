// Verifies FR13 of add-grid-meeting-range-and-share.
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider } from "@/controller";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { useMeetingBar } from "./useMeetingBar";
import { useMeetingRange } from "./useMeetingRange";

const almaty = buildLocation({ label: "Almaty", ...KNOWN_CITIES.Almaty });

function setup(showsMeetingRange: boolean) {
  const repository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations: [almaty],
      homeLocationId: almaty.id,
    },
  });
  return renderHook(
    () => ({
      bar: useMeetingBar(showsMeetingRange),
      range: useMeetingRange(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocationsProvider
          repository={repository}
          writeScheduler={createManualWriteScheduler()}
          clock={createSwitchableClock("2026-03-08T07:30:00Z", "Asia/Almaty")}
          tickScheduler={createManualTickScheduler()}
        >
          {children}
        </LocationsProvider>
      ),
    },
  );
}

describe("useMeetingBar", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should give no bar without a meeting range", () => {
    expect(setup(true).result.current.bar).toBeUndefined();
  });

  it("should give the bar with a meeting range", () => {
    const { result } = setup(true);

    act(() => result.current.range.selectCells(9, 10));

    expect(result.current.bar?.title).toBe("Meeting · 2 h");
  });

  it("should give no bar when the view does not show the meeting range", () => {
    const { result } = setup(false);

    act(() => result.current.range.selectCells(9, 10));

    expect(result.current.bar).toBeUndefined();
  });
});
