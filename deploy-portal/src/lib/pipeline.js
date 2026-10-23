import { Container, FlaskConical, GitBranch, Rocket, UploadCloud } from 'lucide-react';
import { shortHash, envHost } from './mock';

export const STAGES = [
  { id: 'clone', label: 'Git Clone', desc: 'Fetch source at commit', icon: GitBranch },
  { id: 'test', label: 'Run Tests', desc: 'Unit & integration suites', icon: FlaskConical },
  { id: 'build', label: 'Docker Build', desc: 'Build container image', icon: Container },
  { id: 'push', label: 'Push Registry', desc: 'Upload image layers', icon: UploadCloud },
  { id: 'deploy', label: 'Deploy to Cluster', desc: 'Rolling update & health checks', icon: Rocket },
];

// Nominal wall-clock seconds per stage, used for the duration column.
export const STAGE_DURATION = { clone: 3.2, test: 18.6, build: 41.3, push: 9.8, deploy: 14.2 };

const cmd = (text) => ({ lvl: 'cmd', text });
const info = (text) => ({ lvl: 'info', text });
const warn = (text) => ({ lvl: 'warn', text: `WARN  ${text}` });
const error = (text) => ({ lvl: 'error', text: `ERROR  ${text}` });
const ok = (text) => ({ lvl: 'success', text: `✓ ${text}` });

export function buildScript(dep, project, env) {
  const h = shortHash(dep.hash);
  const image = `registry.example.com/${project.id}:${h}`;
  const host = envHost(project.id, env.id, dep.branch);
  return {
    clone: [
      cmd(`git clone --depth=1 --branch ${dep.branch} git@github.com:acme/${project.id}.git`),
      info(`Cloning into '${project.id}'...`),
      info('remote: Enumerating objects: 1842, done.'),
      info('remote: Counting objects: 100% (1842/1842), done.'),
      info('Receiving objects: 100% (1842/1842), 4.21 MiB | 18.40 MiB/s, done.'),
      info(`HEAD is now at ${h} ${dep.message}`),
      ok('Repository cloned in 3.2s'),
    ],
    test: [
      cmd('pnpm test --coverage'),
      info(`RUN  v1.6.0 /workspace/${project.id}`),
      info(' ✓ src/lib/auth.test.ts (14 tests) 212ms'),
      info(' ✓ src/lib/router.test.ts (9 tests) 87ms'),
      warn('2 obsolete snapshots in src/ui/__snapshots__/card.snap'),
      info(' ✓ src/components/Button.test.tsx (22 tests) 341ms'),
      info(' ✓ src/api/billing.test.ts (31 tests) 604ms'),
      info(' Test Files  4 passed (4)'),
      info('      Tests  76 passed (76)'),
      info('   Coverage  91.4% statements · 87.2% branches'),
      ok('All tests passed in 18.6s'),
    ],
    build: [
      cmd(`docker build -t ${image} .`),
      info('#1 [internal] load build definition from Dockerfile'),
      info('#2 [internal] load metadata for docker.io/library/node:20-alpine'),
      info('#3 [1/6] FROM docker.io/library/node:20-alpine@sha256:9f3c1b7a'),
      info('#4 [2/6] WORKDIR /app'),
      info('#5 [3/6] COPY package.json pnpm-lock.yaml ./'),
      info('#6 [4/6] RUN pnpm install --frozen-lockfile'),
      warn('deprecated inflight@1.0.6: This module is not supported'),
      info('#7 [5/6] COPY . .'),
      info('#8 [6/6] RUN pnpm build'),
      info('  ▲ Compiled successfully in 24.1s'),
      warn('Large page data (212 kB) for route "/dashboard" — consider code splitting'),
      info('  ✓ Generating static pages (38/38)'),
      info('#9 exporting to image'),
      ok('Image built · 148 MB · 41.3s'),
    ],
    push: [
      cmd(`docker push ${image}`),
      info(`The push refers to repository [registry.example.com/${project.id}]`),
      info('a1f3c9d2e0b4: Pushed'),
      error('net/http: TLS handshake timeout — retrying (1/3)'),
      info('b72e0c18a9d1: Pushed'),
      info('c04d5e77f312: Pushed'),
      info(`${h}: digest: sha256:4be2a91c07d3 size: 1786`),
      ok('Pushed in 9.8s'),
    ],
    deploy: [
      cmd(`kubectl set image deployment/${project.id} app=${image} -n ${env.id}`),
      info(`deployment.apps/${project.id} image updated`),
      info('Waiting for rollout: 1 of 3 updated replicas are available...'),
      info('Waiting for rollout: 2 of 3 updated replicas are available...'),
      info(`deployment "${project.id}" successfully rolled out`),
      info('Health check GET /healthz → 200 OK (42ms)'),
      ok(`Deployed to https://${host}`),
    ],
  };
}

export const ARTIFACTS = [
  { name: 'docker-image.tar.gz', size: '148 MB', kind: 'Container image' },
  { name: 'build-output.zip', size: '48.2 MB', kind: 'Build output' },
  { name: 'coverage/lcov-report', size: '3.4 MB', kind: 'Coverage report' },
  { name: 'sbom.spdx.json', size: '612 kB', kind: 'Software bill of materials' },
  { name: 'build.log', size: '84 kB', kind: 'Full build log' },
];
