// Verifies FR4, FR7, UX1, NFR-A1 of add-geonames-city-source (D9): the region on the result row.
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocationSearchResults } from "./LocationSearchResults";
import {
  moscow,
  resultsWithRegions,
  springfieldIllinois,
} from "./locationSearchDialogFixtures";

const renderResults = (results = resultsWithRegions) =>
  render(
    <LocationSearchResults
      listboxId="results"
      optionIdPrefix="option-"
      results={results}
      activeIndex={-1}
      onChoose={vi.fn()}
    />,
  );

describe("LocationSearchResults regions", () => {
  it("should put the region in the accessible name of the option", () => {
    renderResults();
    expect(
      screen.getByRole("option", {
        name: /Springfield.*Illinois, United States/,
      }),
    ).toBeInTheDocument();
  });

  it("should tell three Springfield options apart", () => {
    renderResults();
    const names = screen
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(new Set(names).size).toBe(3);
  });

  it("should render the country alone for a result without a region", () => {
    renderResults([moscow]);
    expect(screen.getByRole("option")).toHaveTextContent("MoscowRussia");
    expect(screen.getByRole("option")).not.toHaveTextContent(",");
  });

  it("should render the region alone when the country name is empty", () => {
    renderResults([{ ...springfieldIllinois, countryName: "" }]);
    expect(screen.getByRole("option")).toHaveTextContent("SpringfieldIllinois");
  });

  it("should keep two namesakes of one zone as separate options", () => {
    renderResults();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });
});
