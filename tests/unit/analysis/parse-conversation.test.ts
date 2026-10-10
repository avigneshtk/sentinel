import { describe, expect, it } from 'vitest';
import { parseConversationText, parseTimestamp } from '@/lib/analysis/parse-conversation';

describe('parseTimestamp', () => {
  it('parses ISO dates and datetimes', () => {
    expect(parseTimestamp('2025-01-06')).toEqual(new Date('2025-01-06T00:00:00'));
    expect(parseTimestamp('2025-01-06T21:14')).toEqual(new Date('2025-01-06T21:14:00'));
    expect(parseTimestamp('2025-01-06 21:14:30')).toEqual(new Date('2025-01-06T21:14:30'));
  });

  it('parses day-first numeric dates (Indian convention)', () => {
    const d = parseTimestamp('06/01/2025');
    expect(d).not.toBeNull();
    expect(d?.getDate()).toBe(6);
    expect(d?.getMonth()).toBe(0); // January
  });

  it('parses natural language dates', () => {
    const d = parseTimestamp('Jan 6, 2025');
    expect(d).not.toBeNull();
    expect(d?.getDate()).toBe(6);
  });

  it('returns null for unparseable input', () => {
    expect(parseTimestamp('not a date')).toBeNull();
    expect(parseTimestamp('')).toBeNull();
  });
});

describe('parseConversationText', () => {
  it('parses bracketed exporter format with senders', () => {
    const messages = parseConversationText(
      '[2025-01-06 21:14] Arjun: hey, are you there?\n[2025-01-06 21:15] Arjun: why aren\'t you replying?'
    );
    expect(messages).toHaveLength(2);
    expect(messages[0].sender).toBe('Arjun');
    expect(messages[0].text).toBe('hey, are you there?');
    expect(messages[0].timestamp).toEqual(new Date('2025-01-06T21:14:00'));
    expect(messages[1].sender).toBe('Arjun');
  });

  it('parses WhatsApp-style format (dd/mm/yyyy, HH:MM)', () => {
    const messages = parseConversationText(
      '[06/01/2025, 21:14] Arjun: hello there'
    );
    expect(messages).toHaveLength(1);
    expect(messages[0].sender).toBe('Arjun');
    expect(messages[0].timestamp?.getDate()).toBe(6);
  });

  it('parses sender-only format without timestamps', () => {
    const messages = parseConversationText(
      'Mom: good morning\nAnu: hi mom'
    );
    expect(messages).toHaveLength(2);
    expect(messages[0].sender).toBe('Mom');
    expect(messages[0].timestamp).toBeNull();
  });

  it('falls back to plain-line mode for unstructured text', () => {
    const messages = parseConversationText(
      'why are you ignoring me\nsee my messages\nanswer me'
    );
    expect(messages).toHaveLength(3);
    expect(messages[0].sender).toBeNull();
    expect(messages[2].text).toBe('answer me');
  });

  it('joins multi-line messages under one sender', () => {
    const messages = parseConversationText(
      'Arjun: first line\ncontinuation of first line\nArjun: second message'
    );
    expect(messages).toHaveLength(2);
    expect(messages[0].text).toBe('first line continuation of first line');
  });

  it('treats missing dates as unknown (null), never fabricates them', () => {
    const messages = parseConversationText('Arjun: no date here');
    expect(messages[0].timestamp).toBeNull();
    expect(messages[0].rawTimestamp).toBeNull();
  });

  it('returns empty array for blank input', () => {
    expect(parseConversationText('')).toHaveLength(0);
    expect(parseConversationText('   \n  \n')).toHaveLength(0);
  });
});
