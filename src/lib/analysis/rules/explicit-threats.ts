/**
 * Rule: explicit threats of violence.
 *
 * Matches direct, first-person or second-person threatening language.
 * Negated forms ("I will not hurt you") are excluded where the
 * simple negation window detects them.
 */

import { DetectionRule, SignalMatch } from '../types';
import { buildFinding, findAll, isNegated, RuleHit } from './helpers';

const THREAT_PATTERNS: RegExp[] = [
  /\b(i'?ll|i will|i'?m going to|let me)\s+(kill|murder|hurt|harm|beat up|ruin|track down|find)\b/i,
  /\b(kill|murder)\s+(you|yourself|u\b)/i,
  /\byou'?ll\s+(regret|pay|suffer|be sorry)\b/i,
  /\b(beat you up|hurt you|harm you|ruin your (life|career|reputation|future))\b/i,
  /\b(you will die|you'?ll die|die (today|tonight|now))\b/i,
  /\b(i'?ll\s+make\s+you\s+(pay|suffer|regret))\b/i,
];

export const explicitThreatsRule: DetectionRule = {
  id: 'explicit-threats',
  name: 'Explicit threats of violence',
  category: 'Threats & intimidation',
  immediateSafety: true,
  detect(messages): SignalMatch[] {
    const hits: RuleHit[] = [];
    for (const pattern of THREAT_PATTERNS) {
      for (const hit of findAll(messages, pattern)) {
        if (!isNegated(hit.message.text, hit.index)) {
          hits.push(hit);
        }
      }
    }
    if (hits.length === 0) return [];

    const finding = buildFinding({
      ruleId: 'explicit-threats',
      signal: 'Explicit threat of violence or harm',
      severity: 'elevated',
      confidence: 'supported',
      hits,
      explanation:
        'The conversation contains direct threatening language directed at you. Threats like these should always be taken seriously, even if the sender later claims they were said in anger.',
      recommendation:
        'Prioritise your safety. Do not provoke or escalate the exchange. If you feel unsafe now, contact local emergency services (India: 112) or a trusted person. Keep the messages as evidence and consider reporting to the police and the platform.',
      limitation:
        'SENTINEL cannot verify intent; language can be hyperbolic, quoted, or part of fiction. The absence of explicit violent words does NOT mean a conversation is safe.',
    });
    return finding ? [finding] : [];
  },
};
