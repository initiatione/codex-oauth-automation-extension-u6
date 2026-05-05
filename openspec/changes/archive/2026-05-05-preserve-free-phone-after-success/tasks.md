## 1. Regression Tests

- [x] 1.1 Add a failing phone-flow regression test for the real observed path: new HeroSMS activation receives `STATUS_OK`, saves `freeReusablePhoneActivation`, OAuth succeeds, and no HeroSMS `setStatus(6)` or `setStatus(8)` is sent for that activation.
- [x] 1.2 Add or confirm a test where the protected activation has no `source` marker and is still matched through the saved free-reuse record.
- [x] 1.3 Add or confirm a non-regression test proving a normal HeroSMS paid reusable activation still follows the existing completion and reusable-state update behavior when it does not match `freeReusablePhoneActivation`.
- [x] 1.4 Add or confirm tests for automatic free-reuse preparation: `setStatus(3)` must happen before old-number submit, and submit must wait for `STATUS_WAIT_CODE` or an equivalent no-code waiting payload.

## 2. Terminal Status Preservation

- [x] 2.1 Update the Step 9 success branch to use the full free-reuse terminal-skip predicate rather than only the narrower preservation predicate.
- [x] 2.2 Pass the latest runtime state into `completePhoneActivation` after code receipt and OAuth success so terminal-status guards can see the saved `freeReusablePhoneActivation`.
- [x] 2.3 Ensure generic cleanup after a coded free-reuse save uses latest state and does not send `setStatus(8)` for a protected activation.
- [x] 2.4 Keep the skip predicate HeroSMS-only and limited to explicit free-reuse activations or activations matching the saved free-reuse record by id or phone number.

## 3. Reuse Lifecycle Boundaries

- [x] 3.1 Verify that rejected, used, exhausted, cancelled, and max-use paths still retire or clear `freeReusablePhoneActivation` when the number is no longer usable.
- [x] 3.2 Verify that 5sim, NexSMS, provider fallback, price tiers, country selection, and manual preferred activation behavior are not changed by this fix.
- [x] 3.3 Keep sidepanel settings and storage keys unchanged; do not add new UI controls for this change.

## 4. Verification

- [x] 4.1 Run `node --test tests\phone-verification-flow.test.js`.
- [x] 4.2 Run `node --test tests\sidepanel-phone-verification-settings.test.js tests\background-message-router-module.test.js tests\run-count-unlimited.test.js`.
- [x] 4.3 Run `openspec validate preserve-free-phone-after-success --strict` or the project-equivalent OpenSpec validation command.
- [x] 4.4 Review the final diff to confirm only the intended phone-flow tests, phone-flow implementation, and this change's OpenSpec artifacts were edited.
