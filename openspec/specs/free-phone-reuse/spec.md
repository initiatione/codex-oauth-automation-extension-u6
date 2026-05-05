# free-phone-reuse Specification

## Purpose
TBD - created by archiving change add-free-phone-reuse. Update Purpose after archive.
## Requirements
### Requirement: Free Reuse Settings
The system SHALL expose and persist user settings for HeroSMS free phone reuse.

#### Scenario: Settings are visible in the sidepanel
- **WHEN** the user opens the phone verification settings
- **THEN** the sidepanel SHALL show controls for enabling free phone reuse and automatic free phone reuse

#### Scenario: Settings are saved with other phone settings
- **WHEN** the user changes the free-reuse switches and saves settings
- **THEN** the settings payload SHALL include `freePhoneReuseEnabled` and `freePhoneReuseAutoEnabled`

#### Scenario: Automatic free reuse depends on free reuse
- **WHEN** free phone reuse is disabled
- **THEN** the automatic free-reuse control SHALL be disabled or treated as inactive

### Requirement: Saved Free Reuse Record Management
The system SHALL manage a separate saved HeroSMS phone record for free reuse.

#### Scenario: User saves a phone manually
- **WHEN** the user enters a phone number in the saved free-reuse phone field and clicks save
- **THEN** the background SHALL store it as `freeReusablePhoneActivation` with provider `hero-sms` and source `free-manual-reuse`

#### Scenario: User clears a saved phone
- **WHEN** the user clicks the clear saved free-reuse phone action
- **THEN** the background SHALL clear only `freeReusablePhoneActivation` and SHALL NOT call SMS-provider APIs

#### Scenario: Reset preserves saved phone
- **WHEN** the extension resets runtime state between automation rounds
- **THEN** the saved `freeReusablePhoneActivation` SHALL remain available until explicitly cleared, retired, or rejected

### Requirement: Save First Successful HeroSMS Number
The system SHALL save a newly acquired HeroSMS number for future free reuse when free reuse is enabled.

#### Scenario: New HeroSMS activation receives a code
- **WHEN** a new HeroSMS activation receives a valid SMS code and `freePhoneReuseEnabled` is true
- **THEN** the system SHALL persist that activation as `freeReusablePhoneActivation`

#### Scenario: Other providers do not create free-reuse records
- **WHEN** a 5sim or NexSMS activation receives a valid SMS code
- **THEN** the system SHALL NOT persist it as `freeReusablePhoneActivation`

#### Scenario: Existing free-reuse record is not overwritten
- **WHEN** a free-reuse record already exists and a new HeroSMS activation receives a code
- **THEN** the system SHALL keep the existing saved record unless it has been cleared or retired

### Requirement: Automatic Free Reuse Precedence
The system SHALL try an enabled saved HeroSMS free-reuse record before paid reuse or new acquisition.

#### Scenario: Saved automatic free-reuse record exists
- **WHEN** Step 9 starts on add-phone with `freePhoneReuseEnabled` and `freePhoneReuseAutoEnabled` true and a valid saved record exists
- **THEN** the system SHALL prepare and submit that saved HeroSMS number before trying preferred activation, `reusablePhoneActivation`, `phoneReusableActivationPool`, provider fallback, paid `reactivate`, or new number acquisition

#### Scenario: Automatic free reuse avoids paid provider requests
- **WHEN** automatic free reuse is selected and preparation succeeds
- **THEN** the system SHALL NOT call HeroSMS `reactivate`, HeroSMS `getNumber`, HeroSMS `getNumberV2`, the 5sim reuse endpoint, or provider buy endpoints before submitting the saved phone

#### Scenario: Automatic free reuse prepares the saved activation
- **WHEN** automatic free reuse prepares a saved HeroSMS activation
- **THEN** the system SHALL request a new SMS waiting state for the saved activation and poll until the activation is waiting for a fresh SMS

#### Scenario: Stale code is not submitted as fresh
- **WHEN** preparation observes an existing `STATUS_OK` code from the saved activation
- **THEN** the system SHALL retry preparation instead of submitting the stale code immediately

### Requirement: Automatic Free Reuse Failure Stops Without Purchase
The system SHALL stop the current phone flow rather than buying a number when automatic free reuse cannot be prepared.

#### Scenario: Saved activation is cancelled
- **WHEN** automatic free reuse preparation sees a cancelled saved HeroSMS activation
- **THEN** the system SHALL clear the saved record, stop the current automation attempt, and SHALL NOT buy or reactivate another number

#### Scenario: Saved activation never reaches waiting state
- **WHEN** automatic free reuse preparation times out or fails before reaching a waiting state
- **THEN** the system SHALL stop the current automation attempt and SHALL NOT buy or reactivate another number

### Requirement: Manual Free Reuse Handoff
The system SHALL support manual reuse of the saved phone without performing paid reuse or new acquisition.

#### Scenario: Manual free reuse is selected
- **WHEN** Step 9 starts with `freePhoneReuseEnabled` true, `freePhoneReuseAutoEnabled` false, and a saved record exists
- **THEN** the system SHALL hand off the saved phone number to the auth page or user workflow and stop the automated run for manual SMS refresh/code entry

#### Scenario: Manual free reuse avoids paid provider requests
- **WHEN** manual free reuse is selected
- **THEN** the system SHALL NOT call HeroSMS `reactivate`, HeroSMS `getNumber`, HeroSMS `getNumberV2`, the 5sim reuse endpoint, or provider buy endpoints before stopping for manual handoff

### Requirement: Free Reuse Lifecycle
The system SHALL retire or update the saved free-reuse record according to verification outcomes.

#### Scenario: Automatic free reuse succeeds below max uses
- **WHEN** an automatic free-reuse verification succeeds and the saved record has not reached `maxUses`
- **THEN** the system SHALL increment `successfulUses` and keep the saved record for later runs

#### Scenario: Automatic free reuse reaches max uses
- **WHEN** an automatic free-reuse verification succeeds and the next use count reaches `maxUses`
- **THEN** the system SHALL clear `freeReusablePhoneActivation`

#### Scenario: Target reports phone already used
- **WHEN** the target service rejects the saved phone as already used or maximum usage exceeded
- **THEN** the system SHALL clear matching current, paid reusable, pool, and free-reuse records for that phone number before trying another number

#### Scenario: Free auto-reuse activation is replaced after failure
- **WHEN** a free auto-reuse activation must be replaced because verification cannot complete
- **THEN** the system SHALL clear the saved free-reuse record before proceeding

