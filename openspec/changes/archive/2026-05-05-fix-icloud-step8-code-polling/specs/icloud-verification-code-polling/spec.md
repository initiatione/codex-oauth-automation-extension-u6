## ADDED Requirements

### Requirement: iCloud polling detects visible verification code emails
The system SHALL detect a matching OpenAI or ChatGPT verification code email in iCloud even when the email is already visible at the start of a Step 8 polling session.

#### Scenario: Step 8 code is already first visible iCloud row
- **WHEN** Step 8 polls iCloud and the first visible email row contains a matching OpenAI or ChatGPT verification code
- **THEN** the polling flow returns that code without requiring a manual mailbox refresh

### Requirement: iCloud polling preserves same-session fallback progress
The system SHALL preserve iCloud poll-session fallback progress across repeated short polling calls that use the same session key.

#### Scenario: Step 8 is capped to one attempt per call
- **WHEN** Step 8 performs multiple iCloud polling calls with the same session key and each call has only one attempt
- **THEN** the calls accumulate fallback progress so matching visible emails can be inspected instead of being re-snapshotted forever

### Requirement: iCloud polling excludes rejected codes
The system MUST NOT return a verification code listed in the polling request's excluded codes.

#### Scenario: Visible iCloud code was already rejected
- **WHEN** a visible matching iCloud email contains a code that is included in `excludeCodes`
- **THEN** the polling flow skips that code and continues searching for another valid matching code
