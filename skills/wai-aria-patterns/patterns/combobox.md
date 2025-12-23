# Combobox Pattern

Complete implementation guide for accessible autocomplete/combobox components.

## Basic Structure

```html
<div class="combobox-wrapper">
  <label id="city-label">City</label>

  <input type="text"
         role="combobox"
         aria-labelledby="city-label"
         aria-autocomplete="list"
         aria-expanded="false"
         aria-controls="city-listbox"
         aria-activedescendant=""
         id="city-input">

  <ul role="listbox"
      id="city-listbox"
      aria-labelledby="city-label"
      hidden>
    <li role="option" id="city-1">Tokyo</li>
    <li role="option" id="city-2">Osaka</li>
    <li role="option" id="city-3">Kyoto</li>
    <li role="option" id="city-4">Nagoya</li>
    <li role="option" id="city-5">Sapporo</li>
  </ul>
</div>
```

## Required Attributes

### Input (Combobox)
| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `combobox` | Identifies as combobox |
| `aria-autocomplete` | `list`/`both`/`none` | Autocomplete behavior |
| `aria-expanded` | `true`/`false` | Popup state |
| `aria-controls` | ID | Links to listbox |
| `aria-activedescendant` | ID | Currently highlighted option |

### Listbox
| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `listbox` | Identifies popup type |
| `aria-labelledby` | ID | Accessible name |

### Options
| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `option` | Identifies as option |
| `id` | String | For aria-activedescendant |
| `aria-selected` | `true`/`false` | Selection state |

## Keyboard Interaction

| Key | Action |
|-----|--------|
| Down Arrow | Open popup / highlight next option |
| Up Arrow | Highlight previous option |
| Enter | Select highlighted option |
| Escape | Close popup |
| Tab | Select highlighted, move focus |
| Any character | Filter options |

## Complete Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    .combobox-wrapper {
      position: relative;
      width: 300px;
    }

    .combobox-wrapper label {
      display: block;
      margin-bottom: 4px;
      font-weight: 600;
    }

    .combobox-wrapper input {
      width: 100%;
      padding: 8px 12px;
      font-size: 16px;
      border: 2px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .combobox-wrapper input:focus {
      outline: none;
      border-color: #0066cc;
    }

    [role="listbox"] {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin: 0;
      padding: 0;
      list-style: none;
      background: white;
      border: 2px solid #0066cc;
      border-top: none;
      border-radius: 0 0 4px 4px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 100;
    }

    [role="listbox"][hidden] {
      display: none;
    }

    [role="option"] {
      padding: 8px 12px;
      cursor: pointer;
    }

    [role="option"]:hover,
    [role="option"].highlighted {
      background: #e6f2ff;
    }

    [role="option"][aria-selected="true"] {
      background: #0066cc;
      color: white;
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }
  </style>
</head>
<body>
  <h1>City Search</h1>

  <div class="combobox-wrapper" id="city-combobox">
    <label id="city-label" for="city-input">
      Select a city
    </label>

    <input type="text"
           id="city-input"
           role="combobox"
           aria-labelledby="city-label"
           aria-autocomplete="list"
           aria-expanded="false"
           aria-controls="city-listbox"
           aria-activedescendant=""
           autocomplete="off">

    <ul role="listbox"
        id="city-listbox"
        aria-labelledby="city-label"
        hidden>
    </ul>

    <div role="status" aria-live="polite" class="visually-hidden" id="status">
    </div>
  </div>

  <script>
    class Combobox {
      constructor(container) {
        this.container = container;
        this.input = container.querySelector('input');
        this.listbox = container.querySelector('[role="listbox"]');
        this.status = container.querySelector('[role="status"]');

        this.options = [];
        this.filteredOptions = [];
        this.highlightedIndex = -1;
        this.selectedValue = '';

        // Sample data
        this.allOptions = [
          'Tokyo', 'Osaka', 'Kyoto', 'Nagoya', 'Sapporo',
          'Fukuoka', 'Kobe', 'Yokohama', 'Sendai', 'Hiroshima'
        ];

        this.init();
      }

      init() {
        this.input.addEventListener('input', () => this.handleInput());
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.input.addEventListener('focus', () => this.handleFocus());
        this.input.addEventListener('blur', () => this.handleBlur());

        this.listbox.addEventListener('click', (e) => this.handleOptionClick(e));
        this.listbox.addEventListener('mouseover', (e) => this.handleMouseover(e));
      }

      handleInput() {
        const query = this.input.value.toLowerCase();

        if (query.length === 0) {
          this.closePopup();
          return;
        }

        this.filteredOptions = this.allOptions.filter(option =>
          option.toLowerCase().includes(query)
        );

        this.renderOptions();
        this.openPopup();

        // Announce results count
        this.status.textContent = `${this.filteredOptions.length} results available`;
      }

      handleKeydown(e) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            if (!this.isOpen()) {
              this.handleInput();
            } else {
              this.highlightNext();
            }
            break;

          case 'ArrowUp':
            e.preventDefault();
            this.highlightPrevious();
            break;

          case 'Enter':
            e.preventDefault();
            if (this.highlightedIndex >= 0) {
              this.selectOption(this.highlightedIndex);
            }
            break;

          case 'Escape':
            e.preventDefault();
            this.closePopup();
            break;

          case 'Tab':
            if (this.highlightedIndex >= 0 && this.isOpen()) {
              this.selectOption(this.highlightedIndex);
            }
            break;
        }
      }

      handleFocus() {
        if (this.input.value.length > 0) {
          this.handleInput();
        }
      }

      handleBlur() {
        // Delay to allow click on option
        setTimeout(() => this.closePopup(), 200);
      }

      handleOptionClick(e) {
        const option = e.target.closest('[role="option"]');
        if (option) {
          const index = this.options.indexOf(option);
          this.selectOption(index);
        }
      }

      handleMouseover(e) {
        const option = e.target.closest('[role="option"]');
        if (option) {
          const index = this.options.indexOf(option);
          this.highlightOption(index);
        }
      }

      renderOptions() {
        // Clear existing options using safe DOM methods
        while (this.listbox.firstChild) {
          this.listbox.removeChild(this.listbox.firstChild);
        }

        this.options = [];
        this.highlightedIndex = -1;

        this.filteredOptions.forEach((text, index) => {
          const option = document.createElement('li');
          option.setAttribute('role', 'option');
          option.setAttribute('id', `option-${index}`);
          // Use textContent for safe text insertion (prevents XSS)
          option.textContent = text;
          this.listbox.appendChild(option);
          this.options.push(option);
        });

        // Highlight first option by default
        if (this.options.length > 0) {
          this.highlightOption(0);
        }
      }

      highlightOption(index) {
        // Remove previous highlight
        this.options.forEach(opt => opt.classList.remove('highlighted'));

        if (index >= 0 && index < this.options.length) {
          this.highlightedIndex = index;
          const option = this.options[index];
          option.classList.add('highlighted');
          this.input.setAttribute('aria-activedescendant', option.id);

          // Scroll into view
          option.scrollIntoView({ block: 'nearest' });
        } else {
          this.highlightedIndex = -1;
          this.input.setAttribute('aria-activedescendant', '');
        }
      }

      highlightNext() {
        const newIndex = Math.min(
          this.highlightedIndex + 1,
          this.options.length - 1
        );
        this.highlightOption(newIndex);
      }

      highlightPrevious() {
        const newIndex = Math.max(this.highlightedIndex - 1, 0);
        this.highlightOption(newIndex);
      }

      selectOption(index) {
        if (index >= 0 && index < this.filteredOptions.length) {
          this.selectedValue = this.filteredOptions[index];
          this.input.value = this.selectedValue;
          this.closePopup();

          // Announce selection
          this.status.textContent = `${this.selectedValue} selected`;
        }
      }

      openPopup() {
        if (this.filteredOptions.length > 0) {
          this.listbox.hidden = false;
          this.input.setAttribute('aria-expanded', 'true');
        }
      }

      closePopup() {
        this.listbox.hidden = true;
        this.input.setAttribute('aria-expanded', 'false');
        this.input.setAttribute('aria-activedescendant', '');
        this.highlightedIndex = -1;
      }

      isOpen() {
        return !this.listbox.hidden;
      }
    }

    // Initialize
    new Combobox(document.getElementById('city-combobox'));
  </script>
