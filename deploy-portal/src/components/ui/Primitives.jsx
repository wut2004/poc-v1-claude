import { AlertTriangle, Check, CheckCircle2, Loader2, XCircle } from 'lucide-react';

export function Avatar({ person, size = 'h-7 w-7', text = 'text-[10px]', children }) {
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${person.gradient} ${size} ${text} font-semibold text-white ring-1 ring-white/20`}
      title={person.name}
    >
      <span aria-hidden>{person.initials}</span>
      <span className="sr-only">{person.name}</span>
      {children}
    </span>
  );
}

const STATUS = {
  live: { label: 'Live', cls: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300', dot: true },
  ready: { label: 'Ready', cls: 'border-white/10 bg-white/5 text-slate-300', icon: Check },
  building: { label: 'Building', cls: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300', icon: Loader2, spin: true },
  failed: { label: 'Failed', cls: 'border-rose-400/25 bg-rose-400/10 text-rose-300', icon: XCircle },
};

export function StatusBadge({ status }) {
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>
      {s.dot && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden>
          <span className="absolute inset-0 animate-ring rounded-full bg-emerald-400" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
      )}
      {Icon && <Icon className={`h-3 w-3 ${s.spin ? 'animate-spin' : ''}`} aria-hidden />}
      {s.label}
    </span>
  );
}

export const Mono = ({ children, className = '' }) => <span className={`font-mono ${className}`}>{children}</span>;

export const IconCopyState = ({ copied, Icon }) =>
  copied ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> : <Icon className="h-3.5 w-3.5" aria-hidden />;


const TONES = {
  success: { icon: CheckCircle2, cls: 'text-emerald-400' },
  warn: { icon: AlertTriangle, cls: 'text-amber-400' },
  error: { icon: XCircle, cls: 'text-rose-400' },
};

export function Toasts({ toasts }) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4">
      {toasts.map((t) => {
        const { icon: Icon, cls } = TONES[t.tone] || TONES.success;
        return (
          <div key={t.id} className="pointer-events-auto flex max-w-sm animate-rise items-center gap-2.5 rounded-xl border border-white/10 bg-zinc-900/95 px-3.5 py-2.5 text-[13px] text-slate-200 shadow-2xl shadow-black/60 backdrop-blur-xl">
            <Icon className={`h-4 w-4 shrink-0 ${cls}`} aria-hidden />
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
