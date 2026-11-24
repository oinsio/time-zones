import { useTranslation } from "react-i18next";
import { usePrimaryPointer } from "@/controller";
import { useUnixTimeConverter } from "@/controller/unixTime";
import { resolveActiveView } from "@/views";
import {
  type ConverterViewDefinition,
  converterViewRegistry,
  DEFAULT_CONVERTER_VIEW_ID,
} from "@/views/unixTimeConverter";
import { ToolPageFrame } from "../ToolPageFrame";
import type { ToolPageProps } from "../toolDefinition";

type UnixTimeConverterPageProps = ToolPageProps & {
  /** The registry the page resolves its view from; tests pass their own. */
  registry?: readonly ConverterViewDefinition[];
};

/**
 * The Unix time converter page: the tool page frame, the converter hook and
 * the resolved converter view. The page focuses the converter input with its
 * text selected on a fine, hovering pointer and the heading otherwise, so a
 * touch keyboard does not cover the rows.
 * Implements FR5, FR14, FR16, FR17, NFR-A2 of add-unix-time-converter-tool (D2, D9, D12).
 */
export function UnixTimeConverterPage({
  notices,
  onBack,
  session,
  services,
  registry = converterViewRegistry,
}: UnixTimeConverterPageProps) {
  const { t } = useTranslation();
  const { isFineAndHovering } = usePrimaryPointer();
  const { converter, commands } = useUnixTimeConverter({
    session,
    tickScheduler: services.tickScheduler,
    textCopying: services.textCopying,
    onLeave: onBack,
  });
  const view = resolveActiveView(registry, null, DEFAULT_CONVERTER_VIEW_ID);
  const View = view?.component;
  return (
    <ToolPageFrame
      title={t("tools.unixTimeConverter")}
      notices={notices}
      onBack={onBack}
      shouldFocusHeading={!isFineAndHovering}
    >
      {View && (
        <View
          converter={converter}
          commands={commands}
          shouldFocusInput={isFineAndHovering}
          isListLoading={false}
        />
      )}
    </ToolPageFrame>
  );
}
