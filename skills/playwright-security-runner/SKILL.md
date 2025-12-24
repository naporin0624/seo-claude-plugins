---
name: playwright-security-runner
description: Dynamic security testing of web forms using Playwright browser automation. Sends actual payloads to test for vulnerabilities. REQUIRES USER CONFIRMATION before execution. Use when user wants to "test payloads", "dynamic security test", "exploit testing", "penetration test forms", "動的テスト", "ペイロードテスト".
---

# Playwright Security Runner 🎭⚠️

Dynamic security testing with real browser automation. This skill **sends actual payloads** to targets.

## ⚠️ CRITICAL: Safety Protocols

**This skill sends real requests. ALWAYS get user confirmation first.**

### Before Running:
1. Show the user what payloads will be sent
2. Confirm the target is authorized for testing
3. Warn if target appears to be production

### Confirmation Template:
```
🎯 Security Test Plan

Target: http://localhost:3000/login
Payloads to send:
1. [XSS] <script>alert(1)</script> → username field
2. [SQLi] ' OR '1'='1 → password field
3. [CSRF] Cross-origin form submission

⚠️ This will send real requests to the target.
Potential bounty: $5,000 - $15,000

Proceed? (yes/no)
```

## Quick Start

```bash
# Dry run - shows what would be tested (SAFE)
bash ${CLAUDE_PLUGIN_ROOT}/skills/playwright-security-runner/scripts/run-security-test.sh \
  --url "http://localhost:3000/login" \
  --dry-run

# Actually run tests (REQUIRES CONFIRMATION)
bash ${CLAUDE_PLUGIN_ROOT}/skills/playwright-security-runner/scripts/run-security-test.sh \
  --url "http://localhost:3000/login" \
  --test xss,sqli

# Test specific form
bash ${CLAUDE_PLUGIN_ROOT}/skills/playwright-security-runner/scripts/run-security-test.sh \
  --url "http://localhost:3000" \
  --form "#login-form" \
  --test all
```

## Test Types

| Type | What It Tests | Payloads |
|------|--------------|----------|
| `xss` | Cross-site scripting | Script tags, event handlers |
| `sqli` | SQL injection | Quotes, UNION, comments |
| `csrf` | Request forgery | Token removal, cross-origin |
| `auth` | Authentication | Bypass attempts |
| `idor` | Object references | ID manipulation |
| `all` | Everything | All of the above |

## Options

| Option | Description |
|--------|-------------|
| `--url <url>` | Target URL (required) |
| `--form <selector>` | CSS selector for form (optional) |
| `--test <types>` | Comma-separated test types |
| `--dry-run` | Show plan without executing |
| `--screenshot` | Capture screenshots of results |
| `--json` | Output as JSON |

## Safety Features

### 1. Production Detection
```
⚠️ WARNING: Production URL Detected

The target URL appears to be a production system:
https://example.com/login

Security testing against production:
- May cause service disruption
- Could trigger security alerts
- May violate terms of service

Ensure you have authorization to test this target.
```

### 2. Dry Run Mode
```bash
# See what would happen without actually doing it
bash run-security-test.sh --url "http://target.com" --dry-run
```

Output:
```
=== DRY RUN MODE ===

Would test: http://target.com/login
Form found: #login-form

Planned payloads:
1. [XSS] Input: username, Value: <script>alert(1)</script>
2. [XSS] Input: username, Value: <img src=x onerror=alert(1)>
3. [SQLi] Input: password, Value: ' OR '1'='1
4. [SQLi] Input: password, Value: admin'--

No requests sent. Use without --dry-run to execute.
```

### 3. Audit Logging
All actions are logged:
```json
{
  "sessionId": "abc123",
  "timestamp": "2024-01-15T10:30:00Z",
  "target": "http://localhost:3000/login",
  "action": "send_payload",
  "payload": "<script>alert(1)</script>",
  "field": "username",
  "response": { "status": 200, "reflected": true }
}
```

## Test Scenarios

### XSS Testing
```javascript
const xssPayloads = [
  "<script>alert(document.domain)</script>",
  "<img src=x onerror=alert(1)>",
  "<svg onload=alert(1)>",
  "javascript:alert(1)",
  "'><script>alert(1)</script>"
];

// Test each input field with each payload
// Check if payload is reflected in response
```

### SQL Injection Testing
```javascript
const sqliPayloads = [
  "' OR '1'='1",
  "' OR '1'='1'--",
  "'; DROP TABLE users--",
  "1 UNION SELECT NULL,NULL--"
];

// Test login forms, search forms
// Check for error messages, auth bypass
```

### CSRF Testing
```javascript
// 1. Get form without CSRF token
// 2. Submit from different origin
// 3. Check if action succeeds

// Or:
// 1. Get valid CSRF token
// 2. Reuse in different session
// 3. Check if still valid
```

## Output Format

### Vulnerability Found
```markdown
## 🔴 VULNERABILITY FOUND

**Type**: Reflected XSS
**Severity**: HIGH
**Bounty Estimate**: $2,000 - $10,000

**Target**: http://localhost:3000/search
**Field**: query
**Payload**: <script>alert(1)</script>

**Evidence**:
- Payload reflected in response HTML
- No encoding applied
- Script tag intact

**Screenshot**: ./screenshots/xss-001.png

**Reproduction**:
1. Navigate to http://localhost:3000/search
2. Enter `<script>alert(1)</script>` in search field
3. Submit form
4. Observe alert dialog

**Recommendation**:
Apply HTML entity encoding to all user input before rendering.
```

### No Vulnerability
```markdown
## ✅ Test Passed

**Type**: SQL Injection
**Target**: http://localhost:3000/login

**Payloads Tested**: 12
**Result**: No SQL errors detected

The application appears to properly sanitize input
or use parameterized queries.
```

## Integration Workflow

1. **Static Analysis First**
   ```bash
   # Safe - no requests
   bash analyze-form.sh target.html
   ```

2. **Review Findings**
   - Identify high-value targets
   - Plan attack vectors

3. **Dry Run**
   ```bash
   # Still safe - just planning
   bash run-security-test.sh --url "..." --dry-run
   ```

4. **Get Confirmation**
   - Show payload list to user
   - Confirm authorization

5. **Execute Tests**
   ```bash
   # Now we're sending payloads
   bash run-security-test.sh --url "..." --test xss,sqli
   ```

6. **Document Findings**
   - Screenshots as evidence
   - Detailed reproduction steps

## Important Notes

- **localhost/staging only**: Prefer testing against development environments
- **Authorization required**: Ensure you have permission to test
- **Rate limiting**: Built-in delays between requests
- **Evidence collection**: Screenshots and logs for bug reports

## External Resources

- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
