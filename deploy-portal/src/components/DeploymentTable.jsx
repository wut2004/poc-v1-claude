import { Download, GitBranch, MoreHorizontal, Rocket, Split, Undo2 } from 'lucide-react';
import { fmtDuration, shortHash, timeAgo } from '../lib/mock';
import { useNow } from '../hooks';
import { Menu, MenuItem, MenuSeparator } from './ui/Menu';
import { Avatar, StatusBadge } from './ui/Primitives';

export default function DeploymentTable({ deployments, env, onPromote, onRollback, onCanary, onArtifacts }) {
  const now = useNow(30_000);
  const liveIdx = deployments.findIndex((d) => d.traffic > 0);

  return (
    <section aria-labelledby="history-title" className="card animate-rise [animation-delay:200ms]">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 id="history-title" className="text-sm font-semibold text-white">Revision history</h2>
          <p className="text-xs text-slate-500">{deployments.length} recent revisions · {env.label}</p>
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Recent Cloud Run revisions with status, traffic, commit, author, age and actions</caption>
        <thead>
          <tr className="border-y border-white/10 bg-white/[0.02]">
            <th scope="col" className="label px-5 py-2 font-medium">Revision</th>
            <th scope="col" className="label px-3 py-2 font-medium">Status</th>
            <th scope="col" className="label hidden px-3 py-2 font-medium md:table-cell">Branch</th>
            <th scope="col" className="label hidden px-3 py-2 font-medium sm:table-cell">Created</th>
            <th scope="col" className="px-3 py-2 pr-5 text-right"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {deployments.map((d, i) => {
            const ready = d.status === 'ready';
            const prod = env.id === 'production';
            const partial = d.status === 'live' && d.traffic < 100;
            const canPromote = (ready && (!prod || (liveIdx !== -1 && i < liveIdx))) || (prod && partial);
            const canRollback = ready && prod && liveIdx !== -1 && i > liveIdx;
            const canCanary = ready && prod && liveIdx !== -1 && i < liveIdx;
            return (
              <tr key={d.id} className="group transition-colors hover:bg-white/[0.03]">
                <td className="max-w-0 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar person={d.author} size="h-8 w-8" text="text-[11px]" />
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[13px] font-medium text-slate-100" title={d.revision}>{d.revision}</p>
                      <p className="truncate text-xs text-slate-500" title={d.message}>{d.message}</p>
                      <p className="flex items-center gap-2 truncate text-xs text-slate-500">
                        <span className="font-mono text-slate-400">{shortHash(d.hash)}</span>
                        <span className="sm:hidden">· {timeAgo(d.createdAt, now)}</span>
                        <span className="hidden sm:inline">by {d.author.name}</span>
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3"><StatusBadge status={d.status} traffic={d.traffic} /></td>
                <td className="hidden px-3 py-3 md:table-cell">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-xs text-slate-300"><GitBranch className="h-3 w-3 text-slate-500" aria-hidden />{d.branch}</span>
                  {d.tag && <span className="ml-1.5 rounded bg-sky-400/10 px-1.5 py-0.5 font-mono text-[10px] text-sky-300" title="Revision tag">{d.tag}</span>}
                </td>
                <td className="hidden whitespace-nowrap px-3 py-3 sm:table-cell">
                  <p className="text-slate-300">{timeAgo(d.createdAt, now)}</p>
                  <p className="font-mono text-xs text-slate-500">{d.duration ? fmtDuration(d.duration) : 'in progress'}</p>
                </td>
                <td className="px-3 py-3 pr-5 text-right">
                  <Menu align="right" width="w-60" label={`Actions for ${d.revision}`} trigger={({ props }) => (
                    <button {...props} className="icon-btn" aria-label={`Actions for revision ${d.revision}`}><MoreHorizontal className="h-4 w-4" aria-hidden /></button>
                  )}>
                    {(close) => (
                      <>
                        <MenuItem icon={Rocket} disabled={!canPromote} onClick={() => { onPromote(d); close(); }}
                          description={!canPromote ? 'Needs a ready, newer revision' : prod ? 'Route 100% of traffic' : 'Deploy to production service'}>Promote to Production</MenuItem>
                        <MenuItem icon={Split} disabled={!canCanary} onClick={() => { onCanary(d); close(); }}
                          description={!canCanary ? 'Production only · newer revisions' : 'Send 10% of traffic'}>Canary 10%</MenuItem>
                        <MenuItem icon={Undo2} disabled={!canRollback} onClick={() => { onRollback(d); close(); }}
                          description={!canRollback ? 'Needs an older ready revision' : 'Route 100% back to this revision'}>Rollback</MenuItem>
                        <MenuSeparator />
                        <MenuItem icon={Download} onClick={() => { onArtifacts(d); close(); }}>View Artifacts</MenuItem>
                      </>
                    )}
                  </Menu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
