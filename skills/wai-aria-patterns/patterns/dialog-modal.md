# Modal Dialog Pattern

Complete implementation guide for accessible modal dialogs.

## Basic Structure

```html
<button id="open-dialog-btn" aria-haspopup="dialog">
  Open Settings
</button>

<div role="dialog"
     aria-modal="true"
     aria-labelledby="dialog-title"
     aria-describedby="dialog-desc"
     id="settings-dialog"
     hidden>

  <h2 id="dialog-title">Account Settings</h2>
  <p id="dialog-desc">Update your account preferences below.</p>

  <form>
    <label for="name">Display Name</label>
    <input type="text" id="name" value="John Doe">

    <label for="email">Email</label>
    <input type="email" id="email" value="john@example.com">
  </form>

  <div class="dialog-actions">
    <button type="button" onclick="closeDialog()">Cancel</button>
    <button type="submit" onclick="saveAndClose()">Save Changes</button>
  </div>

  <button class="close-btn"
          aria-label="Close dialog"
          onclick="closeDialog()">
    ×
  </button>
</div>
```

## Required Attributes

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `dialog` | Identifies as dialog |
| `aria-modal` | `true` | Indicates modal behavior |
| `aria-labelledby` | ID | References dialog title |
| `aria-describedby` | ID | References description (optional) |

## Keyboard Interaction

| Key | Action |
|-----|--------|
| Tab | Move focus within dialog |
| Shift+Tab | Move focus backward |
| Escape | Close dialog |
| Enter | Activate focused button |

## Focus Management

### 1. Focus on Open

```javascript
function openDialog() {
  // Store trigger for focus return
  previousFocus = document.activeElement;

  // Show dialog
  dialog.hidden = false;
  dialog.removeAttribute('hidden');

  // Move focus to first focusable element
  const firstFocusable = dialog.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  firstFocusable?.focus();
}
```

### 2. Trap Focus Inside

```javascript
function trapFocus(dialog) {
  const focusableElements = dialog.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift+Tab: If on first, go to last
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: If on last, go to first
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}
```

### 3. Return Focus on Close

```javascript
function closeDialog() {
  dialog.hidden = true;

  // Return focus to trigger
  previousFocus?.focus();
}
```

### 4. Escape Key Handler

```javascript
dialog.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDialog();
  }
});
```

## Background Inert

When modal is open, background content should be inert:

```javascript
function openDialog() {
  // Make background inert
  document.querySelector('main').setAttribute('inert', '');
  document.querySelector('header').setAttribute('inert', '');
  document.querySelector('footer').setAttribute('inert', '');

  // Or use a backdrop
  backdrop.hidden = false;
}

function closeDialog() {
  // Remove inert
  document.querySelector('main').removeAttribute('inert');
  document.querySelector('header').removeAttribute('inert');
  document.querySelector('footer').removeAttribute('inert');

  backdrop.hidden = true;
}
```

## Complete Example

### HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    .dialog-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dialog-backdrop[hidden] {
      display: none;
    }

    [role="dialog"] {
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      position: relative;
    }

    .dialog-close {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 4px 8px;
    }

    .dialog-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <main>
    <h1>Page Content</h1>
    <button id="open-btn" aria-haspopup="dialog">
      Open Settings
    </button>
  </main>

  <div class="dialog-backdrop" id="backdrop" hidden>
    <div role="dialog"
         aria-modal="true"
         aria-labelledby="dialog-title"
         id="dialog">

      <button class="dialog-close"
              aria-label="Close"
              id="close-btn">
        ×
      </button>

      <h2 id="dialog-title">Settings</h2>

      <form id="settings-form">
        <div>
          <label for="theme">Theme</label>
          <select id="theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div>
          <label for="notifications">
            <input type="checkbox" id="notifications">
            Enable notifications
          </label>
        </div>
      </form>

      <div class="dialog-actions">
        <button type="button" id="cancel-btn">Cancel</button>
        <button type="submit" form="settings-form">Save</button>
      </div>
    </div>
  </div>

  <script>
    const openBtn = document.getElementById('open-btn');
    const closeBtn = document.getElementById('close-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const backdrop = document.getElementById('backdrop');
    const dialog = document.getElementById('dialog');
    const main = document.querySelector('main');

    let previousFocus = null;

    function openDialog() {
      previousFocus = document.activeElement;
      backdrop.hidden = false;
      main.setAttribute('inert', '');

      // Focus first input
      dialog.querySelector('select, input, button')?.focus();

      // Add event listeners
      document.addEventListener('keydown', handleKeydown);
      backdrop.addEventListener('click', handleBackdropClick);
    }

    function closeDialog() {
      backdrop.hidden = true;
      main.removeAttribute('inert');

      // Return focus
      previousFocus?.focus();

      // Remove event listeners
      document.removeEventListener('keydown', handleKeydown);
      backdrop.removeEventListener('click', handleBackdropClick);
    }

    function handleKeydown(e) {
      if (e.key === 'Escape') {
        closeDialog();
        return;
      }

      if (e.key === 'Tab') {
        trapFocus(e);
      }
    }

    function trapFocus(e) {
      const focusable = dialog.querySelectorAll(
        'button, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    function handleBackdropClick(e) {
      if (e.target === backdrop) {
        closeDialog();
      }
    }

    openBtn.addEventListener('click', openDialog);
    closeBtn.addEventListener('click', closeDialog);
    cancelBtn.addEventListener('click', closeDialog);
  </script>
</body>
</html>
```

## Alert Dialog Variant

For confirmations requiring explicit user action:

```html
<div role="alertdialog"
     aria-modal="true"
     aria-labelledby="alert-title"
     aria-describedby="alert-desc">

  <h2 id="alert-title">Delete Item?</h2>
  <p id="alert-desc">
    This action cannot be undone. The item will be permanently deleted.
  </p>

  <div class="dialog-actions">
    <button onclick="closeDialog()">Cancel</button>
    <button onclick="confirmDelete()" class="danger">
      Delete
    </button>
  </div>
</div>
```

**Key difference**: `role="alertdialog"` instead of `role="dialog"`.

## Testing Checklist

```
Required:
- [ ] role="dialog" present
- [ ] aria-modal="true" set
- [ ] aria-labelledby references visible title
- [ ] Focus moves into dialog on open
- [ ] Focus trapped inside dialog
- [ ] Escape closes dialog
- [ ] Focus returns to trigger on close
- [ ] Background content is inert

Keyboard:
- [ ] Tab cycles through focusable elements
- [ ] Shift+Tab cycles backward
- [ ] Enter activates focused button
- [ ] Escape closes dialog

Screen reader:
- [ ] Dialog announced with title
- [ ] Content readable inside dialog
- [ ] Close action announced
```

## Common Mistakes

1. **Focus not moved on open** - User starts outside dialog
2. **Focus not trapped** - Tab escapes to background
3. **No Escape handler** - Standard dismissal not available
4. **Focus not returned** - User lost after close
5. **Background scrollable** - Content shifts behind modal
6. **Missing aria-modal** - Screen reader may read background
