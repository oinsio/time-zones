// Verifies FR17 of add-unix-time-converter-tool: a view of the registry gets the presented moment and sends commands.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { Binary } from "lucide-react";
import { expect } from "vitest";
import type { ConverterViewDefinition } from "@/views/unixTimeConverter";
import { createConverterWorld } from "./converterWorld";

const feature = await loadFeature("../unix_time_converter_views_unit.feature");

const MOSCOW_ZONE_ID = "Europe/Moscow";
const MOSCOW_TIME_TEST_ID = "moscow-time";
const SEND_TEXT_BUTTON_NAME = "send text";

const createTestView = (sentText: string): ConverterViewDefinition => ({
  id: "test",
  titleKey: "unixTime.viewList",
  icon: Binary,
  component: ({ converter, commands }) => (
    <div>
      <p data-testid={MOSCOW_TIME_TEST_ID}>
        {
          converter.rows.find(({ timeZoneId }) => timeZoneId === MOSCOW_ZONE_ID)
            ?.timeLabel
        }
      </p>
      <button type="button" onClick={() => commands.typeInput(sentText)}>
        {SEND_TEXT_BUTTON_NAME}
      </button>
    </div>
  ),
});

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createConverterWorld();
  let sentText = "";

  f.BeforeEachScenario(async () => {
    cleanup();
    world.clock.moveTo("2026-11-23T11:23:07Z", "Asia/Almaty");
    await i18n.changeLanguage("ru");
  });

  // @add-unix-time-converter-tool @FR17
  f.Scenario("A second view shows the same moment", ({ Given, When, Then }) => {
    Given("a test registry whose first view is a test view", () => undefined);
    When(
      "the user opens the converter and the test view sends the text {string}",
      async (_ctx, text: string) => {
        sentText = text;
        await world.openWith(["Moscow"], [createTestView(sentText)]);
        await screen.findByTestId(MOSCOW_TIME_TEST_ID);
        await userEvent.click(
          screen.getByRole("button", { name: SEND_TEXT_BUTTON_NAME }),
        );
      },
    );
    Then(
      "the test view receives the Moscow row with the time {string}",
      (_ctx, time: string) => {
        expect(screen.getByTestId(MOSCOW_TIME_TEST_ID)).toHaveTextContent(time);
      },
    );
  });
});
