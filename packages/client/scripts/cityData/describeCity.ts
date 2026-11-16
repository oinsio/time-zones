/** Names a city tuple in an error message. Implements FR1 of add-city-coordinates-to-locations (D2). */
export function describeCity(tuple: unknown[]): string {
  return `${String(tuple[1])} (${String(tuple[0])})`;
}
