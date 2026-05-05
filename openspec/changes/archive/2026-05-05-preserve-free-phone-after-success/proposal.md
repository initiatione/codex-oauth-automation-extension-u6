## Why

Automatic free phone reuse currently saves a HeroSMS number after a valid SMS code, but the Step 9 success path can still send HeroSMS terminal status after OAuth completes. That releases or completes the activation in the provider backend, so the saved number cannot reliably receive the next account's verification SMS.

## What Changes

- Preserve HeroSMS activations that are saved for free reuse after successful code receipt and OAuth completion.
- Ensure free-reuse terminal protection uses the latest runtime state, including the newly saved `freeReusablePhoneActivation`.
- Skip HeroSMS `setStatus(6)` and `setStatus(8)` only for the saved free-reuse activation or explicit free-reuse activation sources.
- Keep the existing paid "号码复用" path unchanged when the free-reuse record is absent, disabled, or does not match the current activation.
- Add regression coverage for the real observed path: new HeroSMS number, SMS code received, free-reuse record saved, OAuth success, and no terminal provider release.
- Preserve the automatic free-reuse preparation rule: before submitting the saved old number, request `setStatus(3)`, verify it is in a fresh SMS waiting state, then wait for the new SMS code.

## Capabilities

### New Capabilities
- `free-phone-reuse-preservation`: Defines the terminal-status and next-run reuse behavior for HeroSMS numbers saved under free phone reuse.

### Modified Capabilities

## Impact

- Affected background code: `background/phone-verification-flow.js`.
- Affected tests: `tests/phone-verification-flow.test.js`, with targeted regression cases for free-reuse terminal-status protection and non-regression of normal paid reuse.
- No new dependencies, storage keys, provider APIs, or sidepanel controls are expected.
- Non-goals: do not change 5sim/NexSMS behavior, regular paid HeroSMS reuse semantics, country fallback, pricing, manual preferred activation, or unrelated signup/email/proxy flows.
