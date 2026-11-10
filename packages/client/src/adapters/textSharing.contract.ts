import { ShareOutcome, type TextSharing } from "@/ports";

export enum SharingBehaviour {
  SHARES = "SHARES",
  SHEET_CLOSED = "SHEET_CLOSED",
  NO_SHARE = "NO_SHARE",
  SHARE_FAILS = "SHARE_FAILS",
  NEITHER = "NEITHER",
}

export type TextSharingProbe = {
  adapter: TextSharing;
  sharedTexts: () => readonly string[];
  copiedTexts: () => readonly string[];
};

const SAMPLE_TEXT =
  "Meeting on Sunday, March 8, 2026, 2 h\nAlmaty: 09:00–11:00";

/**
 * Contract every `TextSharing` adapter must satisfy.
 * Verifies FR15 of add-grid-meeting-range-and-share.
 */
export const describeTextSharingContract = (
  adapterName: string,
  createProbe: (behaviour: SharingBehaviour) => TextSharingProbe,
) => {
  describe(`TextSharing contract: ${adapterName}`, () => {
    it("should hand the text to the system share", async () => {
      const probe = createProbe(SharingBehaviour.SHARES);

      const outcome = await probe.adapter.shareText(SAMPLE_TEXT);

      expect(outcome).toBe(ShareOutcome.SHARED);
      expect(probe.sharedTexts()).toEqual([SAMPLE_TEXT]);
      expect(probe.copiedTexts()).toEqual([]);
    });

    it("should report a closed sheet as cancelled and copy nothing", async () => {
      const probe = createProbe(SharingBehaviour.SHEET_CLOSED);

      const outcome = await probe.adapter.shareText(SAMPLE_TEXT);

      expect(outcome).toBe(ShareOutcome.CANCELLED);
      expect(probe.copiedTexts()).toEqual([]);
    });

    it.each([SharingBehaviour.NO_SHARE, SharingBehaviour.SHARE_FAILS])(
      "should copy the text when %s",
      async (behaviour) => {
        const probe = createProbe(behaviour);

        const outcome = await probe.adapter.shareText(SAMPLE_TEXT);

        expect(outcome).toBe(ShareOutcome.COPIED);
        expect(probe.copiedTexts()).toEqual([SAMPLE_TEXT]);
      },
    );

    it("should fail when there is neither share nor clipboard", async () => {
      const probe = createProbe(SharingBehaviour.NEITHER);

      expect(await probe.adapter.shareText(SAMPLE_TEXT)).toBe(
        ShareOutcome.FAILED,
      );
    });
  });
};
