// Verifies FR8, NFR-A5, UX3 of reorder-locations-by-drag-and-drop.
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import en from "@/locales/en.json";
import ru from "@/locales/ru.json";
import { DragHandle } from "./DragHandle";

const sortableAttributes = {
  role: "button",
  tabIndex: 0,
  "aria-disabled": false,
  "aria-pressed": undefined,
  "aria-roledescription": "sortable",
  "aria-describedby": "instructions",
};

const renderHandle = () =>
  render(
    <DragHandle
      city="Moscow"
      attributes={sortableAttributes}
      listeners={undefined}
    />,
  );

describe("DragHandle", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should be a button named after the city", () => {
    renderHandle();
    expect(
      screen.getByRole("button", { name: "Move Moscow" }),
    ).toBeInTheDocument();
  });

  it("should be named in Russian in the Russian interface", async () => {
    await i18n.changeLanguage("ru");
    renderHandle();
    expect(
      screen.getByRole("button", {
        name: ru.locations.moveLocation.replace("{{city}}", "Moscow"),
      }),
    ).toBeInTheDocument();
  });

  it("should describe its role from the locale", () => {
    renderHandle();
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-roledescription",
      en.locations.reorderRoleDescription,
    );
  });

  it("should hide its icon from assistive technology", () => {
    renderHandle();
    expect(screen.getByRole("button").querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it.each(["min-h-11", "min-w-11", "touch-none"])(
    "should have the class %s",
    (className) => {
      renderHandle();
      expect(screen.getByRole("button")).toHaveClass(className);
    },
  );
});
