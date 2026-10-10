import { ReactNode } from 'react';

type AlertTone = 'info' | 'warning' | 'danger' | 'success';

const tones: Record<AlertTone, { box: string; icon: string }> = {
  info: {
    box: 'border-sky-500/30 bg-sky-500/5',
    icon: 'ℹ',
  },
  warning: {
    box: 'border-amber-500/30 bg-amber-500/5',
    icon: '⚠',
  },
  danger: {
    box: 'border-rose-500/40 bg-rose-500/10',
    icon: '⛔',
  },
  success: {
    box: 'border-emerald-500/30 bg-emerald-500/5',
    icon: '✓',
  },
};

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
}

export function Alert({ tone = 'info', title, children }: AlertProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`rounded-lg border p-4 ${tones[tone].box}`}
    >
      <div className="flex gap-3">
        <span aria-hidden="true" className="mt-0.5 shrink-0 text-base">
          {tones[tone].icon}
        </span>
        <div className="text-sm">
          {title && (
            <p className="font-semibold text-slate-100">{title}</p>
          )}
          <div className="mt-0.5 text-slate-300">{children}</div>
        </div>
      </div>
    </div>
  );
}
