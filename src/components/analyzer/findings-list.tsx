'use client';

/**
 * Findings list — each finding shows the matched signal,
 * the verbatim supporting text, an explanation, a
 * recommendation, and its uncertainty/limitation.
 */

import { SignalMatch } from '@/lib/analysis/types';
import { CONFIDENCE_LABELS } from '@/lib/analysis/types';
import { Card } from '@/components/ui/card';
import { SeverityBadge, Tag } from '@/components/ui/badge';

interface FindingsListProps {
  findings: SignalMatch[];
  /** Full message list so finding excerpts can be located. */
  messages: { index: number; sender: string | null; text: string }[];
}

export function FindingsList({ findings, messages }: FindingsListProps) {
  if (findings.length === 0) {
    return (
      <Card tone="safe">
        <p className="text-sm font-medium text-emerald-300">
          No warning signs detected
        </p>
        <p className="mt-1 text-sm text-slate-400">
          The rule engine did not match any warning signs in the text
          you provided. A clean result does not guarantee safety — if
          something feels wrong, trust that feeling and talk to a
          trusted person.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label="Detected findings">
      {findings.map((finding, i) => {
        const involved = messages.filter((m) =>
          finding.messageIndexes.includes(m.index)
        );
        return (
          <Card key={`${finding.ruleId}-${i}`} tone={finding.severity === 'elevated' ? 'elevated' : finding.severity === 'caution' ? 'caution' : 'default'}>
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={finding.severity} />
              <Tag>{finding.signal}</Tag>
              <span className="text-xs text-slate-500">
                {CONFIDENCE_LABELS[finding.confidence]}
              </span>
            </div>

            {finding.messageIndexes.length > 0 && (
              <p className="mt-3 text-xs text-slate-500">
                Triggered by message
                {finding.messageIndexes.length === 1 ? '' : 's'}{' '}
                {finding.messageIndexes.join(', ')} of{' '}
                {messages.length}
                {finding.messageIndexes.length > 1 &&
                  ' — a repeated pattern, not an isolated message'}
                .
              </p>
            )}

            <blockquote className="mt-3 rounded-lg border-l-2 border-indigo-400/60 bg-navy-850 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Supporting text (verbatim from your input)
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-200">
                {finding.excerpt}
              </p>
            </blockquote>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Why this may matter
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {finding.explanation}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Suggested next step
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {finding.recommendation}
                </p>
              </div>
            </div>

            {finding.limitation && (
              <p className="mt-4 rounded-lg bg-navy-850 px-3 py-2 text-xs text-slate-400">
                <span className="font-medium text-slate-300">
                  Uncertainty:
                </span>{' '}
                {finding.limitation}
              </p>
            )}

            {involved.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                  Show full message
                  {involved.length === 1 ? '' : 's'} ({involved.length})
                </summary>
                <ul className="mt-2 space-y-2">
                  {involved.map((m) => (
                    <li
                      key={m.index}
                      className="rounded-lg border border-slate-800 bg-navy-850 px-3 py-2 text-sm"
                    >
                      <span className="text-xs text-slate-500">
                        Message {m.index}
                        {m.sender ? ` — ${m.sender}` : ''}
                      </span>
                      <p className="whitespace-pre-wrap text-slate-200">
                        {m.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </Card>
        );
      })}
    </div>
  );
}
