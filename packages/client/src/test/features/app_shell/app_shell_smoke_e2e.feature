Feature: App shell smoke check against the production build
  Implements change setup-app-shell-and-pages-deploy.
  The published app opens under its sub-path, speaks the user's language,
  installs as a PWA, keeps working offline and stays accessible on any screen.

  @setup-app-shell-and-pages-deploy @FR1
  Scenario: User opens the published address
    When the user opens the app
    Then the page heading reads "Time Zones"
    And no resource request has failed

  @setup-app-shell-and-pages-deploy @FR1
  Scenario: Service worker controls only the app sub-path
    When the user opens the app
    Then the service worker scope is the app base path

  @setup-app-shell-and-pages-deploy @FR2
  Scenario Outline: User sees the app in their browser language
    Given the user's browser language is "<browser language>"
    When the user opens the app
    Then the page heading reads "<title>"
    And the document title reads "<title>"
    And the page language is "<language>"

    Examples:
      | browser language | language | title         |
      | en-US            | en       | Time Zones    |
      | ru-RU            | ru       | Часовые пояса |

  @setup-app-shell-and-pages-deploy @FR3
  Scenario: App can be installed to the home screen
    When the user opens the app
    Then the app manifest describes an installable app
    And every icon of the app is reachable

  @setup-app-shell-and-pages-deploy @FR5 @M3
  Scenario: User reopens the app without network
    Given the user has visited the app once
    When the user reopens the app without network
    Then the page heading reads "Time Zones"

  @setup-app-shell-and-pages-deploy @NFR-A1 @NFR-A3 @M2
  Scenario Outline: App is accessible in the <color scheme> theme
    Given the system prefers the <color scheme> color scheme
    And the user has visited the app once
    Then the page has no accessibility violations

    Examples:
      | color scheme |
      | light        |
      | dark         |

  @setup-app-shell-and-pages-deploy @NFR-R1
  Scenario Outline: App fits a <width> px wide screen
    Given the screen is <width> px wide
    When the user opens the app
    Then the page does not scroll horizontally

    Examples:
      | width |
      | 320   |
      | 2560  |
