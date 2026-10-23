import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, FolderGit2, Globe, Rocket } from 'lucide-react';
import Navbar from './components/Navbar';
import CommandPalette from './components/CommandPalette';
import EnvHeader from './components/EnvHeader';
import Pipeline from './components/Pipeline';
import Terminal from './components/Terminal';
import Metrics from './components/Metrics';
import TrafficPanel from './components/TrafficPanel';
import DeploymentTable from './components/DeploymentTable';
import ArtifactsModal from './components/ArtifactsModal';
import { Toasts } from './components/ui/Primitives';
import { ToastProvider, useToast, writeClipboard } from './hooks';
import { usePipeline } from './hooks/usePipeline';
import { buildScript } from './lib/pipeline';
import { ENVIRONMENTS, PROJECTS, envHost, applyShift, makeDeployments, nextDeployment, shortHash, serviceName } from './lib/mock';

function Workspace({ project, env, redeployTick }) {
  const toast = useToast();
  const [deployments, setDeployments] = useState(() => makeDeployments(project.id, env.id));
  const [activeStage, setActiveStage] = useState(null);
  const [artifactsFor, setArtifactsFor] = useState(null);
  const pipeline = usePipeline(() => buildScript(deployments[0], project, env));
  const head = deployments[0];
  const building = !pipeline.done;

  // Build finished: promote the head deployment (previous live one becomes "ready").
  useEffect(() => {
    if (!pipeline.done) return;
    setDeployments((ds) => {
      if (ds[0].status !== 'building') return ds;
      const next = ds.map((d, i) => (i === 0 ? { ...d, status: 'ready', duration: Math.round(pipeline.elapsed) } : d));
      // Staging routes 100% automatically; production/preview deploy with --no-traffic.
      return env.id === 'staging' ? applyShift(next, next[0].id, 100) : next;
    });
    toast(env.id === 'staging' ? `Revision ${deployments[0].revision} is serving 100% traffic` : `Revision ${deployments[0].revision} deployed with 0% traffic`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeline.done]);

  const redeploy = useCallback(() => {
    if (!pipeline.done) return;
    const d = nextDeployment(project.id, env.id, head);
    setDeployments((ds) => [d, ...ds]);
    setActiveStage(null);
    pipeline.restart(buildScript(d, project, env));
    toast(`Deploying a new revision of ${serviceName(project.id, env.id)}…`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeline.done, head, project, env]);

  useEffect(() => { if (redeployTick) redeploy(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [redeployTick]);

  const shift = (target, pct, verb) => {
    setDeployments((ds) => applyShift(ds, target.id, pct));
    toast(`${verb} ${target.revision} — ${pct}% of traffic`);
  };
  const makeLive = (target, verb) => shift(target, 100, verb);
  const onPromote = (d) => (env.id === 'production' ? makeLive(d, 'Promoted') : toast(`Promoted ${shortHash(d.hash)} to Production — rollout queued`));

  return (
    <div className="space-y-4 sm:space-y-6">
      <EnvHeader project={project} env={env} head={head} building={building} onRedeploy={redeploy} />
      <Metrics config={project.config} />
      <TrafficPanel project={project} env={env} deployments={deployments} building={building} onShift={(pct) => shift(head, pct, 'Rolled out')} />
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <Pipeline pipeline={pipeline} activeStage={activeStage} onSelect={setActiveStage} />
        <Terminal lines={pipeline.lines} activeStage={activeStage} streaming={building} />
      </div>
      <DeploymentTable deployments={deployments} env={env} onPromote={onPromote} onRollback={(d) => makeLive(d, 'Rolled back to')} onCanary={(d) => shift(d, 10, 'Canary')} onArtifacts={setArtifactsFor} />
      {artifactsFor && <ArtifactsModal deployment={artifactsFor} project={project} onClose={() => setArtifactsFor(null)} />}
    </div>
  );
}

function Portal() {
  const toast = useToast();
  const [projectId, setProjectId] = useState(PROJECTS[0].id);
  const [envId, setEnvId] = useState('production');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [redeployTick, setRedeployTick] = useState(0);
  const project = PROJECTS.find((p) => p.id === projectId);
  const env = ENVIRONMENTS.find((e) => e.id === envId);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen((o) => !o); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const items = useMemo(() => [
    { id: 'redeploy', group: 'Actions', label: 'Deploy new revision', icon: Rocket, run: () => setRedeployTick((t) => t + 1) },
    { id: 'copy', group: 'Actions', label: `Copy ${env.label} service URL`, icon: Copy, run: async () => { if (await writeClipboard(`https://${envHost(project.id, env.id)}`)) toast('URL copied to clipboard'); } },
    ...PROJECTS.map((p) => ({ id: `p-${p.id}`, group: 'Projects', label: `Switch to ${p.name}`, icon: FolderGit2, run: () => setProjectId(p.id) })),
    ...ENVIRONMENTS.map((e) => ({ id: `e-${e.id}`, group: 'Environments', label: `Go to ${e.label}`, icon: Globe, run: () => setEnvId(e.id) })),
  ], [env, project, toast]);

  return (
    <>
      <a href="#main" className="sr-only z-[80] rounded-md bg-violet-600 px-3 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>
      <Navbar project={project} env={env} onProject={setProjectId} onEnv={setEnvId} onSearch={() => setPaletteOpen(true)} />
      <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Workspace key={`${project.id}:${env.id}`} project={project} env={env} redeployTick={redeployTick} />
      </main>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={items} />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider render={(toasts) => <Toasts toasts={toasts} />}>
      <Portal />
    </ToastProvider>
  );
}
