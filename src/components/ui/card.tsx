import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Visual emphasis; always paired with a text label, never color alone. */
  tone?: 'default' | 'caution' | 'elevated' | 'safe';
}

const tones: Record<string, string> = {
  default: 'bg-navy-900 border-slate-800',
  caution: 'bg-amber-500/5 border-amber-500/30',
  elevated: 'bg-rose-500/5 border-rose-500/30',
  safe: 'bg-emerald-500/5 border-emerald-500/25',
};

export function Card({ children, tone = 'default', className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border p-5 ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      {icon && (
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
          {icon}
        </span>
      )}
      <div>
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        {description && (
          <p className="mt-0.5 text-sm text-slate-400">{description}</p>
        )}
      </div>
    </div>
  );
}
