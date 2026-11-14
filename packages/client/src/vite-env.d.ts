/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "virtual:time-zone-aliases" {
  /** Legacy IANA alias → canonical IANA identifier. */
  const timeZoneAliases: Record<string, string>;
  export default timeZoneAliases;
}

declare module "virtual:zone-cities-url" {
  /** URL of the emitted zone-cities JSON file. */
  const zoneCitiesUrl: string;
  export default zoneCitiesUrl;
}

declare module "virtual:zone-cities" {
  /** Zone-cities records, resolvable only in Vitest (mode "test"). */
  const zoneCities: {
    timeZoneId: string;
    names: { en: string; ru: string };
    countryCode: string;
  }[];
  export default zoneCities;
  /** The committed GeoNames city data without its source record, the cities as columns (design D5). */
  export const cityData: {
    formatVersion: number;
    zones: string[];
    regions: [string, string][];
    columns: {
      idDifferences: number[];
      englishNames: string[];
      russianNames: (string | 0)[];
      countryCodes: string[];
      zoneIndexes: number[];
      populations: number[];
      regionIndexes: number[];
    };
    zoneCityPopulations: Record<string, number>;
    zoneCityRegions: Record<string, number>;
  };
}

declare module "virtual:zone-abbreviations" {
  /** Zone ID → its abbreviation pair (one entry for a zone with one offset, "" for a numeric half). */
  const zoneAbbreviations: Readonly<Record<string, readonly string[]>>;
  export default zoneAbbreviations;
}

declare module "virtual:zone-rules-url" {
  /** URL of the emitted zone rules release (`zone-rules/release.json`). */
  const zoneRulesUrl: string;
  export default zoneRulesUrl;
}

declare module "virtual:zone-rules" {
  /** The zone rules release document, resolvable only in Vitest (mode "test"). */
  const zoneRulesDocument: unknown;
  export default zoneRulesDocument;
}

declare module "virtual:legacy-core-js" {
  // Side-effect module: installs the core-js polyfills a legacy engine lacks.
}

/** The build instant, replaced by Vite's `define` (see `app.config.ts`). */
declare const __APP_DEPLOY_INSTANT__: string;
