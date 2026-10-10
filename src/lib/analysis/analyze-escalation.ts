/**
 * Escalation engine.
 *
 * Looks across the whole conversation for patterns over time:
 *  - repeated contact / sender dominance
 *  - severity trend across dated messages
 *  - combinations of different warning-sign categories
 *
 * Every conclusion is phrased as "the evidence suggests" —
 * never as fact — and missing dates are reported as unknown.
 */

import {
  ConversationMessage,
  EscalationAssessment,
  SEVERITY_SCORE,
  SignalMatch,
} from './types';
import { CHASING_PATTERN, maxFrequencyInWindow } from './rules/repeated-contact';

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function analyzeEscalation(
  messages: ConversationMessage[],
  findings: SignalMatch[]
): EscalationAssessment {
  // --- date coverage -------------------------------------------------
  const datedMessages = messages.filter((m) => m.timestamp !== null);
  const dateCoverage: EscalationAssessment['dateCoverage'] =
    datedMessages.length === 0
      ? 'none'
      : datedMessages.length === messages.length
        ? 'full'
        : 'partial';

  // --- messages that carry findings ----------------------------------
  const signalIndexes = new Set<number>();
  for (const finding of findings) {
    for (const idx of finding.messageIndexes) signalIndexes.add(idx);
  }
  const totalSignalMessages = signalIndexes.size;

  const datedSignalMessages = messages.filter(
    (m) => m.timestamp !== null && signalIndexes.has(m.index)
  ).length;

  // --- repeated contact / sender dominance ---------------------------
  const senderCounts = new Map<string, number>();
  for (const m of messages) {
    if (m.sender === null) continue;
    senderCounts.set(m.sender, (senderCounts.get(m.sender) ?? 0) + 1);
  }
  const topSender = [...senderCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const chasingHits = messages.filter((m) => CHASING_PATTERN.test(m.text));
  const frequency = maxFrequencyInWindow(messages);

  let repeatedContact: EscalationAssessment['repeatedContact'] = {
    detected: false,
    detail: '',
  };
  if (chasingHits.length >= 2) {
    repeatedContact = {
      detected: true,
      detail: `${chasingHits.length} messages contain chasing language (for example "why aren't you replying?").`,
    };
  } else if (
    topSender &&
    messages.length >= 4 &&
    topSender[1] >= 4 &&
    topSender[1] / messages.length >= 0.6
  ) {
    repeatedContact = {
      detected: true,
      detail: `${topSender[1]} of ${messages.length} messages come from one sender (${topSender[0]}).`,
    };
  } else if (frequency && frequency.count >= 4) {
    repeatedContact = {
      detected: true,
      detail: `${frequency.count} messages from one sender within about an hour.`,
    };
  }

  // --- severity trend across dated signal messages ----------------
  // The trend uses MESSAGE-LEVEL findings only. Conversation-level
  // rules (repeated contact, ignored boundaries) describe the
  // conversation as a whole; including them would make every
  // early message look equally severe and flatten real trends.
  const CONVERSATION_LEVEL_RULES = new Set([
    'repeated-contact',
    'boundary-ignore',
  ]);
  const isMessageLevel = (f: SignalMatch) =>
    !CONVERSATION_LEVEL_RULES.has(f.ruleId) &&
    !f.ruleId.startsWith('user-label:');

  const datedSignals = messages
    .filter((m) => m.timestamp !== null && signalIndexes.has(m.index))
    .map((m) => {
      const related = findings.filter(
        (f) => isMessageLevel(f) && f.messageIndexes.includes(m.index)
      );
      const worst = related.reduce(
        (max, f) => Math.max(max, SEVERITY_SCORE[f.severity]),
        0
      );
      return { message: m, score: worst };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => a.message.timestamp!.getTime() - b.message.timestamp!.getTime());

  let severityTrend: EscalationAssessment['severityTrend'] = 'insufficient-data';
  let trendExplanation =
    'Not enough dated evidence to assess a trend. Add dates or timestamps to your messages so SENTINEL can check whether warning signs change over time.';

  if (datedSignals.length >= 3) {
    const spanMs =
      datedSignals[datedSignals.length - 1].message.timestamp!.getTime() -
      datedSignals[0].message.timestamp!.getTime();
    if (spanMs >= 24 * 60 * 60 * 1000) {
      // Least-squares slope of severity over time,
      // normalised to the conversation's time span
      // (slope of +1 = severity rising one full
      // step per conversation; -1 = falling).
      const t0 = datedSignals[0].message.timestamp!.getTime();
      const t1 =
        datedSignals[datedSignals.length - 1].message.timestamp!.getTime();
      const span = Math.max(1, t1 - t0);
      const points = datedSignals.map((d) => ({
        t: (d.message.timestamp!.getTime() - t0) / span,
        s: d.score,
      }));
      const meanT = points.reduce((s, p) => s + p.t, 0) / points.length;
      const meanS = points.reduce((s, p) => s + p.s, 0) / points.length;
      let num = 0;
      let den = 0;
      for (const p of points) {
        num += (p.t - meanT) * (p.s - meanS);
        den += (p.t - meanT) * (p.t - meanT);
      }
      const slope = den === 0 ? 0 : num / den;

      const first = datedSignals[0].message.timestamp!;
      const last = datedSignals[datedSignals.length - 1].message.timestamp!;

      if (slope >= 0.35) {
        severityTrend = 'increasing';
        trendExplanation = `Across the dated messages you provided (${formatDate(first)} to ${formatDate(last)}), the severity of warning signs appears to increase over time. Later messages carry stronger warning signs than earlier ones.`;
      } else if (slope <= -0.35) {
        severityTrend = 'decreasing';
        trendExplanation = `Across the dated messages you provided (${formatDate(first)} to ${formatDate(last)}), warning signs appear to become less severe over time. This does not guarantee safety — behaviour can change again.`;
      } else {
        severityTrend = 'stable';
        trendExplanation = `Across the dated messages you provided (${formatDate(first)} to ${formatDate(last)}), warning signs stay at a similar level of severity. No clear upward or downward trend is supported by the dates.`;
      }
    } else {
      severityTrend = 'insufficient-data';
      trendExplanation =
        'The dated messages all fall within a single day, so a trend over time cannot be established from the evidence you provided.';
    }
  } else if (datedSignals.length >= 2) {
    trendExplanation =
      'Only two dated messages carry warning signs, which is not enough to establish a reliable trend. Add more context so patterns over time can be assessed.';
  }

  // --- combination of categories --------------------------------------
  const distinctSignalTypes = new Set(findings.map((f) => f.ruleId)).size;

  const summaryParts: string[] = [];
  if (repeatedContact.detected) {
    summaryParts.push(`Repeated contact: ${repeatedContact.detail}`);
  }
  if (distinctSignalTypes >= 3) {
    summaryParts.push(
      `${distinctSignalTypes} different categories of warning signs appear together. Combinations of signs matter more than any single message.`
    );
  } else if (distinctSignalTypes === 1) {
    summaryParts.push(
      'A single category of warning sign was detected. An isolated sign is less concerning than a repeated or combined pattern — but trust your own judgement.'
    );
  }
  if (severityTrend === 'increasing') {
    summaryParts.push(
      'The dated evidence suggests escalation over time. Early intervention (blocking, reporting, telling a trusted person) is safer than waiting.'
    );
  }
  if (summaryParts.length === 0) {
    summaryParts.push(
      'No repeated or escalating pattern is supported by the evidence provided.'
    );
  }

  return {
    datedSignalMessages,
    totalSignalMessages,
    dateCoverage,
    repeatedContact,
    severityTrend,
    trendExplanation,
    distinctSignalTypes,
    patternSummary: summaryParts.join(' '),
  };
}
