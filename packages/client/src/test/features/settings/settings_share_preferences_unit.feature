Feature: Share choices storage
  Implements change add-meeting-share-dialog.
  As a user my pinned share language and my share zone label are kept on the device, survive a reload and follow me across tabs.

  Background:
    Given the interface language is Russian and the Grid view shows the sample meeting

  @add-meeting-share-dialog @FR5
  Scenario: The pinned share language survives a reload
    Given the user pinned the share language "English"
    When the app is opened again
    Then the pinned share language is "English" and the interface language is Russian

  @add-meeting-share-dialog @FR6
  Scenario: The share zone label survives a reload
    Given the user turned the UTC offset of the share zone label off
    When the app is opened again
    Then the share zone label shows the zone abbreviation only
    And the zone label setting still shows the country, the zone abbreviation and the UTC offset

  @add-meeting-share-dialog @FR5 @FR6
  Scenario: Existing users get the defaults
    Given a stored preferences document of the previous version with the theme Dark and the interface language Russian
    When the app is opened
    Then no share language is pinned, the share zone label shows the zone abbreviation and the UTC offset, the theme is Dark and the interface language is Russian

  @add-meeting-share-dialog @FR5 @FR6
  Scenario Outline: Unreadable share choices
    Given a stored preferences document of the current version whose <field> is <value>
    When the app is opened
    Then the unreadable preferences note with Reset is shown

    Examples:
      | field                 | value                |
      | share zone label      | ["COUNTRY"]          |
      | share zone label      | ["CITY"]             |
      | pinned share language | 5                    |
      | pinned share language | ""                   |

  @add-meeting-share-dialog @FR5
  Scenario: A pinned language that the app no longer has
    Given a stored preferences document whose pinned share language is "de", which the locale registry does not have
    When the app is opened
    Then no share language is pinned and no unreadable note is shown

  @add-meeting-share-dialog @FR5
  Scenario: Another tab changes the share choices
    Given the app is open
    When another tab pins the share language "English"
    Then this tab has the pinned share language "English" without a reload

  @add-meeting-share-dialog @FR5 @FR6
  Scenario: Nothing is written before a change
    Given a device with no stored preferences except the Grid view
    When the user opens the share dialog and closes it without changing a choice
    Then the stored preferences document is as it was
