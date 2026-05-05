## Context

`withIcloudLoginHelp` normalizes `actionLabel` at function entry, but the transient-context error branch redeclares `const safeActionLabel` later in the same block. JavaScript treats the inner declaration as scoped to that block, so earlier references to `safeActionLabel` in the same block enter the temporal dead zone and throw before the intended transient error handling runs.

## Goals / Non-Goals

**Goals:**
- Keep Step 4 and Step 8 iCloud session confirmation from crashing on transient context errors.
- Preserve existing retry/logging behavior and user-facing transient error text.

**Non-Goals:**
- Change iCloud authentication detection semantics.
- Change mailbox polling or resend behavior.
- Add new iCloud network fallbacks.

## Decisions

- Reuse the already-normalized outer `safeActionLabel` throughout `withIcloudLoginHelp`.
- Add a source-level regression test that fails if the helper reintroduces a second `safeActionLabel` declaration or the transient error message no longer uses the stable label.

## Risks / Trade-offs

- Source-level tests do not execute the full browser runtime. Mitigation: keep the test targeted to the exact initialization-order regression and run existing iCloud helper tests plus full suite.
