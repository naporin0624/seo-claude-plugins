# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Claude Code plugin** that provides SEO and WCAG 2.1 AA accessibility analysis skills. The plugin teaches Claude how to analyze HTML/JSX/TSX files for accessibility and SEO issues.

## Architecture

```
seo-claude-plugins/
├── plugin.json                    # Plugin manifest (v2.0.0, declares 2 skills)
├── skills/
│   ├── seo-a11y-analyzer/        # Core analysis skill
│   │   ├── SKILL.md              # 5-step analysis workflow
│   │   ├── reference/            # Progressive disclosure docs
│   │   │   ├── color-contrast.md # Common color combinations
│   │   │   ├── seo-checks.md     # 30-item SEO checklist
│   │   │   ├── wcag-quick-ref.md # WCAG criteria reference
│   │   │   └── examples.md       # Audit examples
│   │   └── scripts/
│   │       └── validate-with-axe.sh  # axe-core CLI wrapper
│   └── wcag-aria-lookup/         # Lookup-based reference skill
│       ├── SKILL.md              # Lookup workflow definition
│       ├── wcag-index.json       # WCAG 2.1 Level A+AA (50 criteria)
│       └── aria-index.json       # ARIA roles/attributes/patterns
├── test/fixtures/                # Test HTML files with intentional issues
└── plans/                        # Development planning docs
```

## The Two Skills

### 1. seo-a11y-analyzer
Workflow-based analysis skill with 5-step process:
1. Read target file
2. Run quick checks (P0 critical issues)
3. Run detailed checks (all issues)
4. Validate with axe-core CLI
5. Generate report with fixes

**Triggers**: "a11y", "contrast", "alt text", "meta tags", "heading structure", "accessibility audit"

### 2. wcag-aria-lookup
Lookup-based reference skill that searches JSON indexes and returns:
- Official W3C URLs
- Concise summaries
- Key requirements

**Triggers**: "WCAG", "1.4.3", "aria-expanded", "role=dialog", "accessible tabs"

**Index coverage**:
- WCAG criteria: 50 (Level A + AA)
- ARIA roles: 24
- ARIA attributes: 28
- ARIA patterns: 12

## Development Commands

### Validate with axe-core

```bash
# Single file
./skills/seo-a11y-analyzer/scripts/validate-with-axe.sh path/to/file.html

# Or directly with npx
npx @axe-core/cli file.html --tags wcag21aa

# Test all fixtures
for f in test/fixtures/*.html; do
  ./skills/seo-a11y-analyzer/scripts/validate-with-axe.sh "$f"
done
```

### Test Lookup Skill

```bash
# Search WCAG by ID
cat skills/wcag-aria-lookup/wcag-index.json | jq '.criteria["1.4.3"]'

# Search WCAG by keyword
cat skills/wcag-aria-lookup/wcag-index.json | jq '[.criteria | to_entries[] | select(.value.keywords | contains(["contrast"]))]'

# Search ARIA role
cat skills/wcag-aria-lookup/aria-index.json | jq '.roles.dialog'

# Search ARIA pattern
cat skills/wcag-aria-lookup/aria-index.json | jq '.patterns.tabs'
```

## Test Fixtures

Located in `test/fixtures/` - HTML files with intentional accessibility/SEO issues:
- `missing-meta.html` - Missing title, meta description, multiple H1s
- `low-contrast.html` - Color contrast failures
- `missing-alt.html` - Images without alt text
- `aria-errors.html` - ARIA implementation errors

## Key Patterns

### Skill Description Format

Descriptions should be third-person and include trigger words:
```yaml
description: Analyzes HTML/JSX files for SEO and WCAG 2.1 AA compliance. Use when user mentions "a11y", "contrast", "alt text", or "meta tags".
```

### Report Output Format

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

### Lookup Response Format

```markdown
### [Criterion/Pattern Name]

**Summary**: [1-2 sentence explanation]

**Key Requirements**:
- [Requirement 1]
- [Requirement 2]

**Official Reference**: [W3C URL]
```

### Validation Loop

For complex fixes: Apply fix → Re-run axe-core → Confirm resolution → Only proceed when validation passes

## WCAG Quick Reference

- **Normal text contrast**: 4.5:1 minimum
- **Large text (18pt/14pt bold+)**: 3:1 minimum
- **UI components**: 3:1 minimum
- **Focus on Level AA**: Most commonly required standard (US Section 508, EU EN 301 549, Japan JIS X 8341-3)

## JSON Index Structure

### wcag-index.json
```json
{
  "criteria": {
    "1.4.3": {
      "name": "Contrast (Minimum)",
      "level": "AA",
      "summary": "...",
      "keywords": ["contrast", "コントラスト", ...],
      "requirements": [...],
      "url": "https://www.w3.org/WAI/WCAG21/Understanding/...",
      "quickref": "https://www.w3.org/WAI/WCAG21/quickref/#..."
    }
  }
}
```

### aria-index.json
```json
{
  "roles": { ... },
  "attributes": { ... },
  "patterns": { ... }
}
```
