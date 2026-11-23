// Verifies FR5, NFR-A2 of add-unix-time-converter-tool.
import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppPage } from "./appPage";
import { SETTINGS_OPENER_KEY, useAppPage } from "./useAppPage";

const TOOL_ID = "toolA";

describe("useAppPage", () => {
  it("should start on the main page", () => {
    const { result } = renderHook(() => useAppPage([TOOL_ID]));
    expect(result.current.page).toBe(AppPage.MAIN);
  });

  it("should open a tool page and leave it with leave", () => {
    const { result } = renderHook(() => useAppPage([TOOL_ID]));
    act(() => result.current.openTool(TOOL_ID));
    expect(result.current.page).toBe(AppPage.TOOL);
    expect(result.current.toolId).toBe(TOOL_ID);
    act(() => result.current.leave());
    expect(result.current.page).toBe(AppPage.MAIN);
  });

  it("should open the settings page", () => {
    const { result } = renderHook(() => useAppPage([]));
    act(() => result.current.openSettings());
    expect(result.current.page).toBe(AppPage.SETTINGS);
  });

  it("should leave a page with Esc", async () => {
    const { result } = renderHook(() => useAppPage([TOOL_ID]));
    act(() => result.current.openTool(TOOL_ID));
    await userEvent.keyboard("{Escape}");
    expect(result.current.page).toBe(AppPage.MAIN);
  });

  it("should ignore other keys", async () => {
    const { result } = renderHook(() => useAppPage([TOOL_ID]));
    act(() => result.current.openTool(TOOL_ID));
    await userEvent.keyboard("a");
    expect(result.current.page).toBe(AppPage.TOOL);
  });

  it("should return to the main page when the tool is no longer enabled", () => {
    const { result, rerender } = renderHook(
      ({ enabledToolIds }) => useAppPage(enabledToolIds),
      { initialProps: { enabledToolIds: [TOOL_ID] } },
    );
    act(() => result.current.openTool(TOOL_ID));
    rerender({ enabledToolIds: [] });
    expect(result.current.page).toBe(AppPage.MAIN);
  });

  it("should not open a tool page for an id that is not enabled", () => {
    const { result } = renderHook(() => useAppPage([]));
    act(() => result.current.openTool(TOOL_ID));
    expect(result.current.page).toBe(AppPage.MAIN);
  });

  describe("returned focus", () => {
    const Harness = () => {
      const appPage = useAppPage([TOOL_ID]);
      return (
        <>
          <p>{appPage.page}</p>
          {appPage.page === AppPage.MAIN && (
            <>
              <button
                type="button"
                ref={appPage.getOpenerRef(TOOL_ID)}
                onClick={() => appPage.openTool(TOOL_ID)}
              >
                tool
              </button>
              <button
                type="button"
                ref={appPage.getOpenerRef(SETTINGS_OPENER_KEY)}
                onClick={appPage.openSettings}
              >
                settings
              </button>
            </>
          )}
          {appPage.page !== AppPage.MAIN && (
            <button type="button" onClick={appPage.leave}>
              back
            </button>
          )}
        </>
      );
    };

    it.each([
      ["tool", "tool"],
      ["settings", "settings"],
    ])("should focus the %s button after leaving its page", async (name) => {
      render(<Harness />);
      await userEvent.click(screen.getByRole("button", { name }));
      await userEvent.click(screen.getByRole("button", { name: "back" }));
      expect(screen.getByRole("button", { name })).toHaveFocus();
    });
  });
});
