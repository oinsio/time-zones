## ADDED Requirements

### Requirement: Share language and share zone label are kept on the device
The pinned share language and the share zone label SHALL be saved in the versioned preferences document with the other preferences and restored when the app is opened again, also offline. The pinned share language is a language of the locale registry or none; none means that the share language follows the interface language. The share zone label is the set of shown parts out of the zone abbreviation and the UTC offset; it never holds the country. The existing rules of the requirement "Preferences are kept on the device" apply: nothing is written until the user changes a choice, a change applies at once and its write is debounced. A change in one tab MUST be applied in every other open tab without a reload, and the last write wins. Neither choice is shown on the settings page, and neither changes the zone label setting or the interface language. A document written before these choices existed MUST be migrated: it gets no pinned share language and a share zone label with both parts, and every other stored choice is kept. A document whose pinned share language is neither a non-empty string nor none, or whose share zone label holds an unknown part or the country, is unreadable, and the existing unreadable note with Reset applies. A pinned share language that is a well-formed tag but is no longer in the locale registry MUST be treated as none. Inputs: the stored document. Output: the pinned share language and the share zone label in force. <!-- implements FR5, FR6 of add-meeting-share-dialog -->

#### Scenario: The pinned share language survives a reload
- **GIVEN** the interface language is Russian and the user pinned the share language English
- **WHEN** the app is opened again
- **THEN** the pinned share language is English and the interface language is Russian

#### Scenario: The share zone label survives a reload
- **GIVEN** the user turned the UTC offset of the share zone label off
- **WHEN** the app is opened again
- **THEN** the share zone label shows the zone abbreviation only
- **AND** the zone label setting still shows the country, the zone abbreviation and the UTC offset

#### Scenario: Existing users get the defaults
- **GIVEN** a stored preferences document of the previous version with the theme Dark and the interface language Russian
- **WHEN** the app is opened
- **THEN** no share language is pinned, the share zone label shows the zone abbreviation and the UTC offset, the theme is Dark and the interface language is Russian

#### Scenario: Unreadable share choices
- **GIVEN** a stored preferences document of the current version whose `<field>` is `<value>`
- **WHEN** the app is opened
- **THEN** the unreadable preferences note with Reset is shown

| field | value |
|---|---|
| share zone label | the country |
| share zone label | an unknown part `CITY` |
| pinned share language | the number 5 |
| pinned share language | an empty string |

#### Scenario: A pinned language that the app no longer has
- **GIVEN** a stored preferences document whose pinned share language is `de`, which the locale registry does not have
- **WHEN** the app is opened
- **THEN** no share language is pinned and no unreadable note is shown

#### Scenario: Another tab changes the share choices
- **GIVEN** the app is open in two tabs
- **WHEN** the user pins the share language English in the first tab
- **THEN** the second tab has the pinned share language English without a reload

#### Scenario: Nothing is written before a change
- **GIVEN** a device with no stored preferences
- **WHEN** the user opens the share dialog and closes it without changing a choice
- **THEN** no preferences document is written
