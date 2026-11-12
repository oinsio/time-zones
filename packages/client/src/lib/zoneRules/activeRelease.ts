/**
 * Which zone rules release is active at start: the stored release when it is
 * newer than the bundled one, otherwise the bundled one. Pure.
 * Implements FR6 of add-remote-zone-rules-updates (design D3).
 */
import { isNewerRelease, type ZoneRulesRelease } from "./core/index.ts";

export type ActiveReleaseChoice = {
  active: ZoneRulesRelease | undefined;
  /** A stored release that did not win is removed. */
  shouldClearStored: boolean;
};

export function chooseActiveRelease({
  bundled,
  stored,
}: {
  bundled: ZoneRulesRelease | undefined;
  stored: ZoneRulesRelease | undefined;
}): ActiveReleaseChoice {
  if (stored === undefined) {
    return { active: bundled, shouldClearStored: false };
  }
  if (
    bundled === undefined ||
    isNewerRelease(stored.release, bundled.release)
  ) {
    return { active: stored, shouldClearStored: false };
  }
  return { active: bundled, shouldClearStored: true };
}
