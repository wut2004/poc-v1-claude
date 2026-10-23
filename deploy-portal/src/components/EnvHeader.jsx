import { Cloud, Copy, ExternalLink, GitBranch, Globe, Layers, Loader2, MapPin, Rocket, ShieldCheck, Webhook } from 'lucide-react';
import { envHost, serviceName } from '../lib/mock';
import { useCopy, useToast } from '../hooks';
import { IconCopyState, StatusBadge } from './ui/Primitives';

function CopyButton({ text, label, what }) {
  const [copied, copy] = useCopy();
  const toast = useToast();
  return (
    <button type="button" className="icon-btn" aria-label={copied ? `${what} copied` : label}
      onClick={async () => { if (await copy(text)) toast(`${what} copied to clipboard`); }}>
      <IconCopyState copied={copied} Icon={Copy} />
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="label mb-1.5">{label}</dt>
      <dd className="min-w-0 text-sm text-slate-200">{children}</dd>
    </div>
  );
}

export default function EnvHeader({ project, env, head, building, onRedeploy }) {
  const host = envHost(project.id, env.id, head.branch);
  const url = `https://${host}`;
  return (
    <section aria-labelledby="env-title" className="card relative animate-rise overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -top-24 right-0 h-48 w-96 rounded-full bg-violet-500/15 blur-3xl" aria-hidden />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 id="env-title" className="text-xl font-semibold tracking-tight text-white">{project.name}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">
              <span className={`h-1.5 w-1.5 rounded-full ${env.dot}`} aria-hidden /> {env.label}
            </span>
            <StatusBadge status={head.status} traffic={head.traffic} />
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 text-[11px] text-sky-300"><Cloud className="h-3 w-3" aria-hidden /> Cloud Run</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{project.framework} · <span className="font-mono text-slate-400">{project.gcp}</span> · service <span className="font-mono text-slate-400">{serviceName(project.id, env.id)}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <a className="btn" href={`https://console.cloud.google.com/run?project=${project.gcp}`} target="_blank" rel="noopener noreferrer">
            Console <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
          <a className="btn" href={url} target="_blank" rel="noopener noreferrer">
            Visit <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
          <button type="button" className="btn btn-primary" onClick={onRedeploy} disabled={building}>
            {building ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Rocket className="h-3.5 w-3.5" aria-hidden />}
            {building ? 'Deploying…' : 'Deploy revision'}
          </button>
        </div>
      </div>

      <dl className="relative mt-6 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-white/10 pt-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Service URL">
          <div className="-ml-0.5 flex items-center gap-1">
            <Globe className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            <a href={url} target="_blank" rel="noopener noreferrer" className="truncate font-mono text-[13px] text-cyan-300 hover:underline">{host}</a>
            <CopyButton text={url} label="Copy URL" what="URL" />
          </div>
        </Field>
        <Field label="Latest revision">
          <div className="flex items-center gap-1">
            <Layers className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            <span className="truncate font-mono text-[13px]">{head.revision}</span>
            <CopyButton text={head.revision} label="Copy revision name" what="Revision name" />
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500" title={head.message}>{head.message}</p>
        </Field>
        <Field label="Region, branch & trigger">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-slate-300"><MapPin className="h-3.5 w-3.5 text-slate-500" aria-hidden /> {project.region}</span>
            <span className="inline-flex items-center gap-1 rounded-md border border-violet-400/25 bg-violet-400/10 px-1.5 py-0.5 font-mono text-xs text-violet-300">
              <GitBranch className="h-3 w-3" aria-hidden /> {head.branch}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Webhook className="h-3.5 w-3.5" aria-hidden /> {head.source}</span>
          </div>
        </Field>
        <Field label="Domain status">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inset-0 animate-ring rounded-full bg-emerald-400" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Active
            <span className="inline-flex items-center gap-1 text-xs text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> Managed TLS</span>
          </div>
        </Field>
      </dl>
    </section>
  );
}
