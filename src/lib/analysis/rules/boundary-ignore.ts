/**
 * Rule: stated boundary followed by continued contact.
 *
 * Conversation-level rule. When a participant states a boundary
 * ("stop contacting me") and further messages from a different
 * participant follow, that is a recognised warning sign — while
 * remaining honest that we cannot verify intent or addressee.
 */

import { DetectionRule, SignalMatch } from '../types';
import { buildFinding, findAll, RuleHit } from './helpers';

export const BOUNDARY_PATTERN =
  /\b(stop\s+(contacting|messaging|texting|calling|following)\s+me|stop\s+me\s+contacting|leave\s+me\s+alone|go\s+away|don'?t\s+(contact|message|text|call|talk\s+to|follow)\s+me|please\s+stop|i\s+(don'?t|do\s+not)\s+want\s+(to\s+(talk|communicate|chat)|any\s+(contact|relationship))|no\s+contact)\b/i;

export const boundaryIgnoreRule: DetectionRule = {
  id: 'boundary-ignore',
  name: 'Stated boundary followed by continued contact',
  category: 'Repeated contact & stalking',
  detect(messages): SignalMatch[] {
    const boundaryHits = findAll(messages, BOUNDARY_PATTERN);
    if (boundaryHits.length === 0) return [];

    // Messages that follow a stated boundary from a DIFFERENT sender.
    const laterHits: RuleHit[] = [];
    for (const boundary of boundaryHits) {
      for (const message of messages) {
        if (message.index <= boundary.message.index) continue;
        if (
          boundary.message.sender !== null &&
          message.sender !== null &&
          message.sender === boundary.message.sender
        ) {
          continue; // same person restating the boundary
        }
        if (BOUNDARY_PATTERN.test(message.text)) continue; // another boundary statement
        laterHits.push({ message, index: 0, length: 0, text: message.text });
      }
    }

    const uniqueLater = new Map<string, RuleHit>();
    for (const hit of laterHits) {
      if (!uniqueLater.has(hit.message.id)) uniqueLater.set(hit.message.id, hit);
    }
    const laterMessages = [...uniqueLater.values()];
    if (laterMessages.length === 0) return [];

    const boundaryIndexes = [...new Set(boundaryHits.map((h) => h.message.index))];
    const severity = laterMessages.length >= 3 ? 'elevated' : 'caution';

    return [
      {
        ruleId: 'boundary-ignore',
        signal: 'Contact continued after a stated boundary',
        severity,
        confidence: 'possible',
        excerpt: boundaryHits[0]
          ? boundaryHits[0].message.text.slice(0, 160)
          : '',
        messageIndexes: [
          ...new Set([
            ...boundaryIndexes,
            ...laterMessages.map((m) => m.message.index),
          ]),
        ]
          .sort((a, b) => a - b),
        explanation: `A participant stated they wanted contact to stop (message ${boundaryIndexes.join(
          ', '
        )}), and ${laterMessages.length} further message(s) from another participant appear after it. Repeated contact after someone has asked for it to stop is a recognised warning sign of harassment and stalking.`,
        recommendation:
          'You do not have to reply to messages that continue after you have asked for them to stop. Keep the record, block the sender on the platform if you can do so safely, and consider reporting the behaviour. See the Safety Centre for reporting options.',
        limitation:
          'SENTINEL cannot verify who the boundary was addressed to, or whether the follow-up messages are deliberate. Some group chats contain multiple unrelated threads.',
      },
    ];
  },
};
