'use client';

/**
 * Dashboard widgets: tool cards, how-it-works,
 * privacy snapshot, and recent incidents
 * (only when the user has retained records).
 */

import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/badge';
import { useIncidents } from '@/components/incidents/incidents-provider';
import { CATEGORY_LABELS } from '@/lib/timeline/incidents';
import { formatRelativeTime } from '@/lib/utils/format';

const TOOLS = [
  {
    href: '/analyze',
    name: 'TraceTrust',
    tagline: 'Conversation threat analysis',
    description:
      'Paste a conversation to detect warning signs, repeated contact, and escalation — with explanations for every finding.',
    icon: '💬',
    cta: 'Analyze a conversation',
  },
  {
    href: '/privacy-scan',
    name: 'TRACELESS',
    tagline: 'Privacy scanner',
    description:
      'Scan an image and caption for phone numbers, emails, addresses, and document clues before you publish. Fully on-device.',
    icon: '🖼',
    cta: 'Scan an image',
  },
  {
    href: '/timeline',
    name: 'Incident Timeline',
    tagline: 'Evidence organizer',
    description:
      'Record incidents with dates, notice repeated patterns, and export a factual summary. You control what is kept.',
    icon: '🗒',
    cta: 'Open timeline',
  },
  {
    href: '/safety-center',
    name: 'Safety Centre',
    tagline: 'Reporting & support',
    description:
      'Country-specific official reporting channels, helplines, and practical safety steps for each incident type.',
    icon: '🛟',
    cta: 'Get support options',
  },
];

export function ToolCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {TOOLS.map((tool) => (
        <Card key={tool.href} className="flex flex-col">
          <CardHeader
            title={tool.name}
            description={tool.tagline}
            icon={<span aria-hidden="true">{tool.icon}</span>}
          />
          <p className="flex-1 text-sm text-slate-300">
            {tool.description}
          </p>
          <div className="mt-4">
            <Link href={tool.href}>
              <Button size="sm">{tool.cta}</Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    {
      title: 'Recognize',
      body: 'Paste a conversation or record an incident. SENTINEL explains warning signs in plain language — never as a verdict.',
    },
    {
      title: 'Prevent',
      body: 'Scan photos and captions for personal-information exposure before you publish. Reduce what others can learn about you.',
    },
    {
      title: 'Detect early',
      body: 'Warning signs are analysed across messages and over time — repeated contact, ignored boundaries, and escalation — as early as your evidence permits.',
    },
    {
      title: 'Take action',
      body: 'Get practical next steps and official reporting channels for your country. You stay in control of what is shared and kept.',
    },
  ];
  return (
    <Card>
      <CardHeader
        title="How SENTINEL works"
        description="Four outcomes, one goal: help you stay safe online."
        icon={<span aria-hidden="true">🧭</span>}
      />
      <ol className="grid gap-4 sm:grid-cols-2">
        {steps.map((step, i) => (
          <li key={step.title} className="rounded-lg bg-navy-850 p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
              {i + 1}. {step.title}
            </span>
            <p className="mt-1.5 text-sm text-slate-300">{step.body}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function PrivacySnapshot() {
  return (
    <Card>
      <CardHeader
        title="Your privacy, by design"
        icon={<span aria-hidden="true">🔒</span>}
      />
      <ul className="space-y-2 text-sm text-slate-300">
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-emerald-400">✓</span>
          Conversation analysis runs entirely in your browser —
          nothing is sent to a server.
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-emerald-400">✓</span>
          No account is required for any analysis tool.
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-emerald-400">✓</span>
          Images are OCR-scanned on-device only.
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-amber-300">!</span>
          Incident records exist only in memory unless you
          opt in to browser storage — which is not a secure
          evidence vault.
        </li>
      </ul>
      <div className="mt-4">
        <Link href="/settings">
          <Button size="sm" variant="secondary">
            Privacy & data controls
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export function RecentIncidents() {
  const { incidents, persistenceEnabled, clearAll } = useIncidents();
  const sorted = [...incidents]
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
    .reverse()
    .slice(0, 5);

  return (
    <Card>
      <CardHeader
        title="Recent incidents"
        description="Only visible because you recorded them in this browser."
        icon={<span aria-hidden="true">🗒</span>}
      />
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400">
          No incidents recorded. Analysis and safety guidance
          never require recording anything.
        </p>
      ) : (
        <>
          <ul className="space-y-2.5">
            {sorted.map((incident) => (
              <li
                key={incident.id}
                className="rounded-lg border border-slate-700 bg-navy-850 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-100">
                    {incident.title || 'Untitled'}
                  </span>
                  <Tag>{CATEGORY_LABELS[incident.category]}</Tag>
                  {incident.dateUnknown ? (
                    <span className="text-xs text-slate-500">
                      date unknown
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">
                      {incident.date}
                    </span>
                  )}
                  <span className="text-xs text-slate-600">
                    {formatRelativeTime(incident.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href="/timeline">
              <Button size="sm" variant="secondary">
                Manage timeline
              </Button>
            </Link>
            <span className="text-xs text-slate-500">
              {persistenceEnabled
                ? 'Stored in this browser (opt-in).'
                : 'Memory only — closes with this tab.'}{' '}
            </span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete all incident records?')) {
                  clearAll();
                }
              }}
              className="text-xs font-medium text-rose-400 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              Delete all records
            </button>
          </div>
        </>
      )}
    </Card>
  );
}

export function QuickSupport() {
  return (
    <Card tone="elevated">
      <CardHeader
        title="Worried right now?"
        description="You don't need to prove anything to get help."
        icon={<span aria-hidden="true">🆘</span>}
      />
      <ul className="space-y-2 text-sm text-slate-300">
        <li>
          📞 <strong>India emergency:</strong>{' '}
          <a className="text-indigo-300 underline" href="tel:112">
            112
          </a>{' '}
          (police, fire, ambulance)
        </li>
        <li>
          📞 <strong>Women Helpline:</strong>{' '}
          <a className="text-indigo-300 underline" href="tel:181">
            181
          </a>
        </li>
        <li>
          📞 <strong>Cyber Crime Helpline:</strong>{' '}
          <a className="text-indigo-300 underline" href="tel:1930">
            1930
          </a>{' '}
          ·{' '}
          <a
            className="text-indigo-300 underline"
            href="https://cybercrime.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            cybercrime.gov.in
          </a>
        </li>
      </ul>
      <div className="mt-4">
        <Link href="/safety-center">
          <Button size="sm" variant="secondary">
            Open Safety Centre
          </Button>
        </Link>
      </div>
    </Card>
  );
}
