# SEO & Accessibility Tools for Claude Code

A Claude Code plugin providing SEO and WCAG 2.1 AA accessibility analysis skills.

## Features

- **SEO Analysis**: Meta tags, headings, Open Graph, structured data
- **Accessibility Checks**: WCAG 2.1 AA compliance, color contrast, ARIA
- **Automated Validation**: Integration with axe-core CLI
- **Fix Suggestions**: Specific code fixes for each issue

## Installation

### Prerequisites

- [Claude Code](https://claude.com/claude-code) v1.0+
- Node.js v14+ (for axe-core validation)

### Install axe-core CLI

```bash
npm install -g @axe-core/cli
# or use npx (no global install needed)
```

### Install Plugin

```bash
# Clone the repository
git clone https://github.com/naporin0624/seo-claude-plugins.git

# Or add as a Claude Code plugin
claude plugins add seo-a11y-tools
```

## Skills

### 1. seo-a11y-analyzer

Analyzes HTML/JSX/TSX files for SEO and accessibility issues.

**Triggers**: "check accessibility", "SEO audit", "a11y", "contrast", "alt text", "meta tags"

**Example**:
```
Check this index.html for SEO and accessibility issues
```

### 2. wcag-21-aa-reference

Provides WCAG 2.1 Level AA compliance guidance.

**Triggers**: "WCAG requirements", "accessibility standards", "1.4.3 contrast"

**Example**:
```
Explain WCAG 1.4.3 contrast requirements
```

### 3. wai-aria-patterns

Provides WAI-ARIA implementation patterns for accessible widgets.

**Triggers**: "aria-", "role=", "accessible dialog", "accessible tabs"

**Example**:
```
How do I implement an accessible modal dialog?
```

## Usage

### Basic Analysis

Ask Claude to analyze a file:

```
Analyze test/fixtures/missing-meta.html for accessibility issues
```

Claude will:
1. Read the file
2. Run quick checks (P0 critical issues)
3. Run detailed checks
4. Validate with axe-core (if available)
5. Generate a report with fixes

### Manual Validation

Use the provided script:

```bash
./skills/seo-a11y-analyzer/scripts/validate-with-axe.sh path/to/file.html
```

Or run axe-core directly:

```bash
npx @axe-core/cli file.html --tags wcag21aa
```

## Project Structure

```
seo-claude-plugins/
├── plugin.json                          # Plugin manifest
├── skills/
│   ├── seo-a11y-analyzer/              # Analysis skill
│   │   ├── SKILL.md
│   │   ├── reference/
│   │   │   ├── color-contrast.md
│   │   │   ├── seo-checks.md
│   │   │   ├── wcag-quick-ref.md
│   │   │   └── examples.md
│   │   └── scripts/
│   │       └── validate-with-axe.sh
│   │
│   ├── wcag-21-aa-reference/           # WCAG knowledge base
│   │   ├── SKILL.md
│   │   └── criteria/
│   │       ├── perceivable.md
│   │       ├── operable.md
│   │       ├── understandable.md
│   │       └── robust.md
│   │
│   └── wai-aria-patterns/              # ARIA patterns
│       ├── SKILL.md
│       ├── attributes/
│       │   ├── widget-attrs.md
│       │   ├── live-region.md
│       │   └── relationships.md
│       └── patterns/
│           ├── dialog-modal.md
│           ├── tabs.md
│           ├── accordion.md
│           └── combobox.md
│
└── test/
    └── fixtures/                        # Test HTML files
        ├── missing-meta.html
        ├── low-contrast.html
        ├── missing-alt.html
        └── aria-errors.html
```

## Report Format

Analysis reports follow this structure:

```markdown
# Accessibility & SEO Report: [filename]

## Summary
- Critical: [count]
- Serious: [count]
- Warnings: [count]

## Critical Issues (P0)

### 1. [Issue Title] - [WCAG X.X.X or SEO]

**Problem**: [description]
**Location**: Line [number]
**Fix**: [code example]
```

## Testing

### Test Fixtures

The `test/fixtures/` directory contains HTML files with intentional issues:

| File | Issues |
|------|--------|
| `missing-meta.html` | Missing title, meta description, multiple H1s |
| `low-contrast.html` | Color contrast failures |
| `missing-alt.html` | Images without alt text |
| `aria-errors.html` | ARIA implementation errors |

### Run Tests

```bash
# Test all fixtures
for f in test/fixtures/*.html; do
  ./skills/seo-a11y-analyzer/scripts/validate-with-axe.sh "$f"
done
```

## References

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## License

MIT

## Author

Naporitan
