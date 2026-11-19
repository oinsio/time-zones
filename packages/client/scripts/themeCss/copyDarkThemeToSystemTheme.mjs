/**
 * PostCSS plugin: the dark theme values are written once, in
 * `:root[data-theme="dark"]`. At build time this plugin appends the same
 * declarations as a CSS-only system dark theme, so nothing flashes before
 * React mounts.
 * Implements FR2, M4 of redesign-cards-grid-and-day-palettes (D1).
 */
const FORCED_DARK_SELECTOR = ':root[data-theme="dark"]';
const SYSTEM_DARK_SELECTOR = ':root:not([data-theme="light"])';
const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

export function copyDarkThemeToSystemTheme() {
  return {
    postcssPlugin: "time-zones-copy-dark-theme-to-system-theme",
    Once(root, { AtRule, Rule }) {
      const darkRules = [];
      root.walkRules(FORCED_DARK_SELECTOR, (rule) => {
        darkRules.push(rule);
      });
      if (darkRules.length === 0) return;
      const systemRule = new Rule({ selector: SYSTEM_DARK_SELECTOR });
      for (const darkRule of darkRules) {
        darkRule.each((node) => systemRule.append(node.clone()));
      }
      const mediaRule = new AtRule({
        name: "media",
        params: SYSTEM_DARK_QUERY,
      });
      mediaRule.append(systemRule);
      root.append(mediaRule);
    },
  };
}
copyDarkThemeToSystemTheme.postcss = true;
