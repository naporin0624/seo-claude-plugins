# Tabs Pattern

Complete implementation guide for accessible tab interfaces.

## Basic Structure

```html
<div class="tabs">
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
      Specifications
    </button>
    <button role="tab"
            id="tab-3"
            aria-selected="false"
            aria-controls="panel-3"
            tabindex="-1">
      Reviews
    </button>
  </div>

  <div role="tabpanel"
       id="panel-1"
       aria-labelledby="tab-1"
       tabindex="0">
    Product description content...
  </div>

  <div role="tabpanel"
       id="panel-2"
       aria-labelledby="tab-2"
       tabindex="0"
       hidden>
    Specifications content...
  </div>

  <div role="tabpanel"
       id="panel-3"
       aria-labelledby="tab-3"
       tabindex="0"
       hidden>
    Reviews content...
  </div>
</div>
```

## Required Attributes

### Tablist
| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `tablist` | Container for tabs |
| `aria-label` | String | Describes tab group purpose |

### Tab
| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `tab` | Identifies as tab |
| `aria-selected` | `true`/`false` | Selection state |
| `aria-controls` | ID | Links to panel |
| `tabindex` | `0`/`-1` | Focus management |

### Tab Panel
| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `tabpanel` | Identifies as panel |
| `aria-labelledby` | ID | Links to tab |
| `tabindex` | `0` | Makes panel focusable |

## Keyboard Interaction

| Key | Action |
|-----|--------|
| Tab | Focus tablist, then into panel |
| Arrow Right/Down | Next tab |
| Arrow Left/Up | Previous tab |
| Home | First tab |
| End | Last tab |
| Space/Enter | Activate focused tab (manual activation) |

## Activation Modes

### Automatic Activation (Recommended)
Tab activates immediately on arrow key navigation.

```javascript
function handleKeydown(e, tabs, panels) {
  const currentIndex = tabs.indexOf(document.activeElement);

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault();
      activateTab(tabs, panels, (currentIndex + 1) % tabs.length);
      break;

    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      activateTab(tabs, panels, (currentIndex - 1 + tabs.length) % tabs.length);
      break;

    case 'Home':
      e.preventDefault();
      activateTab(tabs, panels, 0);
      break;

    case 'End':
      e.preventDefault();
      activateTab(tabs, panels, tabs.length - 1);
      break;
  }
}
```

### Manual Activation
Arrow keys move focus; Space/Enter activates.

```javascript
function handleKeydown(e, tabs, panels) {
  const currentIndex = tabs.indexOf(document.activeElement);

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault();
      focusTab(tabs, (currentIndex + 1) % tabs.length);
      break;

    case ' ':
    case 'Enter':
      e.preventDefault();
      activateTab(tabs, panels, currentIndex);
      break;
  }
}
```

## Complete Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    .tabs {
      width: 100%;
      max-width: 600px;
    }

    [role="tablist"] {
      display: flex;
      border-bottom: 2px solid #e0e0e0;
      gap: 4px;
    }

    [role="tab"] {
      padding: 12px 24px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
    }

    [role="tab"]:hover {
      background: #f5f5f5;
    }

    [role="tab"][aria-selected="true"] {
      border-bottom-color: #0066cc;
      font-weight: bold;
    }

    [role="tab"]:focus {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }

    [role="tabpanel"] {
      padding: 24px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }

    [role="tabpanel"]:focus {
      outline: 2px solid #0066cc;
      outline-offset: -2px;
    }

    [role="tabpanel"][hidden] {
      display: none;
    }
  </style>
