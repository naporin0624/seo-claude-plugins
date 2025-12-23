# Accordion Pattern

Complete implementation guide for accessible accordions.

## Basic Structure

```html
<div class="accordion">
  <h3>
    <button aria-expanded="true"
            aria-controls="section-1-content"
            id="section-1-header">
      Section 1: Introduction
    </button>
  </h3>
  <div id="section-1-content"
       role="region"
       aria-labelledby="section-1-header">
    <p>Introduction content goes here...</p>
  </div>

  <h3>
    <button aria-expanded="false"
            aria-controls="section-2-content"
            id="section-2-header">
      Section 2: Details
    </button>
  </h3>
  <div id="section-2-content"
       role="region"
       aria-labelledby="section-2-header"
       hidden>
    <p>Details content goes here...</p>
  </div>

  <h3>
    <button aria-expanded="false"
            aria-controls="section-3-content"
            id="section-3-header">
      Section 3: Summary
    </button>
  </h3>
  <div id="section-3-content"
       role="region"
       aria-labelledby="section-3-header"
       hidden>
    <p>Summary content goes here...</p>
  </div>
</div>
```

## Required Attributes

### Header Button
| Attribute | Value | Purpose |
|-----------|-------|---------|
| `aria-expanded` | `true`/`false` | Current state |
| `aria-controls` | ID | Links to content |
| `id` | String | For panel's aria-labelledby |

### Content Panel
| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `region` | Identifies as landmark |
| `aria-labelledby` | ID | Links to header |
| `hidden` | (attribute) | Hides collapsed panels |

## Keyboard Interaction

| Key | Action |
|-----|--------|
| Enter/Space | Toggle expanded state |
| Tab | Move between accordion headers |
| Arrow Down | Next header (optional) |
| Arrow Up | Previous header (optional) |
| Home | First header (optional) |
| End | Last header (optional) |

## Complete Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    .accordion {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      max-width: 600px;
    }

    .accordion h3 {
      margin: 0;
    }

    .accordion h3:not(:first-child) {
      border-top: 1px solid #e0e0e0;
    }

    .accordion button {
      width: 100%;
      padding: 16px;
      text-align: left;
      background: #f9f9f9;
      border: none;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .accordion button:hover {
      background: #f0f0f0;
    }

    .accordion button:focus {
      outline: 2px solid #0066cc;
      outline-offset: -2px;
    }

    .accordion button::after {
      content: '+';
      font-size: 20px;
      font-weight: normal;
    }

    .accordion button[aria-expanded="true"]::after {
      content: '−';
    }

    .accordion [role="region"] {
      padding: 16px;
      background: white;
    }

    .accordion [role="region"][hidden] {
      display: none;
    }
  </style>
</head>
<body>
  <h2>Frequently Asked Questions</h2>

  <div class="accordion" id="faq-accordion">
    <h3>
      <button aria-expanded="true"
              aria-controls="faq-1-content"
              id="faq-1-header">
        What payment methods do you accept?
      </button>
    </h3>
    <div id="faq-1-content"
         role="region"
         aria-labelledby="faq-1-header">
      <p>We accept all major credit cards (Visa, MasterCard, American Express),
         PayPal, and bank transfers for orders over $500.</p>
    </div>

    <h3>
      <button aria-expanded="false"
              aria-controls="faq-2-content"
              id="faq-2-header">
        How long does shipping take?
      </button>
    </h3>
    <div id="faq-2-content"
         role="region"
         aria-labelledby="faq-2-header"
         hidden>
      <p>Standard shipping takes 5-7 business days. Express shipping
         (2-3 days) is available for an additional fee.</p>
    </div>

    <h3>
      <button aria-expanded="false"
              aria-controls="faq-3-content"
              id="faq-3-header">
        What is your return policy?
      </button>
    </h3>
    <div id="faq-3-content"
         role="region"
         aria-labelledby="faq-3-header"
         hidden>
      <p>You can return items within 30 days of purchase for a full refund.
         Items must be in original condition with tags attached.</p>
    </div>
  </div>

  <script>
    class Accordion {
      constructor(container, options = {}) {
        this.container = container;
        this.allowMultiple = options.allowMultiple ?? false;
        this.buttons = Array.from(container.querySelectorAll('h3 > button'));
        this.panels = this.buttons.map(btn =>
          document.getElementById(btn.getAttribute('aria-controls'))
        );

        this.init();
      }

      init() {
        this.buttons.forEach((button, index) => {
          button.addEventListener('click', () => this.toggle(index));
          button.addEventListener('keydown', (e) => this.handleKeydown(e, index));
        });
      }

      handleKeydown(e, currentIndex) {
        let newIndex;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            newIndex = (currentIndex + 1) % this.buttons.length;
            this.buttons[newIndex].focus();
            break;

          case 'ArrowUp':
            e.preventDefault();
            newIndex = (currentIndex - 1 + this.buttons.length) % this.buttons.length;
            this.buttons[newIndex].focus();
            break;

          case 'Home':
            e.preventDefault();
            this.buttons[0].focus();
            break;

          case 'End':
            e.preventDefault();
            this.buttons[this.buttons.length - 1].focus();
            break;
        }
      }

      toggle(index) {
        const button = this.buttons[index];
        const panel = this.panels[index];
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        // If single mode and opening, close others first
        if (!this.allowMultiple && !isExpanded) {
          this.collapseAll();
        }

        // Toggle current
        button.setAttribute('aria-expanded', !isExpanded);
        panel.hidden = isExpanded;
      }

      collapseAll() {
        this.buttons.forEach((button, index) => {
          button.setAttribute('aria-expanded', 'false');
          this.panels[index].hidden = true;
        });
      }

      expandAll() {
        this.buttons.forEach((button, index) => {
          button.setAttribute('aria-expanded', 'true');
          this.panels[index].hidden = false;
        });
      }
    }

    // Initialize - single panel mode
    new Accordion(document.getElementById('faq-accordion'));

    // For multi-panel mode:
    // new Accordion(container, { allowMultiple: true });
  </script>
