/**
 * Shared helpers for detection rules.
 * Every rule is a pure function over the parsed message list so it can be
 * unit-tested in isolation and reused by the escalation engine.
 */

import {
  ConversationMessage,
  Confidence,
  SEVERITY_SCORE,
  Severity,
  SignalMatch,
} from '../types';

export interface RuleHit {
  message: ConversationMessage;
  /** Match index within message.text */
  index: number;
  length: number;
  /** Matched substring, verbatim from user input. */
  text: string;
}

/** Run a (possibly global) regex across all messages and collect hits. */
export function findAll(messages: ConversationMessage[], pattern: RegExp): RuleHit[] {
  const hits: RuleHit[] = [];
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  for (const message of messages) {
    const re = new RegExp(pattern.source, flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(message.text)) !== null) {
      hits.push({ message, index: match.index, length: match[0].length, text: match[0] });
      if (match.index === re.lastIndex) re.lastIndex += 1;
    }
  }
  return hits;
}

/** Count hits grouped by sender (hits with a null sender share a bucket). */
export function countBySender(hits: RuleHit[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const hit of hits) {
    const key = hit.message.sender ?? '(unknown sender)';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/**
 * Rough negation check: looks for common negators shortly before a match.
 * Handles simple cases ("I will not hurt you"); it is intentionally
 * conservative and documented as a limitation.
 */
export function isNegated(text: string, matchIndex: number, windowChars = 45): boolean {
  const slice = text.slice(Math.max(0, matchIndex - windowChars), matchIndex);
  return /\b(not|never|no|don'?t|dont|doesn'?t|doesnt|didn'?t|didnt|won'?t|wont|isn'?t|isnt|aren'?t|arent|can'?t|cant|cannot|without)\b/i.test(
    slice
  );
}

/** Short verbatim excerpt around a hit, for display. */
export function excerptAround(
  text: string,
  matchIndex: number,
  matchLength: number,
  maxLen = 110
): string {
  const start = Math.max(0, matchIndex - Math.floor((maxLen - matchLength) / 2));
  const end = Math.min(text.length, start + maxLen);
  let excerpt = text.slice(start, end).trim();
  if (start > 0) excerpt = `…${excerpt}`;
  if (end < text.length) excerpt = `${excerpt}…`;
  return excerpt;
}

export interface FindingArgs {
  ruleId: string;
  signal: string;
  severity: Severity;
  confidence: Confidence;
  hits: RuleHit[];
  explanation: string;
  recommendation: string;
  limitation?: string;
  excerpt?: string;
}

export function buildFinding(args: FindingArgs): SignalMatch | null {
  if (args.hits.length === 0) return null;
  const first = args.hits[0];
  return {
    ruleId: args.ruleId,
    signal: args.signal,
    severity: args.severity,
    confidence: args.confidence,
    excerpt: args.excerpt ?? excerptAround(first.message.text, first.index, first.length),
    messageIndexes: [...new Set(args.hits.map((h) => h.message.index))].sort((a, b) => a - b),
    explanation: args.explanation,
    recommendation: args.recommendation,
    limitation: args.limitation,
  };
}

export function severityTotal(severities: Severity[]): number {
  return severities.reduce((sum, s) => sum + SEVERITY_SCORE[s], 0);
}
