// Verifies FR12, NFR-A3, UX5 of add-unix-time-converter-tool.
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { COPY_CONFIRMATION_MS } from "@/constants";
import { CopyOutcome } from "@/ports";
import type { PresentedNotation } from "@/presenter/unixTime";
import { MomentNotations } from "./MomentNotations";

const notations = [
  { id: "SECONDS", label: "Секунды", text: "1795432987" },
  { id: "MILLISECONDS", label: "Миллисекунды", text: "1795432987123" },
].map((notation) => ({
  ...notation,
  copyLabel: `Копировать: ${notation.label}`,
})) as PresentedNotation[];

const renderNotations = (outcome = CopyOutcome.COPIED) => {
  const onCopy = vi.fn(async () => outcome);
  render(<MomentNotations notations={notations} onCopy={onCopy} />);
  return { onCopy };
};
const copyButton = (label: string) =>
  screen.getByRole("button", { name: `Копировать: ${label}` });

describe("MomentNotations", () => {
  it("should show every notation with its text", () => {
    renderNotations();
    expect(screen.getByText("1795432987")).toBeInTheDocument();
    expect(screen.getByText("1795432987123")).toBeInTheDocument();
  });

  it("should copy the notation whose action was chosen", async () => {
    const { onCopy } = renderNotations();
    await userEvent.click(copyButton("Миллисекунды"));
    expect(onCopy).toHaveBeenCalledExactlyOnceWith("MILLISECONDS");
  });

  it("should announce a copy politely", async () => {
    renderNotations();
    await userEvent.click(copyButton("Секунды"));
    expect(await screen.findByText("Скопировано")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("should show a check icon in place of the copy icon after a copy", async () => {
    renderNotations();
    const button = copyButton("Секунды");
    expect(button.querySelector(".lucide-copy")).not.toBeNull();
    await userEvent.click(button);
    expect(button.querySelector(".lucide-check")).not.toBeNull();
  });

  it("should show the failure text beside the action after a refused copy", async () => {
    renderNotations(CopyOutcome.FAILED);
    await userEvent.click(copyButton("Секунды"));
    expect(await screen.findByText("Не удалось скопировать")).toBeVisible();
    expect(screen.queryByText("Скопировано")).toBeNull();
  });

  it("should take the confirmation back after the confirmation time", async () => {
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");
    renderNotations();
    await userEvent.click(copyButton("Секунды"));
    const confirmation = setTimeoutSpy.mock.calls.find(
      ([, delay]) => delay === COPY_CONFIRMATION_MS,
    );
    expect(confirmation).toBeDefined();
    act(() => (confirmation?.[0] as () => void)());
    expect(copyButton("Секунды").querySelector(".lucide-copy")).not.toBeNull();
    expect(screen.queryByText("Скопировано")).toBeNull();
    setTimeoutSpy.mockRestore();
  });
});
