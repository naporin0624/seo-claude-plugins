#!/usr/bin/env node
//#region src/types.d.ts
/**
* Web Resource Checker type definitions
*/
/**
 * Web Resource Checker type definitions
 */
type Severity = 'critical' | 'important' | 'recommended';
interface Issue {
  severity: Severity;
  check: string;
  message: string;
  fix: string;
  line?: number;
  content?: string;
  value?: string;
  url?: string;
  directive?: string;
  count?: number;
  total?: number;
  max?: number;
  sizeBytes?: number;
  maxBytes?: number;
  agents?: string[];
  email?: string;
  expires?: string;
  daysUntilExpiry?: number;
  estimatedTokens?: number;
  sizeKB?: string;
  userAgent?: string;
}
interface PassedCheck {
  check: string;
  value: string;
  length?: number;
  max?: number;
  maxMB?: number;
  maxKB?: number;
  urls?: string[];
  sections?: string[];
  preview?: string;
  line?: number;
  daysUntilExpiry?: number;
  estimatedTokens?: number;
  sizeKB?: string;
  userAgent?: string;
}
interface Summary {
  critical: number;
  important: number;
  recommended: number;
  passed: number;
}
interface FileReport {
  file: string;
  source: string;
  found: boolean;
  valid: boolean;
  summary: Summary;
  issues: Issue[];
  passed: PassedCheck[];
  error?: string;
  stats?: {
    userAgents?: number;
    sitemaps?: number;
  };
  fields?: string[];
  structure?: {
    hasTitle?: boolean;
    hasSummary?: boolean;
    sectionCount?: number;
    linkCount?: number;
  };
}
interface ReportSummary {
  target: string;
  timestamp: string;
  totalFiles: number;
  found: number;
  valid: number;
  issues: {
    critical: number;
    important: number;
    recommended: number;
  };
}
interface AnalysisReport {
  summary: ReportSummary;
  files: Record<string, FileReport>;
}
interface CLIOptions {
  json: boolean;
  only: string | null;
  timeout: number;
} //#endregion
//#region src/analyzer.d.ts
declare class WebResourceAnalyzer {
  private target;
  private isUrl;
  private options;
  private results;
  constructor(target: string, options?: Partial<CLIOptions>);
  analyze(): Promise<AnalysisReport>;
  private getFilesToCheck;
  private checkFile;
  private generateReport;
}

//#endregion
//#region src/reporter.d.ts
declare function formatTextReport(report: AnalysisReport): string;

//#endregion
export { AnalysisReport, CLIOptions, FileReport, Issue, WebResourceAnalyzer, formatTextReport };