import { DEFAULT_LANGUAGE } from "@/constants";
import {
  buildLocaleRegistry,
  type RegisteredLocale,
} from "./buildLocaleRegistry";

export { buildLocaleRegistry, DEFAULT_LANGUAGE, type RegisteredLocale };

/** Code of any language the registry may hold. */
export type InterfaceLanguageCode = string;

// Stryker disable all: Vite reads the glob arguments statically, a mutant switch breaks its parser
/** Every locale file of `locales/`, collected automatically. */
export const localeRegistry = buildLocaleRegistry(
  import.meta.glob("./*.json", { eager: true, import: "default" }),
);
// Stryker restore all

export const SUPPORTED_LANGUAGES: readonly InterfaceLanguageCode[] =
  localeRegistry.map(({ metadata }) => metadata.code);

export const findRegisteredLocale = (
  code: string,
  registry: readonly RegisteredLocale[] = localeRegistry,
): RegisteredLocale | undefined =>
  registry.find(({ metadata }) => metadata.code === code);
