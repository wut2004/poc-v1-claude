import { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, Search } from 'lucide-react';

export default function CommandPalette({ open, onClose, items }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef(null);
  const list = useRef(null);
  const returnFocus = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => `${i.group} ${i.label}`.toLowerCase().includes(q)) : items;
  }, [items, query]);

  useEffect(() => {
    if (!open) return undefined;
    returnFocus.current = document.activeElement;
    setQuery('');
    setActive(0);
    input.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      returnFocus.current?.focus?.();
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const run = (item) => { onClose(); item.run(); };
  const onKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) run(results[active]);
    else if (e.key === 'Tab') e.preventDefault();
  };

  let lastGroup;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/70 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Command palette" onKeyDown={onKeyDown}
        className="w-full max-w-xl animate-pop overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/70">
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Search className="h-4 w-4 text-slate-500" aria-hidden />
          <input ref={input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects, environments, actions…"
            role="combobox" aria-expanded="true" aria-controls="cmd-list" aria-activedescendant={results[active] ? `cmd-${active}` : undefined}
            className="h-12 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          <kbd className="kbd">esc</kbd>
        </div>
        <ul id="cmd-list" ref={list} role="listbox" className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-slate-500">No results for “{query}”</li>}
          {results.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            const Icon = item.icon;
            return (
              <li key={item.id} role="presentation">
                {header && <div className="label px-2 pb-1 pt-2">{header}</div>}
                <div id={`cmd-${i}`} role="option" aria-selected={i === active} onMouseMove={() => setActive(i)} onClick={() => run(item)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm ${i === active ? 'bg-white/10 text-white' : 'text-slate-300'}`}>
                  <Icon className="h-4 w-4 text-slate-400" aria-hidden />
                  <span className="flex-1 truncate">{item.label}</span>
                  {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-slate-500" aria-hidden />}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
