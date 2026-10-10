'use client';

import { useEffect, useRef, useState } from 'react';
import { analyzeConversation, AnalysisInputError } from '@/lib/analysis/analyze-conversation';
import { AnalysisResult, ConversationMessage } from '@/lib/analysis/types';
import { parseConversationText } from '@/lib/analysis/parse-conversation';
import { DEMO_SCENARIOS } from '@/data/demo-scenarios';
import { ConversationForm } from '@/components/analyzer/conversation-form';
import { FindingsList } from '@/components/analyzer/findings-list';
import { EscalationPanel } from '@/components/analyzer/escalation-panel';
import { ImmediateSafetyBanner } from '@/components/analyzer/immediate-safety-banner';
import { TranscriptView } from '@/components/analyzer/transcript-view';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Tag } from '@/components/ui/badge';
import { SEVERITY_LABELS } from '@/lib/analysis/types';
import { RULES } from '@/lib/analysis/rules';

const CONCERN_META = {
  'no-strong-indicators': { tone: 'safe' as const, heading: 'No strong warning signs' },
  caution: { tone: 'caution' as const, heading: 'Caution — warning signs present' },
  'elevated-concern': { tone: 'elevated' as const, heading: 'Elevated concern' },
};

export default function AnalyzePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<string | undefined>();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Support /analyze?demo=<id> — load a fictional scenario.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demoId = params.get('demo');
    if (demoId) {
      const scenario = DEMO_SCENARIOS.find((s) => s.id === demoId);
      if (scenario) {
        runAnalysis(scenario.text, scenario.labels);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runAnalysis(text: string, labels: string[]) {
    setLoading(true);
    setError(undefined);
    // Keep the loading state perceptible so the flow is
    // demonstrable; analysis itself is synchronous.
    window.setTimeout(() => {
      try {
        const analysis = analyzeConversation({ text, labels });
        setResult(analysis);
        setMessages(parseConversationText(text));
        window.setTimeout(() => {
          resultsRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 60);
      } catch (err) {
        setResult(null);
        setMessages([]);
        setError(
          err instanceof AnalysisInputError
            ? err.message
            : 'Analysis failed unexpectedly. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }, 500);
  }

  function handleClear() {
    setResult(null);
    setMessages([]);
    setError(undefined);
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">
          TraceTrust
        </h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Conversation-level behavioural threat analysis.
          TraceTrust looks for patterns across messages and
          over time — not just single unsafe words — and
          explains every finding with the text that triggered
          it.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <ConversationForm onAnalyze={runAnalysis} loading={loading} />

        <div ref={resultsRef} className="scroll-mt-24">
          {loading && (
            <Card>
              <div role="status" aria-live="polite" className="py-10 text-center">
                <span
                  aria-hidden="true"
                  className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"
                />
                <p className="mt-3 text-sm text-slate-300">
                  Analyzing conversation against {RULES.length} behavioural
                  rules…
                </p>
              </div>
            </Card>
          )}

          {!loading && error && (
            <Alert tone="warning" title="Could not analyze">
              {error}
            </Alert>
          )}

          {!loading && !error && !result && (
            <Card>
              <div className="py-10 text-center">
                <p className="text-sm font-medium text-slate-300">
                  Results will appear here
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Paste a conversation or load a fictional demo
                  scenario to begin.
                </p>
              </div>
            </Card>
          )}

          {!loading && result && (
            <div className="space-y-6">
              {result.immediateSafetyAlert && (
                <ImmediateSafetyBanner country="IN" />
              )}

              <Card tone={CONCERN_META[result.overallConcern].tone}>
                <CardHeader
                  title={CONCERN_META[result.overallConcern].heading}
                  description={`Analyzed ${result.messageCount} messages (${result.datedMessageCount} dated) · ${result.findings.length} findings · ${result.escalation.distinctSignalTypes} warning-sign categories`}
                  icon={<span aria-hidden="true">📊</span>}
                />
                <p className="text-sm text-slate-300">
                  {result.overallExplanation}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Tag>
                    Concern level:{' '}
                    {
                      {
                        'no-strong-indicators': 'None detected',
                        caution: 'Caution',
                        'elevated-concern': 'Elevated',
                      }[result.overallConcern]
                    }
                  </Tag>
                  <Tag>Rule engine · deterministic</Tag>
                </div>
              </Card>

              <EscalationPanel
                escalation={result.escalation}
                messageCount={result.messageCount}
                datedMessageCount={result.datedMessageCount}
              />

              <section aria-label="Findings">
                <h2 className="mb-3 text-lg font-semibold text-slate-100">
                  Findings ({result.findings.length})
                </h2>
                <FindingsList findings={result.findings} messages={messages} />
              </section>

              <section aria-label="Chronological transcript">
                <h2 className="mb-3 text-lg font-semibold text-slate-100">
                  Chronological view
                </h2>
                <TranscriptView messages={messages} findings={result.findings} />
              </section>

              <Card>
                <CardHeader
                  title="Recommended next steps"
                  icon={<span aria-hidden="true">✅</span>}
                />
                <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
                  {result.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ol>
              </Card>

              <Card>
                <CardHeader
                  title="Limitations of this analysis"
                  icon={<span aria-hidden="true">⚠</span>}
                />
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
                  {result.limitations.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
                <p className="mt-4 rounded-lg bg-navy-850 px-3 py-2 text-xs text-slate-400">
                  Analyzed at {new Date(result.analyzedAt).toLocaleString()} ·
                  Severity categories:{' '}
                  {Object.values(SEVERITY_LABELS).join(' / ')}. These are
                  triage guidance, not predictions.
                </p>
                <div className="mt-4">
                  <Button type="button" size="sm" variant="secondary" onClick={handleClear}>
                    Clear results
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
