// Verifies FR7, NFR-A2 of setup-app-shell-and-pages-deploy: non-blocking update
// notice with reload and dismiss, operable from the keyboard.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { UpdateNotice } from "./UpdateNotice";

const renderUpdateNotice = () => {
  const onReload = vi.fn();
  const onDismiss = vi.fn();
  const renderResult = render(
    <UpdateNotice onReload={onReload} onDismiss={onDismiss} />,
  );
  return { onReload, onDismiss, ...renderResult };
};

describe("UpdateNotice", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should tell the user that a new version is available", () => {
    renderUpdateNotice();
    expect(screen.getByText("A new version is available.")).toBeInTheDocument();
  });

  it("should call onReload when the reload action is used", async () => {
    const { onReload } = renderUpdateNotice();
    await userEvent.click(screen.getByRole("button", { name: "Reload" }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("should not reload when the dismiss control is used", async () => {
    const { onReload } = renderUpdateNotice();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onReload).not.toHaveBeenCalled();
  });

  it("should call onDismiss when the dismiss control is used", async () => {
    const { onDismiss } = renderUpdateNotice();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should reach reload and then dismiss with Tab", async () => {
    renderUpdateNotice();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Reload" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Dismiss" })).toHaveFocus();
  });

  it("should reload when Enter is pressed on the focused reload action", async () => {
    const { onReload } = renderUpdateNotice();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("should call onDismiss when Escape is pressed", async () => {
    const { onDismiss } = renderUpdateNotice();
    await userEvent.keyboard("{Escape}");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should ignore keys other than Escape", async () => {
    const { onDismiss } = renderUpdateNotice();
    await userEvent.keyboard("{Enter}");
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("should stop listening for Escape once removed", async () => {
    const { onDismiss, unmount } = renderUpdateNotice();
    unmount();
    await userEvent.keyboard("{Escape}");
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("should not take focus when shown", () => {
    renderUpdateNotice();
    expect(document.activeElement).toBe(document.body);
  });
});
