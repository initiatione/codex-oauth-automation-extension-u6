## Context

iCloud mailbox polling currently snapshots the visible thread list and skips all snapshot entries until fallback mode starts. Step 8 can be capped to one polling attempt per background call because the OAuth flow has a limited remaining time budget. In that shape, a code email that is already visible as the first row can be repeatedly treated as old mail before fallback gets a useful chance to inspect it.

## Goals / Non-Goals

**Goals:**
- Detect a visible OpenAI/ChatGPT verification code email during Step 8 iCloud polling.
- Keep same-session progress across repeated short polling calls.
- Avoid reusing codes that the verification page has already rejected.

**Non-Goals:**
- Change non-iCloud mailbox providers.
- Change the OAuth resend policy or global verification timeout model.
- Add new dependencies or storage migrations.

## Decisions

- Treat Step 8 iCloud polling as "visible-first friendly": after the same session has accumulated enough no-code attempts, fallback scanning MUST be able to inspect rows that were present in the initial snapshot.
- Persist iCloud poll-session carry-over on no-code failures so repeated `maxAttempts: 1` calls behave like one longer poll.
- Keep `excludeCodes` as the guardrail against stale or already rejected codes.

## Risks / Trade-offs

- Fallback scanning can consider older matching iCloud rows. Mitigation: keep code exclusion and sender/subject matching, and only enter fallback after repeated no-code attempts in the same session.
- iCloud DOM selectors may drift. Mitigation: cover the polling state machine with content-script regression tests so future selector work does not regress this behavior silently.
