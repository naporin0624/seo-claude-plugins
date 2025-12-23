# WCAG Quick Reference for Analyzer

Quick lookup of WCAG 2.1 criteria relevant to static HTML analysis.

## Detectable via Static Analysis

### 1.1.1 Non-text Content (A)
**Detection**: Check all `<img>` for `alt` attribute.

```html
<!-- Fail -->
<img src="photo.jpg">

<!-- Pass -->
<img src="photo.jpg" alt="Team photo at company retreat">
<img src="decoration.png" alt=""> <!-- Decorative -->
```

### 1.3.1 Info and Relationships (A)
**Detection**: Check for semantic HTML usage.

- Tables have `<th>` headers
- Forms have `<label>` elements
- Lists use `<ul>`, `<ol>`, `<dl>`
- Headings properly nested

### 1.3.5 Identify Input Purpose (AA)
**Detection**: Check `autocomplete` on form fields.

```html
<input type="text" name="name" autocomplete="name">
<input type="email" name="email" autocomplete="email">
```

### 1.4.3 Contrast (Minimum) (AA)
**Detection**: Extract color values from inline styles and `<style>` tags.

| Type | Ratio |
|------|-------|
| Normal text | 4.5:1 |
| Large text | 3:1 |
| UI components | 3:1 |

### 1.4.4 Resize Text (AA)
**Detection**: Check for fixed font sizes that prevent scaling.

```css
/* Potential issue */
font-size: 12px !important;
```

### 2.4.1 Bypass Blocks (A)
**Detection**: Check for skip links.

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

### 2.4.2 Page Titled (A)
**Detection**: Check `<title>` exists and is descriptive.

```html
<!-- Fail -->
<title></title>
<title>Untitled</title>

<!-- Pass -->
<title>Product Catalog - Company Name</title>
```

### 2.4.4 Link Purpose (A)
**Detection**: Check for vague link text.

```html
<!-- Fail -->
<a href="...">Click here</a>
<a href="...">Read more</a>
<a href="...">Learn more</a>

<!-- Pass -->
<a href="...">Read the full accessibility report</a>
```

### 2.4.6 Headings and Labels (AA)
**Detection**: Check headings describe content, labels describe inputs.

```html
<!-- Fail -->
<h2>Details</h2>
<label>Field 1</label>

<!-- Pass -->
<h2>Shipping Details</h2>
<label for="address">Street Address</label>
```

### 3.1.1 Language of Page (A)
**Detection**: Check `<html lang="xx">` attribute.

```html
<!-- Fail -->
<html>

<!-- Pass -->
<html lang="en">
```

### 3.1.2 Language of Parts (AA)
**Detection**: Check `lang` attribute on foreign language content.

```html
<p>The French word <span lang="fr">bonjour</span> means hello.</p>
```

### 4.1.1 Parsing (A)
**Detection**: Check for HTML validity.

- No duplicate IDs
- Elements properly nested
- Required attributes present

```html
<!-- Fail: Duplicate IDs -->
<div id="header">...</div>
<div id="header">...</div>
```

### 4.1.2 Name, Role, Value (A)
**Detection**: Check ARIA attributes.

- Valid `role` values
- Required ARIA attributes present
- `aria-hidden` not on focusable elements

## Partially Detectable

### 1.1.1 Alt Text Quality
**Detection**: Can check presence but not appropriateness.

**Flags**:
- `alt=""` on non-decorative images
- Alt text same as filename
- Alt text too short (<5 chars) for complex images

### 1.4.1 Use of Color (A)
**Detection**: Can flag links styled only with color.

```html
<!-- Potential issue: link not underlined -->
<style>
a { color: blue; text-decoration: none; }
</style>
```

### 2.4.7 Focus Visible (AA)
**Detection**: Can flag `outline: none` without replacement.

```css
/* Potential issue */
*:focus { outline: none; }
```

## Not Detectable via Static Analysis

These require browser testing or manual review:

| Criterion | Why |
|-----------|-----|
| 1.2.x Audio/Video | Media content analysis |
| 1.4.10 Reflow | Requires viewport testing |
| 2.1.1 Keyboard | Requires interaction testing |
| 2.1.2 No Keyboard Trap | Requires interaction testing |
| 2.2.x Timing | Requires runtime analysis |
| 2.3.1 Flashing | Requires animation analysis |
| 2.4.3 Focus Order | Requires interaction testing |
| 3.2.x Predictable | Requires behavior analysis |
| 3.3.x Error Handling | Requires form submission |

## Quick Check Matrix

| Check | Static | axe-core | Manual |
|-------|--------|----------|--------|
| Alt text present | ✅ | ✅ | Quality |
| Color contrast | ⚠️ | ✅ | Edge cases |
| Form labels | ✅ | ✅ | - |
| Heading structure | ✅ | ✅ | Meaning |
| Language attribute | ✅ | ✅ | - |
| Link text | ⚠️ | ✅ | Context |
| ARIA attributes | ✅ | ✅ | Usage |
| Keyboard access | ❌ | ⚠️ | ✅ |
| Focus visible | ⚠️ | ✅ | Edge cases |

Legend:
- ✅ Fully detectable
- ⚠️ Partially detectable
- ❌ Not detectable

## Severity Mapping

| WCAG Level | Typical Severity |
|------------|------------------|
| Level A | Critical/Serious |
| Level AA | Serious/Moderate |
| Level AAA | Moderate/Minor |

## Common Violations (by frequency)

1. **Missing alt text** (1.1.1)
2. **Low contrast** (1.4.3)
3. **Missing form labels** (1.3.1)
4. **Missing page title** (2.4.2)
5. **Missing language attribute** (3.1.1)
6. **Empty links/buttons** (4.1.2)
7. **Duplicate IDs** (4.1.1)
8. **Missing heading structure** (1.3.1)
