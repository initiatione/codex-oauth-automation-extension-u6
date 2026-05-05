# Free Phone Reuse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a HeroSMS-only local free phone reuse mode that reuses the same saved number without paid provider reuse or new number acquisition.

**Architecture:** Implement free reuse as separate local state (`freeReusablePhoneActivation`) and settings (`freePhoneReuseEnabled`, `freePhoneReuseAutoEnabled`). The Step 9 phone flow checks the saved free-reuse record before preferred activations, paid reusable pools, fallback providers, or new acquisition. Sidepanel controls live inside the existing phone verification settings card.

**Tech Stack:** Chrome extension background scripts, sidepanel HTML/JS/CSS, Node.js built-in test runner, OpenSpec artifacts in `openspec/changes/add-free-phone-reuse`.

---

### Task 1: Stabilize Tests For The Contract

**Files:**
- Modify: `tests/phone-verification-flow.test.js`
- Modify: `tests/sidepanel-phone-verification-settings.test.js`

- [ ] **Step 1: Keep or add automatic free-reuse priority tests**

Add tests proving a saved HeroSMS free-reuse record with both switches enabled calls only `setStatus` and `getStatus` before submitting the saved number, and does not call `reactivate`, `getNumber`, `getNumberV2`, 5sim reuse, or buy endpoints.

- [ ] **Step 2: Keep or add automatic free-reuse failure tests**

Add tests proving a cancelled or never-ready saved activation rejects with `PHONE_AUTO_FREE_REUSE_PREPARE::`, calls `requestStop`, clears the saved record when cancelled, and does not buy or reactivate another number.

- [ ] **Step 3: Keep or add lifecycle tests**

Add tests proving automatic free reuse increments `successfulUses`, clears the record when the next success reaches `maxUses`, and clears matching free-reuse records on phone-used or phone-max-usage errors.

- [ ] **Step 4: Add sidepanel tests**

Add tests proving the sidepanel HTML exposes `input-free-phone-reuse-enabled`, `input-free-phone-reuse-auto-enabled`, saved-phone display/input, save button, and clear button; `collectSettingsPayload` emits both settings; save/clear buttons call `SET_FREE_REUSABLE_PHONE` and `CLEAR_FREE_REUSABLE_PHONE`.

- [ ] **Step 5: Run RED tests**

Run:
```powershell
node --test tests/phone-verification-flow.test.js --test-name-pattern "free reuse|free-reuse|automatic free reuse"
node --test tests/sidepanel-phone-verification-settings.test.js --test-name-pattern "free reusable|free reuse|phone verification"
```

Expected: new tests fail against the current implementation because free reuse is not fully migrated.

### Task 2: Add Background State And Message Plumbing

**Files:**
- Modify: `background.js`
- Modify: `background/message-router.js`
- Test: relevant existing background/message-router tests if touched

- [ ] **Step 1: Persist settings**

Add `freePhoneReuseEnabled: false` and `freePhoneReuseAutoEnabled: false` to persisted setting defaults and boolean normalization.

- [ ] **Step 2: Preserve runtime record**

Update `resetState()` to read, validate, and restore `freeReusablePhoneActivation` across per-round resets, mirroring existing preservation of `reusablePhoneActivation` without adding it to paid pools.

- [ ] **Step 3: Add local record mutators**

Implement `setFreeReusablePhoneActivation(record)` and `clearFreeReusablePhoneActivation()` in `background.js`. Save should normalize phone number, optional activation id, HeroSMS country, `successfulUses`, `maxUses`, provider `hero-sms`, and source `free-manual-reuse`. Clear should only set local state to null.

- [ ] **Step 4: Route sidepanel messages**

Add message-router cases for `SET_FREE_REUSABLE_PHONE` and `CLEAR_FREE_REUSABLE_PHONE` that call the local mutators and return the updated record. These cases must not call HeroSMS/5sim/NexSMS APIs.

- [ ] **Step 5: Run state/message tests**

Run relevant tests after adding or updating them:
```powershell
node --test tests/background-message-router-module.test.js tests/sidepanel-phone-verification-settings.test.js --test-name-pattern "free reusable|FREE_REUSABLE|phone verification"
```

### Task 3: Implement Free Reuse In Phone Verification Flow

**Files:**
- Modify: `background/phone-verification-flow.js`
- Test: `tests/phone-verification-flow.test.js`

- [ ] **Step 1: Normalize free-reuse records**

Add helpers for `normalizeFreePhoneReuseEnabled`, `normalizeFreePhoneReuseAutoEnabled`, `normalizeFreeReusablePhoneActivation`, phone-number matching, and local free-reuse persistence/clear. Keep this separate from `normalizeActivationPool`.

