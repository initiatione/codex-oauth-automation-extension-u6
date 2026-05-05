## MODIFIED Requirements

### Requirement: Reuse only after fresh SMS waiting state
Before automatically submitting a saved free-reuse phone number on a later Step 9 run, the system SHALL request a fresh HeroSMS SMS state and verify the activation is in an official provider waiting state for a new SMS, retry, or resend.

#### Scenario: Saved activation reaches waiting state
- **WHEN** automatic free reuse is enabled and a saved HeroSMS activation exists
- **THEN** the system SHALL call HeroSMS `setStatus(3)` before submitting the old phone number
- **THEN** the system SHALL wait a short settling delay after `setStatus(3)` before polling the activation status
- **THEN** the system SHALL accept `STATUS_WAIT_CODE`, `STATUS_WAIT_RETRY:*`, `STATUS_WAIT_RESEND`, `STATUS_WAIT_RESEND:*`, or an equivalent fresh no-code waiting payload as confirmation before submitting the phone number

#### Scenario: Status is checked after reactivation delay
- **WHEN** automatic free reuse starts a preparation round for a saved HeroSMS activation
- **THEN** the system SHALL request `setStatus(3)` first
- **THEN** the system SHALL wait before calling HeroSMS `getStatus` or `getStatusV2`
- **THEN** the system SHALL classify the returned status only after that delay

#### Scenario: Waiting-state suffix is not a verification code
- **WHEN** preparation observes `STATUS_WAIT_RETRY:<code-looking-value>` or `STATUS_WAIT_RESEND:<code-looking-value-or-info>`
- **THEN** the system SHALL treat the status as ready to submit the old phone number
- **THEN** the system SHALL NOT submit the suffix as the phone verification code

#### Scenario: Official waiting examples are accepted
- **WHEN** preparation observes official HeroSMS examples `STATUS_WAIT_RETRY:100001` or `STATUS_WAIT_RESEND`
- **THEN** the system SHALL treat the activation as ready for saved-phone submission
- **THEN** the system SHALL continue waiting for a later `STATUS_OK:<new-code>` before submitting any SMS code

#### Scenario: Saved activation is not ready for new SMS
- **WHEN** HeroSMS status remains `STATUS_OK:<old-code>`, cancelled, or otherwise not confirmed as a waiting state
- **THEN** the system SHALL NOT submit the old phone number to the target authentication page
- **THEN** the system SHALL NOT buy or reactivate another HeroSMS number as an automatic fallback for that run
