import { describe, expect, it } from 'vitest';
import { analyzeConversation } from '@/lib/analysis/analyze-conversation';
import { parseConversationText } from '@/lib/analysis/parse-conversation';
import { analyzeEscalation } from '@/lib/analysis/analyze-escalation';
import { DEMO_SCENARIOS } from '@/data/demo-scenarios';

/**
 * End-to-end analysis flow tests: parse → analyze →
 * escalate, using the fictional demo scenarios.
 */

describe('integration — full analysis flow', () => {
  it('parses and analyzes the escalating-contact demo in one flow', () => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === 'escalating-contact')!;
    const messages = parseConversationText(scenario.text);

    // Parsing produced a usable, dated transcript.
    expect(messages.length).toBe(11);
    expect(messages.every((m) => m.timestamp !== null)).toBe(true);
    expect(messages.map((m) => m.sender)).toContain('Priya');

    const result = analyzeConversation({
      text: scenario.text,
      labels: scenario.labels,
    });

    // The escalation engine sees the same transcript.
    const escalation = analyzeEscalation(messages, result.findings);
    expect(escalation.dateCoverage).toBe('full');
    expect(escalation.totalSignalMessages).toBeGreaterThan(0);

    // The demo story: repeated contact → boundary ignored →
    // location probing → secrecy → threat, escalating over 3 days.
    expect(result.overallConcern).toBe('elevated-concern');
    expect(result.escalation.severityTrend).toBe('increasing');
    expect(result.immediateSafetyAlert).toBe(true);
  });

  it('benign control case produces a clean result end to end', () => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === 'benign-family')!;
    const result = analyzeConversation({
      text: scenario.text,
      labels: [],
    });
    expect(result.findings).toHaveLength(0);
    expect(result.overallConcern).toBe('no-strong-indicators');
    expect(result.immediateSafetyAlert).toBe(false);
  });

  it('phishing demo surfaces financial-guidance recommendations', () => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === 'bank-phishing')!;
    const result = analyzeConversation({
      text: scenario.text,
      labels: scenario.labels,
    });
    const recommendations = result.recommendations.join(' ');
    expect(recommendations.toLowerCase()).toMatch(/never share passwords|otp/);
  });

  it('chronological ordering is preserved for dated messages', () => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === 'escalating-contact')!;
    const messages = parseConversationText(scenario.text);
    const times = messages
      .map((m) => m.timestamp!.getTime())
      .slice()
      .sort((a, b) => a - b);
    // Input is already chronological; verify strictly non-decreasing.
    for (let i = 1; i < messages.length; i += 1) {
      expect(messages[i].timestamp!.getTime()).toBeGreaterThanOrEqual(
        messages[i - 1].timestamp!.getTime()
      );
    }
    expect(times[0]).toBeLessThan(times[times.length - 1]);
  });
});
