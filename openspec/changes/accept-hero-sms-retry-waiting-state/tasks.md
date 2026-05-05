## 1. Regression Tests

- [x] 1.1 Add a failing phone-flow test where automatic free-reuse preparation calls `setStatus(3)`, waits before status polling, receives official `STATUS_WAIT_RETRY:100001`, and proceeds to submit the saved old phone number.
- [x] 1.2 In that test, assert the `WAIT_RETRY` suffix is not submitted as the SMS verification code; the code submission must use a later `STATUS_OK:<new-code>`.
- [x] 1.3 Add or extend coverage for official `STATUS_WAIT_RESEND` and `STATUS_WAIT_RESEND:<info>` as accepted preparation waiting states.
- [x] 1.4 Keep the existing never-ready/stale `STATUS_OK:<old-code>` preparation test proving the flow still stops without buying or reactivating when no accepted waiting state is reached.

## 2. Status Classification

- [x] 2.1 Ensure each automatic free-reuse preparation round calls `setStatus(3)`, waits the configured settling delay, then polls status.
- [x] 2.2 Update automatic free-reuse preparation readiness so `STATUS_WAIT_CODE`, `STATUS_WAIT_RETRY:*`, `STATUS_WAIT_RESEND`, and `STATUS_WAIT_RESEND:*` are accepted before submitting the saved phone number.
- [x] 2.3 Preserve post-submit SMS code parsing semantics so only `STATUS_OK:<code>` yields a verification code.
- [x] 2.4 Keep cancelled, unknown, and stale `STATUS_OK:<old-code>` preparation behavior unchanged.
- [x] 2.5 Keep the no-purchase fallback boundary unchanged when preparation fails.

## 3. Verification

- [x] 3.1 Run `node --test tests\phone-verification-flow.test.js`.
- [x] 3.2 Run `openspec validate accept-hero-sms-retry-waiting-state --strict`.
- [x] 3.3 Review the final diff to confirm only phone-flow status classification, targeted tests, and this change's OpenSpec artifacts were edited.
