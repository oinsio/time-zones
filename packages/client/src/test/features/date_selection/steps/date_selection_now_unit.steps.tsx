import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { createDateSelectionWorld } from "./dateSelectionWorld";
import { createReferenceMomentSteps } from "./referenceMomentStepHelpers";

const feature = await loadFeature("../date_selection_now_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDateSelectionWorld();

  f.BeforeEachScenario(async () => {
    await world.reset();
  });
  f.AfterAllScenarios(world.finish);

  const {
    givenZone,
    givenInstant,
    givenList,
    givenAppOpen,
    whenActivatesInactiveNow,
    thenLive,
    thenRowShows,
    thenNowInactive,
  } = createReferenceMomentSteps(world);

  // @keep-now-button-visible-when-live @FR2 @M5
  f.Scenario(
    "An inactive Now changes nothing",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When(
        "the user activates the inactive Now button",
        whenActivatesInactiveNow,
      );
      Then("the moment is live", thenLive);
      And(
        "the {string} row shows the time {string} and the date {string}",
        thenRowShows,
      );
      And("the Now button is inactive", thenNowInactive);
    },
  );
});
