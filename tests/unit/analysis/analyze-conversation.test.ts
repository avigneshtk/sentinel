import { describe, expect, it } from 'vitest';
import { analyzeConversation, AnalysisInputError, MAX_INPUT_LENGTH } from '@/lib/analysis/analyze-conversation';
import { DEMO_SCENARIOS } from '@/data/demo-scenarios';

const scenario = (id: string) =>
  DEMO_SCENARIOS.find((s) => s.id === id)!;

describe('analyzeConversation — validation', () => {
  it('rejects empty input with a clear error', () => {
    expect(() => analyzeConversation({ text: '' })).toThrow(AnalysisInputError);
    expect(() => analyzeConversation({ text: '   \n  ' })).toThrow(AnalysisInputError);
  });

  it('rejects excessively long input', () => {
    const longText = 'a'.repeat(MAX_INPUT_LENGTH + 1);
    expect(() => analyzeConversation({ text: longText })).toThrow(
      /longer than/
    );
  });

  it('accepts input at the length limit', () => {
    const text = 'Arjun: hello\n'.repeat(100).slice(0, MAX_INPUT_LENGTH);
    expect(() => analyzeConversation({ text })).not.toThrow();
  });
});

describe('analyzeConversation — demo scenario 1 (escalating contact)', () => {
  const result = analyzeConversation({
    text: scenario('escalating-contact').text,
    labels: scenario('escalating-contact').labels,
  });

  it('produces multiple findings across categories', () => {
    expect(result.findings.length).toBeGreaterThanOrEqual(8);
    expect(result.escalation.distinctSignalTypes).toBeGreaterThanOrEqual(5);
  });

  it('detects the ignored boundary as elevated', () => {
    const boundary = result.findings.find((f) => f.ruleId === 'boundary-ignore');
    expect(boundary).toBeDefined();
    expect(boundary?.severity).toBe('elevated');
  });

  it('detects repeated unwanted contact as elevated', () => {
    const contact = result.findings.find((f) => f.ruleId === 'repeated-contact');
    expect(contact).toBeDefined();
    expect(contact?.severity).toBe('elevated');
  });

  it('detects the image-abuse threat as elevated', () => {
    const abuse = result.findings.find((f) => f.ruleId === 'image-abuse-threat');
    expect(abuse).toBeDefined();
    expect(abuse?.severity).toBe('elevated');
  });

  it('detects intimidation (claim to know location) as elevated', () => {
    const intimidation = result.findings.find(
      (f) => f.ruleId === 'intimidation' && f.severity === 'elevated'
    );
    expect(intimidation).toBeDefined();
  });

  it('detects location probing', () => {
    const probe = result.findings.find((f) => f.ruleId === 'location-probe');
    expect(probe).toBeDefined();
  });

  it('detects secrecy demands', () => {
    const secrecy = result.findings.find((f) => f.ruleId === 'urgency-secrecy');
    expect(secrecy).toBeDefined();
  });

  it('marks user-reported labels as uncertain findings', () => {
    const labels = result.findings.filter((f) => f.ruleId.startsWith('user-label:'));
    expect(labels.length).toBe(3);
    expect(labels.every((f) => f.confidence === 'uncertain')).toBe(true);
  });

  it('assesses escalation as increasing across the dated messages', () => {
    expect(result.escalation.severityTrend).toBe('increasing');
    expect(result.escalation.dateCoverage).toBe('full');
    expect(result.escalation.repeatedContact.detected).toBe(true);
  });

  it('rates overall concern as elevated', () => {
    expect(result.overallConcern).toBe('elevated-concern');
  });

  it('triggers the immediate-safety banner', () => {
    expect(result.immediateSafetyAlert).toBe(true);
  });

  it('provides recommendations and limitations', () => {
    expect(result.recommendations.length).toBeGreaterThanOrEqual(3);
    expect(result.limitations.length).toBeGreaterThanOrEqual(3);
  });

  it('reports correct message counts', () => {
    expect(result.messageCount).toBe(11);
    expect(result.datedMessageCount).toBe(11);
  });
});

