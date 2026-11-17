Feature: Watched zones
  A stored zone rules release raises its notice only when it changes a zone the user can see: a zone of the list or the device time zone.

  @apply-data-updates-silently @FR9
  Scenario: Zones of the list and of the device
    Given the list holds Lisbon and Porto, both in "Europe/Lisbon", and Cairo, and the device time zone is "Europe/Moscow"
    When the watched zones are read
    Then they are "Europe/Lisbon", "Africa/Cairo" and "Europe/Moscow"

  @apply-data-updates-silently @FR9
  Scenario: An empty list
    Given the list is empty and the device time zone is "Africa/Cairo"
    When the watched zones are read
    Then they are "Africa/Cairo" alone

  @apply-data-updates-silently @FR8 @M3
  Scenario Outline: Kinds of difference that count
    Given the list holds Lisbon and the comparison is made at "2026-11-15T12:00:00Z"
    When the stored release differs from the active one for "Europe/Lisbon" only in <difference>, a difference of the kind "<kind>"
    Then the stored release changes a watched zone

    Examples:
      | kind                          | difference                                                                                   |
      | UTC offset in force           | the UTC offset in force at the comparison instant                                            |
      | designation in force          | the designation in force at the comparison instant                                           |
      | daylight-saving flag in force | the daylight-saving flag in force at the comparison instant, with the same UTC offset and designation |
      | later clock change            | the instant of the clock change of March 2027                                                |
      | later clock change            | the UTC offset that the clock change of March 2027 starts                                    |
      | rule after the listed changes | the rule for the years after the listed clock changes                                        |

  @apply-data-updates-silently @FR8 @M3
  Scenario Outline: Differences that do not count
    Given the list holds Lisbon, the device time zone is "Europe/Moscow" and the comparison is made at "2026-11-15T12:00:00Z"
    When the stored release differs from the active one only in <difference>
    Then the stored release changes no watched zone

    Examples:
      | difference                                                      |
      | a clock change of "Europe/Lisbon" in 2009                       |
      | the rules of "America/Asuncion"                                 |
      | a new zone "America/Example" that the active release does not hold |

  @apply-data-updates-silently @FR8 @FR9
  Scenario: The device time zone is watched
    Given the list is empty and the device time zone is "Africa/Cairo"
    When the stored release moves the next clock change of "Africa/Cairo"
    Then the stored release changes a watched zone

  @apply-data-updates-silently @FR8
  Scenario: A link that keeps its rules
    Given the list holds Luanda in "Africa/Luanda", a link to "Africa/Lagos" in the active release
    When the stored release makes "Africa/Luanda" a zone of its own with the same rules from the comparison instant on
    Then the stored release changes no watched zone

  @apply-data-updates-silently @FR8
  Scenario: A zone only one release holds
    Given the list holds a location in "Europe/Lisbon"
    When the stored release no longer holds "Europe/Lisbon"
    Then the stored release changes a watched zone
