'use client';

/**
 * Safety & Reporting Centre.
 *
 * Country + incident-type selectors drive practical
 * guidance and verified official resources.
 * SENTINEL guidance is always visually distinguished
 * from official complaint channels.
 */

import { useMemo, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Select, Field } from '@/components/ui/fields';
import { Tag } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import {
  CountryResources,
  INCIDENT_GUIDANCE,
  INCIDENT_TYPE_LABELS,
  IncidentType,
  REPORTING_RESOURCES,
  RESOURCE_TYPE_LABELS,
  ResourceType,
} from '@/data/reporting-resources';

const COUNTRIES = REPORTING_RESOURCES;
const INCIDENT_TYPES = Object.entries(INCIDENT_TYPE_LABELS) as [
  IncidentType,
  string
][];

export function SafetyCenterPanel() {
  const [countryCode, setCountryCode] = useState<string>(
    COUNTRIES[0].code
  );
  const [incidentType, setIncidentType] = useState<IncidentType>('general');

  const country: CountryResources = useMemo(
    () =>
      COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0],
    [countryCode]
  );

  const guidance = INCIDENT_GUIDANCE[incidentType];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Find the right help"
          description="Choose your country and what is happening. All resources below are official or specialist services, verified before inclusion."
          icon={<span aria-hidden="true">🛟</span>}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country" htmlFor="country-select">
            <Select
              id="country-select"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="What is happening?" htmlFor="incident-type-select">
            <Select
              id="incident-type-select"
              value={incidentType}
              onChange={(e) =>
                setIncidentType(e.target.value as IncidentType)
              }
            >
              {INCIDENT_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-5">
          <div
            role="alert"
            className="rounded-lg border-2 border-rose-500/50 bg-rose-500/10 p-4"
          >
            <p className="text-sm font-semibold text-rose-200">
              Emergency in {country.name}: call{' '}
              <a
                href={`tel:${country.emergencyNumber}`}
                className="underline"
              >
                {country.emergencyNumber}
              </a>
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {country.emergencyNote}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={`Safety steps — ${INCIDENT_TYPE_LABELS[incidentType].toLowerCase()}`}
          description="SENTINEL guidance. Following it does not file any official complaint."
          icon={<span aria-hidden="true">🧭</span>}
        />
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
          {guidance.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-100">
          Official channels & support — {country.name}
        </h2>
        <p className="mb-4 text-sm text-slate-400">
          These are external official services. Opening them does
          not send your data to SENTINEL, and SENTINEL never
          files a complaint on your behalf.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {country.resources.map((resource) => (
            <Card key={resource.name}>
              <div className="flex flex-wrap items-center gap-2">
                <Tag>{RESOURCE_TYPE_LABELS[resource.type as ResourceType]}</Tag>
                {resource.phone && (
                  <a
                    href={`tel:${resource.phone}`}
                    className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300"
                  >
                    📞 {resource.phone}
                  </a>
                )}
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-100">
                {resource.name}
              </h3>
              <p className="mt-1.5 text-sm text-slate-300">
                {resource.description}
              </p>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-300 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                Visit official site{' '}
                <span aria-hidden="true">↗</span>
                <span className="sr-only">
                  (opens in a new tab: {resource.url})
                </span>
              </a>
            </Card>
          ))}
        </div>
      </div>

      <Alert tone="info" title="Important distinction">
        <p>
          SENTINEL provides guidance only. Filing a complaint
          happens on the official portals above, in their own
          forms, under their own terms. If you are under 18,
          tell a trusted adult — in India you can also call
          Childline at 1098.
        </p>
        <p className="mt-2">
          If your device may be monitored, remember that
          browser history can be visible. Consider using a safe
          device, and clear history only if doing so will not
          raise suspicion.
        </p>
      </Alert>

      <div className="rounded-xl border border-slate-700 bg-navy-900 p-5">
        <h2 className="text-sm font-semibold text-slate-100">
          Add a country
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          More countries are added as their official resources
          are verified against government sources. The resource
          data is structured so new countries can be added
          without code changes to the interface.
        </p>
      </div>
    </div>
  );
}
