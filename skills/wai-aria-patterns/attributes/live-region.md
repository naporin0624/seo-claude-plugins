# Live Region Attributes

Attributes for dynamic content announcements.

## Core Attributes

### aria-live
Indicates how assistive technology should announce changes.

| Value | Behavior | Use Case |
|-------|----------|----------|
| `off` | No announcement | Default, or temporary disable |
| `polite` | Wait for pause | Status updates, search results |
| `assertive` | Interrupt immediately | Errors, urgent alerts |

```html
<!-- Polite: Non-urgent status -->
<div aria-live="polite">
  Search found 42 results
</div>

<!-- Assertive: Urgent message -->
<div aria-live="assertive">
  Error: Connection lost
</div>

<!-- Off: Disable announcements -->
<div aria-live="off">
  Content being updated...
</div>
```

**Best Practice**: Prefer `polite` unless genuinely urgent.

### aria-atomic
Whether to announce entire region or just changes.

| Value | Behavior |
|-------|----------|
| `true` | Announce entire region |
| `false` (default) | Announce only changed nodes |

```html
<!-- Announce entire region -->
<div aria-live="polite" aria-atomic="true">
  Cart: 3 items, $99.99 total
</div>
<!-- When updated, announces: "Cart: 4 items, $124.99 total" -->

<!-- Announce only changes (default) -->
<div aria-live="polite" aria-atomic="false">
  <span>Items: </span><span>3</span>
</div>
<!-- When items change, announces only: "4" -->
```

### aria-relevant
What types of changes to announce.

| Value | Announces |
|-------|-----------|
| `additions` | New nodes |
| `removals` | Removed nodes |
| `text` | Text changes |
| `all` | Everything |
| `additions text` (default) | New nodes and text |

```html
<!-- Announce additions and removals -->
<ul aria-live="polite" aria-relevant="additions removals">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<!-- Announce only text changes -->
<div aria-live="polite" aria-relevant="text">
  Status: Connected
</div>
```

### aria-busy
Indicates region is being updated.

| Value | Behavior |
|-------|----------|
| `true` | Suppress announcements during updates |
| `false` (default) | Normal announcements |

```html
<!-- During loading -->
<div aria-live="polite" aria-busy="true">
  Loading results...
</div>

<!-- After loading complete -->
<div aria-live="polite" aria-busy="false">
  Found 42 results
</div>
```

**Pattern**: Set `aria-busy="true"` before update, `false` after.

---

## Live Region Roles

These roles have implicit live region behavior:

### role="alert"
Assertive live region for important messages.

```html
<!-- Implicit: aria-live="assertive" aria-atomic="true" -->
<div role="alert">
  Error: Invalid password
</div>
```

### role="status"
Polite live region for status updates.

```html
<!-- Implicit: aria-live="polite" aria-atomic="true" -->
<div role="status">
  3 items in cart
</div>
```

### role="log"
Polite live region for sequential information.

```html
<!-- Implicit: aria-live="polite" -->
<div role="log" aria-label="Chat messages">
  <div>User: Hello</div>
  <div>Agent: Hi, how can I help?</div>
</div>
```

### role="marquee"
Non-essential scrolling content.

```html
<!-- Implicit: aria-live="off" -->
<div role="marquee">Breaking news ticker...</div>
```

### role="timer"
Time-related content.

```html
<!-- Implicit: aria-live="off" -->
<div role="timer" aria-label="Time remaining">
  05:00
</div>
```

---

## Common Patterns

### Form Validation

```html
<!-- Error summary -->
<div role="alert" id="error-summary">
  <h2>Please fix the following errors:</h2>
  <ul>
    <li>Email is required</li>
    <li>Password must be 8+ characters</li>
  </ul>
</div>

<!-- Inline error -->
<input type="email" aria-describedby="email-error">
<span id="email-error" role="alert">
  Please enter a valid email address
</span>
```

### Search Results

```html
<div role="status" aria-live="polite">
  Showing 1-10 of 156 results for "accessibility"
</div>
```

### Cart Updates

```html
<div role="status" aria-live="polite" aria-atomic="true">
  Cart updated: 3 items, $99.99 total
</div>
```

### Loading States

```html
<!-- While loading -->
<div aria-live="polite" aria-busy="true">
  <span class="spinner" aria-hidden="true"></span>
  Loading products...
</div>

<!-- After loading -->
<div aria-live="polite" aria-busy="false">
  Showing 24 products
</div>
```

### Notifications

```html
<!-- Success notification -->
<div role="status" class="notification success">
  Settings saved successfully
</div>

<!-- Error notification -->
<div role="alert" class="notification error">
  Failed to save settings. Please try again.
</div>
```

### Progress Updates

```html
<div role="progressbar"
     aria-valuenow="75"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="Upload progress">
</div>
<div role="status" aria-live="polite">
  Upload 75% complete
</div>
```

---

## Best Practices

### Do

1. **Use `polite` by default**
   ```html
   <div aria-live="polite">Status updates</div>
   ```

2. **Use `assertive` only for errors/urgent**
   ```html
   <div role="alert">Critical error occurred</div>
   ```

3. **Set `aria-busy` during updates**
   ```javascript
   container.setAttribute('aria-busy', 'true');
   // ... update content ...
   container.setAttribute('aria-busy', 'false');
   ```

4. **Use semantic roles when available**
   ```html
   <div role="alert">...</div>  <!-- Better than aria-live="assertive" -->
   <div role="status">...</div> <!-- Better than aria-live="polite" -->
   ```

### Don't

1. **Don't overuse live regions**
   - Too many announcements are overwhelming
   - Only announce important changes

2. **Don't nest live regions**
   ```html
   <!-- Bad -->
   <div aria-live="polite">
     <div aria-live="assertive">...</div>
   </div>
   ```

3. **Don't use assertive for non-urgent content**
   ```html
   <!-- Bad: Interrupts for non-urgent info -->
   <div aria-live="assertive">42 products found</div>

   <!-- Good: Polite for non-urgent -->
   <div aria-live="polite">42 products found</div>
   ```

---

## Timing Considerations

- **Announce after content is stable** - avoid rapid consecutive updates
- **Use aria-busy during batch updates** - announce once at the end
- **Debounce frequent updates** - wait 300-500ms between announcements

```javascript
let updateTimeout;

function updateLiveRegion(message) {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    liveRegion.textContent = message;
  }, 300);
}
```

---

## Testing

1. **Enable screen reader** (NVDA, VoiceOver, JAWS)
2. **Trigger content change**
3. **Verify announcement** - correct timing and content
4. **Check interruption** - assertive should interrupt, polite should wait

**Screen reader testing matrix**:
| OS | Screen Reader | Browser |
|----|---------------|---------|
| Windows | NVDA | Firefox |
| Windows | JAWS | Chrome |
| macOS | VoiceOver | Safari |
| iOS | VoiceOver | Safari |
