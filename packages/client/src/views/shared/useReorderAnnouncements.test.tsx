// Verifies FR8, NFR-A3, FR3 of reorder-locations-by-drag-and-drop (D5).
import type { Announcements } from "@dnd-kit/core";
import { renderHook } from "@testing-library/react";
import i18n from "i18next";
import en from "@/locales/en.json";
import ru from "@/locales/ru.json";
import { useReorderAnnouncements } from "./useReorderAnnouncements";

const rows = ["Moscow", "Almaty", "New York"].map((cityLabel) => ({
  id: cityLabel,
  cityLabel,
  countryName: "",
  utcOffsetLabel: "",
}));

type Event = Parameters<NonNullable<Announcements["onDragOver"]>>[0];
const eventOf = (activeId: string, overId?: string) =>
  ({
    active: { id: activeId },
    over: overId === undefined ? null : { id: overId },
  }) as unknown as Event;

const renderAnnouncements = () =>
  renderHook(() => useReorderAnnouncements(rows)).result.current;

describe("useReorderAnnouncements", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should announce the pick-up with position and total", () => {
    const { announcements } = renderAnnouncements();
    expect(
      announcements?.onDragStart?.({ active: eventOf("Moscow").active }),
    ).toBe("Moscow picked up at position 1 of 3");
  });

  it("should announce the position of the row it is over", () => {
    const { announcements } = renderAnnouncements();
    expect(announcements?.onDragOver?.(eventOf("Moscow", "New York"))).toBe(
      "Moscow moved to position 3 of 3",
    );
  });

  it("should announce the drop position", () => {
    const { announcements } = renderAnnouncements();
    expect(announcements?.onDragEnd?.(eventOf("Moscow", "Almaty"))).toBe(
      "Moscow dropped at position 2 of 3",
    );
  });

  it("should announce the cancel with the picked-up position", () => {
    const { announcements } = renderAnnouncements();
    expect(announcements?.onDragCancel?.(eventOf("Moscow", "Almaty"))).toBe(
      "Moving Moscow cancelled",
    );
  });

  it("should announce nothing when over no row", () => {
    const { announcements } = renderAnnouncements();
    expect(announcements?.onDragOver?.(eventOf("Moscow"))).toBeUndefined();
  });

  it("should announce a cancel when dropped outside the list", () => {
    const { announcements } = renderAnnouncements();
    expect(announcements?.onDragEnd?.(eventOf("Moscow"))).toBe(
      "Moving Moscow cancelled",
    );
  });

  it("should give the keyboard instructions", () => {
    const { screenReaderInstructions } = renderAnnouncements();
    expect(screenReaderInstructions?.draggable).toBe(
      en.locations.reorderInstructions,
    );
  });

  it("should speak Russian in the Russian interface", async () => {
    await i18n.changeLanguage("ru");
    const { announcements, screenReaderInstructions } = renderAnnouncements();
    expect(
      announcements?.onDragStart?.({ active: eventOf("Moscow").active }),
    ).toBe("Moscow: взято, позиция 1 из 3");
    expect(screenReaderInstructions?.draggable).toBe(
      ru.locations.reorderInstructions,
    );
  });
});
