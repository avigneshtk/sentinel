'use client';

/**
 * Privacy & Settings — full transparency about what
 * SENTINEL does and does not do, plus working data
 * controls.
 */

import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { RULES } from '@/lib/analysis/rules';
import { useIncidents } from '@/components/incidents/incidents-provider';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/lib/privacy-scanner/ocr';

export default function SettingsPage() {
  const { incidents, persistenceEnabled, clearAll, setPersistenceEnabled } =
    useIncidents();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">
          Privacy & Settings
        </h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Exactly what SENTINEL does with your data, and the
          controls you have. If a feature is not listed here
          as transmitting data, it does not transmit data.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card tone="safe">
          <CardHeader
            title="What SENTINEL does"
            icon={<span aria-hidden="true">✓</span>}
          />
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
            <li>
              Analyzes conversations locally in your browser
              with a fixed, visible rule set (listed below).
            </li>
            <li>
              Runs Tesseract.js OCR on-device for image
              scanning.
            </li>
            <li>
              Stores incident records in this browser&apos;s
              localStorage — only when you enable the opt-in
              toggle.
            </li>
            <li>
              Links out to official reporting portals when you
              choose to visit them.
            </li>
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="What SENTINEL never does"
            icon={<span aria-hidden="true">✗</span>}
          />
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
            <li>No accounts, no sign-ups, no tracking pixels.</li>
            <li>
              No server, database, or external AI provider —
              there is nothing to leak because nothing is
              collected.
            </li>
            <li>
              Never uploads images, conversations, or incident
              records.
            </li>
            <li>
              Never contacts an alleged perpetrator, files a
              complaint, or claims anyone&apos;s guilt.
            </li>
            <li>
              Never logs raw conversations or sensitive
              content.
            </li>
          </ul>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader
            title="Data controls"
            description="Working controls — each performs its advertised action."
            icon={<span aria-hidden="true">🎛</span>}
          />
          <div className="space-y-4">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-navy-850 text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                checked={persistenceEnabled}
                onChange={(e) => setPersistenceEnabled(e.target.checked)}
              />
              <span>
                Keep incident records in this browser
                <span className="block text-xs font-normal text-slate-500">
                  When off, incidents exist only in memory and
                  vanish when the tab closes. When on, they are
                  stored in localStorage on this device only.
                </span>
              </span>
            </label>

            <p className="text-sm text-slate-400">
              Currently retained:{' '}
              <strong className="text-slate-200">
                {incidents.length} incident record
                {incidents.length === 1 ? '' : 's'}
              </strong>{' '}
              · Conversations and images are never retained.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={incidents.length === 0}
                onClick={() => {
                  if (confirmClear) {
                    clearAll();
                    setConfirmClear(false);
                  } else {
                    setConfirmClear(true);
                  }
                }}
              >
                {confirmClear
                  ? 'Click again to confirm delete-all'
                  : 'Delete all retained records'}
              </Button>
              {confirmClear && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader
            title="The complete rule set"
            description="Full transparency: every rule TraceTrust can apply. This is a heuristic engine, not a machine-learning model."
            icon={<span aria-hidden="true">📜</span>}
          />
          <ul className="grid gap-2 sm:grid-cols-2">
            {RULES.map((rule) => (
              <li
                key={rule.id}
                className="rounded-lg border border-slate-700 bg-navy-850 px-3 py-2.5"
              >
                <span className="text-sm font-medium text-slate-100">
                  {rule.name}
                </span>
                <span className="block text-xs text-slate-500">
                  Rule ID: {rule.id} · Category: {rule.category}
                  {rule.immediateSafety
                    ? ' · triggers immediate-safety guidance'
                    : ''}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg bg-navy-850 px-3 py-2 text-xs text-slate-400">
            Rules match text patterns with simple negation
            handling. They do not understand sarcasm, jokes,
            or context. False positives and false negatives
            are possible — findings are triage guidance only.
          </p>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader
            title="Scanner scope & limits"
            icon={<span aria-hidden="true">🖼</span>}
          />
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
            <li>
              Accepted image types: {ALLOWED_IMAGE_TYPES.join(', ')}.
            </li>
            <li>
              Maximum size: {(MAX_IMAGE_SIZE_BYTES / 1024 / 1024).toFixed(0)} MB.
            </li>
            <li>
              Detects: phone-number-like strings, email
              addresses, address-like clues, 6-digit PINs near
              address words, and sensitive-document keywords.
            </li>
            <li>
              Does not detect faces, objects, GPS metadata, or
              locations depicted in images, and cannot catch
              every sensitive detail.
            </li>
          </ul>
        </Card>
      </section>

      <Alert tone="info" title="Safety note">
        If your device or browser may be monitored by someone
        else, remember that history and retained records can be
        visible. Use a safe device for sensitive steps, and
        weigh the risk before clearing data if doing so could
        raise suspicion.
      </Alert>
    </div>
  );
}
