import { Severity } from '@/lib/analysis/types';
import { SEVERITY_LABELS } from '@/lib/analysis/types';

/**
 * Severity badge. Always includes a text label so
 * severity is never communicated by color alone.
 */
export function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    informational:
      'bg-sky-500/10 text-sky-300 border-sky-500/30',
    caution: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    elevated: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  };
  const dots: Record<Severity, string> = {
    informational: '●',
    caution: '◆',
    elevated: '▲',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[severity]}`}
    >
      <span aria-hidden="true">{dots[severity]}</span>
      {SEVERITY_LABELS[severity]}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-700 bg-navy-800 px-2.5 py-0.5 text-xs text-slate-300">
      {children}
    </span>
  );
}
