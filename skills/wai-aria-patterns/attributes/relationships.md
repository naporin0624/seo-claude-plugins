# Relationship ARIA Attributes

Attributes that define relationships between elements.

## Labeling Attributes

### aria-labelledby
References element(s) providing the accessible name.

```html
<!-- Single label -->
<div aria-labelledby="section-title">
  <h2 id="section-title">Account Settings</h2>
  <form>...</form>
</div>

<!-- Multiple labels (space-separated) -->
<input aria-labelledby="billing address-label">
<span id="billing">Billing</span>
<span id="address-label">Address</span>
<!-- Accessible name: "Billing Address" -->

<!-- Dialog title -->
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Deletion</h2>
</div>

<!-- Tab panel -->
<div role="tabpanel" aria-labelledby="tab-1">
  <button role="tab" id="tab-1">Details</button>
</div>
```

**Priority**: Takes precedence over `aria-label` and native labels.

### aria-label
Provides accessible name directly as a string.

```html
<!-- Icon button -->
<button aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Search landmark -->
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Footer navigation">...</nav>

<!-- Form section -->
<fieldset aria-label="Shipping information">
  <input name="address">
  <input name="city">
</fieldset>
```

**When to use**:
- No visible label text
- Label text not in DOM
- Override existing accessible name

**Caution**: Invisible to sighted users; visible label preferred.

### aria-describedby
References element(s) providing additional description.

```html
<!-- Input with hint -->
<label for="password">Password</label>
<input type="password"
       id="password"
       aria-describedby="password-hint">
<span id="password-hint">
  Must be at least 8 characters with one number
</span>

<!-- Input with error -->
<input type="email"
       aria-invalid="true"
       aria-describedby="email-error">
<span id="email-error" class="error">
  Please enter a valid email address
</span>

<!-- Button with description -->
<button aria-describedby="delete-warning">
  Delete Account
</button>
<span id="delete-warning" hidden>
  This action cannot be undone
</span>

<!-- Multiple descriptions -->
<input aria-describedby="hint error format">
<span id="hint">Enter your phone number</span>
<span id="error">This field is required</span>
<span id="format">Format: (555) 555-5555</span>
```

**Difference from aria-labelledby**: Description is supplementary, announced after name.

### aria-details
References element with extended description (ARIA 1.2+).

```html
<img src="chart.png"
     alt="Q3 Sales Chart"
     aria-details="chart-details">
<div id="chart-details">
  <h3>Chart Details</h3>
  <table>
    <tr><td>January</td><td>$10,000</td></tr>
    <tr><td>February</td><td>$12,000</td></tr>
    <!-- ... -->
  </table>
</div>
```

---

## Control Attributes

### aria-controls
Identifies element(s) controlled by this element.

```html
<!-- Tab controls panel -->
<button role="tab" aria-controls="panel-1" aria-selected="true">
  Tab 1
</button>
<div role="tabpanel" id="panel-1">Panel content</div>

<!-- Accordion button -->
<button aria-expanded="false" aria-controls="section-1">
  Section Title
</button>
<div id="section-1" hidden>Section content</div>

<!-- Search controls results -->
<input type="search" aria-controls="search-results">
<div id="search-results" role="region">...</div>

<!-- Combobox controls listbox -->
<input role="combobox"
       aria-expanded="true"
       aria-controls="suggestions">
<ul role="listbox" id="suggestions">...</ul>
```

### aria-owns
Establishes parent-child relationship when DOM structure differs.

```html
<!-- Menu that's positioned outside parent in DOM -->
<div role="menu" aria-owns="submenu-1">
  <div role="menuitem">Item 1</div>
  <div role="menuitem" aria-haspopup="menu">
    Item 2 (has submenu)
  </div>
</div>

<!-- Submenu rendered elsewhere for positioning -->
<div role="menu" id="submenu-1">
  <div role="menuitem">Submenu Item 1</div>
  <div role="menuitem">Submenu Item 2</div>
</div>
```

**Use case**: When visual children are DOM siblings (portals, positioning).

### aria-activedescendant
Indicates currently active child (for composite widgets).

```html
<!-- Listbox with roving focus -->
<div role="listbox"
     tabindex="0"
     aria-activedescendant="option-2">
  <div role="option" id="option-1">Option 1</div>
  <div role="option" id="option-2">Option 2</div>
  <div role="option" id="option-3">Option 3</div>
</div>

<!-- Combobox highlighting option -->
<input role="combobox"
       aria-expanded="true"
       aria-controls="suggestions"
       aria-activedescendant="suggestion-3">
<ul role="listbox" id="suggestions">
  <li role="option" id="suggestion-1">Apple</li>
  <li role="option" id="suggestion-2">Banana</li>
  <li role="option" id="suggestion-3">Cherry</li>
</ul>
```