- [ ] **Step 2: Add HeroSMS-only preparation**

Add `prepareFreeReusablePhoneActivation(state, activation)` using HeroSMS config regardless of currently selected provider. It should call `setStatus(3)`, poll `getStatus`/`getStatusV2`, accept waiting statuses, retry stale `STATUS_OK`, detect cancellation, and return structured `{ ok, activation, reason, message }`.

- [ ] **Step 3: Add handoff before acquisition**

In `completePhoneVerificationFlow`, before calling `acquirePhoneActivation`, call `handoffFreeReusablePhone(tabId, state)`. Automatic mode returns a prepared activation and persists it as current. Manual mode hands off the saved phone and throws/stops with `PHONE_MANUAL_FREE_REUSE::`.

- [ ] **Step 4: Save first coded HeroSMS activation**

After a code is received but before code submission, mark the activation as code-received and persist it as `freeReusablePhoneActivation` when free reuse is enabled, the activation is HeroSMS, and no saved free-reuse record already exists.

- [ ] **Step 5: Preserve and update lifecycle after success**

On success, skip HeroSMS completion for activations being preserved for free reuse or reused through `free-auto-reuse`. Increment saved free-reuse `successfulUses` after automatic free reuse; clear it at `maxUses`.

- [ ] **Step 6: Clear bad free-reuse records**

When add-phone/code submission reports used or max usage, clear matching current, paid reusable, reusable pool, and free-reuse records for the same phone. When a free-auto-reuse activation is replaced after failure, retire the saved record.

- [ ] **Step 7: Run GREEN phone tests**

Run:
```powershell
node --test tests/phone-verification-flow.test.js --test-name-pattern "free reuse|free-reuse|automatic free reuse|same number"
```

Expected: targeted phone-flow tests pass without changing 5sim/NexSMS expectations.

### Task 4: Add Sidepanel Controls

**Files:**
- Modify: `sidepanel/sidepanel.html`
- Modify: `sidepanel/sidepanel.js`
- Modify: `sidepanel/sidepanel.css` only if layout needs compact spacing
- Test: `tests/sidepanel-phone-verification-settings.test.js`

- [ ] **Step 1: Add HTML controls**

Inside the phone verification settings card, add two compact switch cells for `白嫖复用` and `自动白嫖复用`, plus a runtime row for saved free-reuse phone display, input, save button, and clear button.

- [ ] **Step 2: Add DOM references and payload fields**

Add DOM constants for free-reuse controls. Update `collectSettingsPayload()` to include `freePhoneReuseEnabled` and `freePhoneReuseAutoEnabled`.

- [ ] **Step 3: Hydrate and render state**

Update state application and runtime display so switches reflect background state and saved phone display shows phone number, optional activation id, and country label.

- [ ] **Step 4: Add save/clear event handlers**

Wire save button to `chrome.runtime.sendMessage({ type: 'SET_FREE_REUSABLE_PHONE', payload: { phoneNumber } })` and clear button to `CLEAR_FREE_REUSABLE_PHONE`. Refresh state afterward and update the runtime display from either refreshed state or mutation result.

- [ ] **Step 5: Disable automatic switch when needed**

Update `updatePhoneVerificationSettingsUI()` so automatic free reuse is disabled or inactive when free reuse is disabled or SMS settings are hidden.

- [ ] **Step 6: Run GREEN sidepanel tests**

Run:
```powershell
node --test tests/sidepanel-phone-verification-settings.test.js --test-name-pattern "free reusable|free reuse|phone verification"
```

Expected: targeted sidepanel tests pass.

### Task 5: Final Verification And Cleanup

**Files:**
- Review: all modified files

- [ ] **Step 1: Check OpenSpec status**

Run:
```powershell
openspec status --change "add-free-phone-reuse"
```

Expected: proposal, design, specs, and tasks remain complete.

- [ ] **Step 2: Run full test suite**

Run:
```powershell
npm test
```

Expected: all JavaScript tests pass.

- [ ] **Step 3: Review diff**

Run:
```powershell
git diff -- background/phone-verification-flow.js background.js background/message-router.js sidepanel/sidepanel.html sidepanel/sidepanel.js tests/phone-verification-flow.test.js tests/sidepanel-phone-verification-settings.test.js openspec/changes/add-free-phone-reuse docs/superpowers/plans/2026-05-05-free-phone-reuse.md
```

Expected: diff is scoped to free phone reuse and its OpenSpec/plan artifacts. Preserve unrelated untracked `.codex/` and existing `openspec/` worktree state.
