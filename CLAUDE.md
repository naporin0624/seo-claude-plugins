# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Claude Code plugin marketplace** that provides SEO and WCAG 2.1 AA accessibility analysis tools for HTML/JSX/TSX files. The plugin includes automated linting, WCAG/ARIA reference lookup, and a command-driven audit workflow with subagent support.

## Architecture

```
seo-claude-plugins/
├── .claude-plugin/                # Marketplace and plugin configuration
│   ├── marketplace.json           # Marketplace manifest
│   └── plugin.json                # Plugin manifest (v2.3.0)
├── skills/
│   ├── seo-a11y-analyzer/        # Core analysis skill (5-step workflow)
│   ├── wcag-aria-lookup/         # Lookup-based WCAG/ARIA reference
│   │   ├── SKILL.md
│   │   ├── wcag-index.json       # 50 WCAG 2.1 Level A+AA criteria
│   │   └── aria-index.json       # 24 roles, 28 attributes, 12 patterns
│   ├── html-lint-runner/         # Automated linting with axe-core + markuplint
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   │   ├── lint-html.sh      # Combined lint (JSON output)
│   │   │   └── run-markuplint.sh # Standalone markuplint
│   │   └── configs/
│   │       └── markuplintrc.json # JSX/TSX parser config
│   └── a11y-self-check/          # Proactive self-validation for Claude Code
│       └── SKILL.md
├── commands/
│   └── a11y-audit.md             # /a11y-audit command (suggestion-only)
├── agents/
│   └── a11y-fixer.md             # Subagent for analysis (read-only)
├── test/fixtures/                # Test HTML files with intentional issues
└── plans/                        # Development planning docs
```

## The Four Skills

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

### 3. html-lint-runner
Automated linting using axe-core and markuplint CLI tools.

**Features**:
- Combined lint script outputs JSON with violations and problems
- JSX/TSX support via @markuplint/jsx-parser
- Graceful error handling when ChromeDriver unavailable

**Usage**:
```bash
bash ${CLAUDE_PLUGIN_ROOT}/skills/html-lint-runner/scripts/lint-html.sh <file>
```

### 4. a11y-self-check
Proactive self-validation skill for Claude Code to validate its own generated HTML/JSX/TSX output before presenting to users.

**When to use**:
- Generating new UI components
- Writing forms, modals, navigation
- Modifying existing templates

## Command & Agent

### /a11y-audit Command
Runs accessibility audit on specified files and provides fix **suggestions** (does NOT modify files).

```bash
/a11y-audit path/to/file.html
/a11y-audit "src/**/*.tsx"
```

### a11y-fixer Agent
Read-only subagent that:
- ✅ Runs lint tools
- ✅ Analyzes results
- ✅ Suggests fixes with code examples
- ❌ Does NOT modify files

## Installation

### Add Marketplace and Install Plugin

```bash
# Add the marketplace (from GitHub)
/plugin marketplace add naporin0624/seo-claude-plugins

# Install the plugin
/plugin install seo-a11y-tools@seo-a11y-marketplace

# Or add from local path (for development)
/plugin marketplace add ./path/to/seo-claude-plugins
```

### Validate Marketplace Structure

```bash
# Validate the plugin structure
claude plugin validate .
# Or from within Claude Code
/plugin validate .
```

## Development Commands

### Run Combined Lint (Recommended)

```bash
# Combined axe-core + markuplint (JSON output)
bash skills/html-lint-runner/scripts/lint-html.sh path/to/file.html

# For JSX/TSX files
bash skills/html-lint-runner/scripts/lint-html.sh path/to/Component.tsx
```

### Validate with axe-core Only

```bash
# Single file
./skills/seo-a11y-analyzer/scripts/validate-with-axe.sh path/to/file.html

# Or directly with npx
npx @axe-core/cli file.html --tags wcag21aa
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
