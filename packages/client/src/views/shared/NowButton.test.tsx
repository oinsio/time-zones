// Verifies FR14 of add-unix-time-converter-tool.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NowButton } from "./NowButton";

describe("NowButton", () => {
  it("should be disabled while the moment is live", () => {
    render(<NowButton isActive={false} label="Сейчас" onReturnToNow={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Сейчас" })).toBeDisabled();
  });

  it("should call back when active", async () => {
    const onReturnToNow = vi.fn();
    render(<NowButton isActive label="Сейчас" onReturnToNow={onReturnToNow} />);
    await userEvent.click(screen.getByRole("button", { name: "Сейчас" }));
    expect(onReturnToNow).toHaveBeenCalledOnce();
  });
});
