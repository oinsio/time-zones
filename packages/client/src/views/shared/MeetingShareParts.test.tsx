// Verifies FR2, FR3, FR5, FR8, UX3, UX5, NFR-A2 of add-meeting-share-dialog.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MeetingShareDialogRow } from "@/controller";
import { ZoneLinePartKind } from "@/presenter";
import { MeetingShareLocationRow } from "./MeetingShareLocationRow";
import { MeetingSharePreview } from "./MeetingSharePreview";
import { ShareLanguagePin } from "./ShareLanguagePin";

const MOSCOW_ROW: MeetingShareDialogRow = {
  id: "moscow",
  cityLabel: "Москва",
  isIncluded: true,
  zoneParts: [
    { kind: ZoneLinePartKind.ZONE_ABBREVIATION, text: "МСК" },
    { kind: ZoneLinePartKind.UTC_OFFSET, text: "UTC+3" },
  ],
  spanLabel: "07:00–09:00",
  localDateLabel: "вс, 8 мар.",
};

const renderRow = (row: MeetingShareDialogRow, onToggle = vi.fn()) =>
  render(
    <ul>
      <MeetingShareLocationRow row={row} onToggle={onToggle} />
    </ul>,
  );

describe("MeetingShareLocationRow", () => {
  it("should show the city, the zone parts, the span and the date", () => {
    renderRow(MOSCOW_ROW);

    expect(screen.getByText("Москва")).toBeInTheDocument();
    expect(screen.getByText("МСК")).toBeInTheDocument();
    expect(screen.getByText("UTC+3")).toBeInTheDocument();
    expect(screen.getByText("07:00–09:00")).toBeInTheDocument();
    expect(screen.getByText("вс, 8 мар.")).toBeInTheDocument();
  });

  it("should show the day shift before the date", () => {
    renderRow({
      ...MOSCOW_ROW,
      dayShiftLabel: "днём раньше",
      localDateLabel: "сб, 7 мар.",
    });

    expect(screen.getByText("днём раньше сб, 7 мар.")).toBeInTheDocument();
  });

  it("should show no zone part for a location without any", () => {
    renderRow({ ...MOSCOW_ROW, zoneParts: [] });

    expect(screen.queryByText("МСК")).not.toBeInTheDocument();
  });

  it("should name the checkbox by the city label and announce it checked", () => {
    renderRow(MOSCOW_ROW);

    expect(screen.getByRole("checkbox", { name: "Москва" })).toBeChecked();
  });

  it("should offer exactly one control, its checkbox, and no remove button", () => {
    renderRow(MOSCOW_ROW);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
  });

  it("should report the toggle with the location id", async () => {
    const onToggle = vi.fn();
    renderRow(MOSCOW_ROW, onToggle);

    await userEvent.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledWith("moscow");
  });

  it("should mute the city label and the span of an unticked row", () => {
    renderRow({ ...MOSCOW_ROW, isIncluded: false });

    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.getByText("Москва")).toHaveClass("text-muted-foreground");
    expect(screen.getByText("07:00–09:00")).toHaveClass(
      "text-muted-foreground",
    );
  });

  it("should keep the span in the meeting colour while ticked", () => {
    renderRow(MOSCOW_ROW);

    expect(screen.getByText("07:00–09:00")).toHaveClass("text-meeting-text");
  });
});

describe("ShareLanguagePin", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it.each([true, false])("should announce pressed %s", (isPinned) => {
    render(<ShareLanguagePin isPinned={isPinned} onToggle={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "Remember the share language" }),
    ).toHaveAttribute("aria-pressed", String(isPinned));
  });

  it("should call onToggle", async () => {
    const onToggle = vi.fn();
    render(<ShareLanguagePin isPinned={false} onToggle={onToggle} />);

    await userEvent.click(screen.getByRole("button"));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("should fill the pin in the accent colour while on", () => {
    render(<ShareLanguagePin isPinned onToggle={vi.fn()} />);

    expect(screen.getByRole("button")).toHaveClass(
      "border-accent",
      "text-accent",
    );
  });

  it("should outline the pin in the muted colour while off", () => {
    render(<ShareLanguagePin isPinned={false} onToggle={vi.fn()} />);

    expect(screen.getByRole("button")).toHaveClass(
      "border-control-border",
      "text-muted-foreground",
    );
  });
});

describe("MeetingSharePreview", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should set the heading apart in bold and show every line", () => {
    render(<MeetingSharePreview text={"Heading\nAlmaty: 09:00–11:00"} />);

    expect(screen.getByText("Heading")).toHaveClass("font-bold");
    expect(screen.getByText("Almaty: 09:00–11:00")).not.toHaveClass(
      "font-bold",
    );
  });

  it("should show two equal lines without a duplicate key warning", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <MeetingSharePreview text={"Heading\nAlmaty: 09:00\nAlmaty: 09:00"} />,
    );

    expect(screen.getAllByText("Almaty: 09:00")).toHaveLength(2);
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("should be a region named by its caption and not a live region", () => {
    render(<MeetingSharePreview text="Heading" />);

    const region = screen.getByRole("region", {
      name: "Text of the invitation",
    });
    expect(region).not.toHaveAttribute("aria-live");
  });

  it("should show the hint and no text when no location is ticked", () => {
    render(<MeetingSharePreview text={undefined} />);

    expect(screen.getByText("Tick at least one location")).toBeInTheDocument();
  });
});
