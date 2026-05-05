## 1. Regression Coverage

- [x] 1.1 Add a content-script regression test for Step 8 iCloud polling when the newest visible row already contains a matching OpenAI/ChatGPT code.
- [x] 1.2 Add coverage that excluded codes are skipped during fallback scanning.

## 2. Core Implementation

- [x] 2.1 Update iCloud polling session handling so repeated `maxAttempts: 1` calls with the same session key accumulate fallback progress.
- [x] 2.2 Ensure fallback can inspect same-session snapshot rows without breaking new-mail detection.

## 3. Verification

- [x] 3.1 Run the targeted iCloud content tests.
- [x] 3.2 Run full project tests and syntax checks.
