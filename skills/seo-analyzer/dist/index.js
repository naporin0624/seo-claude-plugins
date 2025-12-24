#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { load } from "cheerio";

//#region src/cli.ts
const DEFAULT_CONFIG = {
	mode: "seo",
	jsonOutput: false
};
function parseArgs(args) {
	const config = { ...DEFAULT_CONFIG };
	let filepath = null;
	for (const arg of args) if (arg.startsWith("--")) {
		const [key, value] = arg.slice(2).split("=");
		switch (key) {
			case "json":
				config.jsonOutput = true;
				break;
			case "mode":
				if (value === "seo" || value === "keywords" || value === "both") config.mode = value;
				break;
			case "keywords":
				config.mode = "keywords";
				break;
			case "both":
				config.mode = "both";
				break;
			case "help":
			case "h":
				printHelp();
				process.exit(0);
				break;
		}
	} else if (!filepath) filepath = arg;
	return {
		filepath,
		config
	};
}
function printHelp() {
	console.log(`
SEO Analyzer - Static HTML SEO and Keyword Analysis

Usage:
  npx tsx src/index.ts <file.html> [options]

Options:
  --json          Output in JSON format
  --mode=<mode>   Analysis mode: seo, keywords, or both (default: seo)
  --keywords      Shortcut for --mode=keywords
  --both          Shortcut for --mode=both
  --help, -h      Show this help

Examples:
  npx tsx src/index.ts page.html
  npx tsx src/index.ts page.html --json
  npx tsx src/index.ts page.html --keywords
  npx tsx src/index.ts page.html --both --json
`);
}

