## Why

Step 6 currently waits a fixed 25 seconds before clearing ChatGPT / OpenAI login cookies. Different network and browser states may need a shorter or longer delay, so operators need a front-end setting that can be adjusted while paused and then take effect immediately for the next Step 6 run.

## What Changes

- Add a configurable Step 6 pre-login cookie cleanup wait time in seconds.
- Persist the wait time with existing extension settings and include it in import/export settings.
- Show a sidepanel control for editing the wait time in real time when automation is paused or idle.
- Disable the wait-time control while automation is running; users must pause/stop before modifying it.
- Make Step 6 read the latest persisted value when it starts waiting so changes take effect without reloading the extension.
- Preserve the existing 25-second default when no custom value is set.

## Capabilities

### New Capabilities
- `step6-cookie-clear-delay`: Configurable wait time for Step 6 login cookie cleanup, including persistence, sidepanel editing rules, and execution behavior.

### Modified Capabilities

## Impact

- Affected background code: `background.js` and any Step 6 cookie cleanup helper/module wiring.
- Affected sidepanel code: `sidepanel/sidepanel.html`, `sidepanel/sidepanel.js`, and CSS if layout needs adjustment.
- Affected tests: background settings normalization, Step 6 cookie cleanup behavior, and sidepanel settings locking/payload tests.
- No new dependencies are expected.
