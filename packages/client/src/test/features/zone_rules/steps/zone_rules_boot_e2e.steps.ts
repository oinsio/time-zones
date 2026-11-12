// Implements FR10, NFR-P2 of add-zone-rules-from-iana (design D2, D3): the zone rules asset in a real browser.
import type { Response } from "@playwright/test";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";

const { Given, When, Then } = createBdd(test);

const ZONE_RULES_URL_PATTERN = /\/zone-rules-[^/]+\.json$/;
const ENTRY_CHUNK_URL_PATTERN = /\/assets\/main-[^/]+\.js$/;
const CONSOLE_ERROR_TYPE = "error";
const CLOCK_TIME_PATTERN = /\d{1,2}:\d{2}/;
const MAIN_ROLE = "main";

type PageEvent = { kind: "request" | "finished"; url: string };

/** What a scenario records about its page, keyed by the scenario's page. */
const eventsByPage = new WeakMap<object, PageEvent[]>();
const consoleErrorsByPage = new WeakMap<object, string[]>();
const zoneRulesResponsesByPage = new WeakMap<object, Response[]>();

const readEvents = (page: object) => eventsByPage.get(page) ?? [];
const readConsoleErrors = (page: object) => consoleErrorsByPage.get(page) ?? [];

// Verifies NFR-P2 of add-zone-rules-from-iana: records the order of requests and finished responses.
Given("the requests of the page are recorded", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const events: PageEvent[] = [];
  eventsByPage.set(page, events);
  page.on("request", (pageRequest) =>
    events.push({ kind: "request", url: pageRequest.url() }),
  );
  page.on("requestfinished", (pageRequest) =>
    events.push({ kind: "finished", url: pageRequest.url() }),
  );
});

Given("the console of the page is recorded", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const errors: string[] = [];
  const responses: Response[] = [];
  consoleErrorsByPage.set(page, errors);
  zoneRulesResponsesByPage.set(page, responses);
  page.on("console", (message) => {
    if (message.type() === CONSOLE_ERROR_TYPE) errors.push(message.text());
  });
  page.on("response", (response) => {
    if (ZONE_RULES_URL_PATTERN.test(new URL(response.url()).pathname)) {
      responses.push(response);
    }
  });
});

Given("the zone rules asset cannot be loaded", async ({ locationsWorld }) => {
  await locationsWorld.page.route(ZONE_RULES_URL_PATTERN, (route) =>
    route.abort(),
  );
});

Then(
  "the zone rules asset was requested once, before the entry chunk finished loading",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(page.getByRole(MAIN_ROLE)).toBeVisible();
    const events = readEvents(page);
    const zoneRulesRequests = events.filter(
      (event) =>
        event.kind === "request" &&
        ZONE_RULES_URL_PATTERN.test(new URL(event.url).pathname),
    );
    expect(zoneRulesRequests).toHaveLength(1);
    const zoneRulesRequestIndex = events.indexOf(zoneRulesRequests[0]);
    const entryChunkFinishedIndex = events.findIndex(
      (event) =>
        event.kind === "finished" &&
        ENTRY_CHUNK_URL_PATTERN.test(new URL(event.url).pathname),
    );
    expect(entryChunkFinishedIndex).toBeGreaterThan(zoneRulesRequestIndex);
  },
);

When(
  "the user reopens the app without a network connection",
  async ({ locationsWorld }) => {
    await locationsWorld.page.context().setOffline(true);
    await locationsWorld.page.reload();
  },
);

Then(
  "the {string} card shows a time",
  async ({ locationsWorld }, cityName: string) => {
    await expect(listRow(locationsWorld.page, cityName)).toContainText(
      CLOCK_TIME_PATTERN,
    );
  },
);

Then(
  "the zone rules asset is served from the service worker's precache",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(page.getByRole(MAIN_ROLE)).toBeVisible();
    const responses = zoneRulesResponsesByPage.get(page) ?? [];
    expect(responses.length).toBeGreaterThan(0);
    expect(responses.every((response) => response.fromServiceWorker())).toBe(
      true,
    );
  },
);

Then("no zone rules load failure is logged", async ({ locationsWorld }) => {
  await expect(locationsWorld.page.getByRole(MAIN_ROLE)).toBeVisible();
  expect(readConsoleErrors(locationsWorld.page)).toEqual([]);
});

Then(
  "the main page is shown with the {string} card",
  async ({ locationsWorld }, cityName: string) => {
    const { page } = locationsWorld;
    await expect(page.getByRole(MAIN_ROLE)).toBeVisible();
    await expect(listRow(page, cityName)).toBeVisible();
  },
);

Then("the failure is logged", async ({ locationsWorld }) => {
  await expect
    .poll(() => readConsoleErrors(locationsWorld.page).length)
    .toBeGreaterThan(0);
});
