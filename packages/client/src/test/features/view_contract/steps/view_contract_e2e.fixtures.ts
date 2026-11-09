import { expect } from "@playwright/test";
import { test as base } from "playwright-bdd";

const APP_ROOT_URL = ".";
const VIEWPORT_WIDTH_PX = 1280;
const VIEWPORT_HEIGHT_PX = 800;
const VIEW_ID_ATTRIBUTE = "data-view-id";

/** The part of the browser's `localStorage` the init script uses; this file is type-checked without DOM types. */
type BrowserStorageHolder = {
  localStorage: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
  };
};

/**
 * The view a contract run covers and the preferences document that makes the
 * app show it (the stored view mode, independent of the viewport width).
 */
export type ContractViewOptions = {
  contractView: {
    id: string;
    preferencesStorageKey: string;
    preferencesDocument: string;
  };
};

/**
 * Test option fixture of the view contract plus `showContractView()`: stores
 * the view mode of the view under contract when no preferences document
 * exists, opens the app at a fixed viewport and fails unless the content
 * container carries the contract view's id.
 * Implements D12 of add-locations-via-search (ADR-0005). Imports nothing
 * through `@/`: the Playwright config imports its type.
 * Implements FR8 of add-view-mode-setting-and-grid-skeleton (D5).
 */
export const test = base.extend<
  ContractViewOptions & {
    showContractView: () => Promise<void>;
  }
>({
  contractView: [
    { id: "", preferencesStorageKey: "", preferencesDocument: "" },
    { option: true },
  ],
  showContractView: async ({ page, contractView }, use) => {
    await use(async () => {
      await page.addInitScript(
        ({ storageKey, document }) => {
          const { localStorage } =
            globalThis as unknown as BrowserStorageHolder;
          if (localStorage.getItem(storageKey) === null) {
            localStorage.setItem(storageKey, document);
          }
        },
        {
          storageKey: contractView.preferencesStorageKey,
          document: contractView.preferencesDocument,
        },
      );
      await page.setViewportSize({
        width: VIEWPORT_WIDTH_PX,
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