describe('analyzeConversation — demo scenario 2 (benign family chat)', () => {
  const result = analyzeConversation({
    text: scenario('benign-family').text,
    labels: [],
  });

  it('produces no findings for an ordinary conversation', () => {
    expect(result.findings).toHaveLength(0);
  });

  it('rates overall concern as no strong indicators', () => {
    expect(result.overallConcern).toBe('no-strong-indicators');
  });

  it('does not trigger the immediate-safety banner', () => {
    expect(result.immediateSafetyAlert).toBe(false);
  });

  it('reports that no dates were detected is false (dates present)', () => {
    expect(result.escalation.dateCoverage).toBe('full');
    expect(result.escalation.severityTrend).toBe('insufficient-data');
  });
});

describe('analyzeConversation — demo scenario 3 (bank phishing)', () => {
  const result = analyzeConversation({
    text: scenario('bank-phishing').text,
    labels: scenario('bank-phishing').labels,
  });

  it('detects impersonation indicators', () => {
    const impersonation = result.findings.find((f) => f.ruleId === 'impersonation');
    expect(impersonation).toBeDefined();
  });

  it('detects urgent sensitive-information request as elevated', () => {
    const info = result.findings.find(
      (f) => f.ruleId === 'sensitive-info' && f.severity === 'elevated'
    );
    expect(info).toBeDefined();
  });

  it('detects phishing verification language', () => {
    const phishing = result.findings.find(
      (f) => f.ruleId === 'sensitive-info' && f.signal.toLowerCase().includes('phishing')
    );
    expect(phishing).toBeDefined();
  });

  it('detects urgency and secrecy', () => {
    const urgency = result.findings.filter((f) => f.ruleId === 'urgency-secrecy');
    expect(urgency.length).toBeGreaterThanOrEqual(2);
  });

  it('rates overall concern as elevated (multiple caution + one elevated)', () => {
    expect(result.overallConcern).toBe('elevated-concern');
  });
});

describe('analyzeConversation — demo scenario 4 (boundary ignored, no violent language)', () => {
  const result = analyzeConversation({
    text: scenario('boundary-ignored-simple').text,
    labels: ['boundary-ignored'],
  });

  it('detects warning signs without any explicit violent language', () => {
    expect(result.findings.length).toBeGreaterThanOrEqual(2);
  });

  it('detects the boundary being ignored', () => {
    const boundary = result.findings.find((f) => f.ruleId === 'boundary-ignore');
    expect(boundary).toBeDefined();
  });

  it('detects repeated chasing', () => {
    const contact = result.findings.find((f) => f.ruleId === 'repeated-contact');
    expect(contact).toBeDefined();
    expect(contact?.severity).toBe('elevated');
  });

  it('rates overall concern as caution', () => {
    expect(result.overallConcern).toBe('caution');
  });
});

describe('analyzeConversation — false-positive controls', () => {
  it('does not flag a benign work conversation', () => {
    const result = analyzeConversation({
      text: `[2025-03-02 10:00] Priya: standup at 10:30 today
[2025-03-02 10:01] Ravi: will send the report after lunch
[2025-03-02 10:02] Priya: thanks. i'll review it`,
      labels: [],
    });
    expect(result.findings).toHaveLength(0);
    expect(result.overallConcern).toBe('no-strong-indicators');
  });

  it('does not flag a single message with no warning signs', () => {
    const result = analyzeConversation({
      text: 'Arjun: hey, are we still on for dinner tonight?',
      labels: [],
    });
    expect(result.findings).toHaveLength(0);
  });

  it('treats missing timestamps as unknown, not fabricated', () => {
    const result = analyzeConversation({
      text: 'Dev: hello?\nDev: why are you ignoring me?\nSara: stop messaging me',
      labels: [],
    });
    expect(result.escalation.dateCoverage).toBe('none');
    expect(result.limitations.some((l) => l.includes('dates or timestamps'))).toBe(true);
  });

  it('is deterministic: same input produces identical findings', () => {
    const a = analyzeConversation({
      text: scenario('escalating-contact').text,
      labels: scenario('escalating-contact').labels,
    });
    const b = analyzeConversation({
      text: scenario('escalating-contact').text,
      labels: scenario('escalating-contact').labels,
    });
    expect(a.findings.map((f) => [f.ruleId, f.severity, f.excerpt])).toEqual(
      b.findings.map((f) => [f.ruleId, f.severity, f.excerpt])
    );
  });
});
