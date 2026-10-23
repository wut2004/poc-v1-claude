import { Bell, ChevronsUpDown, LogOut, Search, Settings } from 'lucide-react';
import { ENVIRONMENTS, PROJECTS, USER } from '../lib/mock';
import { Menu, MenuItem, MenuLabel, MenuSeparator } from './ui/Menu';
import { Avatar } from './ui/Primitives';

const Slash = () => <span className="select-none text-slate-700" aria-hidden>/</span>;

export default function Navbar({ project, env, onProject, onEnv, onSearch }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-1 px-3 sm:gap-2 sm:px-6">
        <a href="#main" className="flex shrink-0 items-center gap-2 rounded-md" aria-label="Deploy Portal home">
          <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
            <defs>
              <linearGradient id="logo" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a78bfa" /><stop offset="1" stopColor="#6366f1" /></linearGradient>
            </defs>
            <path d="M16 5 28 26H4z" fill="url(#logo)" />
          </svg>
        </a>
        <Slash />

        <Menu label="Switch service" width="w-72" trigger={({ open, props }) => (
          <button {...props} className={`flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-white transition-colors hover:bg-white/10 ${open ? 'bg-white/10' : ''}`}>
            <span className={`h-5 w-5 rounded-md bg-gradient-to-br ${project.gradient}`} aria-hidden />
            <span className="max-w-[5.5rem] truncate sm:max-w-none">{project.name}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-slate-500" aria-hidden />
          </button>
        )}>
          {(close) => (
            <>
              <MenuLabel>Cloud Run services · {project.gcp}</MenuLabel>
              {PROJECTS.map((p) => (
                <MenuItem key={p.id} selected={p.id === project.id} description={`${p.framework} · ${p.region}`}
                  icon={() => <span className={`h-4 w-4 rounded bg-gradient-to-br ${p.gradient}`} aria-hidden />}
                  onClick={() => { onProject(p.id); close(); }}>
                  {p.name}
                </MenuItem>
              ))}
            </>
          )}
        </Menu>
        <Slash />

        <Menu label="Switch environment" width="w-60" trigger={({ open, props }) => (
          <button {...props} className={`flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-slate-200 transition-colors hover:bg-white/10 ${open ? 'bg-white/10' : ''}`}>
            <span className={`h-2 w-2 rounded-full ${env.dot}`} aria-hidden />
            <span className="hidden sm:inline">{env.label}</span>
            <span className="sm:hidden">{env.label.slice(0, 4)}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-slate-500" aria-hidden />
          </button>
        )}>
          {(close) => (
            <>
              <MenuLabel>Environment</MenuLabel>
              {ENVIRONMENTS.map((e) => (
                <MenuItem key={e.id} selected={e.id === env.id} description={e.hint}
                  icon={() => <span className={`ml-1 h-2 w-2 rounded-full ${e.dot}`} aria-hidden />}
                  onClick={() => { onEnv(e.id); close(); }}>
                  {e.label}
                </MenuItem>
              ))}
            </>
          )}
        </Menu>

        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={onSearch} aria-label="Search or run a command (Command K)"
            className="group hidden h-9 w-64 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-slate-500 transition-colors hover:border-white/20 hover:bg-white/[0.06] md:flex lg:w-80">
            <Search className="h-4 w-4" aria-hidden />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="kbd">⌘K</kbd>
          </button>
          <button type="button" onClick={onSearch} aria-label="Search" className="icon-btn !h-9 !w-9 md:hidden">
            <Search className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" aria-label="Notifications" className="icon-btn relative !h-9 !w-9 max-sm:hidden">
            <Bell className="h-4 w-4" aria-hidden />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-400 ring-2 ring-slate-950" aria-hidden />
          </button>

          <Menu align="right" width="w-64" label="Account" trigger={({ props }) => (
            <button {...props} aria-label={`Account: ${USER.name}`} className="rounded-full">
              <Avatar person={USER} size="h-8 w-8" text="text-[11px]">
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" aria-hidden />
              </Avatar>
            </button>
          )}>
            <div className="px-2.5 py-2">
              <div className="text-sm font-medium text-white">{USER.name}</div>
              <div className="text-xs text-slate-500">{USER.email}</div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden /> Online · deploy access
              </div>
            </div>
            <MenuSeparator />
            <MenuItem icon={Settings}>Account settings</MenuItem>
            <MenuItem icon={LogOut}>Sign out</MenuItem>
          </Menu>
        </div>
      </div>
    </header>
  );
}
