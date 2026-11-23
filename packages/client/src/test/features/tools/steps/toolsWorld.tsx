// Verifies FR1-FR5 of add-unix-time-converter-tool.
import { useRegisterSW } from "virtual:pwa-register/react";
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { cleanup, render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { vi } from "vitest";
import { AppShell } from "@/app";
import { PREFERENCES_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import {
  type ToolDefinition,
  ToolId,
  ToolPageFrame,
  type ToolPageProps,
  toolRegistry,
} from "@/tools";
import { createRetryableLazyView } from "@/views";

export const TOOL_NAME = "Конвертер Unix-времени";
export const TOOLS_CAPTION = "Инструменты";
export const SECOND_TOOL_NAME = "Карточки";

export const SamplePage = ({ notices, onBack }: ToolPageProps) => (
  <ToolPageFrame title="Tool page" notices={notices} onBack={onBack}>
    <p>sample</p>
  </ToolPageFrame>
);
export const makeTool = (
  id: string,
  titleKey: string,
  icon: ToolDefinition["icon"],
  hasPage = true,
): ToolDefinition => ({
  id,
  titleKey,
  icon,
  page: hasPage
    ? createRetryableLazyView<ToolPageProps>(async () => ({
        default: SamplePage,
      }))
    : undefined,
});

export const storePreferences = (enabledTools: unknown) =>
  localStorage.setItem(
    STORAGE_KEYS.PREFERENCES,
    JSON.stringify({
      schemaVersion: PREFERENCES_SCHEMA_VERSION,
      payload: { ...DEFAULT_PREFERENCES, enabledTools },
    }),
  );

export const toolButtonNames = () =>
  screen
    .queryAllByRole("button")
    .map((button) => button.getAttribute("aria-label"))
    .filter((name) => [TOOL_NAME, SECOND_TOOL_NAME].includes(name ?? ""));

/** Sets up the app shell, the language and the registry shared by the tools features. */
export const createToolsWorld = (f: FeatureDescriibeCallbackParams) => {
  const state = { registry: toolRegistry as readonly ToolDefinition[] };

  f.BeforeEachScenario(async () => {
    cleanup();
    localStorage.clear();
    state.registry = toolRegistry;
    await i18n.changeLanguage("ru");
    vi.mocked(useRegisterSW).mockReturnValue({
      offlineReady: [false, vi.fn()],
      needRefresh: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    } as ReturnType<typeof useRegisterSW>);
    stubZoneCitiesFetch();
  });
  f.AfterEachScenario(() => {
    vi.unstubAllGlobals();
  });

  const showApp = async () => {
    render(<AppShell tools={state.registry} />);
    await screen.findByRole("main");
  };
  const openSettings = async () => {
    await showApp();
    await userEvent.click(screen.getByRole("button", { name: "Настройки" }));
    await screen.findByRole("heading", { name: "Настройки" });
  };
  const givenConverterRegistry = (enabled = false) => {
    state.registry = toolRegistry;
    if (enabled) storePreferences([ToolId.UNIX_TIME_CONVERTER]);
  };
  const toggleOf = (name: string) => screen.getByRole("button", { name });

  return {
    showApp,
    openSettings,
    givenConverterRegistry,
    toggleOf,
    state,
  };
};
