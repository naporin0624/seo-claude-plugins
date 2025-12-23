#!/usr/bin/env node

/**
 * robots.txt Validator
 * Validates robots.txt against RFC 9309
 */

// Severity levels
const SEVERITY = {
  CRITICAL: "critical",
  IMPORTANT: "important",
  RECOMMENDED: "recommended",
};

// Issue structure
function createIssue(severity, check, message, fix, details = {}) {
  return { severity, check, message, fix, ...details };
}

// Passed check structure
function createPassed(check, value, details = {}) {
  return { check, value, ...details };
}

// Valid directives per RFC 9309
const VALID_DIRECTIVES = [
  "user-agent",
  "disallow",
  "allow",
  "sitemap",
  "crawl-delay",
  "host", // Non-standard but common
];

/**
 * Validates robots.txt content
 */
export class RobotsValidator {
  constructor(content, source = "robots.txt") {
    this.content = content;
    this.source = source;
    this.issues = [];
    this.passed = [];
    this.rules = [];
    this.sitemaps = [];
  }

  validate() {
    // Check if content exists
    if (!this.content || this.content.trim() === "") {
      this.issues.push(
        createIssue(
          SEVERITY.IMPORTANT,
          "empty-file",
          "robots.txt is empty",
          "Add User-agent and Disallow/Allow directives"
        )
      );
      return this.generateReport();
    }

    // Check file size
    this.checkSize();

    // Parse and validate
    this.parse();
    this.checkUserAgents();
    this.checkSitemap();
    this.checkBlockingAll();

    return this.generateReport();
  }

  checkSize() {
    const sizeBytes = Buffer.byteLength(this.content, "utf8");
    const maxBytes = 512000; // 500KB

    if (sizeBytes > maxBytes) {
      this.issues.push(
        createIssue(
          SEVERITY.IMPORTANT,
          "file-too-large",
          `robots.txt is ${(sizeBytes / 1024).toFixed(1)}KB (max 500KB)`,
          "Reduce file size or simplify rules",
          { sizeBytes, maxBytes }
        )
      );
    } else {
      this.passed.push(
        createPassed("file-size", `${(sizeBytes / 1024).toFixed(1)}KB`, {
          maxKB: 500,
        })
      );
    }
  }

