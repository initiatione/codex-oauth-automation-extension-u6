## 1. Discovery

- [x] 1.1 Locate the local module that owns the SUB2API account create/edit UI shown in the screenshot, including its account payload builder and tests.
- [x] 1.2 Confirm the existing SUB2API account data shape and the create/update API path used by the extension front end.
- [x] 1.3 Verify the surrounding form's disabled/runtime-lock pattern so the new priority control follows the same availability behavior.

## 2. UI And Data Flow

- [x] 2.1 Add a numeric "优先级" control directly below the "分组" field in the SUB2API account create/edit form.
- [x] 2.2 Default new-account priority to `1` and hydrate existing accounts from their stored `priority` value.
- [x] 2.3 Normalize and validate priority as an integer greater than or equal to `1` before save, rejecting invalid values and using `1` when the value is absent.
- [x] 2.4 Include `priority` in SUB2API account create and update payloads without changing unrelated account fields.
- [x] 2.5 Ensure the priority control is disabled whenever the surrounding SUB2API account fields are disabled.

## 3. Verification

- [x] 3.1 Add or update focused tests for priority field placement/defaults, edit hydration, payload inclusion, validation, and disabled state.
- [x] 3.2 Run the targeted SUB2API/account UI tests affected by the change.
- [x] 3.3 Run the repository's standard test command and record the result.
