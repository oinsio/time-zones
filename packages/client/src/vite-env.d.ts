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
}
