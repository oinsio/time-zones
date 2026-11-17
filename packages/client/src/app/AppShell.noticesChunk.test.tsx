// Verifies NFR-P1 of apply-data-updates-silently: a start with no notice due never loads the notices chunk.
import { useRegisterSW } from "virtual:pwa-register/react";
import { render, screen } from "@testing-library/react";
import { AppShell } from "./AppShell";

const { noticesChunkLoads } = vi.hoisted(() => ({
  noticesChunkLoads: vi.fn(),
}));

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));
vi.mock("./AppShellNotices", () => {
  noticesChunkLoads();
  return { AppShellNotices: () => null };
});

describe("AppShell notices chunk", () => {
  it("should not load the notices chunk when no notice is due", async () => {
    vi.mocked(useRegisterSW).mockReturnValue({
      offlineReady: [false, vi.fn()],
      needRefresh: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    } as unknown as ReturnType<typeof useRegisterSW>);
    render(<AppShell />);
    await screen.findByRole("main");
    expect(noticesChunkLoads).not.toHaveBeenCalled();
  });

  it("should load the notices chunk when a notice is due", async () => {
    vi.mocked(useRegisterSW).mockReturnValue({
      offlineReady: [true, vi.fn()],
      needRefresh: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    } as unknown as ReturnType<typeof useRegisterSW>);
    render(<AppShell />);
    await vi.waitFor(() => expect(noticesChunkLoads).toHaveBeenCalled());
  });
});
