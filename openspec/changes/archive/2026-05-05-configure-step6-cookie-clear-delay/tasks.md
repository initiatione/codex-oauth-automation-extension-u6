## 1. Regression Tests

- [x] 1.1 Add background settings tests for `step6CookieClearDelaySeconds` defaulting, clamping, and numeric normalization.
- [x] 1.2 Add Step 6 cookie cleanup tests proving the configured delay is read at cleanup start and converted to milliseconds.
- [x] 1.3 Add sidepanel tests proving the delay input exists, is included in settings payloads, hydrates from state, and locks while running.

## 2. Background Settings

- [x] 2.1 Add Step 6 cookie cleanup delay constants and persisted setting defaults.
- [x] 2.2 Add normalization for `step6CookieClearDelaySeconds`.
- [x] 2.3 Ensure settings import/export and state hydration include the new setting through existing persisted settings flow.

## 3. Step 6 Execution

- [x] 3.1 Replace the hard-coded cookie cleanup wait with a helper that reads the latest normalized persisted delay.
- [x] 3.2 Update Step 6 logging to show the effective configured wait in seconds.
- [x] 3.3 Keep cookie domain/origin cleanup scope unchanged.

## 4. Sidepanel UI

- [x] 4.1 Add a compact numeric input for Step 6 cookie cleanup wait time to the existing settings UI.
- [x] 4.2 Wire the input into sidepanel DOM bindings, settings hydration, and `collectSettingsPayload`.
- [x] 4.3 Disable the input whenever the settings card is locked by active automation or step execution.

## 5. Verification

- [x] 5.1 Run targeted background/Step 6 tests.
- [x] 5.2 Run targeted sidepanel settings tests.
- [x] 5.3 Run the full JavaScript test suite with `npm test` if targeted tests pass.
- [x] 5.4 Review the final diff to ensure unrelated working-tree changes were not reverted.
