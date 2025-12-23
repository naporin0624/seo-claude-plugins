#!/usr/bin/env node

/**
 * Web Resource Analyzer
 * Main entry point for validating web resource files
 */

import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import {
  SitemapValidator,
  createNotFoundReport as sitemapNotFound,
} from "./check-sitemap.js";
import {
  RobotsValidator,
  createNotFoundReport as robotsNotFound,
} from "./check-robots.js";
import {
  SecurityTxtValidator,
  createNotFoundReport as securityNotFound,
} from "./check-security-txt.js";
import {
  LlmsTxtValidator,
  createNotFoundReport as llmsNotFound,
} from "./check-llms-txt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// File configurations
const FILES = {
  sitemap: {
    paths: ["sitemap.xml", "sitemap_index.xml"],
    validator: SitemapValidator,
    notFound: sitemapNotFound,
    async: true,
  },
  robots: {
    paths: ["robots.txt"],
    validator: RobotsValidator,
    notFound: robotsNotFound,
    async: false,
  },
  security: {
    paths: [".well-known/security.txt", "security.txt"],
    validator: SecurityTxtValidator,
    notFound: securityNotFound,
    async: false,
  },
  llms: {
    paths: ["llms.txt"],
    validator: LlmsTxtValidator,
    notFound: llmsNotFound,
    async: false,
    args: [false], // isFullVersion = false
  },
  "llms-full": {
    paths: ["llms-full.txt"],
    validator: LlmsTxtValidator,
    notFound: (source) => llmsNotFound(source, true),
    async: false,
    args: [true], // isFullVersion = true
  },
};

/**
 * Main analyzer class
 */
class WebResourceAnalyzer {
  constructor(target, options = {}) {
    this.target = target;
    this.isUrl = target.startsWith("http://") || target.startsWith("https://");
    this.options = {
      json: options.json || false,
      only: options.only || null, // comma-separated list of files to check
      timeout: options.timeout || 10000,
    };
    this.results = {};
  }

  async analyze() {
    const filesToCheck = this.getFilesToCheck();
    const timestamp = new Date().toISOString();

    for (const fileKey of filesToCheck) {
      const config = FILES[fileKey];
      if (!config) continue;

      try {
        const result = await this.checkFile(fileKey, config);
        this.results[fileKey] = result;
      } catch (error) {
        this.results[fileKey] = {
          file: fileKey,
          source: this.target,
          found: false,
          valid: false,
          error: error.message,
          summary: { critical: 1, important: 0, recommended: 0, passed: 0 },
          issues: [
            {
              severity: "critical",
              check: "error",
              message: `Error checking file: ${error.message}`,
              fix: "Check if the target is accessible",
            },
          ],
          passed: [],
        };
      }
    }

    return this.generateReport(timestamp);
  }

  getFilesToCheck() {
    if (this.options.only) {
      return this.options.only.split(",").map((f) => f.trim().toLowerCase());
    }
    return Object.keys(FILES);
  }

  async checkFile(fileKey, config) {
    let content = null;
    let source = "";

    if (this.isUrl) {
      // Try each possible path
      for (const path of config.paths) {
        const url = new URL(path, this.target).href;
        source = url;
        try {
          const response = await fetch(url, {
            signal: AbortSignal.timeout(this.options.timeout),
            headers: {
              "User-Agent": "WebResourceChecker/1.0",
            },
          });
          if (response.ok) {
            content = await response.text();
            break;
          }
        } catch {
          // Try next path
        }
      }
    } else {
      // Local file/directory
      const basePath = resolve(this.target);
      for (const path of config.paths) {
        const fullPath = join(basePath, path);
        source = fullPath;
        if (existsSync(fullPath)) {
          try {
            content = readFileSync(fullPath, "utf8");
            break;
          } catch {
            // Try next path
          }
        }
      }
    }

    // If no content found, return not found report
    if (content === null) {
      return config.notFound(source);
    }

    // Validate content
    const args = config.args || [];
    const validator = new config.validator(content, source, ...args);

    if (config.async) {
      return await validator.validate();
    }
    return validator.validate();
  }

