import { useTranslation } from "react-i18next";
import { GEONAMES_URL } from "@/constants";
import { useActiveInterfaceLanguage } from "@/controller";
import { presentCityDataAttribution } from "@/presenter";

/**
 * The city data credit (the last line of the settings page): one link, the
 * whole phrase, to GeoNames in a new tab. Colours come from the theme tokens,
 * so both themes are covered.
 * Implements FR13, NFR-A2, UX4 of add-geonames-city-source (D10).
 * Implements FR12, FR13, NFR-A2, NFR-R1, UX4 of apply-data-updates-silently (D6):
 * the phrase names the dump date of the city data.
 */
export function CityDataAttribution() {
  const { t } = useTranslation();
  const { code: language } = useActiveInterfaceLanguage();
  return (
    <a
      href={GEONAMES_URL}
      target="_blank"
      rel="noopener noreferrer"
      // Stryker disable next-line StringLiteral: layout and colour, covered by settings_city_data_attribution_e2e.feature
      className="inline-flex min-h-11 items-center justify-center self-center rounded-md px-2 text-center text-credit text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      {presentCityDataAttribution(language, t)}
    </a>
  );
}
