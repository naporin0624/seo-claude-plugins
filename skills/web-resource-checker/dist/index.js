#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { parseStringPromise } from "xml2js";

//#region src/cli.ts
function parseArgs(args) {
	const target = args.find((arg) => !arg.startsWith("-"));
	if (!target) {
		printUsage();
		return null;
	}
	const options = {
		json: args.includes("--json"),
		only: null,
		timeout: 1e4
	};
	const onlyArg = args.find((arg) => arg.startsWith("--only="));
	if (onlyArg) options.only = onlyArg.split("=")[1];
	const timeoutArg = args.find((arg) => arg.startsWith("--timeout="));
	if (timeoutArg) {
		const value = parseInt(timeoutArg.split("=")[1], 10);
		if (!isNaN(value) && value > 0) options.timeout = value;
	}
	return {
		target,
		options
	};
}
function printUsage() {
	console.log(`
Web Resource Checker v2.0.0

Usage:
  npx web-resource-checker <target> [options]

Target:
  URL (https://example.com) or local directory path

Options:
  --only=<files>    Comma-separated list of files to check
                    Valid: sitemap, robots, security, llms, llms-full
  --timeout=<ms>    Request timeout in milliseconds (default: 10000)
  --json            Output results as JSON

Examples:
  npx web-resource-checker https://example.com
  npx web-resource-checker ./public --only=sitemap,robots
  npx web-resource-checker https://example.com --json
  npx web-resource-checker https://example.com --timeout=30000
`);
}

//#endregion
//#region src/validators/common.ts
const SEVERITY = {
	CRITICAL: "critical",
	IMPORTANT: "important",
	RECOMMENDED: "recommended"
};
function createIssue(severity, check, message, fix, details = {}) {
	return {
		severity,
		check,
		message,
		fix,
		...details
	};
}
function createPassed(check, value, details = {}) {
	return {
		check,
		value,
		...details
	};
}

