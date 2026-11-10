// Verifies FR15 of add-grid-meeting-range-and-share: one contract, every adapter.
import { SHARE_ABORT_ERROR_NAME } from "@/constants";
import { ShareOutcome } from "@/ports";
import {
  browserTextSharing,
  createBrowserTextSharing,
  type SharingNavigator,
} from "./browserTextSharing";
import { createInMemoryTextSharing } from "./inMemoryTextSharing";
import {
  describeTextSharingContract,
  SharingBehaviour,
} from "./textSharing.contract";

describeTextSharingContract("browser", (behaviour) => {
  const sharedTexts: string[] = [];
  const copiedTexts: string[] = [];
  const navigatorLike: SharingNavigator = {};
  const hasShare =
    behaviour !== SharingBehaviour.NO_SHARE &&
    behaviour !== SharingBehaviour.NEITHER;
  if (hasShare) {
    navigatorLike.share = async ({ text }) => {
      if (behaviour === SharingBehaviour.SHEET_CLOSED) {
        throw new DOMException("closed", SHARE_ABORT_ERROR_NAME);
      }
      if (behaviour === SharingBehaviour.SHARE_FAILS) {
        throw new DOMException("denied", "NotAllowedError");
      }
      sharedTexts.push(text);
    };
  }
  if (behaviour !== SharingBehaviour.NEITHER) {
    navigatorLike.clipboard = {
      writeText: async (text) => {
        copiedTexts.push(text);
      },
    };
  }
  return {
    adapter: createBrowserTextSharing(navigatorLike),
    sharedTexts: () => sharedTexts,
    copiedTexts: () => copiedTexts,
  };
});

describeTextSharingContract("in-memory", (behaviour) => {
  const adapter = createInMemoryTextSharing({
    canShare:
      behaviour !== SharingBehaviour.NO_SHARE &&
      behaviour !== SharingBehaviour.NEITHER,
    isCancelled: behaviour === SharingBehaviour.SHEET_CLOSED,
    isShareFailing: behaviour === SharingBehaviour.SHARE_FAILS,
    canCopy: behaviour !== SharingBehaviour.NEITHER,
  });
  return {
    adapter,
    sharedTexts: () => adapter.sharedTexts,
    copiedTexts: () => adapter.copiedTexts,
  };
});

describe("browser text sharing details", () => {
  it("should fail when the clipboard rejects", async () => {
    const sharing = createBrowserTextSharing({
      clipboard: {
        writeText: async () => {
          throw new DOMException("denied", "NotAllowedError");
        },
      },
    });

    expect(await sharing.shareText("text")).toBe(ShareOutcome.FAILED);
  });

  it("should copy when the share rejects with a non-error value", async () => {
    const copied: string[] = [];
    const sharing = createBrowserTextSharing({
      share: () => Promise.reject("nope"),
      clipboard: { writeText: async (text) => void copied.push(text) },
    });

    expect(await sharing.shareText("text")).toBe(ShareOutcome.COPIED);
    expect(copied).toEqual(["text"]);
  });

  it("should read the running browser's navigator", async () => {
    vi.stubGlobal("navigator", {});
    expect(await browserTextSharing.shareText("text")).toBe(
      ShareOutcome.FAILED,
    );
    vi.unstubAllGlobals();
  });
});
