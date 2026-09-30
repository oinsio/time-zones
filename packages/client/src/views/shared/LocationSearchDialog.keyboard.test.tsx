// Verifies FR8, UX1 of add-locations-via-search (keyboard and focus).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { useState } from "react";
import { CitySearchStatus } from "@/controller";
import { LocationSearchDialog } from "./LocationSearchDialog";
import {
  addedTokyo,
  berlin,
  kolkata,
  moscow,
  renderDialog,
} from "./locationSearchDialogFixtures";

describe("LocationSearchDialog keyboard", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
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