</body>
</html>
```

## Native HTML Details/Summary

For simple accordions, consider native HTML:

```html
<details>
  <summary>What payment methods do you accept?</summary>
  <p>We accept all major credit cards, PayPal, and bank transfers.</p>
</details>

<details>
  <summary>How long does shipping take?</summary>
  <p>Standard shipping takes 5-7 business days.</p>
</details>
```

**Pros**: No JavaScript needed, accessible by default
**Cons**: Harder to style, can't control single-panel mode

## Single vs Multiple Expansion

### Single Panel Mode
Only one panel open at a time:

```javascript
// Close others before opening
if (!isExpanded) {
  this.collapseAll();
}
```

### Multiple Panel Mode
Allow multiple panels open:

```javascript
// Just toggle the clicked panel
button.setAttribute('aria-expanded', !isExpanded);
panel.hidden = isExpanded;
```

## Animated Transitions

```css
[role="region"] {
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  max-height: 0;
}

[role="region"]:not([hidden]) {
  max-height: 500px; /* Or calculate dynamically */
}
```

**Note**: Don't animate `hidden` attribute directly; use classes or max-height.

## Testing Checklist

```
Required:
- [ ] Button inside heading element
- [ ] aria-expanded on buttons
- [ ] aria-controls links to panel
- [ ] aria-labelledby on panels
- [ ] Hidden panels use hidden attribute
- [ ] Expanded state toggles correctly

Keyboard:
- [ ] Enter/Space toggles panel
- [ ] Tab navigates between headers
- [ ] Arrow keys navigate (if implemented)

Screen reader:
- [ ] Heading level correct
- [ ] Expanded/collapsed state announced
- [ ] Panel content readable when expanded
```

## Common Mistakes

1. **Button not inside heading** - Loses heading semantics
2. **Missing aria-expanded** - State not communicated
3. **Using visibility:hidden** - Still in tab order
4. **No keyboard activation** - Click only
5. **Focus lost on collapse** - Should stay on header
