// Implements FR1, FR9, NFR-A1–NFR-A3 of add-meeting-share-dialog: browser stubs and locators of the share dialog in a real browser.
import type { Locator, Page } from "@playwright/test";

export const SHARED_TEXT_KEY = "sharedMeetingData";
const SHARE_MEETING_NAME = /^(Share meeting|Поделиться встречей)$/;
const SHARE_BUTTON_NAME = /^(Share|Поделиться)$/;
const CLOSE_BUTTON_NAME = /^(Close|Закрыть)$/;
export const MIN_TOUCH_TARGET_PX = 44;
export const MAX_TAB_STOPS = 60;

export type BrowserBehaviour = {
  share: "works" | "closed" | "missing";
  hasClipboard: boolean;
};

/** Replaces `navigator.share` and `navigator.clipboard` before the app starts. */
export const stubBrowser = (page: Page, behaviour: BrowserBehaviour) =>
  page.addInitScript(
    ({ stubbed, key }) => {
      const define = (name: string, value: unknown) =>
        Object.defineProperty(navigator, name, { value, configurable: true });
      if (stubbed.share === "missing") define("share", undefined);
      else {
        define("share", async (data: unknown) => {
          Reflect.set(window, key, data);
          if (stubbed.share === "closed") {
            throw new DOMException("closed", "AbortError");
          }
        });
      }
      if (!stubbed.hasClipboard) define("clipboard", undefined);
    },
    { stubbed: behaviour, key: SHARED_TEXT_KEY },
  );

export const readShared = (page: Page) =>
  page.evaluate(
    (key) => Reflect.get(window, key) as Record<string, unknown> | undefined,
    SHARED_TEXT_KEY,
  );

export const shareMeetingButtonOf = (page: Page) =>
  page.getByRole("button", { name: SHARE_MEETING_NAME });
export const shareDialogOf = (page: Page) =>
  page.getByRole("dialog", { name: SHARE_MEETING_NAME });
export const dialogShareButtonOf = (page: Page) =>
  shareDialogOf(page).getByRole("button", { name: SHARE_BUTTON_NAME });
export const dialogCloseButtonOf = (page: Page) =>
  shareDialogOf(page).getByRole("button", { name: CLOSE_BUTTON_NAME });
export const languageButtonOf = (page: Page) =>
  shareDialogOf(page).getByRole("button", {
    name: /^(Язык приглашения|Language of the invitation): /,
  });
export const pinOf = (page: Page) =>
  shareDialogOf(page).getByRole("button", {
    name: /^(Запомнить язык приглашения|Remember the share language)$/,
  });
export const checkboxesOf = (page: Page) =>
  shareDialogOf(page).getByRole("checkbox");
export const zoneLabelToggleOf = (page: Page, name: RegExp) =>
  shareDialogOf(page)
    .getByRole("group", {
      name: /^(Обозначение часового пояса|Timezone label)$/,
    })
    .getByRole("button", { name });

/** The pointer targets the layout requirement names, in the order of the dialog. */
export const pointerTargetsOf = (page: Page): Locator[] => [
  checkboxesOf(page).first(),
  languageButtonOf(page),
  pinOf(page),
  zoneLabelToggleOf(page, /^(Аббревиатура|Abbreviation)$/),
  zoneLabelToggleOf(page, /^(Смещение UTC|UTC offset)$/),
  dialogCloseButtonOf(page),
  dialogShareButtonOf(page),
];
