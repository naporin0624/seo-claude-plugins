#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { load } from "cheerio";
import { basename } from "path";

//#region src/cli.ts
const DEFAULT_CONFIG = { jsonOutput: false };
function parseArgs(args) {
	const config = { ...DEFAULT_CONFIG };
	let filepath = null;
	for (const arg of args) if (arg.startsWith("--")) {
		const key = arg.slice(2).split("=")[0];
		switch (key) {
			case "json":
				config.jsonOutput = true;
				break;
			case "help":
			case "h":
				printHelp();
				process.exit(0);
				break;
		}
	} else if (arg === "-h") {
		printHelp();
		process.exit(0);
	} else if (!filepath) filepath = arg;
	return {
		filepath,
		config
	};
}
function printHelp() {
	console.log(`
Form Security Analyzer - Static security analysis of HTML forms

Usage:
  npx tsx src/index.ts <file.html> [options]

Options:
  --json        Output as JSON
  --help, -h    Show this help

Examples:
  npx tsx src/index.ts login.html
  npx tsx src/index.ts form.html --json

Checks Performed:
  - CSRF token presence
  - Secure form action (HTTPS)
  - State-changing GET requests
  - Predictable IDs (IDOR risk)
  - Sensitive data in hidden fields
  - Input validation
  - Password autocomplete
  - Inline event handlers (XSS surface)
`);
}

//#endregion
//#region src/types.ts
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

