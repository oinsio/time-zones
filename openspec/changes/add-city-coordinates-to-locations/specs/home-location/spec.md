# Spec Delta: home-location

## MODIFIED Requirements

### Requirement: Home is kept on the device
The home location SHALL be saved on the device together with the list and restored on the next open, also offline. Nothing MUST be written until the user changes the list or home, or until city locations gain their coordinates (see the `locations` requirement "Stored locations gain coordinates"). A list stored by a document version without home (version 1) MUST open with the same locations, in the same order, without home. <!-- implements FR8 of set-home-location-and-show-differences ; FR8 of add-city-coordinates-to-locations -->

#### Scenario: Home survives a reload
- **GIVEN** the user added Almaty and Moscow and made Moscow home
- **WHEN** the app is opened again
- **THEN** Moscow is the home location

#### Scenario: A list from the previous version
- **GIVEN** the stored list is a version 1 document with Almaty, Moscow and Kolkata
- **WHEN** the app is opened
- **THEN** the list is Almaty, Moscow, Kolkata in that order
- **AND** no location is home
- **AND** nothing is written
