# Widget ARIA Attributes

Attributes for interactive widget states and properties.

## State Attributes

### aria-checked
Indicates checkbox/radio/switch state.

| Value | Meaning |
|-------|---------|
| `true` | Checked |
| `false` | Not checked |
| `mixed` | Partially checked (tri-state) |

```html
<!-- Checkbox -->
<div role="checkbox" aria-checked="true">Selected</div>

<!-- Radio -->
<div role="radio" aria-checked="false">Option</div>

<!-- Tri-state checkbox -->
<div role="checkbox" aria-checked="mixed">Partial selection</div>

<!-- Switch -->
<div role="switch" aria-checked="true">Enabled</div>
```

### aria-disabled
Indicates element is disabled.

| Value | Meaning |
|-------|---------|
| `true` | Disabled |
| `false` (default) | Enabled |

```html
<!-- Disabled button (still focusable for discovery) -->
<button aria-disabled="true">Submit</button>

<!-- Disabled menu item -->
<div role="menuitem" aria-disabled="true">Unavailable Option</div>
```

**Note**: Unlike HTML `disabled`, `aria-disabled` doesn't prevent interaction. Add your own handling.

### aria-expanded
Indicates expandable section state.

| Value | Meaning |
|-------|---------|
| `true` | Expanded |
| `false` | Collapsed |
| (undefined) | Not expandable |

```html
<!-- Accordion button -->
<button aria-expanded="false" aria-controls="section-1">
  Section Title
</button>
<div id="section-1" hidden>Section content</div>

<!-- Menu button -->
<button aria-haspopup="menu" aria-expanded="false">
  Options
</button>

<!-- Tree item -->
<div role="treeitem" aria-expanded="true">
  Folder
</div>
```

### aria-hidden
Hides element from assistive technology.

| Value | Meaning |
|-------|---------|
| `true` | Hidden from AT |
| `false` | Visible to AT |

```html
<!-- Decorative icon -->
<span aria-hidden="true">🔍</span>

<!-- Visual-only content -->
<div aria-hidden="true" class="decoration">...</div>
```

**Warning**: Never use on focusable elements.

### aria-invalid
Indicates input validation state.

| Value | Meaning |
|-------|---------|
| `true` | Invalid |
| `false` (default) | Valid |
| `grammar` | Grammar error |
| `spelling` | Spelling error |

```html
<input type="email"
       aria-invalid="true"
       aria-describedby="email-error">
<span id="email-error">Please enter a valid email</span>
```

### aria-pressed
Indicates toggle button state.

| Value | Meaning |
|-------|---------|
| `true` | Pressed |
| `false` | Not pressed |
| `mixed` | Partially pressed |
| (undefined) | Not a toggle |

```html
<!-- Toggle button -->
<button aria-pressed="true">Bold</button>

<!-- Group of toggles -->
<div role="toolbar">
  <button aria-pressed="true">Bold</button>
  <button aria-pressed="false">Italic</button>
  <button aria-pressed="false">Underline</button>
</div>
```

### aria-selected
Indicates selection state in lists/tabs/grids.

| Value | Meaning |
|-------|---------|
| `true` | Selected |
| `false` | Not selected |
| (undefined) | Not selectable |

```html
<!-- Tab -->
<div role="tab" aria-selected="true">Tab 1</div>
<div role="tab" aria-selected="false">Tab 2</div>

<!-- Listbox option -->
<div role="option" aria-selected="true">Selected item</div>

<!-- Grid cell -->
<div role="gridcell" aria-selected="true">Selected cell</div>
```

---

## Property Attributes

### aria-autocomplete
Indicates autocomplete behavior.

| Value | Meaning |
|-------|---------|
| `none` | No suggestions |
| `inline` | Text completion inline |
| `list` | Suggestions in popup |
| `both` | Inline + list |

```html
<input role="combobox"
       aria-autocomplete="list"
       aria-expanded="true"
       aria-controls="suggestions">
<ul id="suggestions" role="listbox">...</ul>
```

