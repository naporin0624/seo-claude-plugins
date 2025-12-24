---
name: devsecops-audit
description: Comprehensive DevSecOps security audit that launches multiple specialized agents in parallel. Covers secrets, SAST, SCA, container security, and IaC scanning based on OWASP DevSecOps Guideline.
args: path
---

# DevSecOps Security Audit

You are conducting a comprehensive security audit based on the OWASP DevSecOps Guideline. Deploy specialized security agents in parallel to maximize coverage and efficiency.

## Target

Audit path: `$ARGUMENTS` (default: current directory)

## Phase 1: Pre-commit Security (Secrets Detection)

Launch the gitleaks-agent to scan for hardcoded secrets:

```
Task: gitleaks-agent
Prompt: Scan the codebase at "$ARGUMENTS" for hardcoded secrets, API keys, credentials, and sensitive data. Use the secret-scanner skill and report all findings with severity and remediation guidance.
```

## Phase 2: Build Security - SAST

Launch the semgrep-agent for static application security testing:

```
Task: semgrep-agent
Prompt: Perform static application security testing (SAST) on the codebase at "$ARGUMENTS". Use the sast-runner skill with security-audit config. Focus on OWASP Top 10 vulnerabilities: injection flaws, XSS, insecure deserialization, and security anti-patterns.
```

## Phase 3: Build Security - SCA & Container

Launch trivy-agent for dependency and container scanning:

```
Task: trivy-agent
Prompt: Scan dependencies and container images at "$ARGUMENTS" for known vulnerabilities. Use sca-runner for dependency scanning and container-scanner for any Dockerfiles found. Report CVEs with CVSS scores and fix availability.
```

Launch hadolint-agent for Dockerfile security:

```
Task: hadolint-agent
Prompt: Lint all Dockerfiles found at "$ARGUMENTS" for security best practices. Use container-scanner lint command. Check for running as root, unpinned versions, and security misconfigurations.
```

## Phase 4: Build Security - IaC

Launch tfsec-agent for infrastructure as code security:

```
Task: tfsec-agent
Prompt: Scan Infrastructure as Code at "$ARGUMENTS" for security misconfigurations. Use iac-scanner to check Terraform, Kubernetes manifests, and CloudFormation templates. Focus on public resources, missing encryption, and overly permissive IAM.
```

## Execution Strategy

1. **Launch all agents in parallel** using multiple Task tool calls in a single message
2. **Collect results** as each agent completes
3. **Consolidate findings** into a unified report
4. **Prioritize by severity** and exploitability

## Result Consolidation

After all agents complete, create a consolidated report:

```markdown
# DevSecOps Security Audit Report

**Target**: [path]
**Date**: [timestamp]
**Duration**: [time]

## Executive Summary

| Phase | Tool | Critical | High | Medium | Low |
|-------|------|----------|------|--------|-----|
| Secrets | Gitleaks | X | X | X | X |
| SAST | Semgrep | X | X | X | X |
| SCA | Trivy | X | X | X | X |
| Container | Hadolint | X | X | X | X |
| IaC | tfsec | X | X | X | X |
| **Total** | | **X** | **X** | **X** | **X** |

## Critical Findings (Immediate Action Required)

### 1. [Finding Title]
- **Source**: [Agent/Tool]
- **Severity**: Critical
- **Location**: [file:line]
- **Description**: [details]
- **Remediation**: [fix]

## High Severity Findings

[List high severity findings...]

## Remediation Priority

1. [ ] [Critical finding 1]
2. [ ] [Critical finding 2]
3. [ ] [High finding 1]
...

## Tool Coverage

- [ ] Gitleaks - Secret Detection
- [ ] Semgrep - SAST
- [ ] Trivy - SCA/Container
- [ ] Hadolint - Dockerfile
- [ ] tfsec/Checkov - IaC

## Next Steps

1. Address critical findings immediately
2. Create tickets for high severity issues
3. Schedule remediation for medium/low findings
4. Re-run audit after fixes
```

## Notes

- All agents run in parallel for efficiency
- Results are deduplicated where tools overlap
- Findings are prioritized by actual exploitability
- Each agent provides specific remediation guidance
