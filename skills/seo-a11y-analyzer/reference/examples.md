# Analysis Examples

## Example 1: Complete Page Audit

### Input HTML

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h1>Welcome</h1>
  <h1>Our Products</h1>

  <img src="hero.jpg">

  <p style="color: #999;">Light gray text on white background.</p>

  <form>
    <input type="email" placeholder="Email">
    <button>Submit</button>
  </form>

  <a href="/details">Click here</a>
</body>
</html>
```

### Expected Report

```markdown
# Accessibility & SEO Report: page.html

## Summary
- Critical: 4
- Serious: 3
- Warnings: 2
- Info: 0

## Critical Issues (P0)

### 1. Missing Title Tag - WCAG 2.4.2

**Problem**: Page has no `<title>` element.

**Location**: `<head>`

**Current code**:
```html
<head>
  <meta charset="UTF-8">
</head>
```

**Fixed code**:
```html
<head>
  <meta charset="UTF-8">
  <title>Product Catalog - Company Name</title>
</head>
```

**Why this matters**: Title appears in search results and browser tabs.

---

### 2. Missing Language Attribute - WCAG 3.1.1

**Problem**: `<html>` missing `lang` attribute.

**Location**: Line 2

**Current code**:
```html
<html>
```

**Fixed code**:
```html
<html lang="en">
```

---

### 3. Multiple H1 Tags - WCAG 2.4.6

**Problem**: Page has 2 `<h1>` elements. Should have exactly one.

**Location**: Lines 7, 8

**Current code**:
```html
<h1>Welcome</h1>
<h1>Our Products</h1>
```

**Fixed code**:
```html
<h1>Welcome to Our Products</h1>
```
Or:
```html
<h1>Our Products</h1>
<h2>Welcome</h2>
```

---

### 4. Missing Image Alt Text - WCAG 1.1.1

**Problem**: Image missing `alt` attribute.

**Location**: Line 10, `img[src="hero.jpg"]`

**Current code**:
```html
<img src="hero.jpg">
```

**Fixed code**:
```html
<img src="hero.jpg" alt="Hero banner showing our latest product collection">
```

## Serious Issues

### 5. Low Contrast Text - WCAG 1.4.3

**Problem**: Text color #999999 on #FFFFFF has contrast ratio of 2.85:1 (needs 4.5:1).

**Location**: Line 12, `p[style*="color: #999"]`

**Current code**:
```html
<p style="color: #999;">Light gray text...</p>
```

**Fixed code**:
```html
<p style="color: #767676;">Light gray text...</p>
```

---

### 6. Missing Form Label - WCAG 1.3.1

**Problem**: Input has no associated label.

**Location**: Line 15, `input[type="email"]`

**Current code**:
```html
<input type="email" placeholder="Email">
```

**Fixed code**:
```html
<label for="email">Email address</label>
<input type="email" id="email" placeholder="Email">
```

---

### 7. Vague Link Text - WCAG 2.4.4

**Problem**: Link text "Click here" doesn't describe destination.

**Location**: Line 19

**Current code**:
```html
<a href="/details">Click here</a>
```

**Fixed code**:
```html
<a href="/details">View product details</a>
```

## Warnings

### 8. Missing Meta Description - SEO

**Problem**: No meta description for search engines.

**Location**: `<head>`

**Fix**: Add meta description:
```html
<meta name="description" content="Browse our product catalog...">
```

---

### 9. Missing Viewport Meta - SEO

**Problem**: No viewport meta tag for mobile devices.

**Location**: `<head>`

**Fix**: Add viewport meta:
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Passed Checks

- Character encoding specified
- No duplicate IDs
- Form has submit button
- No deprecated HTML elements
```

---

## Example 2: React Component Audit

### Input (JSX)

```jsx
function ProductCard({ product }) {
  return (
    <div className="card" onClick={() => navigate(`/product/${product.id}`)}>
      <img src={product.image} />
      <h4>{product.name}</h4>
      <p className="price">${product.price}</p>
      <div className="rating" style={{ color: '#ccc' }}>
        ★★★★☆
      </div>
    </div>
  )
}
```

### Expected Issues

```markdown
## Issues Found

### 1. Clickable Div Without Keyboard Access - WCAG 2.1.1

**Problem**: `<div>` with onClick is not keyboard accessible.

**Current code**:
```jsx
<div className="card" onClick={() => navigate(...)}>
```

**Fixed code**:
```jsx
<div
  className="card"
  onClick={() => navigate(...)}
  onKeyDown={(e) => e.key === 'Enter' && navigate(...)}
  role="button"
  tabIndex={0}
  aria-label={`View ${product.name} details`}
>
```

Or better, use a native element:
```jsx
<a href={`/product/${product.id}`} className="card">
```

---

### 2. Missing Alt Text - WCAG 1.1.1

**Problem**: Image missing alt prop.

**Current code**:
```jsx
<img src={product.image} />
```

**Fixed code**:
```jsx
<img src={product.image} alt={product.name} />
```

---

### 3. Low Contrast Rating Stars - WCAG 1.4.3

**Problem**: #ccc on white = 1.61:1 ratio.

**Current code**:
```jsx
<div style={{ color: '#ccc' }}>★★★★☆</div>
```

**Fixed code**:
```jsx
<div style={{ color: '#767676' }}>★★★★☆</div>
```

---

### 4. Rating Missing Screen Reader Text - WCAG 1.1.1

**Problem**: Visual stars not accessible to screen readers.

**Fixed code**:
```jsx
<div
  className="rating"
  role="img"
  aria-label={`Rating: ${product.rating} out of 5 stars`}
  style={{ color: '#767676' }}
>
  ★★★★☆
</div>
```
```

---

## Example 3: Before/After Comparison

### Before (Inaccessible)

```html
<div class="modal" style="display: block;">
  <div class="modal-content">
    <span class="close" onclick="closeModal()">&times;</span>
    <h2>Subscribe</h2>
    <input placeholder="Your email">
    <div class="btn" onclick="subscribe()">Subscribe</div>
  </div>
</div>
```

### After (Accessible)

```html
<div
  class="modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-desc"
>
  <div class="modal-content">
    <button
      class="close"
      aria-label="Close dialog"
      onclick="closeModal()"
    >
      &times;
    </button>

    <h2 id="modal-title">Subscribe to Newsletter</h2>
    <p id="modal-desc">Enter your email to receive updates.</p>

    <label for="subscribe-email">Email address</label>
    <input
      type="email"
      id="subscribe-email"
      placeholder="you@example.com"
      aria-required="true"
    >

    <button onclick="subscribe()">Subscribe</button>
  </div>
</div>
```

### Changes Made

| Issue | Before | After |
|-------|--------|-------|
| Dialog role | Missing | `role="dialog"` |
| Modal indication | Missing | `aria-modal="true"` |
| Dialog label | Missing | `aria-labelledby` |
| Close button | `<span>` | `<button aria-label>` |
| Form label | Missing | `<label>` |
| Submit button | `<div>` | `<button>` |
| Input type | Generic | `type="email"` |

---

## Validation Loop Example

### Initial Analysis
```
Critical Issues: 3
- Missing title
- Missing H1
- Image without alt
```

### After First Fix
```bash
npx @axe-core/cli page.html --tags wcag21aa
```
```
Critical Issues: 1
- Form input missing label
```

### After Second Fix
```bash
npx @axe-core/cli page.html --tags wcag21aa
```
```
Critical Issues: 0
Serious Issues: 0
✅ WCAG 2.1 AA validation passed
```
