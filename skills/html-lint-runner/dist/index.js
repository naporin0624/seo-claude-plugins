#!/usr/bin/env node
import { existsSync } from "fs";
import { dirname, extname, resolve } from "path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { pathToFileURL } from "url";
import { readFile } from "fs/promises";
import { MLEngine } from "markuplint";

//#region src/cli.ts
function parseArgs(args) {
	const options = {
		file: "",
		json: true,
		axeOnly: false,
		markuplintOnly: false
	};
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		switch (arg) {
			case "--json":
				options.json = true;
				break;
			case "--text":
				options.json = false;
				break;
			case "--axe-only":
				options.axeOnly = true;
				break;
			case "--markuplint-only":
				options.markuplintOnly = true;
				break;
			case "--help":
			case "-h":
				printHelp();
				process.exit(0);
				break;
			default: if (!arg.startsWith("-")) options.file = arg;
		}
	}
	return options;
}
function printHelp() {
	console.log(`
HTML Lint Runner - Accessibility and HTML standards checking

Usage:
  npx tsx src/index.ts <file> [options]

Options:
  --json            Output as JSON (default)
  --text            Output as human-readable text
  --axe-only        Run only axe-core (accessibility)
  --markuplint-only Run only markuplint (HTML standards)
  --help, -h        Show this help

Examples:
  npx tsx src/index.ts path/to/file.html
  npx tsx src/index.ts path/to/Component.tsx --axe-only
  npx tsx src/index.ts path/to/file.html --text
`);
}

//#endregion
//#region src/axe-checker.ts
async function checkAccessibility(filePath) {
	const results = {
		violations: [],
		passes: [],
		incomplete: []
	};
	const browser = await chromium.launch({ headless: true });
	try {
		const context = await browser.newContext();
		const page = await context.newPage();
		const absolutePath = resolve(filePath);
		const fileUrl = pathToFileURL(absolutePath).href;
		await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
		const axeResults = await new AxeBuilder({ page }).withTags([
			"wcag2a",
			"wcag2aa",
			"wcag21aa"
		]).analyze();
		results.violations = axeResults.violations.map((v) => ({
			id: v.id,
			impact: v.impact,
			description: v.description,
			help: v.help,
			helpUrl: v.helpUrl,
			nodes: v.nodes.map((n) => ({
				html: n.html,
				target: n.target,
				failureSummary: n.failureSummary
			}))
		}));
		results.passes = axeResults.passes.map((p) => ({
			id: p.id,
			description: p.description,
			nodes: p.nodes.map((n) => ({
				html: n.html,
				target: n.target
			}))
		}));
		results.incomplete = axeResults.incomplete.map((i) => ({
			id: i.id,
			impact: i.impact,
			description: i.description,
			help: i.help,
			helpUrl: i.helpUrl,
			nodes: i.nodes.map((n) => ({
				html: n.html,
				target: n.target,
				failureSummary: n.failureSummary
			}))
		}));
	} catch (error) {
		results.error = error instanceof Error ? error.message : String(error);
	} finally {
		await browser.close();
	}
	return results;
}

//#endregion
//#region src/markuplint-runner.ts
async function checkMarkuplint(filePath) {
	const results = { problems: [] };
	try {
		const absolutePath = resolve(filePath);
		const sourceCode = await readFile(absolutePath, "utf-8");
		const ext = extname(filePath).toLowerCase();
		const dirPath = dirname(absolutePath);
		const isJsx = ext === ".jsx" || ext === ".tsx";
		const config = {
			parser: isJsx ? { "\\.[jt]sx$": "@markuplint/jsx-parser" } : void 0,
			specs: isJsx ? { "\\.[jt]sx$": "@markuplint/react-spec" } : void 0,
			rules: {
				"required-attr": true,
				"deprecated-element": true,
				"character-reference": true,
				"no-refer-to-non-existent-id": true,
				"attr-duplication": true,
				"id-duplication": true
			}
		};
		const engine = await MLEngine.fromCode(sourceCode, {
			name: filePath,
			dirname: dirPath,
			config
		});
		const runAnalysis = engine["exec"].bind(engine);
		const lintResult = await runAnalysis();
		await engine.close();
		if (lintResult && lintResult.violations) results.problems = lintResult.violations.map((v) => ({
			severity: v.severity === "error" ? "error" : "warning",
			ruleId: v.ruleId,
			message: v.message,
			line: v.line,
			col: v.col,
			raw: v.raw
		}));
	} catch (error) {
		console.error(`Markuplint error: ${error instanceof Error ? error.message : error}`);
	}
	return results;
}

