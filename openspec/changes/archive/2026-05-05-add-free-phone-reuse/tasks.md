## 1. Regression Tests

- [x] 1.1 Add phone-flow tests proving automatic free reuse runs before paid reuse and new acquisition.
- [x] 1.2 Add phone-flow tests proving failed automatic free reuse stops without buying or reactivating another number.
- [x] 1.3 Add phone-flow tests proving free-reuse success increments use count and clears the record at `maxUses`.
- [x] 1.4 Add phone-flow tests proving used/exhausted phone errors clear matching free-reuse records.
- [x] 1.5 Add sidepanel tests proving the free-reuse switches, saved-phone display, save action, and clear action exist and update payload/state.

## 2. Background State and Messaging

- [x] 2.1 Add persisted settings for `freePhoneReuseEnabled` and `freePhoneReuseAutoEnabled`.
- [x] 2.2 Add runtime state preservation for `freeReusablePhoneActivation` across reset.
- [x] 2.3 Add background/message-router handlers for `SET_FREE_REUSABLE_PHONE` and `CLEAR_FREE_REUSABLE_PHONE`.
- [x] 2.4 Ensure clear/save handlers mutate only local state and do not call SMS-provider APIs.

## 3. Phone Verification Flow

- [x] 3.1 Normalize free-reuse activation records separately from paid reusable activations.
- [x] 3.2 Add HeroSMS-only preparation for automatic free reuse using status refresh and waiting-state polling.
- [x] 3.3 Insert automatic free-reuse handoff before preferred activation, paid reuse, provider fallback, and new acquisition.
- [x] 3.4 Insert manual free-reuse handoff that stops automation before paid provider reuse or buy calls.
- [x] 3.5 Save newly coded HeroSMS activations as free-reuse records when enabled.
- [x] 3.6 Skip completion/cancel status calls when preserving a HeroSMS activation for free reuse.
- [x] 3.7 Retire or clear free-reuse records on max use, provider cancellation, target used/exhausted errors, and replacement after failure.
- [x] 3.8 Keep 5sim and NexSMS behavior unchanged except that HeroSMS free reuse may preempt acquisition when explicitly enabled.

## 4. Sidepanel UI

- [x] 4.1 Add compact controls for free reuse and automatic free reuse inside the existing phone verification settings card.
- [x] 4.2 Add saved free-reuse phone display, input, save button, and clear button.
- [x] 4.3 Include free-reuse settings in `collectSettingsPayload`.
- [x] 4.4 Hydrate free-reuse switches and saved-phone runtime display from background state broadcasts.
- [x] 4.5 Disable or treat automatic free reuse as inactive when free reuse is disabled.

## 5. Verification

- [x] 5.1 Run targeted phone-flow tests for free-reuse behavior.
- [x] 5.2 Run targeted sidepanel phone-verification settings tests.
- [x] 5.3 Run the full JavaScript test suite with `npm test`.
- [x] 5.4 Review the final diff to ensure no unrelated OpenSpec or working-tree changes were reverted.
