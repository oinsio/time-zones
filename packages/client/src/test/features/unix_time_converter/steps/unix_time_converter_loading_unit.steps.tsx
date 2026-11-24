// Verifies FR9 of add-unix-time-converter-tool.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, screen, within } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { createConverterWorld } from "./converterWorld";

const feature = await loadFeature(
  "../unix_time_converter_loading_unit.feature",
);

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createConverterWorld();

  f.BeforeEachScenario(async () => {
    cleanup();
    world.clock.moveTo("2026-11-23T11:23:07Z", "Asia/Almaty");
    await i18n.changeLanguage("ru");
  });

  // @add-unix-time-converter-tool @FR9
  f.Scenario(
    "The location list is unreadable",
    ({ Given, When, Then, And }) => {
      Given("the stored location list cannot be read", () => undefined);
      When("the user opens the converter", () =>
        world.openWithUnreadableList(),
      );
      Then("exactly one row is shown, for the device time zone", () => {
        const rows = within(
          screen.getByRole("list", { name: "Время в местах" }),
        ).getAllByRole("listitem");
        expect(rows).toHaveLength(1);
        expect(rows[0]).toHaveTextContent("Время устройства");
      });
      And("the row skeleton is not shown", () =>
        expect(screen.queryByText("Загрузка…")).toBeNull(),
      );
    },
  );
});
