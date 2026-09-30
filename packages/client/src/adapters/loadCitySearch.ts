import { createFetchCitySearchLoader } from "./city-search";

/**
 * Loads the city search data when the search is opened.
 * Implements FR15 of add-locations-via-search (D8).
 */
export const loadCitySearch = createFetchCitySearchLoader();
