// Hadolint types
export interface HadolintFinding {
  line: number;
  code: string;
  message: string;
  column: number;
  file: string;
  level: "error" | "warning" | "info" | "style";
}

// Trivy image types
export interface TrivyImageResult {
  SchemaVersion: number;
  ArtifactName: string;
  ArtifactType: string;
  Metadata?: {
    ImageID?: string;
    RepoTags?: string[];
    OS?: { Family: string; Name: string };
  };
  Results?: TrivyImageTarget[];
}

export interface TrivyImageTarget {
  Target: string;
  Class: string;
  Type: string;
  Vulnerabilities?: TrivyImageVulnerability[];
}

export interface TrivyImageVulnerability {
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
  Layer?: { DiffID: string };
}

// Unified output types
export interface DockerfileFinding {
  id: string;
  severity: "error" | "warning" | "info" | "style";
  line: number;
  message: string;
  file: string;
}

export interface ImageFinding {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  package: string;
  installedVersion: string;
  fixedVersion?: string;
  title: string;
  description?: string;
  cvss?: number;
  cwes: string[];
  layer?: string;
}

export interface DockerfileScanResult {
  tool: string;
  version: string;
  scanPath: string;
  scanDate: string;
  findings: DockerfileFinding[];
  summary: {
    total: number;
    error: number;
    warning: number;
    info: number;
    style: number;
  };
}

export interface ImageScanResult {
  tool: string;
  version: string;
  image: string;
  scanDate: string;
  os?: { family: string; name: string };
  findings: ImageFinding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export type ScanResult = DockerfileScanResult | ImageScanResult;

export interface CliOptions {
  command: "lint" | "image" | "check" | "help";
  target: string;
  json: boolean;
  verbose: boolean;
}
