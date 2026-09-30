// Verifies D10, NFR-R1, UX5 of add-locations-via-search.
import { render, screen } from "@testing-library/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./dialog";

const renderOpenDialog = () =>
  render(
    <Dialog open>
      <DialogContent>
        <DialogTitle>Add a location</DialogTitle>
        <DialogDescription>Search for a place</DialogDescription>
      </DialogContent>
    </Dialog>,
  );

describe("Dialog", () => {
  it("should name the dialog by its title", () => {
    renderOpenDialog();
    expect(
      screen.getByRole("dialog", { name: "Add a location" }),
    ).toBeInTheDocument();
  });

  it.each(["bg-surface", "border-border", "text-foreground"])(
    "should colour the content with the %s token",
    (tokenClass) => {
      renderOpenDialog();
      expect(screen.getByRole("dialog")).toHaveClass(tokenClass);
    },
  );

  it("should fill the screen below the sm breakpoint and center from it", () => {
    renderOpenDialog();
    expect(screen.getByRole("dialog")).toHaveClass("inset-0", "sm:max-w-lg");
  });

  it("should draw the backdrop with the overlay token", () => {
    renderOpenDialog();
    expect(document.querySelector(".bg-overlay")).toHaveClass("opacity-60");
  });

  it("should use no inline style colours", () => {
    renderOpenDialog();
    const coloured = document.body.querySelectorAll(
      "[style*='color'], [style*='background']",
    );
    expect(coloured).toHaveLength(0);
  });
});
