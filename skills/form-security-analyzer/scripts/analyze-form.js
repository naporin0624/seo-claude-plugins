#!/usr/bin/env node

/**
 * Form Security Analyzer
 *
 * Static analysis of HTML forms for security vulnerabilities.
 * No requests sent - safe to run on any file.
 */

import { readFileSync, existsSync } from "fs";
import { load } from "cheerio";
import { basename } from "path";

// Bounty estimates by issue type
const BOUNTY_ESTIMATES = {
  "missing-csrf": "$1,000 - $10,000",
  "http-action": "$500 - $5,000",
  "predictable-id": "$2,000 - $50,000",
  "sensitive-hidden": "$500 - $25,000",
  "no-validation": "$500 - $2,000",
  "password-autocomplete": "$100 - $500",
  "inline-handler": "$500 - $2,000",
  "state-changing-get": "$1,000 - $5,000",
  "missing-maxlength": "$100 - $500"
};

function analyzeForm($, form, formIndex) {
  const issues = [];
  const formId = $(form).attr("id") || $(form).attr("name") || `form-${formIndex}`;
  const action = $(form).attr("action") || "";
  const method = ($(form).attr("method") || "GET").toUpperCase();

  // 1. Check for CSRF token
  const csrfPatterns = [
    "csrf", "_csrf", "csrfToken", "csrf_token", "_token",
    "authenticity_token", "xsrf", "_xsrf"
  ];

  const hasCSRFField = $(form).find("input[type='hidden']").toArray().some(input => {
    const name = $(input).attr("name") || "";
    return csrfPatterns.some(pattern =>
      name.toLowerCase().includes(pattern.toLowerCase())
    );
  });

  const hasCSRFMeta = $("meta[name*='csrf']").length > 0 ||
                      $("meta[name*='xsrf']").length > 0;

  if (!hasCSRFField && !hasCSRFMeta && method === "POST") {
    issues.push({
      severity: "critical",
      type: "missing-csrf",
      message: "Form lacks CSRF protection",
      detail: "No hidden CSRF token field found. Vulnerable to cross-site request forgery.",
      bounty: BOUNTY_ESTIMATES["missing-csrf"],
      owasp: "A01",
      cwe: "CWE-352"
    });
  }

  // 2. Check action URL security
  if (action.startsWith("http://")) {
    issues.push({
      severity: "critical",
      type: "http-action",
      message: "Form submits over insecure HTTP",
      detail: `Action URL: ${action}`,
      bounty: BOUNTY_ESTIMATES["http-action"],
      owasp: "A02",
      cwe: "CWE-319"
    });
  }

  // 3. Check for state-changing GET requests
  if (method === "GET") {
    const dangerousActions = ["delete", "remove", "update", "edit", "transfer", "send"];
    const isDangerous = dangerousActions.some(word =>
      action.toLowerCase().includes(word)
    );

    if (isDangerous) {
      issues.push({
        severity: "high",
        type: "state-changing-get",
        message: "State-changing action uses GET method",
        detail: `Action "${action}" should use POST to prevent CSRF via link`,
        bounty: BOUNTY_ESTIMATES["state-changing-get"],
        owasp: "A01",
        cwe: "CWE-352"
      });
    }
  }

  // 4. Analyze hidden fields
  $(form).find("input[type='hidden']").each((_, input) => {
    const name = $(input).attr("name") || "";
    const value = $(input).attr("value") || "";

    // Check for predictable IDs
    const idPatterns = ["user_id", "userId", "account_id", "accountId", "id", "uid"];
    if (idPatterns.some(p => name.toLowerCase() === p.toLowerCase())) {
      if (/^\d+$/.test(value)) {
        issues.push({
          severity: "high",
          type: "predictable-id",
          message: `Predictable ID in hidden field: ${name}`,
          detail: `Value "${value}" appears to be a sequential ID. Classic IDOR target.`,
          bounty: BOUNTY_ESTIMATES["predictable-id"],
          owasp: "A01",
          cwe: "CWE-639"
        });
      }
    }

    // Check for sensitive data
    const sensitivePatterns = [
      "api_key", "apiKey", "secret", "token", "password", "key",
      "admin", "role", "permission", "access"
    ];

    if (sensitivePatterns.some(p => name.toLowerCase().includes(p.toLowerCase()))) {
      // Skip CSRF tokens
      if (!csrfPatterns.some(p => name.toLowerCase().includes(p.toLowerCase()))) {
        issues.push({
          severity: "high",
          type: "sensitive-hidden",
          message: `Potentially sensitive data in hidden field: ${name}`,
          detail: `Hidden field may expose sensitive information or allow privilege manipulation`,
          bounty: BOUNTY_ESTIMATES["sensitive-hidden"],
          owasp: "A01",
          cwe: "CWE-200"
        });
      }
    }
  });

  // 5. Check input validation
  $(form).find("input:not([type='hidden']):not([type='submit']):not([type='button'])").each((_, input) => {
    const name = $(input).attr("name") || "";
    const type = $(input).attr("type") || "text";
    const hasPattern = $(input).attr("pattern");
    const hasRequired = $(input).attr("required") !== undefined;
    const hasMaxlength = $(input).attr("maxlength");

    // Email fields should have proper validation
    if (name.toLowerCase().includes("email") && type !== "email") {
      issues.push({
        severity: "medium",
        type: "no-validation",
        message: `Email field "${name}" missing type="email"`,
        detail: "Browser validation not enforced",
        bounty: BOUNTY_ESTIMATES["no-validation"],
        owasp: "A03",
        cwe: "CWE-20"
      });
    }

    // Password fields
    if (type === "password") {
      const autocomplete = $(input).attr("autocomplete");
      if (!autocomplete || autocomplete === "on") {
        issues.push({
          severity: "medium",
          type: "password-autocomplete",
          message: `Password field "${name}" allows autocomplete`,
          detail: "Browser may cache password. Use autocomplete='new-password'",
          bounty: BOUNTY_ESTIMATES["password-autocomplete"],
          owasp: "A07",
          cwe: "CWE-522"
        });
      }
    }

    // Text inputs without maxlength
    if ((type === "text" || type === "password") && !hasMaxlength) {
      issues.push({
        severity: "low",
        type: "missing-maxlength",
        message: `Input "${name}" missing maxlength attribute`,
        detail: "Could allow excessively long input",
        bounty: BOUNTY_ESTIMATES["missing-maxlength"],
        owasp: "A03",
        cwe: "CWE-20"
      });
    }
  });

  // 6. Check for inline handlers (XSS surface)
  const inlineHandlers = ["onsubmit", "onclick", "onchange", "oninput", "onfocus", "onblur"];
  inlineHandlers.forEach(handler => {
    if ($(form).attr(handler)) {
      issues.push({
        severity: "medium",
        type: "inline-handler",
        message: `Inline ${handler} handler on form`,
        detail: "Inline JavaScript increases XSS attack surface",
        bounty: BOUNTY_ESTIMATES["inline-handler"],
        owasp: "A03",
        cwe: "CWE-79"
      });
    }
  });

  return {
    id: formId,
    action,
    method,
    issues
  };
}

