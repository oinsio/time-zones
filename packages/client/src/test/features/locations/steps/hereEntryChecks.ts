// Implements FR1-FR6, FR10 of show-here-entry-for-device-time: assertions shared by the Here entry features.
import { screen, waitFor, within } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import type { createHereEntryWorld } from "./hereEntryWorld";

export const OFFSET_DIFFERENCE_SELECTOR = "[data-offset-difference]";

type HereEntryWorld = ReturnType<typeof createHereEntryWorld>;

export const createHereEntryChecks = (world: HereEntryWorld) => {
  const markImage = (kind: "here" | "home") =>
    i18n.t(
      kind === "here" ? "locations.hereMarkLabel" : "locations.homeMarkLabel",
    );
  const expectFirstRowIsHereEntry = (_ctx: unknown, zone: string) => {
    const entry = world.hereEntry();
    expect(world.getLocations().hereEntry?.timeZoneId).toBe(zone);
    expect(
      entry.compareDocumentPosition(screen.getByRole("list")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  };
  const expectLocationsInOrder = (_ctx: unknown, cities: string) => {
    const expected = cities.split(", ");
    expect(
      within(screen.getByRole("list"))
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(expected.map((city) => expect.stringContaining(city)));
  };
  const expectNoHereEntry = () => expect(world.hereEntries()).toEqual([]);
  const expectCardMark = (_ctx: unknown, city: string, kind: "here" | "home") =>
    expect(
      within(world.cardOf(city)).getByRole("img", { name: markImage(kind) }),
    ).toBeInTheDocument();
  const expectHereEntryShows = async (
    text: string,
    entry = world.hereEntry,
  ) => {
    await waitFor(() => expect(within(entry()).getByText(text)).toBeVisible());
  };
  const expectMetaLine = async (_ctx: unknown, meta: string) =>
    expectHereEntryShows(meta);
  const expectNoOffsetDifference = () =>
    expect(
      world.hereEntry().querySelector(OFFSET_DIFFERENCE_SELECTOR),
    ).toBeNull();
  const expectCardDifference = (_ctx: unknown, city: string, label: string) =>
    expect(
      world.cardOf(city).querySelector(OFFSET_DIFFERENCE_SELECTOR),
    ).toHaveTextContent(label);
  const expectCardTime = (_ctx: unknown, city: string, time: string) =>
    expect(within(world.cardOf(city)).getByText(time)).toBeVisible();

  return {
    markImage,
    expectFirstRowIsHereEntry,
    expectLocationsInOrder,
    expectNoHereEntry,
    expectCardMark,
    expectHereEntryShows,
    expectMetaLine,
    expectNoOffsetDifference,
    expectCardDifference,
    expectCardTime,
  };
};

/** The open search lists its suggestions. */
export const expectSuggestions = () => {
  expect(
    screen.getByText(i18n.t("locations.suggestionsHeading")),
  ).toBeVisible();
  expect(screen.getAllByRole("option").length).toBeGreaterThan(0);
};
