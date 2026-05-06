## ADDED Requirements

### Requirement: SUB2API account form exposes priority
The extension front end SHALL expose a numeric SUB2API account priority control in the account create/edit form.

#### Scenario: Priority appears below group field
- **WHEN** the operator opens the SUB2API account create/edit form
- **THEN** the form shows an "优先级" numeric control directly below the "分组" control

#### Scenario: New account uses plugin default
- **WHEN** the operator opens the SUB2API account create form for a new account
- **THEN** the priority control defaults to `1`

### Requirement: SUB2API account priority persists through account payloads
The extension front end SHALL send the configured account priority as the upstream-compatible `priority` field when creating or updating a SUB2API account.

#### Scenario: Create payload includes priority
- **WHEN** the operator saves a new SUB2API account with priority `2`
- **THEN** the create request payload includes `priority: 2`

#### Scenario: OAuth-completed account payload includes configured priority
- **WHEN** OAuth authorization completes after the operator configured priority `12`
- **THEN** the SUB2API account creation payload includes `priority: 12`

#### Scenario: Existing priority hydrates while editing
- **WHEN** the operator opens an existing SUB2API account whose stored priority is `3`
- **THEN** the priority control displays `3`

### Requirement: SUB2API account priority validates before save
The extension front end SHALL prevent invalid priority values from being sent to SUB2API.

#### Scenario: Non-integer priority is rejected
- **WHEN** the operator enters a non-integer priority value and attempts to save
- **THEN** the form shows a validation failure and does not submit the account payload

#### Scenario: Priority below one is rejected
- **WHEN** the operator enters priority `0` and attempts to save
- **THEN** the form shows a validation failure and does not submit the account payload

#### Scenario: Missing priority normalizes to default
- **WHEN** the priority value is absent while saving a SUB2API account
- **THEN** the submitted payload uses `priority: 1`

### Requirement: SUB2API priority follows account form availability
The priority control SHALL follow the same enabled and disabled state as the surrounding SUB2API account fields.

#### Scenario: Account form locked during active automation
- **WHEN** the SUB2API account form is disabled because automation is running
- **THEN** the priority control is also disabled