//#endregion
//#region src/reporter.ts
function printJsonResults(results) {
	console.log(JSON.stringify(results, null, 2));
}
function printTextResults(results) {
	console.log(`
# HTML Lint Report: ${results.file}
**Timestamp**: ${results.timestamp}

## Summary
- axe-core violations: ${results.summary.axe_violations}
- markuplint problems: ${results.summary.markuplint_problems}
- Total issues: ${results.summary.total_issues}
`);
	if (results.axe.violations.length > 0) {
		console.log(`## Accessibility Violations (axe-core)\n`);
		results.axe.violations.forEach((v, index) => {
			console.log(`### ${index + 1}. ${v.id} [${v.impact.toUpperCase()}]`);
			console.log(`**Description**: ${v.description}`);
			console.log(`**Help**: ${v.help}`);
			console.log(`**Reference**: ${v.helpUrl}`);
			console.log(`\n**Affected Elements**:`);
			v.nodes.forEach((n) => {
				console.log(`- \`${n.html.substring(0, 80)}${n.html.length > 80 ? "..." : ""}\``);
				if (n.failureSummary) console.log(`  Fix: ${n.failureSummary.split("\n")[0]}`);
			});
			console.log("");
		});
	}
	if (results.markuplint.problems.length > 0) {
		console.log(`## HTML Standards Problems (markuplint)\n`);
		results.markuplint.problems.forEach((p, index) => {
			console.log(`### ${index + 1}. ${p.ruleId} [${p.severity.toUpperCase()}] (Line ${p.line}:${p.col})`);
			console.log(`**Message**: ${p.message}`);
			console.log(`**Code**: \`${p.raw.substring(0, 60)}${p.raw.length > 60 ? "..." : ""}\``);
			console.log("");
		});
	}
	if (results.summary.total_issues === 0) {
		console.log(`## All Checks Passed\n`);
		console.log(`No accessibility violations or HTML standard problems found.`);
	}
	if (results.axe.error) {
		console.log(`\n## Errors\n`);
		console.log(`axe-core error: ${results.axe.error}`);
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
	if (!options.file) {
		console.error("Error: File path is required");
		process.exit(1);
	}
	if (!existsSync(options.file)) {
		console.error(`Error: File not found: ${options.file}`);
		process.exit(1);
	}
	const ext = extname(options.file).toLowerCase();
	const isHtml = ext === ".html" || ext === ".htm";
	const isJsx = ext === ".jsx" || ext === ".tsx";
	if (!isHtml && !isJsx) {
		console.error(`Error: Unsupported file type: ${ext}`);
		console.error("Supported: .html, .htm, .jsx, .tsx");
		process.exit(1);
	}
	let axeResults = {
		violations: [],
		passes: [],
		incomplete: []
	};
	let markuplintResults = { problems: [] };
	if (!options.markuplintOnly) if (isHtml) axeResults = await checkAccessibility(options.file);
	else axeResults.error = "axe-core skipped for JSX/TSX (requires rendered HTML)";
	if (!options.axeOnly) markuplintResults = await checkMarkuplint(options.file);
	const results = {
		file: options.file,
		timestamp: new Date().toISOString(),
		axe: axeResults,
		markuplint: markuplintResults,
		summary: {
			axe_violations: axeResults.violations.length,
			markuplint_problems: markuplintResults.problems.length,
			total_issues: axeResults.violations.length + markuplintResults.problems.length
		}
	};
	if (options.json) printJsonResults(results);
	else printTextResults(results);
	if (results.summary.total_issues > 0) process.exit(1);
}
main().catch((error) => {
	console.error(`Error: ${error instanceof Error ? error.message : error}`);
	process.exit(1);
});

//#endregion
//# sourceMappingURL=index.js.map