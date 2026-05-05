## Context

The extension already supports automated phone verification through HeroSMS, 5sim, and NexSMS. The existing reusable activation path is provider-level reuse: for HeroSMS it calls `reactivate`, and for 5sim it calls a reuse endpoint. Those paths can create another billable provider operation, which is not the desired behavior when the user wants to keep using the same phone number after already paying once.

The source implementation in `D:\chrome-codex-tool\codex-oauth-automation-extension` includes a HeroSMS-only free-reuse flow with sidepanel switches and local state. The current Ultra6 branch has a more advanced multi-provider SMS flow, so the migration must be localized rather than replacing whole files.

## Goals / Non-Goals

**Goals:**
- Add a HeroSMS-only local free-reuse mode that uses a saved activation/number without calling paid reuse or new-number acquisition first.
- Preserve the current 5sim/NexSMS provider selection, fallback ordering, and reusable activation pool behavior.
- Expose sidepanel switches and save/clear controls so the user can opt into the behavior and manage the saved phone number.
- Keep the saved phone record across per-run resets until it is cleared, exhausted, or rejected by the target service.
- Cover behavior with focused regression tests before implementation.

**Non-Goals:**
- Do not implement free reuse for 5sim or NexSMS.
- Do not change provider pricing, country fallback, preferred activation selection, or existing paid reuse semantics except for free-reuse precedence when the saved HeroSMS record is enabled.
- Do not introduce a new dependency or a new external service.
- Do not change unrelated signup, payment, email, or proxy flows.

## Decisions

1. **Model free reuse as separate local state.**
   Store the saved record as `freeReusablePhoneActivation` instead of reusing `reusablePhoneActivation` or `phoneReusableActivationPool`. This keeps billable provider reuse and local free reuse visibly separate and lets the UI show a dedicated saved phone.

2. **Make free reuse HeroSMS-only.**
   The free-reuse record normalizes to provider `hero-sms` and uses HeroSMS status APIs only. This avoids accidental routing through 5sim/NexSMS providers when the selected provider is different.

3. **Give automatic free reuse highest acquisition priority.**
   When `freePhoneReuseEnabled` and `freePhoneReuseAutoEnabled` are true and a valid saved record exists, Step 9 prepares that saved activation before trying preferred activation, paid reuse, reusable pool entries, provider fallback, or new acquisition. This is the only ordering that guarantees the no-extra-paid-request behavior.

4. **Treat preparation failure as a stop condition, not a fallback.**
   If the saved free-reuse activation cannot be moved into a waiting state, the flow stops and does not purchase a new HeroSMS number. This prevents an unexpected charge after the user explicitly chose the free-reuse path.

5. **Preserve the activation after a first successful code when free reuse is enabled.**
   When a new HeroSMS activation receives a code, save it as `freeReusablePhoneActivation`. On final success, skip HeroSMS completion status where needed to preserve the order for later manual/automatic reuse.

6. **Retire bad or exhausted records aggressively.**
   Clear the saved free-reuse record when the target service reports the phone is already used or exceeded, when the provider says the activation is cancelled, or when successful reuse reaches `maxUses`.

7. **Keep sidepanel controls compact and colocated with SMS settings.**
   Add the free-reuse switches and saved-phone controls inside the existing phone verification card, using the same grid and runtime display patterns as the current SMS settings.

## Risks / Trade-offs

- **Provider status semantics can drift** -> Match the known HeroSMS waiting/cancel/OK statuses and keep tests around stale-code retry, cancellation, and success.
- **Stopping on preparation failure may interrupt bulk automation** -> This is intentional because falling back to paid acquisition would violate the cost-control requirement.
- **Manual mode may need content-script support to truly fill without submit** -> If the current content script only supports submit-and-continue, add a narrow message for fill-only behavior or clearly stop immediately after handoff.
- **Free reuse could conflict with paid preferred activation** -> Free reuse wins only when explicitly enabled and a saved record exists; otherwise the current preferred activation and provider flow remain unchanged.
- **Persisted state can outlive useful provider orders** -> Clear records on provider cancellation, target-service used/exhausted errors, and manual clear.
