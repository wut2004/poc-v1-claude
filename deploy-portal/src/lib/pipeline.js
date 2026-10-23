import { Container, FlaskConical, GitBranch, Rocket, UploadCloud } from 'lucide-react';
import { shortHash, envHost, serviceName } from './mock';

export const STAGES = [
  { id: 'clone', label: 'Git Clone', desc: 'Fetch source at commit', icon: GitBranch },
  { id: 'test', label: 'Run Tests', desc: 'Unit & integration suites', icon: FlaskConical },
  { id: 'build', label: 'Cloud Build', desc: 'Build container image', icon: Container },
  { id: 'push', label: 'Artifact Registry', desc: 'Push image & digest', icon: UploadCloud },
  { id: 'deploy', label: 'Deploy to Cloud Run', desc: 'Create revision & health check', icon: Rocket },
];

// Nominal wall-clock seconds per stage, used for the duration column.
export const STAGE_DURATION = { clone: 3.2, test: 18.6, build: 41.3, push: 9.8, deploy: 14.2 };

const cmd = (text) => ({ lvl: 'cmd', text });
const info = (text) => ({ lvl: 'info', text });
const warn = (text) => ({ lvl: 'warn', text: `WARN  ${text}` });
const error = (text) => ({ lvl: 'error', text: `ERROR  ${text}` });
const ok = (text) => ({ lvl: 'success', text: `✓ ${text}` });

export const imageUri = (project, dep) => `${project.region}-docker.pkg.dev/${project.gcp}/services/${project.id}:${shortHash(dep.hash)}`;

function deployLines(dep, project, env, image) {
  const svc = serviceName(project.id, env.id);
  const host = envHost(project.id, env.id, dep.branch);
  const common = [
    info(`Deploying container to Cloud Run service [${svc}] in project [${project.gcp}] region [${project.region}]`),
    info('  Creating Revision...'),
    info(`  Revision ${dep.revision} created — startup probe passed (TCP :8080)`),
    info('Health check GET /healthz → 200 OK (42ms)'),
  ];
  if (env.id === 'staging') {
    return [
      cmd(`gcloud run deploy ${svc} --image ${image} --region ${project.region}`),
      ...common,
      info('  Routing traffic...'),
      ok(`Revision ${dep.revision} is serving 100% of traffic`),
      info(`Service URL: https://${host}`),
    ];
  }
  const tag = env.id === 'preview' ? dep.tag : 'candidate';
  return [
    cmd(`gcloud run deploy ${svc} --image ${image} --region ${project.region} --no-traffic --tag ${tag}`),
    ...common,
    ok(`Revision ${dep.revision} deployed with 0% traffic`),
    info(`Tagged URL: https://${env.id === 'preview' ? host : `${tag}---${host}`}`),
    ...(env.id === 'production' ? [info('Next: shift traffic gradually — 10% → 50% → 100%')] : []),
  ];
}

export function buildScript(dep, project, env) {
  const h = shortHash(dep.hash);
  const image = imageUri(project, dep);
  const repo = image.split(':')[0];
  return {
    clone: [
      cmd(`git clone --depth=1 --branch ${dep.branch} git@github.com:acme/${project.id}.git`),
      info(`Cloning into '${project.id}'...`),
      info('remote: Enumerating objects: 1842, done.'),
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
      cmd(`gcloud builds submit --tag ${image} --region ${project.region}`),
      info('Creating temporary archive of 214 file(s) totalling 3.8 MiB before compression.'),
      info(`Uploading tarfile to [gs://${project.gcp}_cloudbuild/source/1729687${h}.tgz]`),
      info(`BUILD_ID: ${dep.id.slice(4)}-4c1e-4f0a-9b7d`),
      info('Step #0 - "install": RUN pnpm install --frozen-lockfile'),
      warn('deprecated inflight@1.0.6: This module is not supported'),
      info('Step #1 - "build": RUN pnpm build'),
      info('  ▲ Compiled successfully in 24.1s'),
      warn('Large page data (212 kB) for route "/dashboard" — consider code splitting'),
      info('  ✓ Generating static pages (38/38)'),
      info('Step #2 - "image": exporting to image'),
      ok('Image built · 148 MB · 41.3s'),
    ],
    push: [
      cmd(`docker push ${image}`),
      info(`The push refers to repository [${repo}]`),
      info('a1f3c9d2e0b4: Pushed'),
      error('net/http: TLS handshake timeout — retrying (1/3)'),
      info('b72e0c18a9d1: Pushed'),
      info('c04d5e77f312: Pushed'),
      info(`${h}: digest: sha256:4be2a91c07d3 size: 1786`),
      ok('Pushed in 9.8s'),
    ],
    deploy: deployLines(dep, project, env, image),
  };
}

export const ARTIFACTS = [
  { name: 'build-output.zip', size: '48.2 MB', kind: 'Build output' },
  { name: 'coverage/lcov-report', size: '3.4 MB', kind: 'Coverage report' },
  { name: 'sbom.spdx.json', size: '612 kB', kind: 'Software bill of materials' },
  { name: 'cloud-build.log', size: '84 kB', kind: 'Cloud Build log' },
];
