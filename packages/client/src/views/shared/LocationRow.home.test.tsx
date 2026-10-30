// Verifies FR7, FR11, NFR-A3, UX1, UX2 of set-home-location-and-show-differences (D3, D7, D8).

import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  LocationMarkKind,
  type LocationRow as LocationRowModel,
} from "@/presenter";
import { ignoreWallTime } from "@/test/ignoreWallTime";
import { ALMATY_TRACK } from "./dayTrackFixture";
import { LocationRow } from "./LocationRow";

const row: LocationRowModel = {
  id: "moscow",
  cityLabel: "Moscow",
  countryName: "Russia",
  utcOffsetLabel: "UTC+3",
  offsetDifferenceLabel: "−2 h",
  offsetDifferenceAccessibleLabel: "2 hours behind",
  localTimeLabel: "10:30",
  localDateLabel: "Sun, Mar 8",
  localIsoDate: "2026-03-08",
  wallTimeInputLabel: "",
  dayTrack: ALMATY_TRACK,
};
const homeMark = {
  kind: LocationMarkKind.HOME,
  accessibleLabel: "Home location",
  caption: "",
};
const hereMark = {
  kind: LocationMarkKind.HERE,
  accessibleLabel: "You are here",
  caption: "here",
};

function renderRow(overrides: Partial<LocationRowModel> = {}) {
  const onRemove = vi.fn();
  const onSetHome = vi.fn();
  render(
    <DndContext>
      <SortableContext items={[row.id]}>
        <ul>
          <LocationRow
            row={{ ...row, ...overrides }}
            onRemove={onRemove}
            onSetHome={onSetHome}
            onSelectTrackFraction={vi.fn()}
            onMoveTrack={vi.fn()}
            onConfirmWallTime={ignoreWallTime}
            isReorderable
            prefersReducedMotion={false}
          />
        </ul>
      </SortableContext>
    </DndContext>,
  );
  return { onRemove, onSetHome };
}

const openMenu = () =>
  userEvent.click(screen.getByRole("button", { name: "Actions for Moscow" }));

describe("LocationRow location menu", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should offer Make home and Remove in the menu of a row that is not home", async () => {
    renderRow();

    await openMenu();

    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Make home", "Remove"]);
  });

  it("should offer Clear home and Remove in the menu of the home row", async () => {
    renderRow({ mark: homeMark });

    await openMenu();

    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Clear home", "Remove"]);
  });

  it("should offer no home item for a row without a known zone", async () => {
    renderRow({ dayTrack: undefined });

    await openMenu();

    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Remove"]);
  });

  it("should call onSetHome with the row id for Make home", async () => {
    const { onSetHome } = renderRow();
    await openMenu();

    await userEvent.click(screen.getByRole("menuitem", { name: "Make home" }));

    expect(onSetHome).toHaveBeenCalledWith("moscow");
  });

  it("should call onSetHome with null for Clear home", async () => {
    const { onSetHome } = renderRow({ mark: homeMark });
    await openMenu();

    await userEvent.click(screen.getByRole("menuitem", { name: "Clear home" }));

    expect(onSetHome).toHaveBeenCalledWith(null);
  });

  it("should call onRemove with the row id for Remove", async () => {
    const { onRemove } = renderRow();
    await openMenu();

    await userEvent.click(screen.getByRole("menuitem", { name: "Remove" }));

    expect(onRemove).toHaveBeenCalledWith("moscow");
  });

  it("should have no remove button outside the menu", () => {
    renderRow();

    expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull();
  });
});

describe("LocationRow offset difference and marks", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should show the difference after the city and before the here caption, hidden from assistive technology", () => {
    renderRow({ mark: hereMark });

    const difference = screen.getByText("−2 h");
    const city = screen.getByText("Moscow");
    const caption = screen.getByText("here");
    expect(difference).toHaveAttribute("aria-hidden", "true");
    expect(city.compareDocumentPosition(difference)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(difference.compareDocumentPosition(caption)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(difference).toHaveClass("text-sm", "font-semibold");
  });

  it("should name the row by city, mark and difference", () => {
    renderRow({ mark: hereMark });

    expect(
      screen.getByRole("listitem", {
        name: "Moscow You are here 2 hours behind",
      }),
    ).toBeInTheDocument();
  });

  it("should name the row by the city alone without a difference", () => {
    renderRow({
      offsetDifferenceLabel: "",
      offsetDifferenceAccessibleLabel: "",
    });

    expect(
      screen.getByRole("listitem", { name: "Moscow" }),
    ).toBeInTheDocument();
  });

  it("should show the home mark without a caption", () => {
    renderRow({ mark: homeMark, offsetDifferenceLabel: "" });

    expect(
      screen.getByRole("img", { name: "Home location" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("here")).toBeNull();
  });
});
