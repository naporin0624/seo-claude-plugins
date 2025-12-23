# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Claude Code plugin** that provides SEO and WCAG 2.1 AA accessibility analysis skills. The plugin teaches Claude how to analyze HTML/JSX/TSX files for accessibility and SEO issues.

## Architecture

```
seo-claude-plugins/
├── plugin.json                    # Plugin manifest (declares 2 skills)
├── skills/
│   ├── seo-a11y-analyzer/        # Core analysis skill
│   │   ├── SKILL.md              # Main skill definition
│   │   ├── reference/*.md        # Progressive disclosure docs
│   │   └── scripts/              # axe-core CLI wrapper
│   └── wcag-aria-lookup/         # WCAG & ARIA lookup skill
│       ├── SKILL.md              # Lookup workflow definition
│       ├── wcag-index.json       # WCAG 2.1 AA criteria index (50 criteria)
│       └── aria-index.json       # ARIA roles, attributes, patterns index
└── test/fixtures/                 # Test HTML files with intentional issues
```

### Plugin Structure

- **plugin.json**: Manifest file declaring plugin name, version, and skills array
- **SKILL.md**: Skill definitions with YAML frontmatter (`name`, `description`) and markdown body
- Skills use **progressive disclosure**: main SKILL.md provides overview, JSON indexes for efficient lookup

### The Two Skills

1. **seo-a11y-analyzer**: Workflow-based analysis skill with 5-step process (read → quick checks → detailed checks → axe-core validation → report)
2. **wcag-aria-lookup**: Lookup-based skill returning official W3C URLs and summaries for WCAG criteria and ARIA patterns (uses JSON indexes for efficient keyword search)

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

### Test Fixtures

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

### Validation Loop

For complex fixes: Apply fix → Re-run axe-core → Confirm resolution → Only proceed when validation passes

## WCAG Quick Reference

- **Normal text contrast**: 4.5:1 minimum
- **Large text (18pt/14pt bold+)**: 3:1 minimum
- **Focus on Level AA**: Most commonly required standard (US Section 508, EU EN 301 549, Japan JIS X 8341-3)
