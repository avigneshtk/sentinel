'use client';

/**
 * Incident Timeline — user-controlled evidence organizer.
 *
 * Incidents live in memory by default; persistence in
 * localStorage is an explicit opt-in toggle. Every
 * record can be edited, deleted, or exported.
 */

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Field, TextArea, TextInput, Select, Label } from '@/components/ui/fields';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/states';
import { Tag } from '@/components/ui/badge';
import { useIncidents } from '@/components/incidents/incidents-provider';
import {
  CATEGORY_LABELS,
  Incident,
  IncidentCategory,
  IncidentValidationError,
  buildIncidentExport,
  buildIncidentExportJson,
  findRepeatedCategories,
  sortIncidents,
} from '@/lib/timeline/incidents';
import { downloadTextFile } from '@/lib/utils/format';
import { formatRelativeTime } from '@/lib/utils/format';

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [
  IncidentCategory,
  string
][];

export function TimelinePanel() {
  const {
    incidents,
    persistenceEnabled,
    addIncident,
    updateIncident,
    deleteIncident,
    clearAll,
    setPersistenceEnabled,
  } = useIncidents();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'unwanted-contact' as IncidentCategory,
    date: '',
    dateUnknown: false,
  });

  const sorted = useMemo(() => sortIncidents(incidents), [incidents]);
  const patterns = useMemo(
    () => findRepeatedCategories(incidents),
    [incidents]
  );

  function resetForm() {
    setForm({
      title: '',
      description: '',
      category: 'unwanted-contact',
      date: '',
      dateUnknown: false,
    });
    setEditingId(null);
    setError(undefined);
  }

  function handleSubmit() {
    try {
      if (editingId) {
        updateIncident(editingId, {
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          date: form.dateUnknown ? null : form.date,
          dateUnknown: form.dateUnknown,
        });
      } else {
        addIncident({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          date: form.dateUnknown ? null : form.date,
          dateUnknown: form.dateUnknown,
        });
      }
      resetForm();
    } catch (err) {
      if (err instanceof IncidentValidationError) {
        setError(err.message);
      } else {
        setError('Something went wrong saving this incident.');
      }
    }
  }

  function startEdit(incident: Incident) {
    setForm({
      title: incident.title,
      description: incident.description,
      category: incident.category,
      date: incident.date ?? '',
      dateUnknown: incident.dateUnknown,
    });
    setEditingId(incident.id);
    setError(undefined);
    document
      .getElementById('incident-form')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleExport(format: 'txt' | 'json') {
    if (incidents.length === 0) return;
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === 'txt') {
      downloadTextFile(
        `sentinel-incidents-${stamp}.txt`,
        buildIncidentExport(incidents)
      );
    } else {
      downloadTextFile(
        `sentinel-incidents-${stamp}.json`,
        buildIncidentExportJson(incidents),
        'application/json'
      );
    }
  }

  return (
    <div className="space-y-6">
      <Card id="incident-form">
        <CardHeader
          title={editingId ? 'Edit incident' : 'Record an incident'}
          description="Add what happened in your own words. Dates can be marked unknown. Records stay on your device only if you opt in below."
          icon={<span aria-hidden="true">🗒</span>}
        />

        {error && (
          <div className="mb-4">
            <Alert tone="warning">{error}</Alert>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Short title (optional)" htmlFor="inc-title">
            <TextInput
              id="inc-title"
              value={form.title}
              maxLength={120}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="e.g. Late-night messages from Arjun"
            />
          </Field>
          <Field label="Category" htmlFor="inc-category" required>
            <Select
              id="inc-category"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as IncidentCategory,
                })
              }
            >
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-4">
          <Field
            label="What happened?"
            htmlFor="inc-description"
            required
            hint="Stick to facts: what was said or done, by whom, and where it happened (platform). Keep it under 5,000 characters."
          >
            <TextArea
              id="inc-description"
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe the incident factually…"
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Date"
            htmlFor="inc-date"
            hint="YYYY-MM-DD. Leave blank and tick below if unknown."
          >
            <TextInput
              id="inc-date"
              type="date"
              value={form.date}
              disabled={form.dateUnknown}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
            />
          </Field>
          <div className="flex items-end pb-2">
            <Label>
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-navy-850 text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                checked={form.dateUnknown}
                onChange={(e) =>
                  setForm({ ...form, dateUnknown: e.target.checked })
                }
              />
              <span>
                Date unknown
                <span className="block text-xs font-normal text-slate-500">
                  Unknown dates are recorded as unknown — never guessed.
                </span>
              </span>
            </Label>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" size="lg" onClick={handleSubmit}>
            {editingId ? 'Save changes' : 'Add incident'}
          </Button>
          {editingId && (
            <Button type="button" size="lg" variant="secondary" onClick={resetForm}>
              Cancel editing
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Your incidents"
          description={`${incidents.length} record${incidents.length === 1 ? '' : 's'} · ${
            persistenceEnabled
              ? 'stored in this browser (opt-in)'
              : 'memory only — cleared when this tab closes'
          }`}
          icon={<span aria-hidden="true">📋</span>}
        />

        <div className="mb-4 flex flex-wrap items-center gap-4">
          <Label>
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-navy-850 text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              checked={persistenceEnabled}
              onChange={(e) => setPersistenceEnabled(e.target.checked)}
            />
            <span>
              Keep incidents on this device
              <span className="block text-xs font-normal text-slate-500">
                Saved to this browser&apos;s localStorage. Not a secure
                evidence vault — anyone with access to this device and
                browser can read them.
              </span>
            </span>
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={incidents.length === 0}
              onClick={() => handleExport('txt')}
            >
              Export summary (.txt)
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={incidents.length === 0}
              onClick={() => handleExport('json')}
            >
              Export (.json)
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={incidents.length === 0}
              onClick={() => {
                if (window.confirm('Delete all incident records? This cannot be undone.')) {
                  clearAll();
                }
              }}
            >
              Delete all
            </Button>
          </div>
        </div>

        {patterns.length > 0 && (
          <Alert tone="warning" title="Repeated pattern noticed">
            <p>
              {patterns.map((p) => `"${CATEGORY_LABELS[p.category]}" appears ${p.count} times`).join('; ')}.
              Repeated incidents of the same type may indicate an
              ongoing pattern — consider reporting the pattern, not
              just individual events. This observation is based only
              on the categories you recorded; it is not an automated
              risk assessment.
            </p>
          </Alert>
        )}

        {sorted.length === 0 ? (
          <EmptyState
            title="No incidents recorded"
            description="Use the form above to record an incident. Records are private to this browser unless you delete them."
          />
        ) : (
          <ol className="space-y-3">
            {sorted.map((incident) => (
              <li
                key={incident.id}
                className="rounded-lg border border-slate-700 bg-navy-850 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-100">
                    {incident.title || 'Untitled incident'}
                  </span>
                  <Tag>{CATEGORY_LABELS[incident.category]}</Tag>
                  {incident.dateUnknown ? (
                    <span className="rounded-full border border-slate-600 px-2 py-0.5 text-xs text-slate-400">
                      Date unknown
                    </span>
                  ) : (
                    <time
                      dateTime={incident.date ?? undefined}
                      className="rounded-full border border-slate-600 px-2 py-0.5 text-xs text-slate-300"
                    >
                      {incident.date}
                    </time>
                  )}
                  <span className="text-xs text-slate-500">
                    added {formatRelativeTime(incident.createdAt)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
                  {incident.description}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(incident)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (window.confirm('Delete this incident record?')) {
                        deleteIncident(incident.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Card>
        <CardHeader
          title="About this timeline"
          icon={<span aria-hidden="true">ℹ</span>}
        />
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
          <li>
            Records are user-reported information. SENTINEL adds
            no automated claims to them.
          </li>
          <li>
            Browser storage is <strong>not</strong> a secure
            evidence vault and records are not tamper-proof or
            legally authenticated. For official complaints, keep
            your own screenshots with dates.
          </li>
          <li>
            Nothing is transmitted to any server. The export
            files are generated locally on your device.
          </li>
        </ul>
      </Card>
    </div>
  );
}
