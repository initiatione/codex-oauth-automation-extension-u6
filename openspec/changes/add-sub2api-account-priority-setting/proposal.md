## Why

SUB2API account scheduling already supports a priority concept in the upstream GitHub project, but the extension front end does not expose that control in the account configuration flow shown by the user. Operators need to set account priority at account creation/edit time so the preferred SUB2API accounts are selected first without manually changing the upstream service later.

## What Changes

- Add an account priority setting to the plugin front end for SUB2API account create/edit forms.
- Place the new priority control directly below the existing group field, matching the requested layout.
- Persist the configured numeric priority with each SUB2API account payload sent to the upstream SUB2API account API.
- Hydrate the control when editing an existing account and keep the existing default behavior when no priority has been configured.
- Validate and normalize the value before save so the UI does not send invalid priority data.
- Add focused tests for rendering, persistence, edit hydration, and payload normalization.

## Capabilities

### New Capabilities
- `sub2api-account-priority-setting`: Covers configuring and persisting SUB2API account priority from the extension front end.

### Modified Capabilities
- None.

## Impact

- Affected UI: SUB2API source/account settings in the sidepanel or the local account-management module that owns the form shown in the user screenshot.
- Affected data flow: account create/update payloads sent from the extension front end to the SUB2API service.
- Affected tests: sidepanel/account UI tests and any existing SUB2API account payload tests.
- External dependency: no new package dependency is expected; the implementation should map to the upstream SUB2API account priority field rather than introducing a separate local-only concept.