//#endregion
//#region src/seo-analyzer.ts
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
var SEOAnalyzer = class {
	$;
	filename;
	issues = [];
	passed = [];
	warnings = [];
	confidence = 100;
	constructor(html, filename) {
		this.$ = load(html);
		this.filename = filename;
	}
	analyze() {
		this.detectSPA();
		this.checkCritical();
		this.checkImportant();
		this.checkRecommended();
		return this.generateReport();
	}
	detectSPA() {
		const $ = this.$;
		const hasReactRoot = $("#root").length > 0 || $("#app").length > 0;
		const hasReactScript = $("script[src*=\"react\"]").length > 0 || $("script[src*=\"vue\"]").length > 0 || $("script[src*=\"angular\"]").length > 0;
		const hasEmptyBody = $("body").children().length <= 2 && hasReactRoot;
		if (hasReactRoot && (hasReactScript || hasEmptyBody)) {
			this.confidence = 40;
			this.warnings.push({
				type: "spa-detected",
				message: "Client-side rendered application detected. Static analysis may not reflect the fully rendered page. Consider using Lighthouse for runtime analysis."
			});
		}
	}
	checkCritical() {
		this.checkTitle();
		this.checkDescription();
		this.checkH1();
		this.checkCanonical();
	}
	checkTitle() {
		const $ = this.$;
		const title = $("title").text().trim();
		if (!title) {
			this.issues.push(createIssue(SEVERITY.CRITICAL, "title", "Missing page title", "Add <title>Your Page Title</title> in <head>"));
			return;
		}
		const length = title.length;
		if (length < 30) this.issues.push(createIssue(SEVERITY.CRITICAL, "title-length", `Title too short (${length} chars)`, "Expand title to 30-60 characters for better SEO", {
			current: title,
			length
		}));
		else if (length > 60) this.issues.push(createIssue(SEVERITY.IMPORTANT, "title-length", `Title may be truncated (${length} chars)`, "Consider shortening to 60 characters or less", {
			current: title,
			length
		}));
		else this.passed.push(createPassed("title", title, { length }));
	}
	checkDescription() {
		const $ = this.$;
		const desc = $("meta[name=\"description\"]").attr("content")?.trim();
		if (!desc) {
			this.issues.push(createIssue(SEVERITY.CRITICAL, "meta-description", "Missing meta description", "Add <meta name=\"description\" content=\"Your description here\">"));
			return;
		}
		const length = desc.length;
		if (length < 70) this.issues.push(createIssue(SEVERITY.IMPORTANT, "meta-description-length", `Meta description too short (${length} chars)`, "Expand description to 70-160 characters", {
			current: desc,
			length
		}));
		else if (length > 160) this.issues.push(createIssue(SEVERITY.IMPORTANT, "meta-description-length", `Meta description may be truncated (${length} chars)`, "Consider shortening to 160 characters or less", {
			current: desc,
			length
		}));
		else this.passed.push(createPassed("meta-description", desc, { length }));
	}
	checkH1() {
		const $ = this.$;
		const h1s = $("h1");
		const count = h1s.length;
		if (count === 0) this.issues.push(createIssue(SEVERITY.CRITICAL, "h1", "Missing H1 heading", "Add exactly one <h1> tag for the main page heading"));
		else if (count > 1) {
			const texts = h1s.map((_, el) => $(el).text().trim()).get().slice(0, 3);
			this.issues.push(createIssue(SEVERITY.CRITICAL, "h1-multiple", `Multiple H1 tags found (${count})`, "Keep only one <h1> tag per page", {
				count,
				examples: texts
			}));
		} else this.passed.push(createPassed("h1", h1s.first().text().trim()));
	}
	checkCanonical() {
		const $ = this.$;
		const canonical = $("link[rel=\"canonical\"]").attr("href");
		if (!canonical) {
			this.issues.push(createIssue(SEVERITY.CRITICAL, "canonical", "Missing canonical URL", "Add <link rel=\"canonical\" href=\"https://example.com/page\">"));
			return;
		}
		if (!canonical.startsWith("http")) this.issues.push(createIssue(SEVERITY.IMPORTANT, "canonical-relative", "Canonical URL should be absolute", "Use full URL starting with https://", { current: canonical }));
		else this.passed.push(createPassed("canonical", canonical));
	}
	checkImportant() {
		this.checkRobots();
		this.checkViewport();
		this.checkHeadingHierarchy();
		this.checkLang();
	}
	checkRobots() {
		const $ = this.$;
		const robots = $("meta[name=\"robots\"]").attr("content")?.toLowerCase();
		if (robots) {
			if (robots.includes("noindex")) this.issues.push(createIssue(SEVERITY.IMPORTANT, "robots-noindex", "Page has noindex directive", "Remove noindex if you want this page indexed", { current: robots }));
			if (robots.includes("nofollow")) this.warnings.push({
				type: "robots-nofollow",
				message: `Page has nofollow directive: ${robots}`
			});
		}
	}
	checkViewport() {
		const $ = this.$;
		const viewport = $("meta[name=\"viewport\"]").attr("content");
		if (!viewport) this.issues.push(createIssue(SEVERITY.IMPORTANT, "viewport", "Missing viewport meta tag", "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"));
		else this.passed.push(createPassed("viewport", viewport));
	}
	checkHeadingHierarchy() {
		const $ = this.$;
		const headings = $("h1, h2, h3, h4, h5, h6").map((_, el) => ({
			level: parseInt(el.tagName.charAt(1)),
			text: $(el).text().trim().substring(0, 50)
		})).get();
		if (headings.length === 0) return;
		let prevLevel = 0;
		const skips = [];
		for (const h of headings) {
			if (h.level > prevLevel + 1 && prevLevel !== 0) skips.push({
				from: `h${prevLevel}`,
				to: `h${h.level}`,
				text: h.text
			});
			prevLevel = h.level;
		}
		if (skips.length > 0) this.issues.push(createIssue(SEVERITY.IMPORTANT, "heading-hierarchy", `Heading levels skipped (${skips.length} occurrences)`, "Use sequential heading levels (h1→h2→h3)", { skips: skips.slice(0, 3) }));
		else this.passed.push(createPassed("heading-hierarchy", `${headings.length} headings in order`));
	}
	checkLang() {
		const $ = this.$;
		const lang = $("html").attr("lang");
		if (!lang) this.issues.push(createIssue(SEVERITY.IMPORTANT, "lang", "Missing lang attribute on <html>", "Add <html lang=\"en\"> or appropriate language code"));
		else this.passed.push(createPassed("lang", lang));
	}
	checkRecommended() {
		this.checkOpenGraph();
		this.checkTwitterCard();
		this.checkStructuredData();
		this.checkHreflang();
	}
	checkOpenGraph() {
		const $ = this.$;
		const ogTags = {
			"og:title": $("meta[property=\"og:title\"]").attr("content"),
			"og:description": $("meta[property=\"og:description\"]").attr("content"),
			"og:image": $("meta[property=\"og:image\"]").attr("content"),
			"og:url": $("meta[property=\"og:url\"]").attr("content"),
			"og:type": $("meta[property=\"og:type\"]").attr("content")
		};
		const missing = Object.entries(ogTags).filter(([, v]) => !v).map(([k]) => k);
		if (missing.length > 0) this.issues.push(createIssue(SEVERITY.RECOMMENDED, "open-graph", `Missing Open Graph tags: ${missing.join(", ")}`, "Add Open Graph meta tags for better social sharing", { missing }));
		else this.passed.push(createPassed("open-graph", "All essential OG tags present"));
		const ogImage = ogTags["og:image"];
		if (ogImage) {
			const width = $("meta[property=\"og:image:width\"]").attr("content");
			const height = $("meta[property=\"og:image:height\"]").attr("content");
			if (!width || !height) this.issues.push(createIssue(SEVERITY.RECOMMENDED, "og-image-dimensions", "Missing og:image dimensions", "Add og:image:width and og:image:height for faster rendering"));
		}
	}
	checkTwitterCard() {
		const $ = this.$;
		const card = $("meta[name=\"twitter:card\"]").attr("content");
		if (!card) this.issues.push(createIssue(SEVERITY.RECOMMENDED, "twitter-card", "Missing Twitter Card meta tags", "Add <meta name=\"twitter:card\" content=\"summary_large_image\">"));
		else this.passed.push(createPassed("twitter-card", card));
	}
	checkStructuredData() {
		const $ = this.$;
		const jsonLdScripts = $("script[type=\"application/ld+json\"]");
		if (jsonLdScripts.length === 0) {
			this.issues.push(createIssue(SEVERITY.RECOMMENDED, "structured-data", "No JSON-LD structured data found", "Add structured data for rich search results", { suggestion: "Consider adding Article, Product, or Organization schema" }));
			return;
		}
		const schemas = [];
		jsonLdScripts.each((_, el) => {
			try {
				const html = $(el).html();
				if (html) {
					const data = JSON.parse(html);
					const type = data["@type"] || "Unknown";
					schemas.push(type);
				}
			} catch {
				this.issues.push(createIssue(SEVERITY.IMPORTANT, "structured-data-invalid", "Invalid JSON-LD syntax", "Check JSON-LD for syntax errors"));
			}
		});
		if (schemas.length > 0) this.passed.push(createPassed("structured-data", `Found schemas: ${schemas.join(", ")}`));
	}
	checkHreflang() {
		const $ = this.$;
		const hreflangs = $("link[rel=\"alternate\"][hreflang]");
		if (hreflangs.length > 0) {
			const langs = hreflangs.map((_, el) => $(el).attr("hreflang")).get();
			this.passed.push(createPassed("hreflang", langs.join(", ")));
			if (!langs.includes("x-default")) this.issues.push(createIssue(SEVERITY.RECOMMENDED, "hreflang-default", "Missing x-default hreflang", "Add <link rel=\"alternate\" hreflang=\"x-default\" href=\"...\"> for fallback"));
		}
	}
	generateReport() {
		const summary = {
			critical: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length,
			important: this.issues.filter((i) => i.severity === SEVERITY.IMPORTANT).length,
			recommended: this.issues.filter((i) => i.severity === SEVERITY.RECOMMENDED).length,
			passed: this.passed.length
		};
		return {
			file: this.filename,
			timestamp: new Date().toISOString(),
			confidence: this.confidence,
			summary,
			issues: this.issues,
			passed: this.passed,
			warnings: this.warnings
		};
	}
};

