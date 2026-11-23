// Verifies FR1, FR2, FR3, FR4, FR5 of add-unix-time-converter-tool.
import { useRegisterSW } from "virtual:pwa-register/react";
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { Binary, Clock } from "lucide-react";
import { expect, vi } from "vitest";
import { AppShell } from "@/app";
import { PREFERENCES_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import {
  type ToolDefinition,
  type ToolPageProps,
  ToolPageFrame,
  ToolId,
  toolRegistry,
} from "@/tools";
import { createRetryableLazyView } from "@/views";

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));

const feature = await loadFeature("../tools_unit.feature");
const TOOL_NAME = "Конвертер Unix-времени";
const TOOLS_CAPTION = "Инструменты";
const SECOND_TOOL_NAME = "Карточки";

const SamplePage = ({ notices, onBack }: ToolPageProps) => (
  <ToolPageFrame title="Tool page" notices={notices} onBack={onBack}>
    <p>sample</p>
  </ToolPageFrame>
);

const makeTool = (
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

const storePreferences = (enabledTools: unknown) =>
  localStorage.setItem(
    STORAGE_KEYS.PREFERENCES,
    JSON.stringify({
      schemaVersion: PREFERENCES_SCHEMA_VERSION,
      payload: { ...DEFAULT_PREFERENCES, enabledTools },
    }),
  );

const toolButtonNames = () =>
  screen
    .queryAllByRole("button")
    .map((button) => button.getAttribute("aria-label"))
    .filter((name) => [TOOL_NAME, SECOND_TOOL_NAME].includes(name ?? ""));

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let registry: readonly ToolDefinition[] = toolRegistry;

  f.BeforeEachScenario(async () => {
    cleanup();
    localStorage.clear();
    registry = toolRegistry;
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
    render(<AppShell tools={registry} />);
    await screen.findByRole("main");
  };
  const openSettings = async () => {
    await showApp();
    await userEvent.click(screen.getByRole("button", { name: "Настройки" }));
    await screen.findByRole("heading", { name: "Настройки" });
  };
  const givenConverterRegistry = (enabled = false) => {
    registry = toolRegistry;
    if (enabled) storePreferences([ToolId.UNIX_TIME_CONVERTER]);
  };
  const toggleOf = (name: string) => screen.getByRole("button", { name });

  // @add-unix-time-converter-tool @FR1
  f.Scenario(
    "A registered tool appears in the settings",
    ({ Given, When, Then }) => {
      Given("the tool registry holds the Unix time converter", () =>
        givenConverterRegistry(),
      );
      When("the user opens the settings page", openSettings);
      Then(
        "the tools group shows exactly one toggle, named {string}",
        (_ctx, name: string) => {
          expect(name).toBe(TOOL_NAME);
          expect(
            screen.getByRole("group", { name: TOOLS_CAPTION }),
          ).toBeInTheDocument();
          expect(screen.getAllByRole("button", { name })).toHaveLength(1);
        },
      );
    },
  );

  // @add-unix-time-converter-tool @FR1
  f.Scenario("Two tools keep registry order", ({ Given, When, Then }) => {
    Given(
      "a test registry with the tools A and B, in this order, both with a page and both enabled",
      () => {
        registry = [
          makeTool("a", "tools.unixTimeConverter", Binary),
          makeTool("b", "views.cardsTitle", Clock),
        ];
        storePreferences(["b", "a"]);
      },
    );
    When("the main page is shown", showApp);
    Then(
      "the header shows the tool button of A before the tool button of B",
      () => expect(toolButtonNames()).toEqual([TOOL_NAME, SECOND_TOOL_NAME]),
    );
  });

  // @add-unix-time-converter-tool @FR1
  f.Scenario("Empty registry", ({ Given, When, Then }) => {
    Given("a test registry with no tool", () => {
      registry = [];
    });
    When("the user opens the settings page", openSettings);
    Then("no group named {string} is shown", (_ctx, name: string) =>
      expect(screen.queryByRole("group", { name })).toBeNull(),
    );
  });

  // @add-unix-time-converter-tool @FR2
  f.Scenario("Every tool is off at first", ({ Given, When, Then }) => {
    Given("the tool registry holds the Unix time converter", () =>
      givenConverterRegistry(),
    );
    When("the user opens the settings page", openSettings);
    Then("the toggle {string} is not pressed", (_ctx, name: string) =>
      expect(toggleOf(name)).toHaveAttribute("aria-pressed", "false"),
    );
  });

  // @add-unix-time-converter-tool @FR2
  f.Scenario("Toggles are independent", ({ Given, When, Then, And }) => {
    Given(
      "a test registry with the tools A and B, in this order, both with a page and A enabled",
      () => {
        registry = [
          makeTool("a", "tools.unixTimeConverter", Binary),
          makeTool("b", "views.cardsTitle", Clock),
        ];
        storePreferences(["a"]);
      },
    );
    When("the user opens the settings page", openSettings);
    And("the user turns on the toggle of B", () =>
      userEvent.click(toggleOf(SECOND_TOOL_NAME)),
    );
    Then("the toggles of A and B are both pressed", () => {
      expect(toggleOf(TOOL_NAME)).toHaveAttribute("aria-pressed", "true");
      expect(toggleOf(SECOND_TOOL_NAME)).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });
    When("the user turns off the toggle of A", () =>
      userEvent.click(toggleOf(TOOL_NAME)),
    );
    Then("the toggle of B is pressed", () =>
      expect(toggleOf(SECOND_TOOL_NAME)).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );
  });

  // @add-unix-time-converter-tool @FR2
  f.Scenario("A toggle shows no text", ({ Given, When, Then }) => {
    Given("the tool registry holds the Unix time converter", () =>
      givenConverterRegistry(),
    );
    When("the user opens the settings page", openSettings);
    Then(
      "the toggle {string} shows an icon and no visible text",
      (_ctx, name: string) => {
        const toggle = toggleOf(name);
        expect(toggle.textContent).toBe("");
        expect(toggle.querySelector("svg")).not.toBeNull();
      },
    );
  });

  // @add-unix-time-converter-tool @FR3
  f.Scenario("An unregistered stored tool", ({ Given, When, Then }) => {
    Given(
      "the stored enabled tools are {string} and {string}",
      (_ctx, unregisteredId: string, registeredId: string) => {
        registry = toolRegistry;
        storePreferences([unregisteredId, registeredId]);
      },
    );
    When("the main page is shown", showApp);
    Then(
      "the header shows exactly one tool button, {string}",
      (_ctx, name: string) => expect(toolButtonNames()).toEqual([name]),
    );
  });

  // @add-unix-time-converter-tool @FR3
  f.ScenarioOutline(
    "Unreadable enabled tools",
    ({ Given, When, Then }, variables) => {
      Given("the stored enabled tools are <value>", () => {
        registry = toolRegistry;
        storePreferences(JSON.parse(variables.value));
      });
      When("the main page is shown", showApp);
      Then("no tool button is shown", () =>
        expect(toolButtonNames()).toEqual([]),
      );
    },
  );

  // @add-unix-time-converter-tool @FR4
  f.Scenario("No enabled tool", ({ Given, When, Then }) => {
    Given("the tool registry holds the Unix time converter", () =>
      givenConverterRegistry(),
    );
    When("the main page is shown", showApp);
    Then("no tool button is shown", () =>
      expect(toolButtonNames()).toEqual([]),
    );
  });

  // @add-unix-time-converter-tool @FR4
  f.Scenario("A tool without a page", ({ Given, When, Then }) => {
    Given("a test registry with the enabled tool A, which has no page", () => {
      registry = [makeTool("a", "tools.unixTimeConverter", Binary, false)];
      storePreferences(["a"]);
    });
    When("the main page is shown", showApp);
    Then("no tool button is shown", () =>
      expect(toolButtonNames()).toEqual([]),
    );
  });

  // @add-unix-time-converter-tool @FR5
  f.ScenarioOutline("Open and leave", ({ Given, When, Then }, variables) => {
    Given("the tool registry holds the Unix time converter, enabled", () =>
      givenConverterRegistry(true),
    );
    When("the user chooses the tool button", async () => {
      await showApp();
      await userEvent.click(toggleOf(TOOL_NAME));
    });
    Then(
      "the page heading is {string} and the date bar is not shown",
      async (_ctx, heading: string) => {
        expect(
          await screen.findByRole("heading", { name: heading }),
        ).toBeInTheDocument();
        expect(screen.queryByRole("group", { name: "Дата" })).toBeNull();
      },
    );
    When("the user leaves with <way>", async () => {
      if (variables.way === "Esc") await userEvent.keyboard("{Escape}");
      else await userEvent.click(screen.getByRole("button", { name: "Назад" }));
    });
    Then("the main page is shown and the focus is on the tool button", () => {
      expect(screen.getByRole("group", { name: "Дата" })).toBeInTheDocument();
      expect(toggleOf(TOOL_NAME)).toHaveFocus();
    });
  });

  // @add-unix-time-converter-tool @FR5
  f.Scenario("Loading fails, then succeeds", ({ Given, When, Then }) => {
    Given(
      "the Unix time converter is enabled and the first load of its page fails",
      () => {
        const failingThenLoading = vi
          .fn()
          .mockRejectedValueOnce(new Error("chunk failed"))
          .mockResolvedValueOnce({ default: SamplePage });
        registry = [
          {
            ...makeTool("a", "tools.unixTimeConverter", Binary),
            page: createRetryableLazyView<ToolPageProps>(failingThenLoading),
          },
        ];
        storePreferences(["a"]);
        vi.spyOn(console, "error").mockImplementation(() => undefined);
      },
    );
    When("the user chooses the tool button", async () => {
      await showApp();
      await userEvent.click(toggleOf(TOOL_NAME));
    });
    Then(
      "the error fallback with {string} and the back button is shown",
      async (_ctx, retryName: string) => {
        expect(
          await screen.findByRole("button", { name: retryName }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Назад" }),
        ).toBeInTheDocument();
      },
    );
    When(
      "the user chooses {string} and the load succeeds",
      (_ctx, name: string) =>
        userEvent.click(screen.getByRole("button", { name })),
    );
    Then("the page heading is {string}", async (_ctx, heading: string) => {
      expect(
        await screen.findByRole("heading", { name: "Tool page" }),
      ).toBeInTheDocument();
      expect(heading).toBe(TOOL_NAME);
    });
  });

  // @add-unix-time-converter-tool @FR5 @NFR-P1
  f.Scenario(
    "The page is not loaded before its button is chosen",
    ({ Given, When, Then }) => {
      const loadPage = vi.fn(async () => ({ default: SamplePage }));
      Given(
        "the Unix time converter is enabled and the load of its page is watched",
        () => {
          loadPage.mockClear();
          registry = [
            {
              ...makeTool("a", "tools.unixTimeConverter", Binary),
              page: createRetryableLazyView<ToolPageProps>(loadPage),
            },
          ];
          storePreferences(["a"]);
        },
      );
      When("the main page is shown", showApp);
      Then("the page of the tool was not loaded", () =>
        expect(loadPage).not.toHaveBeenCalled(),
      );
      When("the user chooses the tool button", () =>
        userEvent.click(toggleOf(TOOL_NAME)),
      );
      Then("the page of the tool was loaded once", async () => {
        await screen.findByRole("heading", { name: "Tool page" });
        expect(loadPage).toHaveBeenCalledOnce();
      });
    },
  );
});
