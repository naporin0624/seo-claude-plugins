---
name: wcag-21-aa-reference
description: Provides WCAG 2.1 Level AA compliance guidance with detailed success criteria explanations, implementation examples, and testing methods. Use when user asks about WCAG requirements, accessibility standards, success criteria like "1.4.3 contrast", "2.4.7 focus visible", or needs to understand specific WCAG guidelines.
---

# WCAG 2.1 Level AA Reference

Quick reference for WCAG 2.1 Level AA compliance - the most commonly required accessibility standard.

## Four Principles (POUR)

| Principle | Description | Key Criteria |
|-----------|-------------|--------------|
| **Perceivable** | Information must be presentable | Alt text, contrast, captions |
| **Operable** | UI must be operable | Keyboard, timing, seizures |
| **Understandable** | Content must be understandable | Readable, predictable, errors |
| **Robust** | Content must be robust | Parsing, name/role/value |

## Most Important Criteria (Top 12)

These criteria cause the most compliance failures:

### 1.1.1 Non-text Content (Level A)
All non-text content has text alternative.

```html
<!-- Image -->
<img src="chart.png" alt="Q3 sales increased 25% year-over-year">

<!-- Icon button -->
<button aria-label="Search">
  <svg>...</svg>
</button>

<!-- Decorative -->
<img src="divider.png" alt="">
```

### 1.3.1 Info and Relationships (Level A)
Structure conveyed visually is also available programmatically.

```html
<!-- Use semantic HTML -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<!-- Tables need headers -->
<table>
  <thead>
    <tr><th scope="col">Name</th><th scope="col">Price</th></tr>
  </thead>
  <tbody>
    <tr><td>Widget</td><td>$10</td></tr>
  </tbody>
</table>
```

### 1.4.3 Contrast (Minimum) (Level AA)
Text has sufficient contrast against background.

| Text Type | Minimum Ratio |
|-----------|---------------|
| Normal text | 4.5:1 |
| Large text (18pt / 14pt bold) | 3:1 |
| UI components & graphics | 3:1 |

```css
/* Pass: #595959 on #fff = 7:1 */
.text { color: #595959; background: #fff; }

/* Fail: #999 on #fff = 2.85:1 */
.light-text { color: #999; background: #fff; }
```

### 1.4.4 Resize Text (Level AA)
Text can be resized up to 200% without loss of content.

```css
/* Use relative units */
font-size: 1rem;    /* Good */
font-size: 16px;    /* Acceptable but less flexible */
```

### 2.1.1 Keyboard (Level A)
All functionality available via keyboard.

```html
<!-- Native elements are keyboard accessible -->
<button onclick="doAction()">Click me</button>

<!-- Custom elements need tabindex and key handlers -->
<div role="button" tabindex="0"
     onclick="doAction()"
     onkeydown="if(event.key==='Enter')doAction()">
  Click me
</div>
```

### 2.4.3 Focus Order (Level A)
Focus order preserves meaning and operability.

```html
<!-- Logical DOM order -->
<header>...</header>
<nav>...</nav>
<main>...</main>
<footer>...</footer>

<!-- Avoid: tabindex > 0 (disrupts natural order) -->
<button tabindex="5">Bad</button>
```

### 2.4.4 Link Purpose (In Context) (Level A)
Link purpose is clear from link text or context.

```html
<!-- Good -->
<a href="/report.pdf">Download Q3 Financial Report (PDF, 2MB)</a>

<!-- Bad -->
<a href="/report.pdf">Click here</a>
```

### 2.4.6 Headings and Labels (Level AA)
Headings and labels describe topic or purpose.

```html
<!-- Good: Descriptive heading -->
<h2>Account Security Settings</h2>

<!-- Bad: Vague heading -->
<h2>Settings</h2>

<!-- Good: Descriptive label -->
<label for="email">Email address</label>
<input type="email" id="email">
```

### 2.4.7 Focus Visible (Level AA)
Keyboard focus indicator is visible.

```css
/* Never remove focus without replacement */
button:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* Bad: removes focus visibility */
*:focus { outline: none; }
```

### 3.1.1 Language of Page (Level A)
Default language is programmatically determined.

```html
<html lang="en">
<!-- or -->
<html lang="ja">
```

### 4.1.1 Parsing (Level A)
No duplicate IDs, proper nesting, complete tags.

