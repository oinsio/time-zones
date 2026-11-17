// Verifies NFR-P1 of apply-data-updates-silently: the notices chunk loads only when a notice is due.
import type { PwaUpdateStatus } from "@/controller";
import { MeetingShareNotice } from "@/controller";
import { getDueNotices, hasShownNotice } from "./hasShownNotice";

const quietInput = {
  updateStatus: { isOfflineReady: false, isUpdateAvailable: false } as Pick<
    PwaUpdateStatus,
    "isOfflineReady" | "isUpdateAvailable"
  >,
  readyRelease: undefined as string | undefined,
  hasStorageWarning: false,
  shareNotice: undefined as MeetingShareNotice | undefined,
};

describe("hasShownNotice", () => {
  it("is false when no notice is due", () => {
    expect(hasShownNotice(quietInput)).toBe(false);
  });

  it.each([
    [
      "an update is available",
      { updateStatus: { isOfflineReady: false, isUpdateAvailable: true } },
    ],
    [
      "the app is offline ready",
      { updateStatus: { isOfflineReady: true, isUpdateAvailable: false } },
    ],
    ["a zone rules release is ready", { readyRelease: "2026g" }],
    ["storage warns", { hasStorageWarning: true }],
    [
      "a share notice is due",
      { shareNotice: Object.values(MeetingShareNotice)[0] },
    ],
  ])("is true when %s", (_, override) => {
    expect(hasShownNotice({ ...quietInput, ...override })).toBe(true);
  });
});

describe("getDueNotices", () => {
  it("prefers the update notice over the offline-ready notice", () => {
    const dueNotices = getDueNotices({
      ...quietInput,
      updateStatus: { isOfflineReady: true, isUpdateAvailable: true },
    });
    expect([
      dueNotices.isUpdateNoticeDue,
      dueNotices.isOfflineReadyNoticeDue,
    ]).toEqual([true, false]);
  });
});
