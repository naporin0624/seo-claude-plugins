#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { parseArgs } from "node:util";

//#region src/index.ts
function checkHadolintInstalled() {
	try {
		const result = spawnSync("hadolint", ["--version"], {
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
function getHadolintVersion() {
	try {
		const result = spawnSync("hadolint", ["--version"], {
			encoding: "utf-8",
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		});
		const match = result.stdout?.match(/Haskell Dockerfile Linter (\S+)/);
		return match?.[1] || "unknown";
	} catch {
		return "unknown";
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
function mapTrivySeverity(severity) {
	switch (severity.toUpperCase()) {
		case "CRITICAL": return "critical";
		case "HIGH": return "high";
		case "MEDIUM": return "medium";
		case "LOW": return "low";
		default: return "info";
	}
}
async function runHadolint(dockerfile, verbose) {
	return new Promise((resolve, reject) => {
		const args = [
			"-f",
			"json",
			dockerfile
		];
		if (verbose) console.error(`Running: hadolint ${args.join(" ")}`);
		const proc = spawn("hadolint", args, { stdio: [
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
					const result = JSON.parse(stdout);
					resolve(result);
				} else resolve([]);
			} catch (e) {
				reject(new Error(`Failed to parse hadolint output: ${e}\n${stderr}`));
			}
		});
		proc.on("error", (err) => {
			reject(new Error(`Failed to spawn hadolint: ${err.message}`));
		});
	});
}
async function runTrivyImage(image, verbose) {
	return new Promise((resolve, reject) => {
		const args = [
			"image",
			"--format",
			"json",
			"--scanners",
			"vuln",
			image
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
function transformHadolintResult(findings, dockerfile) {
	const transformed = findings.map((f) => ({
		id: f.code,
		severity: f.level,
		line: f.line,
		message: f.message,
		file: f.file
	}));
	return {
		tool: "hadolint",
		version: getHadolintVersion(),
		scanPath: dockerfile,
		scanDate: new Date().toISOString(),
		findings: transformed,
		summary: {
			total: findings.length,
			error: findings.filter((f) => f.level === "error").length,
			warning: findings.filter((f) => f.level === "warning").length,
			info: findings.filter((f) => f.level === "info").length,
			style: findings.filter((f) => f.level === "style").length
		}
	};
}
function transformTrivyImageResult(trivyResult, image) {
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
			layer: vuln.Layer?.DiffID
		});
	}
	return {
		tool: "trivy",
		version: getTrivyVersion(),
		image,
		scanDate: new Date().toISOString(),
		os: trivyResult.Metadata?.OS ? {
			family: trivyResult.Metadata.OS.Family,
			name: trivyResult.Metadata.OS.Name
		} : void 0,
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
function printDockerfileReport(result) {
	console.log("\n=== Dockerfile Lint Report ===\n");
	console.log(`Tool: ${result.tool} (${result.version})`);
	console.log(`File: ${result.scanPath}`);
	console.log(`Date: ${result.scanDate}`);
	console.log("\n--- Summary ---");
	console.log(`Total: ${result.summary.total}`);
	console.log(`  Errors: ${result.summary.error}`);
	console.log(`  Warnings: ${result.summary.warning}`);
	console.log(`  Info: ${result.summary.info}`);
	console.log(`  Style: ${result.summary.style}`);
	if (result.findings.length > 0) {
		console.log("\n--- Issues ---\n");
		const severityOrder = {
			error: 0,
			warning: 1,
			info: 2,
			style: 3
		};
		const sorted = [...result.findings].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
		for (const finding of sorted) {
			console.log(`[${finding.severity.toUpperCase()}] ${finding.id}`);
			console.log(`  Line: ${finding.line}`);
			console.log(`  Message: ${finding.message}`);
			console.log("");
		}
	} else console.log("\nNo issues found.");
}
function printImageReport(result) {
	console.log("\n=== Container Image Scan Report ===\n");
	console.log(`Tool: ${result.tool} (${result.version})`);
	console.log(`Image: ${result.image}`);
	if (result.os) console.log(`OS: ${result.os.family} ${result.os.name}`);
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
			console.log("");
		}
	} else console.log("\nNo vulnerabilities found.");
}
function printHelp() {
	console.log(`
container-scanner - Container and Dockerfile Security Scanner

Usage:
  container-scanner lint <dockerfile> [options]
  container-scanner image <image-name> [options]
  container-scanner --check

Commands:
  lint <dockerfile>    Lint a Dockerfile with Hadolint
  image <image-name>   Scan container image with Trivy

Options:
  --json, -j           Output as JSON
  --verbose, -v        Verbose output
  --check              Check available tools
  --help, -h           Show this help

Examples:
  container-scanner lint Dockerfile
  container-scanner lint Dockerfile --json
  container-scanner image nginx:latest
  container-scanner image myapp:v1 --json
`);
}
async function main() {
	const { values, positionals } = parseArgs({
		allowPositionals: true,
		options: {
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
		console.log("Available tools:");
		console.log(`  hadolint: ${checkHadolintInstalled() ? "installed" : "not found"}`);
		console.log(`  trivy: ${checkTrivyInstalled() ? "installed" : "not found"}`);
		if (!checkHadolintInstalled()) console.error("\nInstall hadolint: brew install hadolint");
		if (!checkTrivyInstalled()) console.error("Install trivy: brew install trivy");
		process.exit(0);
	}
	const command = positionals[0];
	const target = positionals[1];
	if (!command || !["lint", "image"].includes(command)) {
		console.error("Error: Please specify a command (lint or image)");
		printHelp();
		process.exit(2);
	}
	if (!target) {
		console.error(`Error: Please specify a target for '${command}' command`);
		process.exit(2);
	}
	try {
		if (command === "lint") {
			if (!checkHadolintInstalled()) {
				console.error("Error: hadolint is not installed.");
				console.error("Install with: brew install hadolint");
				process.exit(2);
			}
			const findings = await runHadolint(target, values.verbose || false);
			const result = transformHadolintResult(findings, target);
			if (values.json) console.log(JSON.stringify(result, null, 2));
			else printDockerfileReport(result);
			if (result.summary.total > 0) process.exit(1);
		} else if (command === "image") {
			if (!checkTrivyInstalled()) {
				console.error("Error: trivy is not installed.");
				console.error("Install with: brew install trivy");
				process.exit(2);
			}
			const trivyResult = await runTrivyImage(target, values.verbose || false);
			const result = transformTrivyImageResult(trivyResult, target);
			if (values.json) console.log(JSON.stringify(result, null, 2));
			else printImageReport(result);
			if (result.summary.total > 0) process.exit(1);
		}
		process.exit(0);
	} catch (error) {
		console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
		process.exit(2);
	}
}
main();

//#endregion