// Verifies FR2, NFR-R1 of add-unix-time-converter-tool: the tools group is one compact row.
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";

const { Then } = createBdd(test);

const TOOLS_GROUP_NAME = /^(Tools|Инструменты)$/;
const GROUP_ROLE = "group";

const toolsGroupOf = (page: Page) =>
  page.getByRole(GROUP_ROLE, { name: TOOLS_GROUP_NAME });

Then(
  "the caption and the toggles of the tools group share one row",
  async ({ locationsWorld }) => {
    const group = toolsGroupOf(locationsWorld.page);
    const captionBox = await group.locator("span").first().boundingBox();
    const togglesBox = await group.getByRole("button").first().boundingBox();
    if (captionBox === null || togglesBox === null) throw new Error("no box");
    expect(captionBox.y).toBeLessThan(togglesBox.y + togglesBox.height);
    expect(togglesBox.y).toBeLessThan(captionBox.y + captionBox.height);
    expect(captionBox.x).toBeLessThan(togglesBox.x);
  },
);

Then(
  "the tools group is at most {int} px high",
  async ({ locationsWorld }, maxHeight: number) => {
    const box = await toolsGroupOf(locationsWorld.page).boundingBox();
    expect(box?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(
      maxHeight,
    );
  },
);
