/**
 * Rule: intimidation and coercive control language.
 *
 * Covers conditional threats ("or else"), surveillance indicators
 * ("I know where you live") and degrading commands. These matter
 * even without explicit violent language.
 */

import { DetectionRule, SignalMatch } from '../types';
import { buildFinding, findAll, isNegated, RuleHit } from './helpers';

const SURVEILLANCE =
  /\bi\s+know\s+(where\s+you\s+(live|stay|study|work)|where\s+your\s+(hostel|college|school|home|house|office|area)|your\s+(home|address|school|college|hostel|office|family|parents)|who\s+you\s+are)\b/i;

const CONDITIONAL =
  /\b(or\s+else|you'?d\s+better|consequences|teach\s+you\s+a\s+lesson|make\s+you\s+pay)\b/i;

const DEGRADING = /\b(shut\s+up|shut\s+it)\b/i;

export const intimidationRule: DetectionRule = {
  id: 'intimidation',
  name: 'Intimidation & coercion',
  category: 'Threats & intimidation',
  immediateSafety: true,
  detect(messages): SignalMatch[] {
    const findings: SignalMatch[] = [];

    const surveillanceHits = findAll(messages, SURVEILLANCE).filter(
      (h) => !isNegated(h.message.text, h.index)
    );
    const surveillance = buildFinding({
      ruleId: 'intimidation',
      signal: 'Claim to know your location, family or personal details',
      severity: 'elevated',
      confidence: 'possible',
      hits: surveillanceHits,
      explanation:
        'The sender claims knowledge of your location, family or personal details. Claims like these are a recognised stalking and intimidation tactic, even when the claim cannot be verified.',
      recommendation:
        'Do not confirm or deny any location details. Avoid sharing your live location. If you feel followed or watched, contact local emergency services (India: 112) and tell a trusted person. Save these messages as evidence.',
      limitation:
        'A claim of knowledge is not proof the sender actually has your information. It may be bluffing — but treat it cautiously either way.',
    });
    if (surveillance) findings.push(surveillance);

    const conditionalHits = findAll(messages, CONDITIONAL).filter(
      (h) => !isNegated(h.message.text, h.index)
    );
    const conditional = buildFinding({
      ruleId: 'intimidation',
      signal: 'Conditional threats or intimidating pressure',
      severity: 'caution',
      confidence: 'possible',
      hits: conditionalHits,
      explanation:
        'The conversation uses intimidating conditional language ("or else", "you\'d better", "consequences"). This is a common pressure tactic meant to make you comply out of fear.',
      recommendation:
        'You do not have to comply with demands made under pressure. Keep the messages, avoid provoking the sender, and consider reporting the behaviour on the platform.',
      limitation:
        'Phrases like "consequences" occasionally appear in ordinary or joking contexts; SENTINEL cannot judge tone.',
    });
    if (conditional) findings.push(conditional);

    const degradingHits = findAll(messages, DEGRADING);
    const degrading = buildFinding({
      ruleId: 'intimidation',
      signal: 'Degrading or commanding language',
      severity: 'caution',
      confidence: 'possible',
      hits: degradingHits,
      explanation:
        'The conversation contains degrading commands (for example, "shut up"). Repeated use can be part of an abusive pattern, especially alongside other warning signs.',
      recommendation:
        'You do not have to tolerate abusive language. Consider ending the conversation, muting or blocking the sender, and preserving the messages.',
    });
    if (degrading) findings.push(degrading);

    return findings;
  },
};
