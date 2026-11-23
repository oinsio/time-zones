import { CopyOutcome, type TextCopying } from "@/ports";

export enum CopyingBehaviour {
  COPIES = "COPIES",
  REFUSES = "REFUSES",
  NO_CLIPBOARD = "NO_CLIPBOARD",
}

export type TextCopyingProbe = {
  adapter: TextCopying;
  copiedTexts: () => readonly string[];
};

const SAMPLE_TEXT = "1795432987";

/**
 * Contract every `TextCopying` adapter must satisfy.
 * Verifies FR12 of add-unix-time-converter-tool.
 */
export const describeTextCopyingContract = (
  adapterName: string,
  createProbe: (behaviour: CopyingBehaviour) => TextCopyingProbe,
) => {
  describe(`TextCopying contract: ${adapterName}`, () => {
    it("should copy the text and report COPIED", async () => {
      const probe = createProbe(CopyingBehaviour.COPIES);
      expect(await probe.adapter.copyText(SAMPLE_TEXT)).toBe(
        CopyOutcome.COPIED,
      );
      expect(probe.copiedTexts()).toEqual([SAMPLE_TEXT]);
    });

    it("should report FAILED when the clipboard refuses", async () => {
      const probe = createProbe(CopyingBehaviour.REFUSES);
      expect(await probe.adapter.copyText(SAMPLE_TEXT)).toBe(
        CopyOutcome.FAILED,
      );
      expect(probe.copiedTexts()).toEqual([]);
    });

    it("should report FAILED when there is no clipboard", async () => {
      const probe = createProbe(CopyingBehaviour.NO_CLIPBOARD);
      expect(await probe.adapter.copyText(SAMPLE_TEXT)).toBe(
        CopyOutcome.FAILED,
      );
    });
  });
};
