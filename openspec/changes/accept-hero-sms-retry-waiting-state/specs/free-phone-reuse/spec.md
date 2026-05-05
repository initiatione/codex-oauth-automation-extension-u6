## MODIFIED Requirements

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
- **THEN** the system SHALL request a new SMS waiting state for the saved activation with `setStatus(3)`
- **THEN** the system SHALL wait a short settling delay before polling the activation status
- **THEN** the system SHALL poll until the activation is in `STATUS_WAIT_CODE`, `STATUS_WAIT_RETRY:*`, `STATUS_WAIT_RESEND`, `STATUS_WAIT_RESEND:*`, or an equivalent no-code waiting payload

#### Scenario: Waiting retry state allows saved-phone submission
- **WHEN** automatic free reuse preparation observes official waiting examples such as `STATUS_WAIT_RETRY:100001`, `STATUS_WAIT_RESEND`, or `STATUS_WAIT_RESEND:<info>`
- **THEN** the system SHALL submit the saved phone number to the target auth page
- **THEN** the system SHALL continue waiting for a later `STATUS_OK:<new-code>` before submitting any SMS code

#### Scenario: Stale code is not submitted as fresh
- **WHEN** preparation observes an existing `STATUS_OK` code from the saved activation
- **THEN** the system SHALL retry preparation instead of submitting the stale code immediately
