# Principle 1: Perceivable

Information and UI components must be presentable in ways users can perceive.

## 1.1 Text Alternatives

### 1.1.1 Non-text Content (A)

All non-text content has a text alternative.

**Requirements**:
- Images have descriptive `alt` text
- Decorative images have `alt=""`
- Complex images have long descriptions
- Icons have accessible names

**Examples**:
```html
<!-- Informative image -->
<img src="chart.png" alt="Sales increased 25% in Q3 2024">

<!-- Decorative image -->
<img src="divider.png" alt="">

<!-- Complex image with long description -->
<figure>
  <img src="flowchart.png" alt="User registration process flowchart">
  <figcaption>
    Detailed description: User clicks Register, enters email,
    verifies email, creates password, completes profile.
  </figcaption>
</figure>

<!-- Icon button -->
<button aria-label="Search">
  <svg aria-hidden="true">...</svg>
</button>
```

---

## 1.2 Time-based Media

### 1.2.1 Audio-only/Video-only (A)

Pre-recorded audio/video has alternatives.

**Requirements**:
- Audio-only: Text transcript
- Video-only: Text description or audio track

### 1.2.2 Captions (Pre-recorded) (A)

Pre-recorded video has captions.

```html
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English">
</video>
```

### 1.2.3 Audio Description (Pre-recorded) (A)

Video has audio description for visual content.

### 1.2.4 Captions (Live) (AA)

Live video has real-time captions.

### 1.2.5 Audio Description (Pre-recorded) (AA)

Audio description for all pre-recorded video.

---

## 1.3 Adaptable

### 1.3.1 Info and Relationships (A)

Structure is programmatically determinable.

**Requirements**:
- Use semantic HTML
- Tables have proper headers
- Forms have labels
- Lists use list elements

**Examples**:
```html
<!-- Semantic structure -->
<header>
  <nav aria-label="Main">...</nav>
</header>
<main>
  <article>
    <h1>Title</h1>
    <section>...</section>
  </article>
</main>
<footer>...</footer>

<!-- Data table -->
<table>
  <caption>Q3 Sales Results</caption>
  <thead>
    <tr>
      <th scope="col">Product</th>
      <th scope="col">Units</th>
      <th scope="col">Revenue</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Widget A</th>
      <td>1,000</td>
      <td>$10,000</td>
    </tr>
  </tbody>
</table>

<!-- Form with labels -->
<form>
  <label for="name">Full name</label>
  <input type="text" id="name" name="name">

  <fieldset>
    <legend>Preferred contact method</legend>
    <input type="radio" id="email" name="contact" value="email">
    <label for="email">Email</label>
    <input type="radio" id="phone" name="contact" value="phone">
    <label for="phone">Phone</label>
  </fieldset>
</form>
```

### 1.3.2 Meaningful Sequence (A)

Reading order is logical and programmatically determinable.

**Requirements**:
- DOM order matches visual order
- CSS doesn't disrupt reading sequence
- Tab order follows visual flow

### 1.3.3 Sensory Characteristics (A)

Instructions don't rely solely on sensory characteristics.

```html
<!-- Bad -->
<p>Click the green button on the right.</p>

<!-- Good -->
<p>Click the "Submit" button.</p>
```

### 1.3.4 Orientation (AA)

Content doesn't restrict to single orientation unless essential.

### 1.3.5 Identify Input Purpose (AA)

Input fields have programmatic purpose.

```html
<input type="text" autocomplete="name" name="fullname">
<input type="email" autocomplete="email" name="email">
<input type="tel" autocomplete="tel" name="phone">
<input type="text" autocomplete="street-address" name="address">
```

---

## 1.4 Distinguishable

### 1.4.1 Use of Color (A)

Color isn't the only visual means of conveying info.

```html
<!-- Bad: Error indicated only by color -->
<input style="border-color: red;">

<!-- Good: Error with icon and text -->
<input aria-invalid="true" aria-describedby="error-msg">
<span id="error-msg" class="error">
  <svg aria-hidden="true">⚠</svg>
  Invalid email format
</span>
```

### 1.4.2 Audio Control (A)

Auto-playing audio can be paused/stopped or volume controlled.

### 1.4.3 Contrast (Minimum) (AA)

**Text contrast requirements**:
| Text Type | Minimum Ratio |
|-----------|---------------|
| Normal text | 4.5:1 |
| Large text (18pt / 14pt bold) | 3:1 |
| UI components | 3:1 |

```css
/* Pass: #595959 on #fff = 7:1 */
.text { color: #595959; background: #fff; }

/* Fail: #999 on #fff = 2.85:1 */
.light { color: #999; background: #fff; }
```

### 1.4.4 Resize Text (AA)

Text resizable to 200% without loss of content.

```css
/* Use relative units */
font-size: 1rem;
line-height: 1.5;
```

### 1.4.5 Images of Text (AA)

Text used instead of images of text (with exceptions).

### 1.4.10 Reflow (AA)

Content reflows without horizontal scrolling at 320px.

```css
/* Responsive design */
@media (max-width: 320px) {
  .container { width: 100%; }
}
```

### 1.4.11 Non-text Contrast (AA)

UI components and graphics have 3:1 contrast.

```css
/* Focus indicator */
button:focus {
  outline: 2px solid #005fcc; /* Sufficient contrast */
}

/* Form field border */
input {
  border: 1px solid #767676; /* 4.54:1 on white */
}
```

### 1.4.12 Text Spacing (AA)

No loss of content when text spacing is adjusted:
- Line height: 1.5x font size
- Paragraph spacing: 2x font size
- Letter spacing: 0.12x font size
- Word spacing: 0.16x font size

### 1.4.13 Content on Hover or Focus (AA)

Hover/focus content is dismissible, hoverable, and persistent.

```css
/* Tooltip that meets requirements */
.tooltip {
  /* Visible until dismissed */
  /* Can hover over tooltip */
  /* Persists until focus moves */
}
```

---

## Testing Checklist

```
1.1.1 Non-text Content:
- [ ] All images have alt text
- [ ] Decorative images have alt=""
- [ ] Icons have accessible names
- [ ] SVGs have titles or aria-labels

1.3.1 Info and Relationships:
- [ ] Semantic HTML used
- [ ] Tables have headers
- [ ] Forms have labels
- [ ] Lists use proper elements

1.4.3 Contrast:
- [ ] Text meets 4.5:1 (or 3:1 for large)
- [ ] UI components meet 3:1
- [ ] Focus indicators visible

1.4.4 Resize Text:
- [ ] Page usable at 200% zoom
- [ ] No horizontal scroll at 320px
- [ ] Text doesn't overlap
```
