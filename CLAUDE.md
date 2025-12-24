# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Claude Code plugin marketplace (web-audit-tools v3.2.0) providing comprehensive web audit tools:
- **SEO Analysis**: Meta tags, Open Graph, Twitter Cards, structured data, Lighthouse integration
- **WCAG 2.1 AA Accessibility**: Color contrast, ARIA patterns, automated linting with axe-core + markuplint
- **Security Testing**: Bounty hunter agents for XSS, SQLi, CSRF, IDOR with OWASP Top 10 coverage and CVE search

## Architecture

```
.claude-plugin/
├── marketplace.json           # Marketplace manifest
└── plugin.json                # Plugin manifest (defines all skills/commands/agents)

skills/
├── seo-a11y-analyzer/        # Core 5-step analysis workflow
├── wcag-aria-lookup/         # WCAG 2.1 AA + ARIA pattern reference (JSON indexes)
├── html-lint-runner/         # axe-core + markuplint CLI wrapper
├── a11y-self-check/          # Proactive self-validation for Claude Code
├── seo-lookup/               # SEO best practices reference (JSON indexes)
├── seo-analyzer/             # Static SEO analysis with cheerio
├── lighthouse-runner/        # Lighthouse via Puppeteer
├── web-resource-checker/     # sitemap.xml, robots.txt, llms.txt, security.txt validation
├── attack-methods-lookup/    # OWASP Top 10 + CWE reference (JSON indexes)
├── cve-search/               # NVD API integration
├── form-security-analyzer/   # Static form security analysis
└── playwright-security-runner/ # Dynamic security testing

commands/
├── a11y-audit.md             # /a11y-audit - accessibility audit
├── seo-audit.md              # /seo-audit - SEO audit (static + Lighthouse)
├── web-audit.md              # /web-audit - combined web audit
└── website-hunter.md         # /website-hunter - parallel bounty hunter deployment

agents/
├── a11y-fixer.md             # Accessibility fixes (read-only, suggests but doesn't modify)
├── xss-hunter.md             # XSS vulnerability hunting
├── sqli-hunter.md            # SQL injection hunting
├── csrf-hunter.md            # CSRF vulnerability hunting
└── idor-hunter.md            # IDOR/authorization bypass hunting
```

## Plugin Installation & Validation

```bash
# Add marketplace (from GitHub)
/plugin marketplace add naporin0624/seo-claude-plugins

# Install plugin
/plugin install web-audit-tools@web-audit-marketplace

# Validate plugin structure
claude plugin validate .
```

## Skill Dependencies

Skills with node_modules require dependency installation:

```bash
cd skills/seo-analyzer && npm install        # cheerio
cd skills/lighthouse-runner && npm install   # puppeteer, lighthouse
cd skills/web-resource-checker && npm install # xml2js
cd skills/cve-search && npm install
cd skills/form-security-analyzer && npm install
cd skills/playwright-security-runner && npm install
```

## Development Commands

### Run Lint Tools

```bash
# Combined axe-core + markuplint (JSON output)
bash skills/html-lint-runner/scripts/lint-html.sh path/to/file.html

# axe-core only
npx @axe-core/cli file.html --tags wcag21aa
```

### SEO Analysis

```bash
bash skills/seo-analyzer/scripts/run-seo-analyzer.sh path/to/file.html
bash skills/seo-analyzer/scripts/run-seo-analyzer.sh path/to/file.html --json
```

### Lighthouse

```bash
bash skills/lighthouse-runner/scripts/run-lighthouse.sh https://example.com
bash skills/lighthouse-runner/scripts/run-lighthouse.sh path/to/file.html  # auto-starts server
```

### Web Resource Validation

```bash
bash skills/web-resource-checker/scripts/run-resource-check.sh https://example.com
bash skills/web-resource-checker/scripts/run-resource-check.sh ./public --only=sitemap,robots
```

### Query JSON Indexes

```bash
# WCAG criteria
cat skills/wcag-aria-lookup/wcag-index.json | jq '.criteria["1.4.3"]'

# ARIA patterns
cat skills/wcag-aria-lookup/aria-index.json | jq '.patterns.tabs'

# SEO/OG tags
cat skills/seo-lookup/seo-index.json | jq '.["og-tags"]["og:image"]'

# OWASP categories
cat skills/attack-methods-lookup/owasp-index.json | jq '.categories["A03"]'
```

## Key Patterns

### Skill YAML Frontmatter

```yaml
---
name: skill-name
description: Third-person description with trigger words. Use when user mentions "keyword1", "keyword2".
---
```

### Agent Behavior

- **a11y-fixer**: Read-only - suggests fixes with code examples but does NOT modify files
- **Hunter agents** (xss/sqli/csrf/idor):
  - Static analysis first (no requests until confirmed)
  - Production URL warning on non-localhost targets
  - Confirmation gates before dynamic testing

### Report Output Format

```markdown
# [Report Type]: [filename]

## Summary
- Critical: [count]
- Serious: [count]
- Warnings: [count]

## Critical Issues (P0)
### 1. [Issue Title] - [WCAG X.X.X or OWASP AXX]
**Problem**: [description]
**Location**: Line [number]
**Fix**: [code example]
```

### Validation Loop

Apply fix → Re-run axe-core → Confirm resolution → Only proceed when validation passes

## WCAG Quick Reference

- Normal text: 4.5:1 contrast minimum
- Large text (18pt/14pt bold+): 3:1 minimum
- UI components: 3:1 minimum
- Target: Level AA (Section 508, EU EN 301 549, JIS X 8341-3)

## Security Testing Safety

1. Static analysis first - no requests until confirmed
2. Production URL warning - alert on non-localhost targets
3. Payload preview - see exactly what will be sent
4. Confirmation gates - explicit approval before dynamic testing
5. Audit logging - all actions recorded

## Test Fixtures

Located in `test/fixtures/` - HTML files with intentional issues:
- `missing-meta.html` - Missing title, meta description
- `low-contrast.html` - Color contrast failures
- `missing-alt.html` - Images without alt text
- `aria-errors.html` - ARIA implementation errors
