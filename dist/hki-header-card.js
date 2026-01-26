# Mouse Hold Action Fix - v2.0.0

## Problem
Hold actions only worked with touch events (mobile) and right-click (desktop). Left mouse button hold didn't trigger hold actions.

## Root Cause
The previous implementation had two issues:

### Issue 1: Local Variables Reset on Render
```javascript
// BEFORE (BROKEN)
const startHold = (e) => {
  let holdTimer = null;  // ← Reset on every render!
  let moved = false;
  holdTimer = setTimeout(...)
}
```

Every time the component re-rendered, these variables were recreated, losing state.

### Issue 2: Event Handler Scope
Event handlers were defined inline with arrow functions that captured variables in closures, but those closures were recreated on each render cycle.

## Solution

### 1. Component-Level State Tracking
Added a `Map` to track hold state per entity:

```javascript
// In constructor
constructor() {
  super();
  this._holdState = new Map();  // Persists across renders
}
```

### 2. Dedicated Event Handler Methods
Created proper methods on the component class:

```javascript
_personMouseDown(e, entityId, holdAction) {
  if (!this._holdState.has(entityId)) {
    this._holdState.set(entityId, {});
  }
  const state = this._holdState.get(entityId);
  state.moved = false;
  state.holdTriggered = false;
  
  if (holdAction && holdAction.action !== "none") {
    state.holdTimer = setTimeout(() => {
      if (!state.moved) {
        state.holdTriggered = true;
        this._handleAction(holdAction, entityId);
      }
    }, 500);
  }
}

_personMouseMove(e, entityId) {
  if (this._holdState.has(entityId)) {
    const state = this._holdState.get(entityId);
    state.moved = true;
    if (state.holdTimer) {
      clearTimeout(state.holdTimer);
      state.holdTimer = null;
    }
  }
}

_personMouseUp(e, entityId, tapAction) {
  if (this._holdState.has(entityId)) {
    const state = this._holdState.get(entityId);
    if (state.holdTimer) {
      clearTimeout(state.holdTimer);
      state.holdTimer = null;
    }
    // Fire tap action if hold didn't trigger and didn't move
    if (!state.moved && !state.holdTriggered && tapAction) {
      this._handleAction(tapAction, entityId);
    }
    // Clean up
    this._holdState.delete(entityId);
  }
}

_personMouseLeave(e, entityId) {
  if (this._holdState.has(entityId)) {
    const state = this._holdState.get(entityId);
    if (state.holdTimer) {
      clearTimeout(state.holdTimer);
      state.holdTimer = null;
    }
    // Clean up
    this._holdState.delete(entityId);
  }
}
```

### 3. Separate Touch Handlers
Touch events handled separately to maintain proper behavior:

```javascript
_personTouchStart(e, entityId, holdAction)
_personTouchMove(e, entityId)
_personTouchEnd(e, entityId, tapAction)
```

## Event Flow

### Mouse Hold Action
1. **mousedown** → Start 500ms timer, track state
2. **mousemove** → Cancel timer if mouse moves
3. **500ms passes** → Trigger hold action, set `holdTriggered` flag
4. **mouseup** → If hold didn't trigger and didn't move, fire tap action
5. **mouseleave** → Cancel timer and clean up state

### Touch Hold Action
1. **touchstart** → Start 500ms timer, track state
2. **touchmove** → Cancel timer if touch moves
3. **500ms passes** → Trigger hold action, set `holdTriggered` flag
4. **touchend** → If hold didn't trigger and didn't move, fire tap action

## State Management

Each person entity gets its own state object:

```javascript
{
  holdTimer: setTimeout ID,
  moved: boolean,
  holdTriggered: boolean
}
```

State is:
- Created on mousedown/touchstart
- Updated on move events
- Cleaned up on mouseup/touchend/mouseleave

## Benefits

✅ **Works with mouse** - Left click and hold triggers hold action
✅ **Works with touch** - Touch and hold triggers hold action
✅ **No right-click required** - Right-click menu is prevented
✅ **State persists** - Tracked in component, not local variables
✅ **Clean separation** - Mouse and touch handled separately
✅ **Proper cleanup** - State removed when interaction ends
✅ **Movement detection** - Cancels if user moves mouse/touch

## Testing

### Mouse
1. Click and immediately release → Tap action ✅
2. Click and hold 500ms → Hold action ✅
3. Click, move mouse, release → Nothing (movement cancels) ✅
4. Click, hold, move mouse away → Timer cancelled ✅

### Touch
1. Tap and immediately release → Tap action ✅
2. Touch and hold 500ms → Hold action ✅
3. Touch, move, release → Nothing (movement cancels) ✅

## Previous Behavior vs New Behavior

| Action | Before | After |
|--------|--------|-------|
| Left click | Tap action | Tap action ✅ |
| Left click + hold 500ms | Tap action | Hold action ✅ |
| Right click | Hold action | Prevented ✅ |
| Touch + hold | Hold action | Hold action ✅ |
| Touch tap | Tap action | Tap action ✅ |

## Code Comparison

### Before (Broken)
```javascript
// Inline handlers - reset on every render
const startHold = (e) => {
  let holdTimer = null;  // ← PROBLEM!
  holdTimer = setTimeout(...)
}

return html`
  <div @mousedown=${startHold}></div>
`
```

### After (Fixed)
```javascript
// Component methods - state persists
_personMouseDown(e, entityId, holdAction) {
  const state = this._holdState.get(entityId);  // ← SOLUTION!
  state.holdTimer = setTimeout(...)
}

return html`
  <div @mousedown=${(e) => this._personMouseDown(e, entityId, holdAction)}></div>
`
```

## Related Changes

Also fixed grayscale filter to not affect border:
- Filter moved from container to content (img/icon) only
- Border color now always visible regardless of grayscale setting
- Both settings work independently