//#endregion
//#region src/validators/sitemap.ts
var SitemapValidator = class {
	content;
	source;
	issues = [];
	passed = [];
	data = null;
	constructor(content, source = "sitemap.xml") {
		this.content = content;
		this.source = source;
	}
	async validate() {
		if (!this.content || this.content.trim() === "") {
			this.issues.push(createIssue(SEVERITY.CRITICAL, "empty-file", "Sitemap file is empty", "Add valid sitemap XML content"));
			return this.generateReport();
		}
		try {
			this.data = await parseStringPromise(this.content, {
				explicitArray: false,
				ignoreAttrs: false
			});
		} catch (error) {
			this.issues.push(createIssue(SEVERITY.CRITICAL, "invalid-xml", `Invalid XML: ${error instanceof Error ? error.message : "Unknown error"}`, "Fix XML syntax errors"));
			return this.generateReport();
		}
		this.checkRoot();
		this.checkUrls();
		this.checkSize();
		return this.generateReport();
	}
	checkRoot() {
		if (!this.data) return;
		if (this.data.urlset) {
			this.passed.push(createPassed("root-element", "urlset"));
			return;
		}
		if (this.data.sitemapindex) {
			this.passed.push(createPassed("root-element", "sitemapindex"));
			return;
		}
		this.issues.push(createIssue(SEVERITY.CRITICAL, "missing-root", "Missing <urlset> or <sitemapindex> root element", "Wrap URLs in <urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">"));
	}
	checkUrls() {
		if (!this.data) return;
		if (this.data.urlset) {
			const urls = this.normalizeArray(this.data.urlset.url);
			this.validateUrls(urls);
			return;
		}
		if (this.data.sitemapindex) {
			const sitemaps = this.normalizeArray(this.data.sitemapindex.sitemap);
			this.validateSitemapIndex(sitemaps);
		}
	}
	normalizeArray(item) {
		if (!item) return [];
		return Array.isArray(item) ? item : [item];
	}
	validateUrls(urls) {
		if (urls.length === 0) {
			this.issues.push(createIssue(SEVERITY.CRITICAL, "no-urls", "Sitemap contains no URLs", "Add at least one <url><loc>...</loc></url> entry"));
			return;
		}
		if (urls.length > 5e4) this.issues.push(createIssue(SEVERITY.CRITICAL, "exceeds-limit", `Sitemap contains ${urls.length} URLs (max 50,000)`, "Split into multiple sitemaps and use sitemap index", {
			count: urls.length,
			max: 5e4
		}));
		else this.passed.push(createPassed("url-count", String(urls.length), { max: 5e4 }));
		let missingLoc = 0;
		let missingLastmod = 0;
		let relativeUrls = 0;
		let invalidUrls = 0;
		for (const url of urls) {
			if (!url.loc) {
				missingLoc++;
				continue;
			}
			const loc = typeof url.loc === "string" ? url.loc : url.loc._;
			if (!loc.startsWith("http://") && !loc.startsWith("https://")) relativeUrls++;
			try {
				new URL(loc);
			} catch {
				invalidUrls++;
			}
			if (!url.lastmod) missingLastmod++;
		}
		if (missingLoc > 0) this.issues.push(createIssue(SEVERITY.CRITICAL, "missing-loc", `${missingLoc} URL entries missing <loc> element`, "Add <loc>https://example.com/page</loc> to each URL entry", { count: missingLoc }));
		if (relativeUrls > 0) this.issues.push(createIssue(SEVERITY.CRITICAL, "relative-url", `${relativeUrls} URLs are relative (must be absolute)`, "Use absolute URLs starting with https://", { count: relativeUrls }));
		if (invalidUrls > 0) this.issues.push(createIssue(SEVERITY.IMPORTANT, "invalid-url", `${invalidUrls} URLs have invalid format`, "Ensure all URLs are valid and properly encoded", { count: invalidUrls }));
		if (missingLastmod > 0) this.issues.push(createIssue(SEVERITY.RECOMMENDED, "missing-lastmod", `${missingLastmod}/${urls.length} URLs missing <lastmod>`, "Add <lastmod>YYYY-MM-DD</lastmod> to improve crawl efficiency", {
			count: missingLastmod,
			total: urls.length
		}));
		else this.passed.push(createPassed("lastmod", "All URLs have lastmod"));
	}
	validateSitemapIndex(sitemaps) {
		if (sitemaps.length === 0) {
			this.issues.push(createIssue(SEVERITY.CRITICAL, "no-sitemaps", "Sitemap index contains no sitemaps", "Add at least one <sitemap><loc>...</loc></sitemap> entry"));
			return;
		}
		this.passed.push(createPassed("sitemap-index", `Contains ${sitemaps.length} sitemaps`));
		let missingLoc = 0;
		for (const sitemap of sitemaps) if (!sitemap.loc) missingLoc++;
		if (missingLoc > 0) this.issues.push(createIssue(SEVERITY.CRITICAL, "missing-sitemap-loc", `${missingLoc} sitemap entries missing <loc>`, "Add <loc>https://example.com/sitemap.xml</loc> to each entry", { count: missingLoc }));
	}
	checkSize() {
		const sizeBytes = Buffer.byteLength(this.content, "utf8");
		const maxBytes = 52428800;
		if (sizeBytes > maxBytes) this.issues.push(createIssue(SEVERITY.CRITICAL, "file-too-large", `Sitemap is ${(sizeBytes / 1024 / 1024).toFixed(1)}MB (max 50MB)`, "Split into multiple sitemaps or use gzip compression", {
			sizeBytes,
			maxBytes
		}));
		else this.passed.push(createPassed("file-size", `${(sizeBytes / 1024).toFixed(1)}KB`, { maxMB: 50 }));
	}
	generateReport() {
		return {
			file: "sitemap.xml",
			source: this.source,
			found: true,
			valid: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length === 0,
			summary: {
				critical: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length,
				important: this.issues.filter((i) => i.severity === SEVERITY.IMPORTANT).length,
				recommended: this.issues.filter((i) => i.severity === SEVERITY.RECOMMENDED).length,
				passed: this.passed.length
			},
			issues: this.issues,
			passed: this.passed
		};
	}
};
function createNotFoundReport$3(source) {
	return {
		file: "sitemap.xml",
		source,
		found: false,
		valid: false,
		summary: {
			critical: 1,
			important: 0,
			recommended: 0,
			passed: 0
		},
		issues: [createIssue(SEVERITY.CRITICAL, "not-found", "sitemap.xml not found", "Create sitemap.xml at site root for better SEO discoverability")],
		passed: []
	};
}

//#endregion
//#region src/validators/robots.ts
const VALID_DIRECTIVES = [
	"user-agent",
	"disallow",
	"allow",
	"sitemap",
	"crawl-delay",
	"host"
];
var RobotsValidator = class {
	content;
	source;
	issues = [];
	passed = [];
	rules = [];
	sitemaps = [];
	constructor(content, source = "robots.txt") {
		this.content = content;
		this.source = source;
	}
	validate() {
		if (!this.content || this.content.trim() === "") {
			this.issues.push(createIssue(SEVERITY.IMPORTANT, "empty-file", "robots.txt is empty", "Add User-agent and Disallow/Allow directives"));
			return this.generateReport();
		}
		this.checkSize();
		this.parse();
		this.checkUserAgents();
		this.checkSitemap();
		this.checkBlockingAll();
		return this.generateReport();
	}
	checkSize() {
		const sizeBytes = Buffer.byteLength(this.content, "utf8");
		const maxBytes = 512e3;
		if (sizeBytes > maxBytes) this.issues.push(createIssue(SEVERITY.IMPORTANT, "file-too-large", `robots.txt is ${(sizeBytes / 1024).toFixed(1)}KB (max 500KB)`, "Reduce file size or simplify rules", {
			sizeBytes,
			maxBytes
		}));
		else this.passed.push(createPassed("file-size", `${(sizeBytes / 1024).toFixed(1)}KB`, { maxKB: 500 }));
	}
	parse() {
		const lines = this.content.split(/\r?\n/);
		let currentUserAgent = null;
		let lineNumber = 0;
		for (const line of lines) {
			lineNumber++;
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const colonIndex = trimmed.indexOf(":");
			if (colonIndex === -1) {
				this.issues.push(createIssue(SEVERITY.IMPORTANT, "syntax-error", `Invalid syntax at line ${lineNumber}: missing colon`, "Use format: Directive: value", {
					line: lineNumber,
					content: trimmed
				}));
				continue;
			}
			const directive = trimmed.substring(0, colonIndex).trim().toLowerCase();
			const value = trimmed.substring(colonIndex + 1).trim();
			if (!VALID_DIRECTIVES.includes(directive)) {
				this.issues.push(createIssue(SEVERITY.RECOMMENDED, "unknown-directive", `Unknown directive "${directive}" at line ${lineNumber}`, `Valid directives: ${VALID_DIRECTIVES.join(", ")}`, {
					line: lineNumber,
					directive
				}));
				continue;
			}
			if (directive === "user-agent") {
				currentUserAgent = value;
				this.rules.push({
					userAgent: value,
					disallow: [],
					allow: [],
					line: lineNumber
				});
				continue;
			}
			if (directive === "sitemap") {
				this.sitemaps.push({
					url: value,
					line: lineNumber
				});
				continue;
			}
			if (directive === "disallow" || directive === "allow") {
				if (!currentUserAgent) {
					this.issues.push(createIssue(SEVERITY.IMPORTANT, "directive-without-agent", `${directive} at line ${lineNumber} has no preceding User-agent`, "Add User-agent: * before this directive", { line: lineNumber }));
					continue;
				}
				const lastRule = this.rules[this.rules.length - 1];
				if (directive === "disallow") lastRule.disallow.push(value);
				else lastRule.allow.push(value);
			}
		}
	}
	checkUserAgents() {
		if (this.rules.length === 0) {
			this.issues.push(createIssue(SEVERITY.IMPORTANT, "no-user-agent", "No User-agent directive found", "Add User-agent: * to apply rules to all crawlers"));
			return;
		}
		const hasWildcard = this.rules.some((r) => r.userAgent === "*");
		if (hasWildcard) this.passed.push(createPassed("user-agent-wildcard", "User-agent: * found"));
		else this.issues.push(createIssue(SEVERITY.RECOMMENDED, "no-wildcard-agent", "No wildcard User-agent: * found", "Add User-agent: * as fallback for unspecified crawlers", { agents: this.rules.map((r) => r.userAgent) }));
		this.passed.push(createPassed("user-agents", `${this.rules.length} user-agent blocks found`));
	}
	checkSitemap() {
		if (this.sitemaps.length === 0) {
			this.issues.push(createIssue(SEVERITY.RECOMMENDED, "missing-sitemap", "No Sitemap directive found", "Add Sitemap: https://example.com/sitemap.xml for better discoverability"));
			return;
		}
		for (const sitemap of this.sitemaps) if (!sitemap.url.startsWith("http://") && !sitemap.url.startsWith("https://")) this.issues.push(createIssue(SEVERITY.IMPORTANT, "relative-sitemap-url", `Sitemap URL at line ${sitemap.line} is not absolute`, "Use absolute URL: Sitemap: https://example.com/sitemap.xml", {
			line: sitemap.line,
			url: sitemap.url
		}));
		this.passed.push(createPassed("sitemap", `${this.sitemaps.length} Sitemap directive(s) found`, { urls: this.sitemaps.map((s) => s.url) }));
	}
	checkBlockingAll() {
		for (const rule of this.rules) {
			if (rule.userAgent === "*" && rule.disallow.includes("/") && rule.allow.length === 0) this.issues.push(createIssue(SEVERITY.CRITICAL, "blocking-all", "Disallow: / blocks all crawlers from entire site", "Remove or modify if unintended. This prevents search engine indexing.", {
				userAgent: rule.userAgent,
				line: rule.line
			}));
			if (rule.userAgent !== "*" && rule.disallow.includes("/") && rule.allow.length === 0) this.passed.push(createPassed("bot-blocked", `${rule.userAgent} is blocked from site`, { userAgent: rule.userAgent }));
		}
	}
	generateReport() {
		return {
			file: "robots.txt",
			source: this.source,
			found: true,
			valid: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length === 0,
			summary: {
				critical: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length,
				important: this.issues.filter((i) => i.severity === SEVERITY.IMPORTANT).length,
				recommended: this.issues.filter((i) => i.severity === SEVERITY.RECOMMENDED).length,
				passed: this.passed.length
			},
			issues: this.issues,
			passed: this.passed,
			stats: {
				userAgents: this.rules.length,
				sitemaps: this.sitemaps.length
			}
		};
	}
};
function createNotFoundReport$2(source) {
	return {
		file: "robots.txt",
		source,
		found: false,
		valid: true,
		summary: {
			critical: 0,
			important: 0,
			recommended: 1,
			passed: 0
		},
		issues: [createIssue(SEVERITY.RECOMMENDED, "not-found", "robots.txt not found", "Consider adding robots.txt to control crawler access")],
		passed: []
	};
}

//#endregion
//#region src/validators/security-txt.ts
const REQUIRED_FIELDS = ["contact", "expires"];
const OPTIONAL_FIELDS = [
	"encryption",
	"acknowledgments",
	"preferred-languages",
	"canonical",
	"policy",
	"hiring"
];
const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];
var SecurityTxtValidator = class {
	content;
	source;
	issues = [];
	passed = [];
	fields = {};
	constructor(content, source = "security.txt") {
		this.content = content;
		this.source = source;
	}
	validate() {
		if (!this.content || this.content.trim() === "") {
			this.issues.push(createIssue(SEVERITY.CRITICAL, "empty-file", "security.txt is empty", "Add Contact and Expires fields per RFC 9116"));
			return this.generateReport();
		}
		this.parse();
		this.checkRequiredFields();
		this.checkExpires();
		this.checkContact();
		this.checkOptionalFields();
		return this.generateReport();
	}
	parse() {
		const lines = this.content.split(/\r?\n/);
		let lineNumber = 0;
		for (const line of lines) {
			lineNumber++;
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const colonIndex = trimmed.indexOf(":");
			if (colonIndex === -1) {
				this.issues.push(createIssue(SEVERITY.IMPORTANT, "syntax-error", `Invalid syntax at line ${lineNumber}: missing colon`, "Use format: Field: value", {
					line: lineNumber,
					content: trimmed
				}));
				continue;
			}
			const field = trimmed.substring(0, colonIndex).trim().toLowerCase();
			const value = trimmed.substring(colonIndex + 1).trim();
			if (!ALL_FIELDS.includes(field)) {
				this.issues.push(createIssue(SEVERITY.RECOMMENDED, "unknown-field", `Unknown field "${field}" at line ${lineNumber}`, `Valid fields: ${ALL_FIELDS.join(", ")}`, {
					line: lineNumber,
					directive: field
				}));
				continue;
			}
			if (!this.fields[field]) this.fields[field] = [];
			this.fields[field].push({
				value,
				line: lineNumber
			});
		}
	}
	checkRequiredFields() {
		if (!this.fields.contact || this.fields.contact.length === 0) this.issues.push(createIssue(SEVERITY.CRITICAL, "missing-contact", "Missing required Contact field", "Add Contact: mailto:security@example.com or Contact: https://example.com/security"));
		else this.passed.push(createPassed("contact", `${this.fields.contact.length} Contact field(s) found`));
		if (!this.fields.expires || this.fields.expires.length === 0) this.issues.push(createIssue(SEVERITY.CRITICAL, "missing-expires", "Missing required Expires field", "Add Expires: 2025-12-31T23:59:59.000Z"));
		else if (this.fields.expires.length > 1) this.issues.push(createIssue(SEVERITY.IMPORTANT, "multiple-expires", "Multiple Expires fields found (only one allowed)", "Keep only one Expires field", { count: this.fields.expires.length }));
	}
	checkExpires() {
		if (!this.fields.expires || this.fields.expires.length === 0) return;
		const expires = this.fields.expires[0];
		const value = expires.value;
		const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;
		if (!isoRegex.test(value)) {
			this.issues.push(createIssue(SEVERITY.IMPORTANT, "invalid-expires-format", "Expires field is not in ISO 8601 format", "Use format: YYYY-MM-DDTHH:MM:SS.sssZ (e.g., 2025-12-31T23:59:59.000Z)", {
				value,
				line: expires.line
			}));
			return;
		}
		const expiresDate = new Date(value);
		const now = new Date();
		if (expiresDate <= now) this.issues.push(createIssue(SEVERITY.CRITICAL, "expired", "Expires date is in the past", "Update Expires to a future date", {
			expires: value,
			line: expires.line
		}));
		else {
			const oneYearFromNow = new Date();
			oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
			if (expiresDate > oneYearFromNow) this.issues.push(createIssue(SEVERITY.RECOMMENDED, "expires-too-far", "Expires date is more than 1 year in future", "RFC 9116 recommends setting validity to maximum 1 year", {
				expires: value,
				line: expires.line
			}));
			else this.passed.push(createPassed("expires-valid", `Expires: ${value}`, { daysUntilExpiry: Math.ceil((expiresDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)) }));
		}
	}
	checkContact() {
		if (!this.fields.contact) return;
		for (const contact of this.fields.contact) {
			const value = contact.value;
			const validPrefixes = [
				"mailto:",
				"https://",
				"tel:"
			];
			const hasValidPrefix = validPrefixes.some((prefix) => value.toLowerCase().startsWith(prefix));
			if (!hasValidPrefix) this.issues.push(createIssue(SEVERITY.IMPORTANT, "invalid-contact-format", `Contact at line ${contact.line} should start with mailto:, https://, or tel:`, "Use format: Contact: mailto:security@example.com", {
				value,
				line: contact.line
			}));
			if (value.toLowerCase().startsWith("mailto:")) {
				const email = value.substring(7);
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(email)) this.issues.push(createIssue(SEVERITY.IMPORTANT, "invalid-email", `Invalid email format in Contact at line ${contact.line}`, "Use valid email: mailto:security@example.com", {
					email,
					line: contact.line
				}));
			}
			if (value.toLowerCase().startsWith("https://")) try {
				new URL(value);
			} catch {
				this.issues.push(createIssue(SEVERITY.IMPORTANT, "invalid-url", `Invalid URL format in Contact at line ${contact.line}`, "Use valid URL: https://example.com/security", {
					url: value,
					line: contact.line
				}));
			}
		}
	}
	checkOptionalFields() {
		if (!this.fields.canonical) this.issues.push(createIssue(SEVERITY.RECOMMENDED, "missing-canonical", "Missing Canonical field", "Add Canonical: https://example.com/.well-known/security.txt"));
		else this.passed.push(createPassed("canonical", this.fields.canonical[0].value));
		if (this.fields["preferred-languages"]) this.passed.push(createPassed("preferred-languages", this.fields["preferred-languages"][0].value));
		if (this.fields.encryption) this.passed.push(createPassed("encryption", `${this.fields.encryption.length} key(s) linked`));
		if (this.fields.policy) this.passed.push(createPassed("policy", this.fields.policy[0].value));
	}
	generateReport() {
		return {
			file: "security.txt",
			source: this.source,
			found: true,
			valid: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length === 0,
			summary: {
				critical: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length,
				important: this.issues.filter((i) => i.severity === SEVERITY.IMPORTANT).length,
				recommended: this.issues.filter((i) => i.severity === SEVERITY.RECOMMENDED).length,
				passed: this.passed.length
			},
			issues: this.issues,
			passed: this.passed,
			fields: Object.keys(this.fields)
		};
	}
};
function createNotFoundReport$1(source) {
	return {
		file: "security.txt",
		source,
		found: false,
		valid: false,
		summary: {
			critical: 0,
			important: 1,
			recommended: 0,
			passed: 0
		},
		issues: [createIssue(SEVERITY.IMPORTANT, "not-found", "security.txt not found", "Create /.well-known/security.txt per RFC 9116 for vulnerability disclosure. CISA recommends adoption.")],
		passed: []
	};
}

