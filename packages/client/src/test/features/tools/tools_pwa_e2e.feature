Feature: Tool pages in an installed app
  Implements change add-unix-time-converter-tool.
  As a user I open a tool page without waiting for it on every start, with
  the update notices at hand and with no network.

  @add-unix-time-converter-tool @NFR-P1
  Scenario: The page is not in the initial JavaScript
    Given the script requests of the page are recorded
    When the user opens the app with no tool enabled
    Then the scripts of the app are recorded as the initial scripts
    When the user turns the tool on and chooses its button
    Then a script that was not among the initial scripts is requested

  @add-unix-time-converter-tool @FR5
  Scenario: Notices on a tool page
    Given a newer zone rules release is published
    When the user opens the app
    And the user turns the tool on and chooses its button
    Then the zone rules update notice is announced on the tool page

  @add-unix-time-converter-tool @NFR-P1
  Scenario: Offline
    Given the user has visited the app once
    And the tool is turned on and the app is reloaded
    When the user goes offline and reopens the app
    And the user chooses the tool button of the offline app
    Then the tool page heading is shown in the offline app