**Pattern**: Update when arrow keys change selection.

---

## Flow Attributes

### aria-flowto
Defines alternate reading order.

```html
<!-- Force specific reading order -->
<div id="step1" aria-flowto="step2">Step 1 content</div>
<div id="step3">Step 3 content</div>
<div id="step2" aria-flowto="step3">Step 2 content</div>
```

**Use case**: When visual order differs from DOM order.

---

## Reference Attributes

### aria-errormessage
References element containing error message (ARIA 1.2+).

```html
<input type="email"
       aria-invalid="true"
       aria-errormessage="email-error">
<span id="email-error" role="alert">
  Invalid email format
</span>
```

**Note**: Similar to `aria-describedby` but specifically for errors.

---

## Common Patterns

### Form Field with Label, Hint, and Error

```html
<div class="form-group">
  <label id="email-label" for="email">Email address</label>
  <input type="email"
         id="email"
         aria-labelledby="email-label"
         aria-describedby="email-hint email-error"
         aria-invalid="true">
  <span id="email-hint" class="hint">
    We'll never share your email
  </span>
  <span id="email-error" class="error" role="alert">
    Please enter a valid email address
  </span>
</div>
```

### Modal Dialog

```html
<div role="dialog"
     aria-modal="true"
     aria-labelledby="dialog-title"
     aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-desc">Are you sure you want to proceed?</p>
  <button>Cancel</button>
  <button>Confirm</button>
</div>
```

### Tabs

```html
<div role="tablist" aria-label="Settings">
  <button role="tab"
          id="tab-1"
          aria-selected="true"
          aria-controls="panel-1">
    General
  </button>
  <button role="tab"
          id="tab-2"
          aria-selected="false"
          aria-controls="panel-2"
          tabindex="-1">
    Security
  </button>
</div>
<div role="tabpanel"
     id="panel-1"
     aria-labelledby="tab-1">
  General settings content
</div>
<div role="tabpanel"
     id="panel-2"
     aria-labelledby="tab-2"
     hidden>
  Security settings content
</div>
```

### Combobox

```html
<label id="city-label">City</label>
<input type="text"
       role="combobox"
       aria-labelledby="city-label"
       aria-expanded="true"
       aria-controls="city-listbox"
       aria-activedescendant="city-2"
       aria-autocomplete="list">
<ul role="listbox" id="city-listbox">
  <li role="option" id="city-1">Tokyo</li>
  <li role="option" id="city-2" aria-selected="true">Osaka</li>
  <li role="option" id="city-3">Kyoto</li>
</ul>
```

---

## Quick Reference

| Attribute | Purpose | Value |
|-----------|---------|-------|
| aria-labelledby | Accessible name from element(s) | Space-separated IDs |
| aria-label | Accessible name as string | String |
| aria-describedby | Additional description | Space-separated IDs |
| aria-details | Extended details reference | ID |
| aria-controls | Element(s) controlled | Space-separated IDs |
| aria-owns | Virtual children | Space-separated IDs |
| aria-activedescendant | Currently active child | Single ID |
| aria-flowto | Reading order | Space-separated IDs |
| aria-errormessage | Error message element | ID |

---

## Common Mistakes

### 1. Referencing Non-existent IDs
```html
<!-- Bad: ID doesn't exist -->
<input aria-labelledby="missing-id">

<!-- Good: ID exists -->
<span id="label">Name</span>
<input aria-labelledby="label">
```

### 2. Circular References
```html
<!-- Bad: Element references itself -->
<div id="box" aria-labelledby="box">Content</div>
```

### 3. Using aria-label When Visible Text Exists
```html
<!-- Bad: Redundant -->
<button aria-label="Submit">Submit</button>

<!-- Good: Use visible text -->
<button>Submit</button>
```

### 4. aria-owns Without Need
```html
<!-- Bad: DOM parent-child is sufficient -->
<ul role="listbox" aria-owns="opt1 opt2">
  <li role="option" id="opt1">1</li>
  <li role="option" id="opt2">2</li>
</ul>

<!-- Good: Natural DOM relationship -->
<ul role="listbox">
  <li role="option">1</li>
  <li role="option">2</li>
</ul>
```
