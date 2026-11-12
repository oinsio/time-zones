/**
 * The pinned signing key of the tz coordinator (Paul Eggert), who signs every
 * IANA tzdata release. The compiler accepts an archive only when its signature
 * was made by the key with this fingerprint.
 * Implements FR7 of add-zone-rules-from-iana (design D7).
 */
export const TZ_COORDINATOR_KEY_FILE =
  "scripts/zoneRules/tz-coordinator-key.asc";
export const TZ_COORDINATOR_KEY_FINGERPRINT =
  "7E3792A9D8ACF7D633BC1588ED97E90E62AA7E34";
export const TZ_COORDINATOR_KEY_EXPIRES = "2031-07-24";
