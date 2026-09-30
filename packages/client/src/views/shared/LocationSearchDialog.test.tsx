// Verifies FR5–FR8, FR15, UX1–UX3 of add-locations-via-search.
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { CitySearchStatus } from "@/controller";
import {
  addedTokyo,
  kolkata,
  renderDialog,
} from "./locationSearchDialogFixtures";

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
});
