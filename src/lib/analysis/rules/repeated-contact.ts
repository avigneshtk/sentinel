/**
 * Rule: repeated unwanted contact ("chasing") and high contact frequency.
 *
 * Conversation-level rule. Detects repeated chasing messages
 * ("why aren't you replying?") and unusually high message frequency
 * from a single sender within a short window — both established
 * early indicators of stalking-type behaviour.
 */

import { DetectionRule, SignalMatch } from '../types';
import { buildFinding, countBySender, findAll, RuleHit } from './helpers';

export const CHASING_PATTERN =
  /\b(hello\??|hey\s*\??|are\s+you\s+(there|okay|ok)\b|why\s+(aren'?t|don'?t|didn'?t|do\s+not)\s+you\s+(reply|respond|answer|text|call|talk)\w*|answer\s+(me|please)|reply\s+(to\s+)?(me|please)|see\s+(my\s+)?(messages?|texts?|calls?)|read\s+my\s+(message|text|dm)|ignoring\s+me|why\s+are\s+you\s+ignoring\s+me|ping\s+(me|again)|check\s+your\s+(messages?|phone|whatsapp)|whatsapp\s+me)/i;

const FREQUENCY_WINDOW_MS = 60 * 60 * 1000; // 60 minutes

export function maxFrequencyInWindow(
  messages: { timestamp: Date | null; sender: string | null }[]
): { count: number; sender: string | null; share: number; from: Date; to: Date } | null {
  const dated = messages.filter((m) => m.timestamp !== null);
  if (dated.length < 2) return null;

  const sorted = [...dated].sort(
    (a, b) => a.timestamp!.getTime() - b.timestamp!.getTime()
  );

  let best: {
    count: number;
    sender: string | null;
    share: number;
    from: Date;
    to: Date;
  } | null = null;

  for (let i = 0; i < sorted.length; i += 1) {
    const sender = sorted[i].sender;
    let count = 0;
    let total = 0;
    let j = i;
    while (
      j < sorted.length &&
      sorted[j].timestamp!.getTime() - sorted[i].timestamp!.getTime() <=
        FREQUENCY_WINDOW_MS
    ) {
      total += 1;
      if (sorted[j].sender === sender) count += 1;
      j += 1;
    }
    // Require both high volume AND sender dominance:
    // ordinary two-person conversations stay balanced
    // even when both people message frequently.
    const share = total === 0 ? 0 : count / total;
    if (count >= 4 && share >= 0.75 && (best === null || count > best.count)) {
      best = {
        count,
        sender,
        share,
        from: sorted[i].timestamp!,
        to: sorted[Math.min(j - 1, sorted.length - 1)].timestamp!,
      };
    }
  }
  return best;
}

export const repeatedContactRule: DetectionRule = {
  id: 'repeated-contact',
  name: 'Repeated unwanted contact',
  category: 'Repeated contact & stalking',
  detect(messages): SignalMatch[] {
    const hits = findAll(messages, CHASING_PATTERN);

    const bySender = countBySender(hits);
    const topSender = [...bySender.entries()].sort((a, b) => b[1] - a[1])[0];
    const chasingCount = hits.length;

    const frequency = maxFrequencyInWindow(messages);

    let severity: 'caution' | 'elevated' = 'caution';
    const reasons: string[] = [];

    if (chasingCount >= 3) {
      severity = 'elevated';
      reasons.push(`${chasingCount} messages contain chasing language`);
    } else if (chasingCount >= 2) {
      reasons.push(`${chasingCount} messages contain chasing language`);
    }

    if (topSender && topSender[1] >= 3) {
      reasons.push(`most come from one sender (${topSender[0]})`);
    }

    if (frequency && frequency.count >= 4) {
      if (frequency.count >= 6) severity = 'elevated';
      reasons.push(
        `${frequency.count} of ${Math.round(frequency.count / frequency.share)} messages in an hour (${frequency.from.toLocaleTimeString()}–${frequency.to.toLocaleTimeString()}) came from one sender (${Math.round(frequency.share * 100)}% of the traffic)`
      );
    }

    if (reasons.length === 0) return [];

    return [
      {
        ruleId: 'repeated-contact',
        signal: 'Repeated unwanted contact / chasing',
        severity,
        confidence: 'possible',
        excerpt: hits[0]
          ? hits[0].message.text.slice(0, 160)
          : '',
        messageIndexes: [...new Set(hits.map((h) => h.message.index))].sort(
          (a, b) => a - b
        ),
        explanation: `This conversation shows repeated contact-seeking behaviour: ${reasons.join(
          '; '
        )}. Repeated messages after little or no reply — especially combined with pressure or intimidation — are an early warning sign of stalking-type behaviour.`,
        recommendation:
          'You do not have to reply to every message. Consider muting or blocking the sender, keeping a dated record, and telling a trusted person. If the contact feels controlling or frightening, see the Safety Centre for official reporting channels.',
        limitation:
          'Frequency alone does not prove intent — friends and family may also message repeatedly during emergencies. SENTINEL cannot see replies or the full history outside the pasted text.',
      },
    ];
  },
};
