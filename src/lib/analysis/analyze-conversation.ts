/**
 * TraceTrust — conversation analysis orchestrator.
 *
 * Pure, deterministic, and synchronous: the same input always
 * produces the same findings. No randomness, no network calls,
 * no AI API. This is a transparent rule engine — it is not a
 * trained model, and it says so in its own output.
 */

import {
  AnalysisResult,
  OverallConcern,
  SEVERITY_SCORE,
  SignalMatch,
} from './types';
import { parseConversationText } from './parse-conversation';
import { analyzeEscalation } from './analyze-escalation';
import { RULES } from './rules';
import { userLabelFindings } from './rules/user-labels';

export const MAX_INPUT_LENGTH = 20000;

export class AnalysisInputError extends Error {}

const IMMEDIATE_SAFETY_RULES = new Set([
  'explicit-threats',
  'intimidation',
  'image-abuse-threat',
  'sexual-request',
  'user-label:in-person-safety',
  'user-label:intimate-images',
]);

function computeOverallConcern(findings: SignalMatch[]): OverallConcern {
  // User-reported labels provide context but do not
  // drive the automated concern level — only detected
  // signals do.
  const detected = findings.filter((f) => !f.ruleId.startsWith('user-label:'));
  const elevated = detected.filter((f) => f.severity === 'elevated').length;
  const caution = detected.filter((f) => f.severity === 'caution').length;
  const score = detected.reduce((sum, f) => sum + SEVERITY_SCORE[f.severity], 0);

  if (elevated >= 2 || (elevated >= 1 && caution >= 2) || score >= 12) {
    return 'elevated-concern';
  }
  if (elevated >= 1 || caution >= 2 || score >= 5) {
    return 'caution';
  }
  return 'no-strong-indicators';
}

const CONCERN_TEXT: Record<
  OverallConcern,
  { title: string; body: string }
> = {
  'no-strong-indicators': {
    title: 'No strong warning signs detected',
    body: 'The rules did not find strong warning signs in the text you provided. A clean result does not guarantee safety — trust your own judgement, especially if something feels wrong.',
  },
  caution: {
    title: 'Some warning signs detected — review with care',
    body: 'The rules matched warning signs worth reviewing. This is triage guidance, not a verdict: read the findings below, consider the context only you know, and take the precautions that make sense.',
  },
  'elevated-concern': {
    title: 'Multiple or severe warning signs detected',
    body: 'The rules matched multiple or severe warning signs across the conversation. Please prioritise your safety, review the recommendations, and consider talking to a trusted person or an official support channel now.',
  },
};

export function analyzeConversation(input: {
  text: string;
  labels?: string[];
}): AnalysisResult {
  const text = input.text ?? '';

  if (!text.trim()) {
    throw new AnalysisInputError(
      'Please paste a conversation to analyse. Even a few messages can be enough to check for warning signs.'
    );
  }
  if (text.length > MAX_INPUT_LENGTH) {
    throw new AnalysisInputError(
      `This conversation is longer than ${MAX_INPUT_LENGTH.toLocaleString()} characters. For privacy and performance, please paste the most relevant portion instead.`
    );
  }

  const messages = parseConversationText(text);
  if (messages.length === 0) {
    throw new AnalysisInputError(
      'No messages could be read from the text you pasted. Please paste plain text messages.'
    );
  }

  // Run every rule — each is a pure function over the message list.
  const findings: SignalMatch[] = [];
  for (const rule of RULES) {
    findings.push(...rule.detect(messages));
  }

  // User-reported context labels (always marked as user-reported).
  const findingsWithLabels = [
    ...findings,
    ...userLabelFindings(input.labels ?? [], messages),
  ];
  const allFindings = findingsWithLabels;

  const escalation = analyzeEscalation(messages, allFindings);
  const overallConcern = computeOverallConcern(allFindings);
  const concernText = CONCERN_TEXT[overallConcern];

  const immediateSafetyAlert = allFindings.some(
    (f) => f.severity === 'elevated' && IMMEDIATE_SAFETY_RULES.has(f.ruleId)
  );

  // Aggregate recommendations, most severe first, de-duplicated.
  const ordered = [...allFindings].sort(
    (a, b) => SEVERITY_SCORE[b.severity] - SEVERITY_SCORE[a.severity]
  );
  const seen = new Set<string>();
  const recommendations: string[] = [];
  for (const finding of ordered) {
    const key = finding.recommendation;
    if (seen.has(key)) continue;
    seen.add(key);
    recommendations.push(finding.recommendation);
    if (recommendations.length >= 5) break;
  }
  recommendations.push(
    'Save screenshots or exports with dates as evidence, and note the sender/platform for each one.'
  );
  if (immediateSafetyAlert) {
    recommendations.unshift(
      'If you feel unsafe now, contact local emergency services (India: 112) or a trusted person immediately. This automated analysis is not a substitute for emergency help.'
    );
  }

  // Limitations — always visible, plus conditional notes.
  const limitations: string[] = [
    'SENTINEL uses a fixed, transparent rule set. It does not understand sarcasm, jokes, culture, or context the way a person does.',
    'Findings are triage guidance — not a prediction of crime, not a diagnosis, and not proof of anyone\'s identity, guilt, or intent.',
    'SENTINEL never contacts anyone on your behalf and does not replace police, legal, or professional support.',
  ];
  if (escalation.dateCoverage === 'none') {
    limitations.push(
      'No dates or timestamps were detected, so patterns over time could not be assessed. Add timestamps in [YYYY-MM-DD HH:MM] format to enable escalation analysis.'
    );
  } else if (escalation.dateCoverage === 'partial') {
    limitations.push(
      'Only some messages had dates/timestamps; escalation analysis used only the dated messages.'
    );
  }
  if (messages.length === 1) {
    limitations.push(
      'Only one message was detected. SENTINEL detects patterns across messages — a single message can only show isolated warning signs.'
    );
  }

  const explanation = `SENTINEL's rule engine matched ${allFindings.length} finding(s) across ${escalation.totalSignalMessages} of ${messages.length} messages, covering ${escalation.distinctSignalTypes} warning-sign categor${
    escalation.distinctSignalTypes === 1 ? 'y' : 'ies'
  }. ${concernText.body}`;

  return {
    analyzedAt: new Date().toISOString(),
    messageCount: messages.length,
    datedMessageCount: messages.filter((m) => m.timestamp !== null).length,
    findings: allFindings,
    escalation,
    overallConcern,
    overallExplanation: explanation,
    recommendations,
    limitations,
    immediateSafetyAlert,
  };
}
