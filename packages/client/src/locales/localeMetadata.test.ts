// Verifies FR3, FR9 of add-interface-language-selection (D4).
import { parseLocaleMetadata } from "./localeMetadata";

const completeMetadata = {
  code: "ru",
  name: "Russian",
  nativeName: "Русский",
  baseLanguage: "ru",
  emoji: "🇷🇺",
};

const FIELD_NAMES = Object.keys(completeMetadata);

describe("parseLocaleMetadata", () => {
  it("should return complete metadata", () => {
    expect(parseLocaleMetadata(completeMetadata, "ru")).toEqual(
      completeMetadata,
    );
  });

  it.each(FIELD_NAMES)("should reject metadata without %s", (field) => {
    const { [field]: _removed, ...rest } = completeMetadata as Record<
      string,
      string
    >;
    expect(parseLocaleMetadata(rest, "ru")).toBeUndefined();
  });

  it.each(FIELD_NAMES)("should reject an empty %s", (field) => {
    expect(
      parseLocaleMetadata({ ...completeMetadata, [field]: "" }, "ru"),
    ).toBeUndefined();
  });

  it.each(FIELD_NAMES)("should reject a %s that is not a string", (field) => {
    expect(
      parseLocaleMetadata({ ...completeMetadata, [field]: 42 }, "ru"),
    ).toBeUndefined();
  });

  it("should reject a code that differs from the file code", () => {
    expect(parseLocaleMetadata(completeMetadata, "de")).toBeUndefined();
  });

  it.each(["en_pirate", "en-us"])(
    "should reject the code %s that is not a canonical tag",
    (code) => {
      expect(
        parseLocaleMetadata({ ...completeMetadata, code }, code),
      ).toBeUndefined();
    },
  );

  it("should accept a canonical regional code", () => {
    const metadata = { ...completeMetadata, code: "en-GB" };
    expect(parseLocaleMetadata(metadata, "en-GB")).toEqual(metadata);
  });

  it.each([null, "ru", undefined, 5])(
    "should reject metadata %s that is not an object",
    (meta) => {
      expect(parseLocaleMetadata(meta, "ru")).toBeUndefined();
    },
  );
});
