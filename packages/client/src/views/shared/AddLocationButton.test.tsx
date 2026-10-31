// Verifies FR17 of add-locations-via-search.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createRef } from "react";
import { ADD_LOCATION_BUTTON_ID } from "@/constants";
import { AddLocationButton } from "./AddLocationButton";

describe("AddLocationButton", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should offer the Add location action and emit clicks", async () => {
    const onClick = vi.fn();
    render(<AddLocationButton onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "Add location" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should forward its ref to the button element", () => {
    const buttonRef = createRef<HTMLButtonElement>();
    render(<AddLocationButton ref={buttonRef} />);
    expect(buttonRef.current).toBe(screen.getByRole("button"));
  });
});

describe("AddLocationButton shortcut announcement", () => {
  // Verifies NFR-A1 of open-location-search-with-slash-shortcut
  it("should announce the slash shortcut without changing its name", async () => {
    await i18n.changeLanguage("en");
    render(<AddLocationButton />);
    expect(
      screen.getByRole("button", { name: "Add location" }),
    ).toHaveAttribute("aria-keyshortcuts", "/");
  });
});

// Verifies FR2, FR16 of add-settings-page-and-device-time-location (D11).
describe("AddLocationButton header label", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should carry the id the cards view focuses after the last removal", () => {
    render(<AddLocationButton />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "id",
      ADD_LOCATION_BUTTON_ID,
    );
  });

  it("should show the short label only from the wide breakpoint", () => {
    render(<AddLocationButton />);
    const shortLabel = screen.getByText("Add");
    expect(shortLabel.tagName).toBe("SPAN");
    expect(shortLabel).toHaveClass("hidden", "md:inline");
  });

  it("should keep the accessible name Add location in both languages of the label", async () => {
    await i18n.changeLanguage("ru");
    render(<AddLocationButton />);
    expect(
      screen.getByRole("button", { name: "Добавить место" }),
    ).toHaveTextContent("Добавить");
  });
});
