// Verifies FR7, NFR-A3 of add-unix-time-converter-tool.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UnixTimeUnitChoice } from "@/model/unixTime";
import type { PresentedUnitOption } from "@/presenter/unixTime";
import { UnitChoice } from "./UnitChoice";

const UNIT_GROUP_NAME = "Единица Unix-времени";
const options: PresentedUnitOption[] = Object.values(UnixTimeUnitChoice).map(
  (choice, index) => ({
    choice,
    label: `label ${index}`,
    isSelected: index === 1,
  }),
);

const renderChoice = (onChoose = vi.fn()) => {
  render(
    <UnitChoice
      options={options}
      unitInForceLabel="Единица: Секунды"
      onChoose={onChoose}
    />,
  );
  return { onChoose };
};

describe("UnitChoice", () => {
  it("should offer every option in the given order", () => {
    renderChoice();
    const names = within(
      screen.getByRole("combobox", { name: UNIT_GROUP_NAME }),
    )
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(names).toEqual(options.map(({ label }) => label));
  });

  it("should select the option marked as selected", () => {
    renderChoice();
    expect(screen.getByRole("combobox", { name: UNIT_GROUP_NAME })).toHaveValue(
      options[1].choice,
    );
  });

  it("should name the unit in force beside the choice", () => {
    renderChoice();
    expect(screen.getByText("Единица: Секунды")).toBeInTheDocument();
  });

  it("should report the chosen option", async () => {
    const { onChoose } = renderChoice();
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: UNIT_GROUP_NAME }),
      options[3].label,
    );
    expect(onChoose).toHaveBeenCalledExactlyOnceWith(options[3].choice);
  });
});
