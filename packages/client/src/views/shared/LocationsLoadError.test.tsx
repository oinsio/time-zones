// Verifies FR12 of add-locations-via-search.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { LocationsLoadError } from "./LocationsLoadError";

describe("LocationsLoadError", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should show the message as an alert in the danger colour", () => {
    render(<LocationsLoadError onReset={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The saved locations could not be read.",
    );
    expect(screen.getByRole("alert")).toHaveClass("text-danger");
  });

  it("should emit reset when Reset is used", async () => {
    const onReset = vi.fn();
    render(<LocationsLoadError onReset={onReset} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Reset the list" }),
    );
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
