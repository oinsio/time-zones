// Verifies FR17 of add-locations-via-search.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createRef } from "react";
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
