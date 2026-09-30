// Verifies FR5–FR8, FR15, UX1–UX3 of add-locations-via-search.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { useState } from "react";
import { CitySearchStatus } from "@/controller";
import type { PresentedSearchResult } from "@/presenter";
import { LocationSearchDialog } from "./LocationSearchDialog";

const moscow: PresentedSearchResult = {
  timeZoneId: "Europe/Moscow",
  cityName: "Moscow",
  countryCode: "RU",
  countryName: "Russia",
  isAdded: false,
};
const kolkata: PresentedSearchResult = {
  timeZoneId: "Asia/Kolkata",
  cityName: "Kolkata",
  countryCode: "IN",
  countryName: "India",
  matchedAbbreviation: "IST",
  isAdded: false,
};
const berlin: PresentedSearchResult = {
  timeZoneId: "Europe/Berlin",
  cityName: "Berlin",
  countryCode: "DE",
  countryName: "Germany",
  isAdded: false,
};
const addedTokyo: PresentedSearchResult = {
  timeZoneId: "Asia/Tokyo",
  cityName: "Tokyo",
  countryCode: "JP",
  countryName: "Japan",
  isAdded: true,
};

type Overrides = Partial<Parameters<typeof LocationSearchDialog>[0]>;

const callbacks = () => ({
  onQueryChange: vi.fn(),
  onChoose: vi.fn(),
  onRetry: vi.fn(),
  onClose: vi.fn(),
});

const renderDialog = (overrides: Overrides = {}) => {
  const handlers = callbacks();
  render(
    <LocationSearchDialog
      isOpen
      status={CitySearchStatus.READY}
      presentedResults={[moscow, kolkata]}
      query=""
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
};

describe("LocationSearchDialog", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should render nothing while closed", () => {
    renderDialog({ isOpen: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should show the suggestions heading for an empty query", () => {
    renderDialog();
    expect(screen.getByText("Popular locations")).toBeInTheDocument();
  });

  it("should not show the suggestions heading for a typed query", () => {
    renderDialog({ query: "Mos" });
    expect(screen.queryByText("Popular locations")).not.toBeInTheDocument();
  });

  it("should emit each typed character", async () => {
    const { onQueryChange } = renderDialog();
    await userEvent.type(screen.getByRole("combobox"), "Mo");
    expect(onQueryChange.mock.calls).toEqual([["M"], ["o"]]);
  });

  it("should show the no-results message and hint for a query without results", () => {
    renderDialog({ query: "zzz", presentedResults: [] });
    expect(screen.getByText("Nothing found for this search.")).toBeVisible();
    expect(
      screen.getByText("Try a city, a country or an abbreviation such as IST."),
    ).toBeVisible();
  });

  it("should show the loading placeholder while the data loads", () => {
    renderDialog({ status: CitySearchStatus.LOADING, presentedResults: [] });
    expect(screen.getByText("Loading the search…")).toBeVisible();
  });

  it("should show the error with Retry when the data failed to load", async () => {
    const { onRetry } = renderDialog({
      status: CitySearchStatus.FAILED,
      presentedResults: [],
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The search could not be loaded.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("should show the matched abbreviation next to the city", () => {
    renderDialog({ query: "IST", presentedResults: [kolkata] });
    expect(screen.getByRole("option")).toHaveTextContent("Kolkata");
    expect(screen.getByRole("option")).toHaveTextContent("IST");
  });

  it("should mark an added result and emit nothing when it is chosen", async () => {
    const { onChoose } = renderDialog({ presentedResults: [addedTokyo] });
    const option = screen.getByRole("option");
    expect(option).toHaveTextContent("Added");
    expect(option).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(option);
    expect(onChoose).not.toHaveBeenCalled();
  });

  it("should emit the chosen result when a result is clicked", async () => {
    const { onChoose } = renderDialog();
    await userEvent.click(screen.getByRole("option", { name: /Kolkata/ }));
    expect(onChoose).toHaveBeenCalledWith(kolkata);
  });

  it("should choose the active result with Enter after arrow navigation", async () => {
    const { onChoose } = renderDialog();
    await userEvent.type(screen.getByRole("combobox"), "{ArrowDown}{Enter}");
    expect(onChoose).toHaveBeenCalledWith(kolkata);
  });

  it("should move the active option back with ArrowUp", async () => {
    const { onChoose } = renderDialog();
    await userEvent.type(
      screen.getByRole("combobox"),
      "{ArrowDown}{ArrowUp}{Enter}",
    );
    expect(onChoose).toHaveBeenCalledWith(moscow);
  });

  it("should move one option at a time with ArrowDown", async () => {
    const { onChoose } = renderDialog({
      presentedResults: [moscow, kolkata, berlin],
    });
    await userEvent.type(screen.getByRole("combobox"), "{ArrowDown}{Enter}");
    expect(onChoose).toHaveBeenCalledWith(kolkata);
  });

  it("should stay on the last option when ArrowDown goes past it", async () => {
    const { onChoose } = renderDialog({
      presentedResults: [moscow, kolkata, berlin],
    });
    await userEvent.type(
      screen.getByRole("combobox"),
      "{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{Enter}",
    );
    expect(onChoose).toHaveBeenCalledWith(berlin);
  });

  it("should stay on the first option when ArrowUp goes past it", async () => {
    const { onChoose } = renderDialog();
    await userEvent.type(screen.getByRole("combobox"), "{ArrowUp}{Enter}");
    expect(onChoose).toHaveBeenCalledWith(moscow);
  });

  it("should emit nothing when Enter is pressed on an added result", async () => {
    const { onChoose } = renderDialog({ presentedResults: [addedTokyo] });
    await userEvent.type(screen.getByRole("combobox"), "{Enter}");
    expect(onChoose).not.toHaveBeenCalled();
  });

  it("should emit nothing when Enter is pressed without results", async () => {
    const { onChoose } = renderDialog({ query: "zzz", presentedResults: [] });
    await userEvent.type(screen.getByRole("combobox"), "{Enter}");
    expect(onChoose).not.toHaveBeenCalled();
  });

  it("should point the combobox at the active option", async () => {
    renderDialog();
    const combobox = screen.getByRole("combobox");
    const [firstOption] = screen.getAllByRole("option");
    expect(combobox).toHaveAttribute("aria-activedescendant", firstOption.id);
    expect(combobox).toHaveAttribute(
      "aria-controls",
      screen.getByRole("listbox").id,
    );
  });

  it("should announce the result count politely for a typed query", () => {
    renderDialog({ query: "o" });
    expect(screen.getByText("2 results")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("should emit close when Esc is pressed", async () => {
    const { onClose } = renderDialog();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should emit close when the Close action is used", async () => {
    const { onClose } = renderDialog();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // NFR-A2: the query field has focus when the search opens.
  it("should focus the query field when it opens", () => {
    renderDialog();
    expect(screen.getByRole("combobox")).toHaveFocus();
  });

  it("should keep the typed text in the field", () => {
    function Harness() {
      const [query, setQuery] = useState("");
      return (
        <LocationSearchDialog
          isOpen
          status={CitySearchStatus.READY}
          presentedResults={[]}
          query={query}
          onQueryChange={setQuery}
          onChoose={vi.fn()}
          onRetry={vi.fn()}
          onClose={vi.fn()}
        />
      );
    }
    render(<Harness />);
    return userEvent
      .type(screen.getByRole("combobox"), "Mos")
      .then(() => expect(screen.getByRole("combobox")).toHaveValue("Mos"));
  });
});