</body>
</html>
```

## Security Note

When rendering dynamic content in combobox options:
- Use `textContent` for plain text (XSS-safe)
- If HTML is needed, sanitize with DOMPurify
- Never use `innerHTML` with untrusted data

```javascript
// Safe: textContent for plain text
option.textContent = userInput;

// If HTML needed, sanitize first
// import DOMPurify from 'dompurify';
// option.innerHTML = DOMPurify.sanitize(htmlContent);
```

## Autocomplete Types

### aria-autocomplete="list"
Suggestions shown in popup; input value unchanged until selection.

### aria-autocomplete="inline"
Text completion in input field itself.

### aria-autocomplete="both"
Both popup suggestions and inline completion.

### aria-autocomplete="none"
No autocomplete (input still filters, but no automatic completion).

## With Groups

```html
<ul role="listbox">
  <li role="group" aria-labelledby="group-1">
    <span id="group-1" role="presentation">Japan</span>
    <ul>
      <li role="option" id="opt-1">Tokyo</li>
      <li role="option" id="opt-2">Osaka</li>
    </ul>
  </li>
  <li role="group" aria-labelledby="group-2">
    <span id="group-2" role="presentation">Korea</span>
    <ul>
      <li role="option" id="opt-3">Seoul</li>
      <li role="option" id="opt-4">Busan</li>
    </ul>
  </li>
</ul>
```

## Testing Checklist

```
Required:
- [ ] role="combobox" on input
- [ ] aria-expanded reflects popup state
- [ ] aria-controls links to listbox
- [ ] aria-activedescendant updates on highlight
- [ ] role="listbox" on popup
- [ ] role="option" on each option
- [ ] Options have unique IDs

Keyboard:
- [ ] Arrow down opens popup
- [ ] Arrow up/down navigates options
- [ ] Enter selects option
- [ ] Escape closes popup
- [ ] Tab closes popup (optional: selects)
- [ ] Typing filters options

Screen reader:
- [ ] Results count announced
- [ ] Current option announced
- [ ] Selection announced
```

## Common Mistakes

1. **Missing aria-activedescendant** - Current option not announced
2. **Not managing focus** - Focus leaves input
3. **No keyboard navigation** - Mouse only
4. **Missing live region** - Results not announced
5. **Options not unique IDs** - aria-activedescendant breaks
6. **autocomplete="off" missing** - Browser autocomplete interferes
7. **Using innerHTML unsafely** - XSS vulnerability with user input
