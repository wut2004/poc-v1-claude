import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

const ITEM = '[role^="menuitem"]:not([aria-disabled="true"])';

/** Accessible popover menu: click-outside, Esc, and arrow-key navigation. */
export function Menu({ trigger, children, align = 'left', width = 'w-64', label }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const btn = useRef(null);
  const panel = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!root.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    panel.current?.querySelector(ITEM)?.focus();
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); return; }
    if (e.key === 'Tab') { setOpen(false); return; }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const items = [...panel.current.querySelectorAll(ITEM)];
    if (!items.length) return;
    const i = items.indexOf(document.activeElement);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next].focus();
  };

  const close = () => { setOpen(false); btn.current?.focus(); };

  return (
    <div ref={root} className="relative">
      {trigger({
        open,
        props: {
          ref: btn,
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          onClick: () => setOpen((o) => !o),
          onKeyDown: (e) => { if (e.key === 'ArrowDown' && !open) { e.preventDefault(); setOpen(true); } },
        },
      })}
      {open && (
        <div
          ref={panel}
          role="menu"
          aria-label={label}
          onKeyDown={onKeyDown}
          className={`absolute top-full z-50 mt-2 ${width} ${align === 'right' ? 'right-0' : 'left-0'} max-w-[calc(100vw-2rem)] animate-pop rounded-xl border border-white/10 bg-zinc-900/95 p-1 shadow-2xl shadow-black/60 backdrop-blur-xl`}
        >
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  );
}

export function MenuLabel({ children }) {
  return <div className="label px-2.5 pb-1 pt-2" role="presentation">{children}</div>;
}

export function MenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-white/10" />;
}

export function MenuItem({ icon: Icon, children, description, onClick, disabled, selected, tone, trailing }) {
  const color = tone === 'danger' ? 'text-rose-300 hover:bg-rose-500/10 focus:bg-rose-500/10' : 'text-slate-200 hover:bg-white/10 focus:bg-white/10';
  return (
    <button
      type="button"
      role={selected !== undefined ? 'menuitemradio' : 'menuitem'}
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      tabIndex={-1}
      onClick={disabled ? undefined : onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] outline-none transition-colors ${color} ${disabled ? 'cursor-not-allowed opacity-40 hover:!bg-transparent' : ''}`}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />}
      <span className="min-w-0 flex-1">
        <span className="block truncate">{children}</span>
        {description && <span className="block truncate text-[11px] text-slate-500">{description}</span>}
      </span>
      {trailing}
      {selected && <Check className="h-4 w-4 shrink-0 text-violet-300" aria-hidden />}
    </button>
  );
}