//#endregion
//#region src/validators/llms-txt.ts
var LlmsTxtValidator = class {
	content;
	source;
	isFullVersion;
	issues = [];
	passed = [];
	structure = {
		title: null,
		summary: null,
		sections: [],
		links: []
	};
	constructor(content, source = "llms.txt", isFullVersion = false) {
		this.content = content;
		this.source = source;
		this.isFullVersion = isFullVersion;
	}
	validate() {
		if (!this.content || this.content.trim() === "") {
			this.issues.push(createIssue(SEVERITY.CRITICAL, "empty-file", `${this.getFileName()} is empty`, "Add H1 title and content per llmstxt.org specification"));
			return this.generateReport();
		}
		this.parse();
		this.checkTitle();
		this.checkSummary();
		this.checkSections();
		this.checkLinks();
		this.checkSize();
		return this.generateReport();
	}
	getFileName() {
		return this.isFullVersion ? "llms-full.txt" : "llms.txt";
	}
	parse() {
		const lines = this.content.split(/\r?\n/);
		let currentSection = null;
		let inBlockquote = false;
		let blockquoteContent = [];
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const lineNumber = i + 1;
			if (line.startsWith("# ") && !this.structure.title) {
				this.structure.title = {
					text: line.substring(2).trim(),
					line: lineNumber
				};
				continue;
			}
			if (line.startsWith("> ")) {
				inBlockquote = true;
				blockquoteContent.push(line.substring(2).trim());
				continue;
			} else if (inBlockquote && line.trim() === "") {
				if (!this.structure.summary && blockquoteContent.length > 0) this.structure.summary = {
					text: blockquoteContent.join(" "),
					line: lineNumber - blockquoteContent.length
				};
				inBlockquote = false;
				blockquoteContent = [];
			}
			if (line.startsWith("## ")) {
				currentSection = {
					title: line.substring(3).trim(),
					line: lineNumber,
					content: []
				};
				this.structure.sections.push(currentSection);
				continue;
			}
			const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
			const matches = [...line.matchAll(linkRegex)];
			for (const match of matches) this.structure.links.push({
				text: match[1],
				url: match[2],
				line: lineNumber
			});
			if (currentSection && line.trim()) currentSection.content.push(line);
		}
		if (inBlockquote && blockquoteContent.length > 0 && !this.structure.summary) this.structure.summary = {
			text: blockquoteContent.join(" "),
			line: lines.length - blockquoteContent.length + 1
		};
	}
	checkTitle() {
		if (!this.structure.title) {
			this.issues.push(createIssue(SEVERITY.CRITICAL, "missing-title", "Missing H1 title at start of file", "Start file with # Your Site Name"));
			return;
		}
		if (this.structure.title.line !== 1) {
			const firstNonEmptyLine = this.content.split(/\r?\n/).findIndex((l) => l.trim() !== "");
			if (firstNonEmptyLine + 1 !== this.structure.title.line) this.issues.push(createIssue(SEVERITY.IMPORTANT, "title-not-first", `H1 title found at line ${this.structure.title.line}, should be first`, "Move H1 title to the beginning of the file"));
		}
		this.passed.push(createPassed("title", this.structure.title.text, { line: this.structure.title.line }));
	}
	checkSummary() {
		if (!this.structure.summary) {
			this.issues.push(createIssue(SEVERITY.IMPORTANT, "missing-summary", "Missing summary blockquote after title", "Add > Brief description of your site after the H1 title"));
			return;
		}
		const summaryLength = this.structure.summary.text.length;
		if (summaryLength < 20) this.issues.push(createIssue(SEVERITY.RECOMMENDED, "summary-too-short", `Summary is very short (${summaryLength} chars)`, "Add more context to help LLMs understand your site"));
		else this.passed.push(createPassed("summary", `${summaryLength} characters`, { preview: this.structure.summary.text.substring(0, 100) + "..." }));
	}
	checkSections() {
		if (this.structure.sections.length === 0) {
			this.issues.push(createIssue(SEVERITY.RECOMMENDED, "no-sections", "No H2 sections found", "Add ## Section headings to organize content"));
			return;
		}
		const hasOptional = this.structure.sections.some((s) => s.title.toLowerCase() === "optional");
		if (!hasOptional && !this.isFullVersion) this.issues.push(createIssue(SEVERITY.RECOMMENDED, "no-optional-section", "No \"Optional\" section found", "Add ## Optional section for less critical resources"));
		this.passed.push(createPassed("sections", `${this.structure.sections.length} section(s) found`, { sections: this.structure.sections.map((s) => s.title) }));
	}
	checkLinks() {
		if (this.structure.links.length === 0 && !this.isFullVersion) {
			this.issues.push(createIssue(SEVERITY.RECOMMENDED, "no-links", "No markdown links found", "Add links in format: - [Link Text](https://example.com/page): Description"));
			return;
		}
		let invalidLinks = 0;
		for (const link of this.structure.links) if (!link.url.startsWith("http://") && !link.url.startsWith("https://") && !link.url.startsWith("/")) invalidLinks++;
		if (invalidLinks > 0) this.issues.push(createIssue(SEVERITY.IMPORTANT, "invalid-links", `${invalidLinks} link(s) have potentially invalid URLs`, "Use absolute URLs (https://...) or root-relative paths (/...)", { count: invalidLinks }));
		if (this.structure.links.length > 0) this.passed.push(createPassed("links", `${this.structure.links.length} link(s) found`));
	}
	checkSize() {
		const sizeBytes = Buffer.byteLength(this.content, "utf8");
		const estimatedTokens = Math.ceil(this.content.length / 4);
		if (this.isFullVersion) if (estimatedTokens > 1e5) this.issues.push(createIssue(SEVERITY.RECOMMENDED, "too-large", `File may exceed typical LLM context windows (~${estimatedTokens.toLocaleString()} estimated tokens)`, "Consider splitting into sections or prioritizing content", {
			estimatedTokens,
			sizeKB: (sizeBytes / 1024).toFixed(1)
		}));
		else this.passed.push(createPassed("size", `~${estimatedTokens.toLocaleString()} estimated tokens`, { sizeKB: (sizeBytes / 1024).toFixed(1) }));
		else this.passed.push(createPassed("size", `${(sizeBytes / 1024).toFixed(1)}KB`));
	}
	generateReport() {
		const fileName = this.getFileName();
		return {
			file: fileName,
			source: this.source,
			found: true,
			valid: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length === 0,
			summary: {
				critical: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length,
				important: this.issues.filter((i) => i.severity === SEVERITY.IMPORTANT).length,
				recommended: this.issues.filter((i) => i.severity === SEVERITY.RECOMMENDED).length,
				passed: this.passed.length
			},
			issues: this.issues,
			passed: this.passed,
			structure: {
				hasTitle: !!this.structure.title,
				hasSummary: !!this.structure.summary,
				sectionCount: this.structure.sections.length,
				linkCount: this.structure.links.length
			}
		};
	}
};
function createNotFoundReport(source, isFullVersion = false) {
	const fileName = isFullVersion ? "llms-full.txt" : "llms.txt";
	return {
		file: fileName,
		source,
		found: false,
		valid: true,
		summary: {
			critical: 0,
			important: 0,
			recommended: 1,
			passed: 0
		},
		issues: [createIssue(SEVERITY.RECOMMENDED, "not-found", `${fileName} not found`, `Consider adding ${fileName} to improve LLM accessibility. See llmstxt.org for specification.`)],
		passed: []
	};
}

