#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

//#region src/index.ts
function checkNpmInstalled() {
	try {
		const result = spawnSync("npm", ["--version"], {
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
function checkTrivyInstalled() {
	try {
		const result = spawnSync("trivy", ["--version"], {
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
function getTrivyVersion() {
	try {
		const result = spawnSync("trivy", ["--version"], {
			encoding: "utf-8",
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		});
		const match = result.stdout?.match(/Version:\s*(\S+)/);
		return match?.[1] || "unknown";
	} catch {
		return "unknown";
	}
}
function getNpmVersion() {
	try {
		const result = spawnSync("npm", ["--version"], {
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
	if (checkTrivyInstalled()) return "trivy";
	const hasPackageLock = existsSync(join(targetPath, "package-lock.json")) || existsSync(targetPath) && targetPath.endsWith("package-lock.json");
	if (hasPackageLock && checkNpmInstalled()) return "npm";
	return null;
}
function mapNpmSeverity(severity) {
	switch (severity.toLowerCase()) {
		case "critical": return "critical";
		case "high": return "high";
		case "moderate": return "medium";
		case "low": return "low";
		default: return "info";
	}
}
function mapTrivySeverity(severity) {
	switch (severity.toUpperCase()) {
		case "CRITICAL": return "critical";
		case "HIGH": return "high";
		case "MEDIUM": return "medium";
		case "LOW": return "low";
		default: return "info";
	}
}
function transformNpmResult(npmResult, scanPath) {
	const findings = [];
	for (const [pkgName, vuln] of Object.entries(npmResult.vulnerabilities)) {
		const details = vuln.via.filter((v) => typeof v !== "string");
		for (const detail of details) findings.push({
			id: detail.url?.split("/").pop() || `npm-${detail.source}`,
			severity: mapNpmSeverity(detail.severity),
			package: pkgName,
			installedVersion: vuln.range,
			fixedVersion: typeof vuln.fixAvailable === "object" ? vuln.fixAvailable.version : void 0,
			title: detail.title,
			description: void 0,
			cvss: detail.cvss?.score,
			cwes: detail.cwe || [],
			references: detail.url ? [detail.url] : []
		});
		if (details.length === 0) findings.push({
			id: `npm-${pkgName}`,
			severity: mapNpmSeverity(vuln.severity),
			package: pkgName,
			installedVersion: vuln.range,
			fixedVersion: typeof vuln.fixAvailable === "object" ? vuln.fixAvailable.version : void 0,
			title: `Vulnerability in ${pkgName}`,
			cwes: [],
			references: []
		});
	}
	const meta = npmResult.metadata.vulnerabilities;
	return {
		tool: "npm-audit",
		version: getNpmVersion(),
		scanPath,
		scanDate: new Date().toISOString(),
		findings,
		summary: {
			total: meta.total,
			critical: meta.critical,
			high: meta.high,
			medium: meta.moderate,
			low: meta.low,
			info: meta.info
		}
	};
}
function transformTrivyResult(trivyResult, scanPath) {
	const findings = [];
	for (const target of trivyResult.Results || []) for (const vuln of target.Vulnerabilities || []) {
		let cvss;
		if (vuln.CVSS) {
			for (const source of Object.values(vuln.CVSS)) if (source.V3Score) {
				cvss = source.V3Score;
				break;
			}
		}
		findings.push({
			id: vuln.VulnerabilityID,
			severity: mapTrivySeverity(vuln.Severity),
			package: vuln.PkgName,
			installedVersion: vuln.InstalledVersion,
			fixedVersion: vuln.FixedVersion,
			title: vuln.Title || vuln.VulnerabilityID,
			description: vuln.Description,
			cvss,
			cwes: vuln.CweIDs || [],
			references: vuln.References || []
		});
	}
	const summary = {
		total: findings.length,
		critical: findings.filter((f) => f.severity === "critical").length,
		high: findings.filter((f) => f.severity === "high").length,
		medium: findings.filter((f) => f.severity === "medium").length,
		low: findings.filter((f) => f.severity === "low").length,
		info: findings.filter((f) => f.severity === "info").length
	};
	return {
		tool: "trivy",
		version: getTrivyVersion(),
		scanPath,
		scanDate: new Date().toISOString(),
		findings,
		summary
	};
}
async function runNpmAudit(targetPath, verbose) {
	return new Promise((resolve, reject) => {
		const args = ["audit", "--json"];
		if (verbose) console.error(`Running: npm ${args.join(" ")} in ${targetPath}`);
		const proc = spawn("npm", args, {
			cwd: targetPath,
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		});
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
				reject(new Error(`Failed to parse npm audit output: ${e}\n${stderr}`));
			}
		});
		proc.on("error", (err) => {
			reject(new Error(`Failed to spawn npm: ${err.message}`));
		});
	});
}
async function runTrivy(targetPath, verbose) {
	return new Promise((resolve, reject) => {
		const args = [
			"fs",
			"--format",
			"json",
			"--scanners",
			"vuln",
			targetPath
		];
		if (verbose) console.error(`Running: trivy ${args.join(" ")}`);
		const proc = spawn("trivy", args, { stdio: [
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
			if (code === 0) try {
				const result = JSON.parse(stdout);
				resolve(result);
			} catch (e) {
				reject(new Error(`Failed to parse trivy output: ${e}`));
			}
			else reject(new Error(`Trivy exited with code ${code}: ${stderr}`));
		});
		proc.on("error", (err) => {
			reject(new Error(`Failed to spawn trivy: ${err.message}`));
		});
	});
}
function printTextReport(result) {
	console.log("\n=== SCA Scan Report ===\n");
	console.log(`Tool: ${result.tool} (${result.version})`);
	console.log(`Scan Path: ${result.scanPath}`);
	console.log(`Date: ${result.scanDate}`);
	console.log("\n--- Summary ---");
	console.log(`Total: ${result.summary.total}`);
	console.log(`  Critical: ${result.summary.critical}`);
	console.log(`  High: ${result.summary.high}`);
	console.log(`  Medium: ${result.summary.medium}`);
	console.log(`  Low: ${result.summary.low}`);
	console.log(`  Info: ${result.summary.info}`);
	if (result.findings.length > 0) {
		console.log("\n--- Vulnerabilities ---\n");
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
			console.log(`  Package: ${finding.package}@${finding.installedVersion}`);
			if (finding.fixedVersion) console.log(`  Fixed in: ${finding.fixedVersion}`);
			console.log(`  Title: ${finding.title}`);
			if (finding.cvss) console.log(`  CVSS: ${finding.cvss}`);
			if (finding.cwes.length > 0) console.log(`  CWEs: ${finding.cwes.join(", ")}`);
			console.log("");
		}
	} else console.log("\nNo vulnerabilities found.");
}
function printHelp() {
	console.log(`
sca-runner - Software Composition Analysis

Usage:
  sca-runner <path> [options]
  sca-runner --check

Options:
  --scanner, -s <type>  Scanner to use: auto, npm, trivy (default: auto)
  --json, -j            Output as JSON
  --check               Check available scanners
  --verbose, -v         Verbose output
  --help, -h            Show this help

Examples:
  sca-runner .                    # Scan current directory
  sca-runner . --scanner npm      # Force npm audit
  sca-runner . --scanner trivy    # Force trivy
  sca-runner . --json             # JSON output
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
			json: {
				type: "boolean",
				short: "j",
				default: false
			},
			check: {
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
	if (values.check) {
		console.log("Available scanners:");
		console.log(`  npm audit: ${checkNpmInstalled() ? "installed" : "not found"}`);
		console.log(`  trivy: ${checkTrivyInstalled() ? "installed" : "not found"}`);
		if (!checkNpmInstalled() && !checkTrivyInstalled()) {
			console.error("\nNo scanners available. Install one of:");
			console.error("  npm (built-in with Node.js)");
			console.error("  trivy: brew install trivy");
			process.exit(2);
		}
		process.exit(0);
	}
	const targetPath = positionals[0] || ".";
	const options = {
		path: targetPath,
		scanner: values.scanner || "auto",
		json: values.json || false,
		check: values.check || false,
		verbose: values.verbose || false
	};
	let scanner = null;
	if (options.scanner === "auto") {
		scanner = detectScanner(targetPath);
		if (!scanner) {
			console.error("Error: No suitable scanner found.");
			console.error("Run 'sca-runner --check' to see available scanners.");
			process.exit(2);
		}
	} else if (options.scanner === "npm") {
		if (!checkNpmInstalled()) {
			console.error("Error: npm is not installed.");
			process.exit(2);
		}
		scanner = "npm";
	} else if (options.scanner === "trivy") {
		if (!checkTrivyInstalled()) {
			console.error("Error: trivy is not installed.");
			console.error("Install with: brew install trivy");
			process.exit(2);
		}
		scanner = "trivy";
	}
	try {
		let result;
		if (scanner === "npm") {
			const npmResult = await runNpmAudit(targetPath, options.verbose);
			result = transformNpmResult(npmResult, targetPath);
		} else {
			const trivyResult = await runTrivy(targetPath, options.verbose);
			result = transformTrivyResult(trivyResult, targetPath);
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