## ADDED Requirements

### Requirement: Preserve coded free-reuse HeroSMS activation
When free phone reuse is enabled and a HeroSMS activation receives a valid SMS code, the system SHALL preserve that activation for future free reuse instead of sending provider terminal status after successful OAuth completion.

#### Scenario: New HeroSMS number is saved and OAuth succeeds
- **WHEN** Step 9 acquires a new HeroSMS number, receives `STATUS_OK:<code>`, saves `freeReusablePhoneActivation`, and the OAuth flow completes successfully
- **THEN** the system SHALL NOT call HeroSMS `setStatus(6)` for that activation
- **THEN** the system SHALL keep `freeReusablePhoneActivation` available for the next Step 9 run unless it has reached its configured use limit

#### Scenario: Saved free-reuse activation lacks a source marker
- **WHEN** the current HeroSMS activation matches the saved `freeReusablePhoneActivation` by activation id or phone number but does not contain a `source` field
- **THEN** the system SHALL treat it as protected free-reuse state for terminal-status decisions
- **THEN** the system SHALL NOT rely on `source: hero-sms-new` as the only preservation signal

### Requirement: Prevent cancel or ban release after coded free reuse
When a HeroSMS activation has been saved for free reuse after receiving a valid SMS code, the system SHALL NOT send terminal cancel or ban status for that activation during later cleanup unless the free-reuse record has first been retired because the number is unusable.

#### Scenario: Code submit errors after free-reuse record is saved
- **WHEN** Step 9 receives a valid HeroSMS SMS code, saves the activation as `freeReusablePhoneActivation`, and then code submission or OAuth-page interaction throws an error
- **THEN** the system SHALL NOT call HeroSMS `setStatus(8)` for the saved activation as generic cleanup
- **THEN** the saved free-reuse record SHALL remain available unless the error identifies the number as rejected, used, exhausted, cancelled, or max-use retired

### Requirement: Keep ordinary phone reuse lifecycle unchanged
The free-reuse preservation logic SHALL NOT alter normal paid phone reuse or new-number lifecycle behavior for activations that do not match the saved free-reuse record and do not have an explicit free-reuse source.

#### Scenario: Regular HeroSMS reuse without free-reuse match
- **WHEN** Step 9 completes with a regular HeroSMS activation from `reusablePhoneActivation` or `phoneReusableActivationPool` and there is no matching `freeReusablePhoneActivation`
- **THEN** the system SHALL continue to use the existing paid reuse completion behavior
- **THEN** the system SHALL update regular reusable activation state according to the existing max-use rules

#### Scenario: Non-HeroSMS providers
- **WHEN** Step 9 completes or cleans up a 5sim or NexSMS activation
- **THEN** the system SHALL continue to route terminal lifecycle operations through the existing provider-specific behavior

### Requirement: Reuse only after fresh SMS waiting state
Before automatically submitting a saved free-reuse phone number on a later Step 9 run, the system SHALL request a fresh HeroSMS SMS state and verify the activation is waiting for a new SMS.

#### Scenario: Saved activation reaches waiting state
- **WHEN** automatic free reuse is enabled and a saved HeroSMS activation exists
- **THEN** the system SHALL call HeroSMS `setStatus(3)` before submitting the old phone number
- **THEN** the system SHALL verify the activation is in `STATUS_WAIT_CODE` or an equivalent fresh no-code waiting payload before submitting the phone number

#### Scenario: Saved activation is not ready for new SMS
- **WHEN** HeroSMS status remains `STATUS_OK:<old-code>`, `STATUS_WAIT_RETRY`, `STATUS_WAIT_RESEND`, cancelled, or otherwise not confirmed as a fresh waiting-SMS state
- **THEN** the system SHALL NOT submit the old phone number to the target authentication page
- **THEN** the system SHALL NOT buy or reactivate another HeroSMS number as an automatic fallback for that run