//#endregion
//#region src/analyzer.ts
const CSRF_PATTERNS = [
	"csrf",
	"_csrf",
	"csrfToken",
	"csrf_token",
	"_token",
	"authenticity_token",
	"xsrf",
	"_xsrf"
];
const DANGEROUS_ACTIONS = [
	"delete",
	"remove",
	"update",
	"edit",
	"transfer",
	"send"
];
const ID_PATTERNS = [
	"user_id",
	"userId",
	"account_id",
	"accountId",
	"id",
	"uid"
];
const SENSITIVE_PATTERNS = [
	"api_key",
	"apiKey",
	"secret",
	"token",
	"password",
	"key",
	"admin",
	"role",
	"permission",
	"access"
];
const INLINE_HANDLERS = [
	"onsubmit",
	"onclick",
	"onchange",
	"oninput",
	"onfocus",
	"onblur"
];
function analyzeForm($, form, formIndex) {
	const issues = [];
	const $form = $(form);
	const formId = $form.attr("id") || $form.attr("name") || `form-${formIndex}`;
	const action = $form.attr("action") || "";
	const method = ($form.attr("method") || "GET").toUpperCase();
	const hiddenInputs = $form.find("input[type='hidden']").toArray();
	const hasCSRFField = hiddenInputs.some((input) => {
		const name = $(input).attr("name") || "";
		return CSRF_PATTERNS.some((pattern) => name.toLowerCase().includes(pattern.toLowerCase()));
	});
	const hasCSRFMeta = $("meta[name*='csrf']").length > 0 || $("meta[name*='xsrf']").length > 0;
	if (!hasCSRFField && !hasCSRFMeta && method === "POST") issues.push({
		severity: "critical",
		type: "missing-csrf",
		message: "Form lacks CSRF protection",
		detail: "No hidden CSRF token field found. Vulnerable to cross-site request forgery.",
		bounty: BOUNTY_ESTIMATES["missing-csrf"],
		owasp: "A01",
		cwe: "CWE-352"
	});
	if (action.startsWith("http://")) issues.push({
		severity: "critical",
		type: "http-action",
		message: "Form submits over insecure HTTP",
		detail: `Action URL: ${action}`,
		bounty: BOUNTY_ESTIMATES["http-action"],
		owasp: "A02",
		cwe: "CWE-319"
	});
	if (method === "GET") {
		const isDangerous = DANGEROUS_ACTIONS.some((word) => action.toLowerCase().includes(word));
		if (isDangerous) issues.push({
			severity: "high",
			type: "state-changing-get",
			message: "State-changing action uses GET method",
			detail: `Action "${action}" should use POST to prevent CSRF via link`,
			bounty: BOUNTY_ESTIMATES["state-changing-get"],
			owasp: "A01",
			cwe: "CWE-352"
		});
	}
	hiddenInputs.forEach((input) => {
		const name = $(input).attr("name") || "";
		const value = $(input).attr("value") || "";
		if (ID_PATTERNS.some((p) => name.toLowerCase() === p.toLowerCase())) {
			if (/^\d+$/.test(value)) issues.push({
				severity: "high",
				type: "predictable-id",
				message: `Predictable ID in hidden field: ${name}`,
				detail: `Value "${value}" appears to be a sequential ID. Classic IDOR target.`,
				bounty: BOUNTY_ESTIMATES["predictable-id"],
				owasp: "A01",
				cwe: "CWE-639"
			});
		}
		if (SENSITIVE_PATTERNS.some((p) => name.toLowerCase().includes(p.toLowerCase()))) {
			if (!CSRF_PATTERNS.some((p) => name.toLowerCase().includes(p.toLowerCase()))) issues.push({
				severity: "high",
				type: "sensitive-hidden",
				message: `Potentially sensitive data in hidden field: ${name}`,
				detail: "Hidden field may expose sensitive information or allow privilege manipulation",
				bounty: BOUNTY_ESTIMATES["sensitive-hidden"],
				owasp: "A01",
				cwe: "CWE-200"
			});
		}
	});
	$form.find("input:not([type='hidden']):not([type='submit']):not([type='button'])").each((_, input) => {
		const name = $(input).attr("name") || "";
		const type = $(input).attr("type") || "text";
		const hasMaxlength = $(input).attr("maxlength");
		if (name.toLowerCase().includes("email") && type !== "email") issues.push({
			severity: "medium",
			type: "no-validation",
			message: `Email field "${name}" missing type="email"`,
			detail: "Browser validation not enforced",
			bounty: BOUNTY_ESTIMATES["no-validation"],
			owasp: "A03",
			cwe: "CWE-20"
		});
		if (type === "password") {
			const autocomplete = $(input).attr("autocomplete");
			if (!autocomplete || autocomplete === "on") issues.push({
				severity: "medium",
				type: "password-autocomplete",
				message: `Password field "${name}" allows autocomplete`,
				detail: "Browser may cache password. Use autocomplete='new-password'",
				bounty: BOUNTY_ESTIMATES["password-autocomplete"],
				owasp: "A07",
				cwe: "CWE-522"
			});
		}
		if ((type === "text" || type === "password") && !hasMaxlength) issues.push({
			severity: "low",
			type: "missing-maxlength",
			message: `Input "${name}" missing maxlength attribute`,
			detail: "Could allow excessively long input",
			bounty: BOUNTY_ESTIMATES["missing-maxlength"],
			owasp: "A03",
			cwe: "CWE-20"
		});
	});
	INLINE_HANDLERS.forEach((handler) => {
		if ($form.attr(handler)) issues.push({
			severity: "medium",
			type: "inline-handler",
			message: `Inline ${handler} handler on form`,
			detail: "Inline JavaScript increases XSS attack surface",
			bounty: BOUNTY_ESTIMATES["inline-handler"],
			owasp: "A03",
			cwe: "CWE-79"
		});
	});
	return {
		id: formId,
		action,
		method,
		issues
	};
}
function analyzeFile(filePath) {
	if (!existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
	const html = readFileSync(filePath, "utf-8");
	const $ = load(html);
	const forms = $("form").toArray();
	if (forms.length === 0) return {
		file: basename(filePath),
		path: filePath,
		timestamp: new Date().toISOString(),
		forms: [],
		summary: {
			critical: 0,
			high: 0,
			medium: 0,
			low: 0
		}
	};
	const analyzedForms = forms.map((form, index) => analyzeForm($, form, index));
	const summary = {
		critical: 0,
		high: 0,
		medium: 0,
		low: 0
	};
	analyzedForms.forEach((form) => {
		form.issues.forEach((issue) => {
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

//#endregion
//#region src/reporter.ts
const SEVERITY_EMOJIS = {
	critical: "[CRITICAL]",
	high: "[HIGH]",
	medium: "[MEDIUM]",
	low: "[LOW]"
};
function formatTextReport(result) {
	const totalIssues = result.summary.critical + result.summary.high + result.summary.medium + result.summary.low;
	let output = `# Form Security Analysis: ${result.file}\n\n`;
	output += `Analyzed at: ${result.timestamp}\n\n`;
	output += `## Summary\n\n`;
	output += `| Severity | Count |\n`;
	output += `|----------|-------|\n`;
	output += `| Critical | ${result.summary.critical} |\n`;
	output += `| High | ${result.summary.high} |\n`;
	output += `| Medium | ${result.summary.medium} |\n`;
	output += `| Low | ${result.summary.low} |\n`;
	output += `| **Total** | **${totalIssues}** |\n\n`;
	if (result.forms.length === 0) {
		output += "No forms found in file.\n";
		return output;
	}
	const allIssues = result.forms.flatMap((form) => form.issues.map((issue) => ({
		...issue,
		formId: form.id,
		formAction: form.action
	})));
	const severities = [
		"critical",
		"high",
		"medium",
		"low"
	];
	severities.forEach((severity) => {
		const issues = allIssues.filter((i) => i.severity === severity);
		if (issues.length === 0) return;
		output += `## ${severity.charAt(0).toUpperCase() + severity.slice(1)} Issues ${SEVERITY_EMOJIS[severity]}\n\n`;
		issues.forEach((issue, index) => {
			output += `### ${index + 1}. ${issue.message}\n`;
			output += `**Form**: #${issue.formId}\n`;
			output += `**Type**: ${issue.type}\n`;
			output += `**Bounty Estimate**: ${issue.bounty}\n`;
			output += `**OWASP**: ${issue.owasp} | **CWE**: ${issue.cwe}\n\n`;
			output += `${issue.detail}\n\n`;
			output += `---\n\n`;
		});
	});
	if (totalIssues > 0) {
		output += `## Hunting Tips\n\n`;
		output += `Based on this analysis:\n\n`;
		if (result.summary.critical > 0) {
			const csrfIssue = allIssues.find((i) => i.type === "missing-csrf");
			if (csrfIssue) output += `1. **Test CSRF**: Submit form #${csrfIssue.formId} from a different origin\n`;
		}
		const idorIssue = allIssues.find((i) => i.type === "predictable-id");
		if (idorIssue) output += `2. **Test IDOR**: Change the hidden ID to access other users' data\n`;
		output += `3. **Run dynamic tests**: Use playwright-security-runner for actual exploitation\n`;
		output += `4. **Check CVEs**: Search for vulnerabilities in any detected frameworks\n`;
	}
	return output;
}

//#endregion
//#region src/index.ts
async function main() {
	const args = process.argv.slice(2);
	if (args.length === 0) {
		printHelp();
		process.exit(1);
	}
	const { filepath, config } = parseArgs(args);
	if (!filepath) {
		console.error("Error: No file specified");
		process.exit(1);
	}
	try {
		const result = analyzeFile(filepath);
		if (config.jsonOutput) console.log(JSON.stringify(result, null, 2));
		else console.log(formatTextReport(result));
		if (result.summary.critical > 0) process.exit(1);
	} catch (error) {
		console.error(`Error: ${error instanceof Error ? error.message : error}`);
		process.exit(1);
	}
}
main();

//#endregion