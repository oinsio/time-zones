// Verifies FR9, FR11 of add-meeting-share-dialog.
import { describe, expect, it } from "vitest";
import { SHARE_ABORT_ERROR_NAME } from "@/constants";
import { Temporal } from "@/lib/temporal";
import { ShareDestinationId, ShareOutcome } from "@/ports";
import {
  createBrowserTextSharing,
  type SharingNavigator,
} from "./browserTextSharing";
import { createInMemoryTextSharing } from "./inMemoryTextSharing";
import { describeShareDestinationContract } from "./shareDestination.contract";
import { createShareDestinations } from "./shareDestinations";
import { createTextShareDestination } from "./textShareDestination";
import { SharingBehaviour } from "./textSharing.contract";

describeShareDestinationContract("text over in-memory sharing", (behaviour) => {
  const sharing = createInMemoryTextSharing({
    canShare:
      behaviour !== SharingBehaviour.NO_SHARE &&
      behaviour !== SharingBehaviour.NEITHER,
    isCancelled: behaviour === SharingBehaviour.SHEET_CLOSED,
    isShareFailing: behaviour === SharingBehaviour.SHARE_FAILS,
    canCopy: behaviour !== SharingBehaviour.NEITHER,
  });
  return {
    destination: createTextShareDestination(sharing),
    sharedTexts: () => sharing.sharedTexts,
    copiedTexts: () => sharing.copiedTexts,
  };
});

describeShareDestinationContract("text over browser sharing", (behaviour) => {
  const sharedTexts: string[] = [];
  const copiedTexts: string[] = [];
  const navigatorLike: SharingNavigator = {};
  if (
    behaviour !== SharingBehaviour.NO_SHARE &&
    behaviour !== SharingBehaviour.NEITHER
  ) {
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
    destination: createTextShareDestination(
      createBrowserTextSharing(navigatorLike),
    ),
    sharedTexts: () => sharedTexts,
    copiedTexts: () => copiedTexts,
  };
});

describe("createShareDestinations", () => {
  it("should list the text destination first and share through the given sharing", async () => {
    const sharing = createInMemoryTextSharing({
      canShare: true,
      canCopy: true,
    });

    const [first] = createShareDestinations(sharing);
    const outcome = await first.share({
      invitation: {
        range: {
          start: Temporal.Instant.from("2026-03-08T04:00:00Z"),
          end: Temporal.Instant.from("2026-03-08T06:00:00Z"),
        },
        locations: [],
      },
      text: "text",
    });

    expect(first.id).toBe(ShareDestinationId.TEXT);
    expect(outcome).toBe(ShareOutcome.SHARED);
    expect(sharing.sharedTexts).toEqual(["text"]);
  });

  it("should offer exactly one destination", () => {
    expect(createShareDestinations()).toHaveLength(1);
  });
});
