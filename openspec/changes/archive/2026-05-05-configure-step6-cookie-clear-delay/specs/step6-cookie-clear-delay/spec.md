## ADDED Requirements

### Requirement: Persist configurable Step 6 cookie cleanup delay
The extension SHALL persist a `step6CookieClearDelaySeconds` setting that controls how long Step 6 waits before clearing ChatGPT / OpenAI login cookies.

#### Scenario: Default delay is used
- **WHEN** no custom delay has been saved
- **THEN** Step 6 SHALL wait 25 seconds before clearing login cookies

#### Scenario: Saved delay is used
- **WHEN** the saved delay is changed to a valid number of seconds while automation is paused or idle
- **THEN** the next Step 6 cookie cleanup SHALL use the saved delay without requiring an extension reload

#### Scenario: Invalid delay is normalized
- **WHEN** the saved or imported delay is missing, non-numeric, below the minimum, or above the maximum
- **THEN** the extension SHALL normalize it to the configured default or allowed range before using it

### Requirement: Sidepanel delay control obeys runtime lock state
The sidepanel SHALL expose a numeric control for `step6CookieClearDelaySeconds` and SHALL prevent edits while automation or step execution is active.

#### Scenario: Idle user edits delay
- **WHEN** automation is idle or paused and the user changes the Step 6 cookie cleanup delay control
- **THEN** the sidepanel SHALL include the new value in the persisted settings payload

#### Scenario: Running user cannot edit delay
- **WHEN** automation or any step execution is active
- **THEN** the Step 6 cookie cleanup delay control SHALL be disabled until the run is paused or stopped

### Requirement: Cookie cleanup scope remains unchanged
The configurable delay SHALL only change the wait duration before cleanup and MUST NOT change which cookies, origins, or browser APIs are used for Step 6 login cookie cleanup.

#### Scenario: Delay changes do not alter cookie targets
- **WHEN** Step 6 cookie cleanup runs with any valid configured delay
- **THEN** it SHALL clear the same ChatGPT / OpenAI cookie domains and origins as before the delay became configurable
