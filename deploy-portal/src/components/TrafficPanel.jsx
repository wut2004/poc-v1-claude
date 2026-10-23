import { Cpu, Gauge, Globe, KeyRound, MemoryStick, Rocket, Timer, Users } from 'lucide-react';
import { useId } from 'react';

const COLORS = ['bg-violet-500', 'bg-cyan-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400'];
const DOTS = COLORS;

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
      <div className="min-w-0">
        <dt className="text-[10px] uppercase tracking-wider text-slate-500">{label}</dt>
        <dd className="truncate font-mono text-xs text-slate-200">{value}</dd>
      </div>
    </div>
  );
}

export default function TrafficPanel({ project, env, deployments, building, onShift }) {
  const titleId = useId();
  const serving = deployments.filter((d) => d.traffic > 0);
  const head = deployments[0];
  const c = project.config;
  // Production deploys with --no-traffic, so a finished head revision waits for a rollout decision.
  const canRollout = env.id === 'production' && !building && head.status === 'ready' && head.traffic === 0 && serving.length > 0;

  return (
    <section aria-labelledby={titleId} className="card grid animate-rise gap-6 p-5 [animation-delay:70ms] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div>
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="text-sm font-semibold text-white">Traffic</h2>
          <span className="text-xs text-slate-500">{serving.length ? `${serving.length} revision${serving.length > 1 ? 's' : ''} serving` : 'No revision serving'}</span>
        </div>

        <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-inset ring-white/10" role="img"
          aria-label={serving.length ? `Traffic split: ${serving.map((d) => `${d.revision} ${d.traffic}%`).join(', ')}` : 'No traffic'}>
          {serving.map((d, i) => (
            <div key={d.id} className={`${COLORS[i % COLORS.length]} transition-all duration-700 first:rounded-l-full last:rounded-r-full`} style={{ width: `${d.traffic}%` }} />
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {serving.map((d, i) => (
            <li key={d.id} className="flex items-center gap-3 text-sm">
              <span className={`h-2.5 w-2.5 rounded-sm ${DOTS[i % DOTS.length]}`} aria-hidden />
              <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-slate-200">{d.revision}</span>
              {d.tag && <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">{d.tag}</span>}
              <span className="w-12 text-right font-mono text-slate-100">{d.traffic}%</span>
            </li>
          ))}
          {!serving.length && <li className="text-sm text-slate-500">Preview revisions are reachable only through their tagged URLs.</li>}
        </ul>

        {canRollout && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-violet-400/25 bg-violet-400/[0.07] p-3">
            <Rocket className="h-4 w-4 text-violet-300" aria-hidden />
            <p className="min-w-0 flex-1 text-sm text-slate-200">
              <span className="font-mono text-[13px] text-white">{head.revision}</span> is healthy and holds 0% traffic. Roll it out:
            </p>
            <div role="group" aria-label="Roll out latest revision" className="flex gap-1.5">
              {[10, 50, 100].map((p) => (
                <button key={p} type="button" className={`btn ${p === 100 ? 'btn-primary' : ''}`} onClick={() => onShift(p)}>{p}%</button>
              ))}
            </div>
          </div>
        )}
        {env.id === 'production' && !building && head.traffic > 0 && head.traffic < 100 && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] p-3 text-sm text-slate-200">
            <span className="min-w-0 flex-1">Canary at {head.traffic}% — continue the rollout or roll back from the revision menu.</span>
            <div role="group" aria-label="Increase traffic" className="flex gap-1.5">
              {[50, 100].filter((p) => p > head.traffic).map((p) => <button key={p} type="button" className="btn" onClick={() => onShift(p)}>{p}%</button>)}
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="label mb-3">Revision settings · {project.region}</h3>
        <dl className="grid grid-cols-2 gap-2">
          <Spec icon={Cpu} label="CPU" value={c.cpu} />
          <Spec icon={MemoryStick} label="Memory" value={c.memory} />
          <Spec icon={Users} label="Concurrency" value={c.concurrency} />
          <Spec icon={Gauge} label="Instances" value={`${c.min} – ${c.max}`} />
          <Spec icon={Timer} label="Timeout" value={c.timeout} />
          <Spec icon={Globe} label="Ingress" value="All traffic" />
          <Spec icon={KeyRound} label="Auth" value="Public" />
          <Spec icon={Rocket} label="Min on idle" value={c.min === 0 ? 'Scale to zero' : `${c.min} warm`} />
        </dl>
      </div>
    </section>
  );
}