//#endregion
//#region src/keyword-analyzer.ts
const STOP_WORDS = new Set([
	"the",
	"a",
	"an",
	"and",
	"or",
	"but",
	"in",
	"on",
	"at",
	"to",
	"for",
	"of",
	"with",
	"by",
	"from",
	"is",
	"are",
	"was",
	"were",
	"be",
	"been",
	"being",
	"have",
	"has",
	"had",
	"do",
	"does",
	"did",
	"will",
	"would",
	"could",
	"should",
	"may",
	"might",
	"must",
	"can",
	"this",
	"that",
	"these",
	"those",
	"it",
	"its",
	"you",
	"your",
	"we",
	"our",
	"they",
	"their",
	"he",
	"she",
	"him",
	"her",
	"i",
	"my",
	"me",
	"as",
	"if",
	"so",
	"than",
	"then",
	"when",
	"where",
	"which",
	"who",
	"what",
	"how",
	"all",
	"each",
	"every",
	"both",
	"few",
	"more",
	"most",
	"other",
	"some",
	"such",
	"no",
	"not",
	"only",
	"same",
	"just",
	"also",
	"very",
	"about",
	"into",
	"through",
	"during",
	"before",
	"after",
	"above",
	"below",
	"between",
	"under",
	"again",
	"further",
	"once",
	"の",
	"を",
	"に",
	"は",
	"が",
	"で",
	"と",
	"も",
	"や",
	"から",
	"まで",
	"より",
	"など",
	"へ",
	"て",
	"です",
	"ます",
	"した",
	"する",
	"ある",
	"いる",
	"こと",
	"もの",
	"これ",
	"それ",
	"あれ",
	"この",
	"その",
	"あの"
]);
function simpleStem(word) {
	return word.toLowerCase().replace(/ing$/, "").replace(/ed$/, "").replace(/ly$/, "").replace(/ies$/, "y").replace(/es$/, "").replace(/s$/, "");
}
function extractWords(text) {
	if (!text) return [];
	const words = text.toLowerCase().replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, " ").split(/\s+/).filter((w) => w.length > 1).filter((w) => !STOP_WORDS.has(w)).map(simpleStem).filter((w) => w.length > 1);
	return words;
}
function extractPhrases(text) {
	if (!text) return [];
	const words = text.toLowerCase().replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, " ").split(/\s+/).filter((w) => w.length > 1);
	const phrases = [];
	for (let i = 0; i < words.length - 1; i++) {
		const w1 = words[i];
		const w2 = words[i + 1];
		if (!STOP_WORDS.has(w1) && !STOP_WORDS.has(w2)) phrases.push(`${w1} ${w2}`);
	}
	return phrases;
}
function countFrequency(words) {
	const freq = new Map();
	for (const word of words) freq.set(word, (freq.get(word) || 0) + 1);
	return freq;
}
var KeywordAnalyzer = class {
	$;
	filename;
	constructor(html, filename) {
		this.$ = load(html);
		this.filename = filename;
	}
	analyze() {
		const $ = this.$;
		const title = $("title").text().trim();
		const description = $("meta[name=\"description\"]").attr("content") || "";
		const h1Text = $("h1").map((_, el) => $(el).text().trim()).get().join(" ");
		const h2Text = $("h2").map((_, el) => $(el).text().trim()).get().join(" ");
		const bodyText = $("body").text().replace(/\s+/g, " ").trim();
		const titleWords = extractWords(title);
		const descWords = extractWords(description);
		const h1Words = extractWords(h1Text);
		const h2Words = extractWords(h2Text);
		const bodyWords = extractWords(bodyText);
		const titlePhrases = extractPhrases(title);
		const h1Phrases = extractPhrases(h1Text);
		const descPhrases = extractPhrases(description);
		const wordFreq = countFrequency(bodyWords);
		const phraseFreq = countFrequency([
			...extractPhrases(h1Text),
			...extractPhrases(h2Text),
			...extractPhrases(bodyText.substring(0, 2e3))
		]);
		const wordScores = new Map();
		for (const word of titleWords) wordScores.set(word, (wordScores.get(word) || 0) + 10);
		for (const word of h1Words) wordScores.set(word, (wordScores.get(word) || 0) + 8);
		for (const word of descWords) wordScores.set(word, (wordScores.get(word) || 0) + 5);
		for (const word of h2Words) wordScores.set(word, (wordScores.get(word) || 0) + 3);
		for (const [word, freq] of wordFreq) if (wordScores.has(word)) wordScores.set(word, (wordScores.get(word) || 0) + Math.min(freq, 10));
		const phraseScores = new Map();
		for (const phrase of titlePhrases) phraseScores.set(phrase, (phraseScores.get(phrase) || 0) + 15);
		for (const phrase of h1Phrases) phraseScores.set(phrase, (phraseScores.get(phrase) || 0) + 12);
		for (const phrase of descPhrases) phraseScores.set(phrase, (phraseScores.get(phrase) || 0) + 8);
		for (const [phrase, freq] of phraseFreq) if (phraseScores.has(phrase)) phraseScores.set(phrase, (phraseScores.get(phrase) || 0) + Math.min(freq * 2, 10));
		else if (freq >= 2) phraseScores.set(phrase, freq * 2);
		const topWords = [...wordScores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([word, score]) => ({
			word,
			score,
			frequency: wordFreq.get(word) || 0,
			inTitle: titleWords.includes(word),
			inH1: h1Words.includes(word),
			inDescription: descWords.includes(word)
		}));
		const topPhrases = [...phraseScores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([phrase, score]) => ({
			phrase,
			score,
			frequency: phraseFreq.get(phrase) || 0,
			inTitle: titlePhrases.includes(phrase),
			inH1: h1Phrases.includes(phrase)
		}));
		const totalWords = bodyWords.length;
		const densities = topWords.slice(0, 3).map((kw) => ({
			word: kw.word,
			density: totalWords > 0 ? (kw.frequency / totalWords * 100).toFixed(2) + "%" : "0%"
		}));
		const recommendations = [];
		if (topPhrases.length > 0) {
			const topPhrase = topPhrases[0];
			if (!topPhrase.inTitle) recommendations.push(`Consider adding "${topPhrase.phrase}" to your title tag`);
			if (!topPhrase.inH1) recommendations.push(`Consider including "${topPhrase.phrase}" in your H1 heading`);
		}
		if (topWords.length > 0 && !topWords[0].inDescription) recommendations.push(`Primary keyword "${topWords[0].word}" not found in meta description`);
		return {
			file: this.filename,
			timestamp: new Date().toISOString(),
			stats: {
				totalWords,
				uniqueWords: wordFreq.size
			},
			primaryKeywords: topWords,
			keyPhrases: topPhrases,
			density: densities,
			recommendations,
			placement: {
				title,
				h1: h1Text.substring(0, 100),
				description: description.substring(0, 160)
			}
		};
	}
};