</head>
<body>
  <div class="tabs" id="tabs-container">
    <div role="tablist" aria-label="Settings sections">
      <button role="tab"
              id="tab-general"
              aria-selected="true"
              aria-controls="panel-general">
        General
      </button>
      <button role="tab"
              id="tab-security"
              aria-selected="false"
              aria-controls="panel-security"
              tabindex="-1">
        Security
      </button>
      <button role="tab"
              id="tab-notifications"
              aria-selected="false"
              aria-controls="panel-notifications"
              tabindex="-1">
        Notifications
      </button>
    </div>

    <div role="tabpanel"
         id="panel-general"
         aria-labelledby="tab-general"
         tabindex="0">
      <h3>General Settings</h3>
      <p>Configure your general account preferences.</p>
      <label>
        <input type="checkbox"> Enable dark mode
      </label>
    </div>

    <div role="tabpanel"
         id="panel-security"
         aria-labelledby="tab-security"
         tabindex="0"
         hidden>
      <h3>Security Settings</h3>
      <p>Manage your security options.</p>
      <button>Change Password</button>
    </div>

    <div role="tabpanel"
         id="panel-notifications"
         aria-labelledby="tab-notifications"
         tabindex="0"
         hidden>
      <h3>Notification Settings</h3>
      <p>Choose your notification preferences.</p>
      <label>
        <input type="checkbox" checked> Email notifications
      </label>
    </div>
  </div>

  <script>
    class TabsComponent {
      constructor(container) {
        this.tablist = container.querySelector('[role="tablist"]');
        this.tabs = Array.from(container.querySelectorAll('[role="tab"]'));
        this.panels = Array.from(container.querySelectorAll('[role="tabpanel"]'));

        this.init();
      }

      init() {
        // Click handler
        this.tabs.forEach((tab, index) => {
          tab.addEventListener('click', () => this.activateTab(index));
        });

        // Keyboard handler
        this.tablist.addEventListener('keydown', (e) => this.handleKeydown(e));
      }

      handleKeydown(e) {
        const currentIndex = this.tabs.indexOf(document.activeElement);
        let newIndex;

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            newIndex = (currentIndex + 1) % this.tabs.length;
            this.activateTab(newIndex);
            break;

          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            newIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
            this.activateTab(newIndex);
            break;

          case 'Home':
            e.preventDefault();
            this.activateTab(0);
            break;

          case 'End':
            e.preventDefault();
            this.activateTab(this.tabs.length - 1);
            break;
        }
      }

      activateTab(index) {
        // Deactivate all tabs
        this.tabs.forEach((tab, i) => {
          tab.setAttribute('aria-selected', 'false');
          tab.setAttribute('tabindex', '-1');
          this.panels[i].hidden = true;
        });

        // Activate selected tab
        this.tabs[index].setAttribute('aria-selected', 'true');
        this.tabs[index].setAttribute('tabindex', '0');
        this.tabs[index].focus();
        this.panels[index].hidden = false;
      }
    }

    // Initialize
    new TabsComponent(document.getElementById('tabs-container'));
  </script>
</body>
</html>
```

## Vertical Tabs

For vertical layout, use `aria-orientation`:

```html
<div role="tablist"
     aria-label="Navigation"
     aria-orientation="vertical">
  <button role="tab" ...>Dashboard</button>
  <button role="tab" ...>Settings</button>
  <button role="tab" ...>Profile</button>
</div>
```

**Keyboard changes for vertical**:
- Arrow Up/Down navigate (instead of Left/Right)
- Arrow Left/Right may be ignored or enter content

## Deletable Tabs

For closeable tabs:

```html
<button role="tab"
        aria-selected="true"
        aria-controls="panel-1">
  Document 1
  <span aria-label="Close Document 1"
        role="button"
        tabindex="-1"
        onclick="closeTab(0)">×</span>
</button>
```

**Additional keyboard**: Delete key closes focused tab.

## Testing Checklist

```
Required:
- [ ] role="tablist" on container
- [ ] role="tab" on each tab
- [ ] role="tabpanel" on each panel
- [ ] aria-selected on active tab
- [ ] aria-controls links tab to panel
- [ ] aria-labelledby links panel to tab
- [ ] Only active tab has tabindex="0"
- [ ] Inactive panels are hidden

Keyboard:
- [ ] Tab moves to tablist, then to panel
- [ ] Arrow keys navigate between tabs
- [ ] Home goes to first tab
- [ ] End goes to last tab
- [ ] Tab activation updates panel

Screen reader:
- [ ] Tab count announced ("tab 1 of 3")
- [ ] Selected state announced
- [ ] Panel content readable
```

## Common Mistakes

1. **Missing tabindex management** - All tabs focusable
2. **Panel not associated** - aria-labelledby missing
3. **No keyboard support** - Click only
4. **Hidden panels still in tab order** - Use `hidden` attribute
5. **Missing tablist label** - Context unclear
