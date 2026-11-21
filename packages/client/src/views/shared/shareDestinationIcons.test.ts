// Verifies FR11 of add-meeting-share-dialog.
import { Share2 } from "lucide-react";
import { describe, expect, it } from "vitest";
import { ShareDestinationId } from "@/ports";
import { SHARE_DESTINATION_ICONS } from "./shareDestinationIcons";

describe("SHARE_DESTINATION_ICONS", () => {
  it.each(Object.values(ShareDestinationId))(
    "should have an icon for %s",
    (id) => {
      expect(SHARE_DESTINATION_ICONS[id]).toBeDefined();
    },
  );

  it("should show the text destination with Share2", () => {
    expect(SHARE_DESTINATION_ICONS[ShareDestinationId.TEXT]).toBe(Share2);
  });
});
