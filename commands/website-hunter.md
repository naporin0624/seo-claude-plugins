---
name: website-hunter
description: Launch multiple specialized bounty hunter agents in parallel to attack a website from every angle. Maximum coverage, maximum bounty potential.
args:
  - name: target
    description: Target URL to hunt
    required: true
  - name: hunters
    description: Which hunters to deploy (all, xss, sqli, csrf, idor)
    required: false
    default: all
allowed-tools: Bash, Read, Glob, Grep, Task
---

# Website Hunter Command 🎯💰💰💰

Deploy a team of specialized bounty hunters to attack your target from every angle. Each hunter focuses on their specialty while you coordinate the assault.

## Usage

```bash
# Deploy all hunters
/website-hunter http://localhost:3000

# Deploy specific hunters
/website-hunter http://localhost:3000 xss,sqli

# Just IDOR and CSRF
/website-hunter http://localhost:3000 idor,csrf
```

## The Hunter Team

| Hunter | Specialty | Bounty Range | Agent |
|--------|-----------|--------------|-------|
| 🎯 XSS Hunter | Script injection, DOM manipulation | $500 - $15,000 | xss-hunter |
| 🗄️ SQLi Hunter | Database attacks, auth bypass | $5,000 - $50,000 | sqli-hunter |
| 🎭 CSRF Hunter | Request forgery, action hijacking | $1,000 - $10,000 | csrf-hunter |
| 🔓 IDOR Hunter | Object reference, auth bypass | $2,000 - $50,000 | idor-hunter |

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                   /website-hunter                        │
│                   Target: http://target.com              │
└─────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │ XSS Hunter  │  │ SQLi Hunter │  │ CSRF Hunter │
   │  (parallel) │  │  (parallel) │  │  (parallel) │
   └─────────────┘  └─────────────┘  └─────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           ▼
              ┌─────────────────────────┐
              │   Combined Report       │
              │   Total Bounty: $XX,XXX │
              └─────────────────────────┘
```

## Execution Flow

### Phase 1: Reconnaissance (All Hunters)

1. **Static Analysis First** (safe, no requests)
   - Analyze HTML forms
   - Identify input fields
   - Check for obvious issues

2. **Share Intelligence**
   - Hunters share found forms
   - Identify high-value targets
   - Prioritize by bounty potential

### Phase 2: Parallel Hunting

Each hunter works their specialty simultaneously:

**XSS Hunter:**
```
"Checking all input reflections..."
"Testing payload variations..."
"Looking for stored XSS opportunities..."
```

**SQLi Hunter:**
```
"Probing login forms..."
"Testing search functionality..."
"Looking for error messages..."
```

**CSRF Hunter:**
```
"Checking state-changing actions..."
"Looking for missing tokens..."
"Testing token validation..."
```

**IDOR Hunter:**
```
"Finding all object references..."
"Testing authorization on each..."
"Trying horizontal and vertical escalation..."
```

### Phase 3: Combined Report

All findings consolidated with:
- Total vulnerabilities found
- Combined bounty estimate
- Prioritized by severity

## Example Session

```
> /website-hunter http://localhost:3000

🎯 Website Hunter - Deploying Team
Target: http://localhost:3000
Hunters: XSS, SQLi, CSRF, IDOR

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Phase 1: Reconnaissance]
Running static analysis...
Found 3 forms, 12 input fields, 5 hidden fields

[Phase 2: Deploying Hunters]
🔴 XSS Hunter: Started (background)
🔴 SQLi Hunter: Started (background)
🔴 CSRF Hunter: Started (background)
🔴 IDOR Hunter: Started (background)

[Waiting for hunters...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Phase 3: Results]

🎯 XSS Hunter Report:
   ✓ Found: Reflected XSS in search
   Bounty: $2,000 - $5,000

🗄️ SQLi Hunter Report:
   ✓ Found: SQL Injection in login
   Bounty: $10,000 - $25,000

🎭 CSRF Hunter Report:
   ✓ Found: CSRF on password change
   Bounty: $5,000 - $10,000

🔓 IDOR Hunter Report:
   ✓ Found: IDOR on user profiles
   Bounty: $5,000 - $15,000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 TOTAL BOUNTY POTENTIAL: $22,000 - $55,000 💰

4 vulnerabilities found. See detailed reports above.
```

## Confirmation Gates

Dynamic testing requires confirmation:

```
⚠️ CONFIRMATION REQUIRED

The following hunters want to send payloads:

XSS Hunter wants to test:
  - <script>alert(1)</script> → search field
  - <img src=x onerror=alert(1)> → search field

SQLi Hunter wants to test:
  - ' OR '1'='1 → username field
  - admin'-- → username field

Proceed with dynamic testing? (yes/no)
```

## Safety Features

1. **Static analysis first** - no requests until confirmed
2. **Production URL warning** - alert on non-localhost targets
3. **Payload preview** - see exactly what will be sent
4. **Parallel but coordinated** - hunters don't interfere

## Output

Each hunter produces a detailed report including:
- Vulnerability type and severity
- Reproduction steps
- Payload that worked
- Bounty estimate
- Screenshot (if applicable)

## Tips

1. **Start with localhost/staging** - safer for testing
2. **Review static findings first** - prioritize before dynamic
3. **Check hunter reports** - each has unique perspective
4. **Combine findings** - CSRF + IDOR = bigger impact

## Related Skills

- `attack-methods-lookup` - OWASP reference
- `cve-search` - Check for known vulnerabilities
- `form-security-analyzer` - Static analysis
- `playwright-security-runner` - Dynamic testing
