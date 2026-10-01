import type { CDPSession, Locator, Page } from "@playwright/test";
import {
  LOCATIONS_WRITE_DEBOUNCE_MS,
  REORDER_TRANSITION_DURATION_MS,
  STORAGE_KEYS,
} from "@/constants";
import { englishLocale } from "../../main_page/steps/englishTexts";
import { listRow } from "./locationsE2eHelpers";

export const MS_PER_SECOND = 1000;
export const DRAG_MOVE_STEP_COUNT = 12;
export const RELEASE_PAST_CENTRE_RATIO = 0.25;
export const SIDEWAYS_DRAG_PX = 40;
export const DOWNWARD_DRAG_PX = 8;
export const TOUCH_SWIPE_DISTANCE_PX = -200;
export const WRITE_SETTLE_MS = LOCATIONS_WRITE_DEBOUNCE_MS * 2;
export const DROP_SETTLE_MS = REORDER_TRANSITION_DURATION_MS * 2;
const WRITE_COUNT_KEY = "locationWriteCount";
const TRANSITION_RUNS_KEY = "reorderTransitionRuns";
const MOVE_PREFIX = englishLocale.locations.moveLocation.replace(
  "{{city}}",
  "",
);
const REMOVE_PREFIX = englishLocale.locations.removeLocation.replace(
  "{{city}}",
  "",
);

export type TransitionRun = {
  handleName: string;
  propertyName: string;
  duration: string;
};

export type Point = { x: number; y: number };

/** The handle of a city's card; `exact` because "Move Moscow" is a substring of "Remove Moscow". */
export const moveHandle = (page: Page, cityName: string) =>
  page.getByRole("button", { name: `${MOVE_PREFIX}${cityName}`, exact: true });

/** A handle by its full accessible name, matched exactly. */
export const handleNamed = (page: Page, handleName: string) =>
  page.getByRole("button", { name: handleName, exact: true });

export const allMoveHandles = (page: Page) =>
  page.getByRole("button", { name: new RegExp(`^${MOVE_PREFIX}`) });

/** City names in list order, read from the remove buttons in DOM order. */
export async function readListOrder(page: Page): Promise<string[]> {
  const removeNames = await page
    .getByRole("button", { name: new RegExp(`^${REMOVE_PREFIX}`) })
    .evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute("aria-label") ?? ""),
    );
  return removeNames.map((name) => name.slice(REMOVE_PREFIX.length));
}

export async function centreOf(locator: Locator): Promise<Point> {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The element has no box");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Counts writes of the locations document, from the first page load. */
export const countLocationWrites = (page: Page) =>
  page.addInitScript(
    ({ storageKey, countKey }) => {
      Reflect.set(window, countKey, 0);
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === storageKey) {
          Reflect.set(window, countKey, Reflect.get(window, countKey) + 1);
        }
        return originalSetItem.call(this, key, value);
      };
    },
    { storageKey: STORAGE_KEYS.LOCATIONS, countKey: WRITE_COUNT_KEY },
  );

export const readLocationWriteCount = (page: Page) =>
  page.evaluate((countKey) => Reflect.get(window, countKey), WRITE_COUNT_KEY);

/** Records `transitionrun` events of list items, from the first page load. */
export const recordTransitionRuns = (page: Page) =>
  page.addInitScript(
    ({ runsKey, movePrefix }) => {
      const runs: unknown[] = [];
      Reflect.set(window, runsKey, runs);
      document.addEventListener(
        "transitionrun",
        (event) => {
          const card = event.target;
          if (!(card instanceof HTMLLIElement)) return;
          const handle = card.querySelector(
            `button[aria-label^="${movePrefix}"]`,
          );
          runs.push({
            handleName: handle?.getAttribute("aria-label") ?? "",
            propertyName: event.propertyName,
            duration: getComputedStyle(card).transitionDuration,
          });
        },
        true,
      );
    },
    { runsKey: TRANSITION_RUNS_KEY, movePrefix: MOVE_PREFIX },
  );

export const readTransitionRuns = (page: Page) =>
  page.evaluate(
    (runsKey) => (Reflect.get(window, runsKey) ?? []) as TransitionRun[],
    TRANSITION_RUNS_KEY,
  );

export const clearTransitionRuns = (page: Page) =>
  page.evaluate((runsKey) => {
    const runs = Reflect.get(window, runsKey) as unknown[] | undefined;
    if (runs) runs.length = 0;
  }, TRANSITION_RUNS_KEY);

export const handleNameOf = (cityName: string) => `${MOVE_PREFIX}${cityName}`;

/** Where to release so the dragged card ends a quarter card past the target's centre. */
export async function releasePointFor(
  page: Page,
  targetCityName: string,
  isAbove: boolean,
): Promise<Point> {
  const targetCard = listRow(page, targetCityName);
  const targetCentre = await centreOf(targetCard);
  const targetBox = await targetCard.boundingBox();
  const overshoot = (targetBox?.height ?? 0) * RELEASE_PAST_CENTRE_RATIO;
  return {
    x: targetCentre.x,
    y: targetCentre.y + (isAbove ? -overshoot : overshoot),
  };
}

export async function dragMouse(page: Page, from: Point, to: Point) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: DRAG_MOVE_STEP_COUNT });
}

export async function startTouch(page: Page): Promise<CDPSession> {
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setTouchEmulationEnabled", { enabled: true });
  return session;
}

export const dispatchTouch = (
  session: CDPSession,
  type: "touchStart" | "touchMove" | "touchEnd",
  point?: Point,
) =>
  session.send("Input.dispatchTouchEvent", {
    type,
    touchPoints: point ? [point] : [],
  });

export async function dragWithFinger(
  session: CDPSession,
  from: Point,
  to: Point,
) {
  await dispatchTouch(session, "touchStart", from);
  for (let step = 1; step <= DRAG_MOVE_STEP_COUNT; step++) {
    const progress = step / DRAG_MOVE_STEP_COUNT;
    await dispatchTouch(session, "touchMove", {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    });
  }
  await dispatchTouch(session, "touchEnd");
}

/** Card, list and neighbour geometry measured before a drag starts. */
export type CardMeasurements = {
  card: NonNullable<Awaited<ReturnType<Locator["boundingBox"]>>>;
  listHeight: number;
  neighbourTop: number;
};
export const measurementsByPage = new WeakMap<Page, CardMeasurements>();

export const measure = async (
  page: Page,
  cityName: string,
  neighbour: string,
) => {
  const card = await listRow(page, cityName).boundingBox();
  const list = await page.getByRole("list").boundingBox();
  const neighbourCard = await listRow(page, neighbour).boundingBox();
  if (!card || !list || !neighbourCard) throw new Error("Nothing to measure");
  return { card, listHeight: list.height, neighbourTop: neighbourCard.y };
};
