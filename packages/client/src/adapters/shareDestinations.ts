import type { ShareDestination, TextSharing } from "@/ports";
import { browserTextSharing } from "./browserTextSharing";
import { createTextShareDestination } from "./textShareDestination";

/**
 * The ordered registry of share destinations, built from the text sharing the
 * app receives, so an injected sharing reaches the destination.
 * Implements FR9, FR11 of add-meeting-share-dialog (D5).
 */
export const createShareDestinations = (
  textSharing: TextSharing = browserTextSharing,
): readonly ShareDestination[] => [createTextShareDestination(textSharing)];
