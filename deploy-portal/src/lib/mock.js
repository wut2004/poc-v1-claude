const BASE = { gcp: 'acme-prod', region: 'asia-southeast1', short: 'as' };

// Each project is a Cloud Run service with its own runtime settings.
export const PROJECTS = [
  { ...BASE, id: 'acme-web', name: 'acme-web', framework: 'Next.js', gradient: 'from-violet-500 to-indigo-500',
    config: { cpu: '2 vCPU', memory: '1 GiB', concurrency: 80, min: 1, max: 20, timeout: '300s' } },
  { ...BASE, id: 'api-gateway', name: 'api-gateway', framework: 'Go · gRPC', gradient: 'from-cyan-400 to-sky-500',
    config: { cpu: '1 vCPU', memory: '512 MiB', concurrency: 250, min: 2, max: 50, timeout: '60s' } },
  { ...BASE, id: 'docs-site', name: 'docs-site', framework: 'Astro', gradient: 'from-emerald-400 to-teal-500',
    config: { cpu: '1 vCPU', memory: '256 MiB', concurrency: 100, min: 0, max: 5, timeout: '30s' } },
];

export const ENVIRONMENTS = [
  { id: 'production', label: 'Production', dot: 'bg-emerald-400', hint: 'Main service · gradual rollouts' },
  { id: 'staging', label: 'Staging', dot: 'bg-amber-400', hint: 'Separate service · auto 100% traffic' },
  { id: 'preview', label: 'Preview', dot: 'bg-violet-400', hint: 'Tagged revisions · 0% traffic' },
];

export const USER = { name: 'Maya Chen', email: 'maya@acme.dev', initials: 'MC', gradient: 'from-violet-500 to-fuchsia-500' };

const AUTHORS = [
  USER,
  { name: 'Jonas Weber', initials: 'JW', gradient: 'from-cyan-400 to-blue-500' },
  { name: 'Priya Nair', initials: 'PN', gradient: 'from-emerald-400 to-teal-500' },
  { name: 'Diego Alvarez', initials: 'DA', gradient: 'from-amber-400 to-orange-500' },
  { name: 'Sam Okafor', initials: 'SO', gradient: 'from-rose-400 to-pink-500' },
];

const MESSAGES = [
  'feat(billing): add usage-based invoice preview',
  'fix(auth): refresh token race on tab resume',
  'perf: lazy-load dashboard charts',
  'chore(deps): bump next to 14.2.5',
  'feat(search): index docs with fuzzy matching',
  'fix(api): return 409 on duplicate webhook',
  'refactor: extract pricing table component',
  'ci: cache pnpm store between runs',
  'fix: handle empty state in audit log',
  'feat: add SSO enforcement setting',
];

const BRANCHES = {
  production: ['main'],
  staging: ['develop'],
  preview: ['feat/billing-v2', 'fix/oauth-redirect', 'chore/bump-deps', 'feat/dark-charts', 'perf/lazy-charts'],
};

const hashSeed = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const randHex = (rand, n) => Array.from({ length: n }, () => Math.floor(rand() * 16).toString(16)).join('');
const pick = (rand, arr) => arr[Math.floor(rand() * arr.length)];

export const shortHash = (h) => h.slice(0, 7);

const slug = (str) => str.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

export function serviceName(projectId, envId) {
  return envId === 'staging' ? `${projectId}-staging` : projectId;
}

/** Cloud Run style URL: <service>-<hash>-<region>.a.run.app, tagged revisions use <tag>---<service>-… */
export function envHost(projectId, envId, branch = 'main') {
  const svc = serviceName(projectId, envId);
  const base = `${svc}-${hashSeed(svc).toString(36).slice(0, 8)}-as.a.run.app`;
  return envId === 'preview' ? `${slug(branch)}---${base}` : base;
}

const STATUS_PLAN = {
  production: ['building', 'live', 'live', 'ready', 'failed', 'ready', 'ready', 'ready'],
  staging: ['building', 'live', 'ready', 'failed', 'ready', 'ready', 'ready', 'ready'],
  preview: ['building', 'ready', 'ready', 'failed', 'ready', 'ready', 'ready', 'ready'],
};
// Traffic split per revision (Cloud Run routes percentages across revisions).
const TRAFFIC_PLAN = {
  production: [0, 90, 10, 0, 0, 0, 0, 0],
  staging: [0, 100, 0, 0, 0, 0, 0, 0],
  preview: [0, 0, 0, 0, 0, 0, 0, 0],
};
const pad = (n) => String(n).padStart(5, '0');
const AGE_MINUTES = [0.4, 38, 190, 420, 1500, 2900, 4300, 8200];

export function makeDeployments(projectId, envId) {
  const rand = mulberry32(hashSeed(`${projectId}:${envId}`));
  const now = Date.now();
  return STATUS_PLAN[envId].map((status, i) => {
    const branch = pick(rand, BRANCHES[envId]);
    const hash = randHex(rand, 40);
    const rev = 42 - i;
    return {
      id: `dpl_${randHex(rand, 8)}`,
      rev,
      revision: `${projectId}-${pad(rev)}-${randHex(rand, 3)}`,
      traffic: TRAFFIC_PLAN[envId][i],
      tag: envId === 'preview' ? slug(branch) : null,
      hash,
      branch,
      message: pick(rand, MESSAGES),
      author: pick(rand, AUTHORS),
      status,
      source: i === 3 ? 'Manual redeploy' : 'Pushed via GitHub',
      createdAt: now - AGE_MINUTES[i] * 60_000,
      duration: status === 'building' ? null : Math.round(70 + rand() * 60),
    };
  });
}

export function nextDeployment(projectId, envId, previous) {
  const rand = mulberry32(hashSeed(`${projectId}:${envId}:${Date.now()}`));
  const rev = previous.rev + 1;
  return {
    id: `dpl_${randHex(rand, 8)}`,
    rev,
    revision: `${projectId}-${pad(rev)}-${randHex(rand, 3)}`,
    traffic: 0,
    tag: envId === 'preview' ? previous.tag : null,
    hash: randHex(rand, 40),
    branch: previous.branch,
    message: `Redeploy of ${shortHash(previous.hash)}`,
    author: USER,
    status: 'building',
    source: 'Manual redeploy',
    createdAt: Date.now(),
    duration: null,
  };
}

export function timeAgo(ts, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function fmtDuration(sec) {
  if (sec == null) return '—';
  const s = Math.round(sec);
  return s >= 60 ? `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s` : `${s}s`;
}

/**
 * Route `pct`% of traffic to revision `id`. The remainder goes to the revision that
 * currently serves the most traffic (like `gcloud run services update-traffic`).
 */
export function applyShift(ds, id, pct) {
  const base = ds.filter((d) => d.id !== id && d.traffic > 0).sort((a, b) => b.traffic - a.traffic)[0];
  return ds.map((d) => {
    if (d.id === id) return { ...d, traffic: pct, status: pct ? 'live' : 'ready' };
    if (base && d.id === base.id && pct < 100) return { ...d, traffic: 100 - pct, status: 'live' };
    return { ...d, traffic: 0, status: d.status === 'live' ? 'ready' : d.status };
  });
}
