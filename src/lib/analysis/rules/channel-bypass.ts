/**
 * Rule: attempts to move the conversation to another channel.
 *
 * On its own this is usually harmless. It becomes a warning
 * sign when combined with repeated chasing (see the
 * repeated-contact rule), because moving platforms is a common
 * way to evade reporting and continue unwanted contact.
 */

import { DetectionRule, SignalMatch } from '../types';
import { buildFinding, findAll, RuleHit } from './helpers';
import { CHASING_PATTERN } from './repeated-contact';

const CHANNEL_PATTERN =
  /\b(what'?s\s+your\s+(whatsapp|telegram|signal|instagram|snapchat)|move\s+(this\s+)?(to|over\s+to)\s+(whatsapp|telegram|signal|dm|direct\s+message)|call\s+me\s+on\s+(whatsapp|telegram|signal)|add\s+me\s+on\s+(whatsapp|telegram|snapchat)|let'?s\s+(talk|chat)\s+on\s+(whatsapp|telegram))\b/i;

export const channelBypassRule: DetectionRule = {
  id: 'channel-bypass',
  name: 'Moving contact to another channel',
  category: 'Repeated contact & stalking',
  detect(messages): SignalMatch[] {
    const hits = findAll(messages, CHANNEL_PATTERN);
    if (hits.length === 0) return [];

    const chasingCount = findAll(messages, CHASING_PATTERN).length;
    const severity = chasingCount >= 2 ? 'caution' : 'informational';

    const finding = buildFinding({
      ruleId: 'channel-bypass',
      signal: 'Request to continue on another messaging platform',
      severity,
      confidence: 'uncertain',
      hits,
      explanation:
        chasingCount >= 2
          ? 'The conversation asks to move to WhatsApp/Telegram/etc. and also contains repeated chasing messages. Moving platforms is a common tactic to evade reporting and continue unwanted contact.'
          : 'The conversation asks to continue on another messaging platform. On its own this is usually harmless — it only matters when combined with ignored boundaries or repeated contact.',
      recommendation:
        'Be cautious about moving to a new platform with someone pressuring you. Platform reporting tools and your block list are harder to use once the conversation has moved.',
      limitation:
        'SENTINEL cannot see what happened on the other platform — it only analyses the text you paste.',
    });
    return finding ? [finding] : [];
  },
};
