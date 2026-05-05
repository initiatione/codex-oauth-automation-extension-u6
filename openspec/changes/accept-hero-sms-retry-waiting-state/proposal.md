## Why

In a real automatic free-reuse run, HeroSMS showed the saved activation as "waiting for SMS resend" and returned `STATUS_WAIT_RETRY:<old-code>`, but the program kept refreshing and never submitted the old phone number. The official HeroSMS getStatus API examples define `STATUS_WAIT_RETRY:<code>` as "waiting for code confirmation" and `STATUS_WAIT_RESEND` as "waiting to resend SMS", so the current program is rejecting a documented waiting state.

## What Changes

- Treat official HeroSMS `STATUS_WAIT_RETRY:*` and `STATUS_WAIT_RESEND` / `STATUS_WAIT_RESEND:*` responses as valid waiting states during automatic free-reuse preparation.
- Keep `STATUS_WAIT_CODE` accepted as before.
- After reactivating the old saved number into waiting state with `setStatus(3)`, wait a short settling delay before testing status.
- Continue to treat `STATUS_OK:<code>` as a stale existing code during preparation, so it must not be submitted as the new verification code.
- Ensure suffixes on waiting states, such as `336310` in `STATUS_WAIT_RETRY:336310`, are never parsed or submitted as SMS codes; only `STATUS_OK:<code>` is code-bearing.
- Preserve the no-purchase boundary: if preparation still cannot reach an accepted waiting state, the flow stops and does not buy/reactivate another number.

## Capabilities

### New Capabilities

### Modified Capabilities
- `free-phone-reuse-preservation`: Broaden the accepted HeroSMS fresh waiting state for automatic free reuse to include official `STATUS_WAIT_RETRY:*` and `STATUS_WAIT_RESEND` examples.
- `free-phone-reuse`: Clarify that automatic free-reuse preparation succeeds when the saved HeroSMS activation reaches any provider waiting/resend state, not only plain `STATUS_WAIT_CODE`.

## Impact

- Affected background code: `background/phone-verification-flow.js`, specifically automatic free-reuse preparation status classification.
- Affected tests: `tests/phone-verification-flow.test.js`, with a regression for `STATUS_WAIT_RETRY:<old-code>` allowing phone submission but not code submission.
- Affected specs: `openspec/specs/free-phone-reuse-preservation/spec.md` and `openspec/specs/free-phone-reuse/spec.md`.
- No sidepanel, storage-key, provider-pricing, paid reuse, 5sim, NexSMS, or OAuth callback behavior changes are expected.
