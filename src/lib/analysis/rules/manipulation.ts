/**
 * Rule: emotional manipulation and guilt-tripping.
 *
 * Deliberately conservative — only strong, explicit formulas
 * are matched, and findings are informational so ordinary
 * affectionate conversations are not flagged.
 */

import { DetectionRule, SignalMatch } from '../types';
import { buildFinding, findAll, isNegated, RuleHit } from './helpers';

const MANIPULATION_PATTERN =
  /\b(if\s+you\s+(really\s+)?(loved|cared\s+about|trusted)\s+me|you\s+owe\s+me|after\s+all\s+i\s+(have\s+)?done\s+for\s+you|no\s+one\s+else\s+(will|would)\s+(love|care\s+about|want)\s+you|i\s+did\s+all\s+this\s+for\s+you|you\s+made\s+me\s+(do|say)\s+this)\b/i;

export const manipulationRule: DetectionRule = {
  id: 'manipulation',
  name: 'Emotional manipulation',
  category: 'Coercion & manipulation',
  detect(messages): SignalMatch[] {
    const hits: RuleHit[] = [];
    for (const hit of findAll(messages, MANIPULATION_PATTERN)) {
      if (!isNegated(hit.message.text, hit.index)) hits.push(hit);
    }

    const finding = buildFinding({
      ruleId: 'manipulation',
      signal: 'Guilt-tripping or emotional pressure',
      severity: 'informational',
      confidence: 'uncertain',
      hits,
      explanation:
        'The conversation contains guilt-tripping phrasing ("if you really loved me", "you owe me"). Used repeatedly, this is a manipulation tactic that makes it harder to set boundaries.',
      recommendation:
        'Notice how you feel after these messages. If you feel pressured or unable to say no, talk to a trusted person. You are not obligated to justify your boundaries.',
      limitation:
        'These phrases sometimes appear in ordinary, affectionate conversations. SENTINEL cannot judge tone or relationship history.',
    });
    return finding ? [finding] : [];
  },
};
