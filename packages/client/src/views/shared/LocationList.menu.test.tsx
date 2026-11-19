// Verifies FR11, NFR-A2 of set-home-location-and-show-differences (D7, D8): focus after menu actions.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import type { LocationRow } from "@/presenter";
import { ignoreWallTime } from "@/test/ignoreWallTime";
import { removeLocationThroughMenu } from "@/test/removeLocationThroughMenu";
import { ALMATY_TRACK } from "./dayTrackFixture";
import { LocationList } from "./LocationList";

const buildRow = (cityLabel: string): LocationRow => ({
  id: cityLabel.toLowerCase(),
  cityLabel,
  countryName: "",
  utcOffsetLabel: "",
  zoneAbbreviationLabel: "",
  zoneLineParts: [],
  offsetDifferenceLabel: "",
  offsetDifferenceAccessibleLabel: "",
  localTimeLabel: "10:30",
  localTimeParts: { digits: "10:30", dayPeriodMarker: "" },
  localDateLabel: "Sun, Mar 8",
  localIsoDate: "2026-03-08",
  wallTimeInputLabel: "",
  dayTrack: ALMATY_TRACK,
});

function renderList(onSetHome = vi.fn(), onRemove = vi.fn()) {
  render(
    <LocationList
      rows={["Almaty", "Moscow"].map(buildRow)}
      onRemove={onRemove}
      onSetHome={onSetHome}
      onMove={vi.fn()}
      onSelectTrackFraction={vi.fn()}
      onMoveTrack={vi.fn()}
      onConfirmWallTime={ignoreWallTime}
    />,
  );
  return { onSetHome, onRemove };
}

describe("LocationList location menu", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should keep focus on the menu button of the row after a home change", async () => {
    const { onSetHome } = renderList();
    await userEvent.click(
      screen.getByRole("button", { name: "Actions for Moscow" }),
    );

    await userEvent.click(screen.getByRole("menuitem", { name: "Make home" }));

    expect(onSetHome).toHaveBeenCalledWith("moscow");
    expect(
      screen.getByRole("button", { name: "Actions for Moscow" }),
    ).toHaveFocus();
  });

  it("should call onRemove for the removed row only", async () => {
    const { onRemove } = renderList();

    await removeLocationThroughMenu("Almaty");

    expect(onRemove).toHaveBeenCalledWith("almaty");
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("should start no reorder when the menu opens", async () => {
    renderList();

    await userEvent.click(
      screen.getByRole("button", { name: "Actions for Moscow" }),
    );

    expect(
      screen
        .getAllByRole("listitem")
        .map((item) => item.textContent?.slice(0, 6)),
    ).toEqual(["Almaty", "Moscow"]);
  });
});

// Verifies FR16, NFR-A3 of redesign-cards-grid-and-day-palettes: the moves of the location menu.
describe("LocationList menu moves", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it.each([
    ["Moscow", "Move up", -1],
    ["Almaty", "Move down", 1],
  ])(
    "should move %s with %s by one place and keep the focus on its menu button",
    async (city, itemName, step) => {
      const onMove = vi.fn();
      const onMovedByMenu = vi.fn();
      const rows = ["Almaty", "Moscow"].map(buildRow);
      const { rerender } = render(
        <LocationList
          rows={rows}
          onRemove={vi.fn()}
          onSetHome={vi.fn()}
          onMove={onMove}
          onMovedByMenu={onMovedByMenu}
          onSelectTrackFraction={vi.fn()}
          onMoveTrack={vi.fn()}
          onConfirmWallTime={ignoreWallTime}
        />,
      );
      const rowIndex = rows.findIndex((row) => row.cityLabel === city);

      await userEvent.click(
        screen.getByRole("button", { name: `Actions for ${city}` }),
      );
      await userEvent.click(screen.getByRole("menuitem", { name: itemName }));

      expect(onMove).toHaveBeenCalledWith(city.toLowerCase(), rowIndex + step);
      expect(onMovedByMenu).toHaveBeenCalledWith(
        city.toLowerCase(),
        rowIndex + step,
      );
      rerender(
        <LocationList
          rows={[...rows].reverse()}
          onRemove={vi.fn()}
          onSetHome={vi.fn()}
          onMove={onMove}
          onSelectTrackFraction={vi.fn()}
          onMoveTrack={vi.fn()}
          onConfirmWallTime={ignoreWallTime}
        />,
      );
      expect(
        screen.getAllByRole("button", { name: /^Actions for / })[
          rowIndex + step
        ],
      ).toHaveFocus();
    },
  );

  it("should disable Move up on the first row and Move down on the last", async () => {
    renderList();

    await userEvent.click(
      screen.getByRole("button", { name: "Actions for Almaty" }),
    );

    expect(screen.getByRole("menuitem", { name: "Move up" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(
      screen.getByRole("menuitem", { name: "Move down" }),
    ).not.toHaveAttribute("aria-disabled");
  });
});
