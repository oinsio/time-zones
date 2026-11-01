/**
 * The shared migration loop of the stored documents (ADR-0004).
 * Implements FR8 of add-interface-language-selection (D2).
 */

/** Upgrades a payload from the version it is keyed by to the next one. */
export type PayloadMigrations = Readonly<
  Record<number, (payload: unknown) => unknown>
>;

/** Upgrades to the current version; `undefined` when a step is missing. */
export function migratePayload(
  storedVersion: number,
  payload: unknown,
  currentVersion: number,
  migrations: PayloadMigrations,
): unknown {
  let migratedPayload = payload;
  for (let version = storedVersion; version < currentVersion; version += 1) {
    const migrate = migrations[version];
    if (!migrate) return undefined;
    migratedPayload = migrate(migratedPayload);
  }
  return migratedPayload;
}
