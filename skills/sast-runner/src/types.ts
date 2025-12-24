export interface SemgrepResult {
  results: SemgrepFinding[];
  errors: SemgrepError[];
  version: string;
}

export interface SemgrepFinding {
  check_id: string;
  path: string;
  start: { line: number; col: number };
  end: { line: number; col: number };
  extra: {
    message: string;
    severity: string;
    metadata: {
      cwe?: string[];
      owasp?: string[];
      confidence?: string;
      category?: string;
      subcategory?: string[];
      technology?: string[];
      references?: string[];
    };
    lines: string;
    fix?: string;
  };
}

export interface SemgrepError {
  message: string;
  level: string;
}

export interface SastFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  message: string;
  file: string;
  line: number;
  endLine: number;
  code: string;
  cwes: string[];
  owasp: string[];
  category: string;
  fix?: string;
  references: string[];
}

export interface ScanResult {
  tool: string;
  version: string;
  scanPath: string;
  scanDate: string;
  config: string;
  findings: SastFinding[];
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
  config: string;
  json: boolean;
  check: boolean;
  listConfigs: boolean;
  verbose: boolean;
}

export const CONFIGS = {
  auto: 'auto',
  'security-audit': 'p/security-audit',
  'owasp-top-ten': 'p/owasp-top-ten',
  'cwe-top-25': 'p/cwe-top-25',
  default: 'p/default',
  javascript: 'p/javascript',
  typescript: 'p/typescript',
  python: 'p/python',
  golang: 'p/golang',
  java: 'p/java',
  ruby: 'p/ruby',
} as const;

export type ConfigName = keyof typeof CONFIGS;