//#endregion
//#region src/analyzer.ts
const FILES = {
	sitemap: {
		paths: ["sitemap.xml", "sitemap_index.xml"],
		createValidator: (content, source) => new SitemapValidator(content, source),
		notFound: createNotFoundReport$3,
		async: true
	},
	robots: {
		paths: ["robots.txt"],
		createValidator: (content, source) => new RobotsValidator(content, source),
		notFound: createNotFoundReport$2,
		async: false
	},
	security: {
		paths: [".well-known/security.txt", "security.txt"],
		createValidator: (content, source) => new SecurityTxtValidator(content, source),
		notFound: createNotFoundReport$1,
		async: false
	},
	llms: {
		paths: ["llms.txt"],
		createValidator: (content, source) => new LlmsTxtValidator(content, source, false),
		notFound: (source) => createNotFoundReport(source, false),
		async: false
	},
	"llms-full": {
		paths: ["llms-full.txt"],
		createValidator: (content, source) => new LlmsTxtValidator(content, source, true),
		notFound: (source) => createNotFoundReport(source, true),
		async: false
	}
};
var WebResourceAnalyzer = class {
	target;
	isUrl;
	options;
	results = {};
	constructor(target, options = {}) {
		this.target = target;
		this.isUrl = target.startsWith("http://") || target.startsWith("https://");
		this.options = {
			json: options.json || false,
			only: options.only || null,
			timeout: options.timeout || 1e4
		};
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
					error: error instanceof Error ? error.message : String(error),
					summary: {
						critical: 1,
						important: 0,
						recommended: 0,
						passed: 0
					},
					issues: [{
						severity: "critical",
						check: "error",
						message: `Error checking file: ${error instanceof Error ? error.message : error}`,
						fix: "Check if the target is accessible"
					}],
					passed: []
				};
			}
		}
		return this.generateReport(timestamp);
	}
	getFilesToCheck() {
		if (this.options.only) return this.options.only.split(",").map((f) => f.trim().toLowerCase());
		return Object.keys(FILES);
	}
	async checkFile(fileKey, config) {
		let content = null;
		let source = "";
		if (this.isUrl) for (const path of config.paths) {
			const url = new URL(path, this.target).href;
			source = url;
			try {
				const response = await fetch(url, {
					signal: AbortSignal.timeout(this.options.timeout),
					headers: { "User-Agent": "WebResourceChecker/2.0" }
				});
				if (response.ok) {
					content = await response.text();
					break;
				}
			} catch {}
		}
		else {
			const basePath = resolve(this.target);
			for (const path of config.paths) {
				const fullPath = join(basePath, path);
				source = fullPath;
				if (existsSync(fullPath)) try {
					content = readFileSync(fullPath, "utf8");
					break;
				} catch {}
			}
		}
		if (content === null) return config.notFound(source);
		const validator = config.createValidator(content, source);
		if (config.async) return await validator.validate();
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
				important: files.reduce((sum, f) => sum + (f.summary?.important || 0), 0),
				recommended: files.reduce((sum, f) => sum + (f.summary?.recommended || 0), 0)
			}
		};
		return {
			summary,
			files: this.results
		};
	}
};