function analyzeFile(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const html = readFileSync(filePath, "utf-8");
  const $ = load(html);
  const forms = $("form").toArray();

  if (forms.length === 0) {
    return {
      file: basename(filePath),
      forms: [],
      summary: { critical: 0, high: 0, medium: 0, low: 0 }
    };
  }

  const analyzedForms = forms.map((form, index) => analyzeForm($, form, index));

  // Calculate summary
  const summary = { critical: 0, high: 0, medium: 0, low: 0 };
  analyzedForms.forEach(form => {
    form.issues.forEach(issue => {
      summary[issue.severity]++;
    });
  });

  return {
    file: basename(filePath),
    path: filePath,
    timestamp: new Date().toISOString(),
    forms: analyzedForms,
    summary
  };
}

function printReport(result) {
  const totalIssues = result.summary.critical + result.summary.high +
                      result.summary.medium + result.summary.low;

  console.log(`# Form Security Analysis: ${result.file}\n`);
  console.log(`## Summary\n`);
  console.log(`| Severity | Count |`);
  console.log(`|----------|-------|`);
  console.log(`| Critical | ${result.summary.critical} |`);
  console.log(`| High | ${result.summary.high} |`);
  console.log(`| Medium | ${result.summary.medium} |`);
  console.log(`| Low | ${result.summary.low} |`);
  console.log(`| **Total** | **${totalIssues}** |\n`);

  if (result.forms.length === 0) {
    console.log("No forms found in file.\n");
    return;
  }

  // Group by severity
  const allIssues = result.forms.flatMap(form =>
    form.issues.map(issue => ({ ...issue, formId: form.id, formAction: form.action }))
  );

  const severities = ["critical", "high", "medium", "low"];
  const severityEmojis = {
    critical: "🔴💰💰💰",
    high: "🟠💰💰",
    medium: "🟡💰",
    low: "🟢"
  };

  severities.forEach(severity => {
    const issues = allIssues.filter(i => i.severity === severity);
    if (issues.length === 0) return;

    console.log(`## ${severity.charAt(0).toUpperCase() + severity.slice(1)} Issues ${severityEmojis[severity]}\n`);

    issues.forEach((issue, index) => {
      console.log(`### ${index + 1}. ${issue.message}`);
      console.log(`**Form**: #${issue.formId}`);
      console.log(`**Type**: ${issue.type}`);
      console.log(`**Bounty Estimate**: ${issue.bounty}`);
      console.log(`**OWASP**: ${issue.owasp} | **CWE**: ${issue.cwe}\n`);
      console.log(`${issue.detail}\n`);
      console.log(`---\n`);
    });
  });

  // Hunting tips
  if (totalIssues > 0) {
    console.log(`## Hunting Tips 🎯\n`);
    console.log(`Based on this analysis:\n`);

    if (result.summary.critical > 0) {
      const csrfIssue = allIssues.find(i => i.type === "missing-csrf");
      if (csrfIssue) {
        console.log(`1. **Test CSRF**: Submit form #${csrfIssue.formId} from a different origin`);
      }
    }

    const idorIssue = allIssues.find(i => i.type === "predictable-id");
    if (idorIssue) {
      console.log(`2. **Test IDOR**: Change the hidden ID to access other users' data`);
    }

    console.log(`3. **Run dynamic tests**: Use playwright-security-runner for actual exploitation`);
    console.log(`4. **Check CVEs**: Search for vulnerabilities in any detected frameworks\n`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Form Security Analyzer - Static security analysis of HTML forms

Usage:
  node analyze-form.js <file> [options]

Options:
  --json        Output as JSON
  --help, -h    Show this help

Examples:
  node analyze-form.js login.html
  node analyze-form.js form.html --json
`);
    process.exit(0);
  }

  const filePath = args[0];
  const jsonOutput = args.includes("--json");

  try {
    const result = analyzeFile(filePath);

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printReport(result);
    }

    // Exit with error code if critical issues found
    if (result.summary.critical > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
