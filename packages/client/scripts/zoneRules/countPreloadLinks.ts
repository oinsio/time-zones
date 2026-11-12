/**
 * Counts the `rel="preload"` links of an entry page that fetch the zone rules
 * asset. Implements NFR-P1 of add-zone-rules-from-iana.
 */
const PRELOAD_LINK_PATTERN = /<link[^>]*rel="preload"[^>]*href="([^"]+)"/g;

export function countZoneRulesPreloadLinks(
  entryHtml: string,
  zoneRulesAssetPrefix: string,
): number {
  return [...entryHtml.matchAll(PRELOAD_LINK_PATTERN)].filter(
    (preloadMatch) => preloadMatch[1]?.includes(zoneRulesAssetPrefix) === true,
  ).length;
}
