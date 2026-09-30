import { type ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardKey } from "@/constants";
import { NoticeButton } from "./NoticeButton";
import { NoticeCard } from "./NoticeCard";

interface NoticeProps {
  message: string;
  onDismiss: () => void;
  /** Actions shown before the dismiss control. */
  actions?: ReactNode;
}

/**
 * Non-blocking notice card: never takes focus, Esc dismisses it.
 * Implements UX2, NFR-A2 of setup-app-shell-and-pages-deploy.
 */
export function Notice({ message, onDismiss, actions }: NoticeProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KeyboardKey.ESCAPE) onDismiss();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  return (
    <NoticeCard>
      <p className="flex-1">{message}</p>
      {actions}
      <NoticeButton onClick={onDismiss}>{t("app.dismiss")}</NoticeButton>
    </NoticeCard>
  );
}
