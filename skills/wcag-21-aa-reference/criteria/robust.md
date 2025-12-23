# Principle 4: Robust

Content must be robust enough for reliable interpretation.

## 4.1 Compatible

### 4.1.1 Parsing (A)

*Note: This criterion was deprecated in WCAG 2.2 but remains in WCAG 2.1.*

HTML is well-formed without parsing errors.

**Requirements**:
- Complete start and end tags
- Nested according to specification
- No duplicate attributes
- **No duplicate IDs**

```html
<!-- Bad: Duplicate IDs -->
<div id="header">...</div>
<div id="header">...</div>

<!-- Good: Unique IDs -->
<div id="site-header">...</div>
<div id="page-header">...</div>

<!-- Bad: Improper nesting -->
<p><div>Content</div></p>

<!-- Good: Proper nesting -->
<div><p>Content</p></div>

<!-- Bad: Missing end tag -->
<ul>
  <li>Item 1
  <li>Item 2
</ul>

<!-- Good: Complete tags -->
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

### 4.1.2 Name, Role, Value (A)

All UI components have accessible name, role, and state.

**Requirements**:
- Interactive elements have accessible names
- Custom widgets have appropriate roles
- States are programmatically exposed
- State changes are announced

**Native elements get this automatically**:
```html
<!-- Button has name from content, role from element -->
<button>Submit</button>

<!-- Link has name from content, role from element -->
<a href="/page">Learn more about our services</a>

<!-- Checkbox has name from label, role and state from element -->
<input type="checkbox" id="agree" checked>
<label for="agree">I agree to terms</label>
```

**Custom widgets need ARIA**:
```html
<!-- Custom button -->
<div role="button"
     tabindex="0"
     aria-pressed="false"
     onclick="toggle()"
     onkeydown="if(event.key==='Enter')toggle()">
  Toggle Feature
</div>

<!-- Custom checkbox -->
<div role="checkbox"
     tabindex="0"
     aria-checked="true"
     aria-labelledby="custom-label"
     onclick="toggleCheck()"
     onkeydown="if(event.key===' ')toggleCheck()">
  <span class="checkmark">✓</span>
</div>
<span id="custom-label">Enable notifications</span>

<!-- Custom slider -->
<div role="slider"
     tabindex="0"
     aria-valuenow="50"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-valuetext="50 percent"
     aria-label="Volume">
  <div class="slider-thumb"></div>
</div>

<!-- Custom tab panel -->
<div role="tablist" aria-label="Product information">
  <button role="tab"
          id="tab-1"
          aria-selected="true"
          aria-controls="panel-1">
    Description
  </button>
  <button role="tab"
          id="tab-2"
          aria-selected="false"
          aria-controls="panel-2"
          tabindex="-1">
    Reviews
  </button>
</div>
<div role="tabpanel"
     id="panel-1"
     aria-labelledby="tab-1">
  Product description content...
</div>
<div role="tabpanel"
     id="panel-2"
     aria-labelledby="tab-2"
     hidden>
  Reviews content...
</div>
```

### 4.1.3 Status Messages (AA)

Status messages are announced without focus change.

**Use ARIA live regions**:
```html
<!-- Polite announcement (non-urgent) -->
<div role="status" aria-live="polite">
  <!-- Dynamic content inserted here -->
</div>

<!-- Assertive announcement (urgent) -->
<div role="alert" aria-live="assertive">
  <!-- Error messages -->
</div>

<!-- Examples -->
<div role="status" aria-live="polite">
  3 items added to cart
</div>

<div role="status" aria-live="polite">
  Search found 42 results
</div>

<div role="alert" aria-live="assertive">
  Session expired. Please log in again.
</div>

<!-- Progress indicator -->
<div role="progressbar"
     aria-valuenow="75"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="Upload progress">
  75% complete
</div>
```

**Common status message patterns**:

```html
<!-- Form submission success -->
<div role="status" aria-live="polite" class="success">
  Your message has been sent successfully.
</div>

<!-- Search results count -->
<div role="status" aria-live="polite">
  Showing 1-10 of 156 results
</div>

<!-- Loading indicator -->
<div role="status" aria-live="polite" aria-busy="true">
  Loading content...
</div>

<!-- Cart update -->
<div role="status" aria-live="polite">
  Item added to cart. Cart total: $99.99
</div>

<!-- Error message (assertive) -->
<div role="alert" aria-live="assertive">
  Error: Unable to save changes. Please try again.
</div>
```

---

## Accessible Name Computation

Order of precedence for accessible names:

1. `aria-labelledby`
2. `aria-label`
3. `<label>` element
4. `title` attribute
5. Element content (for buttons, links)
6. `placeholder` (not recommended as only source)

```html
<!-- aria-labelledby takes precedence -->
<span id="label">Search products</span>
<input aria-labelledby="label" aria-label="Find items">
<!-- Accessible name: "Search products" -->

<!-- aria-label used when no labelledby -->
<button aria-label="Close dialog">×</button>
<!-- Accessible name: "Close dialog" -->

<!-- Label element -->
<label for="email">Email address</label>
<input type="email" id="email">
<!-- Accessible name: "Email address" -->

<!-- Button content -->
<button>Submit form</button>
<!-- Accessible name: "Submit form" -->
```

---

## Common ARIA Roles

### Widget Roles
| Role | Use Case |
|------|----------|
| button | Clickable element |
| checkbox | Toggle selection |
| combobox | Autocomplete input |
| dialog | Modal window |
| listbox | Selection list |
| menu | Context menu |
| menuitem | Menu option |
| progressbar | Progress indicator |
| radio | Radio button |
| slider | Range input |
| switch | On/off toggle |
| tab | Tab selector |
| tabpanel | Tab content |
| textbox | Text input |
| tooltip | Tooltip |

### Document Structure Roles
| Role | Use Case |
|------|----------|
| article | Self-contained content |
| banner | Site header |
| complementary | Supporting content |
| contentinfo | Site footer |
| main | Main content |
| navigation | Navigation links |
| region | Named section |
| search | Search functionality |

---

## Testing Checklist

```
4.1.1 Parsing:
- [ ] No duplicate IDs
- [ ] Proper element nesting
- [ ] Complete start/end tags
- [ ] Valid HTML

4.1.2 Name, Role, Value:
- [ ] All buttons have accessible names
- [ ] All links have accessible names
- [ ] All form inputs have labels
- [ ] Custom widgets have roles
- [ ] States are exposed (checked, expanded, etc.)
- [ ] State changes update ARIA attributes

4.1.3 Status Messages:
- [ ] Success messages use role="status"
- [ ] Error alerts use role="alert"
- [ ] Progress updates announced
- [ ] No focus change for messages
```

---

## HTML Validation

Use these tools to check parsing:

```bash
# W3C Nu HTML Checker
npx html-validate page.html

# axe-core includes parsing checks
npx @axe-core/cli page.html
```

**Common HTML validation errors**:
- Duplicate ID values
- Missing required attributes
- Invalid attribute values
- Improper element nesting
- Unclosed elements

---

## Testing Tools

| Tool | What it checks |
|------|----------------|
| axe-core | ARIA usage, parsing |
| WAVE | Contrast, structure |
| Lighthouse | Overall accessibility |
| HTML Validator | HTML parsing |
| Screen readers | Real-world testing |

```bash
# Full accessibility audit
npx @axe-core/cli https://example.com --tags wcag21aa

# HTML validation
curl -s https://example.com | npx html-validate --stdin
```
