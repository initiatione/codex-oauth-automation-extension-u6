## 1. Regression Coverage

- [x] 1.1 Add a regression test that rejects redeclaring `safeActionLabel` inside `withIcloudLoginHelp`.
- [x] 1.2 Ensure the transient-context branch still formats errors with the stable action label.

## 2. Core Fix

- [x] 2.1 Remove the inner `safeActionLabel` declaration from the transient-context branch.
- [x] 2.2 Preserve the existing retry log and final transient error behavior.

## 3. Verification

- [x] 3.1 Run the targeted iCloud login helper test.
- [x] 3.2 Run syntax and full project verification.
