## Context

The existing `add-free-phone-reuse` change introduced a HeroSMS-only free-reuse record, automatic preparation with `setStatus(3)`, and terminal-status skipping for some free-reuse paths. A real Step 9 run showed a remaining gap: after a new HeroSMS number received a valid SMS code and was saved as `freeReusablePhoneActivation`, OAuth completed and HeroSMS still showed the activation as finished/released.

The observed gap is in the final success branch. The code saves the free-reuse record after `STATUS_OK`, but the later completion decision can still use a narrower predicate and then call `completePhoneActivation` with the older state snapshot. That means the lower-level terminal-status guard may not see the just-saved `freeReusablePhoneActivation`.

## Goals / Non-Goals

**Goals:**
- Preserve a HeroSMS activation after it receives a valid code when free phone reuse is enabled.
- Ensure OAuth success does not send `setStatus(6)` for the saved free-reuse activation.
- Ensure error/cancel paths after a valid code do not send `setStatus(8)` for the saved free-reuse activation unless the saved record has been explicitly retired as unusable.
- Keep automatic next-run reuse strict: call `setStatus(3)`, confirm a fresh waiting-SMS state, then submit the old number and wait for the new code.
- Prove ordinary paid reuse remains unchanged when no matching free-reuse record applies.

**Non-Goals:**
- Do not change the sidepanel controls or add new settings.
- Do not change paid HeroSMS reuse, 5sim reuse, NexSMS behavior, provider fallback, pricing, country selection, or preferred activation ordering except where free reuse already preempts acquisition by design.
- Do not attempt to recover provider-side activations already completed before this fix.

## Decisions

1. **Use one terminal-status predicate for all free-reuse release decisions.**
   The success branch should call the same predicate used by `setPhoneActivationStatus`, `completePhoneActivation`, `cancelPhoneActivation`, and `banPhoneActivation`. The predicate must match explicit free-reuse sources and the saved `freeReusablePhoneActivation` by activation identity or phone number.

   Alternative considered: keep the narrower `shouldPreserveActivationForFreeReuse` check in the success branch. That is too fragile because newly acquired HeroSMS activations may not carry a `source` marker.

2. **Use the latest runtime state before final completion/cancel decisions.**
   After saving the free-reuse record, final success handling must use `await getState()` and pass that latest state into terminal-status helpers. This ensures the just-persisted free-reuse record is visible at the point where `setStatus(6)` or `setStatus(8)` would otherwise be sent.

   Alternative considered: add `source: hero-sms-new` to new activation parsing. That may be useful, but it does not cover older persisted activations or stale snapshots by itself.

3. **Keep the skip scope narrow.**
   Terminal calls are skipped only for HeroSMS activations that are the saved free-reuse record, have an explicit free-reuse source, or otherwise meet the preservation rule. Non-matching normal reusable activations still finish/cancel through their existing provider flow.

   Alternative considered: skip all HeroSMS terminal status when free reuse is enabled. That would break normal paid reuse and normal new-number lifecycle cleanup.

4. **Test the real failure shape.**
   Add a regression test where a new HeroSMS number is acquired, no special `source` marker is present, `STATUS_OK` saves `freeReusablePhoneActivation`, code submit succeeds, and the request log contains no `setStatus(6)` or `setStatus(8)` for that activation.

## Risks / Trade-offs

- Provider lifecycle ambiguity -> Scope terminal skipping only to free-reuse records and assert normal paid reuse still calls the expected provider completion.
- Stale state at different exit points -> Use latest state at final success and cleanup paths that can run after a code has been received.
- False preservation of rejected numbers -> Existing retire/clear behavior for target-service used/exhausted errors and provider cancellation remains in force, and tests should cover that matching free records are removed in those paths.
