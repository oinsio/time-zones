import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import type { ToolDefinition } from "@/tools";
import { HeaderIconButton } from "./HeaderIconButton";

type ToolButtonProps = { tool: ToolDefinition; onClick: () => void };

/**
 * The header button that opens a tool page: the tool's icon, its name as the
 * accessible name and the pointer hint.
 * Implements FR4, UX3, NFR-A1 of add-unix-time-converter-tool (D2).
 */
export const ToolButton = forwardRef<HTMLButtonElement, ToolButtonProps>(
  function ToolButton({ tool, onClick }, buttonRef) {
    const { t } = useTranslation();
    return (
      <HeaderIconButton
        ref={buttonRef}
        label={t(tool.titleKey)}
        icon={tool.icon}
        onClick={onClick}
        hasTitle
      />
    );
  },
);
