---
name: wai-aria-patterns
description: Provides WAI-ARIA implementation patterns, roles, states, and properties for building accessible interactive components. Use when implementing accessible widgets, adding ARIA attributes, creating custom UI components, or when user mentions "aria-", "role=", "accessible dialog", "accessible tabs", "accordion", "combobox", "modal", or "focus management".
---

# WAI-ARIA Patterns

Implementation patterns for accessible interactive components using WAI-ARIA.

## When to Use ARIA

**First Rule of ARIA**: Don't use ARIA if native HTML works.

```html
<!-- Prefer native HTML -->
<button>Submit</button>           <!-- Not: <div role="button"> -->
<input type="checkbox">           <!-- Not: <div role="checkbox"> -->
<select><option>...</option></select>  <!-- Not: <div role="listbox"> -->
```

**Use ARIA when**:
- Native HTML doesn't provide needed semantics
- Building custom interactive widgets
- Enhancing complex UI patterns

## Core Concepts

### Roles
Define what an element is:
```html
<div role="dialog">...</div>
<div role="tablist">...</div>
<span role="button">...</span>
```

### States
Describe current condition:
```html
<button aria-pressed="true">Toggle</button>
<div aria-expanded="false">...</div>
<input aria-invalid="true">
```

### Properties
Describe characteristics:
```html
<input aria-label="Search">
<div aria-labelledby="heading-id">...</div>
<button aria-describedby="help-text">...</button>
```

## Top 10 Patterns

### 1. Modal Dialog

```html
<div role="dialog"
     aria-modal="true"
     aria-labelledby="dialog-title"
     aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-desc">Are you sure you want to delete this item?</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

**Requirements**:
- `role="dialog"` and `aria-modal="true"`
- Accessible name via `aria-labelledby` or `aria-label`
- Focus trapped inside dialog
- Focus returns to trigger on close
- Escape key closes dialog

See [patterns/dialog-modal.md](patterns/dialog-modal.md) for full implementation.

### 2. Tabs

```html
<div role="tablist" aria-label="Settings sections">
  <button role="tab"
          aria-selected="true"
          aria-controls="panel-1"
          id="tab-1">
    General
  </button>
  <button role="tab"
          aria-selected="false"
          aria-controls="panel-2"
          id="tab-2"
          tabindex="-1">
    Security
  </button>
</div>

<div role="tabpanel"
     id="panel-1"
     aria-labelledby="tab-1">
  <!-- General settings content -->
</div>

<div role="tabpanel"
     id="panel-2"
     aria-labelledby="tab-2"
     hidden>
  <!-- Security settings content -->
</div>
```

**Requirements**:
- `role="tablist"`, `role="tab"`, `role="tabpanel"`
- `aria-selected` on active tab
- Arrow key navigation between tabs
- `aria-controls` links tab to panel
- Hidden panels use `hidden` attribute

See [patterns/tabs.md](patterns/tabs.md) for full implementation.

### 3. Accordion

```html
<div class="accordion">
  <h3>
    <button aria-expanded="true"
            aria-controls="section-1"
            id="header-1">
      Section 1
    </button>
  </h3>
  <div id="section-1"
       role="region"
       aria-labelledby="header-1">
    Content for section 1
  </div>

  <h3>
    <button aria-expanded="false"
            aria-controls="section-2"
            id="header-2">
      Section 2
    </button>
  </h3>
  <div id="section-2"
       role="region"
       aria-labelledby="header-2"
       hidden>
    Content for section 2
  </div>
</div>
```

**Requirements**:
- Button triggers inside heading elements
- `aria-expanded` reflects state
- `aria-controls` links to content region
- Hidden content uses `hidden` attribute

See [patterns/accordion.md](patterns/accordion.md) for full implementation.

### 4. Combobox (Autocomplete)

```html
<label for="city-input">City</label>
<div class="combobox-wrapper">
  <input type="text"
         id="city-input"
         role="combobox"
         aria-autocomplete="list"
         aria-expanded="true"
         aria-controls="city-listbox"
         aria-activedescendant="city-2">

  <ul role="listbox"
      id="city-listbox">
    <li role="option" id="city-1">Tokyo</li>
    <li role="option" id="city-2" aria-selected="true">Osaka</li>
    <li role="option" id="city-3">Kyoto</li>
  </ul>
</div>
```

**Requirements**:
- Input with `role="combobox"`
- `aria-expanded` reflects popup state
- `aria-activedescendant` tracks highlighted option
- Arrow keys navigate options
- Enter selects option

See [patterns/combobox.md](patterns/combobox.md) for full implementation.

### 5. Menu

```html
<button aria-haspopup="menu"
        aria-expanded="false"
        aria-controls="actions-menu">
  Actions
</button>

<ul role="menu"
    id="actions-menu"
    hidden>
  <li role="menuitem">Edit</li>
  <li role="menuitem">Duplicate</li>
  <li role="separator"></li>
  <li role="menuitem">Delete</li>
