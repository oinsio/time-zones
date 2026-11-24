import {
  type RefCallback,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { KeyboardKey } from "@/constants";
import { AppPage } from "./appPage";

/** The key of the settings button among the buttons that open a page. */
export const SETTINGS_OPENER_KEY = "settings";

type PageState = { page: AppPage; toolId?: string };

const MAIN_PAGE_STATE: PageState = { page: AppPage.MAIN };

/**
 * The page the shell shows, the Esc handler and the returned focus: leaving a
 * page puts the focus on the button that opened it. A tool that is no longer
 * enabled returns the user to the main page.
 * Implements FR3 of add-settings-page-and-device-time-location (D10).
 * Implements FR5, NFR-A2 of add-unix-time-converter-tool (D2).
 */
export function useAppPage(enabledToolIds: readonly string[]) {
  const [state, setState] = useState<PageState>(MAIN_PAGE_STATE);
  const openers = useRef(new Map<string, HTMLButtonElement>());
  const openerRefs = useRef(new Map<string, RefCallback<HTMLButtonElement>>());
  const returnFocusKey = useRef<string | undefined>(undefined);
  const openerKey = useRef<string>(SETTINGS_OPENER_KEY);

  const isToolGone =
    state.page === AppPage.TOOL &&
    (state.toolId === undefined || !enabledToolIds.includes(state.toolId));
  const page = isToolGone ? AppPage.MAIN : state.page;

  useEffect(() => {
    if (isToolGone) setState(MAIN_PAGE_STATE);
  }, [isToolGone]);

  const getOpenerRef = useCallback((key: string) => {
    let openerRef = openerRefs.current.get(key);
    if (openerRef === undefined) {
      openerRef = (button) => {
        if (button === null) openers.current.delete(key);
        else openers.current.set(key, button);
      };
      openerRefs.current.set(key, openerRef);
    }
    return openerRef;
  }, []);

  const leave = useCallback(() => {
    returnFocusKey.current = openerKey.current;
    setState(MAIN_PAGE_STATE);
  }, []);

  const openSettings = useCallback(() => {
    openerKey.current = SETTINGS_OPENER_KEY;
    setState({ page: AppPage.SETTINGS });
  }, []);

  const openTool = useCallback((toolId: string) => {
    openerKey.current = toolId;
    setState({ page: AppPage.TOOL, toolId });
  }, []);

  useEffect(() => {
    if (page !== AppPage.MAIN || returnFocusKey.current === undefined) return;
    openers.current.get(returnFocusKey.current)?.focus();
    returnFocusKey.current = undefined;
  }, [page]);

  useEffect(() => {
    if (page === AppPage.MAIN) return;
    const onKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === KeyboardKey.ESCAPE && !keyboardEvent.defaultPrevented) leave();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [page, leave]);

  return {
    page,
    toolId: state.toolId,
    openSettings,
    openTool,
    leave,
    getOpenerRef,
  };
}
