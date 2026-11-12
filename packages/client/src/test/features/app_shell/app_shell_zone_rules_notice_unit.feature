Feature: Zone rules update notice
  The app says so when a newer zone rules release is stored, and offers Reload; it never reloads by itself.

  @add-remote-zone-rules-updates @FR7 @UX1
  Scenario: Notice names the release
    Given a newer zone rules release "2999a" is stored
    When the app shows the zone rules update notice
    Then the notice reads "Time zone rules 2999a are ready. Reload to use them."

  @add-remote-zone-rules-updates @FR7 @UX1
  Scenario: User reloads
    Given a newer zone rules release "2999a" is stored
    When the user chooses Reload on the zone rules update notice
    Then the page reloads once

  @add-remote-zone-rules-updates @FR7 @UX1
  Scenario: User reloads with a waiting update
    Given a new version is waiting and a newer zone rules release "2999a" is stored
    When the user chooses Reload on the zone rules update notice
    Then the waiting update is applied and the page is not reloaded separately

  @add-remote-zone-rules-updates @FR7 @UX2
  Scenario: User dismisses
    Given a newer zone rules release "2999a" is stored
    When the user dismisses the zone rules update notice
    Then the zone rules update notice is gone

  @add-remote-zone-rules-updates @FR7 @UX2
  Scenario: Both notices at once
    Given a new version is waiting and a newer zone rules release "2999a" is stored
    When the app shows the zone rules update notice
    Then both notices are shown, each with its own Reload, the zone rules one after the update notice

  @add-remote-zone-rules-updates @FR7 @UX1
  Scenario: Russian notice
    Given the interface language is Russian and a newer zone rules release "2999a" is stored
    When the app shows the zone rules update notice
    Then the notice reads "Доступны правила часовых поясов 2999a. Перезагрузите, чтобы применить."
