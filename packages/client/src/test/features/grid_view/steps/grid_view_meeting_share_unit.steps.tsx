// Verifies FR15 of add-grid-meeting-range-and-share.
// Verifies FR1, FR9 of add-meeting-share-dialog.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, waitFor, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import { clickButton } from "./meetingGridQueries";
import { createMeetingGridSession } from "./meetingGridSession";

const feature = await loadFeature("../grid_view_meeting_share_unit.feature");

const DIALOG_NAME = "Share meeting";
const COPIED_NOTICE = "Meeting text copied";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const { world, openGridWithSampleMeeting, getSharing, useSharing, reset } =
    createMeetingGridSession();

  f.BeforeEachScenario(reset);
  f.AfterAllScenarios(world.finish);

  const openDialog = async () => {
    clickButton(DIALOG_NAME);
    await screen.findByRole("dialog", { name: DIALOG_NAME });
  };
  const givenDialogOpen = async (options: Parameters<typeof useSharing>[0]) => {
    useSharing(options);
    await openGridWithSampleMeeting();
    await openDialog();
  };
  const chooseShareInDialog = async () => {
    const dialog = screen.getByRole("dialog", { name: DIALOG_NAME });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Share" }),
    );
  };
  const expectDialogClosed = () =>
    waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

  // @add-meeting-share-dialog @FR1 @FR9
  f.Scenario(
    "Share meeting opens the share dialog",
    ({ Given, When, Then, And }) => {
      Given(
        "a browser with a system share and the Grid view with the sample meeting",
        () => openGridWithSampleMeeting(),
      );
      When("the user chooses {string}", async (_ctx, name: string) => {
        clickButton(name);
        await screen.findByRole("dialog", { name: DIALOG_NAME });
      });
      Then("the share dialog is open", () => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
      And(
        "the system share has received nothing and the clipboard is unchanged",
        () => {
          expect(getSharing().sharedTexts).toHaveLength(0);
          expect(getSharing().copiedTexts).toHaveLength(0);
        },
      );
    },
  );

  // @add-grid-meeting-range-and-share @FR15 @add-meeting-share-dialog @FR9
  f.Scenario("Share where the browser can share", ({ Given, When, Then }) => {
    Given(
      "a browser with a system share and the share dialog open for the sample meeting",
      () => givenDialogOpen({ canShare: true, canCopy: true }),
    );
    When('the user chooses "Share" in the dialog', chooseShareInDialog);
    Then(
      "the system share receives the meeting share text and no notice is shown",
      async () => {
        await expectDialogClosed();
        expect(getSharing().sharedTexts).toHaveLength(1);
        expect(getSharing().sharedTexts[0]).toMatch(/^Meeting on .*2 h\n/);
        expect(screen.queryByText(i18n.t("meeting.copiedNotice"))).toBeNull();
      },
    );
  });

  // @add-grid-meeting-range-and-share @FR15 @add-meeting-share-dialog @FR9
  f.Scenario("Closing the share sheet", ({ Given, When, Then }) => {
    Given(
      "a browser whose system share reports that the user closed the sheet and the share dialog open for the sample meeting",
      () =>
        givenDialogOpen({ canShare: true, isCancelled: true, canCopy: true }),
    );
    When('the user chooses "Share" in the dialog', chooseShareInDialog);
    Then("the share dialog stays open and no notice is shown", () => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(getSharing().sharedTexts).toHaveLength(0);
      expect(getSharing().copiedTexts).toHaveLength(0);
      expect(screen.queryByText(COPIED_NOTICE)).toBeNull();
      expect(
        screen.queryByText(i18n.t("meeting.shareFailedNotice")),
      ).toBeNull();
    });
  });

  // @add-grid-meeting-range-and-share @FR15 @add-meeting-share-dialog @FR9
  f.Scenario(
    "Copy where the browser cannot share",
    ({ Given, When, Then, And }) => {
      Given(
        "a browser without a system share and the share dialog open for the sample meeting",
        () => givenDialogOpen({ canShare: false, canCopy: true }),
      );
      When('the user chooses "Share" in the dialog', chooseShareInDialog);
      Then("the clipboard holds the meeting share text", async () => {
        await screen.findByText(COPIED_NOTICE);
        expect(getSharing().copiedTexts).toHaveLength(1);
        expect(getSharing().copiedTexts[0]).toMatch(/^Meeting on /);
      });
      And(
        "the share dialog is closed and the notice {string} is shown",
        async (_ctx, notice: string) => {
          await expectDialogClosed();
          expect(screen.getByText(notice)).toBeInTheDocument();
        },
      );
    },
  );

  // @add-grid-meeting-range-and-share @FR15 @add-meeting-share-dialog @FR9
  f.Scenario("Neither share nor clipboard", ({ Given, When, Then }) => {
    Given(
      "a browser without a system share and without clipboard access and the share dialog open for the sample meeting",
      () => givenDialogOpen({ canShare: false, canCopy: false }),
    );
    When('the user chooses "Share" in the dialog', chooseShareInDialog);
    Then(
      "the share dialog is closed and the notice {string} is shown",
      async (_ctx, notice: string) => {
        expect(await screen.findByText(notice)).toBeInTheDocument();
        await expectDialogClosed();
      },
    );
  });

  // @add-grid-meeting-range-and-share @FR15 @add-meeting-share-dialog @FR1 @FR9
  f.Scenario(
    "Opening the dialog again removes the notice",
    ({ Given, When, Then }) => {
      Given("the notice {string} is shown", async (_ctx, notice: string) => {
        await givenDialogOpen({ canShare: false, canCopy: true });
        await chooseShareInDialog();
        expect(await screen.findByText(notice)).toBeInTheDocument();
      });
      When("the user chooses {string}", async (_ctx, name: string) => {
        clickButton(name);
        await screen.findByRole("dialog", { name: DIALOG_NAME });
      });
      Then("the notice is gone and the share dialog is open", () => {
        expect(screen.queryByText(COPIED_NOTICE)).toBeNull();
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    },
  );
});
