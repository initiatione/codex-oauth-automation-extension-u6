## Context

Step 6 runs a pre-login cleanup that waits `STEP6_PRE_LOGIN_COOKIE_CLEAR_DELAY_MS` before deleting ChatGPT / OpenAI cookies. The delay is currently hard-coded to 25 seconds, while most operator-facing runtime options already flow through persisted settings and the sidepanel settings card.

The new delay must be editable from the extension front end, persist across restarts and settings import/export, and be locked while automation is running. The existing settings save/broadcast path already supports real-time updates when the panel is idle or paused, so the implementation should extend that path instead of adding a separate message type.

## Goals / Non-Goals

**Goals:**
- Add a persisted `step6CookieClearDelaySeconds` setting with a default of 25 seconds.
- Normalize the value to a bounded integer number of seconds.
- Render an idle/paused-editable sidepanel input for the delay and include it in settings auto-save payloads.
- Lock the input while auto-run or step execution is active.
- Make Step 6 read the current setting when cookie cleanup starts, so the next run uses the latest saved value without extension reload.
- Cover normalization, sidepanel payload/locking, and Step 6 wait behavior with targeted tests.

**Non-Goals:**
- Changing which cookies or origins are cleared.
- Allowing the wait time to change in the middle of an already-started Step 6 wait.
- Adding a new pause/resume mechanism.
- Adding any new dependency or background alarm.

## Decisions

1. Store seconds, execute milliseconds.
   - Use a persisted seconds value because the sidepanel is operator-facing and existing settings like phone-code waits are expressed in seconds.
   - Convert to milliseconds only inside Step 6 cookie cleanup.
   - Alternative considered: store milliseconds directly. This was rejected because it exposes implementation units in the UI and import/export data.

2. Use a bounded integer with the existing 25-second default.
   - Add constants for min, max, and default. The input should clamp or normalize invalid values to the default/fallback path used by other numeric settings.
   - Recommended range: 0 to 300 seconds. Zero allows immediate cleanup for debugging or known-safe sessions; 300 prevents accidental very long waits.
   - Alternative considered: minimum 1 second. This was rejected because “immediate” is a useful operational choice and still safe.

3. Reuse existing settings persistence and locking.
   - Add the key to `PERSISTED_SETTING_DEFAULTS`, `normalizePersistentSettingValue`, sidepanel hydration, and `collectSettingsPayload`.
   - Lock the control using the existing settings-card lock path that already reflects running automation.
   - Alternative considered: add a dedicated background message just for Step 6 delay. This was rejected because it would duplicate existing real-time settings behavior.

4. Read the delay at Step 6 cleanup start.
   - `runPreStep6CookieCleanup` should call a small helper that reads the latest persisted setting and returns normalized milliseconds.
   - This makes paused/idle edits effective for the next Step 6 execution without reload.
   - Alternative considered: depend only on the state snapshot passed into Step 6. This was rejected because the cleanup function currently has no state parameter and direct persisted read is narrower than threading state through the executor.

## Risks / Trade-offs

- Invalid imported settings could create too-short or too-long waits -> normalize every persisted value and clamp to the allowed range.
- Users may expect changes during an active wait to shorten the current wait -> lock the input while running and specify that changes apply to the next Step 6 cleanup.
- Tests that extract background functions may need helper exports or additional stubs -> keep helpers small and colocated with current Step 6 cleanup code.
