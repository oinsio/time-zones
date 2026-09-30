import { expect } from "@playwright/test";
import { test as base } from "playwright-bdd";

const APP_ROOT_URL = ".";
const VIEWPORT_HEIGHT_PX = 800;
const VIEW_ID_ATTRIBUTE = "data-view-id";

/** The view a contract run covers and the viewport that makes AUTO pick it. */
export type ContractViewOptions = {
  contractView: { id: string; viewportWidth: number };
};

/**
 * Test option fixture of the view contract plus `showContractView()`: opens
 * the app at the contract viewport and fails unless the content container
 * carries the contract view's id, so a view AUTO cannot reach fails loudly.
 * Implements D12 of add-locations-via-search (ADR-0005). Imports nothing
 * through `@/`: the Playwright config imports its type.
 */
export const test = base.extend<
  ContractViewOptions & {
    showContractView: () => Promise<void>;
  }
>({
  contractView: [{ id: "", viewportWidth: 0 }, { option: true }],
  showContractView: async ({ page, contractView }, use) => {
    await use(async () => {
      await page.setViewportSize({
        width: contractView.viewportWidth,
        height: VIEWPORT_HEIGHT_PX,
      });
      await page.goto(APP_ROOT_URL);
      await expect(page.locator(`[${VIEW_ID_ATTRIBUTE}]`)).toHaveAttribute(
        VIEW_ID_ATTRIBUTE,
        contractView.id,
      );
    });
  },
});
