import { useTranslation } from "react-i18next";
import { ToolPageFrame } from "../ToolPageFrame";
import type { ToolPageProps } from "../toolDefinition";

/**
 * The Unix time converter page.
 * Implements FR5 of add-unix-time-converter-tool (D2, D9).
 */
export function UnixTimeConverterPage({ notices, onBack }: ToolPageProps) {
  const { t } = useTranslation();
  return (
    <ToolPageFrame
      title={t("tools.unixTimeConverter")}
      notices={notices}
      onBack={onBack}
    />
  );
}
