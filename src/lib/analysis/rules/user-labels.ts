/**
 * User-supplied context labels.
 *
 * Users can tag a conversation with facts they know
 * (new account, boundary ignored, etc.). Labels are treated
 * as user-reported context — never as automated analysis —
 * and are always marked with low confidence.
 */

import { ConversationMessage, Severity, SignalMatch } from '../types';

export interface UserLabel {
  id: string;
  label: string;
  severity: Severity;
  signal: string;
  explanation: string;
  recommendation: string;
}

export const USER_LABELS: UserLabel[] = [
  {
    id: 'new-account',
    label: 'Contact from a new or unknown account',
    severity: 'informational',
    signal: 'User-reported: contact from a new/unknown account',
    explanation:
      'You indicated the contact comes from a new or unknown account. New accounts are frequently used for harassment and scams because they are easy to abandon.',
    recommendation:
      'Be cautious with new accounts asking for personal details, photos, or money. Check the profile for signs of fakes (few photos, recent creation, generic name).',
  },
  {
    id: 'repeated-contact',
    label: 'This person contacts me repeatedly',
    severity: 'caution',
    signal: 'User-reported: repeated contact',
    explanation:
      'You indicated this person contacts you repeatedly. Repeated unwanted contact is an early indicator of stalking-type behaviour.',
    recommendation:
      'Keep a dated record of the contact. Consider muting or blocking, and tell a trusted person what is happening.',
  },
  {
    id: 'boundary-ignored',
    label: 'I have asked this person to stop contacting me',
    severity: 'caution',
    signal: 'User-reported: boundary stated and contact continues',
    explanation:
      'You indicated you have asked this person to stop contacting them. Contact that continues after a clear request to stop is a recognised warning sign of harassment.',
    recommendation:
      'You do not need to repeat or justify your boundary. Keep evidence, block on the platform, and consider reporting. See the Safety Centre.',
  },
  {
    id: 'impersonation-suspected',
    label: 'I suspect impersonation or a fake profile',
    severity: 'caution',
    signal: 'User-reported: suspected impersonation',
    explanation:
      'You suspect the contact is impersonating someone or using a fake profile. SENTINEL cannot verify identities — treat this as your own observation, not a confirmed fact.',
    recommendation:
      'Compare the profile against the real person through a separate channel you already trust. Report the account on the platform with evidence.',
  },
  {
    id: 'financial-pressure',
    label: 'I am being pressured for money',
    severity: 'caution',
    signal: 'User-reported: pressure for money',
    explanation:
      'You indicated you are being pressured for money. Financial pressure is a hallmark of scams, romance fraud, and extortion.',
    recommendation:
      'Do not send money or gift cards under pressure. Verify through a separate channel. If money was already sent, contact your bank immediately and report to cybercrime.gov.in / 1930 (India).',
  },
  {
    id: 'intimate-images',
    label: 'Intimate images or videos are involved',
    severity: 'elevated',
    signal: 'User-reported: intimate images involved',
    explanation:
      'You indicated intimate images or videos are involved. Image-based abuse is a serious crime in most jurisdictions and specialist help exists.',
    recommendation:
      'Do not send further images or pay demands. Keep evidence, report the account, and contact police (India: 112 / cybercrime.gov.in). See the Safety Centre for image-abuse support.',
  },
  {
    id: 'reported-platform',
    label: 'I have already reported this to a platform',
    severity: 'informational',
    signal: 'User-reported: already reported to a platform',
    explanation:
      'You indicated you have already reported this contact to a platform. That is a good step — keep the report reference if one was provided.',
    recommendation:
      'Keep the report reference, continue preserving evidence, and escalate to official channels if the behaviour continues.',
  },
  {
    id: 'in-person-safety',
    label: 'I am worried about my physical safety',
    severity: 'elevated',
    signal: 'User-reported: worry about physical safety',
    explanation:
      'You indicated worry about your physical safety. Take that worry seriously — automated tools cannot assess physical risk.',
    recommendation:
      'If you feel unsafe now, contact local emergency services (India: 112) or a trusted person immediately. Tell someone you trust about the situation.',
  },
];

export function userLabelFindings(
  labelIds: string[],
  _messages: ConversationMessage[]
): SignalMatch[] {
  const findings: SignalMatch[] = [];
  for (const id of labelIds) {
    const label = USER_LABELS.find((l) => l.id === id);
    if (!label) continue;
    findings.push({
      ruleId: `user-label:${label.id}`,
      signal: label.signal,
      severity: label.severity,
      confidence: 'uncertain',
      excerpt: `(User-reported context: ${label.label})`,
      messageIndexes: [],
      explanation: label.explanation,
      recommendation: label.recommendation,
      limitation:
        'This is context you provided, not an automated finding. SENTINEL cannot verify it.',
    });
  }
  return findings;
}
