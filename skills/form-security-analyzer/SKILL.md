---
name: form-security-analyzer
description: Static security analysis of HTML forms without sending any requests. Checks for CSRF tokens, insecure actions, missing validation, hidden field issues, and common security misconfigurations. Safe to run - no payloads sent. Use when user asks to "analyze form security", "check form for vulnerabilities", "static security check", "フォームセキュリティ", "静的解析".
---

# Form Security Analyzer 🔍

Static analysis of HTML forms to find security issues. No requests sent - just code inspection. Safe and fast.

## Your Bounty Hunter Perspective

When analyzing a form, think:
- "Where's the money hiding in this form?"
- "What did the developer forget?"
- "How can I abuse this?"

## Quick Start

```bash
# Analyze a single file
bash ${CLAUDE_PLUGIN_ROOT}/skills/form-security-analyzer/scripts/analyze-form.sh path/to/file.html

# JSON output
bash ${CLAUDE_PLUGIN_ROOT}/skills/form-security-analyzer/scripts/analyze-form.sh path/to/file.html --json

# Analyze multiple files
bash ${CLAUDE_PLUGIN_ROOT}/skills/form-security-analyzer/scripts/analyze-form.sh "src/**/*.html"
```

## What It Checks

### Critical Issues ($$$)

| Check | What It Finds | Bounty Potential |
|-------|--------------|------------------|
| Missing CSRF Token | Forms without protection | $1K - $10K |
| HTTP Action URL | Credentials sent insecurely | $500 - $5K |
| SQL-injectable patterns | Direct DB query indicators | $5K - $50K |
| Hidden sensitive data | API keys, tokens in hidden fields | $500 - $25K |

### High Issues

| Check | What It Finds | Bounty Potential |
|-------|--------------|------------------|
| No input validation | Missing type/pattern/required | $500 - $2K |
| Autocomplete on passwords | Credential caching enabled | $100 - $500 |
| Predictable IDs | Sequential/guessable object refs | $2K - $50K |

### Medium Issues

| Check | What It Finds | Bounty Potential |
|-------|--------------|------------------|
| Missing maxlength | Potential buffer/storage issues | $100 - $500 |
| Inline JS handlers | XSS surface area | $500 - $2K |
| Form without id/name | Potential CSRF target | $100 - $1K |

## Security Checks Detail

### 1. CSRF Protection
```html
<!-- BAD: No CSRF token -->
<form action="/transfer" method="POST">
  <input name="amount" />
  <button>Send</button>
</form>

<!-- GOOD: Has CSRF token -->
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="abc123" />
  <input name="amount" />
  <button>Send</button>
</form>
```

### 2. Secure Action URL
```html
<!-- BAD: HTTP (credentials exposed) -->
<form action="http://example.com/login" method="POST">

<!-- GOOD: HTTPS -->
<form action="https://example.com/login" method="POST">
```

### 3. Input Validation
```html
<!-- BAD: No validation -->
<input name="email" />

<!-- GOOD: Proper validation -->
<input name="email" type="email" required pattern="[^@]+@[^@]+\.[^@]+" />
```

### 4. Password Security
```html
<!-- BAD: Autocomplete allows caching -->
<input type="password" name="password" />

<!-- GOOD: Prevent caching -->
<input type="password" name="password" autocomplete="new-password" />
```

### 5. Hidden Field Analysis
```html
<!-- BAD: Sensitive data exposed -->
<input type="hidden" name="user_id" value="12345" />
<input type="hidden" name="api_key" value="sk_live_xxx" />
<input type="hidden" name="admin" value="false" />

<!-- These are IDOR and privilege escalation opportunities! -->
```

### 6. Dangerous Patterns
```html
<!-- BAD: Inline handlers (XSS surface) -->
<form onsubmit="return validate()">

<!-- BAD: State-changing GET -->
<form action="/delete" method="GET">
```

## Output Format

```markdown
# Form Security Analysis: login.html

## Summary
| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 3 |
| Medium | 1 |

## Critical Issues 💰💰💰

### 1. Missing CSRF Token
**Form**: #login-form
**Location**: Line 15
**Bounty Estimate**: $1,000 - $10,000

The form lacks CSRF protection. An attacker could trick users into submitting this form from a malicious site.

**Indicators**:
- No hidden field with token pattern (csrf, _token, etc.)
- No meta tag with csrf-token

**Recommendation**:
Add a CSRF token hidden field that's validated server-side.

---

### 2. HTTP Form Action
**Form**: #login-form
**Location**: Line 15
**Bounty Estimate**: $500 - $5,000

Form submits to HTTP URL. Credentials could be intercepted.

**Current**: `action="http://example.com/login"`
**Should be**: `action="https://example.com/login"`

---

## High Issues 💰💰

### 3. Predictable User ID in Hidden Field
**Form**: #profile-form
**Location**: Line 42
**Bounty Estimate**: $2,000 - $50,000

Hidden field contains numeric user ID that could be manipulated:
\`<input type="hidden" name="user_id" value="12345" />\`

This is a classic IDOR vulnerability. Test by changing the value.

---

## Hunting Tips

Based on this analysis:
1. **Test CSRF**: Submit the form from a different origin
2. **Test IDOR**: Change user_id to other values (124, 1, etc.)
3. **Check validation**: What happens with malformed input?
```

## Integration with Other Skills

After static analysis, use:
- `attack-methods-lookup` - Get attack payloads for found issues
- `cve-search` - Check if used libraries have known CVEs
- `playwright-security-runner` - Dynamic testing (with confirmation)

## Limitations

This is **static analysis only**:
- Cannot detect server-side issues
- Cannot verify if CSRF tokens are actually validated
- Cannot test actual exploitation

Use this as reconnaissance, then proceed to dynamic testing.

## Safety

This skill is 100% safe:
- Only reads HTML files
- No requests sent
- No payloads executed
- No data modified

Run freely without concerns.
