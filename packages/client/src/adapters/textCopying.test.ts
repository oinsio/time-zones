// Verifies FR12 of add-unix-time-converter-tool: one contract, every adapter.
import { CopyOutcome } from "@/ports";
import {
  browserTextCopying,
  createBrowserTextCopying,
} from "./browserTextCopying";
import { createInMemoryTextCopying } from "./inMemoryTextCopying";
import {
  CopyingBehaviour,
  describeTextCopyingContract,
} from "./textCopying.contract";

describeTextCopyingContract("browser", (behaviour) => {
  const copiedTexts: string[] = [];
  const clipboard =
    behaviour === CopyingBehaviour.NO_CLIPBOARD
      ? undefined
      : {
          writeText: async (text: string) => {
            if (behaviour === CopyingBehaviour.REFUSES) {
              throw new DOMException("denied", "NotAllowedError");
            }
            copiedTexts.push(text);
          },
        };
  return {
    adapter: createBrowserTextCopying({ clipboard }),
    copiedTexts: () => copiedTexts,
  };
});

describeTextCopyingContract("in memory", (behaviour) => {
  const adapter = createInMemoryTextCopying({
    canCopy: behaviour === CopyingBehaviour.COPIES,
  });
  return { adapter, copiedTexts: () => adapter.copiedTexts };
});

describe("browserTextCopying", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("should copy through the clipboard of the running browser", async () => {
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    expect(await browserTextCopying.copyText("1795432987")).toBe(
      CopyOutcome.COPIED,
    );
    expect(writeText).toHaveBeenCalledExactlyOnceWith("1795432987");
  });
});
