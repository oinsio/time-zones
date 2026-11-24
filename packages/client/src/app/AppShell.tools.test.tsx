// Verifies FR1, FR4, FR5, FR14, NFR-A1, NFR-A4 of add-unix-time-converter-tool.
import { useRegisterSW } from "virtual:pwa-register/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { Binary, Clock } from "lucide-react";
import {
  PREFERENCES_SCHEMA_VERSION,
  PREFERENCES_SYNC_CHANNEL_NAME,
  STORAGE_KEYS,
} from "@/constants";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { createAnotherAppRevisionSource } from "@/test/anotherAppRevisionSource";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import {
  type ToolDefinition,
  ToolPageFrame,
  type ToolPageProps,
} from "@/tools";
import { createRetryableLazyView } from "@/views";
import { AppShell } from "./AppShell";

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));

const SESSION_NOTE = "kept note";

/** A page that writes the session on a click and shows what it read. */
const SessionPage = ({ notices, onBack, session }: ToolPageProps) => (
  <ToolPageFrame title="Tool A page" notices={notices} onBack={onBack}>
    <p>{String(session.read() ?? "empty")}</p>
    <button type="button" onClick={() => session.write(SESSION_NOTE)}>
      write
    </button>
  </ToolPageFrame>
);

const makeTool = (
  id: string,
  titleKey: string,
  withPage = true,
): ToolDefinition => ({
  id,
  titleKey,
  icon: id === "a" ? Binary : Clock,
  page: withPage
    ? createRetryableLazyView<ToolPageProps>(async () => ({
        default: SessionPage,
      }))
    : undefined,
});

const toolA = makeTool("a", "tools.unixTimeConverter");
const toolB = makeTool("b", "tools.groupLabel");

const enableTools = (enabledTools: string[]) =>
  localStorage.setItem(
    STORAGE_KEYS.PREFERENCES,
    JSON.stringify({
      schemaVersion: PREFERENCES_SCHEMA_VERSION,
      payload: { ...DEFAULT_PREFERENCES, enabledTools },
    }),
  );

const mockServiceWorker = (isUpdateAvailable = false) => {
  vi.mocked(useRegisterSW).mockReturnValue({
    offlineReady: [false, vi.fn()],
    needRefresh: [isUpdateAvailable, vi.fn()],
    updateServiceWorker: vi.fn(),
  } as ReturnType<typeof useRegisterSW>);
};

describe("AppShell tool pages", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("ru");
    mockServiceWorker();
    stubZoneCitiesFetch();
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("should show no tool button when no tool is enabled", async () => {
    render(<AppShell tools={[toolA]} />);
    await screen.findByRole("main");
    expect(
      screen.queryByRole("button", { name: "Конвертер Unix-времени" }),
    ).toBeNull();
  });

  it("should show the tool buttons between Add location and Settings in registry order", async () => {
    enableTools(["b", "a"]);
    render(<AppShell tools={[toolA, toolB]} />);
    const names = (await screen.findAllByRole("button"))
      .map((button) => button.getAttribute("aria-label"))
      .filter((name) =>
        [
          "Добавить место",
          "Конвертер Unix-времени",
          "Инструменты",
          "Настройки",
        ].includes(name ?? ""),
      );
    expect(names).toEqual([
      "Добавить место",
      "Конвертер Unix-времени",
      "Инструменты",
      "Настройки",
    ]);
  });

  it("should show no button for a tool without a page", async () => {
    enableTools(["a"]);
    render(
      <AppShell tools={[makeTool("a", "tools.unixTimeConverter", false)]} />,
    );
    await screen.findByRole("main");
    expect(
      screen.queryByRole("button", { name: "Конвертер Unix-времени" }),
    ).toBeNull();
  });

  it.each([
    [
      "the back button",
      () => userEvent.click(screen.getByRole("button", { name: "Назад" })),
    ],
    ["Esc", () => userEvent.keyboard("{Escape}")],
  ])(
    "should open the page and leave it with %s, focusing the tool button",
    async (_name, leave) => {
      enableTools(["a"]);
      render(<AppShell tools={[toolA]} />);
      await userEvent.click(
        await screen.findByRole("button", { name: "Конвертер Unix-времени" }),
      );
      expect(
        await screen.findByRole("heading", { name: "Tool A page" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("group", { name: "Дата" })).toBeNull();
      await leave();
      expect(
        screen.getByRole("button", { name: "Конвертер Unix-времени" }),
      ).toHaveFocus();
      expect(screen.getByRole("group", { name: "Дата" })).toBeInTheDocument();
    },
  );

  it("should keep the notices region working on a tool page", async () => {
    mockServiceWorker(true);
    enableTools(["a"]);
    render(
      <AppShell
        tools={[toolA]}
        appRevisionSource={createAnotherAppRevisionSource()}
      />,
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Конвертер Unix-времени" }),
    );
    await screen.findByRole("heading", { name: "Tool A page" });
    const notice = await screen.findByText("Доступна новая версия.");
    expect(screen.getByRole("status")).toContainElement(notice);
  });

  it("should keep the session value across leaving and reopening", async () => {
    enableTools(["a"]);
    render(<AppShell tools={[toolA]} />);
    const openTool = async () =>
      userEvent.click(
        await screen.findByRole("button", { name: "Конвертер Unix-времени" }),
      );
    await openTool();
    expect(await screen.findByText("empty")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "write" }));
    await userEvent.click(screen.getByRole("button", { name: "Назад" }));
    await openTool();
    expect(await screen.findByText(SESSION_NOTE)).toBeInTheDocument();
  });

  it("should forget the session after a remount of the app", async () => {
    enableTools(["a"]);
    const { unmount } = render(<AppShell tools={[toolA]} />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Конвертер Unix-времени" }),
    );
    await userEvent.click(await screen.findByRole("button", { name: "write" }));
    unmount();
    render(<AppShell tools={[toolA]} />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Конвертер Unix-времени" }),
    );
    expect(await screen.findByText("empty")).toBeInTheDocument();
  });

  it("should return to the main page when the tool is turned off while its page is shown", async () => {
    enableTools(["a"]);
    render(<AppShell tools={[toolA]} />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Конвертер Unix-времени" }),
    );
    await screen.findByRole("heading", { name: "Tool A page" });
    // Another tab turns the tool off and tells this one through the channel.
    enableTools([]);
    new BroadcastChannel(PREFERENCES_SYNC_CHANNEL_NAME).postMessage("changed");
    expect(
      await screen.findByRole("group", { name: "Дата" }),
    ).toBeInTheDocument();
  });
});
