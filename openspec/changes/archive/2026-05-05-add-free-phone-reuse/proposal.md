## Why

The current phone verification reuse path can call SMS-provider reuse/reactivation APIs, which may charge again each time a number is reused. We need a local free-reuse mode that can reuse the same saved HeroSMS number without buying or reactivating a paid order.

## What Changes

- Add a local "free phone reuse" capability for HeroSMS numbers.
- Save the first successfully coded HeroSMS phone number when free reuse is enabled.
- Prefer the saved free-reuse number before paid same-number reactivation, reusable activation pools, or new number acquisition.
- Support two front-end switches: manual free reuse and automatic free reuse.
- In automatic mode, prepare the saved HeroSMS activation by requesting a new SMS status and polling until the old code is gone, then submit and poll normally.
- In manual mode, fill or hand off the saved phone number and stop the automated run so the user can refresh/retrieve the code manually.
- Clear the saved free-reuse record when it reaches the configured use limit or when the target service rejects it as used/exhausted.
- Do not change 5sim or NexSMS reuse semantics.

## Capabilities

### New Capabilities
- `free-phone-reuse`: Local, non-paid reuse of a saved HeroSMS phone number with sidepanel controls, lifecycle rules, and verification behavior.

### Modified Capabilities

## Impact

- Affected background code: `background/phone-verification-flow.js`, `background.js`, and message routing for free-reuse save/clear actions.
- Affected sidepanel code: `sidepanel/sidepanel.html`, `sidepanel/sidepanel.js`, and related CSS if layout needs adjustment.
- Affected tests: phone verification flow tests, sidepanel settings tests, and message-router/background state tests as needed.
- No new dependencies are expected.
