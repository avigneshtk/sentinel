/**
 * Rule: financial pressure, payment demands and scam indicators.
 */

import { DetectionRule, SignalMatch } from '../types';
import { buildFinding, findAll, isNegated, RuleHit } from './helpers';

const MONEY_PATTERN =
  /\b(send\s+(me\s+|the\s+)?(money|₹|\$|rs\.?\s?\d|\d[\d,\.]*\s*(rupees|rs\b))|transfer\s+(the\s+)?(money|funds|amount|balance)|pay\s+(me|up|the\s+amount|for\s+the\s+release)|\d[\d,\.]*\s*(rupees|rs\b|₹)|gift\s+cards?|google\s+pay|paytm|phonepe|bhim|\bupi\b|bitcoin|cryptocurrency|crypto\s+(payment|wallet|exchange)|double\s+your\s+money|lottery|prize\s+money|claim\s+your\s+(prize|refund|reward)|processing\s+fee|advance\s+fee|urgent(ly)?\s+(need|require|send)\s+money)\b/i;

const EXTORTION_CONTEXT =
  /\b(or\s+else|consequences|i'?ll\s+(post|share|send|leak)|otherwise)\b/i;

export const moneyPressureRule: DetectionRule = {
  id: 'money-pressure',
  name: 'Financial pressure & payment demands',
  category: 'Social engineering & fraud',
  detect(messages): SignalMatch[] {
    const hits: RuleHit[] = [];
    let extortionContext = false;

    for (const message of messages) {
      const match = message.text.match(MONEY_PATTERN);
      if (!match) continue;
      if (isNegated(message.text, match.index ?? 0)) continue;
      hits.push({ message, index: match.index ?? 0, length: match[0].length, text: match[0] });
      if (EXTORTION_CONTEXT.test(message.text)) extortionContext = true;
    }

    const finding = buildFinding({
      ruleId: 'money-pressure',
      signal: extortionContext
        ? 'Demand for money under threat (extortion pattern)'
        : 'Pressure to send money or make payments',
      severity: extortionContext ? 'elevated' : 'caution',
      confidence: 'possible',
      hits,
      explanation:
        extortionContext
          ? 'The conversation demands money while referencing threats or consequences. Paying under threat rarely stops the demands — it marks the victim as willing to pay.'
          : 'The conversation pressures you to send money, make payments, or use payment channels (UPI, gift cards, crypto). Urgency plus payment requests is a hallmark of scams and romance/friend fraud.',
      recommendation:
        'Do not send money, gift cards, or cryptocurrency to someone who pressures you. Stop and verify through a separate channel, or talk the situation through with a trusted person. If money was already sent, contact your bank immediately and report to the cyber crime portal (India: cybercrime.gov.in / 1930).',
      limitation:
        'Payment requests are normal between friends and family. SENTINEL cannot verify the relationship or the legitimacy of the request.',
    });
    return finding ? [finding] : [];
  },
};