</ul>
```

**Requirements**:
- Trigger with `aria-haspopup="menu"`
- `role="menu"` container
- `role="menuitem"` for each item
- Arrow key navigation
- First character search

### 6. Alert

```html
<!-- Polite announcement -->
<div role="status" aria-live="polite">
  File saved successfully.
</div>

<!-- Urgent announcement -->
<div role="alert" aria-live="assertive">
  Error: Connection lost. Please try again.
</div>
```

**Requirements**:
- `role="alert"` for errors (assertive)
- `role="status"` for non-urgent updates (polite)
- Content changes announced automatically

### 7. Tooltip

```html
<button aria-describedby="tooltip-1">
  <svg aria-hidden="true">...</svg>
  <span class="sr-only">Settings</span>
</button>

<div role="tooltip" id="tooltip-1" hidden>
  Open settings menu
</div>
```

**Requirements**:
- `role="tooltip"` on tooltip element
- `aria-describedby` on trigger
- Show on hover/focus
- Escape key dismisses

### 8. Breadcrumb

```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/products/electronics" aria-current="page">Electronics</a></li>
  </ol>
</nav>
```

**Requirements**:
- `<nav>` with `aria-label="Breadcrumb"`
- `aria-current="page"` on current page

### 9. Progress Indicator

```html
<!-- Determinate progress -->
<div role="progressbar"
     aria-valuenow="75"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="Upload progress">
  75%
</div>

<!-- Indeterminate (loading) -->
<div role="progressbar"
     aria-label="Loading..."
     aria-busy="true">
</div>
```

### 10. Slider

```html
<label id="volume-label">Volume</label>
<div role="slider"
     aria-labelledby="volume-label"
     aria-valuenow="50"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-valuetext="50%"
     tabindex="0">
</div>
```

**Requirements**:
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` required
- `aria-valuetext` for human-readable value
- Arrow keys change value

## Attribute Quick Reference

### Widget Attributes
See [attributes/widget-attrs.md](attributes/widget-attrs.md) for complete list.

| Attribute | Values | Use |
|-----------|--------|-----|
| `aria-expanded` | true/false | Expandable sections |
| `aria-pressed` | true/false/mixed | Toggle buttons |
| `aria-selected` | true/false | Selected items |
| `aria-checked` | true/false/mixed | Checkboxes |
| `aria-disabled` | true/false | Disabled state |
| `aria-hidden` | true/false | Hide from AT |

### Live Region Attributes
See [attributes/live-region.md](attributes/live-region.md) for complete list.

| Attribute | Values | Use |
|-----------|--------|-----|
| `aria-live` | off/polite/assertive | Announcement urgency |
| `aria-atomic` | true/false | Announce all or changes |
| `aria-relevant` | additions/removals/text/all | What to announce |
| `aria-busy` | true/false | Content loading |

### Relationship Attributes
See [attributes/relationships.md](attributes/relationships.md) for complete list.

| Attribute | Use |
|-----------|-----|
| `aria-labelledby` | Reference to label element ID |
| `aria-describedby` | Reference to description ID |
| `aria-controls` | Reference to controlled element |
| `aria-owns` | Reference to owned elements |
| `aria-activedescendant` | Currently active child ID |

## Common Mistakes

### 1. Using Invalid Roles
```html
<!-- Wrong -->
<div role="hamburger">Menu</div>

<!-- Right -->
<button aria-label="Menu" aria-expanded="false">
  <svg aria-hidden="true">...</svg>
</button>
```

### 2. Missing Required Attributes
```html
<!-- Wrong: Slider missing required attributes -->
<div role="slider">Volume</div>

<!-- Right -->
<div role="slider"
     aria-valuenow="50"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="Volume">
</div>
```

### 3. aria-hidden on Focusable
```html
<!-- Wrong -->
<button aria-hidden="true">Hidden but focusable</button>

<!-- Right: Remove from tab order too -->
<button aria-hidden="true" tabindex="-1">Hidden</button>
```

### 4. Redundant Roles
```html
<!-- Wrong: Redundant -->
<button role="button">Submit</button>
<a href="#" role="link">Click</a>

<!-- Right: Native semantics sufficient -->
<button>Submit</button>
<a href="#">Click</a>
```

### 5. Empty Labels
```html
<!-- Wrong -->
<button aria-label="">Submit</button>

<!-- Right -->
<button aria-label="Submit form">Submit</button>
```

## Focus Management

### Focus Trap (Modal)
```javascript
// Trap focus inside modal
function trapFocus(modal) {
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}
```

### Return Focus
```javascript
let previousFocus;

function openModal() {
  previousFocus = document.activeElement;
  modal.showModal();
}

function closeModal() {
  modal.close();
  previousFocus?.focus();
}
```

## Testing ARIA

```bash
# axe-core checks ARIA usage
npx @axe-core/cli page.html --tags wcag21aa

# Common ARIA violations it catches:
# - Invalid roles
# - Missing required attributes
# - Invalid attribute values
# - aria-hidden on focusable elements
```

## References

- [WAI-ARIA 1.2 Spec](https://www.w3.org/TR/wai-aria-1.2/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
