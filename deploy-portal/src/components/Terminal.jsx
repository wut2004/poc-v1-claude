import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownToLine, Copy, Search, TerminalSquare, X } from 'lucide-react';
import { STAGES } from '../lib/pipeline';
import { useCopy, useToast } from '../hooks';
import { IconCopyState } from './ui/Primitives';

const TOKEN = /(https?:\/\/[^\s)]+|"[^"]*"|'[^']*'|`[^`]*`|\b(?=[0-9a-f]*\d)[0-9a-f]{7,64}\b|(?:\.{0,2}\/)?(?=[\w./-]*[A-Za-z])[\w.-]+(?:\/[\w.-]+)+|\b\d+(?:\.\d+)?(?:ms|s|kB|MB|MiB|GB|%)?(?![\w])|✓|\b(?:passed|successfully|Compiled|Pushed)\b)/g;

function tokenClass(t) {
  if (/^https?:/.test(t)) return 'text-cyan-300 underline decoration-cyan-300/30';
  if (/^["'`]/.test(t)) return 'text-amber-200';
  if (/^[0-9a-f]{7,64}$/.test(t)) return 'text-violet-300';
  if (/^(✓|passed|successfully|Compiled|Pushed)$/.test(t)) return 'text-emerald-300';
  if (/^\d/.test(t)) return 'text-sky-300';
  return 'text-indigo-200';
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function Marked({ text, query }) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${escapeRe(query)})`, 'ig'));
  return parts.map((p, i) => (i % 2 ? <mark key={i} className="rounded-sm bg-violet-400/40 px-px text-white">{p}</mark> : p));
}

function Highlighted({ line, query }) {
  if (line.lvl === 'cmd') {
    return <><span className="select-none text-violet-400">$ </span><span className="text-white"><Marked text={line.text} query={query} /></span></>;
  }
  const m = line.text.match(/^(WARN|ERROR)(\s+)(.*)$/s);
  const body = m ? m[3] : line.text;
  const pieces = body.split(TOKEN);
  return (
    <>
      {m && <span className={`mr-2 rounded px-1 text-[10px] font-semibold ${m[1] === 'ERROR' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-400/15 text-amber-300'}`}>{m[1]}</span>}
      {pieces.map((p, i) => (i % 2 ? <span key={i} className={tokenClass(p)}><Marked text={p} query={query} /></span> : <Marked key={i} text={p} query={query} />))}
    </>
  );
}

const rowTone = {
  error: 'border-rose-400/70 bg-rose-500/[0.07] text-rose-100',
  warn: 'border-amber-300/60 bg-amber-400/[0.05] text-amber-50',
  success: 'border-transparent text-emerald-200',
  info: 'border-transparent text-slate-300',
  cmd: 'border-transparent text-slate-100',
};

const fmtTime = (ts) => new Date(ts).toLocaleTimeString('en-GB');

export default function Terminal({ lines, activeStage, streaming }) {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [auto, setAuto] = useState(true);
  const [copied, copy] = useCopy();
  const toast = useToast();
  const scroller = useRef(null);

  const scoped = useMemo(() => (activeStage ? lines.filter((l) => l.stage === activeStage) : lines), [lines, activeStage]);
  const counts = useMemo(() => ({ all: scoped.length, error: scoped.filter((l) => l.lvl === 'error').length, warn: scoped.filter((l) => l.lvl === 'warn').length }), [scoped]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped.filter((l) => (level === 'all' || l.lvl === level) && (!q || l.text.toLowerCase().includes(q)));
  }, [scoped, level, query]);

  useEffect(() => {
    if (auto && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [visible.length, auto]);

  const onScroll = () => {
    const el = scroller.current;
    if (auto && el.scrollHeight - el.scrollTop - el.clientHeight > 48) setAuto(false);
  };

  const copyLogs = async () => {
    const text = visible.map((l) => `${fmtTime(l.ts)}  ${l.lvl === 'cmd' ? '$ ' : ''}${l.text}`).join('\n');
    if (await copy(text)) toast(`Copied ${visible.length} log lines`);
  };

  const q = query.trim();
  const levels = [['all', 'All', counts.all], ['error', 'Errors', counts.error], ['warn', 'Warnings', counts.warn]];

  return (
    <section aria-labelledby="logs-title" className="card flex min-w-0 animate-rise flex-col overflow-hidden [animation-delay:140ms]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-4 w-4 text-slate-400" aria-hidden />
          <h2 id="logs-title" className="text-sm font-semibold text-white">Build logs</h2>
          {streaming ? (
            <span className="flex items-center gap-1.5 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[11px] text-cyan-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" aria-hidden />Streaming</span>
          ) : (
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300">Complete</span>
          )}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Filter by level" className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
            {levels.map(([id, label, n]) => (
              <button key={id} type="button" aria-pressed={level === id} onClick={() => setLevel(id)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${level === id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                {label}
                <span className={`rounded px-1 font-mono text-[10px] ${id === 'error' && n ? 'bg-rose-500/20 text-rose-300' : id === 'warn' && n ? 'bg-amber-400/15 text-amber-300' : 'bg-white/5 text-slate-500'}`}>{n}</span>
              </button>
            ))}
          </div>
          <label className="relative">
            <span className="sr-only">Search logs</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" aria-hidden />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search logs"
              className="h-8 w-40 rounded-lg border border-white/10 bg-white/[0.03] pl-8 pr-7 font-mono text-xs text-white placeholder:font-sans placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none sm:w-48 [&::-webkit-search-cancel-button]:hidden" />
            {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 hover:text-white"><X className="h-3 w-3" aria-hidden /></button>}
          </label>
          <button type="button" aria-pressed={auto} onClick={() => { setAuto((a) => !a); }} className={`btn ${auto ? '!border-violet-400/30 !bg-violet-400/10 !text-violet-200' : ''}`}>
            <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden /> Auto-scroll
          </button>
          <button type="button" className="btn" onClick={copyLogs} disabled={!visible.length}>
            <IconCopyState copied={copied} Icon={Copy} /> {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div ref={scroller} onScroll={onScroll} tabIndex={0} role="log" aria-label="Build log output" aria-live="off"
        className="h-80 overflow-auto bg-black/40 py-2 font-mono text-[12.5px] leading-6 sm:h-[26rem]">
        {visible.length === 0 && (
          <p className="px-4 py-10 text-center font-sans text-sm text-slate-500">{lines.length ? 'No log lines match the current filters.' : 'Waiting for output…'}</p>
        )}
        {visible.map((l) => (
          <div key={l.id} className={`flex gap-3 border-l-2 px-4 hover:bg-white/[0.04] ${rowTone[l.lvl]}`}>
            <span className="hidden w-[4.5rem] shrink-0 select-none text-slate-600 sm:block">{fmtTime(l.ts)}</span>
            <span className="min-w-0 whitespace-pre-wrap break-words"><Highlighted line={l} query={q} /></span>
          </div>
        ))}
        {streaming && !q && level === 'all' && <div className="px-4 text-violet-400"><span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-violet-400/80" aria-hidden /></div>}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[11px] text-slate-500">
        <span className="font-mono">{visible.length} / {lines.length} lines{activeStage ? ` · ${STAGES.find((s) => s.id === activeStage).label}` : ''}</span>
        {!auto && <button type="button" onClick={() => setAuto(true)} className="text-violet-300 hover:underline">Jump to latest ↓</button>}
      </div>
    </section>
  );
}
