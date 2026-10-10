/**
 * Rule: image-based abuse threats (sextortion / blackmail)
 * and requests for intimate content.
 *
 * Two separate rules so that "threatening to share" and
 * "requesting" are tracked distinctly.
 */

import { DetectionRule, SignalMatch } from '../types';
import { buildFinding, findAll, isNegated, RuleHit } from './helpers';

const THREAT_TO_SHARE =
  /\b(post|leak|share|upload|distribute|send)\b[^.!?\n]{0,60}\b(your\s+)?(nudes|intimate\s+(photos?|pictures?|images?|videos?)|private\s+(photos?|pictures?|images?|videos?)|explicit\s+(photos?|pictures?|images?))\b/i;

const SHARE_IF =
  /\b(nudes|intimate\s+photos?|private\s+photos?)\b[^.!?\n]{0,60}\b(post|leak|share|send|upload|distribute)\b/i;

const CONDITIONAL_SHARE =
  /\b(if\s+you\s+don'?t\s+(send|pay|do\s+what\s+i\s+say))[^.!?\n]{0,60}(photos?|videos?|images?|pictures?)\b/i;

const POST_PICTURES =
  /\b(post|leak|share|upload|distribute)\s+(your\s+)?(pictures|photos|images|videos|nudes)\b/i;

export const imageAbuseThreatRule: DetectionRule = {
  id: 'image-abuse-threat',
  name: 'Threats to share intimate images',
  category: 'Image-based abuse',
  immediateSafety: true,
  detect(messages): SignalMatch[] {
    const hits: RuleHit[] = [];
    for (const pattern of [THREAT_TO_SHARE, SHARE_IF, CONDITIONAL_SHARE, POST_PICTURES]) {
      for (const hit of findAll(messages, pattern)) {
        if (!isNegated(hit.message.text, hit.index)) hits.push(hit);
      }
    }

    const finding = buildFinding({
      ruleId: 'image-abuse-threat',
      signal: 'Threat to share intimate or private images',
      severity: 'elevated',
      confidence: 'possible',
      hits,
      explanation:
        'The sender threatens to share, post or leak intimate or private images of you. This is image-based abuse and sextortion — it is a crime in most jurisdictions and it is never your fault.',
      recommendation:
        'Do not pay, comply with further demands, or send more images. Stop contact with the sender if you can do so safely. Keep evidence (screenshots with dates), report the account on the platform, and contact local police (India: 112 / cybercrime.gov.in). Specialist help is available — see the Safety Centre.',
      limitation:
        'SENTINEL cannot verify whether images actually exist. Treat any such threat seriously regardless.',
    });
    return finding ? [finding] : [];
  },
};

const REQUEST_NUDES = /\b(nudes?|sexy\s+selfies?|sexy\s+(photos?|pictures?|videos?))\b/i;
const REQUEST_PHOTO = /\bsend\s+(me\s+)?(a\s+)?(photo|picture|video|selfie)\s+of\s+(yourself|you)\b/i;
const REQUEST_NAKED = /\b(get\s+naked|undress\s+(yourself|for\s+me)|take\s+(off\s+)?(your\s+)?(clothes|shirt))\b/i;

export const sexualRequestRule: DetectionRule = {
  id: 'sexual-request',
  name: 'Requests for intimate content',
  category: 'Image-based abuse',
  immediateSafety: true,
  detect(messages): SignalMatch[] {
    const hits: RuleHit[] = [];
    for (const pattern of [REQUEST_NUDES, REQUEST_PHOTO, REQUEST_NAKED]) {
      for (const hit of findAll(messages, pattern)) {
        if (!isNegated(hit.message.text, hit.index)) hits.push(hit);
      }
    }

    const finding = buildFinding({
      ruleId: 'sexual-request',
      signal: 'Request for intimate or sexual content',
      severity: 'caution',
      confidence: 'possible',
      hits,
      explanation:
        'The conversation contains requests for intimate or sexual images. Unsolicited requests for intimate content are a recognised grooming and coercion tactic, especially from new accounts or after other pressure.',
      recommendation:
        'You never have to share intimate images with anyone. Be cautious about requests from new or pushy contacts. If pressure continues, preserve the messages and report the account on the platform; see the Safety Centre for support options.',
      limitation:
        'Context matters: requests within an established, consenting relationship are different from pressure from a stranger. SENTINEL cannot judge the relationship — treat this finding as a prompt to reflect, not a verdict.',
    });
    return finding ? [finding] : [];
  },
};
