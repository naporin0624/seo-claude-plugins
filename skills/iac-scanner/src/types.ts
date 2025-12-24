// tfsec types
export interface TfsecResult {
  results: TfsecFinding[] | null;
}

export interface TfsecFinding {
  rule_id: string;
  long_id: string;
  rule_description: string;
  rule_provider: string;
  rule_service: string;
  impact: string;
  resolution: string;
  links: string[];
  description: string;
  severity: string;
  warning: boolean;
  status: number;
  resource: string;
  location: {
    filename: string;
    start_line: number;
    end_line: number;
  };
}

// Checkov types
export interface CheckovResult {
  check_type: string;
  results: {
    passed_checks: CheckovCheck[];
    failed_checks: CheckovCheck[];
    skipped_checks: CheckovCheck[];
  };
  summary: {
    passed: number;
    failed: number;
    skipped: number;
    parsing_errors: number;
  };
}

export interface CheckovCheck {
  check_id: string;
  bc_check_id?: string;
  check_name: string;
  check_result: { result: string };
  file_path: string;
  file_line_range: [number, number];
  resource: string;
  guideline?: string;
}

// Unified output types
export interface IacFinding {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  message: string;
  resource: string;
  file: string;
  line: number;
  endLine?: number;
  resolution?: string;
  impact?: string;
  references: string[];
}

export interface ScanResult {
  tool: string;
  version: string;
  scanPath: string;
  scanDate: string;
  framework?: string;
  findings: IacFinding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    passed?: number;
    skipped?: number;
  };
}

export interface CliOptions {
  path: string;
  scanner: "auto" | "tfsec" | "checkov";
  framework?: string;
  json: boolean;
  check: boolean;
  verbose: boolean;
}

export type ScannerType = "tfsec" | "checkov";
