type NavigatorLanguages = Pick<Navigator, "language" | "languages">;

/**
 * The browser languages in the browser's order of preference: `navigator.languages`,
 * or `[navigator.language]` when the list is empty, or `[]` when neither exists.
 * The only place that reads the browser language.
 *
 * Implements FR7 of add-interface-language-selection (D3).
 */
export const readBrowserLanguages = (
  navigatorLike: Partial<NavigatorLanguages> = globalThis.navigator,
): readonly string[] => {
  if (navigatorLike.languages?.length) return navigatorLike.languages;
  return navigatorLike.language ? [navigatorLike.language] : [];
};
