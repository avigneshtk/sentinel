'use client';

/**
 * Immediate-safety banner — shown only when findings
 * suggest credible signs of danger. Concise, actionable,
 * and never presents the analysis as a substitute for
 * emergency help.
 */

import { REPORTING_RESOURCES } from '@/data/reporting-resources';

export function ImmediateSafetyBanner({ country = 'IN' }: { country?: string }) {
  const resources = REPORTING_RESOURCES.find((c) => c.code === country) ?? REPORTING_RESOURCES[0];

  return (
    <div
      role="alert"
      className="rounded-xl border-2 border-rose-500/50 bg-rose-500/10 p-5"
    >
      <h3 className="text-base font-semibold text-rose-200">
        Possible immediate danger — act first, analyse later
      </h3>
      <p className="mt-2 text-sm text-slate-200">
        The findings include severe warning signs. If you feel unsafe
        right now, get human help immediately. This automated analysis
        is <strong>not</strong> a substitute for emergency services.
      </p>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-200">
        <li>
          📞 Emergency (
          {resources.name}):{' '}
          <a
            href={`tel:${resources.emergencyNumber}`}
            className="font-semibold text-rose-300 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            {resources.emergencyNumber}
          </a>
        </li>
        {resources.resources
          .filter((r) => r.type === 'support' || r.type === 'helpline')
          .slice(0, 2)
          .map((r) => (
            <li key={r.name}>
              {r.phone ? `📞 ${r.name}: ` : ''}
              {r.phone ? (
                <a
                  href={`tel:${r.phone}`}
                  className="font-semibold text-rose-300 underline"
                >
                  {r.phone}
                </a>
              ) : (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-rose-300 underline"
                >
                  {r.name}
                </a>
              )}
            </li>
          ))}
      </ul>
      <p className="mt-3 text-xs text-slate-400">
        Tell a trusted person what is happening. If your device may be
        monitored, use a safe device or phone to make calls.
      </p>
    </div>
  );
}
