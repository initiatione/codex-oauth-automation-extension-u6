## Context

Automatic free reuse prepares a saved HeroSMS activation by calling `setStatus(3)` and polling status before submitting the old phone number to the target auth page. The current Ultra6 implementation only treats `STATUS_WAIT_CODE` as ready for submission. In the observed live run, HeroSMS returned `STATUS_WAIT_RETRY:336310` and the UI showed "waiting for SMS resend", but the extension kept refreshing instead of submitting the old number.

The official HeroSMS getStatus API examples include:
- `STATUS_WAIT_CODE` for waiting for SMS.
- `STATUS_WAIT_RETRY:100001` for waiting for code confirmation.
- `STATUS_WAIT_RESEND` for waiting to resend SMS.
- `STATUS_OK:100001` only when a code has actually arrived.

The original project documentation also describes `STATUS_WAIT_CODE`, `STATUS_WAIT_RETRY`, and `STATUS_WAIT_RESEND` as waiting states for automatic free-reuse preparation. The suffix on `WAIT_RETRY` can contain a code-looking value; it is not a fresh verification code for the current target request and must never be submitted.

## Goals / Non-Goals

**Goals:**
- Accept official HeroSMS `STATUS_WAIT_RETRY:*` and `STATUS_WAIT_RESEND` / `STATUS_WAIT_RESEND:*` as successful preparation states for automatic free reuse.
- Keep `STATUS_WAIT_CODE` accepted as before.
- Keep a short settling delay after each `setStatus(3)` request before polling HeroSMS status.
- Continue to retry stale `STATUS_OK:<code>` during preparation.
- Ensure suffixes on waiting states are ignored as SMS codes; only `STATUS_OK:<code>` can yield a verification code.
- Preserve the safety rule that preparation failure stops the run without buying or reactivating another number.

**Non-Goals:**
- Do not change normal SMS-code extraction during the post-submit wait; only `STATUS_OK:<code>` should produce a verification code.
- Do not change terminal-status preservation, max-use accounting, sidepanel controls, storage keys, paid HeroSMS reuse, 5sim, NexSMS, pricing, country fallback, or OAuth callback behavior.
- Do not add new HeroSMS API calls.

## Decisions

1. **Separate "ready to submit phone" from "received SMS code".**
   Preparation status classification should answer only whether the saved activation is ready for the target service to request a new SMS. Official waiting states, including `STATUS_WAIT_RETRY:<code-looking-value>`, are ready for submission but are not code-bearing statuses.

   Alternative considered: continue requiring plain `STATUS_WAIT_CODE`. The live HeroSMS UI shows this is too strict and blocks valid waiting-resend states.

2. **Use the existing waiting-state matcher for preparation readiness.**
   The code already has `isHeroSmsWaitingStatusText()` matching `STATUS_WAIT_CODE`, `STATUS_WAIT_RETRY`, and `STATUS_WAIT_RESEND`. Reusing that matcher for readiness keeps all accepted waiting states in one place while retaining the separate `STATUS_OK` branch for stale-code retry.

   Alternative considered: add a new duplicate regex in the preparation loop. That risks future drift between "waiting" and "ready" definitions.

3. **Preserve setStatus(3) settling time.**
   Each automatic free-reuse preparation round must call `setStatus(3)`, wait a short delay, then poll `getStatus` or `getStatusV2`. This avoids reading the provider state before HeroSMS has finished moving the old activation into waiting/retry/resend state.

   Alternative considered: poll immediately after `setStatus(3)`. The live logs show provider state changes can lag, so immediate polling makes false negatives more likely.

4. **Test the exact live shape.**
   Add regression tests where preparation sees official examples `STATUS_WAIT_RETRY:100001` and `STATUS_WAIT_RESEND`, submits the old phone number, and later waits for a new `STATUS_OK:<new-code>` after the target page requests SMS.

## Risks / Trade-offs

- Waiting-state suffix might look like a six-digit code -> Tests must prove the suffix is not submitted as the verification code.
- Accepting retry/resend states could submit sooner than before -> The provider UI indicates these are waiting/resend states, and post-submit code polling still requires `STATUS_OK:<code>` for the actual SMS code.
- Spec drift after previous archive -> Update both relevant main capabilities through a delta spec so future changes do not reintroduce the stricter interpretation.
