// Verifies FR3 of add-unix-time-converter-tool.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, screen, waitFor } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";
import {
  PREFERENCES_SCHEMA_VERSION,
  PREFERENCES_SYNC_CHANNEL_NAME,
  STORAGE_KEYS,
} from "@/constants";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { toolRegistry } from "@/tools";
import { ViewId } from "@/views";
import {
  createToolsWorld,
  storePreferences,
  TOOL_NAME,
  toolButtonNames,
} from "./toolsWorld";

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));

const feature = await loadFeature("../tools_preferences_unit.feature");

const CROSS_TAB_MESSAGE = "changed";
const DARK_THEME_ATTRIBUTE = "dark";
const DARK_THEME = "DARK";
const THEME_NAME_DARK = "Тёмная";

const readStoredEnabledTools = (): unknown =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES) ?? "{}").payload
    .enabledTools;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createToolsWorld(f);
  const { showApp, toggleOf } = world;

  f.AfterEachScenario(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  // @add-unix-time-converter-tool @FR3
  f.Scenario(
    "A document from before this change",
    ({ Given, When, Then, And }) => {
      Given(
        "stored preferences of the previous schema version with the dark theme and the Grid view",
        () => {
          const { enabledTools: _omitted, ...preferencesBeforeTools } =
            DEFAULT_PREFERENCES;
          localStorage.setItem(
            STORAGE_KEYS.PREFERENCES,
            JSON.stringify({
              schemaVersion: PREFERENCES_SCHEMA_VERSION - 1,
              payload: {
                ...preferencesBeforeTools,
                theme: DARK_THEME,
                viewMode: ViewId.GRID,
              },
            }),
          );
        },
      );
      When("the main page is shown", showApp);
      Then("no tool button is shown", () =>
        expect(toolButtonNames()).toEqual([]),
      );
      And("the theme is dark and the view is Grid", async () => {
        expect(document.documentElement.dataset.theme).toBe(
          DARK_THEME_ATTRIBUTE,
        );
        await waitFor(() =>
          expect(document.querySelector("[data-view-id]")).toHaveAttribute(
            "data-view-id",
            ViewId.GRID,
          ),
        );
      });
    },
  );

  // @add-unix-time-converter-tool @FR3
  f.Scenario(
    "An unregistered tool stays stored",
    ({ Given, When, Then, And }) => {
      Given(
        "the stored enabled tools are {string} and {string}",
        (_ctx, unregisteredId: string, registeredId: string) => {
          world.state.registry = toolRegistry;
          storePreferences([unregisteredId, registeredId]);
        },
      );
      When("the main page is shown", showApp);
      And("the user changes the theme to dark", async () => {
        await userEvent.click(
          screen.getByRole("button", { name: "Настройки" }),
        );
        await userEvent.click(
          await screen.findByRole("radio", { name: THEME_NAME_DARK }),
        );
        await act(async () => {
          window.dispatchEvent(new Event("pagehide"));
        });
      });
      Then("the stored enabled tools still hold {string}", (_ctx, id: string) =>
        expect(readStoredEnabledTools()).toContain(id),
      );
    },
  );

  // @add-unix-time-converter-tool @FR3
  f.Scenario("Another tab turns a tool on", ({ Given, When, Then, And }) => {
    Given("the tool registry holds the Unix time converter", () => {
      world.givenConverterRegistry();
    });
    When("the main page is shown", showApp);
    And("another tab turns on the tool {string}", async () => {
      storePreferences(["unixTimeConverter"]);
      new BroadcastChannel(PREFERENCES_SYNC_CHANNEL_NAME).postMessage(
        CROSS_TAB_MESSAGE,
      );
    });
    Then("the header shows the tool button {string}", async (_ctx, name) => {
      expect(name).toBe(TOOL_NAME);
      expect(
        await screen.findByRole("button", { name: TOOL_NAME }),
      ).toBeInTheDocument();
    });
  });

  // @add-unix-time-converter-tool @FR3
  f.Scenario("Without storage", ({ Given, When, Then, And }) => {
    Given("the storage is unavailable", () => {
      world.givenConverterRegistry();
      const failing = () => {
        throw new DOMException("denied", "SecurityError");
      };
      vi.stubGlobal("localStorage", {
        getItem: failing,
        setItem: failing,
        removeItem: failing,
        clear: failing,
        key: failing,
        length: 0,
      });
    });
    When("the main page is shown", showApp);
    And(
      "the user turns on the tool {string} in the settings and goes back",
      async (_ctx, name: string) => {
        await openSettingsFromMain();
        await userEvent.click(toggleOf(name));
        await userEvent.click(screen.getByRole("button", { name: "Назад" }));
      },
    );
    Then("the header shows the tool button {string}", async (_ctx, name) => {
      expect(await screen.findByRole("button", { name })).toBeInTheDocument();
    });
    And("the storage warning is shown", async () => {
      expect(await screen.findByText(/сохран/i)).toBeInTheDocument();
    });
  });

  const openSettingsFromMain = async () => {
    await userEvent.click(screen.getByRole("button", { name: "Настройки" }));
    await screen.findByRole("heading", { name: "Настройки" });
  };
});
