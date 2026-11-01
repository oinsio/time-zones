// Verifies FR7 of add-interface-language-selection (D3).
import { readBrowserLanguages } from "./browserLanguages";

describe("readBrowserLanguages", () => {
  it("should return the preferred languages in order", () => {
    expect(
      readBrowserLanguages({ languages: ["de-DE", "ru"], language: "de-DE" }),
    ).toEqual(["de-DE", "ru"]);
  });

  it("should use the single language when the list is empty", () => {
    expect(readBrowserLanguages({ languages: [], language: "ru-RU" })).toEqual([
      "ru-RU",
    ]);
  });

  it("should use the single language when the list is missing", () => {
    expect(readBrowserLanguages({ language: "ru-RU" })).toEqual(["ru-RU"]);
  });

  it("should return nothing when the browser reports no language", () => {
    expect(readBrowserLanguages({ languages: [], language: "" })).toEqual([]);
  });

  it("should return nothing when the navigator has no language fields", () => {
    expect(readBrowserLanguages({})).toEqual([]);
  });

  it("should read the global navigator by default", () => {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["fr"]);
    expect(readBrowserLanguages()).toEqual(["fr"]);
    vi.restoreAllMocks();
  });
});
