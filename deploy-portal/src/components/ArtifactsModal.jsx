import { useEffect, useRef } from 'react';
import { Copy, Download, FileArchive, X } from 'lucide-react';
import { ARTIFACTS, imageUri } from '../lib/pipeline';
import { writeClipboard } from '../hooks';
import { shortHash } from '../lib/mock';
import { useToast } from '../hooks';

export default function ArtifactsModal({ deployment, project, onClose }) {
  const image = imageUri(project, deployment);
  const toast = useToast();
  const closeBtn = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    closeBtn.current?.focus();
    return () => prev?.focus?.();
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Tab') {
      const f = [...e.currentTarget.querySelectorAll('button')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/70 px-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="art-title" onKeyDown={onKeyDown} className="w-full max-w-lg animate-pop rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/70">
        <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 id="art-title" className="text-sm font-semibold text-white">Revision artifacts</h2>
            <p className="font-mono text-xs text-slate-500">{deployment.revision} · {shortHash(deployment.hash)}</p>
          </div>
          <button ref={closeBtn} type="button" className="icon-btn" aria-label="Close" onClick={onClose}><X className="h-4 w-4" aria-hidden /></button>
        </div>
        <ul className="divide-y divide-white/5 p-2">
          <li className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.04]">
            <FileArchive className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[13px] text-slate-100" title={image}>{image}</p>
              <p className="text-xs text-slate-500">Container image · Artifact Registry · 148 MB</p>
            </div>
            <button type="button" className="btn" onClick={async () => { if (await writeClipboard(image)) toast('Image URI copied'); }}><Copy className="h-3.5 w-3.5" aria-hidden />Copy URI</button>
          </li>
          {ARTIFACTS.map((a) => (
            <li key={a.name} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.04]">
              <FileArchive className="h-4 w-4 shrink-0 text-violet-300" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[13px] text-slate-100">{a.name}</p>
                <p className="text-xs text-slate-500">{a.kind} · {a.size}</p>
              </div>
              <button type="button" className="btn" onClick={() => toast(`Downloading ${a.name}`)}><Download className="h-3.5 w-3.5" aria-hidden />Download</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
