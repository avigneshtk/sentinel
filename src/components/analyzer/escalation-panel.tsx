'use client';

/**
 * Escalation & pattern summary panel.
 *
 * Explains — in plain language — what the dated evidence
 * supports: repeated contact, severity trend, and
 * combinations of warning-sign categories. Never claims
 * certainty.
 */

import { EscalationAssessment } from '@/lib/analysis/types';
import { Card, CardHeader } from '@/components/ui/card';
import { Tag } from '@/components/ui/badge';

const TREND_LABELS: Record<EscalationAssessment['severityTrend'], string> = {
  'insufficient-data': 'Trend unknown',
  increasing: 'Appears to be increasing',
  stable: 'Stable over time',
  decreasing: 'Appears to be decreasing',
};

export function EscalationPanel({
  escalation,
  messageCount,
  datedMessageCount,
}: {
  escalation: EscalationAssessment;
  messageCount: number;
  datedMessageCount: number;
}) {
  return (
    <Card>
      <CardHeader
        title="Pattern & escalation summary"
        description="What the conversation as a whole suggests — based only on the evidence you pasted"
        icon={<span aria-hidden="true">🔎</span>}
      />

      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-navy-850 p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Messages analysed
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-slate-100">
            {messageCount}
          </dd>
          <dd className="text-xs text-slate-500">
            {datedMessageCount === messageCount
              ? 'all dated'
              : datedMessageCount === 0
                ? 'no dates provided'
                : `${datedMessageCount} dated`}
          </dd>
        </div>
        <div className="rounded-lg bg-navy-850 p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Warning-sign categories
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-slate-100">
            {escalation.distinctSignalTypes}
          </dd>
          <dd className="text-xs text-slate-500">
            {escalation.distinctSignalTypes >= 3
              ? 'combined pattern'
              : escalation.distinctSignalTypes === 1
                ? 'isolated sign'
                : 'multiple signs'}
          </dd>
        </div>
        <div className="rounded-lg bg-navy-850 p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Severity trend
          </dt>
          <dd className="mt-1 text-lg font-semibold text-slate-100">
            {TREND_LABELS[escalation.severityTrend]}
          </dd>
          <dd className="text-xs text-slate-500">
            {escalation.severityTrend === 'insufficient-data'
              ? 'add dates to enable'
              : 'across dated messages'}
          </dd>
        </div>
      </dl>

      <div className="mt-5 space-y-3 text-sm text-slate-300">
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Observed pattern
          </h4>
          <p className="mt-1">{escalation.patternSummary}</p>
        </div>
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Trend assessment
          </h4>
          <p className="mt-1">{escalation.trendExplanation}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Tag>Isolated sign ≠ pattern</Tag>
        <Tag>
          {escalation.repeatedContact.detected
            ? 'Repeated contact detected'
            : 'No repeated-contact pattern'}
        </Tag>
        <Tag>
          {escalation.dateCoverage === 'none'
            ? 'Timeline unknown — no dates provided'
            : escalation.dateCoverage === 'partial'
              ? 'Partial timeline (some dates missing)'
              : 'Full timeline available'}
        </Tag>
      </div>

      <p className="mt-4 rounded-lg bg-navy-850 px-3 py-2 text-xs text-slate-400">
        <span className="font-medium text-slate-300">Uncertainty:</span>{' '}
        Escalation analysis only works when you provide dates or
        timestamps. Missing dates are treated as unknown, never
        guessed. Trends describe the pasted evidence only.
      </p>
    </Card>
  );
}
