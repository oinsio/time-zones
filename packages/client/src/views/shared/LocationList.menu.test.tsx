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
  offsetDifferenceLabel: "",
  offsetDifferenceAccessibleLabel: "",
  localTimeLabel: "10:30",
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
