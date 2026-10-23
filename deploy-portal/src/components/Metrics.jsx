import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Activity, Boxes, Cpu, Gauge } from 'lucide-react';
import Sparkline from './ui/Sparkline';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const walk = (arr, base, jitter, lo, hi) => [...arr.slice(1), clamp(arr[arr.length - 1] + (base - arr[arr.length - 1]) * 0.25 + (Math.random() - 0.5) * jitter, lo, hi)];
const initial = (base, jitter) => Array.from({ length: 28 }, (_, i) => base + Math.sin(i / 3) * jitter * 0.5 + (Math.random() - 0.5) * jitter);

function Stat({ icon: Icon, label, value, unit, delta, good, data, color, caption }) {
  const Arrow = delta >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="card p-4 transition-colors hover:border-white/20">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-medium text-slate-400"><Icon className="h-3.5 w-3.5" aria-hidden />{label}</span>
        <span className={`inline-flex items-center gap-0.5 font-mono text-[11px] ${good ? 'text-emerald-400' : 'text-amber-400'}`}>
          <Arrow className="h-3 w-3" aria-hidden />{Math.abs(delta)}%
          <span className="sr-only">{delta >= 0 ? ' increase' : ' decrease'}</span>
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular-nums tracking-tight text-white">{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
      <p className="mb-3 text-[11px] text-slate-500">{caption}</p>
      <Sparkline data={data} color={color} label={`${label} trend, last ${data.length} samples`} />
    </div>
  );
}

const pct = (a) => Math.round(((a[a.length - 1] - a[0]) / a[0]) * 100);

export default function Metrics({ config }) {
  const [rps, setRps] = useState(() => initial(142, 40));
  const [p95, setP95] = useState(() => initial(180, 50));
  const [inst, setInst] = useState(() => initial(Math.max(config.min, 3), 1.6));
  const [cpu, setCpu] = useState(() => initial(38, 14));

  useEffect(() => {
    const t = setInterval(() => {
      setRps((a) => walk(a, 142, 45, 20, 400));
      setP95((a) => walk(a, 180, 60, 60, 900));
      setInst((a) => walk(a, Math.max(config.min, 3), 1.8, config.min, config.max));
      setCpu((a) => walk(a, 38, 16, 4, 98));
    }, 1800);
    return () => clearInterval(t);
  }, [config.min, config.max]);

  const last = (a) => a[a.length - 1];
  return (
    <section aria-label="Service metrics" className="grid animate-rise grid-cols-1 gap-4 [animation-delay:40ms] sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={Activity} label="Requests" value={last(rps).toFixed(0)} unit="req/s" caption="All revisions · live"
        delta={pct(rps)} good data={rps} color="#a78bfa" />
      <Stat icon={Gauge} label="Latency p95" value={last(p95).toFixed(0)} unit="ms" caption="Request latency · live"
        delta={pct(p95)} good={last(p95) < 400} data={p95} color="#22d3ee" />
      <Stat icon={Boxes} label="Container instances" value={Math.round(last(inst))} unit={`active · max ${config.max}`} caption={`Autoscaling ${config.min}–${config.max} · concurrency ${config.concurrency}`}
        delta={pct(inst)} good data={inst} color="#34d399" />
      <Stat icon={Cpu} label="CPU utilization" value={last(cpu).toFixed(0)} unit={`% of ${config.cpu}`} caption="Per instance · live"
        delta={pct(cpu)} good={last(cpu) < 75} data={cpu} color="#fbbf24" />
    </section>
  );
}