  generateReport(timestamp) {
    const files = Object.values(this.results);
    const summary = {
      target: this.target,
      timestamp,
      totalFiles: files.length,
      found: files.filter((f) => f.found).length,
      valid: files.filter((f) => f.valid).length,
      issues: {
        critical: files.reduce((sum, f) => sum + (f.summary?.critical || 0), 0),
        important: files.reduce(
          (sum, f) => sum + (f.summary?.important || 0),
          0
        ),
        recommended: files.reduce(
          (sum, f) => sum + (f.summary?.recommended || 0),
          0
        ),
      },
    };

    return {
      summary,
      files: this.results,
    };
  }
}

/**
 * Format report as text
 */
function formatTextReport(report) {
  const lines = [];
  lines.push("# Web Resource Audit Report");
  lines.push("");
  lines.push(`## Target: ${report.summary.target}`);
  lines.push(`Analyzed at: ${report.summary.timestamp}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // Files summary table
  lines.push("## Files Found");
  lines.push("");
  lines.push("| File | Status | Issues |");
  lines.push("|------|--------|--------|");

  for (const [key, file] of Object.entries(report.files)) {
    const status = file.found ? "Found" : "Not Found";
    const issueCount = file.found
      ? `${file.summary.critical + file.summary.important + file.summary.recommended}`
      : "-";
    lines.push(`| ${file.file} | ${status} | ${issueCount} |`);
  }

  lines.push("");
  lines.push("---");
  lines.push("");

  // Issues by file
  lines.push("## Issues");
  lines.push("");

  for (const [key, file] of Object.entries(report.files)) {
    if (!file.issues || file.issues.length === 0) continue;

    lines.push(`### ${file.file}`);
    lines.push("");

    for (let i = 0; i < file.issues.length; i++) {
      const issue = file.issues[i];
      const severityLabel =
        issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1);
      lines.push(`${i + 1}. **${issue.message}** (${severityLabel})`);
      lines.push(`   - Fix: ${issue.fix}`);
    }
    lines.push("");
  }

  // Summary
  lines.push("---");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(
    `- Files checked: ${report.summary.totalFiles} (${report.summary.found} found)`
  );
  lines.push(`- Valid files: ${report.summary.valid}`);
  lines.push(`- Critical issues: ${report.summary.issues.critical}`);
  lines.push(`- Important issues: ${report.summary.issues.important}`);
  lines.push(`- Recommended improvements: ${report.summary.issues.recommended}`);

  // Recommendations
  const missingFiles = Object.entries(report.files)
    .filter(([_, f]) => !f.found)
    .map(([key, _]) => key);

  if (missingFiles.length > 0) {
    lines.push("");
    lines.push("## Recommendations");
    lines.push("");
    for (const file of missingFiles) {
      const config = FILES[file];
      if (config) {
        lines.push(`- Create ${config.paths[0]} for better web presence`);
      }
    }
  }

  return lines.join("\n");
}

/**
 * CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: node analyze-web-resources.js <target> [options]

Arguments:
  target          URL or local directory path to check

Options:
  --json          Output results as JSON
  --only=<files>  Only check specified files (comma-separated)
                  Valid: sitemap, robots, security, llms, llms-full
  --help, -h      Show this help message

Examples:
  node analyze-web-resources.js https://example.com
  node analyze-web-resources.js ./public --json
  node analyze-web-resources.js https://example.com --only=sitemap,robots
`);
    process.exit(0);
  }

  // Parse arguments
  let target = "";
  const options = {};

  for (const arg of args) {
    if (arg.startsWith("--json")) {
      options.json = true;
    } else if (arg.startsWith("--only=")) {
      options.only = arg.substring(7);
    } else if (!arg.startsWith("-")) {
      target = arg;
    }
  }

  if (!target) {
    console.error("Error: Target URL or path is required");
    process.exit(1);
  }

  try {
    const analyzer = new WebResourceAnalyzer(target, options);
    const report = await analyzer.analyze();

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(formatTextReport(report));
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
