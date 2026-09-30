import zoneCities from "virtual:zone-cities";
import zoneCitiesUrl from "virtual:zone-cities-url";

/**
 * Answers the zone-cities request with the extracted records, so jsdom tests
 * can open the search without a network (an external dependency). Undo with
 * `vi.unstubAllGlobals()`.
 */
export function stubZoneCitiesFetch() {
  const fetchStub = vi.fn((input: RequestInfo | URL) =>
    String(input) === zoneCitiesUrl
      ? Promise.resolve(Response.json(zoneCities))
      : Promise.reject(new Error(`Unexpected request: ${String(input)}`)),
  );
  vi.stubGlobal("fetch", fetchStub);
  return fetchStub;
}
