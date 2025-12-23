---
name: html-lint-runner
description: Runs automated HTML linting using axe-core (WCAG accessibility) and markuplint (HTML standards) CLI tools. Use when user asks to "lint HTML", "run automated checks", "validate HTML", "check accessibility with CLI", or mentions "axe-core", "markuplint", "automated audit".
---

# HTML Lint Runner

Automated HTML linting using axe-core and markuplint CLI tools with JSON output.

## Tools Overview

| Tool | Focus | Output |
|------|-------|--------|
| **axe-core** | WCAG 2.1 AA accessibility | JSON with violations |
| **markuplint** | HTML standards, semantics | JSON with problems |

## Quick Start

Run the combined lint script:

```bash
bash scripts/lint-html.sh path/to/file.html
```

Or run tools separately:

```bash
# axe-core only (accessibility)
bash scripts/run-axe.sh path/to/file.html

# markuplint only (HTML standards)
bash scripts/run-markuplint.sh path/to/file.html
```

## Prerequisites

Tools are installed automatically via npx, but for better performance:

```bash
# Basic installation
npm install -g @axe-core/cli markuplint

# For JSX/TSX support (React projects)
npm install -D @markuplint/jsx-parser @markuplint/react-spec
```

## Supported File Types

| Extension | Parser | Notes |
|-----------|--------|-------|
| `.html` | Built-in | No additional setup |
| `.jsx` | @markuplint/jsx-parser | Requires react-spec |
| `.tsx` | @markuplint/jsx-parser | Requires react-spec |
| `.vue` | @markuplint/vue-parser | Requires vue-spec |

## Workflow

Copy this checklist:

```
Lint Progress:
- [ ] Step 1: Run combined lint script
- [ ] Step 2: Parse JSON results
- [ ] Step 3: Prioritize issues (critical → serious → moderate)
- [ ] Step 4: Apply fixes
- [ ] Step 5: Re-run to verify
```

## Step 1: Run Combined Lint

```bash
bash scripts/lint-html.sh target.html
```

Output structure:

```json
{
  "file": "target.html",
  "timestamp": "2025-01-01T00:00:00Z",
  "axe": {
    "violations": [...],
    "passes": [...],
    "incomplete": [...]
  },
  "markuplint": {
    "problems": [...],
    "passed": [...]
  },
  "summary": {
    "axe_violations": 3,
    "markuplint_problems": 5,
    "total_issues": 8
  }
}
```

## Step 2: Parse Results

### axe-core Violations

```json
{
  "id": "color-contrast",
  "impact": "serious",
  "description": "Elements must have sufficient color contrast",
  "nodes": [
    {
      "html": "<p class=\"light\">...</p>",
      "failureSummary": "Fix: Increase contrast ratio to 4.5:1"
    }
  ]
}
```

Impact levels: `critical` > `serious` > `moderate` > `minor`

### markuplint Problems

```json
{
  "severity": "error",
  "ruleId": "required-attr",
  "message": "The \"alt\" attribute is required",
  "line": 15,
  "col": 5,
  "raw": "<img src=\"photo.jpg\">"
}
```

Severity levels: `error` > `warning`

## Step 3: Prioritize Issues

1. **Critical** (axe): Must fix immediately
2. **Serious** (axe): Should fix for compliance
3. **Error** (markuplint): HTML standard violations
4. **Moderate/Warning**: Best practice improvements

## Step 4: Apply Fixes

Common fix patterns:

### Missing alt text
```html
<!-- Before -->
<img src="photo.jpg">

<!-- After -->
<img src="photo.jpg" alt="Description of image">
```

### Low contrast
```css
/* Before: #999 on #fff = 2.85:1 */
.text { color: #999; }

/* After: #595959 on #fff = 7:1 */
.text { color: #595959; }
```

### Invalid attribute
```html
<!-- Before -->
<div role="hamburger">

<!-- After -->
<button aria-label="Menu" aria-expanded="false">
```

## Step 5: Re-run to Verify

```bash
bash scripts/lint-html.sh target.html
```

Goal: `total_issues: 0` or only minor warnings.

## CLI Options

### axe-core

```bash
# Specific WCAG tags
npx @axe-core/cli file.html --tags wcag21aa

# With rules
npx @axe-core/cli file.html --rules color-contrast,image-alt

# Disable rules
npx @axe-core/cli file.html --disable frame-title
```

### markuplint

```bash
# With config
npx markuplint file.html --config .markuplintrc

# Problem only (no passes)
npx markuplint file.html --problem-only

# JSON format
npx markuplint file.html --format JSON
```

## Configuration Files

### .markuplintrc (recommended)

Use [configs/markuplintrc.json](configs/markuplintrc.json) as a starting point:

```json
{
  "parser": {
    "\\.[jt]sx$": "@markuplint/jsx-parser"
  },
  "specs": {
    "\\.[jt]sx$": "@markuplint/react-spec"
  },
  "rules": {
    "required-attr": true,
    "deprecated-element": true,
    "character-reference": true,
    "no-refer-to-non-existent-id": true,
    "class-naming": false,
    "attr-duplication": true,
    "id-duplication": true
  }
}
```

Copy to your project root:
```bash
cp configs/markuplintrc.json .markuplintrc
```

### axe config (optional)

```json
{
  "rules": {
    "color-contrast": { "enabled": true },
    "image-alt": { "enabled": true }
  }
}
```

## Error Handling

If a tool fails:

1. Check if file exists and is valid HTML
2. Try running the tool directly to see full error
3. Check npm/node version compatibility

```bash
# Debug axe-core
npx @axe-core/cli file.html --verbose

# Debug markuplint
npx markuplint file.html --verbose
```

## References

- [axe-core CLI](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/cli)
- [markuplint CLI](https://markuplint.dev/docs/guides/cli)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

Sources:
- [markuplint - npm](https://www.npmjs.com/package/markuplint)
- [markuplint CLI Documentation](https://markuplint.dev/docs/guides/cli)
