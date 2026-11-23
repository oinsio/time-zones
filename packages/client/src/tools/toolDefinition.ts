import type { LucideIcon } from "lucide-react";
import type { ComponentType, LazyExoticComponent, ReactNode } from "react";

/**
 * Ids of the tools of this build; a member is added with each new tool.
 * Implements FR1 of add-unix-time-converter-tool (D1).
 */
export enum ToolId {
  UNIX_TIME_CONVERTER = "unixTimeConverter",
}

/**
 * What a tool page keeps while the app stays open: the shell holds the value
 * between visits, the tool validates what it reads.
 * Implements FR14 of add-unix-time-converter-tool (D8).
 */
export type ToolSession = {
  read: () => unknown;
  write: (value: unknown) => void;
};

/** What the shell hands to a tool page. Implements FR4, FR5 of add-unix-time-converter-tool (D2). */
export type ToolPageProps = {
  /** Contents of the polite notices region, as on the main page. */
  notices: ReactNode;
  /** Leaves to the main page; the focus goes to the tool button. */
  onBack: () => void;
  session: ToolSession;
};

/**
 * Describes one tool (ADR-0020 draft, D1). The id is a text because the
 * preferences store it as one; a tool without a `page` gets no tool button.
 * Implements FR1 of add-unix-time-converter-tool (D1).
 */
export interface ToolDefinition {
  id: string;
  /** i18n key of the tool name: the tools group, the tool button and the page heading. */
  titleKey: string;
  icon: LucideIcon;
  page?: LazyExoticComponent<ComponentType<ToolPageProps>>;
}
