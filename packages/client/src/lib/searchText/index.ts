/**
 * The Node-safe search text normalization (design D11): plain `node` loads it,
 * so the city data compiler and the search share one normalizer.
 * Implements FR3, FR7 of add-geonames-city-source (D11).
 */
export { normalizeSearchText, splitIntoWords } from "./normalizeSearchText.ts";