### aria-haspopup
Indicates element triggers a popup.

| Value | Meaning |
|-------|---------|
| `true` / `menu` | Opens menu |
| `listbox` | Opens listbox |
| `tree` | Opens tree |
| `grid` | Opens grid |
| `dialog` | Opens dialog |
| `false` (default) | No popup |

```html
<button aria-haspopup="menu" aria-expanded="false">
  Actions
</button>

<button aria-haspopup="dialog">
  Open Settings
</button>
```

### aria-level
Indicates heading level for custom headings.

```html
<div role="heading" aria-level="2">Section Title</div>

<!-- Tree item depth -->
<div role="treeitem" aria-level="1">Root</div>
<div role="treeitem" aria-level="2">Child</div>
```

### aria-modal
Indicates modal dialog.

```html
<div role="dialog" aria-modal="true" aria-labelledby="title">
  <h2 id="title">Modal Title</h2>
  <p>Modal content</p>
</div>
```

### aria-multiselectable
Indicates multiple selection is allowed.

```html
<div role="listbox" aria-multiselectable="true">
  <div role="option" aria-selected="true">Option 1</div>
  <div role="option" aria-selected="true">Option 2</div>
  <div role="option" aria-selected="false">Option 3</div>
</div>
```

### aria-orientation
Indicates orientation of separators, sliders, etc.

| Value | Meaning |
|-------|---------|
| `horizontal` | Horizontal |
| `vertical` | Vertical |

```html
<div role="separator" aria-orientation="horizontal"></div>
<div role="slider" aria-orientation="vertical" ...></div>
<div role="tablist" aria-orientation="vertical">...</div>
```

### aria-readonly
Indicates read-only state.

```html
<input role="spinbutton"
       aria-readonly="true"
       aria-valuenow="10">
```

### aria-required
Indicates required field.

```html
<input type="text"
       aria-required="true"
       aria-label="Full name">
```

### aria-sort
Indicates column sort direction.

| Value | Meaning |
|-------|---------|
| `ascending` | Sorted A-Z, low-high |
| `descending` | Sorted Z-A, high-low |
| `none` | Not sorted |
| `other` | Custom sort |

```html
<th role="columnheader" aria-sort="ascending">
  Name ↑
</th>
```

---

## Value Attributes

### aria-valuemax, aria-valuemin, aria-valuenow
Range widget values (required for sliders, progress bars).

```html
<div role="slider"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-valuenow="50"
     aria-label="Volume">
</div>

<div role="progressbar"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-valuenow="75">
  75%
</div>
```

### aria-valuetext
Human-readable value description.

```html
<div role="slider"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-valuenow="50"
     aria-valuetext="50 percent, medium volume"
     aria-label="Volume">
</div>

<!-- Temperature -->
<div role="slider"
     aria-valuenow="72"
     aria-valuetext="72 degrees Fahrenheit">
</div>
```

---

## Quick Reference Table

| Attribute | Values | Use With |
|-----------|--------|----------|
| aria-checked | true/false/mixed | checkbox, radio, switch |
| aria-disabled | true/false | Any interactive |
| aria-expanded | true/false | Expandable elements |
| aria-hidden | true/false | Any element |
| aria-invalid | true/false/grammar/spelling | Form inputs |
| aria-pressed | true/false/mixed | Toggle buttons |
| aria-selected | true/false | Options, tabs, cells |
| aria-autocomplete | none/inline/list/both | Combobox |
| aria-haspopup | menu/listbox/dialog/etc | Popup triggers |
| aria-level | number | Headings, tree items |
| aria-modal | true/false | Dialogs |
| aria-multiselectable | true/false | Listbox, grid |
| aria-orientation | horizontal/vertical | Separators, sliders |
| aria-readonly | true/false | Inputs |
| aria-required | true/false | Form inputs |
| aria-sort | ascending/descending/none | Table headers |
| aria-valuemax | number | Range widgets |
| aria-valuemin | number | Range widgets |
| aria-valuenow | number | Range widgets |
| aria-valuetext | string | Range widgets |
