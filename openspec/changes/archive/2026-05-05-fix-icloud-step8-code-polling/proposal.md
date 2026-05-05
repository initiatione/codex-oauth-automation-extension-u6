## Why

Step 8 can miss iCloud verification codes even when the newest OpenAI/ChatGPT code email is already visible as the first inbox row. The current iCloud polling path may repeatedly snapshot that visible row as "old mail" when Step 8 is limited to one attempt per poll round, causing an empty polling loop instead of quickly using the visible code.

## What Changes

- Make iCloud verification polling able to recover when a matching code email is already visible at the start of a Step 8 poll session.
- Preserve same-session poll progress across repeated short polling calls so fallback scanning can work with `maxAttempts: 1`.
- Keep existing exclusion behavior so previously rejected codes are not reused.
- Add regression coverage for the visible-first-email Step 8 iCloud case.

## Capabilities

### New Capabilities
- `icloud-verification-code-polling`: Reliable iCloud mailbox polling for OpenAI/ChatGPT verification codes across signup and login verification steps.

### Modified Capabilities

## Impact

- Affects `content/icloud-mail.js` polling behavior.
- Adds tests under `tests/icloud-mail-content.test.js`.
- No API, dependency, or storage migration changes.
