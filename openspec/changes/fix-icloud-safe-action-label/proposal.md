## Why

Step 4 can crash while confirming iCloud mailbox login state with `Cannot access 'safeActionLabel' before initialization`. The crash happens before mailbox polling starts, forcing unnecessary Step 1 restarts even when the iCloud session issue should be handled as a retryable context error.

## What Changes

- Remove the temporal-dead-zone access caused by redeclaring `safeActionLabel` inside `withIcloudLoginHelp`.
- Ensure transient iCloud context errors report a stable action label instead of crashing the verification step.
- Add regression coverage for the `withIcloudLoginHelp` transient error path.

## Capabilities

### New Capabilities
- `icloud-login-help-stability`: Stable iCloud login/session helper behavior for verification flows.

### Modified Capabilities

## Impact

- Affects `background.js` iCloud login helper error handling.
- Adds tests under `tests/background-icloud-login-help.test.js`.
- No API, storage, or dependency changes.
