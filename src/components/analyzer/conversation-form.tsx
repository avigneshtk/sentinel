'use client';

/**
 * Conversation input form for TraceTrust.
 * Includes demo scenario picker, user-context labels,
 * validation, and the privacy notice.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Field, TextArea, Label } from '@/components/ui/fields';
import { DEMO_SCENARIOS } from '@/data/demo-scenarios';
import { USER_LABELS } from '@/lib/analysis/rules/user-labels';
import { MAX_INPUT_LENGTH } from '@/lib/analysis/analyze-conversation';
import { Alert } from '@/components/ui/alert';

interface ConversationFormProps {
  onAnalyze: (text: string, labels: string[]) => void;
  loading: boolean;
}

export function ConversationForm({ onAnalyze, loading }: ConversationFormProps) {
  const [text, setText] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [selectedDemo, setSelectedDemo] = useState<string>('');

  const remaining = MAX_INPUT_LENGTH - text.length;
  const overLimit = text.length > MAX_INPUT_LENGTH;

  function toggleLabel(id: string) {
    setLabels((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }

  function loadDemo(scenarioId: string) {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;
    setText(scenario.text);
    setLabels(scenario.labels);
    setSelectedDemo(scenarioId);
    setError(undefined);
  }

  function handleSubmit() {
    if (!text.trim()) {
      setError('Please paste a conversation to analyse.');
      return;
    }
    if (text.length > MAX_INPUT_LENGTH) {
      setError(
        `Conversation exceeds the ${MAX_INPUT_LENGTH.toLocaleString()} character limit. Please paste a shorter excerpt.`
      );
      return;
    }
    setError(undefined);
    onAnalyze(text, labels);
  }

  function handleClear() {
    setText('');
    setLabels([]);
    setSelectedDemo('');
    setError(undefined);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Paste a conversation"
          description="Paste the full chat, including sender names and any dates/timestamps. Example: [2025-01-06 21:14] Arjun: hey, are you there?"
          icon={<span aria-hidden="true">💬</span>}
        />

        <Field
          label="Conversation text"
          htmlFor="conversation-input"
          required
          error={error}
          hint={`${text.length.toLocaleString()} / ${MAX_INPUT_LENGTH.toLocaleString()} characters. Processed only in your browser.`}
        >
          <TextArea
            id="conversation-input"
            rows={12}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(undefined);
            }}
            placeholder="Paste messages here, one per line or in chat-export format…"
            aria-invalid={Boolean(error) || overLimit}
            aria-describedby="conversation-hint"
          />
        </Field>

        {overLimit && (
          <Alert tone="warning" title="Too long">
            This conversation exceeds the limit. Please paste the most
            relevant portion.
          </Alert>
        )}

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-slate-200">
            Load a fictional demo scenario
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {DEMO_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => loadDemo(scenario.id)}
                aria-pressed={selectedDemo === scenario.id}
                className={`rounded-lg border p-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  selectedDemo === scenario.id
                    ? 'border-indigo-400/60 bg-indigo-500/10'
                    : 'border-slate-700 bg-navy-850 hover:border-slate-600'
                }`}
              >
                <span className="font-medium text-slate-100">
                  {scenario.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {scenario.title}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            All demo scenarios are fictional and written for this
            demonstration. The same input always produces the same
            findings.
          </p>
        </div>

        <fieldset className="mt-6">
          <legend className="mb-2 text-sm font-medium text-slate-200">
            Context you know (optional)
          </legend>
          <p className="mb-3 text-xs text-slate-500">
            These are your observations, not automated findings. They
            appear in results marked as user-reported.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {USER_LABELS.map((label) => (
              <Label key={label.id}>
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-600 bg-navy-850 text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  checked={labels.includes(label.id)}
                  onChange={() => toggleLabel(label.id)}
                />
                <span>{label.label}</span>
              </Label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            size="lg"
            loading={loading}
            onClick={handleSubmit}
            aria-busy={loading}
          >
            {loading ? 'Analyzing…' : 'Analyze conversation'}
          </Button>
          <Button type="button" size="lg" variant="secondary" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Privacy notice"
          icon={<span aria-hidden="true">🔒</span>}
        />
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
          <li>
            Analysis runs <strong>entirely in your browser</strong>.
            Your conversation is never sent to SENTINEL servers or any
            external AI service.
          </li>
          <li>
            Nothing is stored by default. Closing the tab discards
            everything.
          </li>
          <li>
            SENTINEL is a fixed, transparent rule engine — not a
            machine-learning model — so the same input always produces
            the same findings.
          </li>
          <li>
            Findings are triage guidance, not proof of anyone&apos;s
            identity, guilt, or intent.
          </li>
        </ul>
      </Card>
    </div>
  );
}