```html
<!-- Bad: Duplicate IDs -->
<div id="main">...</div>
<div id="main">...</div>

<!-- Good: Unique IDs -->
<div id="main-content">...</div>
<div id="sidebar">...</div>
```

### 4.1.2 Name, Role, Value (Level A)
Custom components have accessible name, role, and state.

```html
<!-- Custom checkbox -->
<div role="checkbox"
     aria-checked="false"
     aria-label="Subscribe to newsletter"
     tabindex="0">
</div>

<!-- Custom tab -->
<button role="tab"
        aria-selected="true"
        aria-controls="panel-1">
  Tab 1
</button>
```

## Detailed Criteria by Principle

For complete criteria lists with examples:

- [criteria/perceivable.md](criteria/perceivable.md) - 10 criteria (1.x.x)
- [criteria/operable.md](criteria/operable.md) - 15 criteria (2.x.x)
- [criteria/understandable.md](criteria/understandable.md) - 8 criteria (3.x.x)
- [criteria/robust.md](criteria/robust.md) - 5 criteria (4.x.x)

## Testing Methods

### Automated Testing
```bash
# axe-core CLI
npx @axe-core/cli https://example.com --tags wcag21aa

# Lighthouse
npx lighthouse https://example.com --only-categories=accessibility
```

Automated tools catch ~30-40% of issues.

### Manual Testing Checklist
```
- [ ] Navigate entire page with keyboard only
- [ ] Check focus visibility on all interactive elements
- [ ] Verify screen reader announces content correctly
- [ ] Test at 200% zoom
- [ ] Check color contrast with browser devtools
- [ ] Verify form error messages are announced
```

### Screen Reader Testing
| OS | Screen Reader | Browser |
|----|---------------|---------|
| Windows | NVDA (free) | Firefox |
| Windows | JAWS | Chrome |
| macOS | VoiceOver | Safari |
| iOS | VoiceOver | Safari |
| Android | TalkBack | Chrome |

## Common Mistakes

### 1. Missing Form Labels
```html
<!-- Wrong -->
<input type="text" placeholder="Name">

<!-- Right -->
<label for="name">Name</label>
<input type="text" id="name">
```

### 2. Empty Links/Buttons
```html
<!-- Wrong -->
<a href="/cart"><img src="cart.svg"></a>

<!-- Right -->
<a href="/cart" aria-label="Shopping cart (3 items)">
  <img src="cart.svg" alt="">
</a>
```

### 3. Using Color Alone
```html
<!-- Wrong: Red text only -->
<span style="color: red">Error: Invalid email</span>

<!-- Right: Icon + text -->
<span class="error">
  <svg aria-hidden="true">...</svg>
  Error: Invalid email
</span>
```

### 4. Skip Link Missing
```html
<body>
  <!-- Add skip link for keyboard users -->
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>
  <header>...</header>
  <main id="main-content">...</main>
</body>
```

## Level A vs AA vs AAA

| Level | Description | Typical Requirement |
|-------|-------------|---------------------|
| A | Minimum | All sites should meet |
| AA | Standard | Legal requirement in many jurisdictions |
| AAA | Enhanced | Specific audiences (e.g., government) |

**This reference focuses on Level AA** - the most commonly required standard.

## Legal Requirements

| Region | Standard | Level |
|--------|----------|-------|
| US (Section 508) | WCAG 2.0 AA | AA |
| EU (EN 301 549) | WCAG 2.1 AA | AA |
| Japan (JIS X 8341-3) | WCAG 2.1 AA | AA |
| Canada | WCAG 2.1 AA | AA |

## Quick Decision Tree

```
Is it text content?
├── Yes → 1.1.1 Alt text needed
└── No → Is it interactive?
    ├── Yes → 2.1.1 Keyboard accessible?
    │         4.1.2 Name/role/value?
    └── No → Is it visible?
        ├── Yes → 1.4.3 Contrast OK?
        └── No → aria-hidden="true"?
```

## References

- [WCAG 2.1 Full Spec](https://www.w3.org/TR/WCAG21/)
- [Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/?versions=2.1&levels=aaa)
- [Understanding WCAG](https://www.w3.org/WAI/WCAG21/Understanding/)
- [Techniques](https://www.w3.org/WAI/WCAG21/Techniques/)
