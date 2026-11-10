// Verifies FR15 of add-grid-meeting-range-and-share.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { clickButton, spanOf } from "./meetingGridQueries";
import { createMeetingGridSession } from "./meetingGridSession";

const feature = await loadFeature("../grid_view_meeting_share_unit.feature");

const SHARE_BUTTON = "Share meeting";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const { world, openGridWithSampleMeeting, getSharing, useSharing, reset } =
    createMeetingGridSession();

  f.BeforeEachScenario(reset);
  f.AfterAllScenarios(world.finish);

  // @add-grid-meeting-range-and-share @FR15
  f.Scenario("Share where the browser can share", ({ Given, When, Then }) => {
    Given(
      "a browser with a system share and the Grid view with the sample meeting",
      () => openGridWithSampleMeeting(),
    );
    When("the user chooses {string}", async (_ctx, name: string) => {
      clickButton(name);
      await screen.findByRole("button", { name: SHARE_BUTTON });
    });
    Then(
      "the system share receives the meeting share text and no notice is shown",
      () => {
        expect(getSharing().sharedTexts).toHaveLength(1);
        expect(getSharing().sharedTexts[0]).toMatch(/^Meeting on .*2 h\n/);
        expect(screen.queryByText(i18n.t("meeting.copiedNotice"))).toBeNull();
      },
    );
  });

  // @add-grid-meeting-range-and-share @FR15
  f.Scenario("Closing the share sheet", ({ Given, When, Then }) => {
    Given(
      "a browser whose system share reports that the user closed the sheet",
      () => {
        useSharing({ canShare: true, isCancelled: true, canCopy: true });
        return openGridWithSampleMeeting();
      },
    );
    When("the user chooses {string}", (_ctx, name: string) => {
      clickButton(name);
    });
    Then("nothing changes and no notice is shown", () => {
      expect(spanOf("Almaty")).toBe("09:00–11:00");
      expect(getSharing().sharedTexts).toHaveLength(0);
      expect(getSharing().copiedTexts).toHaveLength(0);
      expect(screen.queryByText(i18n.t("meeting.copiedNotice"))).toBeNull();
      expect(
        screen.queryByText(i18n.t("meeting.shareFailedNotice")),
      ).toBeNull();
    });
  });

  // @add-grid-meeting-range-and-share @FR15
  f.Scenario(
    "Copy where the browser cannot share",
    ({ Given, When, Then, And }) => {
      Given(
        "a browser without a system share and the Grid view with the sample meeting",
        () => {
          useSharing({ canShare: false, canCopy: true });
          return openGridWithSampleMeeting();
        },
      );
      When("the user chooses {string}", (_ctx, name: string) => {
        clickButton(name);
      });
      Then("the clipboard holds the meeting share text", async () => {
        await screen.findByText(i18n.t("meeting.copiedNotice"));
        expect(getSharing().copiedTexts).toHaveLength(1);
        expect(getSharing().copiedTexts[0]).toMatch(/^Meeting on /);
      });
      And(
        "the notice {string} is shown and the focus stays on {string}",
        (_ctx, notice: string, buttonName: string) => {
          expect(screen.getByText(notice)).toBeInTheDocument();
          const button = screen.getByRole("button", { name: buttonName });
          button.focus();
          expect(document.activeElement).toBe(button);
        },
      );
    },
  );

  // @add-grid-meeting-range-and-share @FR15
  f.Scenario("Neither share nor clipboard", ({ Given, When, Then }) => {
    Given(
      "a browser without a system share and without clipboard access",
      () => {
        useSharing({ canShare: false, canCopy: false });
        return openGridWithSampleMeeting();
      },
    );
    When("the user chooses {string}", (_ctx, name: string) => {
      clickButton(name);
    });
    Then("the notice {string} is shown", async (_ctx, notice: string) => {
      expect(await screen.findByText(notice)).toBeInTheDocument();
    });
  });
});