  parse() {
    const lines = this.content.split(/\r?\n/);
    let currentUserAgent = null;
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      // Parse directive
      const colonIndex = trimmed.indexOf(":");
      if (colonIndex === -1) {
        this.issues.push(
          createIssue(
            SEVERITY.IMPORTANT,
            "syntax-error",
            `Invalid syntax at line ${lineNumber}: missing colon`,
            "Use format: Directive: value",
            { line: lineNumber, content: trimmed }
          )
        );
        continue;
      }

      const directive = trimmed.substring(0, colonIndex).trim().toLowerCase();
      const value = trimmed.substring(colonIndex + 1).trim();

      // Validate directive
      if (!VALID_DIRECTIVES.includes(directive)) {
        this.issues.push(
          createIssue(
            SEVERITY.RECOMMENDED,
            "unknown-directive",
            `Unknown directive "${directive}" at line ${lineNumber}`,
            `Valid directives: ${VALID_DIRECTIVES.join(", ")}`,
            { line: lineNumber, directive }
          )
        );
        continue;
      }

      // Handle user-agent
      if (directive === "user-agent") {
        currentUserAgent = value;
        this.rules.push({
          userAgent: value,
          disallow: [],
          allow: [],
          line: lineNumber,
        });
        continue;
      }

      // Handle sitemap
      if (directive === "sitemap") {
        this.sitemaps.push({ url: value, line: lineNumber });
        continue;
      }

      // Handle disallow/allow
      if (directive === "disallow" || directive === "allow") {
        if (!currentUserAgent) {
          this.issues.push(
            createIssue(
              SEVERITY.IMPORTANT,
              "directive-without-agent",
              `${directive} at line ${lineNumber} has no preceding User-agent`,
              "Add User-agent: * before this directive",
              { line: lineNumber }
            )
          );
          continue;
        }

        const lastRule = this.rules[this.rules.length - 1];
        if (directive === "disallow") {
          lastRule.disallow.push(value);
        } else {
          lastRule.allow.push(value);
        }
      }
    }
  }

  checkUserAgents() {
    if (this.rules.length === 0) {
      this.issues.push(
        createIssue(
          SEVERITY.IMPORTANT,
          "no-user-agent",
          "No User-agent directive found",
          "Add User-agent: * to apply rules to all crawlers"
        )
      );
      return;
    }

    // Check for wildcard user-agent
    const hasWildcard = this.rules.some((r) => r.userAgent === "*");
    if (hasWildcard) {
      this.passed.push(createPassed("user-agent-wildcard", "User-agent: * found"));
    } else {
      this.issues.push(
        createIssue(
          SEVERITY.RECOMMENDED,
          "no-wildcard-agent",
          "No wildcard User-agent: * found",
          "Add User-agent: * as fallback for unspecified crawlers",
          { agents: this.rules.map((r) => r.userAgent) }
        )
      );
    }

    this.passed.push(
      createPassed("user-agents", `${this.rules.length} user-agent blocks found`)
    );
  }

  checkSitemap() {
    if (this.sitemaps.length === 0) {
      this.issues.push(
        createIssue(
          SEVERITY.RECOMMENDED,
          "missing-sitemap",
          "No Sitemap directive found",
          "Add Sitemap: https://example.com/sitemap.xml for better discoverability"
        )
      );
      return;
    }

    // Validate sitemap URLs
    for (const sitemap of this.sitemaps) {
      if (
        !sitemap.url.startsWith("http://") &&
        !sitemap.url.startsWith("https://")
      ) {
        this.issues.push(
          createIssue(
            SEVERITY.IMPORTANT,
            "relative-sitemap-url",
            `Sitemap URL at line ${sitemap.line} is not absolute`,
            "Use absolute URL: Sitemap: https://example.com/sitemap.xml",
            { line: sitemap.line, url: sitemap.url }
          )
        );
      }
    }

    this.passed.push(
      createPassed("sitemap", `${this.sitemaps.length} Sitemap directive(s) found`, {
        urls: this.sitemaps.map((s) => s.url),
      })
    );
  }

  checkBlockingAll() {
    for (const rule of this.rules) {
      // Check for blocking entire site
      if (
        rule.userAgent === "*" &&
        rule.disallow.includes("/") &&
        rule.allow.length === 0
      ) {
        this.issues.push(
          createIssue(
            SEVERITY.CRITICAL,
            "blocking-all",
            "Disallow: / blocks all crawlers from entire site",
            "Remove or modify if unintended. This prevents search engine indexing.",
            { userAgent: rule.userAgent, line: rule.line }
          )
        );
      }

      // Check for specific bot blocking (informational)
      if (
        rule.userAgent !== "*" &&
        rule.disallow.includes("/") &&
        rule.allow.length === 0
      ) {
        this.passed.push(
          createPassed("bot-blocked", `${rule.userAgent} is blocked from site`, {
            userAgent: rule.userAgent,
          })
        );
      }
    }
  }

  generateReport() {
    return {
      file: "robots.txt",
      source: this.source,
      found: true,
      valid:
        this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length === 0,
      summary: {
        critical: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL)
          .length,
        important: this.issues.filter((i) => i.severity === SEVERITY.IMPORTANT)
          .length,
        recommended: this.issues.filter(
          (i) => i.severity === SEVERITY.RECOMMENDED
        ).length,
        passed: this.passed.length,
      },
      issues: this.issues,
      passed: this.passed,
      stats: {
        userAgents: this.rules.length,
        sitemaps: this.sitemaps.length,
      },
    };
  }
}

/**
 * Creates a "not found" report
 */
export function createNotFoundReport(source) {
  return {
    file: "robots.txt",
    source,
    found: false,
    valid: true, // robots.txt is optional
    summary: { critical: 0, important: 0, recommended: 1, passed: 0 },
    issues: [
      createIssue(
        SEVERITY.RECOMMENDED,
        "not-found",
        "robots.txt not found",
        "Consider adding robots.txt to control crawler access"
      ),
    ],
    passed: [],
  };
}
