import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  type MeetingShare,
  type ShareDestination,
  ShareDestinationId,
  ShareOutcome,
} from "@/ports";
import { SharingBehaviour } from "./textSharing.contract";

export type ShareDestinationProbe = {
  destination: ShareDestination;
  sharedTexts: () => readonly string[];
  copiedTexts: () => readonly string[];
};

const SAMPLE_SHARE: MeetingShare = {
  invitation: {
    range: {
      start: Temporal.Instant.from("2026-03-08T04:00:00Z"),
      end: Temporal.Instant.from("2026-03-08T06:00:00Z"),
    },
    locations: [],
  },
  text: "Meeting on Sunday, March 8, 2026, 2 h\nAlmaty: 09:00–11:00",
};

/**
 * Contract every text `ShareDestination` must satisfy.
 * Verifies FR9, FR11 of add-meeting-share-dialog.
 */
export const describeShareDestinationContract = (
  adapterName: string,
  createProbe: (behaviour: SharingBehaviour) => ShareDestinationProbe,
) => {
  describe(`ShareDestination contract: ${adapterName}`, () => {
    it("should be the text destination and always available", () => {
      const { destination } = createProbe(SharingBehaviour.NEITHER);

      expect(destination.id).toBe(ShareDestinationId.TEXT);
      expect(destination.isAvailable()).toBe(true);
    });

    it("should pass the text unchanged to the text sharing", async () => {
      const probe = createProbe(SharingBehaviour.SHARES);

      const outcome = await probe.destination.share(SAMPLE_SHARE);

      expect(outcome).toBe(ShareOutcome.SHARED);
      expect(probe.sharedTexts()).toEqual([SAMPLE_SHARE.text]);
    });

    it.each([
      [SharingBehaviour.SHEET_CLOSED, ShareOutcome.CANCELLED],
      [SharingBehaviour.NO_SHARE, ShareOutcome.COPIED],
      [SharingBehaviour.SHARE_FAILS, ShareOutcome.COPIED],
      [SharingBehaviour.NEITHER, ShareOutcome.FAILED],
    ])(
      "should return the outcome of the text sharing when %s",
      async (behaviour, expected) => {
        const probe = createProbe(behaviour);

        expect(await probe.destination.share(SAMPLE_SHARE)).toBe(expected);
      },
    );
  });
};
