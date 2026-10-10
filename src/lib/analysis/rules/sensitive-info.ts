/**
 * Rule: attempts to obtain sensitive information (phishing /
 * identity theft / doxxing preparation).
 *
 * Matches sensitive data items only when a request verb appears
 * in the same message, to reduce false positives on ordinary
 * sentences like "I changed my password".
 */

import { DetectionRule, SignalMatch } from '../types';
import { buildFinding, findAll, RuleHit } from './helpers';

const SENSITIVE_ITEMS =
  /\b(passwords?|otps?|one[- ]time\s+(password|passcode)|pin\s*(codes?)?|cvvs?|card\s+numbers?|bank\s+account\s+numbers?|account\s+numbers?|aadhaar\s+(numbers?|card|details?)|pan\s+card|social\s+security\s+numbers?|passport\s+numbers?|driver'?s\s+licen[cs]e\s+numbers?|credit\s+card\s+details?)\b/i;

const REQUEST_VERBS =
  /\b(send|share|provide|give|tell|need|want|verify|confirm|update|enter|type|fill)\b/i;

const PHISHING_VERIFY =
  /\b(verify|confirm|update)\s+your\s+(account|details?|information|identity|kyc)\b/i;

const URGENCY = /\b(urgent|urgently|immediately|right\s+now|asap|instantly)\b/i;

export const sensitiveInfoRule: DetectionRule = {
  id: 'sensitive-info',
  name: 'Requests for sensitive information',
  category: 'Social engineering & fraud',
  detect(messages): SignalMatch[] {
    const findings: SignalMatch[] = [];

    const requestHits: RuleHit[] = [];
    let urgentHit = false;
    for (const message of messages) {
      if (SENSITIVE_ITEMS.test(message.text) && REQUEST_VERBS.test(message.text)) {
        requestHits.push({ message, index: 0, length: 0, text: message.text });
        if (URGENCY.test(message.text)) urgentHit = true;
      }
    }

    const requestFinding = buildFinding({
      ruleId: 'sensitive-info',
      signal: urgentHit
        ? 'Urgent request for passwords, OTPs or financial details'
        : 'Request for passwords, OTPs or personal identifiers',
      severity: urgentHit ? 'elevated' : 'caution',
      confidence: 'possible',
      hits: requestHits,
      explanation:
        'The conversation asks for sensitive information such as passwords, OTPs, PINs, card or identity numbers. Legitimate services never ask for passwords or OTPs in chat; urgent requests for these details are a hallmark of phishing and account takeover attempts.',
      recommendation:
        'Never share passwords, OTPs, PINs, or card details in chat — even with someone claiming to be from a bank or the police. Verify through official channels only (the phone number or website printed on your card or bill). If you already shared something, change the password immediately and contact your bank.',
      limitation:
        'Context matters: people sometimes discuss passwords in trusted personal conversations. SENTINEL cannot tell who is asking.',
    });
    if (requestFinding) findings.push(requestFinding);

    const phishingHits = findAll(messages, PHISHING_VERIFY);
    const phishing = buildFinding({
      ruleId: 'sensitive-info',
      signal: 'Account verification language (phishing pattern)',
      severity: 'caution',
      confidence: 'possible',
      hits: phishingHits,
      explanation:
        'The conversation uses "verify your account"-style language. This phrasing is widely used in phishing messages to steal credentials or install malware.',
      recommendation:
        'Do not click links or enter details from unsolicited "verification" messages. Go directly to the official app or website instead.',
    });
    if (phishing) findings.push(phishing);

    return findings;
  },
};
