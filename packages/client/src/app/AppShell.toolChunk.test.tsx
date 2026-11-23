// Verifies NFR-P1 of add-unix-time-converter-tool: the converter page is not in the initial JavaScript.
import { useRegisterSW } from "virtual:pwa-register/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { PREFERENCES_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { AppShell } from "./AppShell";

const { toolChunkLoads } = vi.hoisted(() => ({ toolChunkLoads: vi.fn() }));

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));
vi.mock("@/tools/unixTimeConverter", () => {
  toolChunkLoads();
  return { UnixTimeConverterPage: () => <h1>converter page</h1> };
});

const storeEnabledTools = (enabledTools: string[]) =>
  localStorage.setItem(
    STORAGE_KEYS.PREFERENCES,
    JSON.stringify({
      schemaVersion: PREFERENCES_SCHEMA_VERSION,
      payload: { ...DEFAULT_PREFERENCES, enabledTools },
    }),
  );

describe("AppShell tool chunk", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("ru");
    vi.mocked(useRegisterSW).mockReturnValue({
      offlineReady: [false, vi.fn()],
      needRefresh: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    } as unknown as ReturnType<typeof useRegisterSW>);
    stubZoneCitiesFetch();
    localStorage.clear();
  });

  it("should not load the page with no tool enabled", async () => {
    render(<AppShell />);
    await screen.findByRole("main");
    expect(toolChunkLoads).not.toHaveBeenCalled();
  });

  it("should not load the page while the tool is enabled and not chosen", async () => {
    storeEnabledTools(["unixTimeConverter"]);
    render(<AppShell />);
    await screen.findByRole("button", { name: "Конвертер Unix-времени" });
    expect(toolChunkLoads).not.toHaveBeenCalled();
  });

  it("should load the page when its tool button is chosen", async () => {
    storeEnabledTools(["unixTimeConverter"]);
    render(<AppShell />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Конвертер Unix-времени" }),
    );
    expect(await screen.findByText("converter page")).toBeInTheDocument();
    expect(toolChunkLoads).toHaveBeenCalled();
  });
});
