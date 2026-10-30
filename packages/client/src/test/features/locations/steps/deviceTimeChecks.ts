// Implements FR8, FR9, FR11 of add-settings-page-and-device-time-location: assertions shared by the device time features.
import { screen, waitFor, within } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { DEVICE_TIME_LIST_TOKEN } from "./deviceTimeQueries";
import type { createDeviceTimeWorld } from "./deviceTimeWorld";

export const OFFSET_DIFFERENCE_SELECTOR = "[data-offset-difference]";

type DeviceTimeWorld = ReturnType<typeof createDeviceTimeWorld>;

const LIST_SEPARATOR = ", ";

export const createDeviceTimeChecks = (world: DeviceTimeWorld) => {
  const markImage = (kind: "here" | "home") =>
    i18n.t(
      kind === "here" ? "locations.hereMarkLabel" : "locations.homeMarkLabel",
    );
  const rowItems = () =>
    within(screen.getByRole("list")).getAllByRole("listitem");
  const expectListIs = (_ctx: unknown, expectedList: string) => {
    const expected = expectedList.split(LIST_SEPARATOR);
    const items = rowItems();
    expect(items).toHaveLength(expected.length);
    expected.forEach((name, index) => {
      if (name === DEVICE_TIME_LIST_TOKEN) {
        expect(items[index]).toBe(world.deviceTimeRow());
        return;
      }
      expect(items[index]).toHaveTextContent(name);
    });
  };
  const expectDeviceTimeIsAt = (_ctx: unknown, position: number) =>
    expect(rowItems().indexOf(world.deviceTimeRow())).toBe(position - 1);
  const expectListIsEmpty = () => expect(screen.queryByRole("list")).toBeNull();
  const expectCardMark = (_ctx: unknown, city: string, kind: "here" | "home") =>
    expect(
      within(world.cardOf(city)).getByRole("img", { name: markImage(kind) }),
    ).toBeInTheDocument();
  const expectDeviceTimeShows = async (
    text: string,
    row = world.deviceTimeRow,
  ) => {
    await waitFor(() => expect(within(row()).getByText(text)).toBeVisible());
  };
  const expectMetaLine = async (_ctx: unknown, meta: string) =>
    expectDeviceTimeShows(meta);
  const expectNoOffsetDifference = () =>
    expect(
      world.deviceTimeRow().querySelector(OFFSET_DIFFERENCE_SELECTOR),
    ).toBeNull();
  const expectCardDifference = (_ctx: unknown, city: string, label: string) =>
    expect(
      world.cardOf(city).querySelector(OFFSET_DIFFERENCE_SELECTOR),
    ).toHaveTextContent(label);
  const expectCardTime = (_ctx: unknown, city: string, time: string) =>
    expect(within(world.cardOf(city)).getByText(time)).toBeVisible();

  return {
    markImage,
    expectListIs,
    expectDeviceTimeIsAt,
    expectListIsEmpty,
    expectCardMark,
    expectDeviceTimeShows,
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
