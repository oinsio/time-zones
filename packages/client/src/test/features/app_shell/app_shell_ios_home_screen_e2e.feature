Feature: Home-screen web app on iOS
  Implements change support-legacy-ios-12-safari.
  An app added to the iOS home screen opens full screen, like an installed app.

  @support-legacy-ios-12-safari @FR11
  Scenario: Page declares an iOS home-screen web app
    When the user opens the app
    Then the page declares an iOS home-screen web app
