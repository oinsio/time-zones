// Verifies FR9, UX1 of add-unix-time-converter-tool.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, render, screen, within } from "@testing-library/react/pure";
import i18n from "i18next";
import { Clock } from "lucide-react";
import { expect } from "vitest";
import { createInMemoryTextCopying } from "@/adapters";
import { ToolHost } from "@/app";
import type { ToolPageProps } from "@/tools";
import { createRetryableLazyView } from "@/views";
import { createConverterWorld } from "./converterWorld";

const feature = await loadFeature(
  "../unix_time_converter_loading_unit.feature",
);

const findRowSkeleton = () => document.querySelector(".animate-pulse");
const findBusyRegion = () => document.querySelector("[aria-busy=true]");

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
      And("the row skeleton is not shown", () => {
        expect(findBusyRegion()).toBeNull();
        expect(findRowSkeleton()).toBeNull();
      });
    },
  );

  // @add-unix-time-converter-tool @FR9 @UX1
  f.Scenario(
    "The converter page is still loading",
    ({ Given, When, Then, And }) => {
      Given("the converter page has not finished loading", () => undefined);
      When("the user opens the converter", () => {
        render(
          <ToolHost
            tool={{
              id: "unixTimeConverter",
              titleKey: "tools.unixTimeConverter",
              icon: Clock,
              page: createRetryableLazyView<ToolPageProps>(
                () => new Promise(() => undefined),
              ),
            }}
            notices={null}
            onBack={() => undefined}
            session={{ read: () => undefined, write: () => undefined }}
            services={{
              tickScheduler: { schedule: () => () => undefined },
              textCopying: createInMemoryTextCopying(),
            }}
          />,
        );
      });
      Then("the row skeleton is shown under the page heading", async () => {
        expect(
          await screen.findByRole("heading", {
            name: "Конвертер Unix-времени",
          }),
        ).toBeInTheDocument();
        expect(findBusyRegion()).not.toBeNull();
        expect(findRowSkeleton()).not.toBeNull();
      });
      And("no converter row is shown", () =>
        expect(
          screen.queryByRole("list", { name: "Время в местах" }),
        ).toBeNull(),
      );
    },
  );
});
