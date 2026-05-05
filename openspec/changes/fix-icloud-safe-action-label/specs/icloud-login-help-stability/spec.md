## ADDED Requirements

### Requirement: iCloud login helper uses stable action labels
The iCloud login helper SHALL use a stable initialized action label when handling login-required and transient-context errors.

#### Scenario: Transient iCloud context error during Step 4 login-state confirmation
- **WHEN** Step 4 calls the iCloud login helper and the iCloud context reports a transient error
- **THEN** the helper reports the transient iCloud error with the configured action label
- **AND** the helper MUST NOT throw a `Cannot access 'safeActionLabel' before initialization` error

### Requirement: iCloud verification flow remains restart-safe
The verification flow SHALL only restart because of the original iCloud session or mailbox condition, not because the login helper crashed while formatting its action label.

#### Scenario: iCloud helper emits final transient error
- **WHEN** retryable iCloud context errors are exhausted
- **THEN** the emitted error contains `ICLOUD_TRANSIENT_CONTEXT`
- **AND** the error action label matches the original operation label