//#endregion
//#region src/reporter.ts
const SEVERITY_LEVELS = {
	CRITICAL: "critical",
	IMPORTANT: "important",
	RECOMMENDED: "recommended"
};
function formatSEOTextReport(report) {
	let output = `# SEO Analysis Report: ${report.file}\n\n`;
	output += `Analyzed at: ${report.timestamp}\n`;
	if (report.confidence < 100) {
		output += `\nConfidence: ${report.confidence}%\n`;
		for (const w of report.warnings) output += `   ${w.message}\n`;
	}
	output += `\n## Summary\n`;
	output += `- Critical: ${report.summary.critical}\n`;
	output += `- Important: ${report.summary.important}\n`;
	output += `- Recommended: ${report.summary.recommended}\n`;
	output += `- Passed: ${report.summary.passed}\n`;
	const criticalIssues = report.issues.filter((i) => i.severity === SEVERITY_LEVELS.CRITICAL);
	if (criticalIssues.length > 0) {
		output += `\n## Critical Issues (P0)\n\n`;
		criticalIssues.forEach((issue, idx) => {
			output += `### ${idx + 1}. ${issue.message}\n`;
			output += `**Check**: ${issue.check}\n`;
			output += `**Fix**: ${issue.fix}\n`;
			if (issue.current) output += `**Current**: ${issue.current}\n`;
			output += `\n`;
		});
	}
	const importantIssues = report.issues.filter((i) => i.severity === SEVERITY_LEVELS.IMPORTANT);
	if (importantIssues.length > 0) {
		output += `\n## Important Issues (P1)\n\n`;
		importantIssues.forEach((issue, idx) => {
			output += `### ${idx + 1}. ${issue.message}\n`;
			output += `**Check**: ${issue.check}\n`;
			output += `**Fix**: ${issue.fix}\n`;
			if (issue.current) output += `**Current**: ${issue.current}\n`;
			output += `\n`;
		});
	}
	const recommendedIssues = report.issues.filter((i) => i.severity === SEVERITY_LEVELS.RECOMMENDED);
	if (recommendedIssues.length > 0) {
		output += `\n## Recommended Improvements (P2)\n\n`;
		recommendedIssues.forEach((issue, idx) => {
			output += `### ${idx + 1}. ${issue.message}\n`;
			output += `**Fix**: ${issue.fix}\n`;
			output += `\n`;
		});
	}
	if (report.passed.length > 0) {
		output += `\n## Passed Checks\n\n`;
		report.passed.forEach((p) => {
			output += `- [PASS] ${p.check}: ${p.value}\n`;
		});
	}
	return output;
}
function formatKeywordTextReport(report) {
	let output = `# Keyword Analysis: ${report.file}\n\n`;
	output += `## Stats\n`;
	output += `- Total words: ${report.stats.totalWords}\n`;
	output += `- Unique words: ${report.stats.uniqueWords}\n\n`;
	output += `## Primary Keywords (by score)\n\n`;
	output += `| Keyword | Score | Freq | Title | H1 | Description |\n`;
	output += `|---------|-------|------|-------|----|-----------|\n`;
	for (const kw of report.primaryKeywords) output += `| ${kw.word} | ${kw.score} | ${kw.frequency} | ${kw.inTitle ? "Y" : ""} | ${kw.inH1 ? "Y" : ""} | ${kw.inDescription ? "Y" : ""} |\n`;
	if (report.keyPhrases.length > 0) {
		output += `\n## Key Phrases\n\n`;
		output += `| Phrase | Score | Freq | Title | H1 |\n`;
		output += `|--------|-------|------|-------|----|\n`;
		for (const p of report.keyPhrases) output += `| ${p.phrase} | ${p.score} | ${p.frequency} | ${p.inTitle ? "Y" : ""} | ${p.inH1 ? "Y" : ""} |\n`;
	}
	output += `\n## Keyword Density\n\n`;
	for (const d of report.density) output += `- ${d.word}: ${d.density}\n`;
	if (report.recommendations.length > 0) {
		output += `\n## Recommendations\n\n`;
		for (const rec of report.recommendations) output += `- ${rec}\n`;
	}
	output += `\n## Current Placement\n\n`;
	output += `**Title**: ${report.placement.title || "(empty)"}\n`;
	output += `**H1**: ${report.placement.h1 || "(empty)"}\n`;
	output += `**Description**: ${report.placement.description || "(empty)"}\n`;
	return output;
}
function formatCombinedTextReport(seoReport, keywordReport) {
	let output = formatSEOTextReport(seoReport);
	output += "\n---\n\n";
	output += formatKeywordTextReport(keywordReport);
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
	if (!existsSync(filepath)) {
		console.error(`Error: File not found: ${filepath}`);
		process.exit(1);
	}
	let html;
	try {
		html = readFileSync(filepath, "utf-8");
	} catch (err) {
		console.error(`Error reading file: ${err instanceof Error ? err.message : err}`);
		process.exit(1);
	}
	const filename = filepath.split(/[/\\]/).pop() || filepath;
	if (config.mode === "seo") {
		const analyzer = new SEOAnalyzer(html, filename);
		const report = analyzer.analyze();
		if (config.jsonOutput) console.log(JSON.stringify(report, null, 2));
		else console.log(formatSEOTextReport(report));
	} else if (config.mode === "keywords") {
		const analyzer = new KeywordAnalyzer(html, filename);
		const report = analyzer.analyze();
		if (config.jsonOutput) console.log(JSON.stringify(report, null, 2));
		else console.log(formatKeywordTextReport(report));
	} else {
		const seoAnalyzer = new SEOAnalyzer(html, filename);
		const keywordAnalyzer = new KeywordAnalyzer(html, filename);
		const seoReport = seoAnalyzer.analyze();
		const keywordReport = keywordAnalyzer.analyze();
		if (config.jsonOutput) console.log(JSON.stringify({
			seo: seoReport,
			keywords: keywordReport
		}, null, 2));
		else console.log(formatCombinedTextReport(seoReport, keywordReport));
	}
}
main();

//#endregion