// Verifies FR5 of add-unix-time-converter-tool.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import { Binary } from "lucide-react";
import { expect, vi } from "vitest";
import type { ToolPageProps } from "@/tools";
import { createRetryableLazyView } from "@/views";
import {
  createToolsWorld,
  makeTool,
  SamplePage,
  storePreferences,
  TOOL_NAME,
} from "./toolsWorld";

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));

const feature = await loadFeature("../tools_pages_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createToolsWorld(f);
  const { showApp, givenConverterRegistry, toggleOf } = world;

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
        world.state.registry = [
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
          world.state.registry = [
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
