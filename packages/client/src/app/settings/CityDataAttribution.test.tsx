// Verifies FR13, NFR-A2, UX4 of add-geonames-city-source (D10): the city data credit.
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import { GEONAMES_URL } from "@/constants";
import { CityDataAttribution } from "./CityDataAttribution";

describe("CityDataAttribution", () => {
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it.each([
    ["en", "City data: GeoNames, CC BY 4.0"],
    ["ru", "Данные о городах: GeoNames, CC BY 4.0"],
  ])(
    "should render one link named by the whole text in %s",
    async (language, text) => {
      await i18n.changeLanguage(language);
      render(<CityDataAttribution />);
      const link = screen.getByRole("link", { name: text });
      expect(link.textContent).toBe(text);
      expect(screen.getAllByRole("link")).toHaveLength(1);
    },
  );

  it("should point the link at GeoNames", async () => {
    await i18n.changeLanguage("en");
    render(<CityDataAttribution />);
    expect(screen.getByRole("link")).toHaveAttribute("href", GEONAMES_URL);
    expect(GEONAMES_URL).toBe("https://www.geonames.org/");
  });

  it("should open GeoNames in a new tab without an opener", async () => {
    await i18n.changeLanguage("en");
    render(<CityDataAttribution />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should be at least 44 px tall and use the accent colour", async () => {
    await i18n.changeLanguage("en");
    render(<CityDataAttribution />);
    expect(screen.getByRole("link")).toHaveClass("min-h-11", "text-accent");
  });
});
