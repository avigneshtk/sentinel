/**
 * Rule: manufactured urgency and demands for secrecy.
 *
 * Pressure to act "right now" and to keep things "secret" are
 * classic social-engineering tactics used to bypass judgement.
 */

import { DetectionRule, SignalMatch } from '../types';
import { buildFinding, findAll, isNegated, RuleHit } from './helpers';

const SECRECY_PATTERN =
  /\b(don'?t\s+tell\s+anyone|do\s+not\s+tell\s+anyone|keep\s+(this\s+)?(secret|quiet)|secret\s+between\s+(us|you\s+and\s+me)|nobody\s+(else\s+)?(can|must|should|needs)\s+(to\s+)?know|don'?t\s+talk\s+to\s+(anyone|the\s+police|your\s+parents|your\s+friends|your\s+family)|don'?t\s+(call|inform|tell)\s+(the\s+)?(police|authorities|anyone)|delete\s+(this\s+)?(message|chat|conversation|evidence|screenshot))\b/i;

const URGENCY_PATTERN = /\b(right\s+now|immediately|asap|right\s+away|this\s+very\s+(instant|moment))\b/i;
const ACTION_VERB = /\b(send|give|do|act|transfer|pay|call|meet|share|confirm|reply)\b/i;

export const urgencySecrecyRule: DetectionRule = {
  id: 'urgency-secrecy',
  name: 'Manufactured urgency & secrecy demands',
  category: 'Social engineering & fraud',
  detect(messages): SignalMatch[] {
    const findings: SignalMatch[] = [];

    const secrecyHits: RuleHit[] = [];
    for (const message of messages) {
      for (const hit of findAll([message], SECRECY_PATTERN)) {
        if (!isNegated(message.text, hit.index)) secrecyHits.push(hit);
      }
    }

    const secrecy = buildFinding({
      ruleId: 'urgency-secrecy',
      signal: 'Demand for secrecy or to cut off other support',
      severity: 'caution',
      confidence: 'possible',
      hits: secrecyHits,
      explanation:
        'The conversation asks you to keep things secret, avoid telling friends or family, avoid the police, or delete messages. Secrecy demands are a recognised control tactic: they isolate you and make it harder to get help.',
      recommendation:
        'Be cautious of anyone who insists you keep a conversation secret or avoid the police. Talk to a trusted person, and remember that reporting a threat is not "causing trouble" — it is a normal safety step.',
      limitation:
        'Secrecy is normal for surprises and private matters; SENTINEL cannot judge the context.',
    });
    if (secrecy) findings.push(secrecy);

    // Urgency only counts when combined with a request to act.
    const urgencyHits: RuleHit[] = [];
    for (const message of messages) {
      const urgencyMatch = message.text.match(URGENCY_PATTERN);
      if (!urgencyMatch) continue;
      if (!ACTION_VERB.test(message.text)) continue;
      if (isNegated(message.text, urgencyMatch.index ?? 0)) continue;
      urgencyHits.push({
        message,
        index: urgencyMatch.index ?? 0,
        length: urgencyMatch[0].length,
        text: urgencyMatch[0],
      });
    }

    const urgency = buildFinding({
      ruleId: 'urgency-secrecy',
      signal: 'Manufactured urgency to act immediately',
      severity: 'caution',
      confidence: 'possible',
      hits: urgencyHits,
      explanation:
        'The conversation pushes you to act "right now" or "immediately" in connection with a request. Manufactured urgency is designed to stop you from pausing, checking, or asking someone you trust.',
      recommendation:
        'Slow down. Any legitimate request will survive a pause. Verify unexpected urgent requests through a separate channel before acting, sending money, or sharing information.',
      limitation:
        'Urgency is normal in genuine emergencies; SENTINEL cannot tell real emergencies from manufactured ones.',
    });
    if (urgency) findings.push(urgency);

    return findings;
  },
};
