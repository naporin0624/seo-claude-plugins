// npm audit types
export interface NpmAuditResult {
  auditReportVersion: number;
  vulnerabilities: Record<string, NpmVulnerability>;
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    };
  };
}

export interface NpmVulnerability {
  name: string;
  severity: string;
  isDirect: boolean;
  via: Array<string | NpmVulnerabilityDetail>;
  effects: string[];
  range: string;
  nodes: string[];
  fixAvailable: boolean | { name: string; version: string };
}

export interface NpmVulnerabilityDetail {
  source: number;
  name: string;
  dependency: string;
  title: string;
  url: string;
  severity: string;
  cwe: string[];
  cvss: { score: number; vectorString: string };
  range: string;
}

// Trivy types
export interface TrivyResult {
  SchemaVersion: number;
  Results?: TrivyTarget[];
}

export interface TrivyTarget {
  Target: string;
  Class: string;
  Type: string;
  Vulnerabilities?: TrivyVulnerability[];
}

export interface TrivyVulnerability {
  VulnerabilityID: string;
  PkgName: string;
  InstalledVersion: string;
  FixedVersion?: string;
  Title?: string;
  Description?: string;
  Severity: string;
  CVSS?: Record<string, { V3Score?: number }>;
  CweIDs?: string[];
  References?: string[];
  PublishedDate?: string;
}

// Unified output types
export interface ScaFinding {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  package: string;
  installedVersion: string;
  fixedVersion?: string;
  title: string;
  description?: string;
  cvss?: number;
  cwes: string[];
  references: string[];
}

export interface ScanResult {
  tool: string;
  version: string;
  scanPath: string;
  scanDate: string;
  findings: ScaFinding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export interface CliOptions {
  path: string;
  scanner: "auto" | "npm" | "trivy";
  json: boolean;
  check: boolean;
  verbose: boolean;
}

export type ScannerType = "npm" | "trivy";
