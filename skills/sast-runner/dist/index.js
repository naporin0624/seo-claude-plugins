#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { parseArgs } from "node:util";

//#region src/types.ts
const CONFIGS = {
	auto: "auto",
	"security-audit": "p/security-audit",
	"owasp-top-ten": "p/owasp-top-ten",
	"cwe-top-25": "p/cwe-top-25",
	default: "p/default",
	javascript: "p/javascript",
	typescript: "p/typescript",
	python: "p/python",
	golang: "p/golang",
	java: "p/java",
	ruby: "p/ruby"
};

//#endregion
//#region src/index.ts
function checkSemgrepInstalled() {
	try {
		const result = spawnSync("semgrep", ["--version"], {
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
function getSemgrepVersion() {
	try {
		const result = spawnSync("semgrep", ["--version"], {
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
function mapSeverity(semgrepSeverity) {
	const severity = semgrepSeverity.toUpperCase();
	switch (severity) {
		case "ERROR": return "high";
		case "WARNING": return "medium";
		case "INFO": return "low";
		default: return "info";
	}
}
function transformFinding(finding) {
	const metadata = finding.extra.metadata || {};
	let severity = mapSeverity(finding.extra.severity);
	const criticalCWEs = [
		"CWE-89",
		"CWE-78",
		"CWE-94",
		"CWE-502"
	];
	if (metadata.cwe?.some((cwe) => criticalCWEs.includes(cwe))) severity = "critical";
	return {
		id: finding.check_id,
		severity,
		message: finding.extra.message,
		file: finding.path,
		line: finding.start.line,
		endLine: finding.end.line,
		code: finding.extra.lines,
		cwes: metadata.cwe || [],
		owasp: metadata.owasp || [],
		category: metadata.category || "security",
		fix: finding.extra.fix,
		references: metadata.references || []
	};
}
function transformResults(semgrepResult, scanPath, config) {
	const findings = semgrepResult.results.map(transformFinding);
	const summary = {
		total: findings.length,
		critical: findings.filter((f) => f.severity === "critical").length,
		high: findings.filter((f) => f.severity === "high").length,
		medium: findings.filter((f) => f.severity === "medium").length,
		low: findings.filter((f) => f.severity === "low").length,
		info: findings.filter((f) => f.severity === "info").length
	};
	return {
		tool: "semgrep",
		version: semgrepResult.version || getSemgrepVersion(),
		scanPath,
		scanDate: new Date().toISOString(),
		config,
		findings,
		summary
	};
}
async function runSemgrep(targetPath, config, verbose) {
	return new Promise((resolve, reject) => {
		const args = [
			"scan",
			"--config",
			config,
			"--json",
			targetPath
		];
		if (verbose) console.error(`Running: semgrep ${args.join(" ")}`);
		const proc = spawn("semgrep", args, { stdio: [
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
			if (code === 0 || code === 1) try {
				const result = JSON.parse(stdout);
				resolve(result);
			} catch (e) {
				reject(new Error(`Failed to parse semgrep output: ${e}`));
			}
			else reject(new Error(`Semgrep exited with code ${code}: ${stderr || stdout}`));
		});
		proc.on("error", (err) => {
			reject(new Error(`Failed to spawn semgrep: ${err.message}`));
		});
	});
}
function printTextReport(result) {
	console.log("\n=== SAST Scan Report ===\n");
	console.log(`Tool: ${result.tool} (${result.version})`);
	console.log(`Scan Path: ${result.scanPath}`);
	console.log(`Config: ${result.config}`);
	console.log(`Date: ${result.scanDate}`);
	console.log("\n--- Summary ---");
	console.log(`Total: ${result.summary.total}`);
	console.log(`  Critical: ${result.summary.critical}`);
	console.log(`  High: ${result.summary.high}`);
	console.log(`  Medium: ${result.summary.medium}`);
	console.log(`  Low: ${result.summary.low}`);
	console.log(`  Info: ${result.summary.info}`);
	if (result.findings.length > 0) {
		console.log("\n--- Findings ---\n");
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
			console.log(`  File: ${finding.file}:${finding.line}`);
			console.log(`  Message: ${finding.message}`);
			if (finding.cwes.length > 0) console.log(`  CWEs: ${finding.cwes.join(", ")}`);
			if (finding.owasp.length > 0) console.log(`  OWASP: ${finding.owasp.join(", ")}`);
			if (finding.fix) console.log(`  Fix: ${finding.fix}`);
			console.log(`  Code: ${finding.code.trim()}`);
			console.log("");
		}
	} else console.log("\nNo security issues found.");
}
function printListConfigs() {
	console.log("\nAvailable configurations:\n");
	for (const [name, value] of Object.entries(CONFIGS)) console.log(`  ${name.padEnd(20)} -> ${value}`);
	console.log("\nUsage: sast-runner <path> --config <config-name>");
	console.log("Example: sast-runner . --config security-audit");
}
function printHelp() {
	console.log(`
sast-runner - Static Application Security Testing with Semgrep

Usage:
  sast-runner <path> [options]
  sast-runner --check
  sast-runner --list-configs

Options:
  --config, -c <name>   Configuration to use (default: auto)
  --json, -j            Output as JSON
  --check               Check if semgrep is installed
  --list-configs        List available configurations
  --verbose, -v         Verbose output
  --help, -h            Show this help

Examples:
  sast-runner .                          # Scan current directory
  sast-runner src/ --config security-audit
  sast-runner . --json                   # JSON output
  sast-runner --check                    # Check installation
`);
}
async function main() {
	const { values, positionals } = parseArgs({
		allowPositionals: true,
		options: {
			config: {
				type: "string",
				short: "c",
				default: "auto"
			},
			json: {
				type: "boolean",
				short: "j",
				default: false
			},
			check: {
				type: "boolean",
				default: false
			},
			"list-configs": {
				type: "boolean",
				default: false
			},
			verbose: {
				type: "boolean",
				short: "v",
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
	if (values["list-configs"]) {
		printListConfigs();
		process.exit(0);
	}
	if (values.check) if (checkSemgrepInstalled()) {
		const version = getSemgrepVersion();
		console.log(`Semgrep is installed (version: ${version})`);
		process.exit(0);
	} else {
		console.error("Semgrep is not installed.");
		console.error("\nInstall with:");
		console.error("  pip install semgrep");
		console.error("  brew install semgrep");
		console.error("  docker pull semgrep/semgrep");
		process.exit(2);
	}
	const targetPath = positionals[0];
	if (!targetPath) {
		console.error("Error: No target path specified.");
		console.error("Usage: sast-runner <path> [options]");
		process.exit(2);
	}
	if (!checkSemgrepInstalled()) {
		console.error("Error: Semgrep is not installed.");
		console.error("Run 'sast-runner --check' for installation instructions.");
		process.exit(2);
	}
	const configName = values.config || "auto";
	const configValue = CONFIGS[configName] || configName;
	const options = {
		path: targetPath,
		config: configValue,
		json: values.json || false,
		check: values.check || false,
		listConfigs: values["list-configs"] || false,
		verbose: values.verbose || false
	};
	try {
		const semgrepResult = await runSemgrep(options.path, options.config, options.verbose);
		const result = transformResults(semgrepResult, options.path, configName);
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