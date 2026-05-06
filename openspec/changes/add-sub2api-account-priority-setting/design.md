## Context

The user wants the extension front end to expose SUB2API account priority below the account group control. The referenced GitHub project is `Wei-Shaw/sub2api`; its account model includes `priority` as an integer JSON field and documents that smaller numbers are scheduled first. For this extension workflow, the operator-facing default is `1`, while still sending the upstream-compatible `priority` field.

The local repository did not show an obvious committed SUB2API account form in `sidepanel/` during proposal discovery, so implementation must first locate the current owner of the form shown in the screenshot. If that form is newly introduced or generated in another branch, this change should attach to that existing create/edit flow rather than adding a duplicate account editor.

## Goals / Non-Goals

**Goals:**
- Add a visible numeric "优先级" control immediately below the "分组" field in the SUB2API account create/edit UI.
- Send the value as the upstream-compatible `priority` field on account create/update payloads.
- Use default `1` when a new account has no explicit priority.
- Hydrate existing account priority values when editing.
- Validate numeric input before save and prevent invalid payloads.
- Cover the behavior with focused UI and payload tests.

**Non-Goals:**
- Change SUB2API scheduling behavior or backend semantics.
- Add a new local account-priority system unrelated to upstream `priority`.
- Change group selection, concurrency, load factor, proxy, or billing multiplier behavior except where necessary to keep layout consistent.
- Rework the overall account modal layout beyond inserting the requested field.

## Decisions

1. Use upstream field name `priority`.

   The front end should store and submit `priority` directly because SUB2API already exposes this field in create/update account request types and account JSON. Alternative considered: introduce a local `accountPriority` key and translate later. That would add unnecessary mapping risk and make API payload tests less direct.

2. Default to `1` for new accounts.

   The extension should make newly authorized accounts high-priority by default for this workflow. Alternative considered: mirror SUB2API backend default `50`; the user clarified that the plugin default should be `1`.

3. Treat lower numeric values as higher priority in label/help text.

   The upstream schema documents priority as "数值越小优先级越高". The UI should make that clear near the control without using long instructional copy. Alternative considered: invert the front-end meaning so larger numbers feel more "important"; that would be surprising when comparing the extension to the SUB2API admin UI and API.

4. Keep validation local and conservative.

   The control should accept integers greater than or equal to `1` and normalize empty values back to the default `1` before save. Values below `1` or non-integer values should be rejected before the OAuth-completed account payload is submitted. Alternative considered: let the backend reject invalid values. That produces a later and less helpful failure for an operator editing accounts in the plugin.

5. Match existing runtime lock behavior if the surrounding SUB2API settings are locked while automation runs.

   Previous settings work in this repository uses persisted settings that hydrate, autosave, and are disabled while automation is active. If the SUB2API account editor is available during active automation, this new field should follow the same disabled state as the rest of the form. Alternative considered: leave only this field editable while running. That can create mismatched account payload state during automation.

## Risks / Trade-offs

- [Risk] The local branch may not yet contain the exact SUB2API account modal shown in the screenshot. -> Mitigation: implementation tasks start with locating the actual form owner and only then wiring the field into that module.
- [Risk] SUB2API backend validation may allow a wider numeric range than the extension chooses. -> Mitigation: use the narrowest UI validation that matches existing local numeric fields, and verify with the upstream field name/default.
- [Risk] Adding a field below "分组" could make the modal cramped on small sidepanel widths. -> Mitigation: reuse the same grid/input sizing used by neighboring numeric controls and test at the sidepanel viewport width.
- [Risk] Existing accounts without `priority` might render as blank or `0` by accident. -> Mitigation: distinguish missing/null from an explicit numeric value and show `1` only when the value is absent.

## Migration Plan

No data migration is required. Existing SUB2API accounts without an explicit `priority` render as `1` when edited through the extension workflow. Rollback removes the UI field and stops sending `priority`; backend defaults continue to apply.

## Open Questions

- The exact local module that owns the screenshot UI needs confirmation during implementation because current discovery did not find committed `SUB2API` strings in the sidepanel files.
