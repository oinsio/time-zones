import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { fireEvent, screen, within } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { ViewId } from "@/views";
import { createGridViewWorld } from "../../main_page/steps/gridViewWorld";

const feature = await loadFeature("../grid_view_hour_frame_unit.feature");

const ALMATY_ZONE = "Asia/Almaty";
const BOLD_CLASS = "font-bold";
const TYPED_TIME = "12:15";
const PIN_BY_TYPING = "types 12:15 into the time of Almaty";
const PIN_BY_DATE_BAR = "selects the next day in the date bar";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createGridViewWorld();

  const frameColumn = () =>
    Number(
      document
        .querySelector("[data-hour-frame-index]")
        ?.getAttribute("data-hour-frame-index"),
    );
  const cellOf = (city: string, column: number) =>
    within(
      screen.getByRole("slider", {
        name: i18n.t("locations.timeSliderLabel", { city }),
      }),
    ).getAllByText(/./, { selector: "[data-hour-cell] > span:first-child" })[
      column
    ];
  const cellBoxOf = (city: string, column: number) =>
    cellOf(city, column).parentElement as HTMLElement;
  const openGridAt = async (instant: string) => {
    world.setInstant(instant);
    world.setDeviceZone(ALMATY_ZONE);
    world.storeViewMode(ViewId.GRID);
    world.storeLocations(["Almaty", "Moscow"]);
    await world.openApp();
    await screen.findAllByRole("slider");
  };
  const expectFrameOn = (_ctx: unknown, column: number) =>
    expect(frameColumn()).toBe(column);
  const clockReaches = (_ctx: unknown, instant: string) =>
    world.moveClockTo(instant);

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(world.finish);

  // @add-grid-hour-cells-and-hour-frame @FR8
  f.Scenario("Frame on the current hour", ({ Given, When, Then, And }) => {
    Given(
      "the view mode is Grid, the reference zone is {string}, the current time is {string} and the stored locations are Almaty and Moscow",
      (_ctx, zone: string, instant: string) => {
        world.setDeviceZone(zone);
        world.setInstant(instant);
        world.storeViewMode(ViewId.GRID);
        world.storeLocations(["Almaty", "Moscow"]);
      },
    );
    When("the main page is shown", async () => {
      await world.openApp();
      await screen.findAllByRole("slider");
    });
    Then("the hour frame is on column {int}", expectFrameOn);
    And(
      "the texts of column 12 are bold in both rows and the texts of column 11 are not",
      () => {
        for (const city of ["Almaty", "Moscow"]) {
          expect(cellOf(city, 12)).toHaveClass(BOLD_CLASS);
          expect(cellOf(city, 11)).not.toHaveClass(BOLD_CLASS);
        }
      },
    );
  });

  // @add-grid-hour-cells-and-hour-frame @FR9
  f.Scenario("Live frame follows the clock", ({ Given, When, Then }) => {
    Given(
      "the Grid view shows the frame on column 12 at {string}, live",
      async (_ctx, instant: string) => {
        await openGridAt(instant);
        expect(frameColumn()).toBe(12);
      },
    );
    When("the clock reaches {string}", clockReaches);
    Then("the hour frame is on column {int}", expectFrameOn);
  });

  // @add-grid-hour-cells-and-hour-frame @FR9
  f.ScenarioOutline(
    "Pinned frame stays",
    ({ Given, When, And, Then }, variables) => {
      Given("the Grid view at {string}, live", (_ctx, instant: string) =>
        openGridAt(instant),
      );
      When("the user <pins>", async () => {
        if (variables.pins === PIN_BY_TYPING) {
          await world.typeTime("Almaty", TYPED_TIME);
        } else {
          expect(variables.pins).toBe(PIN_BY_DATE_BAR);
          await world.showNextDay();
        }
      });
      And("the clock reaches {string}", clockReaches);
      Then("the hour frame is on column <column>", () =>
        expect(frameColumn()).toBe(Number(variables.column)),
      );
    },
  );

  // @add-grid-hour-cells-and-hour-frame @FR9
  f.Scenario("Now returns the frame", ({ Given, When, Then }) => {
    Given(
      "the Grid view pinned at {string} and the current time {string}",
      async (_ctx, pinnedInstant: string, nowInstant: string) => {
        await openGridAt(nowInstant);
        expect(pinnedInstant).toBe("2026-03-08T02:00:00Z");
        await world.typeTime("Almaty", "07:00");
        expect(frameColumn()).toBe(7);
      },
    );
    When("the user returns to now", async () => {
      fireEvent.click(screen.getByRole("button", { name: i18n.t("date.now") }));
    });
    Then("the hour frame is on column {int}", expectFrameOn);
  });

  // @add-grid-meeting-range-and-share @FR5
  f.Scenario(
    "A tap on a cell sets a one-hour meeting range",
    ({ Given, When, Then, And }) => {
      Given("the Grid view at {string}, live", (_ctx, instant: string) =>
        openGridAt(instant),
      );
      When("the user taps column 3 of Moscow", () => {
        fireEvent.click(cellBoxOf("Moscow", 3));
      });
      Then("the meeting frame encloses column 3", () => {
        expect(
          document
            .querySelector("[data-meeting-frame-columns]")
            ?.getAttribute("data-meeting-frame-columns"),
        ).toBe("3-3");
      });
      And(
        "no hour frame is shown and the title is {string}",
        (_ctx, title: string) => {
          expect(document.querySelector("[data-hour-frame-index]")).toBeNull();
          expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            title,
          );
        },
      );
    },
  );
});
