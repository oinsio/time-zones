/**
 * Adds the preload link of the zone rules asset to the page: it is fetched
 * with the entry script, outside the initial JavaScript.
 * Implements NFR-P2 of add-zone-rules-from-iana (design D2).
 */

const HEAD_END = "</head>";

export function addZoneRulesPreload(html: string, href: string): string {
  const link = `<link rel="preload" as="fetch" crossorigin href="${href}">`;
  if (html.includes(link) || !html.includes(HEAD_END)) return html;
  return html.replace(HEAD_END, `${link}${HEAD_END}`);
}
