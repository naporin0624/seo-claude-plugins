#!/usr/bin/env node
import { spawn, spawnSync } from "child_process";
import { existsSync } from "fs";

//#region src/types.ts
const SEVERITY_MAP = {
	"aws-access-key-id": "critical",
	"aws-secret-access-key": "critical",
	"gcp-api-key": "critical",
	"azure-storage-key": "critical",
	"private-key": "critical",
	"ssh-private-key": "critical",
	"rsa-private-key": "critical",
	"password": "high",
	"api-key": "high",
	"github-pat": "high",
	"gitlab-pat": "high",
	"npm-access-token": "high",
	"slack-token": "high",
	"stripe-api-key": "high",
	"twilio-api-key": "high",
	"sendgrid-api-key": "high",
	"mailchimp-api-key": "high",
	"generic-api-key": "medium",
	"jwt": "medium",
	"oauth-token": "medium",
	"bearer-token": "medium",
	"generic-credential": "low",
	"password-in-url": "low"
};
const CWE_MAP = {
	critical: ["CWE-798", "CWE-321"],
	high: ["CWE-798", "CWE-259"],
	medium: ["CWE-312"],
	low: ["CWE-312"]
};

//#endregion
//#region src/index.ts
function parseArgs(args) {
	const options = {
		path: ".",
		json: false,
		check: false,
		verbose: false
	};
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--json" || arg === "-j") options.json = true;
		else if (arg === "--check" || arg === "-c") options.check = true;
		else if (arg === "--verbose" || arg === "-v") options.verbose = true;
		else if (arg === "--help" || arg === "-h") {
			printHelp();
			process.exit(0);
		} else if (!arg.startsWith("-")) options.path = arg;
	}
	return options;
}
function printHelp() {
	console.log(`
Secret Scanner - Gitleaks Wrapper

Usage: secret-scanner [path] [options]

Arguments:
  path          Path to scan (default: current directory)

Options:
  --json, -j    Output results as JSON
  --check, -c   Check if gitleaks is installed
  --verbose, -v Show detailed output
  --help, -h    Show this help message

Examples:
  secret-scanner .                    # Scan current directory
  secret-scanner /path/to/repo --json # Scan with JSON output
  secret-scanner --check              # Check gitleaks installation
`);
}
function checkGitleaksInstalled() {
	const result = spawnSync("gitleaks", ["version"], { stdio: "pipe" });
	return result.status === 0;
}
function getGitleaksVersion() {
	const result = spawnSync("gitleaks", ["version"], { encoding: "utf-8" });
	if (result.status === 0 && result.stdout) return result.stdout.toString().trim();
	return "unknown";
}
function getSeverity(ruleId) {
	const normalizedRule = ruleId.toLowerCase().replace(/_/g, "-");
	if (SEVERITY_MAP[normalizedRule]) return SEVERITY_MAP[normalizedRule];
	for (const [key, severity] of Object.entries(SEVERITY_MAP)) if (normalizedRule.includes(key) || key.includes(normalizedRule)) return severity;
	return "medium";
}
function redactSecret(secret) {
	if (secret.length <= 8) return "***REDACTED***";
	return secret.slice(0, 4) + "***REDACTED***" + secret.slice(-4);
}
function transformFindings(gitleaksFindings) {
	return gitleaksFindings.map((finding) => {
		const severity = getSeverity(finding.RuleID);
		return {
			id: finding.RuleID,
			severity,
			description: finding.Description,
			file: finding.File,
			line: finding.StartLine,
			secret: redactSecret(finding.Secret),
			commit: finding.Commit?.slice(0, 7) || "staged",
			author: finding.Email || "unknown",
			date: finding.Date || new Date().toISOString(),
			cwes: CWE_MAP[severity] || []
		};
	});
}
function calculateSummary(findings) {
	return findings.reduce((acc, finding) => {
		acc.total++;
		acc[finding.severity]++;
		return acc;
	}, {
		total: 0,
		critical: 0,
		high: 0,
		medium: 0,
		low: 0
	});
}
async function runGitleaks(scanPath) {
	return new Promise((resolve, reject) => {
		const args = [
			"detect",
			"--source",
			scanPath,
			"-v",
			"--report-format",
			"json"
		];
		const proc = spawn("gitleaks", args, { stdio: [
			"pipe",
			"pipe",
			"pipe"
		] });
		let stdout = "";
		let stderr = "";
		proc.stdout.on("data", (data) => {
			stdout += data.toString();
		});
		proc.stderr.on("data", (data) => {
			stderr += data.toString();
		});
		proc.on("close", (code) => {
			if (code === 0) resolve([]);
			else if (code === 1) try {
				const findings = JSON.parse(stdout);
				resolve(findings);
			} catch {
				console.error("Warning: Could not parse gitleaks output");
				resolve([]);
			}
			else reject(new Error(`Gitleaks exited with code ${code}: ${stderr}`));
		});
		proc.on("error", (err) => {
			reject(new Error(`Failed to run gitleaks: ${err.message}`));
		});
	});
}
function formatTextOutput(result) {
	const lines = [];
	lines.push("=".repeat(60));
	lines.push("Secret Scanner Report");
	lines.push("=".repeat(60));
	lines.push(`Scan Path: ${result.scanPath}`);
	lines.push(`Scan Date: ${result.scanDate}`);
	lines.push(`Tool: ${result.tool} ${result.version}`);
	lines.push("");
	lines.push("Summary:");
	lines.push(`  Total: ${result.summary.total}`);
	lines.push(`  Critical: ${result.summary.critical}`);
	lines.push(`  High: ${result.summary.high}`);
	lines.push(`  Medium: ${result.summary.medium}`);
	lines.push(`  Low: ${result.summary.low}`);
	lines.push("");
	if (result.findings.length === 0) lines.push("No secrets found.");
	else {
		lines.push("Findings:");
		lines.push("-".repeat(60));
		for (const finding of result.findings) {
			lines.push(`[${finding.severity.toUpperCase()}] ${finding.description}`);
			lines.push(`  File: ${finding.file}:${finding.line}`);
			lines.push(`  Rule: ${finding.id}`);
			lines.push(`  Secret: ${finding.secret}`);
			lines.push(`  Commit: ${finding.commit}`);
			lines.push(`  CWEs: ${finding.cwes.join(", ")}`);
			lines.push("");
		}
	}
	return lines.join("\n");
}
async function main() {
	const args = process.argv.slice(2);
	const options = parseArgs(args);
	if (options.check) {
		const installed = checkGitleaksInstalled();
		if (installed) {
			console.log(`Gitleaks is installed: ${getGitleaksVersion()}`);
			process.exit(0);
		} else {
			console.error("Gitleaks is not installed.");
			console.error("Install with: brew install gitleaks");
			process.exit(2);
		}
	}
	if (!checkGitleaksInstalled()) {
		console.error("Error: Gitleaks is not installed.");
		console.error("");
		console.error("Install gitleaks:");
		console.error("  macOS:  brew install gitleaks");
		console.error("  Go:     go install github.com/gitleaks/gitleaks/v8@latest");
		console.error("  Docker: docker pull zricethezav/gitleaks");
		process.exit(2);
	}
	if (!existsSync(options.path)) {
		console.error(`Error: Path not found: ${options.path}`);
		process.exit(2);
	}
	try {
		if (options.verbose) console.error(`Scanning ${options.path} for secrets...`);
		const gitleaksFindings = await runGitleaks(options.path);
		const findings = transformFindings(gitleaksFindings);
		const result = {
			tool: "gitleaks",
			version: getGitleaksVersion(),
			scanPath: options.path,
			scanDate: new Date().toISOString(),
			findings,
			summary: calculateSummary(findings)
		};
		if (options.json) console.log(JSON.stringify(result, null, 2));
		else console.log(formatTextOutput(result));
		if (result.summary.total > 0) process.exit(1);
	} catch (err) {
		console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
		process.exit(2);
	}
}
main();

//#endregion