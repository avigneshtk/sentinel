/**
 * Rule: impersonation indicators and fake-authority claims.
 *
 * SENTINEL cannot verify anyone's identity. These findings
 * only flag language commonly used in impersonation and
 * phishing, with an explicit uncertainty note.
 */

import { DetectionRule, SignalMatch } from '../types';
import { buildFinding, findAll, RuleHit } from './helpers';

const IMPOSTOR_CLAIM =
  /\b(i\s+am\s+(an?\s+)?(official|bank\s+(manager|representative|official)|police\s+(officer|official)|cyber\s+(cell|officer|official)|government\s+(official|agent)|from\s+(the\s+)?(bank|police|cyber\s+cell|income\s+tax|reserve\s+bank|government))|a\s+(bank\s+official|police\s+officer))\b/i;

const OFFICIAL_NOTICE =
  /\b(this\s+is\s+(an?\s+)?official\s+(notice|communication|message|alert)|your\s+(account|kyc)\s+(has\s+been|is\s+|will\s+be\s+)(suspended|locked|blocked|frozen|deactivated|permanently\s+blocked)|suspicious\s+activity\s+(on\s+your\s+account|detected))\b/i;

export const impersonationRule: DetectionRule = {
  id: 'impersonation',
  name: 'Impersonation & fake-authority indicators',
  category: 'Impersonation',
  detect(messages): SignalMatch[] {
    const findings: SignalMatch[] = [];

    const impostorHits = findAll(messages, IMPOSTOR_CLAIM);
    const impostor = buildFinding({
      ruleId: 'impersonation',
      signal: 'Claim to be an official, bank or police officer',
      severity: 'caution',
      confidence: 'possible',
      hits: impostorHits,
      explanation:
        'The conversation contains claims of being an official, bank employee, or police officer. Impersonators use authority claims to extract information, money, or compliance. SENTINEL cannot verify anyone\'s identity.',
      recommendation:
        'Verify identity independently — hang up and call the organisation back on the number printed on your card or their official website. Banks and police never ask for passwords, OTPs, or payments over chat.',
      limitation:
        'A claim of authority is not proof of impersonation, and a real official can also appear in a conversation. SENTINEL cannot verify identity either way.',
    });
    if (impostor) findings.push(impostor);

    const noticeHits = findAll(messages, OFFICIAL_NOTICE);
    const notice = buildFinding({
      ruleId: 'impersonation',
      signal: 'Fake official notice or account-suspension warning',
      severity: 'caution',
      confidence: 'possible',
      hits: noticeHits,
      explanation:
        'The conversation uses fake-notice language ("official notice", "account suspended", "suspicious activity detected"). This phrasing is widely used in phishing and fraud to create panic.',
      recommendation:
        'Do not click links or share details from unsolicited "official" notices. Open the official app or website directly to check your account status.',
    });
    if (notice) findings.push(notice);

    return findings;
  },
};
