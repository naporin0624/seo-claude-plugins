---
name: web-audit
description: Run comprehensive web resource file audit (sitemap.xml, robots.txt, llms.txt, security.txt)
args:
  - name: target
    description: URL or local path to check
    required: true
  - name: files
    description: Specific files to check (sitemap, robots, security, llms, llms-full, all)
    required: false
    default: all
---

# Web Resource Audit Command

Validates essential web resource files for SEO, security, and LLM accessibility compliance.

## Usage

```bash
/web-audit https://example.com              # Check all files on live site
/web-audit ./public                          # Check local directory
/web-audit https://example.com sitemap      # Check sitemap only
/web-audit https://example.com robots,llms  # Check specific files
```

## Supported Files

| File | Purpose | Specification |
|------|---------|---------------|
| sitemap.xml | URL listing for crawlers | sitemaps.org |
| robots.txt | Crawler access control | RFC 9309 |
| llms.txt | LLM site overview | llmstxt.org |
| llms-full.txt | Complete LLM docs | llmstxt.org |
| security.txt | Vulnerability disclosure | RFC 9116 |

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     /web-audit target                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │    Is target a URL?           │
              └───────────────────────────────┘
                    │               │
                   Yes              No
                    │               │
                    ▼               ▼
          ┌─────────────────┐   ┌─────────────────┐
          │  Fetch files    │   │  Read local     │
          │  via HTTP       │   │  files          │
          └─────────────────┘   └─────────────────┘
                    │               │
                    └───────┬───────┘
                            ▼
                    ┌─────────────────┐
                    │  Validate each  │
                    │  file against   │
                    │  specification  │
                    └─────────────────┘
                            │
                            ▼
                    ┌─────────────────┐
                    │  Generate       │
                    │  Report         │
                    └─────────────────┘
```

## Execution Flow

1. **Detect target type**: URL or local directory
2. **Fetch/read files**: Attempt to retrieve each resource file
3. **Validate content**: Check against respective specifications
4. **Generate report**: Summarize issues and recommendations

## Output Example

```markdown
# Web Resource Audit Report

## Target: https://example.com
Analyzed at: 2024-01-15T10:00:00Z

---

## Files Found

| File | Status | Issues |
|------|--------|--------|
| sitemap.xml | Found | 2 |
| robots.txt | Found | 1 |
| llms.txt | Not Found | - |
| llms-full.txt | Not Found | - |
| security.txt | Found | 0 |

---

## Issues

### sitemap.xml

1. **15/100 URLs missing <lastmod>** (Recommended)
   - Fix: Add <lastmod>YYYY-MM-DD</lastmod> to improve crawl efficiency

2. **2 URLs are relative (must be absolute)** (Critical)
   - Fix: Use absolute URLs starting with https://

### robots.txt

1. **No Sitemap directive found** (Recommended)
   - Fix: Add Sitemap: https://example.com/sitemap.xml

---

## Summary

- Files checked: 5 (3 found)
- Valid files: 3
- Critical issues: 1
- Important issues: 0
- Recommended improvements: 2

## Recommendations

- Create llms.txt for better LLM accessibility
- Create llms-full.txt for comprehensive LLM context
```

## Related Skills

- **web-resource-checker**: File validation logic and specifications
- **seo-lookup**: SEO reference for sitemap/robots best practices

## Tips

1. **For new projects**: Start with robots.txt and sitemap.xml
   ```bash
   /web-audit ./public --only=sitemap,robots
   ```

2. **For LLM optimization**: Add llms.txt following llmstxt.org spec
   ```bash
   /web-audit https://example.com --only=llms,llms-full
   ```

3. **For security compliance**: Ensure security.txt per RFC 9116
   ```bash
   /web-audit https://example.com --only=security
   ```

4. **Quick JSON output**: For CI/CD integration
   ```bash
   bash ${CLAUDE_PLUGIN_ROOT}/skills/web-resource-checker/scripts/run-resource-check.sh https://example.com --json
   ```

## Severity Levels

- **Critical**: Must fix - blocks functionality or violates required spec
- **Important**: Should fix - significant issue or missing required field
- **Recommended**: Nice to have - improves quality but not required
