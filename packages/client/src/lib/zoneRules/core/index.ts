/**
 * The Node-safe core of the zone rules: release reader, future rule, lookup
 * (design D11). Implements FR2, FR3, FR4 of add-zone-rules-from-iana.
 */
export {
  ETC_ZONE_AREA,
  FUTURE_RULE_DEFAULT_TRANSITION_SECONDS,
  FUTURE_RULE_MAX_TRANSITION_HOURS,
  FUTURE_RULE_MIN_DESIGNATION_LENGTH,
  RuleDateKind,
  ZONE_RULES_CUTOFF_EPOCH_SECONDS,
} from "./zoneRulesConstants.ts";
