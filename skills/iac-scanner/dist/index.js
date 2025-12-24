#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

//#region src/index.ts
function checkTfsecInstalled() {
	try {
		const result = spawnSync("tfsec", ["--version"], {
			encoding: "utf-8",
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		});
		return result.status === 0;
	} catch {
		return false;
	}
}
function checkCheckovInstalled() {
	try {
		const result = spawnSync("checkov", ["--version"], {
			encoding: "utf-8",
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		});
		return result.status === 0;
	} catch {
		return false;
	}
}
function getTfsecVersion() {
	try {
		const result = spawnSync("tfsec", ["--version"], {
			encoding: "utf-8",
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		});
		return result.stdout?.trim() || "unknown";
	} catch {
		return "unknown";
	}
}
function getCheckovVersion() {
	try {
		const result = spawnSync("checkov", ["--version"], {
			encoding: "utf-8",
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		});
		return result.stdout?.trim() || "unknown";
	} catch {
		return "unknown";
	}
}
function detectScanner(targetPath) {
	const hasTerraform = existsSync(join(targetPath, "main.tf")) || existsSync(join(targetPath, "terraform.tf"));
	const hasCloudFormation = existsSync(join(targetPath, "template.yaml")) || existsSync(join(targetPath, "template.json"));
	const hasKubernetes = existsSync(join(targetPath, "deployment.yaml")) || existsSync(join(targetPath, "k8s"));
	if (hasTerraform && !hasCloudFormation && !hasKubernetes) {
		if (checkTfsecInstalled()) return "tfsec";
	}
	if (checkCheckovInstalled()) return "checkov";
	if (checkTfsecInstalled()) return "tfsec";
	return null;
}
function mapTfsecSeverity(severity) {
	switch (severity.toUpperCase()) {
		case "CRITICAL": return "critical";
		case "HIGH": return "high";
		case "MEDIUM": return "medium";
		case "LOW": return "low";
		default: return "info";
	}
}
function mapCheckovSeverity(checkId) {
	if (checkId.includes("CRITICAL")) return "critical";
	if (checkId.includes("encryption") || checkId.includes("public") || checkId.includes("secret")) return "high";
	if (checkId.includes("logging") || checkId.includes("backup")) return "medium";
	return "medium";
}
async function runTfsec(targetPath, verbose) {
	return new Promise((resolve, reject) => {
		const args = [
			"--format",
			"json",
			targetPath
		];
		if (verbose) console.error(`Running: tfsec ${args.join(" ")}`);
		const proc = spawn("tfsec", args, { stdio: [
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
			try {
				const result = JSON.parse(stdout);
				resolve(result);
			} catch (e) {
				reject(new Error(`Failed to parse tfsec output: ${e}\n${stderr}`));
			}
		});
		proc.on("error", (err) => {
			reject(new Error(`Failed to spawn tfsec: ${err.message}`));
		});
	});
}
async function runCheckov(targetPath, framework, verbose) {
	return new Promise((resolve, reject) => {
		const args = [
			"-d",
			targetPath,
			"-o",
			"json",
			"--compact"
		];
		if (framework) args.push("--framework", framework);
		if (verbose) console.error(`Running: checkov ${args.join(" ")}`);
		const proc = spawn("checkov", args, { stdio: [
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
			try {
				if (stdout.trim()) {
					const parsed = JSON.parse(stdout);
					const results = Array.isArray(parsed) ? parsed : [parsed];
					resolve(results);
				} else resolve([]);
			} catch (e) {
				reject(new Error(`Failed to parse checkov output: ${e}\n${stderr}`));
			}
		});
		proc.on("error", (err) => {
			reject(new Error(`Failed to spawn checkov: ${err.message}`));
		});
	});
}
function transformTfsecResult(tfsecResult, scanPath) {
	const findings = (tfsecResult.results || []).map((f) => ({
		id: f.long_id || f.rule_id,
		severity: mapTfsecSeverity(f.severity),
		message: f.description || f.rule_description,
		resource: f.resource,
		file: f.location.filename,
		line: f.location.start_line,
		endLine: f.location.end_line,
		resolution: f.resolution,
		impact: f.impact,
		references: f.links || []
	}));
	return {
		tool: "tfsec",
		version: getTfsecVersion(),
		scanPath,
		scanDate: new Date().toISOString(),
		framework: "terraform",
		findings,
		summary: {
			total: findings.length,
			critical: findings.filter((f) => f.severity === "critical").length,
			high: findings.filter((f) => f.severity === "high").length,
			medium: findings.filter((f) => f.severity === "medium").length,
			low: findings.filter((f) => f.severity === "low").length,
			info: findings.filter((f) => f.severity === "info").length
		}
	};
}
function transformCheckovResult(checkovResults, scanPath) {
	const findings = [];
	let totalPassed = 0;
	let totalSkipped = 0;
	for (const result of checkovResults) {
		totalPassed += result.summary.passed;
		totalSkipped += result.summary.skipped;
		for (const check of result.results.failed_checks) findings.push({
			id: check.check_id,
			severity: mapCheckovSeverity(check.check_id),
			message: check.check_name,
			resource: check.resource,
			file: check.file_path,
			line: check.file_line_range[0],
			endLine: check.file_line_range[1],
			resolution: check.guideline,
			references: check.guideline ? [check.guideline] : []
		});
	}
	return {
		tool: "checkov",
		version: getCheckovVersion(),
		scanPath,
		scanDate: new Date().toISOString(),
		findings,
		summary: {
			total: findings.length,
			critical: findings.filter((f) => f.severity === "critical").length,
			high: findings.filter((f) => f.severity === "high").length,
			medium: findings.filter((f) => f.severity === "medium").length,
			low: findings.filter((f) => f.severity === "low").length,
			info: findings.filter((f) => f.severity === "info").length,
			passed: totalPassed,
			skipped: totalSkipped
		}
	};
}
function printTextReport(result) {
	console.log("\n=== IaC Security Scan Report ===\n");
	console.log(`Tool: ${result.tool} (${result.version})`);
	console.log(`Scan Path: ${result.scanPath}`);
	if (result.framework) console.log(`Framework: ${result.framework}`);
	console.log(`Date: ${result.scanDate}`);
	console.log("\n--- Summary ---");
	console.log(`Total Issues: ${result.summary.total}`);
	console.log(`  Critical: ${result.summary.critical}`);
	console.log(`  High: ${result.summary.high}`);
	console.log(`  Medium: ${result.summary.medium}`);
	console.log(`  Low: ${result.summary.low}`);
	console.log(`  Info: ${result.summary.info}`);
	if (result.summary.passed !== void 0) console.log(`  Passed: ${result.summary.passed}`);
	if (result.findings.length > 0) {
		console.log("\n--- Misconfigurations ---\n");
		const severityOrder = {
			critical: 0,
			high: 1,
			medium: 2,
			low: 3,
			info: 4
		};
		const sorted = [...result.findings].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
		for (const finding of sorted) {
			console.log(`[${finding.severity.toUpperCase()}] ${finding.id}`);
			console.log(`  Resource: ${finding.resource}`);
			console.log(`  File: ${finding.file}:${finding.line}`);
			console.log(`  Issue: ${finding.message}`);
			if (finding.resolution) console.log(`  Resolution: ${finding.resolution}`);
			console.log("");
		}
	} else console.log("\nNo misconfigurations found.");
}
function printHelp() {
	console.log(`
iac-scanner - Infrastructure as Code Security Scanner

Usage:
  iac-scanner <path> [options]
  iac-scanner --check

Options:
  --scanner, -s <type>   Scanner: auto, tfsec, checkov (default: auto)
  --framework, -f <type> Framework: terraform, kubernetes, cloudformation
  --json, -j             Output as JSON
  --verbose, -v          Verbose output
  --check                Check available scanners
  --help, -h             Show this help

Examples:
  iac-scanner .                          # Auto-detect scanner
  iac-scanner . --scanner tfsec          # Use tfsec
  iac-scanner . --scanner checkov        # Use checkov
  iac-scanner . --framework kubernetes   # Scan Kubernetes manifests
  iac-scanner . --json                   # JSON output
`);
}
async function main() {
	const { values, positionals } = parseArgs({
		allowPositionals: true,
		options: {
			scanner: {
				type: "string",
				short: "s",
				default: "auto"
			},
			framework: {
				type: "string",
				short: "f"
			},
			json: {
				type: "boolean",
				short: "j",
				default: false
			},
			verbose: {
				type: "boolean",
				short: "v",
				default: false
			},
			check: {
				type: "boolean",
				default: false
			},
			help: {
				type: "boolean",
				short: "h",
				default: false
			}
		}
	});
	if (values.help) {
		printHelp();
		process.exit(0);
	}
	if (values.check) {
		console.log("Available scanners:");
		console.log(`  tfsec: ${checkTfsecInstalled() ? "installed" : "not found"}`);
		console.log(`  checkov: ${checkCheckovInstalled() ? "installed" : "not found"}`);
		if (!checkTfsecInstalled() && !checkCheckovInstalled()) {
			console.error("\nNo scanners available. Install one of:");
			console.error("  tfsec: brew install tfsec");
			console.error("  checkov: pip install checkov");
			process.exit(2);
		}
		process.exit(0);
	}
	const targetPath = positionals[0] || ".";
	const options = {
		path: targetPath,
		scanner: values.scanner || "auto",
		framework: values.framework,
		json: values.json || false,
		check: values.check || false,
		verbose: values.verbose || false
	};
	let scanner = null;
	if (options.scanner === "auto") {
		scanner = detectScanner(targetPath);
		if (!scanner) {
			console.error("Error: No suitable scanner found.");
			console.error("Run 'iac-scanner --check' to see available scanners.");
			process.exit(2);
		}
	} else if (options.scanner === "tfsec") {
		if (!checkTfsecInstalled()) {
			console.error("Error: tfsec is not installed.");
			console.error("Install with: brew install tfsec");
			process.exit(2);
		}
		scanner = "tfsec";
	} else if (options.scanner === "checkov") {
		if (!checkCheckovInstalled()) {
			console.error("Error: checkov is not installed.");
			console.error("Install with: pip install checkov");
			process.exit(2);
		}
		scanner = "checkov";
	}
	try {
		let result;
		if (scanner === "tfsec") {
			const tfsecResult = await runTfsec(targetPath, options.verbose);
			result = transformTfsecResult(tfsecResult, targetPath);
		} else {
			const checkovResult = await runCheckov(targetPath, options.framework, options.verbose);
			result = transformCheckovResult(checkovResult, targetPath);
		}
		if (options.json) console.log(JSON.stringify(result, null, 2));
		else printTextReport(result);
		if (result.summary.total > 0) process.exit(1);
		process.exit(0);
	} catch (error) {
		console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
		process.exit(2);
	}
}
main();

//#endregion