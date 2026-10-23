import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Cpu, MemoryStick, Timer, Wifi } from 'lucide-react';
import Sparkline from './ui/Sparkline';
import { fmtDuration } from '../lib/mock';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const walk = (arr, base, jitter, lo, hi) => [...arr.slice(1), clamp(arr[arr.length - 1] + (base - arr[arr.length - 1]) * 0.25 + (Math.random() - 0.5) * jitter, lo, hi)];
const initial = (base, jitter) => Array.from({ length: 28 }, (_, i) => base + Math.sin(i / 3) * jitter * 0.5 + (Math.random() - 0.5) * jitter);

function Stat({ icon: Icon, label, value, unit, delta, good, data, color, caption }) {
  const Arrow = delta >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="card group p-4 transition-colors hover:border-white/20">
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

const BUILD_HISTORY = [96, 102, 91, 88, 94, 99, 93, 90, 87, 92, 95, 89];

export default function Metrics({ buildSeconds, building }) {
  const [cpu, setCpu] = useState(() => initial(36, 14));
  const [mem, setMem] = useState(() => initial(2.4, 0.18));
  const [bw, setBw] = useState(() => initial(1.8, 0.7));
  const busy = useRef(building);
  busy.current = building;

  useEffect(() => {
    const t = setInterval(() => {
      setCpu((a) => walk(a, busy.current ? 64 : 34, 16, 4, 98));
      setMem((a) => walk(a, busy.current ? 3.1 : 2.4, 0.2, 0.8, 3.9));
      setBw((a) => walk(a, 1.8, 0.9, 0.2, 4.5));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  const last = (a) => a[a.length - 1];
  const build = [...BUILD_HISTORY.slice(-11), buildSeconds];
  const avg = BUILD_HISTORY.reduce((n, v) => n + v, 0) / BUILD_HISTORY.length;

  return (
    <section aria-label="Resource metrics" className="grid animate-rise grid-cols-1 gap-4 [animation-delay:40ms] sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={Timer} label="Build duration" value={fmtDuration(buildSeconds)} unit={building ? 'so far' : ''} caption="Last 12 builds"
        delta={Math.round(((buildSeconds - avg) / avg) * 100)} good={buildSeconds <= avg} data={build} color="#a78bfa" />
      <Stat icon={Cpu} label="CPU usage" value={last(cpu).toFixed(0)} unit="% of 2 vCPU" caption="Cluster pods · live"
        delta={Math.round(last(cpu) - cpu[0])} good={last(cpu) < 75} data={cpu} color="#22d3ee" />
      <Stat icon={MemoryStick} label="Memory" value={last(mem).toFixed(2)} unit="GB / 4 GB" caption="Resident set · live"
        delta={Math.round(((last(mem) - mem[0]) / mem[0]) * 100)} good={last(mem) < 3.3} data={mem} color="#34d399" />
      <Stat icon={Wifi} label="Bandwidth" value={last(bw).toFixed(1)} unit="MB/s" caption="Egress · last 24 samples"
        delta={Math.round(((last(bw) - bw[0]) / bw[0]) * 100)} good data={bw} color="#fbbf24" />
    </section>
  );
}
