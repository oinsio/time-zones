// Shared state and helpers of the zone rules notice unit steps (apply-data-updates-silently FR4, FR8, FR9, FR11).
import { render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";
import {
  createInMemoryAppRevisionSource,
  createInMemoryStoredReleaseRepository,
  createInMemoryZoneRulesVersionSource,
} from "@/adapters";
import { AppShell } from "@/app";
import { APP_REVISION } from "@/constants";
import { buildReleaseChangingZones } from "@/test/zoneRules/committedReleaseChanging";
import {
  LISBON_LOCATION,
  seedListedLocations,
} from "@/test/zoneRules/seedListedLocations";
import { fakeServiceWorker } from "./zoneRulesNoticeServiceWorker";

export const reloadPage = vi.fn();
export const SILENT_RELEASE = "2999a";

const world = { publishedAppRevision: APP_REVISION };

export const resetZoneRulesNoticeWorld = () => {
  localStorage.clear();
  reloadPage.mockClear();
  fakeServiceWorker.updateServiceWorker.mockClear();
  fakeServiceWorker.isUpdateAvailable = false;
  world.publishedAppRevision = APP_REVISION;
};

export const getNoticesRegion = () =>
  screen
    .getAllByRole("status")
    .find(
      (region) => region.getAttribute("aria-live") === "polite",
    ) as HTMLElement;

export const openApp = async (release: string, changedZoneIds: string[]) => {
  render(
    <AppShell
      appRevisionSource={createInMemoryAppRevisionSource(
        world.publishedAppRevision,
      )}
      zoneRulesVersionSource={createInMemoryZoneRulesVersionSource({
        version: { release },
        releases: {
          [release]: buildReleaseChangingZones(release, changedZoneIds),
        },
      })}
      storedReleases={createInMemoryStoredReleaseRepository()}
      reloadPage={reloadPage}
    />,
  );
};

export const openAppAndAwaitNotice = async (release: string) => {
  await openApp(release, [LISBON_LOCATION.timeZoneId]);
  await screen.findByText(new RegExp(release));
};

export const chooseReloadOfZoneRulesNotice = async (
  _ctx: unknown,
  release: string,
) => {
  await openAppAndAwaitNotice(release);
  const reloadButtons = screen.getAllByRole("button", { name: "Reload" });
  await userEvent.click(reloadButtons[reloadButtons.length - 1]);
};

export const givenListHoldsLisbon = () =>
  seedListedLocations([LISBON_LOCATION]);

export const givenListHoldsLisbonAndWaitingBuild =
  (revision: () => string) => () => {
    seedListedLocations([LISBON_LOCATION]);
    fakeServiceWorker.isUpdateAvailable = true;
    world.publishedAppRevision = revision();
  };

export const whenCheckFinds = async (
  _ctx: unknown,
  release: string,
  zoneId: string,
) => {
  await openApp(release, [zoneId]);
};

export const expectNoticeText = async (_ctx: unknown, text: string) => {
  await screen.findByText(text);
  expect(getNoticesRegion()).toHaveTextContent(text);
};

export const expectWaitingUpdateApplied = () => {
  expect(fakeServiceWorker.updateServiceWorker).toHaveBeenCalledWith(true);
  expect(reloadPage).not.toHaveBeenCalled();
};
