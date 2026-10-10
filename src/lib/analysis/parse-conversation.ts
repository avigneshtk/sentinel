/**
 * Conversation parser.
 *
 * Accepts loosely structured pasted text and produces typed messages.
 * Supported structures (detected automatically):
 *   1. Exporter format:   [2025-01-06 21:14] Arjun: message text
 *   2. WhatsApp format:   [06/01/2025, 21:14] Arjun: message text
 *   3. Bracket timestamp: [2025-01-06] message text
 *   4. Sender prefix:     Arjun: message text
 *   5. Plain line mode:   when a paste contains no senders and no
 *                         timestamps, every non-empty line becomes its
 *                         own message (sender unknown).
 *
 * Unknown values stay null — the engine never fabricates senders,
 * dates, or content.
 */

import { ConversationMessage } from './types';

export const MAX_MESSAGES = 400;

const BRACKET_TS = /^\[([^\]]{1,60})\]\s*(.*)$/;

// "06/01/2025, 21:14 message" or "2025-01-06T21:14 message" (no brackets)
const LEADING_TS =
  /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?|\d{4}-\d{1,2}-\d{1,2}[T ]\d{1,2}:\d{2}(?::\d{2})?)\s+(.*)$/;

// "Sender:" — colon-separated sender prefix. Deliberately strict to avoid
// treating ordinary sentences as sender names.
const SENDER_PREFIX = /^([A-Za-z][\w .'-]{0,28}?)\s*:\s+(.+)$/;

export function parseTimestamp(raw: string): Date | null {
  const s = raw.trim();
  if (!s) return null;

  // ISO: 2025-01-06, 2025-01-06T21:14, 2025-01-06 21:14:30
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (iso) {
    const d = new Date(
      `${iso[1]}-${iso[2]}-${iso[3]}T${iso[4] ?? '00'}:${iso[5] ?? '00'}:${iso[6] ?? '00'}`
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Day-first numeric: 06/01/2025, 06-01-2025 (common in India). Day-first is
  // assumed and documented; ambiguous dates are an accepted limitation.
  const dmy = s.match(
    /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})(?:[T ,]+\s*(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (dmy) {
    let year = parseInt(dmy[3], 10);
    if (year < 100) year += 2000;
    const d = new Date(
      year,
      parseInt(dmy[2], 10) - 1,
      parseInt(dmy[1], 10),
      parseInt(dmy[4] ?? '0', 10),
      parseInt(dmy[5] ?? '0', 10),
      parseInt(dmy[6] ?? '0', 10)
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Natural language fallback: "Jan 6, 2025", "6 Jan 2025"
  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) {
    const d = new Date(parsed);
    return d.getFullYear() >= 2000 ? d : null;
  }

  return null;
}

interface ParsedLine {
  text: string;
  sender: string | null;
  timestamp: Date | null;
  rawTimestamp: string | null;
}

function parseLine(trimmed: string): ParsedLine | null {
  let rest = trimmed;
  let rawTimestamp: string | null = null;
  let timestamp: Date | null = null;

  const bracket = rest.match(BRACKET_TS);
  if (bracket) {
    rawTimestamp = bracket[1].trim();
    timestamp = parseTimestamp(rawTimestamp);
    rest = bracket[2].trim();
  }

  if (rest) {
    const leading = rest.match(LEADING_TS);
    if (leading && rawTimestamp === null) {
      rawTimestamp = leading[1].trim();
      timestamp = parseTimestamp(rawTimestamp);
      rest = leading[2].trim();
    }
  }

  if (!rest) {
    // Timestamp-only line; its timestamp applies to the next real message.
    return { text: '', sender: null, timestamp, rawTimestamp };
  }

  const senderMatch = rest.match(SENDER_PREFIX);
  if (senderMatch) {
    return {
      text: senderMatch[2].trim(),
      sender: senderMatch[1].trim(),
      timestamp,
      rawTimestamp,
    };
  }

  return { text: rest, sender: null, timestamp, rawTimestamp };
}

export function parseConversationText(raw: string): ConversationMessage[] {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Decide whether the paste is structured (timestamps/senders present) or
  // plain line-by-line chat. A line that starts with a bracketed
  // timestamp is a strong export signal on its own.
  const bracketLines = lines.filter((l) => BRACKET_TS.test(l) || LEADING_TS.test(l)).length;
  const senderLines = lines.filter((l) => SENDER_PREFIX.test(l)).length;
  const structured = bracketLines >= 1 || senderLines >= 2;

  const messages: ConversationMessage[] = [];
  let pendingTimestamp: { date: Date | null; raw: string | null } | null = null;

  if (!structured) {
    lines.forEach((line, i) => {
      if (messages.length >= MAX_MESSAGES) return;
      messages.push({
        id: `m${i + 1}`,
        index: i + 1,
        sender: null,
        text: line,
        timestamp: null,
        rawTimestamp: null,
      });
    });
    return messages;
  }

  for (const line of lines) {
    if (messages.length >= MAX_MESSAGES) break;
    const parsed = parseLine(line);
    if (!parsed) continue;

    if (!parsed.text) {
      // Timestamp-only line — remember it for the next message.
      pendingTimestamp = { date: parsed.timestamp, raw: parsed.rawTimestamp };
      continue;
    }

    // Lines without a sender or timestamp continue the previous message
    // (multi-line messages in chat exports).
    const continuesPrevious =
      messages.length > 0 && !parsed.sender && parsed.timestamp === null && !parsed.rawTimestamp;

    if (continuesPrevious) {
      const prev = messages[messages.length - 1];
      prev.text = `${prev.text} ${parsed.text}`.trim();
      continue;
    }

    messages.push({
      id: `m${messages.length + 1}`,
      index: messages.length + 1,
      sender: parsed.sender,
      text: parsed.text,
      timestamp: parsed.timestamp ?? pendingTimestamp?.date ?? null,
      rawTimestamp: parsed.rawTimestamp ?? pendingTimestamp?.raw ?? null,
    });
    pendingTimestamp = null;
  }

  return messages;
}
