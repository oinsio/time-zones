// Verifies FR16, NFR-A1 of show-zone-abbreviations-and-zone-label-setting (D7).
// Verifies FR2, NFR-A1 of add-unix-time-converter-tool.
// Verifies NFR-R1 of add-country-to-zone-label.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Binary } from "lucide-react";
import { SettingsToggleGroup } from "./SettingsToggleGroup";

const OPTIONS = [
  { value: "A", label: "Option A" },
  { value: "B", label: "Option B" },
  { value: "C", label: "Option C" },
] as const;

function renderGroup(selectedValues: readonly string[] = ["B"]) {
  const onToggle = vi.fn();
  render(
    <SettingsToggleGroup
      caption="Sample"
      options={OPTIONS}
      selectedValues={selectedValues}
      onToggle={onToggle}
      description={<span>Example text</span>}
    />,
  );
  return { onToggle };
}

describe("SettingsToggleGroup", () => {
  it("should let the toggles wrap onto further rows", () => {
    renderGroup();
    const container = screen.getByRole("button", {
      name: "Option A",
    }).parentElement;
    expect(container).toHaveClass("flex-wrap");
    expect(container).not.toHaveClass("flex-nowrap");
  });

  it("should be a group named by its caption and described by the description", () => {
    renderGroup();
    expect(
      screen.getByRole("group", {
        name: "Sample",
        description: "Example text",
      }),
    ).toBeInTheDocument();
  });

  it("should render one button per option with its pressed state", () => {
    renderGroup(["B"]);
    expect(
      screen.getByRole("button", { name: "Option A", pressed: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Option B", pressed: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Option C", pressed: false }),
    ).toBeInTheDocument();
  });

  it("should report turning an option on", async () => {
    const { onToggle } = renderGroup();
    await userEvent.click(screen.getByRole("button", { name: "Option A" }));
    expect(onToggle).toHaveBeenCalledExactlyOnceWith("A", true);
  });

  it("should report turning an option off", async () => {
    const { onToggle } = renderGroup();
    await userEvent.click(screen.getByRole("button", { name: "Option B" }));
    expect(onToggle).toHaveBeenCalledExactlyOnceWith("B", false);
  });

  it.each([["{ }"], ["{Enter}"]])(
    "should toggle with the key %s",
    async (key) => {
      const { onToggle } = renderGroup();
      await userEvent.tab();
      await userEvent.keyboard(key);
      expect(onToggle).toHaveBeenCalledExactlyOnceWith("A", true);
    },
  );

  it("should make every toggle its own Tab stop", async () => {
    renderGroup();
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Option B" })).toHaveFocus();
  });

  it("should show the check icon on a pressed option only", () => {
    renderGroup(["B"]);
    const pressed = screen.getByRole("button", { name: "Option B" });
    const unpressed = screen.getByRole("button", { name: "Option A" });
    expect(pressed.querySelector("svg")).not.toBeNull();
    expect(unpressed.querySelector("svg")).toBeNull();
  });

  it("should keep the size of the icon slot when unpressed", () => {
    renderGroup(["B"]);
    const slotOf = (name: string) =>
      screen.getByRole("button", { name }).firstElementChild;
    expect(slotOf("Option A")?.className).toBe(slotOf("Option B")?.className);
    expect(slotOf("Option A")).toHaveClass("size-5");
  });

  it("should be at least 44 px high and wide", () => {
    renderGroup();
    expect(screen.getByRole("button", { name: "Option A" })).toHaveClass(
      "min-h-11",
      "min-w-11",
    );
  });

  it("should render without a description", () => {
    render(
      <SettingsToggleGroup
        caption="Sample"
        options={OPTIONS}
        selectedValues={[]}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByRole("group", { name: "Sample" })).toBeInTheDocument();
  });
});

// Verifies FR2, NFR-A1 of add-unix-time-converter-tool.
describe("SettingsToggleGroup icon options", () => {
  const renderIconGroup = (selectedValues: string[]) => {
    const onToggle = vi.fn();
    render(
      <SettingsToggleGroup
        caption="Sample"
        options={[
          { value: "A", label: "Tool A", icon: Binary },
          { value: "B", label: "Tool B", icon: Binary },
        ]}
        selectedValues={selectedValues}
        onToggle={onToggle}
      />,
    );
    return { onToggle };
  };

  it("should name an icon toggle by its label and show no text", () => {
    renderIconGroup([]);
    const toggle = screen.getByRole("button", { name: "Tool A" });
    expect(toggle).toHaveTextContent("");
  });

  it("should show the label as the pointer hint", () => {
    renderIconGroup([]);
    expect(screen.getByRole("button", { name: "Tool A" })).toHaveAttribute(
      "title",
      "Tool A",
    );
  });

  it("should expose the pressed state", () => {
    renderIconGroup(["A"]);
    expect(screen.getByRole("button", { name: "Tool A" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Tool B" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("should report the toggle the user makes", async () => {
    const { onToggle } = renderIconGroup(["A"]);
    await userEvent.click(screen.getByRole("button", { name: "Tool B" }));
    expect(onToggle).toHaveBeenCalledExactlyOnceWith("B", true);
  });

  it("should keep the box size of the toggle when it is on", () => {
    renderIconGroup(["A"]);
    const sizeClasses = (name: string) =>
      screen
        .getByRole("button", { name })
        .className.split(" ")
        .filter((className) => /^(min-[hw]|p[xy]?-|size)/.test(className));
    expect(sizeClasses("Tool A")).toEqual(sizeClasses("Tool B"));
  });
});
