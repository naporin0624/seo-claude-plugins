# Principle 2: Operable

UI components and navigation must be operable.

## 2.1 Keyboard Accessible

### 2.1.1 Keyboard (A)

All functionality available via keyboard.

**Requirements**:
- All interactive elements are focusable
- Custom widgets have keyboard handlers
- No keyboard traps

**Examples**:
```html
<!-- Native elements are keyboard accessible -->
<button onclick="submit()">Submit</button>
<a href="/page">Link</a>
<input type="text">

<!-- Custom widget needs keyboard support -->
<div role="button"
     tabindex="0"
     onclick="toggle()"
     onkeydown="if(event.key==='Enter'||event.key===' ')toggle()">
  Toggle
</div>
```

### 2.1.2 No Keyboard Trap (A)

Focus can move away from any component.

**Common traps**:
- Modals without escape key handling
- Infinite tab loops
- Focus stuck in iframe

```javascript
// Modal should allow escape
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
```

### 2.1.4 Character Key Shortcuts (A)

Single character shortcuts can be turned off or remapped.

---

## 2.2 Enough Time

### 2.2.1 Timing Adjustable (A)

Time limits can be turned off, adjusted, or extended.

**Exceptions**: Real-time events, essential timing, >20 hours

```html
<!-- Session timeout warning -->
<div role="alertdialog" aria-labelledby="timeout-title">
  <h2 id="timeout-title">Session Expiring</h2>
  <p>Your session will expire in 2 minutes.</p>
  <button onclick="extendSession()">Extend Session</button>
  <button onclick="logout()">Log Out</button>
</div>
```

### 2.2.2 Pause, Stop, Hide (A)

Moving, blinking, scrolling content can be controlled.

**Requirements**:
- Auto-playing content has pause control
- Carousels have stop button
- Animations can be disabled

```html
<div class="carousel">
  <button aria-label="Pause carousel" onclick="togglePause()">
    ⏸
  </button>
  <!-- slides -->
</div>
```

---

## 2.3 Seizures and Physical Reactions

### 2.3.1 Three Flashes or Below Threshold (A)

No content flashes more than 3 times per second.

---

## 2.4 Navigable

### 2.4.1 Bypass Blocks (A)

Mechanism to skip repeated content.

```html
<body>
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>
  <header>...</header>
  <nav>...</nav>
  <main id="main-content">...</main>
</body>

<style>
.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  left: 10px;
  top: 10px;
}
</style>
```

### 2.4.2 Page Titled (A)

Pages have descriptive titles.

```html
<!-- Good -->
<title>Shopping Cart (3 items) - Store Name</title>
<title>Edit Profile - Account Settings - App Name</title>

<!-- Bad -->
<title>Page</title>
<title>Untitled Document</title>
```

### 2.4.3 Focus Order (A)

Focus order is logical and meaningful.

**Requirements**:
- Tab order matches visual order
- Modal focus is trapped inside
- Focus returns after modal closes
- Avoid positive tabindex

```html
<!-- Good: Natural DOM order -->
<header>...</header>
<nav>...</nav>
<main>...</main>
<footer>...</footer>

<!-- Avoid: tabindex > 0 -->
<button tabindex="3">Third</button>  <!-- Bad -->
<button tabindex="1">First</button>  <!-- Bad -->
```

### 2.4.4 Link Purpose (In Context) (A)

Link purpose is clear from link text or context.

```html
<!-- Good: Descriptive link text -->
<a href="/report.pdf">Download Q3 Financial Report (PDF, 2.5MB)</a>

<!-- Good: Context from surrounding content -->
<article>
  <h2>Product Launch Announcement</h2>
  <p>We're excited to announce our new product...</p>
  <a href="/products/new">Read more about our new product</a>
</article>

<!-- Bad: Ambiguous -->
<a href="/report.pdf">Click here</a>
<a href="/details">More info</a>
<a href="/page">Learn more</a>
```

### 2.4.5 Multiple Ways (AA)

Multiple ways to locate pages in a website.

**Options**:
- Site navigation
- Site map
- Search
- Table of contents
- A-Z index

### 2.4.6 Headings and Labels (AA)

Headings and labels describe content.

```html
<!-- Good: Descriptive headings -->
<h1>User Account Settings</h1>
<h2>Personal Information</h2>
<h2>Security Settings</h2>
<h2>Notification Preferences</h2>

<!-- Good: Descriptive labels -->
<label for="email">Email address</label>
<label for="phone">Phone number (optional)</label>

<!-- Bad: Vague -->
<h2>Section 1</h2>
<label for="field1">Field</label>
```

### 2.4.7 Focus Visible (AA)

Keyboard focus is visible.

```css
/* Good: Custom focus indicator */
button:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* Good: Focus-visible for mouse vs keyboard */
button:focus-visible {
  outline: 2px solid #005fcc;
}

/* Bad: Removing focus without replacement */
*:focus {
  outline: none; /* DON'T DO THIS */
}
```

---

## 2.5 Input Modalities

### 2.5.1 Pointer Gestures (A)

Multi-point gestures have single-pointer alternatives.

```html
<!-- Pinch-to-zoom alternative -->
<button onclick="zoomIn()">+</button>
<button onclick="zoomOut()">-</button>

<!-- Swipe alternative -->
<button onclick="previousSlide()">Previous</button>
<button onclick="nextSlide()">Next</button>
```

### 2.5.2 Pointer Cancellation (A)

Actions triggered on up-event, can be aborted.

```javascript
// Good: Action on mouseup/click
button.addEventListener('click', doAction);

// Allow cancellation by moving pointer away
button.addEventListener('mousedown', () => {
  // Prepare but don't execute
});
```

### 2.5.3 Label in Name (A)

Accessible name includes visible text.

```html
<!-- Good: aria-label includes visible text -->
<button aria-label="Search products">
  Search
</button>

<!-- Bad: aria-label doesn't match -->
<button aria-label="Find items">
  Search  <!-- Voice users say "click search" -->
</button>
```

### 2.5.4 Motion Actuation (A)

Motion-triggered actions have UI alternatives.

```html
<!-- Shake-to-undo alternative -->
<button onclick="undo()">Undo</button>

<!-- Tilt-to-scroll alternative -->
<button onclick="scrollDown()">Scroll Down</button>
```

---

## Testing Checklist

```
2.1.1 Keyboard:
- [ ] All links/buttons focusable
- [ ] Custom widgets have keyboard handlers
- [ ] Enter/Space activates buttons
- [ ] Arrow keys for tabs, menus, etc.

2.1.2 No Keyboard Trap:
- [ ] Tab moves through all elements
- [ ] Focus escapes modals
- [ ] No infinite loops

2.4.1 Bypass Blocks:
- [ ] Skip link to main content
- [ ] Skip link visible on focus

2.4.3 Focus Order:
- [ ] Tab order matches visual order
- [ ] Modal traps focus
- [ ] Focus returns after modal closes

2.4.7 Focus Visible:
- [ ] Focus indicator visible
- [ ] Custom focus styles have contrast
- [ ] Focus not removed without replacement
```

---

## Common Keyboard Patterns

| Component | Keys |
|-----------|------|
| Button | Enter, Space |
| Link | Enter |
| Checkbox | Space |
| Radio | Arrow keys |
| Tab list | Arrow keys |
| Menu | Arrow keys, Enter, Escape |
| Dialog | Tab (trapped), Escape |
| Slider | Arrow keys |
| Combobox | Arrow keys, Enter, Escape |
