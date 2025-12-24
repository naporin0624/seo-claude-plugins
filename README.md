# Web Audit Tools for Claude Code

A comprehensive Claude Code plugin providing SEO, WCAG 2.1 AA accessibility, and security testing tools with specialized bounty hunter agents.

## Features

### SEO Analysis
- Meta tags, Open Graph, Twitter Cards validation
- Structured data (JSON-LD) validation
- Lighthouse integration for performance scores
- Web resource files (sitemap.xml, robots.txt, llms.txt, security.txt)

### Accessibility Checks
- WCAG 2.1 AA compliance
- Color contrast validation (4.5:1 normal, 3:1 large text)
- ARIA patterns and roles reference
- Automated linting with axe-core + markuplint

### Security Testing (Bounty Hunter Mode)
- **XSS Hunter**: Script injection, DOM manipulation ($500 - $50,000)
- **SQLi Hunter**: Database attacks, auth bypass ($2,000 - $50,000+)
- **CSRF Hunter**: Request forgery, action hijacking ($500 - $20,000)
- **IDOR Hunter**: Object reference, authorization bypass ($2,000 - $50,000+)
- OWASP Top 10 coverage
- CVE search via NVD API

## Installation

### Prerequisites

- [Claude Code](https://claude.ai/code) v1.0+
- Node.js v18+ (for scripts)

### Install from Marketplace

```bash
# Add the marketplace
/plugin marketplace add naporin0624/seo-claude-plugins

# Install the plugin
/plugin install web-audit-tools@web-audit-marketplace
```

### Install Dependencies (for scripts)

```bash
cd skills/seo-analyzer && npm install
cd skills/lighthouse-runner && npm install
cd skills/web-resource-checker && npm install
cd skills/cve-search && npm install
cd skills/form-security-analyzer && npm install
cd skills/playwright-security-runner && npm install
```

## Commands

### /a11y-audit
Run accessibility audit on files.

```bash
/a11y-audit path/to/file.html
/a11y-audit "src/**/*.tsx"
```

### /seo-audit
Comprehensive SEO audit with Lighthouse.

```bash
/seo-audit path/to/file.html           # Full audit (static + lighthouse)
/seo-audit http://localhost:3000       # Lighthouse only
/seo-audit path/to/file.html static    # Static analysis only
```

### /web-audit
Combined SEO, accessibility, and web resource audit.

```bash
/web-audit path/to/file.html
/web-audit https://example.com
```

### /website-hunter
Deploy bounty hunter agents to attack a website from multiple angles.

```bash
# Deploy all hunters in parallel
/website-hunter http://localhost:3000

# Deploy specific hunters
/website-hunter http://localhost:3000 xss,sqli

# Just IDOR and CSRF
/website-hunter http://localhost:3000 idor,csrf
```

## Skills

| Skill | Description |
|-------|-------------|
| `seo-a11y-analyzer` | Core analysis with 5-step workflow |
| `wcag-aria-lookup` | WCAG 2.1 AA criteria and ARIA patterns lookup |
| `html-lint-runner` | Automated linting with axe-core + markuplint |
| `seo-lookup` | SEO best practices reference |
| `seo-analyzer` | Static SEO analysis with cheerio |
| `lighthouse-runner` | Lighthouse integration via Puppeteer |
| `web-resource-checker` | sitemap.xml, robots.txt, llms.txt, security.txt validation |
| `attack-methods-lookup` | OWASP Top 10 attack methods reference |
| `cve-search` | NVD API integration for CVE search |
| `form-security-analyzer` | Static security analysis for forms |
| `playwright-security-runner` | Dynamic security testing with Playwright |

## Agents

| Agent | Specialty | Bounty Range |
|-------|-----------|--------------|
| `a11y-fixer` | Accessibility fixes (read-only) | - |
| `xss-hunter` | XSS vulnerabilities | $500 - $50,000 |
| `sqli-hunter` | SQL injection | $2,000 - $50,000+ |
| `csrf-hunter` | CSRF attacks | $500 - $20,000 |
| `idor-hunter` | IDOR / Authorization bypass | $2,000 - $50,000+ |

## Security Testing Safety

The security testing tools include multiple safety features:

1. **Static analysis first** - No requests sent until confirmed
2. **Production URL warning** - Alert on non-localhost targets
3. **Payload preview** - See exactly what will be sent
4. **Confirmation gates** - Explicit approval before dynamic testing
5. **Audit logging** - All actions recorded

## References

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [OWASP Top 10](https://owasp.org/Top10/)
- [NVD - National Vulnerability Database](https://nvd.nist.gov/)
- [llmstxt.org](https://llmstxt.org/)
- [securitytxt.org](https://securitytxt.org/)

## License

MIT

## Author

Naporitan (naporin0624)
