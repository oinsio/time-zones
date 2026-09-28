import { useTranslation } from "react-i18next";
import { NoticeButton } from "./NoticeButton";

interface RecoveryScreenProps {
  onReload: () => void;
}

/**
 * Shown instead of a blank page after an unexpected rendering error; plain
 * language only, no technical details.
 * Implements FR8, UX4 of setup-app-shell-and-pages-deploy.
 */
export function RecoveryScreen({ onReload }: RecoveryScreenProps) {
  const { t } = useTranslation();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">{t("app.errorTitle")}</h1>
      <p>{t("app.errorMessage")}</p>
      <div>
        <NoticeButton onClick={onReload}>{t("app.reload")}</NoticeButton>
      </div>
    </main>
  );
}