//#endregion
//#region src/reporter.ts
const FILE_PATHS = {
	sitemap: ["sitemap.xml"],
	robots: ["robots.txt"],
	security: [".well-known/security.txt"],
	llms: ["llms.txt"],
	"llms-full": ["llms-full.txt"]
};
function formatTextReport(report) {
	const lines = [];
	lines.push("# Web Resource Audit Report");
	lines.push("");
	lines.push(`## Target: ${report.summary.target}`);
	lines.push(`Analyzed at: ${report.summary.timestamp}`);
	lines.push("");
	lines.push("---");
	lines.push("");
	lines.push("## Files Found");
	lines.push("");
	lines.push("| File | Status | Issues |");
	lines.push("|------|--------|--------|");
	for (const [key, file] of Object.entries(report.files)) {
		const status = file.found ? "Found" : "Not Found";
		const issueCount = file.found ? `${file.summary.critical + file.summary.important + file.summary.recommended}` : "-";
		lines.push(`| ${file.file} | ${status} | ${issueCount} |`);
	}
	lines.push("");
	lines.push("---");
	lines.push("");
	lines.push("## Issues");
	lines.push("");
	for (const [, file] of Object.entries(report.files)) {
		if (!file.issues || file.issues.length === 0) continue;
		lines.push(`### ${file.file}`);
		lines.push("");
		for (let i = 0; i < file.issues.length; i++) {
			const issue = file.issues[i];
			const severityLabel = issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1);
			lines.push(`${i + 1}. **${issue.message}** (${severityLabel})`);
			lines.push(`   - Fix: ${issue.fix}`);
		}
		lines.push("");
	}
	lines.push("---");
	lines.push("");
	lines.push("## Summary");
	lines.push("");
	lines.push(`- Files checked: ${report.summary.totalFiles} (${report.summary.found} found)`);
	lines.push(`- Valid files: ${report.summary.valid}`);
	lines.push(`- Critical issues: ${report.summary.issues.critical}`);
	lines.push(`- Important issues: ${report.summary.issues.important}`);
	lines.push(`- Recommended improvements: ${report.summary.issues.recommended}`);
	const missingFiles = Object.entries(report.files).filter(([, f]) => !f.found).map(([key]) => key);
	if (missingFiles.length > 0) {
		lines.push("");
		lines.push("## Recommendations");
		lines.push("");
		for (const file of missingFiles) {
			const paths = FILE_PATHS[file];
			if (paths) lines.push(`- Create ${paths[0]} for better web presence`);
		}
	}
	return lines.join("\n");
}

//#endregion
//#region src/index.ts
async function main() {
	const parsed = parseArgs(process.argv.slice(2));
	if (!parsed) process.exit(1);
	const { target, options } = parsed;
	try {
		const analyzer = new WebResourceAnalyzer(target, options);
		const report = await analyzer.analyze();
		if (options.json) console.log(JSON.stringify(report, null, 2));
		else console.log(formatTextReport(report));
		if (report.summary.issues.critical > 0) process.exit(1);
	} catch (error) {
		console.error("Error:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}
main();

//#endregion
export { WebResourceAnalyzer, formatTextReport };