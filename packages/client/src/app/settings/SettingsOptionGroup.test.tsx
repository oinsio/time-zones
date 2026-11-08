// Verifies FR5, FR6, NFR-A1, NFR-A2, NFR-A3, UX2, UX3 of compact-settings-controls.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sun } from "lucide-react";
import { SETTINGS_GROUP_CAPTION_CLASS_NAME } from "@/constants";
import { SettingsOptionGroup } from "./SettingsOptionGroup";

const OPTIONS = [
  { value: "A", label: "Option A", Icon: Sun },
  { value: "B", label: "Option B", pictogram: "2" },
  { value: "C", label: "Option C" },
] as const;

function renderGroup() {
  const onSelect = vi.fn();
  const { container } = render(
    <SettingsOptionGroup
      caption="Sample"
      options={OPTIONS}
      selectedValue="B"
      onSelect={onSelect}
    />,
  );
  return { onSelect, container };
}

function labelOf(name: string): HTMLElement {
  const label = screen.getByRole("radio", { name }).closest("label");
  if (label === null) throw new Error(`no label for ${name}`);
  return label;
}

describe("SettingsOptionGroup", () => {
  it("should be a radiogroup named by its visible caption", () => {
    renderGroup();
    const group = screen.getByRole("radiogroup", { name: "Sample" });
    const captionId = group.getAttribute("aria-labelledby");
    expect(document.getElementById(captionId ?? "")?.textContent).toBe(
      "Sample",
    );
  });

  it("should list the radios in the order of the options", () => {
    renderGroup();
    expect(
      screen
        .getAllByRole("radio")
        .map((radio) => (radio as HTMLInputElement).value),
    ).toEqual(["A", "B", "C"]);
  });

  it("should check the selected option only", () => {
    renderGroup();
    expect(screen.getByRole("radio", { name: "Option B" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Option A" })).not.toBeChecked();
  });

  it("should report the chosen value", async () => {
    const { onSelect } = renderGroup();
    await userEvent.click(screen.getByRole("radio", { name: "Option A" }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith("A");
  });

  it.each(["Option A", "Option B", "Option C"])(
    "should give %s a pointer hint equal to its name",
    (name) => {
      renderGroup();
      expect(labelOf(name)).toHaveAttribute("title", name);
    },
  );

  it("should show an icon option as a hidden icon and an sr-only name", () => {
    renderGroup();
    const label = labelOf("Option A");
    expect(label.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(label.querySelector("span.sr-only")?.textContent).toBe("Option A");
    expect(label.querySelectorAll(":scope > span:not(.sr-only)")).toHaveLength(
      0,
    );
  });

  it("should show a pictogram option as a hidden pictogram and an sr-only name", () => {
    renderGroup();
    const label = labelOf("Option B");
    expect(label.querySelector("[aria-hidden='true']")?.textContent).toBe("2");
    expect(label.querySelector("span.sr-only")?.textContent).toBe("Option B");
  });

  it("should show the name of an option without icon and pictogram", () => {
    renderGroup();
    expect(labelOf("Option C")).toHaveTextContent("Option C");
    expect(labelOf("Option C").querySelector(".sr-only:not(input)")).toBeNull();
  });

  it("should fill the checked option only", () => {
    renderGroup();
    expect(labelOf("Option B")).toHaveClass("bg-accent");
    expect(labelOf("Option A")).toHaveClass("bg-surface");
    expect(labelOf("Option C")).toHaveClass("bg-surface");
  });

  it("should draw no check icon", () => {
    const { container } = renderGroup();
    expect(container.querySelector("svg.lucide-check")).toBeNull();
  });

  it("should join the options in one bordered track outside the caption", () => {
    renderGroup();
    const track = labelOf("Option A").parentElement;
    expect(track).toHaveClass("border");
    expect(labelOf("Option B").parentElement).toBe(track);
    expect(labelOf("Option C").parentElement).toBe(track);
    expect(track).not.toContainElement(screen.getByText("Sample"));
  });

  it("should style the caption with the shared caption class", () => {
    renderGroup();
    expect(screen.getByText("Sample")).toHaveClass(
      ...SETTINGS_GROUP_CAPTION_CLASS_NAME.split(" "),
    );
  });

  it("should not use a fieldset", () => {
    const { container } = renderGroup();
    expect(container.querySelector("fieldset")).toBeNull();
  });
});
