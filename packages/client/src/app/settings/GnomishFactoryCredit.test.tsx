// Verifies FR1, FR2, FR3, NFR-A1 of add-gnomish-factory-credit (D2, D4).
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import { GNOMISH_FACTORY_LANDING_URL } from "@/constants";
import { GnomishFactoryCredit } from "./GnomishFactoryCredit";

describe("GnomishFactoryCredit", () => {
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it.each([
    ["en", "Built with Gnomish Factory"],
    ["ru", "Создано с помощью Гномской фабрики"],
  ])(
    "should render one link named by the whole credit text in %s",
    async (language, creditText) => {
      await i18n.changeLanguage(language);
      render(<GnomishFactoryCredit />);
      const link = screen.getByRole("link", { name: creditText });
      expect(link.textContent).toBe(creditText);
    },
  );

  it("should point the link at the Gnomish Factory landing page", async () => {
    await i18n.changeLanguage("en");
    render(<GnomishFactoryCredit />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", GNOMISH_FACTORY_LANDING_URL);
    expect(GNOMISH_FACTORY_LANDING_URL).toBe(
      "https://oinsio.github.io/gnomish-factory/",
    );
  });

  it("should open the landing page in a new tab without an opener", async () => {
    await i18n.changeLanguage("en");
    render(<GnomishFactoryCredit />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });
});
