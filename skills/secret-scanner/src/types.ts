export interface GitleaksFinding {
  Description: string;
  StartLine: number;
  EndLine: number;
  StartColumn: number;
  EndColumn: number;
  Match: string;
  Secret: string;
  File: string;
  SymlinkFile: string;
  Commit: string;
  Entropy: number;
  Author: string;
  Email: string;
  Date: string;
  Message: string;
  Tags: string[];
  RuleID: string;
  Fingerprint: string;
}

export interface SecretFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  file: string;
  line: number;
  secret: string;
  commit: string;
  author: string;
  date: string;
  cwes: string[];
}

export interface ScanResult {
  tool: string;
  version: string;
  scanPath: string;
  scanDate: string;
  findings: SecretFinding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface CliOptions {
  path: string;
  json: boolean;
  check: boolean;
  verbose: boolean;
}

export const SEVERITY_MAP: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
  // Critical - Direct access to cloud/infrastructure
  'aws-access-key-id': 'critical',
  'aws-secret-access-key': 'critical',
  'gcp-api-key': 'critical',
  'azure-storage-key': 'critical',
  'private-key': 'critical',
  'ssh-private-key': 'critical',
  'rsa-private-key': 'critical',

  // High - Authentication credentials
  'password': 'high',
  'api-key': 'high',
  'github-pat': 'high',
  'gitlab-pat': 'high',
  'npm-access-token': 'high',
  'slack-token': 'high',
  'stripe-api-key': 'high',
  'twilio-api-key': 'high',
  'sendgrid-api-key': 'high',
  'mailchimp-api-key': 'high',

  // Medium - Tokens and secrets
  'generic-api-key': 'medium',
  'jwt': 'medium',
  'oauth-token': 'medium',
  'bearer-token': 'medium',

  // Low - Generic patterns
  'generic-credential': 'low',
  'password-in-url': 'low',
};

export const CWE_MAP: Record<string, string[]> = {
  critical: ['CWE-798', 'CWE-321'],
  high: ['CWE-798', 'CWE-259'],
  medium: ['CWE-312'],
  low: ['CWE-312'],
};
