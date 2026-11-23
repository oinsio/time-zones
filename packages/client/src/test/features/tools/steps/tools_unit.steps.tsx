// Verifies FR1, FR2, FR3, FR4 of add-unix-time-converter-tool.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import { Binary, Clock } from "lucide-react";
import { expect, vi } from "vitest";
import { toolRegistry } from "@/tools";
import {
  createToolsWorld,
  makeTool,
  SECOND_TOOL_NAME,
  storePreferences,
  TOOL_NAME,
  TOOLS_CAPTION,
  toolButtonNames,
} from "./toolsWorld";

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));

const feature = await loadFeature("../tools_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createToolsWorld(f);
  const { showApp, openSettings, givenConverterRegistry, toggleOf } = world;

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
        world.state.registry = [
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
      world.state.registry = [];
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
        world.state.registry = [
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
        world.state.registry = toolRegistry;
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
        world.state.registry = toolRegistry;
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
      world.state.registry = [
        makeTool("a", "tools.unixTimeConverter", Binary, false),
      ];
      storePreferences(["a"]);
    });
    When("the main page is shown", showApp);
    Then("no tool button is shown", () =>
      expect(toolButtonNames()).toEqual([]),
    );
  });
});
