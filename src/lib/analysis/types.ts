/**
 * Shared typed data models for SENTINEL's analysis engine.
 * These types are used by the analysis rules, the escalation engine,
 * and every UI component that renders findings — keeping business
 * logic out of page components.
 */

export type Severity = 'informational' | 'caution' | 'elevated';

export type Confidence = 'supported' | 'possible' | 'uncertain';

export interface ConversationMessage {
  id: string;
  /** 1-based position in the conversation */
  index: number;
  /** Sender name when the conversation exposes it, otherwise null (unknown). */
  sender: string | null;
  text: string;
  /** Parsed timestamp when the user supplied one, otherwise null (unknown). */
  timestamp: Date | null;
  /** Raw timestamp string exactly as supplied by the user. */
  rawTimestamp: string | null;
}

export interface SignalMatch {
  ruleId: string;
  /** Short human-readable name of the detected signal. */
  signal: string;
  severity: Severity;
  /** How strongly the evidence supports the signal. */
  confidence: Confidence;
  /** Supporting text taken verbatim from the user's input. */
  excerpt: string;
  /** 1-based indexes of the messages that triggered this finding. */
  messageIndexes: number[];
  explanation: string;
  recommendation: string;
  limitation?: string;
}

export interface EscalationAssessment {
  datedSignalMessages: number;
  totalSignalMessages: number;
  dateCoverage: 'none' | 'partial' | 'full';
  repeatedContact: { detected: boolean; detail: string };
  severityTrend: 'increasing' | 'stable' | 'decreasing' | 'insufficient-data';
  trendExplanation: string;
  distinctSignalTypes: number;
  patternSummary: string;
}

export type OverallConcern = 'no-strong-indicators' | 'caution' | 'elevated-concern';

export interface AnalysisResult {
  /** ISO timestamp of when the analysis ran (metadata only; never affects findings). */
  analyzedAt: string;
  messageCount: number;
  datedMessageCount: number;
  findings: SignalMatch[];
  escalation: EscalationAssessment;
  overallConcern: OverallConcern;
  overallExplanation: string;
  recommendations: string[];
  limitations: string[];
  /** True when findings suggest possible immediate danger — show emergency guidance. */
  immediateSafetyAlert: boolean;
}

export interface DetectionRule {
  id: string;
  name: string;
  category: string;
  /** When true, an elevated finding from this rule triggers the immediate-safety banner. */
  immediateSafety?: boolean;
  detect(messages: ConversationMessage[]): SignalMatch[];
}

export const SEVERITY_SCORE: Record<Severity, number> = {
  informational: 1,
  caution: 2,
  elevated: 3,
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  informational: 'Informational',
  caution: 'Caution',
  elevated: 'Elevated concern',
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  supported: 'Strongly supported by the text',
  possible: 'Possible — needs context',
  uncertain: 'Uncertain — user-reported or weak signal',
};
