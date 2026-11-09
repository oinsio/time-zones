import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, waitFor } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { ViewId } from "@/views";
import { createGridViewWorld } from "./gridViewWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const GRID_ROW_VARIANT = "grid-row";

const feature = await loadFeature("../main_page_grid_view_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createGridViewWorld();

  const expectTimes = (almatyTime: string, moscowTime: string) => {
    expect(world.timeOf("Almaty")).toBe(almatyTime);
    expect(world.timeOf("Moscow")).toBe(moscowTime);
  };

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(world.finish);

  // @add-view-mode-setting-and-grid-skeleton @FR7 @UX3
  f.Scenario(
    "Rows in one panel without hour cells",
    ({ Given, When, Then, And }) => {
      Given(
        "the view mode is Grid and the stored locations are Almaty and Moscow",
        () => {
          world.storeViewMode(ViewId.GRID);
          world.storeLocations(["Almaty", "Moscow"]);
        },
      );
      When("the main page is shown", world.openApp);
      Then(
        "the Grid view shows the rows of Almaty and Moscow, in this order, inside one panel",
        async () => {
          const panel = await screen.findByRole("list");
          expect(panel).toHaveAttribute("data-row-variant", GRID_ROW_VARIANT);
          expect(world.cityCaptionsOfRows()).toEqual([
            i18n.t("locations.locationMenu", { city: "Almaty" }),
            i18n.t("locations.locationMenu", { city: "Moscow" }),
          ]);
        },
      );
      And("no row has a day track", () => {
        expect(screen.queryByRole("slider")).not.toBeInTheDocument();
      });
    },
  );

  // @add-view-mode-setting-and-grid-skeleton @FR7
  f.Scenario("Typing a time in Grid", ({ Given, When, Then }) => {
    Given(
      "the view mode is Grid, the current time is {string} and the stored locations are Almaty and Moscow",
      (_ctx, instant: string) => {
        world.setInstant(instant);
        world.storeViewMode(ViewId.GRID);
        world.storeLocations(["Almaty", "Moscow"]);
      },
    );
    When(
      "the user types {string} into the time of Moscow",
      async (_ctx, text: string) => {
        await world.openApp();
        await screen.findByRole("list");
        await world.typeTime("Moscow", text);
      },
    );
    Then(
      "Almaty shows {string} and Moscow shows {string}",
      async (_ctx, almatyTime: string, moscowTime: string) =>
        waitFor(() => expectTimes(almatyTime, moscowTime)),
    );
  });

  // @add-view-mode-setting-and-grid-skeleton @FR7
  f.Scenario("Empty Grid", ({ Given, When, Then, And }) => {
    Given("the view mode is Grid and the stored location list is empty", () => {
      world.storeViewMode(ViewId.GRID);
      world.storeEmptyList();
    });
    When("the main page is shown", world.openApp);
    Then("it shows the empty-state explanation", async () => {
      expect(await screen.findByText(i18n.t("views.emptyState"))).toBeVisible();
    });
    And("the header {string} action is available", () => {
      expect(
        screen.getByRole("button", { name: i18n.t("locations.addLocation") }),
      ).toBeVisible();
    });
  });

  // @add-view-mode-setting-and-grid-skeleton @FR7
  f.Scenario("Unreadable list in Grid", ({ Given, When, Then }) => {
    Given(
      "the view mode is Grid and the stored location list is unreadable",
      () => {
        world.storeViewMode(ViewId.GRID);
        world.storeUnreadableList();
      },
    );
    When("the main page is shown", world.openApp);
    Then("it shows the load error with a Reset action", async () => {
      expect(await screen.findByRole("alert")).toHaveTextContent(
        i18n.t("locations.loadError"),
      );
      expect(
        screen.getByRole("button", { name: i18n.t("locations.reset") }),
      ).toBeVisible();
    });
  });

  // @add-view-mode-setting-and-grid-skeleton @FR4 @UX2
  f.Scenario(
    "Switching keeps the selected moment",
    ({ Given, And, When, Then }) => {
      Given(
        "the current time is {string} and the stored locations are Almaty and Moscow",
        (_ctx, instant: string) => {
          world.setInstant(instant);
          world.storeLocations(["Almaty", "Moscow"]);
        },
      );
      And("the user chose the next day in Cards", async () => {
        await world.openApp();
        await screen.findByRole("list");
        await world.showNextDay();
        await waitFor(() =>
          expect(world.isoDateOf("Almaty")).toBe("2026-03-09"),
        );
      });
      When("the user chooses Grid in the settings", () =>
        world.chooseViewInSettings(i18n.t("views.gridTitle")),
      );
      Then("the row of Almaty still carries the next day", async () => {
        await waitFor(() =>
          expect(screen.getByRole("list")).toHaveAttribute(
            "data-row-variant",
            GRID_ROW_VARIANT,
          ),
        );
        expect(world.isoDateOf("Almaty")).toBe("2026-03-09");
      });
    },
  );
});
