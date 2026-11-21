// Verifies FR11 of add-meeting-share-dialog.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { ShareDestinationId } from "@/ports";
import { presentShareDestinationLabel } from "./shareDestinationLabel";

describe("presentShareDestinationLabel", () => {
  it.each(
    Object.values(ShareDestinationId).flatMap((id) =>
      ["en", "ru"].map((language) => [id, language] as const),
    ),
  )("should label %s in %s", (id, language) => {
    expect(presentShareDestinationLabel(id, i18n.getFixedT(language))).not.toBe(
      "",
    );
  });

  it.each([
    ["ru", "Поделиться"],
    ["en", "Share"],
  ])("should label the text destination in %s as %s", (language, expected) => {
    expect(
      presentShareDestinationLabel(
        ShareDestinationId.TEXT,
        i18n.getFixedT(language),
      ),
    ).toBe(expected);
  });
});
