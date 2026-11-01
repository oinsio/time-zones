import { useTranslation } from "react-i18next";
import { GNOMISH_FACTORY_LANDING_URL } from "@/constants";

/**
 * The Gnomish Factory credit (above the theme preference): one link, the whole phrase, to the factory's
 * landing page in a new tab. Colours come from the theme tokens, so both
 * themes are covered.
 * Implements FR1, FR2, FR3, FR4, NFR-A1, UX1, UX2, UX3 of
 * add-gnomish-factory-credit (D2, D4).
 * Implements FR2, FR3, UX2 of move-and-restyle-gnomish-factory-credit (D2, D3).
 */
export function GnomishFactoryCredit() {
  const { t } = useTranslation();
  return (
    <a
      href={GNOMISH_FACTORY_LANDING_URL}
      target="_blank"
      rel="noopener noreferrer"
      // Stryker disable next-line StringLiteral: layout and colour, covered by settings_factory_credit_e2e.feature
      className="inline-flex min-h-11 items-center justify-center self-center rounded-md px-2 text-center text-credit text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      {t("settings.gnomishFactoryCredit")}
    </a>
  );
}
