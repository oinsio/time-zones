Feature: Zone rules update notice
  The app says so when a newer zone rules release is stored and changes a zone the user watches, and offers Reload; it never reloads by itself.

  @add-remote-zone-rules-updates @FR7 @UX1 @apply-data-updates-silently @FR8
  Scenario: Notice names the release
    Given the list holds Lisbon
    When a check finds the newer release "2999a", which changes the rules of "Europe/Lisbon"
    Then the notice reads "Time zone rules 2999a are ready. Reload to use them."

  @apply-data-updates-silently @FR8 @FR9
  Scenario: A release that changes no watched zone
    Given the list holds Lisbon
    When a check finds the newer release "2999a", which changes only the rules of "America/Asuncion"
    Then the notices region stays empty

  @add-remote-zone-rules-updates @FR7 @UX1
  Scenario: User reloads
    Given the list holds Lisbon
    When the user chooses Reload on the zone rules update notice for the release "2999a"
    Then the page reloads once

  @add-remote-zone-rules-updates @FR7 @UX1 @apply-data-updates-silently @FR11
  Scenario: User reloads with a waiting update
    Given the list holds Lisbon and a build with another app revision is waiting
    When the user chooses Reload on the zone rules update notice for the release "2999a"
    Then the waiting update is applied and the page is not reloaded separately

  @add-remote-zone-rules-updates @FR7 @UX2
  Scenario: User dismisses
    Given the list holds Lisbon
    When the user dismisses the zone rules update notice for the release "2999a"
    Then the zone rules update notice is gone

  @add-remote-zone-rules-updates @FR7 @UX2 @apply-data-updates-silently @FR4 @FR11
  Scenario: Both notices at once
    Given the list holds Lisbon and a build with another app revision is waiting
    When a check finds the newer release "2999a", which changes the rules of "Europe/Lisbon"
    Then both notices are shown, each with its own Reload, the zone rules one after the update notice

  @apply-data-updates-silently @FR11
  Scenario: Reload applies a silent update too
    Given the list holds Lisbon and a build with the running build's app revision is waiting
    And the update notice is not shown
    When the user chooses Reload on the zone rules update notice for the release "2999a"
    Then the waiting update is applied and the page is not reloaded separately

  @add-remote-zone-rules-updates @FR7 @UX1 @apply-data-updates-silently @FR8
  Scenario: Russian notice
    Given the interface language is Russian and the list holds Lisbon
    When a check finds the newer release "2999a", which changes the rules of "Europe/Lisbon"
    Then the notice reads "Доступны правила часовых поясов 2999a. Перезагрузите, чтобы применить."
