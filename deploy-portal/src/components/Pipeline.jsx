import { Check, Circle, Loader2, X } from 'lucide-react';
import { STAGES, STAGE_DURATION } from '../lib/pipeline';
import { fmtDuration } from '../lib/mock';

function StepIcon({ status, Icon }) {
  if (status === 'done') return <span className="grid h-8 w-8 place-items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"><Check className="h-4 w-4" aria-hidden /></span>;
  if (status === 'running')
    return (
      <span className="relative grid h-8 w-8 place-items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
        <span className="absolute inset-0 animate-ring rounded-full border border-cyan-400/60" aria-hidden />
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      </span>
    );
  return <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-slate-600"><Icon className="h-3.5 w-3.5" aria-hidden /></span>;
}

const STATE_LABEL = { done: 'Completed', running: 'Running', pending: 'Pending' };

export default function Pipeline({ pipeline, activeStage, onSelect }) {
  const doneCount = pipeline.stages.filter((s) => s.status === 'done').length;
  const pct = Math.round(((doneCount + (pipeline.done ? 0 : pipeline.fraction)) / STAGES.length) * 100);
  return (
    <section aria-labelledby="pipeline-title" className="card flex flex-col p-5 animate-rise [animation-delay:80ms]">
      <div className="flex items-center justify-between">
        <h2 id="pipeline-title" className="text-sm font-semibold text-white">Pipeline</h2>
        <span className="font-mono text-xs text-slate-400" aria-label={`Total elapsed ${fmtDuration(pipeline.elapsed)}`}>{fmtDuration(pipeline.elapsed)}</span>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Pipeline progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className={`h-full rounded-full transition-all duration-500 ${pipeline.done ? 'bg-emerald-400' : 'bg-gradient-to-r from-violet-500 via-cyan-400 to-cyan-300'}`} style={{ width: `${pct}%` }} />
      </div>

      <ol className="mt-5 flex-1">
        {STAGES.map((stage, i) => {
          const st = pipeline.stages[i];
          const selected = activeStage === stage.id;
          const last = i === STAGES.length - 1;
          const seconds = st.status === 'done' ? st.duration : st.status === 'running' ? STAGE_DURATION[stage.id] * pipeline.fraction : null;
          return (
            <li key={stage.id} className="relative" aria-current={st.status === 'running' ? 'step' : undefined}>
              {!last && <span className={`absolute left-[15px] top-9 h-[calc(100%-2rem)] w-px ${st.status === 'done' ? 'bg-emerald-400/30' : 'bg-white/10'}`} aria-hidden />}
              <button type="button" aria-pressed={selected} onClick={() => onSelect(selected ? null : stage.id)}
                title={selected ? 'Show all logs' : `Filter logs to ${stage.label}`}
                className={`group flex w-full items-center gap-3 rounded-lg px-1.5 py-2 text-left transition-colors hover:bg-white/[0.04] ${selected ? 'bg-white/[0.06] ring-1 ring-inset ring-violet-400/30' : ''}`}>
                <StepIcon status={st.status} Icon={stage.icon} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-medium ${st.status === 'pending' ? 'text-slate-500' : 'text-slate-100'}`}>{stage.label}</span>
                  <span className="block truncate text-xs text-slate-500">
                    <span className="sr-only">{STATE_LABEL[st.status]}. </span>{stage.desc}
                  </span>
                </span>
                <span className={`font-mono text-xs tabular-nums ${st.status === 'running' ? 'text-cyan-300' : st.status === 'done' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {seconds == null ? <Circle className="h-2.5 w-2.5" aria-label="Not started" /> : `${seconds.toFixed(1)}s`}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {activeStage && (
        <button type="button" onClick={() => onSelect(null)} className="mt-3 inline-flex items-center gap-1.5 self-start rounded-md border border-violet-400/25 bg-violet-400/10 px-2 py-1 text-xs text-violet-200 hover:bg-violet-400/20">
          Logs filtered: {STAGES.find((s) => s.id === activeStage).label} <X className="h-3 w-3" aria-label="Clear stage filter" />
        </button>
      )}
    </section>
  );
}
